# Global Aggregation

## Overview

**Global aggregation** refers to running an aggregation query **without using time-based windows** such as [tumble](/tumble-aggregation), [hop](/hop-aggregation), or [session](/session-aggregation).

Unlike windowed aggregations that slice unbounded streams into discrete windows, **global aggregation** maintains state across the rows read by the query.

With global aggregation:
- The query continuously updates aggregation results as new events arrive.
- There is **no concept of window close**, so late events can update existing state.
- It is ideal for tracking long-running (life-time) metrics such as total counts, averages, or unique users across the data read by the query.

By default, a streaming query over an append stream reads from the latest position. To include retained history, use [`seek_to='earliest'`](/query-settings#seek_to).

## Syntax

```sql
SELECT [<grouping_keys>,] <aggr_functions>
FROM <stream_name>
[WHERE <condition>]
[GROUP BY <grouping_keys>]
[EMIT <emit_policy>];
```

**Example**:
```sql
CREATE STREAM device_metrics
(
    device string,
    cpu_usage float,
    event_time datetime64(3)
);

SELECT device, count(*)
FROM device_metrics
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s
```

**Explanation**:
- The query monitors new events from the stream `device_metrics`.
- It filters rows where `cpu_usage > 99`.
- An **incremental count** is maintained per device.
- Every **5 seconds**, the latest count per device is emitted to clients if new matching events have been processed since the previous emission.

## TTL of Aggregation Keys

Global aggregations do not automatically garbage-collect intermediate states after each emission by default.
If the grouping keys increase continuously (for example, by including timestamps), the aggregation state can grow indefinitely.

To handle this, Timeplus supports a **hybrid hash table** that combines in-memory and on-disk state management:

- **Hot keys** (recently active) are stored in memory.
- **Cold keys** (inactive or rarely updated) are spilled to RocksDB using an LRU-like algorithm once the hot-key threshold is exceeded. A large batch can temporarily exceed the threshold.
- `aggregate_state_ttl_sec` applies to spilled entries based on when they are written to RocksDB. Expired entries are removed during compaction. Hot state in memory does not expire on this schedule.

**Example**:

```sql
CREATE STREAM device_metrics_by_location(
    location string,
    device string,
    cpu float32
) SETTINGS shards=3;

SELECT
    to_start_of_interval(_tp_time, 5m) AS bucket_window_start,
    location,
    device,
    min(cpu),
    max(cpu),
    avg(cpu)
FROM device_metrics_by_location
SHUFFLE BY location
GROUP BY bucket_window_start, location, device
EMIT ON UPDATE WITH BATCH 1s
SETTINGS
  substreams=8,
  default_hash_table='hybrid',
  max_hot_keys=100000,
  aggregate_state_ttl_sec=3600;
```

**Explanation**:

- This query performs a **global aggregation** that computes CPU metrics for each device in 5-minute intervals.
- The grouping key includes `bucket_window_start`, `location`, and `device`. Each new 5-minute bucket can add grouping keys.
- The hybrid hash table uses `100,000` as the hot-key threshold per substream and spills older entries to disk.
- Spilled entries become eligible for compaction cleanup after 1 hour (`aggregate_state_ttl_sec=3600`). If a late event arrives after its state has been removed, it starts a new aggregate for that key.
- `SHUFFLE BY location` improves **parallelism and memory efficiency**. See [Data Shuffle](/shuffle-data) for more details.

**Internal Pipeline**:

The internal execution plan for hybrid global aggregation is shown below:

![HybridAggregationPipeline](/img/hybrid-aggregation-pipeline.svg)

## Emit Policies

Global aggregation supports multiple **emit policies** that define **when intermediate results** are pushed out.

### `EMIT PERIODIC`

Emits aggregation results periodically **when new events arrive**.
This is the **default** emit policy for global aggregation, with a **default interval of 2 seconds**.

**Syntax**

```sql
EMIT PERIODIC <n><UNIT>
```

**Parameters**:
- `<n>` — positive integer (interval length)
- `<UNIT>` can be one of:
  - `ns` (nanoseconds)
  - `us` (microseconds)
  - `ms` (milliseconds)
  - `s` (seconds)
  - `m` (minutes)
  - `h` (hours)
  - `d` (days)


**Example**:
```sql
SELECT device, count(*)
FROM device_metrics
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s;
```

This query emits the current results for all groups every 5 seconds if new events are received.

### `EMIT PERIODIC REPEAT`

For `EMIT PERIODIC`, no results are emitted if there are **no new events** since the last emit.
With the `REPEAT` modifier, Timeplus **emits at a fixed interval**, even when no new data arrives.

**Example**:
```sql
SELECT device, count(*)
FROM device_metrics
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s REPEAT
```

If no new events appear, the last results are still emitted every 5 seconds.

### `EMIT ON UPDATE`

Emits intermediate results when an input batch updates a grouping key, even if its aggregate value stays the same. This is useful for near real-time visibility into evolving metrics.

```sql
SELECT device, count(*)
FROM device_metrics
WHERE cpu_usage > 99
GROUP BY device
EMIT ON UPDATE;
```

Each time new events with `cpu_usage > 99` arrive, updated counts are emitted.

### `EMIT ON UPDATE WITH BATCH`

Combines **periodic emission** with **update-based** triggers.
Timeplus emits results for groups updated since the previous emission at the configured interval. Batching can improve throughput compared with `EMIT ON UPDATE`.

```sql
SELECT device, count(*)
FROM device_metrics
WHERE cpu_usage > 99
GROUP BY device
EMIT ON UPDATE WITH BATCH 1s;
```

This query emits counts for the devices updated since the previous emission, at most once per second on a single aggregation lane.

### `EMIT AFTER SESSION CLOSE`

Designed for **sessionization**, **OpenTelemetry trace analysis** and other similar use cases where you need to track **session lifetimes** across high-cardinality datasets (e.g., trace spans).

This policy emits aggregation results once a session is considered **closed** or **expired**.

**Syntax**:

```sql
EMIT AFTER SESSION CLOSE
  [IDENTIFIED BY {<ts_col> | (<ts_col>, <session_start_col_or_true>, <session_end_col_or_false>)}]
  WITH [ONLY] MAXSPAN <interval>
  AND TIMEOUT <interval>
```

**Parameters**:
* `EMIT AFTER SESSION CLOSE`. Enables per-session lifetime tracking and emits results when a session ends.
* `IDENTIFIED BY` selects the timestamp by itself or with a pair of start and end indicators.
  * `<ts_col>` — Timestamp column used to calculate session span duration. Default: _tp_time.
  * `<session_start_col>` — Boolean column indicating when a session starts. Usually it is predicates evaluated in the SELECT. (Optional)
  * `<session_end_col>` — Boolean column indicating when a session ends. Usually it is predicates evaluated in the SELECT. (Optional)
* `MAXSPAN <interval>` is checked against the difference between the largest and smallest observed event timestamps in the session. The event that reaches or crosses the threshold can be included, so an emitted span can exceed `MAXSPAN`.
* `ONLY` emits open sessions that reach or exceed `MAXSPAN`. Sessions that expire by wall-clock timeout are cleared without an emission in this mode. An end event with no open session can still emit a one-row result when `include_session_end=true`.
* `TIMEOUT <interval>` is elapsed wall-clock time since the session opened. Events arriving while the session is open do not reset it. Specify `TIMEOUT` explicitly and set it to at least `MAXSPAN`. Both intervals support `ms`, `s`, and `m`.

The policy uses a hybrid hash table keyed by the `GROUP BY` columns and tracks session creation time separately for expiration. It closes sessions per key without a shared event-time watermark. For multiple input shards, use `SHUFFLE BY` on the grouping key, or set `allow_independent_shard_processing=true` if each key is already confined to one shard.

#### Variants of `IDENTIFIED BY`

Different configurations of `IDENTIFIED BY` allow flexible session control depending on the availability of start/end indicators:

1. `IDENTIFIED BY ts_col`.

    No explicit session start or end signals.
    * A session closes when `MAXSPAN` or `TIMEOUT` is reached.
    * All events for the same session key are included.

2. `IDENTIFIED BY (ts_col, session_start_col, session_end_col)`.

    Both start and end conditions are explicitly defined.
    * A session opens when `session_start_col = true`.
    * Rows that match neither predicate are ignored until the session opens. With `include_session_end=true`, an end event without an open session can emit a one-row result.
    * The session closes when `session_end_col = true`, or when `MAXSPAN` or `TIMEOUT` is reached.

3. `IDENTIFIED BY (ts_col, session_start_col, false)`.

    Only a session start condition is defined.
    * A session opens when `session_start_col = true`.
    * Events before a session opens are ignored.
    * The session closes when `MAXSPAN` or `TIMEOUT` is reached.

4. `IDENTIFIED BY (ts_col, true, session_end_col)`.

    Only a session end condition is defined.
    * A session opens when the first event is observed.
    * The session closes when `session_end_col = true`, or when `MAXSPAN` or `TIMEOUT` is reached.

#### Session Fine-Tuning Settings

Timeplus provides several query settings to fine-tune session behavior:

1. `merge_open_sessions` — (Default: `false`).

    If a start event arrives while the key already has an open session, the default closes the existing session and starts a new one. With `merge_open_sessions=true`, the new start event is added to the open session.

2. `include_session_end` — (Default: `true`)

    Determines whether the event that triggers the session end should be included in the final session output. When set to `false`, the session end event itself will be excluded from the emitted session data.

#### Examples

Assume you have millions of network devices that go through a series of **state transitions** before establishing a connection. You want to analyze metrics such as **time-to-successful-connect** and **consecutive failures** for each device in real time.

```sql
CREATE STREAM IF NOT EXISTS devices
(
    `device` string,
    `phase` string, -- 'assoc' -> 'auth' -> 'dhcp' -> 'dns' -> 'connection'
    `status` string -- 'success', 'failed'
);
```

In this schema:
- `device` uniquely indentifies each device.
- `phase` represents the current state in the connection workflow. The initial phase of a connection starts with `'assoc'` and ends with `'connection'` when successful.
- `status` indicates whether the transition was successful or failed.

##### Example 1: Time-to-Successful-Connect

```sql
-- Time to successful connect
WITH connect_phase_events AS
(
    SELECT
      *,
      phase = 'assoc' AS session_start, -- defines the session start predicates
      phase = 'connection' AND status = 'success' AS session_end -- defines the session ends predicates
    FROM
      devices
    WHERE phase IN ('assoc', 'auth', 'dhcp', 'dns', 'connection')
)
SELECT device,
       count()                      AS events,
       count_if(status = 'failed')  AS fails,
       min(_tp_time)                AS session_start_ts,
       max(_tp_time)                AS session_end_ts,
       date_diff('ms', session_start_ts, session_end_ts) AS time_to_successful_connect_ms
FROM connect_phase_events
GROUP BY device
EMIT AFTER SESSION CLOSE IDENTIFIED BY (_tp_time, session_start, session_end) WITH MAXSPAN 1s AND TIMEOUT 2s;
```

**Explanation**:
- `session_start` marks when a session begins (`phase = 'assoc'`).
- `session_end` marks when the connection succeeds (`phase = 'connection' AND status = 'success'`) and hence session ends.
- `IDENTIFIED BY (_tp_time, session_start, session_end)` controls when sessions open and close.

**Sample events**:
```sql
INSERT INTO devices (device, phase, status, _tp_time) VALUES
('dev1', 'assoc', 'success', '2025-01-01 00:00:00.000'),
('dev1', 'auth', 'success', '2025-01-01 00:00:00.001'),
('dev1', 'dhcp', 'success', '2025-01-01 00:00:00.002'),
('dev1', 'dns', 'success', '2025-01-01 00:00:00.003'),
('dev1', 'connection', 'success', '2025-01-01 00:00:01.100');
```

**Output**:
```
┌─device─┬─events─┬─fails─┬────────session_start_ts─┬──────────session_end_ts─┬─time_to_successful_connect_ms─┐
│ dev1   │      5 │     0 │ 2025-01-01 00:00:00.000 │ 2025-01-01 00:00:01.100 │                          1100 │
└────────┴────────┴───────┴─────────────────────────┴─────────────────────────┴───────────────────────────────┘
```

##### Example 2: Handling Failures and Retries

If a device retries failed phases, use `merge_open_sessions = true` to merge overlapping sessions.

**Query**:
```sql
-- Time to successful connect
WITH connect_phase_events AS
(
    SELECT
      *,
      phase = 'assoc' AS session_start, -- defines the session start predicates
      phase = 'connection' AND status = 'success' AS session_end -- defines the session ends predicates
    FROM
      devices
    WHERE phase IN ('assoc', 'auth', 'dhcp', 'dns', 'connection')
)
SELECT device,
       count()                      AS events,
       count_if(status = 'failed')  AS fails,
       min(_tp_time)                AS session_start_ts,
       max(_tp_time)                AS session_end_ts,
       date_diff('ms', session_start_ts, session_end_ts) AS time_to_successful_connect_ms
FROM connect_phase_events
GROUP BY device
EMIT AFTER SESSION CLOSE IDENTIFIED BY (_tp_time, session_start, session_end) WITH MAXSPAN 1s AND TIMEOUT 2s
SETTINGS merge_open_sessions = true; -- Merge open sessions
```

**Sample Events**:
```
INSERT INTO devices (device, phase, status, _tp_time) VALUES
('dev1', 'assoc', 'failed', '2025-01-01 00:00:00.000'),
('dev1', 'assoc', 'failed', '2025-01-01 00:00:00.201'),
('dev1', 'assoc', 'success', '2025-01-01 00:00:00.302'),
('dev1', 'auth', 'success', '2025-01-01 00:00:00.403'),
('dev1', 'dhcp', 'success', '2025-01-01 00:00:00.504'),
('dev1', 'dns', 'success', '2025-01-01 00:00:00.805'),
('dev1', 'connection', 'success', '2025-01-01 00:00:02.100');
```

**Output**:
```
┌─device─┬─events─┬─fails─┬────────session_start_ts─┬──────────session_end_ts─┬─time_to_successful_connect_ms─┐
│ dev1   │      7 │     2 │ 2025-01-01 00:00:00.000 │ 2025-01-01 00:00:02.100 │                          2100 │
└────────┴────────┴───────┴─────────────────────────┴─────────────────────────┴───────────────────────────────┘
```

Without `merge_open_sessions = true`, each `assoc` event will start a new session and the next `assoc` event will force close the previous session, so there will be multiple sessions emitted.

##### Example 3: Handling Out-of-Order Events

If events arrive slightly out of order, you can use an `IDENTIFIED BY` variant to open sessions for any event from the same device.

**Query**:
```sql
WITH connect_phase_events AS
(
    SELECT
      *,
      phase = 'connection' AND status = 'success' AS session_end -- defines the session ends predicates
    FROM
      devices
    WHERE phase IN ('assoc', 'auth', 'dhcp', 'dns', 'connection')
)
SELECT device,
       count()                      AS events,
       count_if(status = 'failed')  AS fails,
       min(_tp_time)                AS session_start_ts,
       max(_tp_time)                AS session_end_ts,
       date_diff('ms', session_start_ts, session_end_ts) AS time_to_successful_connect_ms
FROM connect_phase_events
GROUP BY device
EMIT AFTER SESSION CLOSE IDENTIFIED BY (_tp_time, true, session_end) WITH MAXSPAN 1s AND TIMEOUT 2s
SETTINGS merge_open_sessions = true;
```

**Sample Events**:
```sql
-- out of order
INSERT INTO devices (device, phase, status, _tp_time) VALUES
('dev1', 'auth', 'success', '2025-01-01 00:00:00.001'),
('dev1', 'dhcp', 'success', '2025-01-01 00:00:00.002'),
('dev1', 'assoc', 'success', '2025-01-01 00:00:00.000'),
('dev1', 'dns', 'success', '2025-01-01 00:00:00.003'),
('dev1', 'connection', 'success', '2025-01-01 00:00:01.100');
```

**Output**:
```
┌─device─┬─events─┬─fails─┬────────session_start_ts─┬──────────session_end_ts─┬─time_to_successful_connect_ms─┐
│ dev1   │      5 │     0 │ 2025-01-01 00:00:00.000 │ 2025-01-01 00:00:01.100 │                          1100 │
└────────┴────────┴───────┴─────────────────────────┴─────────────────────────┴───────────────────────────────┘
```

Here, `IDENTIFIED BY (_tp_time, true, session_end)` means:
- Any event for the device can open a session since `session_start` is `true`.
- The session closes when the `session_end` condition is met.

##### Example 4: Consecutive Failure Metrics

To calculate **consecutive failures** per phase:
1. A failure (`status = 'failed'`) starts a session.
2. The session ends when a success (`status = 'success'`) occurs.
3. Use `include_session_end = false` setting to exclude the successful event which ends the session from the count (the session).

**Query**:
```sql
WITH connect_phase_events AS
(
    SELECT
      *,
      status = 'failed' AS session_start, -- defines session start predicates
      status = 'success' AS session_end -- defines session end predicates
    FROM
      devices
    WHERE phase IN ('assoc', 'auth', 'dhcp', 'dns', 'connection')
)
SELECT device,
       phase,
       count()                      AS consecutive_fails,
       min(_tp_time)                AS session_start_ts,
       max(_tp_time)                AS session_end_ts
FROM connect_phase_events
GROUP BY device, phase
EMIT AFTER SESSION CLOSE IDENTIFIED BY (_tp_time, session_start, session_end) WITH MAXSPAN 1s AND TIMEOUT 2s
SETTINGS
  include_session_end = false, -- Exclude the session ends events from the session
  merge_open_sessions=true;
```

**Sample Events**:
```
INSERT INTO devices (device, phase, status, _tp_time) VALUES
('dev1', 'assoc', 'failed', '2025-01-01 00:00:00.000'),
('dev1', 'assoc', 'failed', '2025-01-01 00:00:00.201'),
('dev1', 'assoc', 'success', '2025-01-01 00:00:00.302'),
('dev1', 'auth', 'success', '2025-01-01 00:00:00.403'),
('dev1', 'dhcp', 'failed', '2025-01-01 00:00:00.504'),
('dev1', 'dhcp', 'success', '2025-01-01 00:00:00.604'),
('dev1', 'dns', 'success', '2025-01-01 00:00:00.805'),
('dev1', 'connection', 'success', '2025-01-01 00:00:02.100');
```

**Output**:
```
┌─device─┬─phase─┬─consecutive_fails─┬────────session_start_ts─┬──────────session_end_ts─┐
│ dev1   │ assoc │                 2 │ 2025-01-01 00:00:00.000 │ 2025-01-01 00:00:00.201 │
│ dev1   │ dhcp  │                 1 │ 2025-01-01 00:00:00.504 │ 2025-01-01 00:00:00.504 │
└────────┴───────┴───────────────────┴─────────────────────────┴─────────────────────────┘
```

### `EMIT PER EVENT`

Emits results for **every incoming event**.
This policy is mainly for debugging or low-volume streams, as it can produce very high output.

**Example**:
```sql
SELECT count()
FROM market_data
EMIT PER EVENT;
```
Each new event triggers an immediate emission of the updated count:
`1, 2, 3, 4, 5, …`

Use this mode carefully in high-throughput environments.

For multiple input shards, use `SHUFFLE BY` on the grouping key, or set `allow_independent_shard_processing=true` if each key is already confined to one shard.

### `EMIT CHANGELOG`

The `EMIT CHANGELOG` clause enables Timeplus to emit **cancellation records (deltas)** for previously emitted results when the underlying data changes.

Each changelog event represents either:
- A **new result**, or
- A **cancellation** (retraction) of a previous result for the same grouping key or joined output.

This mechanism allows downstream systems — such as **Timeplus Materialized Views** — to maintain an up-to-date and consistent view of dynamic data without reprocessing full result sets or having duplicate counting.

**Example**:

```sql
SELECT device, count(), max(cpu_usage), _tp_delta
FROM device_metrics
GROUP BY device
EMIT CHANGELOG;
```

**Sample Events**

```sql
insert into device_metrics(device, cpu_usage) values ('dev1', 57.8);
select sleep(3) FORMAT Null;
insert into device_metrics(device, cpu_usage) values ('dev1', 50.9);
```

**Output**:
```
┌─device─┬─count()─┬─max(cpu_usage)─┬─_tp_delta─┐
│ dev1   │       1 │           57.8 │         1 │
└────────┴─────────┴────────────────┴───────────┘
┌─device─┬─count()─┬─max(cpu_usage)─┬─_tp_delta─┐
│ dev1   │       1 │           57.8 │        -1 │
└────────┴─────────┴────────────────┴───────────┘
┌─device─┬─count()─┬─max(cpu_usage)─┬─_tp_delta─┐
│ dev1   │       2 │           57.8 │         1 │
└────────┴─────────┴────────────────┴───────────┘
```

**Explanation**:
- The **first record** (`_tp_delta = 1`) represents the initial aggregation result for `dev1`.
- When a new event for `dev1` arrives, the previously emitted result becomes outdated. Timeplus emits a cancellation record (_tp_delta = -1) to retract the old result.
- Finally, a **new record** (`_tp_delta = 1`) is emitted with the updated aggregation result.

This ensures that downstream consumers (such as materialized views or connectors) can maintain **accurate and consistent state** by applying deltas .

**Notes**
- `_tp_delta = 1` → **insert / new result**
- `_tp_delta = -1` → **delete / cancel previous result**
- The example uses the default two-second periodic trigger. Wait for the first result before the second insert to see the retraction and replacement as shown.
- For aggregations, `EMIT CHANGELOG` is supported for global aggregation. Select `_tp_delta` explicitly. This output mode cannot be combined with `PER EVENT` or `AFTER SESSION CLOSE`.

### `EMIT DELTA`

Emits aggregation results of **only the new events since the last emit**, instead of all events since the query starts.
After each periodic emit, Timeplus **clears the aggregation states**, so the next emit only contains the keys which have new events.

**Syntax**:

```sql
EMIT DELTA [PERIODIC <interval>]
```

The default periodic interval is **2 seconds**.

**Example**:

```sql
SELECT device, count(), max(cpu_usage)
FROM device_metrics
GROUP BY device
EMIT DELTA PERIODIC 2s;
```

**Sample Events**

```sql
insert into device_metrics(device, cpu_usage) values ('dev1', 57.8), ('dev2', 30.5);
select sleep(3) FORMAT Null;
insert into device_metrics(device, cpu_usage) values ('dev1', 50.9);
```

**Output**:
```
┌─device─┬─count()─┬─max(cpu_usage)─┐
│ dev2   │       1 │           30.5 │
│ dev1   │       1 │           57.8 │
└────────┴─────────┴────────────────┘
┌─device─┬─count()─┬─max(cpu_usage)─┐
│ dev1   │       1 │           50.9 │
└────────┴─────────┴────────────────┘
```

**Explanation**:
- The **first emit** contains the aggregation results of `dev1` and `dev2`.
- The **second emit** only contains `dev1`, and the results are calculated from the new event only. With `EMIT PERIODIC 2s`, the second emit would be `dev1` with `count() = 2` and `dev2` with `count() = 1`.

**Notes**
- `EMIT DELTA` only takes effect with `EMIT PERIODIC`.
- `REPEAT` doesn't re-emit the previous results, since the aggregation states have been cleared.
