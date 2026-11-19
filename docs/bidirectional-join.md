# Bidirectional Join

**Bidirectional Join** allows two streams to be joined bidirectionally — i.e., rows from both the **left** and **right** streams are buffered and joined against each other so that matches produced by either side are emitted. This is different from typical enrichment joins (where only the left stream probes a static or changing RHS). Bidirectional joins are useful for exploratory queries, historical+real-time consistency checks, and scenarios where both sides evolve and you need to materialize the full cross-match over time.

**Bidirectional Join** can be applied in two distinct scenarios:

1. **Finite Cardinality with Data Mutations**. This includes joins where data updates or replacements occur, but the key space remains bounded:
    - Mutable Stream ⨝ Mutable Stream
    - Versioned-KV Stream ⨝ Versioned-KV Stream
    - Changelog-KV Stream ⨝ Changelog-KV Stream
2. **Unbounded Append-Only Data** . This applies to joins where both sides continuously append new records without updates:
    - Append-only Stream ⨝ Append-only Stream

## Syntax

```sql
SELECT
    *
FROM left_stream [LEFT | INNER | FULL] JOIN right_stream
ON left_stream.key = right_stream.key
```

Supported join kinds depend on the input stream types. For example, an append-only `ALL JOIN` supports `INNER` and `LEFT`. See [streaming join combinations](/streaming-joins) for details.

## Bidirectional Join with Data Mutation

In this mode, **both the left and right streams** can mutate over time. Timeplus buffers data from both sides and continuously updates the join state as new events arrive. For each source primary key, only the **latest version** of the data is retained — effectively maintaining a **real-time snapshot** of the key/value tables on both sides, similar to an OLTP system.

As new updates arrive, outdated (overridden) records are **garbage collected**. When the primary key space is finite, the number of current rows in the join state is bounded.

Internally, the join process follows the principle of **“baseline + incremental updates”**:
- The system can load a **baseline snapshot** from historical storage, depending on the source.
- It then connects to real-time stream events to **apply incremental changes** and keep the state up to date.
- Both left and right streams maintain their own hash tables that evolve as new records arrive.
- When a key is updated, Timeplus emits **retraction events** to cancel previous joined results and then produces **new joined rows** to reflect the latest state.

Use the join's changelog output when downstream consumers need to apply both additions and removals. A destination that appends raw rows stores that change history.

### Example

```sql
CREATE MUTABLE STREAM left_mu (
    i  int,
    k  string,
    k1 string
) 
PRIMARY KEY (k, k1); 

CREATE MUTABLE STREAM right_mu (
    ii  int,
    kk  string,
    kk1 string
) 
PRIMARY KEY (kk, kk1); 

SELECT left_mu.k1, right_mu.kk1, right_mu.ii, _tp_delta
FROM left_mu JOIN right_mu ON left_mu.k = right_mu.kk
EMIT CHANGELOG;
```

The following diagram illustrates how the above **Mutable Stream ⨝ Mutable Stream** join works when the join uses a **partial primary key** — the primary keys are `(k, k1)` and `(kk, kk1)`, but the join only uses `left_mu.k` and `right_mu.kk`.

![BidirectionalJoinMutableStream](/img/bidirectional-join-mutable-stream.svg)

In the diagram above, the join key value `'k1'` appears multiple times in both streams:

- In the **left hash table**, `k1` maps to three unique primary keys:  
  `(k1, kk1)`, `(k1, kk2)`, `(k1, kk3)`
- In the **right hash table**, `k1` maps to two unique primary keys:  
  `(k1, kk4)` and `(k1, kk5)`

When joined, they produce **2 × 3 = 6 joined rows**. To reproduce this example, keep the join query running and insert the initial rows in another console. The numeric values below represent `v1` through `v5` in the diagram.

```sql
INSERT INTO left_mu (i, k, k1) VALUES (1, 'k1', 'kk1'), (2, 'k1', 'kk2'), (3, 'k1', 'kk3');
INSERT INTO right_mu (ii, kk, kk1) VALUES (4, 'k1', 'kk4'), (5, 'k1', 'kk5');
```

Now, suppose the user inserts a new record into the right stream which updates primary key `('k1', 'kk5')`. Run this insert after the initial join results appear.

```sql
INSERT INTO right_mu (ii, kk, kk1) VALUES (55, 'k1', 'kk5');
```

The right-side row for `('k1', 'kk5')` changes from `ii = 5` to `ii = 55` (`v5` to `v55` in the diagram). The join uses both versions to emit the following changes with `EMIT CHANGELOG`.

