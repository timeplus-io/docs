# Streaming Processing

The following functions are supported in streaming query, but not all of them support historical query. Please check the tag like this.

✅ streaming query

🚫 historical query

### table

`table(stream)` turns the unbounded data stream as a bounded table, and query its historical data. For example, you may load the clickstream data from a Kafka topic into the `clicks` stream in Timeplus. By default, if you run `SELECT .. FROM clicks ..` This is a streaming query with unbounded data. The query will keep sending you new results whenever it's available. If you only need to analyze the past data, you can put the stream into the `table` function. Taking a `count` as an example:

- running `select count(*) from clicks` will show latest count every 2 seconds and never ends, until the query is canceled by the user
- running `select count(*) from table(clicks)` will return immediately with the row count for the historical data for this data stream.

You can create views such as `create view histrical_view as select * from table(stream_name)`, if you want to query the data in the table mode more than once. This may work well for static data, such as lookup information(city names and their zip code).

:::info
New in Proton v1.5.9, you can also run `table` function on an [Kafka External Stream](/proton-kafka) for Kafka. This will read existing data in the specified Kafka topic. Please avoid scanning all data via `select * from table(ext_stream)`. However `select count(*) from table(ext_stream)` is optimized to get the number of current message count from the Kafka topic.
:::

Learn more about [Non-streaming queries](/history).

### tumble

`tumble(stream [,timeCol], windowSize)`

Create a tumble window view for the data stream, for example `tumble(iot,5s)` will create windows for every 5 seconds for the data stream `iot` . The SQL must end with `group by ` with either `window_start` or `window_end` or both.

✅ streaming query

✅ historical query

### hop

`hop(stream [,timeCol], step, windowSize)`
Create a hopping window view for the data stream, for example `hop(iot,1s,5s)` will create windows for every 5 seconds for the data stream `iot` and move the windows forward every second. The SQL must end with `group by ` with either `window_start` or `window_end` or both.

✅ streaming query

🚫 historical query

### session

`session(stream [,timeCol], idle, [maxLength,] [startCondition,endCondition] )`

Create dynamic windows based on the activities in the data stream.

Parameters:

