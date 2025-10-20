# Global Aggregation 

## Overview

**Global aggregation** refers to running an aggregation query **without using time-based windows** such as [tumble](/tumble-aggregation), [hop](/hop-aggregation), or [session](/session-aggregation).

Unlike windowed aggregations that slice unbounded streams into discrete windows, **global aggregation** treats the entire stream as **a single continuous window**.

With global aggregation:
- The query continuously updates aggregation results as new events arrive.
- There is **no concept of window close**, so late events are naturally handled without additional logic.
- It is ideal for tracking long-running (life-time) metrics such as total counts, averages, or unique users across an entire stream against all historical data.

## Syntax

```sql
SELECT <grouping_keys>, <aggr_functions>
FROM <stream_name>
[WHERE <condition>]
GROUP BY <col1>, <col2>, ...
EMIT <emit_policies> 
```

**Example**:
```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s
```

**Explanation**:
- The query monitors new events from the stream `device_utils`.
- It filters rows where `cpu_usage > 99`.
- An **incremental count** is maintained per device.
- Every **5 seconds**, the latest count per device is emitted to clients.

## TTL of Aggregation Keys

Global aggregations do not automatically garbage-collect intermediate states after each emission by default.
If the grouping keys increase continuously (for example, by including timestamps), the aggregation state can grow indefinitely.

To handle this, Timeplus supports a **hybrid hash table** that combines in-memory and on-disk state management:

- **Hot keys** (recently active) are stored in memory.
- **Cold keys** (inactive or rarely updated) are spilled to disk using an LRU-like algorithm.
- Combined with **TTL-based cleanup**, this approach has these benifits:
  - Support for very late events.
  - Controlled memory usage for long-running queries.

**Example**:

```sql
CREATE STREAM device_utils(
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
FROM device_utils 
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
- The grouping key includes `bucket_window_start`, `location`, and `device`. The grouping key cardinality is monotoincally increasing as time goes.
- The hybrid hash table manages the monotoincally increasing state efficiently:
  - Up to `100,000` hot keys per substream remain in memory.
  - Inactive keys are spilled to disk automatically.
- Aggregation states are cleaned up after 1 hour (aggregate_state_ttl_sec=3600) if they are inactive. This effectively honors 1 hour late events.
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
  - `ms` (milliseconds)
  - `s` (seconds)
  - `m` (minutes)
  - `h` (hours)


**Example**:
```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s;
```

This query emits updated results every 5 seconds if new events are received.

### `EMIT PERIODIC REPEAT`

For `EMIT PERIODIC`, no results are emitted if there are **no new events** since the last emit.
With the `REPEAT` modifier, Timeplus **emits at a fixed interval**, even when no new data arrives.

**Example**:
```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s REPEAT
```

If no new events appear, the last results are still emitted every 5 seconds.

### `EMIT ON UPDATE`

Emits intermediate results **immediately** when new events change any aggregation value. This is useful for near real-time visibility into evolving metrics.

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT ON UPDATE; 
```

Each time new events with `cpu_usage > 99` arrive, updated counts are emitted.

### `EMIT ON UPDATE WITH BATCH`

Combines **periodic emission** with **update-based** triggers.
Timeplus checks the intermediate aggregation results at regular intervals and emits them if they have changed which can significally improve the emit efficiency and throughput compared with `EMIT ON UPDATE`. 

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT ON UPDATE WITH BATCH 1s; 
```

This query checks for changes every second and emits results only when updates occur.

### `EMIT AFTER SESSION CLOSE` 

Designed for **sessionization**, **OpenTelemetry trace analysis** and other similar use cases where you need to track **session lifetimes** across high-cardinality datasets (e.g., trace spans).

This policy emits aggregation results once a session is considered **closed** or **expired**.

**Syntax**:

```sql
EMIT AFTER SESSION CLOSE 
  [IDENTIFIED BY (<ts_col>[, <session_start_col>, <session_end_col>])] 
  WITH [ONLY] MAXSPAN <interval> 
  [AND TIMEOUT <interval>]
```

**Parameters**:
* `EMIT AFTER SESSION CLOSE`. Enables per-session lifetime tracking and emits results when a session ends.
* `IDENTIFIED BY (<ts_col>[, <session_start_col>, <session_end_col>])`. Defines how session boundaries are identified.
  * `<ts_col>` — Timestamp column used to calculate session span duration. Default: _tp_time.
  * `<session_start_col>` — Boolean column indicating when a session starts. Usually it is predicates evaluated in the SELECT. (Optional)
  * `<session_end_col>` — Boolean column indicating when a session ends. Usually it is predicates evaluated in the SELECT. (Optional)
* `MAXSPAN <interval>`. The maximum duration allowed for a session before it is emitted, regardless of new activity.
* `ONLY`. When specified, results are emitted only if the session’s duration exceeds `MAXSPAN`.
* `TIMEOUT <interval>`. Defines the maximum wall-clock duration a session can remain open. If a session stays active longer than this interval, it is automatically emitted to prevent indefinite waiting.

#### Variants of `IDENTIFIED BY`

Different configurations of `IDENTIFIED BY` allow flexible session control depending on the availability of start/end indicators:

1. `IDENTIFIED BY ts_col`. 

    No explicit session start or end signals.
    * A session closes when `MAXSPAN` or `TIMEOUT` is reached.
    * All events for the same session key are included.

2. `IDENTIFIED BY (ts_col, session_start_col, session_end_col)`. 

    Both start and end conditions are explicitly defined.
    * A session opens when `session_start_col = true`.
    * Events before an open session are ignored.
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

    Controls whether multiple overlapping or consecutive sessions for the same key should be merged into a single extended session. When set to `true`, if a new session starts before the previous one closes, Timeplus merges them into one continuous session.

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
