#  Query Syntax

Timeplus Proton introduces several SQL extensions to support streaming processing. The overall syntax looks like this:

```sql
[WITH common_table_expression ..]
SELECT <expr, columns, aggr>
FROM <table_function>(<stream_name>, [<time_column>], [<window_size>], ...)
[JOIN clause]
[WHERE clause]
[GROUP BY clause]
[HAVING expression]
[PARTITION BY clause]
[LIMIT n]
[EMIT emit_policy]
[SETTINGS <key1>=<value1>, <key2>=<value2>, ...]
```

Only `SELECT` and `FROM` clauses are required (you can even omit `FORM`, such as `SELECT now()`, but it's less practical). Other clauses in `[..]` are optional. We will talk about them one by one in the reverse order, i.e. [SETTINGS](#settings), then [EMIT](#emit), [LIMIT](#limit), etc.

SQL keywords and function names are case-insensitive, while the column names and stream names are case-sensitive.

## Streaming First Query Behavior {#streaming_first}

Before we look into the details of the query syntax, we'd like to highlight the default query behavior in Timeplus Proton is in the streaming mode, i.e.

* `SELECT .. FROM stream`  will query the future events. Once you run the query, it will process new events. For example, if there are 1,000 events in the stream already, running `SELECT count() FROM stream` could return 0, if there is more new events.
* `SELECT .. FROM table(stream)` will query the historical data, just like many of other databases. In the above sample stream, if you run `SELECT count() FROM table(stream)`, you will get 1000 as the result and the query completed.

## SETTINGS{#settings}

Timeplus supports some advanced `SETTINGS` to fine tune the streaming query processing behaviors, listed below:

1. `enable_backfill_from_historical_store=0|1`. By default, if it's omitted, it's `1`.
   * When it's 0, the query engine either loads data from streaming storage, or from historical storage.
   * When it's 1, the query engine evaluates whether it's necessary to load data from historical storage(such as the time range is outside of the streaming storage), or it'll be more efficient to get data from historical storage(for example, count/min/max is pre-computed in historical storage, faster than scanning data in streaming storage).
2. `force_backfill_in_order=0|1`. By default, if it's omitted, it's `0`.
   1. When it's 0, the data from the historical storage are turned without extra sorting. This would improve the performance.
   2. When it's 1, the data from the historical storage are turned with extra sorting. This would decrease the performance. So turn on this flag carefully. 

3. `emit_aggregated_during_backfill=0|1`. By default, if it's omitted, it's `0`.
   1. When it's 0, the query engine won't emit intermediate aggregation results during the historical data backfill.
   2. When it's 1, the query engine will emit intermediate aggregation results during the historical data backfill. This will ignore the `force_backfill_in_order` setting. As long as there are aggregation functions and time window functions(e.g. tumble/hop/session) in the streaming SQL, when the `emit_aggregated_during_backfill` is on, `force_backfill_in_order` will be applied to 1 automatically. 
4. `query_mode=<table|streaming>`. By default, if it's omitted, it's `streaming`. A general setting which decides if the overall query is streaming data processing or historical data processing. This can be overwritten in the port. If you use 3128, default is streaming. If you use 8123, default is historical.
5. `seek_to=<timestamp|earliest|latest>`. By default, if it's omitted, it's `latest`. A setting which tells Timeplus to seek old data in the streaming storage by timestamp. It can be a relative timestamp or an absolute timestamp. By default, it is `latest`, which tells Timeplus to not seek old data. Example:`seek_to='2022-01-12 06:00:00.000'`, ` seek_to='-2h'`, or ` seek_to='earliest'` 

:::info

Please note, as of Jan 2023, we no longer recommend you use `SETTINGS seek_to=..`(except for [External Stream](external-stream)). Please use `WHERE _tp_time>='2023-01-01'` or similar. `_tp_time` is the special timestamp column in each raw stream to represent the [event time](eventtime). You can use `>`, `<`, `BETWEEN .. AND` operations to filter the data in Timeplus storage. The only exception is [External Stream](external-stream). If you need to scan all existing data in the Kafka topic, you need to run the SQL with seek_to, e.g. `select raw from my_ext_stream settings seek_to='earliest'`

:::



## EMIT{#emit}

As an advanced feature, Timeplus Proton support various policies to emit results during streaming query. 

The syntax is:

```sql
EMIT
 [AFTER WATERMARK [WITH DELAY <interval>]
 [PERIODIC <interval>]
 [ON UPDATE]
  - [[ AND ]TIMEOUT <interval>]
  - [[ AND ]LAST <interval> [ON PROCTIME]]
```

Please note some policies are added in Proton 1.5 and incompatible with 1.4 or earlier version.

### EMIT AFTER WATERMARK {#emit_after_wm}

You can omit `EMIT AFTER WATERMARK`, since this is the default behavior for time window aggregations. For example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results. How to determine the window should be closed? This is done by [Watermark](stream-query#window-watermark), which is an internal timestamp. It is guaranteed to be increased monotonically per stream query.



### EMIT AFTER WATERMARK WITH DELAY {#emit_after_wm_with_delay}

:::warning

Before Proton 1.5, the syntax was `EMIT AFTER WATERMARK AND DELAY`.  Since Proton 1.5, we use `WITH DELAY` instead of `AND DELAY`, in order to make `AND`  as the keyword to combine multiple emit polices.

:::

Example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WATERMARK WITH DELAY 2s;
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `device_utils`. Every time a window is closed, Timeplus Proton waits for another 2 seconds and then emits the aggregation results.

### EMIT PERIODIC {#emit_periodic}

`PERIODIC <n><UNIT>` tells Proton to emit the aggregation periodically. `UNIT` can be ms(millisecond), s(second), m(minute),h(hour),d(day).`<n>` shall be an integer greater than 0.

Example:

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
EMIT PERIODIC 5s
```

For [Global Streaming Aggregation](#global) the default periodic emit interval is `2s`, i.e. 2 seconds.

Since Proton 1.5, you can also apply `EMIT PERIODIC` in time windows, such as tumble/hop/session.

When you run a tumble window aggregation, by default Proton will emit results when the window is closed. So `tumble(stream,5s)` will emit results every 5 seconds, unless there is no event in the window to progress the watermark.

In some cases, you may want to get aggregation results even the window is not closed, so that you can get timely alerts. For example, the following SQL will run a 5-second tumble window and every 1 second, if the number of event is over 300, a row will be emitted.

```sql
SELECT window_start, count() AS cnt
FROM tumble(car_live_data, 5s)
GROUP BY window_start
HAVING cnt > 300
EMIT PERIODIC 1s
```
### EMIT ON UPDATE {#emit_on_update}

:::info

This is a new emit policy added in Proton 1.5.

:::

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

### EMIT PERIODIC .. ON UPDATE {#emit_periodic_on_update}

:::info

This is a new emit policy added in Proton 1.5.

:::

You can combine `EMIT PERIODIC` and `EMIT ON UPDATE` together. In this case, even the window is not closed, Proton will check the intermediate aggregation result at the specified interval and emit rows if the result is changed.

### EMIT TIMEOUT{#emit_timeout}

For time window based aggregations, when the window is closed is decided by the watermark. A new event outside the window will progress the watermark and inform the query engine to close the previous window and to emit aggregation results.

Say you only get one event for the time window. Since there is no more event, the watermark cannot be moved so the window won't be closed.

`EMIT TIMEOUT` is to force the window close, with a timeout after seeing last event.

Please note, if there no single event in the data stream, or in the time window, Proton won't emit result. For example, in the following SQL, you won't get 0 as the count:

```sql
SELECT window_start, count() as count FROM tumble(stream,2s)
GROUP BY window_start
```

Even you add `EMIT TIMEOUT` in the SQL, it won't trigger timeout, because the query engine doesn't see any event in the window. If you need to detect such missing event for certain time window, one workaround is to create a heartbeat stream and use `UNION` to create a subquery to combine both heartbeat stream and target stream, for a time window, if all observed events are from heartbeat stream, this means there is no event in the target stream. Please discuss more with us in community slack.



### EMIT LAST

In streaming processing, there is one typical query which is processing the last X seconds / minutes / hours of data. For example, show me the cpu usage per device in the last 1 hour. We call this type of processing `Last X Streaming Processing` in Timeplus and Timeplus provides a specialized SQL extension for ease of use: `EMIT LAST <n><UNIT>`. As in other parts of streaming queries, users can use interval shortcuts here.

:::info

By default, `EMIT LAST` uses the event time. Timeplus Proton will seek both streaming storage and historical to backfill data in last X time range. `EMIT LAST .. ON PROCTIME` uses the wall clock time to do the seek.

:::

#### EMIT LAST for Streaming Tail

Tailing events whose event timestamps are in the last X range.

Examples

```sql
SELECT *
FROM device_utils
WHERE cpu_usage > 80
EMIT LAST 5m
```

The above example filters events in the `device_utils` stream where `cpu_usage` is greater than 80% and events are appended in the last 5 minutes. Internally, Timeplus seeks streaming storage back to 5 minutes (wall-clock time from now) and tailing the data from there.

#### EMIT LAST for Global Aggregation

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <stream_name>
[WHERE clause]
GROUP BY ...
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
```

**Note** Internally Timeplus chops streaming data into small windows and does the aggregation in each small window and as time goes, it slides out old small windows to keep the overall time window fixed and keep the incremental aggregation efficient. By default, the maximum keeping windows is 100. If the last X interval is very big and the periodic emit interval is small,
then users will need to explicitly set up a bigger max window : `last_x_interval / periodic_emit_interval`.

Examples

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 80
GROUP BY device
EMIT PERIODIC 5s AND LAST 1h
SETTINGS max_keep_windows=720;
```

#### EMIT LAST for Windowed Aggregation

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <streaming_window_function>(<stream_name>, [<time_column>], [<window_size>], ...)
[WHERE clause]
GROUP BY ...
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
```

Examples

```sql
SELECT device, window_end, count(*)
FROM tumble(device_utils, 5s)
WHERE cpu_usage > 80
GROUP BY device, window_end
EMIT LAST 1h
SETTINGS max_keep_windows=720;
```

Similarly, we can apply the last X on hopping window.

## PARTITION BY

`PARTITION BY` in Streaming SQL is to create [substreams](substream).



## GROUP BY and HAVING {#group_having}

`GROUP BY` applies aggregations for 1 or more columns.

When `GROUP BY` is applied, `HAVING` is optional to filter the aggregation results. The difference between `WHERE` and`HAVING` is data will be filtered by `WHERE` clause first, then apply `GROUP BY`, and finally apply `HAVING`.

## JOINs

Please check [Joins](joins).

## WITH cte

CTE, or Common Table Expression, is a handy way to define [subqueries](#subquery) one by one, before the main SELECT clause. 

## Subquery {#subquery}

### Vanilla Subquery

A vanilla subquery doesn't have any aggregation (this is a recursive definition), but can have arbitrary number of filter predicates, transformation functions. Some systems call this `flat map`.

Examples

```sql
SELECT device, max(cpu_usage)
FROM (
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
) GROUP BY device;
```

Vanilla subquery can be arbitrarily nested until Timeplus's system limit is hit. The outer parent query can be any normal vanilla query or windows aggregation or global aggregation.

Users can also write the query by using Common Table Expression (CTE) style.

```sql
WITH filtered AS(
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
)
SELECT device, max(cpu_usage) FROM filtered GROUP BY device;
```

Multiple CTE can be defined in one query, such as

```sql
WITH cte1 AS (SELECT ..),
     cte2 AS (SELECT ..)
SELECT .. FROM cte1 UNION SELECT .. FROM cte2    
```

CTE with column alias is not supported.

### Streaming Window Aggregated Subquery

A window aggregate subquery contains windowed aggregation. There are some limitations users can do with this type of subquery.

1. Timeplus supports window aggregation parent query over windowed aggregation subquery (hop over hop, tumble over tumble etc), but it only supports 2 levels. When laying window aggregation over window aggregation, please pay attention to the window size: the window
2. Timeplus supports multiple outer global aggregations over a windowed subquery. (Not working for now).
3. Timeplus allows arbitrary flat transformation (vanilla query) over a windows subquery until a system limit is hit.

Examples

```sql
-- tumble over tumble
WITH avg_5_second AS (
    SELECT device, avg(cpu_usage) AS avg_usage, any(window_start) AS start -- tumble subquery
    FROM
      tumble(device_utils, 5s)
    GROUP BY device, window_start
)
SELECT device, max(avg_usage), window_end -- outer tumble aggregation query
FROM tumble(avg_5_second, start, 10s)
GROUP BY device, window_end;
```

```sql
-- global over tumble
SELECT device, max(avg_usage) -- outer global aggregation query
FROM
(
    SELECT device, avg(cpu_usage) AS avg_usage -- tumble subquery
    FROM
        tumble(device_utils, 5s)
    GROUP BY device, window_start
) AS avg_5_second
GROUP BY device;
```

### Global Aggregated Subquery

A global aggregated subquery contains global aggregation. There are some limitations users can do with global aggregated subquery:

1. Timeplus supports global over global aggregation and there can be multiple levels until a system limit is hit.
2. Flat transformation over global aggregation can be multiple levels until a system limit is hit.
3. Window aggregation over global aggregation is not supported.

Examples

```sql
SELECT device, max_k(avg_usage,5) -- outer global aggregation query
FROM
(
    SELECT device, avg(cpu_usage) AS avg_usage -- global aggregation subquery
    FROM device_utils
    GROUP BY device
) AS avg_5_second;
```

## Common Types of Queries

### Streaming Tailing {#streaming-tailing}

```sql
SELECT <expr>, <columns>
FROM <stream_name>
[WHERE clause]
```

Examples

```sql
SELECT device, cpu_usage
FROM devices_utils
WHERE cpu_usage >= 99
```

The above example continuously evaluates the filter expression on the new events in the stream `device_utils` to filter out events which have `cpu_usage` less than 99. The final events will be streamed to clients.

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

Like in [Streaming Tail](#streaming-tailing), Timeplus continuously monitors new events in the stream `device_utils`, does the filtering and then continuously does **incremental** count aggregation. Whenever the specified delay interval is up, project the current aggregation result to clients.

### Tumble Streaming Window Aggregation {#tumble}

Tumble slices the unbounded data into different windows according to its parameters. Internally, Timeplus observes the data streaming and automatically decides when to close a sliced window and emit the final results for that window.

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM tumble(<stream_name>, [<timestamp_column>], <tumble_window_size>, [<time_zone>])
[WHERE clause]
GROUP BY [window_start | window_end], ...
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
```

Tumble window means a fixed non-overlapped time window. Here is one example for a 5 seconds tumble window:

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:05", "2020-01-01 00:00:10]
["2020-01-01 00:00:10", "2020-01-01 00:00:15]
...
```

`tumble` window in Timeplus is left closed and right open `[)` meaning it includes all events which have timestamps **greater or equal** to the **lower bound** of the window, but **less** than the **upper bound** of the window.

`tumble` in the above SQL spec is a table function whose core responsibility is assigning tumble window to each event in a streaming way. The `tumble` table function will generate 2 new columns: `window_start, window_end` which correspond to the low and high bounds of a tumble window.

`tumble` table function accepts 4 parameters: `<timestamp_column>` and `<time-zone>` are optional, the others are mandatory.

When the `<timestamp_column>` parameter is omitted from the query, the stream's default event timestamp column which is `_tp_time` will be used.

When the `<time_zone>` parameter is omitted the system's default timezone will be used. `<time_zone>` is a string type parameter, for example `UTC`.

`<tumble_window_size>` is an interval parameter: `<n><UNIT>` where `<UNIT>` supports `s`, `m`, `h`, `d`, `w`.
It doesn't yet support `M`, `q`, `y`. For example, `tumble(my_stream, 5s)`.

More concrete examples:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results. 

Let's change `tumble(stream, 5s)` to `tumble(stream, timestmap, 5s)` :

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, timestamp, 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK WITH DELAY 2s;
```

Same as the above delayed tumble window aggregation, except in this query, user specifies a **specific time column** `timestamp` for tumble windowing.

The example below is so called processing time processing which uses wall clock time to assign windows. Timeplus internally processes `now/now64` in a streaming way.

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, now64(3, 'UTC'), 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK WITH DELAY 2s;
```




### Hop Streaming Window Aggregation {#hop}

Like [Tumble](#tumble), Hop also slices the unbounded streaming data into smaller windows, and it has an additional sliding step.

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM hop(<stream_name>, [<timestamp_column>], <hop_slide_size>, [hop_windows_size], [<time_zone>])
[WHERE clause]
GROUP BY [<window_start | window_end>], ...
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
```

Hop window is a more generalized window compared to tumble window. Hop window has an additional
parameter called `<hop_slide_size>` which means window progresses this slide size every time. There are 3 cases:

1. `<hop_slide_size>` is less than `<hop_window_size>`. Hop windows have overlaps meaning an event can fall into several hop windows.
2. `<hop_slide_size>` is equal to `<hop_window_size>`. Degenerated to a tumble window.
3. `<hop_slide_size>` is greater than `<hop_window_size>`. Windows has a gap in between. Usually not useful, hence not supported so far.

Please note, at this point, you need to use the same time unit in `<hop_slide_size>` and `<hop_window_size>`, for example `hop(device_utils, 1s, 60s)` instead of `hop(device_utils, 1s, 1m)`. 

Here is one hop window example which has 2 seconds slide and 5 seconds hop window.

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:02", "2020-01-01 00:00:07]
["2020-01-01 00:00:04", "2020-01-01 00:00:09]
["2020-01-01 00:00:06", "2020-01-01 00:00:11]
...
```

Except that the hop window can have overlaps, other semantics are identical to the tumble window.

```sql
SELECT device, max(cpu_usage)
FROM hop(device_utils, 2s, 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK;
```

The above example SQL continuously aggregates max cpu usage per device per hop window for stream `device_utils`. Every time a window is closed, Timeplus emits the aggregation results.

### Session Streaming Window Aggregation

This is similar to tumble and hop window. Please check the [session](funtions_for_streaming#session) function. 

