# Streaming processing

### table

`table(stream)` turns the unbounded data stream as a bounded table, and query its historical data. For example, you may load the clickstream data from a Kafka topic into the `clicks` stream in Timeplus. By default, if you run `SELECT .. FROM clicks ..` This is a streaming query with unbounded data. The query will keep sending you new results whenever it's available. If you only need to analyze the past data, you can put the stream into the `table` function. Taking a `count` as an example:

* running `select count(*) from clicks` will show latest count every 2 seconds and never ends, until the query is canceled by the user
* running `select count(*) from table(clicks)` will return immediately with the row count for the historical data for this data stream.

You can create views such as `create view histrical_view as select * from table(stream_name)`, if you want to query the data in the table mode more than once. This may work well for static data, such as lookup information(city names and their zip code).

Learn more about [Non-streaming queries](history).

### tumble

`tumble(stream [,timeCol], windowSize)`

Create a tumble window view for the data stream, for example `tumble(iot,5s)` will create windows for every 5 seconds for the data stream `iot` . The SQL must end with `group by ` with either `window_start` or `window_end` or both.

### hop

`hop(stream [,timeCol], step, windowSize)`
Create a hopping window view for the data stream, for example `hop(iot,1s,5s)` will create windows for every 5 seconds for the data stream `iot` and move the windows forward every second. The SQL must end with `group by ` with either `window_start` or `window_end` or both.

### session

`session(stream [,timeCol], idle, [maxLength,] [startCondition,endCondition] )`

Create dynamic windows based on the activities in the data stream. 

Parameters:

* `stream` a data stream, a view, or a [CTE](glossary#cte)/subquery
* `timeCol` optional, by default it will be `__tp_time` (the event time for the record)
* `idle` how long the events will be automatically splitted to 2 session windows
* `maxLength` the max length of the session window. Optional. Default value is the 5 times of `idle`
* `[startCondition, endCondition]`Optional. If specified, the session window will start when the `startCondition`is met and will close when `endCondition` is met. You can use `[expression1, expression2]`to indicate start and end events will be included in the session, or `(expression1, expression2]` to indicate the ending events will be included but not the starting events.

For example, if the car keeps sending data when it's moving and stops sending data when it's parked or waiting for the traffic light

* `session(car_live_data, 1m) partition by cid` will create session windows for each car with 1 minute idle time. Meaning if the car is not moved within one minute, the window will be closed and a new session window will be created for future events. If the car keeps moving for more than 5 minutes, different windows will be created (every 5 minutes), so that as analysts, you can get near real-time results, without waiting too long for the car to be stopped.
* `session(car_live_data, 1m, [speed>50,speed<50)) partition by cid` create session windows to detect when the car is speeding. The first event with speed over 50 will be included, and the last event with speed lower than 50 will not be included in the session window.
* `session(access_log, 5m, [action='login',action='logout']) partition by uid` create session windows when the user logins the system and logout. If there is no activity within 5 minutes, the window will be closed automatically.

### dedup

`dedup(stream, column1 [,otherColumns..] [liveInSecond,limit])`

Apply the deduplication at the given data stream with the specified column(s). `liveInSecond` specifies how long the keys will be kept in the memory/state. By default forever. But if you only want to avoid duplicating within a certain time period, say 2 minutes, you can set `120s`, e.g. `dedup(subquery,myId,120s)`

The last parameter `limit` is optional which is `100000` by default. It limits the max unique keys maintained in the query engine. If the limit reaches, the system will recycle the earliest keys to maintain this limit.

You can cascade this table function like `tumble(dedup(table(....` and so far the wrapping order must in this sequence : tumble/hop/session -> dedup -> table.

### lag

`lag(<column_name> [, <offset=1>][, <default_value>])`: Work for both streaming query and historical query. If you omit the `offset` the last row will be compared. E.g.

`lag(total)` to get the value of `total` from the last row. `lag(total, 12)` to get the value from 12 rows ago. `lag(total, 12, 0)` to use 0 as the default value if the specified row is not available.



### lags

`lags(<column_name>, begin_offset, end_offset [, <default_value>])` similar to `lag` function but can get a list of values. e.g. `lags(total,1,3)` will return an array for the last 1, last 2 and last 3 values.

### latest

`latest(<column_name>)` gets the latest value for a specific column, working with streaming aggregation with group by.

### earliest

`earliest(<column_name>)` gets the earliest value for a specific column, working with streaming aggregation with group by.

### now

`now()`

Show the current date time, such as 2022-01-28 05:08:16

If the now() is used in a streaming query, no matter `SELECT` or `WHERE` or `tumble/hop` window, it will reflect the current time when the row is projected.

### now64

Similar to `now()` but with extra millisecond information, such as 2022-01-28 05:08:22.680

It can be also used in streaming queries to show the latest datetime with milliseconds.

### emit_version

`emit_version()` to show an auto-increasing number for each emit of streaming query result. It only works with streaming aggregation, not tail or filter. 

For example, if you run `select emit_version(),count(*) from car_live_data` the query will emit results every 2 seconds and the first result will be with emit_version=0, the second result with emit_version=1. This function is particularly helpful when there are multiple rows in each emit result. For example, you can run a tumble window aggregation with a group by. All results from the same aggregation window will be in the same emit_version. You can then show a chart with all rows in the same aggregation window.

