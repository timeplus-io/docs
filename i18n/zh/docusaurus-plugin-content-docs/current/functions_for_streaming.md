# 流处理

流式查询支持以下函数，但并非所有函数都支持历史查询。 请检查像这样的标签。

✅ 流查询

🚫 历史查询

### table

`table(stream)` 将无界限的数据流转换为一个有界限的表格，并查询其历史数据。 例如，您可以在 Timeplus 中将 Kafka topic 中的点击流数据加载到 `clicks` 流。 默认情况下，如果您运行 `SELECT FROM clicks</0> 默认情况下，如果您运行 <code>SELECT FROM clicks</0> 这是一个带有无边界数据的流式查询。 查询将随时向您发送新结果。 如果您只需要分析过去的数据，您可以将流放到 <code>table` 函数中。 使用 `count` 作为示例：

* 运行 `select count(*) from clicks` 将每2秒显示最新计数，直到您取消这个查询。
* 运行 `select count(*) from table(clicks)` 将立即返回此数据流的历史数据行数。

您可以创建视图，如 `create view histrical_view as select * from table(stream_name)`, 如果您想要多次查询表模式中的数据。 对于静态数据，例如查找信息(城市名称及其邮政编码)，这种方法可能很有效。

了解更多关于 [非流式查询](history) 的信息。

### tumble

`tumble(stream [,timeCol], windowSize)`

为数据流创建一个tumble窗口视图，例如 `tumble(iot,5s)` 将创建每5秒数据流 `iot` 的窗口。 SQL 必须以 `group by` 结尾，然后使用 `window_start` 或 `window_end` 或两者兼有。

✅ 流查询

✅ 历史查询

### hop

`hop(stream [,timeCol], step, windowSize)` 为数据流创建一个滑窗视图, 例如 `hop(iot,1s,5s)` 将创建每5秒数据流的窗口 `iot` 并每秒移动窗口转发一次。 SQL 必须以 `group by` 结尾，然后使用 `window_start` 或 `window_end` 或两者兼有。

✅ 流查询

🚫 历史查询

### session

`session(stream [,timeCol], idle, [maxLength,] [startCondition,endCondition] )`

基于数据流中的活动创建动态窗口。

参数：