- `stream` a data stream, a view, or a [CTE](/glossary#cte)/subquery
- `timeCol` optional, by default it will be `_tp_time` (the event time for the record)
- `idle` how long the events will be automatically split to 2 session windows
- `maxLength` the max length of the session window. Optional. Default value is the 5 times of `idle`
- `[startCondition, endCondition]`Optional. If specified, the session window will start when the `startCondition`is met and will close when `endCondition` is met. You can use `[expression1, expression2]`to indicate start and end events will be included in the session, or `(expression1, expression2]` to indicate the ending events will be included but not the starting events.

For example, if the car keeps sending data when it's moving and stops sending data when it's parked or waiting for the traffic light

- `session(car_live_data, 1m) partition by cid` will create session windows for each car with 1 minute idle time. Meaning if the car is not moved within one minute, the window will be closed and a new session window will be created for future events. If the car keeps moving for more than 5 minutes, different windows will be created (every 5 minutes), so that as analysts, you can get near real-time results, without waiting too long for the car to be stopped.
- `session(car_live_data, 1m, [speed>50,speed<50)) partition by cid` create session windows to detect when the car is speeding. The first event with speed over 50 will be included, and the last event with speed lower than 50 will not be included in the session window.
- `session(access_log, 5m, [action='login',action='logout']) partition by uid` create session windows when the user logins the system and logout. If there is no activity within 5 minutes, the window will be closed automatically.

✅ streaming query

🚫 historical query

### dedup

`dedup(stream, column1 [,otherColumns..] [liveInSecond,limit])`

Apply the deduplication at the given data stream with the specified column(s). Rows with same column value will only show once (only the first row is selected and others are omitted.) `liveInSecond` specifies how long the keys will be kept in the memory/state. By default forever. But if you only want to avoid duplicating within a certain time period, say 2 minutes, you can set `120s`, e.g. `dedup(subquery,myId,120s)`

The last parameter `limit` is optional which is `100000` by default. It limits the max unique keys maintained in the query engine. If the limit reaches, the system will recycle the earliest keys to maintain this limit.

You can cascade this table function like `tumble(dedup(table(....` and so far the wrapping order must in this sequence : tumble/hop/session -> dedup -> table.

✅ streaming query

✅ historical query

:::info tips

When you use `dedup` function together with `table()` function to get the latest status for events with same ID, you can consider ordering the data by \_tp_time in the reverse way, so that the latest event for same ID is kept. e.g.

```sql
WITH latest_to_earliest AS (SELECT * FROM table(my_stream) ORDER by _tp_time DESC)
SELECT * FROM dedup(latest_to_earliest, id)
```

Otherwise, if you run queries with `dedup(table(my_stream),id)` the earliest event with same ID will be processed first, ignoring the rest of the updated status. In many cases, this is not what you expect.

:::

### lag

`lag(<column_name> [, <offset=1>][, <default_value>])`: Work for both streaming query and historical query. If you omit the `offset` the last row will be compared. E.g.

`lag(total)` to get the value of `total` from the last row. `lag(total, 12)` to get the value from 12 rows ago. `lag(total, 12, 0)` to use 0 as the default value if the specified row is not available.

✅ streaming query

🚫 historical query

### lags

`lags(<column_name>, begin_offset, end_offset [, <default_value>])` similar to `lag` function but can get a list of values. e.g. `lags(total,1,3)` will return an array for the last 1, last 2 and last 3 values.

✅ streaming query

🚫 historical query

### date_diff_within

`date_diff_within(timegap,time1, time2)` returns true or false. This function only works in [stream-to-stream join](/joins#stream_stream_join). Check whether the gap between `time1` and `time2` are within the specific range. For example `date_diff_within(10s,payment.time,notification.time)` to check whether the payment time and notification time are within 10 seconds or less.

✅ streaming query

🚫 historical query

### lag_behind

`lag_behind(offset)` or `lag_behind(offset,<column1_name>, <column2_name>)` It is designed for streaming JOIN. If you don't specify the column names, then it will use the processing time on the left stream and right stream to compare the timestamp difference.

Example:

```sql
SELECT * FROM stream1 ASOF JOIN stream2
ON stream1.id=stream2.id AND stream1.seq>=stream2.seq AND lag_behind(10ms, stream1.ts1, stream2.ts2)
```

✅ streaming query

🚫 historical query

### latest

`latest(<column_name>)` gets the latest value for a specific column, working with streaming aggregation with group by.

✅ streaming query

🚫 historical query

### earliest

`earliest(<column_name>)` gets the earliest value for a specific column, working with streaming aggregation with group by.

✅ streaming query

🚫 historical query

### now

`now()`

Show the current date time, such as 2022-01-28 05:08:16

If the now() is used in a streaming query, no matter `SELECT` or `WHERE` or `tumble/hop` window, it will reflect the current time when the row is projected.

✅ streaming query

✅ historical query

### now64

Similar to `now()` but with extra millisecond information, such as 2022-01-28 05:08:22.680

It can be also used in streaming queries to show the latest datetime with milliseconds.

✅ streaming query

✅ historical query

### emit_version

`emit_version()` to show an auto-increasing number for each emit of streaming query result. It only works with streaming aggregation, not tail or filter.

For example, if you run `select emit_version(),count(*) from car_live_data` the query will emit results every 2 seconds and the first result will be with emit_version=0, the second result with emit_version=1. This function is particularly helpful when there are multiple rows in each emit result. For example, you can run a tumble window aggregation with a group by. All results from the same aggregation window will be in the same emit_version. You can then show a chart with all rows in the same aggregation window.

✅ streaming query

🚫 historical query

### changelog

`changelog(stream[, [key_col1[,key_col2,[..]],version_column], drop_late_rows])` to convert a stream (no matter append-only stream or versioned stream) to a changelog stream with given primary keys.

- If the source stream is a regular stream, i.e. append-only stream, you can choose one or more columns as the primary key columns. `changelog(append_stream, key_col1)` For example, the [car_live_data](/usecases#car_live_data) stream contains `cid` as car id, `speed_kmh` as the recently reported speed. Run the following SQL to create a changelog stream for each car to track the speed change `select * from changelog(car_live_data,cid)` A new column `_tp_delta` is included in the streaming query result. `-1` indicates that the row is redacted(removed). \_tp_delta = 1 with the new value.
- If the source stream is a [Versioned Stream](/versioned-stream), since the primary key(s) and version columns are specified in the versioned stream, the `changelog` function can be as simple as `changelog(versioned_kv)`
- By default, `drop_late_rows` is false. But if you do want to drop late events for the same primary key, then you need to set drop_late_rows as true, and specify the version_column. The bigger the version_column value is, the more recent version it implies. In most case, you can set the event time(\_tp_time) as the version_column. An example to drop the late event for car_live_data:

```sql
select _tp_time,cid,speed_kmh, _tp_delta
from changelog(car_live_data, cid, _tp_time, true)
```

✅ streaming query

🚫 historical query