**Retraction phase**:
The previous right-side row joins with all three left-side records, retracting their joined results with `_tp_delta = -1`.
```text
(kk1, kk5, 5, -1)
(kk2, kk5, 5, -1)
(kk3, kk5, 5, -1)
```

**Update phase**:
The replacement row joins with the same three left-side records, emitting new results with `_tp_delta = 1`.
```text
(kk1, kk5, 55, 1)
(kk2, kk5, 55, 1)
(kk3, kk5, 55, 1)
```

The right-side row for `('k1', 'kk4')` still matches the same three left-side rows, so the join still has six current matches. The following diagram illustrates the retraction and update process.

![BidirectionalJoinMutableStreamRetract](/img/bidirectional-join-mutable-stream-retract.svg)

**Run the join and aggregation with concrete data samples**:

```sql
-- Perform a bidirectional join on partial primary key between the two streams 
-- and observe the join results and the retraction process 
-- in a different console (console-1)
SELECT *, _tp_delta 
FROM left_mu 
JOIN right_mu
ON left_mu.k = right_mu.kk
EMIT CHANGELOG;

-- Aggregate results to observe join output in a different console (console-2)
SELECT 
    count(), 
    min(i), max(i), avg(i), 
    min(ii), max(ii), avg(ii)
FROM left_mu
JOIN right_mu 
ON left_mu.k = right_mu.kk;

-- Insert initial rows
INSERT INTO left_mu(i, k, k1) VALUES (1, 'a', 'b');
INSERT INTO right_mu(ii, kk, kk1) VALUES (11, 'a', 'bb');

-- Initial join results in console-1
-- ┌─i─┬─k─┬─k1─┬────────────────_tp_time─┬─ii─┬─kk─┬─kk1─┬───────right_mu._tp_time─┬─_tp_delta─┬─_tp_delta─┐
-- │ 1 │ a │ b  │ 2025-10-25 00:20:10.032 │ 11 │ a  │ bb  │ 2025-10-25 00:20:15.236 │         1 │         1 │
-- └───┴───┴────┴─────────────────────────┴────┴────┴─────┴─────────────────────────┴───────────┴───────────┘

-- Initial aggregation results in console-2
-- ┌─count()─┬─min(i)─┬─max(i)─┬─avg(i)─┬─min(ii)─┬─max(ii)─┬─avg(ii)─┐
-- │       1 │      1 │      1 │      1 │      11 │      11 │      11 │
-- └─────────┴────────┴────────┴────────┴─────────┴─────────┴─────────┘
 
-- Update existing rows to trigger retract/update behavior
INSERT INTO left_mu(i, k, k1) VALUES (2, 'a', 'b');

-- Retract and update join results in console-1
-- ┌─i─┬─k─┬─k1─┬────────────────_tp_time─┬─ii─┬─kk─┬─kk1─┬───────right_mu._tp_time─┬─_tp_delta─┬─_tp_delta─┐
-- │ 1 │ a │ b  │ 2025-10-25 00:20:10.032 │ 11 │ a  │ bb  │ 2025-10-25 00:20:15.236 │        -1 │        -1 │
-- └───┴───┴────┴─────────────────────────┴────┴────┴─────┴─────────────────────────┴───────────┴───────────┘
-- ┌─i─┬─k─┬─k1─┬────────────────_tp_time─┬─ii─┬─kk─┬─kk1─┬───────right_mu._tp_time─┬─_tp_delta─┬─_tp_delta─┐
-- │ 2 │ a │ b  │ 2025-10-25 00:20:31.836 │ 11 │ a  │ bb  │ 2025-10-25 00:20:15.236 │         1 │         1 │
-- └───┴───┴────┴─────────────────────────┴────┴────┴─────┴─────────────────────────┴───────────┴───────────┘

-- Retract and update aggregation results in console-2
-- ┌─count()─┬─min(i)─┬─max(i)─┬─avg(i)─┬─min(ii)─┬─max(ii)─┬─avg(ii)─┐
-- │       1 │      2 │      2 │      2 │      11 │      11 │      11 │
-- └─────────┴────────┴────────┴────────┴─────────┴─────────┴─────────┘

INSERT INTO right_mu(ii, kk, kk1) VALUES (22, 'a', 'bb');

-- More retract and update join result in console-1
-- ┌─i─┬─k─┬─k1─┬────────────────_tp_time─┬─ii─┬─kk─┬─kk1─┬───────right_mu._tp_time─┬─_tp_delta─┬─_tp_delta─┐
-- │ 2 │ a │ b  │ 2025-10-25 00:20:31.836 │ 11 │ a  │ bb  │ 2025-10-25 00:20:15.236 │        -1 │        -1 │
-- └───┴───┴────┴─────────────────────────┴────┴────┴─────┴─────────────────────────┴───────────┴───────────┘
-- ┌─i─┬─k─┬─k1─┬────────────────_tp_time─┬─ii─┬─kk─┬─kk1─┬───────right_mu._tp_time─┬─_tp_delta─┬─_tp_delta─┐
-- │ 2 │ a │ b  │ 2025-10-25 00:20:31.836 │ 22 │ a  │ bb  │ 2025-10-25 00:20:36.827 │         1 │         1 │
-- └───┴───┴────┴─────────────────────────┴────┴────┴─────┴─────────────────────────┴───────────┴───────────┘

-- More retract and update aggregation results in console-2
-- ┌─count()─┬─min(i)─┬─max(i)─┬─avg(i)─┬─min(ii)─┬─max(ii)─┬─avg(ii)─┐
-- │       1 │      2 │      2 │      2 │      22 │      22 │      22 │
-- └─────────┴────────┴────────┴────────┴─────────┴─────────┴─────────┘

-- Compare streaming aggregation results in console-2 and
-- this historical query aggregation results, they shall keep the same 
SELECT 
    count(), 
    min(i), max(i), avg(i), 
    min(ii), max(ii), avg(ii)
FROM table(left_mu) AS left_mu
JOIN table(right_mu) AS right_mu 
ON left_mu.k = right_mu.kk;

-- Historical aggregation results
-- ┌─count()─┬─min(i)─┬─max(i)─┬─avg(i)─┬─min(ii)─┬─max(ii)─┬─avg(ii)─┐
-- │       1 │      2 │      2 │      2 │      22 │      22 │      22 │
-- └─────────┴────────┴────────┴────────┴─────────┴─────────┴─────────┘
```