* `stream` 数据流、视图或 [CTE](glossary#cte)/子查询
* `timeCol` 可选，默认情况下是 `__tp_time` (记录的事件时间)
* `idle` 事件将被自动分割为2个会话窗口
* `maxLength` 会话窗口最大长度。 可选的。 默认值是 `idle`的 5 倍
* `[startCondition, endCondition]`可选. 开始和结束条件 如果指定的话，会话窗口将在满足 `startCondition`时开始，并将在 `endCondition` 得到满足时关闭。 您可以使用 `[expression1, expression2]`表示开始和结束事件将包含在会话中。 或 `(expression1，expression2]` 表示结束事件将包括但不包括起始事件。

例如，如果车辆在移动时一直在发送数据，停靠时停止发送数据或等待交通灯

* `session(car_live_data, 1m) partition by cid` 将为每辆车创建会话窗口，空闲时间为1分钟。 表示汽车未在一分钟内移动， 窗口将被关闭，并将为未来事件创建一个新的会话窗口。 如果车辆移动时间超过5分钟，将创建不同的窗户(每5分钟)， 这样作为分析员，你就可以获得接近实时的结果，而不必等待太长时间才能停车。
* `session(car_live_data, 1m, [speed>50,speed<50)) partition by cid` 创建会话窗口以检测汽车正在加速的情况。 将包括速度超过50的第一次活动。 和速度小于50的最后一个事件将不会被包含在会话窗口中。
* `session(access_log, 5m, [action='login',action='logout']) partition by uid` 创建会话窗口时用户登录系统并退出登录。 如果在5分钟内没有活动，窗口将自动关闭。

✅ 流查询

🚫 历史查询

### dedup

`dedup(stream, column1 [,otherColumns..] [liveInSecond,limit]) [liveInSecond,limit]) [liveInSecond,limit]) [liveInSecond,limit])`

在给定的数据流中使用指定的列 (s) 应用反复性。 具有相同列值的行将仅显示一次（仅选择第一行，而忽略其他行。） `liveInSecond` 是指定在内存/状态中保存密钥的时间。 `liveInSecond` 是指定在内存/状态中保存密钥的时间。 默认永远存在。 但是，如果您只想在特定时间段内避免重复，例如2分钟，则可以设置 `120s` 例如 `dedup(subquery,myId,120s)`

最后一个参数 `限制` 是可选的，默认是 `100 000`。 它限制在查询引擎中最大唯一密钥。 如果达到限制，系统将回收最早的密钥以保持这一限制。

您可以将此表函数级，例如 `tumble(table...)` 并且到目前为止，包装顺序必须在这个序列中：tumble/hop/session -> dep-> 表。

✅ 流查询

✅ 历史查询

:::info tips

当您将`dedup`函数与`table()`函数一起使用来获取具有相同ID的事件的最新状态时，可以考虑以相反的方式按_tp_time对数据进行排序，以便保留相同ID的最新事件。 例如

```sql
WITH latest_to_earliest AS (SEELCT * FROM table(my_stream) ORDER by _tp_time DESC)
SELECT * FROM dedup(latest_to_earliest, id)
```

否则，如果您使用`dedup(table(my_stream),id)` 运行查询，则将首先处理具有相同ID的最早事件，而忽略其余更新状态。 在许多情况下，这不是你所期望的。

:::



### lag

`lag(<column_name> [, <offset=1>] [, <default_value>])`: 同时用于流式查询和历史查询。 如果您省略了 `offset` ，最后一行将被比较。 。

`lag(总计)` 以获得最后一行的 `总计` 的值。 `lag(总计, 12)` 以获得12行前的值。 `lag(total, 0)` 如果指定行不可用则使用0作为默认值。

✅ 流查询

🚫 历史查询

### lags

`lags(<column_name>, begin_offset, end_offset [, <default_value>])` 与 `lags` 函数相似，但可以获得一个数值列表。 例如: `lags(total,1,3)` 将返回一个数组，最后1，最后2和最后3个值。

✅ 流查询

🚫 历史查询

### date_diff_within

`date_diff_within(timegap,time1, time2)` 返回 true 或 false。  此函数只能在 [stream-to-stream join](query-syntax#stream_stream_join) 使用。 检查 `time1` 和 `time2` 之间的差距是否在特定范围内。 例如 `date_diff_within(10s,payment.time,notification.time)` 来检查付款时间和通知时间是否在10秒或更短。

✅ 流查询

🚫 历史查询

### lag_behind

`lag_behind(offset)` or `lag_behind(offset,<column1_name>, <column2_name>)` It is designed for streaming JOIN. If you don't specify the column names, then it will use the processing time on the left stream and right stream to compare the timestamp difference. If you don't specify the column names, then it will use the processing time on the left stream and right stream to compare the timestamp difference.

示例：

```sql
SELECT * FROM stream1 ASOF JOIN stream2 
ON stream1.id=stream2.id AND stream1.seq>=stream2.seq AND lag_behind(10ms, stream1.ts1, stream2.ts2)
```

✅ 流查询

🚫 历史查询

### latest

`latest(<column_name>)` gets the latest value for a specific column, working with streaming aggregation with group by.

✅ 流查询

🚫 历史查询

### earliest

`earliest(<column_name>)` gets the earliest value for a specific column, working with streaming aggregation with group by.

✅ 流查询

🚫 历史查询

### now

`now()`

Show the current date time, such as 2022-01-28 05:08:16

If the now() is used in a streaming query, no matter `SELECT` or `WHERE` or `tumble/hop` window, it will reflect the current time when the row is projected.

✅ 流查询

✅ 历史查询

### now64

Similar to `now()` but with extra millisecond information, such as 2022-01-28 05:08:22.680

It can be also used in streaming queries to show the latest datetime with milliseconds.

✅ 流查询

✅ 历史查询

### emit_version

`emit_version()` to show an auto-increasing number for each emit of streaming query result. It only works with streaming aggregation, not tail or filter. It only works with streaming aggregation, not tail or filter.

For example, if you run `select emit_version(),count(*) from car_live_data` the query will emit results every 2 seconds and the first result will be with emit_version=0, the second result with emit_version=1. This function is particularly helpful when there are multiple rows in each emit result. For example, you can run a tumble window aggregation with a group by. All results from the same aggregation window will be in the same emit_version. You can then show a chart with all rows in the same aggregation window. This function is particularly helpful when there are multiple rows in each emit result. For example, you can run a tumble window aggregation with a group by. All results from the same aggregation window will be in the same emit_version. You can then show a chart with all rows in the same aggregation window.

✅ 流查询

🚫 历史查询

### 变更日志

`changelog(stream[, [key_col1[,key_col2,[..]],version_column], drop_late_rows])` to convert a stream (no matter append-only stream or versioned stream) to a changelog stream with given primary keys.

* 如果数据源流是常规流，即仅附加流，则可以选择一个或多个列作为主键列。 `changelog(append_stream, key_col1)`  比如[car_live_data](usecases#car_live_data) 流包含 `cid` 列作为车辆 ID, `speed_kmh` 作为最新上报的时速。 运行下面的 SQL 来为每辆车创建一个更新日志流以跟踪速度变化 `select * from changelog(car_live_data,cid)` 。 一个新列 `_tp_delta` 包含在流查询结果中。 `-1` 表示行已被重新编辑(移除)。 _tp_delta=1，使用新值。
* 如果源流是 [版本流](versioned-stream)，因为在版本流中已经指定了主键和版本列， `changelog` 函数可以直接这样使用 `changelog(versioned_kv)`
* 默认情况下， `drop_late_rows` 为 false。 但是，如果你确实想删除同一个主键的延迟事件，那么你需要将 drop_late_rows 设置为 true，并指定 version_column。 版本_列值越大，它意味着的最新版本。 在大多数情况下，您可以将事件时间 (_tp_time) 设置为 version_column。 删除 car_live_data 的迟到事件的示例：

```sql
select _tp_time,cid,speed_kmh, _tp_delta 
from changelog(car_live_data, cid, _tp_time, true)
```



✅ 流查询

🚫 历史查询
