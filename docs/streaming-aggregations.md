# Aggregations & Emit Policies
### Global Streaming Aggregation {#global}

In Timeplus, we define global aggregation as an aggregation query without using streaming windows like tumble, hop. Unlike streaming window aggregation, global streaming aggregation doesn't slice the input data into windows according to timestamp. See [Global Aggregation](/global-aggregation) for state cleanup and emission options.

```sql
SELECT [<grouping_keys>,] <aggr_function>
FROM <stream_name>
[WHERE <condition>]
[GROUP BY <grouping_keys>]
[EMIT PERIODIC <interval>];
```

`PERIODIC <n><UNIT>` tells Timeplus to emit the aggregation periodically. `UNIT` can be ms(millisecond), s(second), m(minute),h(hour),d(day).`<n>` shall be an integer greater than 0.

Examples

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
EMIT PERIODIC 5s
```

Like in [Streaming Tail](/query-syntax#streaming-tailing), Timeplus continuously monitors new events in the stream `device_utils`, does the filtering and then continuously does **incremental** count aggregation. Whenever the specified delay interval is up, project the current aggregation result to clients.

## Window Aggregation {#window-aggregation}
Timeplus supports various window aggregations, such as [Tumble Window](/streaming-windows#tumble), [Hop Window](/streaming-windows#hop), and [Session Window](/streaming-windows#session).

## EMIT{#emit}

As an advanced feature, Timeplus supports various policies to emit results during streaming query.

:::info
Please note, we updated the EMIT syntax in [Timeplus Enterprise 2.7.6](/enterprise-v2.7#2_7_6). Please upgrade to the latest version to use those refined emit polices.
:::

For [global aggregations](/streaming-query#global-aggregation), the syntax is:

```sql
EMIT [STREAM|CHANGELOG|DELTA]
 [PERIODIC <interval> [REPEAT]]
 [ON UPDATE [WITH BATCH <interval>] ]
 [PER EVENT]
 [AFTER SESSION CLOSE [IDENTIFIED BY <col> | (<ts_col>, <start_col>, <end_col>)] WITH [ONLY] MAXSPAN <interval> AND TIMEOUT <interval>]
```

You can only choose one of the emit policies: `PERIODIC`, `ON UPDATE`, `PER EVENT`, or `AFTER SESSION CLOSE`.

By default `EMIT STREAM` and `PERIODIC 2s` are applied. Advanced settings:
* `EMIT CHANGELOG` works for [global aggregations](/streaming-query#global-aggregation) and [non-aggregation tail/filter](/streaming-query#non-aggregation). It will output `+1` or `-1` for `_tp_delta` column. For non-aggregation queries, the source needs to be a [mutable stream](/mutable-stream) or a [changelog stream](/changelog-stream).
* `EMIT DELTA` works for [global aggregations](/streaming-query#global-aggregation) with `PERIODIC`. It only emits the aggregation results of the new events since last emit. [Learn more](#emit_delta)

For [time-window aggregations](/streaming-query#window-aggregation), the syntax is:

```sql
EMIT [STREAM]
 [AFTER WINDOW CLOSE [WITH DELAY <interval>] [AND TIMEOUT <interval>]]
 [PERIODIC <interval> [REPEAT] [WITH DELAY <interval>] [AND TIMEOUT <interval>]]
 [ON UPDATE [WITH BATCH <interval>] [WITH DELAY <interval>] [AND TIMEOUT <interval>]]
 [PER EVENT]