### Memory Efficiency

**Bidirectional Join with Data Mutation** can still consume significant memory when the **cardinality** of the join keys is very high.  
To mitigate this, you can enable a **hybrid hash join**, which keeps **hot keys in memory** while **spilling cold keys to disk**, achieving a balance between performance and memory efficiency.

**Example:**

```sql
SELECT *
FROM left_mu 
JOIN right_mu
ON left_mu.k = right_mu.kk
SETTINGS default_hash_join = 'hybrid';
```

If the same query includes an **aggregation** and the aggregation’s cardinality is also large, you can enable **hybrid aggregation** by setting `default_hash_table='hybrid'`.
This allows the aggregation hash table to spill to disk when memory thresholds are reached.

**Example**:
```
SELECT k, k1, kk, kk1, count()
FROM left_mu 
JOIN right_mu
ON left_mu.k = right_mu.kk
GROUP BY k, k1, kk, kk1
SETTINGS default_hash_join='hybrid', default_hash_table='hybrid';
```

## Bidirectional Join Without Data Mutation

**Append-only ⨝ Append-only (Experimental)**

In this mode, both the **left** and **right** input streams are *append-only*, meaning that no data mutations or updates occur after insertion.  
Since a bidirectional join needs to buffer **all** source data from both sides to match possible keys, this leads to an **unbounded data growth problem** — as the streams continue to append data indefinitely.

This join type is currently **experimental** and best suited for **ad-hoc analysis** or exploratory workloads in the Timeplus console, where users can quickly visualize or test streaming joins.

For in-memory hash joins, Timeplus uses a query setting called **`join_max_buffered_bytes`** to control the maximum amount of buffered source data.
Once this limit is reached, the system will **abort the query** to prevent memory exhaustion.

Even if the join key space is finite, the joined value combinations can still grow without bound since every new record is treated as a unique event. A [bidirectional range join](/bidirectional-range-join) can evict old data when matches have a known time bound.

The following diagram illustrates this join behavior at a high level:

![BidirectionalJoinAppendOnlyStream](/img/bidirectional-join-append-only.svg)

### Example

```sql
CREATE STREAM left_append(i int, k string);
CREATE STREAM right_append(ii int, kk string);

SELECT * FROM 
left_append JOIN  right_append 
ON left_append.k = right_append.kk 
SETTINGS join_max_buffered_bytes=102400000;

-- Insert from another session while the join is running.
INSERT INTO left_append(i, k) VALUES (1, 'a');
INSERT INTO right_append(ii, kk) VALUES (22, 'a');
```
