# Bidirectional Range Join

**Bidirectional Range Join** is an enhancement of the regular bidirectional join designed to reduce memory consumption and improve performance when dealing with large or unbounded data streams.  

For append stream, while a standard bidirectional join buffers **all** records from both sides, a **range-based** approach **buckets data by time or value ranges**, limiting how much data must be retained in memory at any given moment.

## Syntax

```sql
SELECT *
FROM left_append_stream
[LEFT | INNER] JOIN right_append_stream
ON left_append_stream.key = right_append_stream.key AND date_diff_within(<time_range>[, <left_timestamp_col>, <right_timestamp_col>]);
```

The `date_diff_within(...)` clause defines the time range condition for joining records across streams.
- `time_range` — The maximum time difference allowed between the two sides for them to be considered a match. Only second or minute intervals are supported (e.g., `2m`, `5s`).
- `left_timestamp_col / right_timestamp_col` — Columns in `datetime` or `datetime64` type used to compute the range difference.
If omitted, the system uses _tp_time for both streams by default.

**Example Variants**:
```sql
-- Use default timestamp columns (_tp_time)
ON left_append_stream.key = right_append_stream.key AND date_diff_within(2m);

-- Specify explicit timestamp columns
ON left_append_stream.key = right_append_stream.key 
   AND date_diff_within(10s, left_append_stream.event_time, right_append_stream.event_time);
```

## Example

```sql
CREATE STREAM left_range(i int, k string);
CREATE STREAM right_range(ii int, kk string);

-- Run bidirectional range join in another console (console-1)
SELECT * FROM left_range JOIN right_range ON left_range.k = right_range.kk AND date_diff_within(30s);

INSERT INTO left_range(i, k, _tp_time) VALUES (1, 'a', '2023-07-01 00:01:00');
INSERT INTO right_range(ii, kk, _tp_time) VALUES (22, 'a', '2023-07-01 00:00:50');

-- We will observe the join these results in console-1
-- ┌─i─┬─k─┬────────────────_tp_time─┬─ii─┬─kk─┬────right_range._tp_time─┐
-- │ 1 │ a │ 2023-07-01 00:01:00.000 │ 22 │ a  │ 2023-07-01 00:00:50.000 │
-- └───┴───┴─────────────────────────┴────┴────┴─────────────────────────┘
```

At runtime, the engine performs the following:

1. **Buckets Source Data**
    - Each side’s records are grouped into **range buckets** based on the time or numeric field defined in the join condition.
    - For example, if the range is `30s`, records are partitioned into 30-second intervals.
2. **Builds Range-Specific Hash Tables**
    - For each active range bucket, a **bidirectional hash table** is built to store the records from both sides.
3. **Performs Range-Aware Joins**
    When a new record arrives, the system:
    - Determines which **range bucket(s)** it belongs to.
    - Probes corresponding hash tables in relevant ranges to find matching records.
    - Emits joined results immediately when matches are found.
4. **Evicts Old Ranges**
    - Once a range bucket exceeds the configured window or retention period which is decided by an internal combined watermark, its buffered data is **evicted**, freeing memory.

The following diagram depicits this join behavior.

![BidirectionalRangeJoin](/img/bidirectional-range-join.svg)

## Limits

- `date_diff_within(<interval>)` creates the range `[-interval, +interval]`. Its width `2 × interval` must not exceed `max_join_range` (default 300 seconds), so `date_diff_within(150s)` is the largest range accepted by default. For `date_diff_within(60m)` set `max_join_range = 7200`.
- For one-sided ranges, shift one side instead of doubling the range, e.g. `date_diff_within(30m, date_add(left.ts, 30m), right.ts)` matches `right.ts` in `[left.ts, left.ts + 60m]` with width 3600.
- Rows older than the join's combined watermark are dropped. If one side is idle, the other side's buffer keeps growing until `join_max_buffered_bytes` fails the query, unless `keep_range_join_max_buckets` is set.

See [Time Ranges in Windows and Joins](/streaming-time-range-guide) for all limits, settings and sizing guidance.
