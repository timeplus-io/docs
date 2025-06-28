# Streaming Aggregations
### Global Streaming Aggregation {#global}

In Timeplus, we define global aggregation as an aggregation query without using streaming windows like tumble, hop. Unlike streaming window aggregation, global streaming aggregation doesn't slice
the unbound streaming data into windows according to timestamp, instead it processes the unbounded streaming data as one huge big global window. Due to this property, Timeplus for now can't
recycle in-memory aggregation states / results according to timestamp for global aggregation.

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <stream_name>
[WHERE clause]
EMIT PERIODIC [<n><UNIT>]
```

`PERIODIC <n><UNIT>` tells Timeplus to emit the aggregation periodically. `UNIT` can be ms(millisecond), s(second), m(minute),h(hour),d(day).`<n>` shall be an integer greater than 0.

Examples

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
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

For [global aggregations](/stream-query#global-aggregation), the syntax is:

```sql
EMIT [STREAM|CHANGELOG]
 [PERIODIC <interval> [REPEAT]]
 [ON UPDATE [WITH BATCH <interval>] ]
 [AFTER KEY EXPIRE [IDENTIFIED BY <col>] WITH [ONLY] MAXSPAN <internal> [AND TIMEOUT <internal>]]
```

By default `EMIT STREAM` and `PERIODIC 2s` are applied. Advanced settings:
* `EMIT CHANGELOG` works for [global aggregations](/stream-query#global-aggregation) and [non-aggregation tail/filter](/stream-query#non-aggregation). It will output `+1` or `-1` for `_tp_delta` column.

For [time-window aggregations](/stream-query#window-aggregation), the syntax is:

```sql
EMIT
 [AFTER WINDOW CLOSE [WITH DELAY <interval> [AND TIMEOUT <interval>]]]
 [PERIODIC <interval> [REPEAT] [WITH DELAY <interval> [AND TIMEOUT <interval>]]]
 [ON UPDATE [WITH BATCH <interval>] [WITH DELAY <interval> [AND TIMEOUT <interval>]]]
```
You can only choose one of the emit policies: `AFTER WINDOW CLOSE`, `PERIODIC`, or `ON UPDATE`. If you omit any of them, the default policy is `AFTER WINDOW CLOSE`.

Examples:
```sql
EMIT STREAM AFTER WINDOW CLOSE WITH DELAY 1s AND TIMEOUT 5s
EMIT STREAM PERIODIC 1s REPEAT WITH DELAY 1s AND TIMEOUT 5s
EMIT ON UPDATE WITH DELAY 1s AND TIMEOUT 5s
EMIT ON UPDATE WITH BATCH 1s WITH DELAY 1s AND TIMEOUT 5s
```

### EMIT .. WITH DELAY {#emit_delay}

`WITH DELAY` and `AND TIMEOUT` only can be applied to time-window based aggregations.

By default, the query engine will emit the results immediately when the window is closed or other conditions are met. This behavior can be customized using the `WITH DELAY` clause. It allows you to specify extra time to progress the watermark, which can be useful for handling late data.

For example, if you want to wait for 1 second before emitting the results, you can use the following syntax:

```sql
EMIT AFTER WINDOW CLOSE WITH DELAY 1s
```

Please check the interactive demo on [Understanding Watermark](/understanding-watermark).

### EMIT .. WITH DELAY AND TIMEOUT {#emit_timeout}

For time window based aggregations, when the window is closed is decided by the watermark. A new event outside the window will progress the watermark and inform the query engine to close the previous window and to emit aggregation results.

Say you only get one event for the time window. Since there is no more event, the watermark cannot be moved so the window won't be closed.

`EMIT .. TIMEOUT` is to force the window close, with a timeout after seeing last event.

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

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results. How to determine the window should be closed? This is done by [Watermark](/stream-query#window-watermark), which is an internal timestamp. It is guaranteed to be increased monotonically per stream query.

### EMIT AFTER WINDOW CLOSE WITH DELAY {#emit_after_with_delay}

Example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `device_utils`. Every time a window is closed, Timeplus Proton waits for another 2 seconds and then emits the aggregation results.

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

Since Proton 1.5, you can also apply `EMIT PERIODIC` in time windows, such as tumble/hop/session.

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

### EMIT ON UPDATE {#emit_on_update}

Since Proton 1.5, you can apply `EMIT ON UPDATE` in time windows, such as tumble/hop/session, with `GROUP BY` keys. For example:

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

You can combine `EMIT PERIODIC` and `EMIT ON UPDATE` together. In this case, even the window is not closed, Proton will check the intermediate aggregation result at the specified interval and emit rows if the result is changed.

### EMIT AFTER KEY EXPIRE IDENTIFIED BY .. WITH MAXSPAN .. AND TIMEOUT .. {#emit_after_key_expire}
This emit policy is introduced in Timeplus Enterprise 2.9. Please watch the presentation from 2.9 launch webinar:
<iframe width="560" height="315" src="https://www.youtube.com/embed/qDauSMTf0vU?si=V-menfV1qY-aU4ab&amp;start=1150" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

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

It's required to use `SETTINGS default_hash_table='hybrid'` with this emit policy to avoid putting too many data in memory.

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
