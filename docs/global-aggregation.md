# Global Aggregation 

## Overview  

**Global aggregation** refers to running an aggregation query **without using streaming windows** such as `TUMBLE`, `HOP`, or `SESSION`.  

Unlike windowed aggregations, global aggregation does not slice unbounded streaming data into time-based windows. Instead, it treats the entire unbounded stream as a **single global window**.  

With global aggregation:  
- The query continuously updates aggregation results over all incoming data.  
- Users don’t need to worry about **late events**, since there are no time windows to close.  

## Syntax

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <stream_name>
[WHERE <condition>]
GROUP BY col1, col2, ...
EMIT PERIODIC <n><UNIT>
```

The `EMIT PERIODIC <n><UNIT>` clause tells Timeplus to periodically emit aggregation results.
- `<n>` must be an integer greater than 0.
- `<UNIT>` can be one of:

- ms (milliseconds)
- s (seconds)
- m (minutes)
- h (hours)

**Examples:**
```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s
```

In this example:
- The query continuously monitors new events in the stream `device_utils`.
- It filters rows where cpu_usage > 99.
- An **incremental count aggregation** is maintained per `device`.
- Every **5 seconds**, the current aggregation result is emitted to clients.

## TTL of Aggregation Keys  

Global aggregation does not automatically garbage-collect intermediate aggregation states after each emit.  
If the grouping keys grow monotonically over time (for example, when timestamps are part of the key), memory usage can eventually **blow up**.  

To address this challenge, you can use a **hybrid hash table** for aggregation states:  
- Hot keys are kept in memory.  
- Cold keys are spilled to disk using an LRU-like algorithm.  
- Combined with a **TTL for keys**, this approach provides the best of both worlds:  
  - Handles very late events.  
  - Prevents unbounded memory growth.  

**Example:** 

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

- This query performs a **global aggregation** to calculate CPU metrics in **5-minute buckets per device**.
- The grouping key includes `bucket_window_start`, which increases monotonically with time.
- The hybrid hash table is enabled via `default_hash_table='hybrid'`.
    - Keeps up to `100,000` hot keys in memory per substream.
    - Cold keys are spilled to disk automatically.
- The TTL is set to `3600` seconds (`aggregate_state_ttl_sec=3600`):
    - Keys not updated for an hour are garbage-collected from disk.
    - Prevents infinite state accumulation.
- Data shuffling is enabled (SHUFFLE BY location) for better **parallelism and memory efficiency**.
    - See [Data Shuffle](/shuffle-data) for more details.

The internal query plan for this hybrid global aggregation looks like:

![HybridAggregationPipeline](/img/hybrid-aggregation-pipeline.svg)

## Emit Policies

Global aggregation supports different `emit policies` to control when you like to get the intermidiate results pushing out.

### EMIT PERIODIC {#emit_periodic}

`PERIODIC <n><UNIT>` tells Timeplus to emit the aggregation periodically. `UNIT` can be ms(millisecond), s(second), m(minute),h(hour),d(day).`<n>` shall be an integer greater than 0.

Example:

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
EMIT PERIODIC 5s
```

