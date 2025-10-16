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

### `EMIT AFTER KEY EXPIRE` 

Designed for **OpenTelemetry trace analysis** and other similar use cases where you need to track **key lifetimes** across high-cardinality datasets (e.g., trace spans).

This policy emits aggregation results once a key is considered **expired**.

**Syntax**:

```sql
EMIT AFTER KEY EXPIRE [IDENTIFIED BY <col>] WITH [ONLY] MAXSPAN <interval> [AND TIMEOUT <interval>]
```

**Parameters**:
* `EMIT AFTER KEY EXPIRE` - enables per-key lifetime tracking.
* `IDENTIFIED BY <col>` - column used to compute span duration (defaults to **_tp_time** if omitted).
* `MAXSPAN <interval>` - maximum allowed span before emission.
* `ONLY` - emit results only if span exceeds MAXSPAN.
* `TIMEOUT <interval>` - forces emission after inactivity to avoid waiting indefinitely.

:::info
Currently must be used with `SETTINGS default_hash_table='hybrid'` to prevent excessive memory usage.
:::

**Example**:

```sql
WITH grouped AS 
(
  SELECT
      trace_id,
      min(start_time) AS start_ts,
      max(end_time) AS end_ts,
      date_diff('ms', start_ts, end_ts) AS span_ms,
      group_array(json_encode(span_id, parent_span_id, name, start_time, end_time, attributes)) AS trace_events
  FROM otel_traces
  SHUFFLE BY trace_id
  GROUP BY trace_id
  EMIT AFTER KEY EXPIRE IDENTIFIED BY end_time WITH ONLY MAXSPAN 500ms AND TIMEOUT 2s
)
SELECT json_encode(trace_id, start_ts, end_ts, span_ms, trace_events) AS event 
FROM grouped
SETTINGS 
  default_hash_table='hybrid', 
  max_hot_keys=1000000;
```

**Explanation**:

- Tracks `trace_id` events with start/end times.
- Emits results when:
  - The span exceeds `MAXSPAN` (500 ms), or
  - No new events arrive for `TIMEOUT` (2 s).
- The `ONLY` modifier ensures only traces exceeding the span threshold (500ms) are emitted.
- Expired keys are garbage-collected after emission.

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