```
You can only choose one of the emit policies: `AFTER WINDOW CLOSE`, `PERIODIC`, `ON UPDATE`, or `PER EVENT`. If you omit any of them, the default policy is `AFTER WINDOW CLOSE`.

[`session()`](/session-aggregation) supports periodic and update-based emissions. It rejects `WITH DELAY` and `PER EVENT`.

Examples:
```sql
EMIT STREAM AFTER WINDOW CLOSE WITH DELAY 1s AND TIMEOUT 5s
EMIT STREAM PERIODIC 1s REPEAT WITH DELAY 1s AND TIMEOUT 5s
EMIT ON UPDATE WITH DELAY 1s AND TIMEOUT 5s
EMIT ON UPDATE WITH BATCH 1s WITH DELAY 1s AND TIMEOUT 5s
```

### EMIT .. WITH DELAY {#emit_delay}

`WITH DELAY` applies to tumble and hop aggregations. It subtracts the specified interval from the maximum observed event timestamp before calculating the watermark.

For example, require event time to progress one second beyond a window's end before the watermark can close it:

```sql
EMIT AFTER WINDOW CLOSE WITH DELAY 1s
```

Please check the interactive demo on [Understanding Watermark](/understanding-watermark).

### EMIT .. WITH DELAY AND TIMEOUT {#emit_timeout}

For time window based aggregations, when the window is closed is decided by the watermark. A new event outside the window will progress the watermark and inform the query engine to close the previous window and to emit aggregation results.

Say you only get one event for the time window. Since there is no more event, the watermark cannot be moved so the window won't be closed.

`EMIT AFTER WINDOW CLOSE AND TIMEOUT <interval>` can close pending windows after a wall-clock interval without input. This timeout can be used by itself or with `WITH DELAY`.

Please note, if there no single event in the data stream, or in the time window, Proton won't emit result. For example, in the following SQL, you won't get 0 as the count:

```sql
SELECT window_start, count() as count FROM tumble(stream,2s)
GROUP BY window_start
```

Even you add `EMIT .. TIMEOUT` in the SQL, it won't trigger timeout, because the query engine doesn't see any event in the window. If you need to detect such missing event for certain time window, one workaround is to create a heartbeat stream and use `UNION` to create a subquery to combine both heartbeat stream and target stream, for a time window, if all observed events are from heartbeat stream, this means there is no event in the target stream. Please discuss more with us in community slack.

### EMIT AFTER WINDOW CLOSE {#emit_after}

You can omit `EMIT AFTER WINDOW CLOSE`, since this is the default behavior for time window aggregations. For example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results. How to determine the window should be closed? This is done by [Watermark](/understanding-watermark), which is an internal timestamp. It is guaranteed to be increased monotonically per stream query.

### EMIT AFTER WINDOW CLOSE WITH DELAY {#emit_after_with_delay}

Example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `device_utils`. For a window ending at `00:00:05`, event time must reach `00:00:07` for the watermark to close it.

### EMIT PERIODIC {#emit_periodic}

`PERIODIC <n><UNIT>` tells Timeplus to emit the aggregation periodically. `UNIT` can be ms(millisecond), s(second), m(minute),h(hour),d(day).`<n>` shall be an integer greater than 0.

Example:

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
GROUP BY device
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
Starting from Timeplus Proton 1.6.2 and Timeplus Enterprise 2.6.0, you can optionally add `REPEAT` to the end of `EMIT PERIODIC <n><UNIT>`. For global aggregations, by default every 2 seconds, the aggregation result will be emitted. But if there is no new event since last emit, no result will be emitted. With the `REPEAT` at the end of the emit policy, Timeplus will emit results at the fixed interval, even there is no new events since last emit. For example:
```sql
SELECT count() FROM t
EMIT PERIODIC 3s REPEAT
```

`REPEAT` is ignored with `EMIT CHANGELOG` or `PARTITION BY`.

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

During the 5 second tumble window, even before the window is closed, the query can emit results when an input batch updates the group for the same `cid`.

### EMIT ON UPDATE WITH DELAY {#emit_on_update_with_delay}

Adding the `WITH DELAY` to `EMIT ON UPDATE` will allow late event for the window aggregation.

```sql
SELECT
  window_start, cid, count() AS cnt
FROM
  tumble(car_live_data, 5s)
WHERE
  cid IN ('c00033', 'c00022')
GROUP BY
  window_start, cid