For [Global Streaming Aggregation](#global) the default periodic emit interval is `2s`, i.e. 2 seconds.

You can also apply `EMIT PERIODIC` in time windows, such as tumble/hop/session.

When you run a tumble window aggregation, by default Timeplus will emit results when the window is closed. So `tumble(stream,5s)` will emit results every 5 seconds, unless there is no event in the window to progress the watermark.

In some cases, you may want to get aggregation results even the window is not closed, so that you can get timely alerts. For example, the following SQL will run a 5-second tumble window and every 1 second, if the number of event is over 300, a row will be emitted.

```sql
SELECT window_start, count() AS cnt
FROM tumble(car_live_data, 5s)
GROUP BY window_start
HAVING cnt > 300
EMIT PERIODIC 1s
```

### EMIT PERIODIC REPEAT {#emit_periodic_repeat}

Starting from Timeplus Proton 1.6.2, you can optionally add `REPEAT` to the end of `EMIT PERIODIC <n><UNIT>`. For global aggregations, by default every 2 seconds, the aggregation result will be emitted. But if there is no new event since last emit, no result will be emitted. With the `REPEAT` at the end of the emit policy, Timeplus will emit results at the fixed interval, even there is no new events since last emit. For example:
```sql
SELECT count() FROM t
EMIT PERIODIC 3s REPEAT
```

### EMIT TIMEOUT

You can apply `EMIT TIMEOUT` on global aggregation, e.g.
```sql
SELECT count() FROM t EMIT TIMEOUT 1s;
```

It also can be applied to window aggregations and `EMIT AFTER WINDOW CLOSE` is automatically appended, e.g.
```sql
SELECT count() FROM tumble(t,5s) GROUP BY window_start EMIT TIMEOUT 1s;
```
 
### EMIT ON UPDATE {#emit_on_update}

You can apply `EMIT ON UPDATE` in time windows, such as tumble/hop/session, with `GROUP BY` keys. For example:

```sql
SELECT
  window_start, cid, count() AS cnt
FROM
  tumble(car_live_data, 5s)
WHERE
  cid IN ('c00033', 'c00022')
GROUP BY
  window_start, cid
EMIT ON UPDATE
```

During the 5 second tumble window, even the window is not closed, as long as the aggregation value(`cnt`) for the same `cid` is different , the results will be emitted.

### EMIT ON UPDATE WITH BATCH {#emit_on_update_with_batch}

You can combine `EMIT PERIODIC` and `EMIT ON UPDATE` together. In this case, even the window is not closed, Timeplus will check the intermediate aggregation result at the specified interval and emit rows if the result is changed.
```sql
SELECT
  window_start, cid, count() AS cnt
FROM
  tumble(car_live_data, 5s)
WHERE
  cid IN ('c00033', 'c00022')
GROUP BY
  window_start, cid
EMIT ON UPDATE WITH BATCH 2s
```

### EMIT AFTER KEY EXPIRE IDENTIFIED BY .. WITH MAXSPAN .. AND TIMEOUT .. {#emit_after_key_expire}

The syntax is:
```sql
EMIT AFTER KEY EXPIRE [IDENTIFIED BY <col>] WITH [ONLY] MAXSPAN <internal> [AND TIMEOUT <internal>]
```

Note:
* `EMIT AFTER KEY EXPIRE` will emit results when the keys are expired. This EMIT policy ought to be applied to a global aggregation with a primary key as `GROUP BY`, usually using an ID for multiple tracing events.
* `IDENTIFIED BY col` will calculate the span of the trace, usually you can set `IDENTIFIED BY _tp_time`.
* `MAXSPAN interval` to identify whether the span of the related events over a certain interval, for example `MAXSPAN 500ms` to flag those events with same tracing ID but over 0.5 second span.
* `ONLY`: if you add this keyword, then only those events over the `MAXSPAN` will be emitted, other events less than the `MAXSPAN` will be omitted, so that you can focus on those events over the SLA.
* `AND TIMEOUT interval` to avoid waiting for late events for too long. If there is no more events with the same key (e.g. tracing ID) after this interval, Timeplus will close the session for the key and emit results.

It's required to use `SETTINGS default_hash_table='hybrid'` with this emit policy to avoid putting too much data in memory.

Here is an example to get the log streams and only show the events with over 0.5 second as the end-to-end latency.
```sql
WITH grouped AS(
    SELECT
        trace_id,
        min(start_time) AS start_ts,
        max(end_time) AS end_ts,
        date_diff('ms', start_ts, end_ts) AS span_ms,
        group_array(json_encode(span_id, parent_span_id, name, start_time, end_time, attributes)) AS trace_events
    FROM otel_traces
    GROUP BY trace_id
    EMIT AFTER KEY EXPIRE IDENTIFIED BY end_time WITH MAXSPAN 500ms AND TIMEOUT 2s
)
SELECT json_encode(trace_id, start_ts, end_ts, span_ms, trace_events) AS event FROM grouped
SETTINGS default_hash_table='hybrid', max_hot_keys=1000000, allow_independent_shard_processing=true;
```

### EMIT PER EVENT
This emit policy allows you to emit results for every event in the stream, which can be useful for debugging or monitoring purposes.

For example, if you create a random stream `market_data` and run:
```sql
select count() from market_data
```
You will get the count of all events in the stream, every 2 seconds by default. Such as 10, 20, 30, etc.

If you want to emit results for every event, you can use:
```sql
select count() from market_data emit per event
```
You will get the count of all events in the stream, every time a new event is added to the stream. Such as 1, 2, 3, 4, 5, etc.

This new emit policy is useful for specific use cases where you want to see the results of your query for every event in the stream. It can be particularly useful for debugging or monitoring purposes, as it allows you to see the results of your query in real-time as new events are added to the stream.

For high throughput streams, you may want to use this emit policy with caution, as it can generate a lot of output and may impact the performance of your query.

There are some limitations for this emit policy:

It does not support parallel processing, so it may not be suitable for high throughput streams. If there are multiple partitions for the Kafka external stream or multiple shards for the Timeplus stream, this emit policy will not work.

One workaround is to use `SHUFFLE BY` to shuffle the data into one partition or shard, but this may impact the performance of your query. For example, you can use:
```sql
select type, count() from github_events shuffle by type group by type emit per event;
```

The other possible workaround if the stream's sharding expression is based on id, for example:
```sql
create stream multi_shards_stream(id int, ...) settings shards=3, sharding_expr='weak_hash32(id)';
```
In this case, you can set `allow_independent_shard_processing=true` to process in parallel.

```sql
SELECT id, count() FROM multi_shards_stream GROUP BY id EMIT PER EVENT
SETTINGS allow_independent_shard_processing=true;
```

The other limitation is that it does not support substream processing. For example, the following query will not work:
```sql
SELECT id, count() FROM single_shard_stream partition by id EMIT PER EVENT
```