EMIT ON UPDATE WITH DELAY 2s
```

### EMIT ON UPDATE WITH BATCH {#emit_on_update_with_batch}

You can combine `EMIT PERIODIC` and `EMIT ON UPDATE` together. In this case, even before the window is closed, Timeplus emits groups updated since the previous emission at the specified interval. The aggregate value can stay the same.
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

### EMIT AFTER SESSION CLOSE IDENTIFIED BY .. WITH MAXSPAN .. AND TIMEOUT .. {#emit_after_session_close}
This emit policy is introduced in Timeplus Enterprise 2.8.4 as `EMIT AFTER KEY EXPIRE`, and renamed to `EMIT AFTER SESSION CLOSE` in Timeplus Enterprise 3.0. `EMIT AFTER KEY EXPIRE` is still supported as an alias. Please watch the presentation from 2.9 launch webinar:
<iframe width="560" height="315" src="https://www.youtube.com/embed/qDauSMTf0vU?si=V-menfV1qY-aU4ab&amp;start=1150" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The syntax is:
```sql
EMIT AFTER SESSION CLOSE [IDENTIFIED BY <col> | (<ts_col>, <start_col>, <end_col>)] WITH [ONLY] MAXSPAN <interval> AND TIMEOUT <interval>
```

Note:
* `EMIT AFTER SESSION CLOSE` tracks sessions by the global aggregation's `GROUP BY` key, for example a trace ID.
* `IDENTIFIED BY col` will calculate the span of the trace, usually you can set `IDENTIFIED BY _tp_time`.
* `IDENTIFIED BY (ts_col, start_col, end_col)` uses boolean columns to mark the start and end of a session. [Learn more](/global-aggregation#emit-after-session-close)
* `MAXSPAN interval` to identify whether the span of the related events over a certain interval, for example `MAXSPAN 500ms` to flag those events with same tracing ID but over 0.5 second span.
* `ONLY` filters open sessions by the `MAXSPAN` threshold. See [session end handling](/global-aggregation#emit-after-session-close) for the behavior of an end event without an open session.
* `AND TIMEOUT interval` limits elapsed wall-clock time since the session opened. Specify a value at least as large as `MAXSPAN`. With `ONLY`, expiration clears the state without emitting it.

Timeplus automatically switches to `default_hash_table='hybrid'` with this emit policy to avoid putting too many data in memory. Do not override `default_hash_table` to `memory` for such queries.

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
    EMIT AFTER SESSION CLOSE IDENTIFIED BY end_time WITH MAXSPAN 500ms AND TIMEOUT 2s
)
SELECT json_encode(trace_id, start_ts, end_ts, span_ms, trace_events) AS event FROM grouped
SETTINGS default_hash_table='hybrid', max_hot_keys=1000000, allow_independent_shard_processing=true;
```

### EMIT TIMEOUT
`EMIT TIMEOUT` applies to window aggregations, where `EMIT AFTER WINDOW CLOSE` is automatically appended, e.g.
```sql
SELECT count() FROM tumble(t,5s) GROUP BY window_start EMIT TIMEOUT 1s;
```

It also applies as `AND TIMEOUT interval` in `EMIT AFTER SESSION CLOSE` or `EMIT AFTER KEY EXPIRE`. Note it is silently ignored for plain global aggregations without a window.

### EMIT PER EVENT
This new emit policy is introduced in Timeplus Enterprise 2.9 and Timeplus Proton 3.0.1. It allows you to emit results for every event in the stream, which can be useful for debugging or monitoring purposes.

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

### EMIT DELTA {#emit_delta}
This emit policy is introduced in Timeplus Enterprise 2.6.5 and Timeplus Proton 3.0.1. It applies to [Global Streaming Aggregation](#global) with `EMIT PERIODIC`.

By default, global aggregation emits the aggregation results of all events since the query starts. With `EMIT DELTA`, Timeplus clears the aggregation states after each emit, so each emit only contains the aggregation results of the new events since last emit. The default periodic emit interval is `2s`.

For example, the following SQL will emit the number of events per device in every 5 seconds:
```sql
SELECT device, count()
FROM device_utils
GROUP BY device
EMIT DELTA PERIODIC 5s
```

`EMIT DELTA` has no effect with `ON UPDATE`, `PER EVENT` or `AFTER SESSION CLOSE`. Please check [the example](/global-aggregation#emit-delta) in global aggregation.
