# 流处理

流式查询支持以下函数，但并非所有函数都支持历史查询。 请检查像这样的标签。

✅ streaming query

🚫 historical query

### table

`table(stream)` 将无界限的数据流转换为一个有界限的表格，并查询其历史数据。 例如，您可以在 Timeplus 中将 Kafka topic 中的点击流数据加载到 `clicks` 流。 默认情况下，如果您运行 `SELECT FROM clicks</0> 这是一个带有无边界数据的流式查询。 查询将随时向您发送新结果。 如果您只需要分析过去的数据，您可以将流放到 <code>table` 函数中。 使用 `count` 作为示例：

* 运行 `select count(*) from clicks` 将每2秒显示最新计数，直到您取消这个查询。
* 运行 `select count(*) from table(clicks)` 将立即返回此数据流的历史数据行数。

您可以创建视图，如 `create view histrical_view as select * from table(stream_name)`, 如果您想要多次查询表模式中的数据。 对于静态数据，例如查找信息(城市名称及其邮政编码)，这种方法可能很有效。

了解更多关于 [非流式查询](history) 的信息。

### tumble

`tumble(stream [,timeCol], windowSize)`

为数据流创建一个tumble窗口视图，例如 `tumble(iot,5s)` 将创建每5秒数据流 `iot` 的窗口。 SQL 必须以 `group by` 结尾，然后使用 `window_start` 或 `window_end` 或两者兼有。

✅ streaming query

✅ historical query

### hop

`hop(stream [,timeCol], step, windowSize)` 为数据流创建一个滑窗视图, 例如 `hop(iot,1s,5s)` 将创建每5秒数据流的窗口 `iot` 并每秒移动窗口转发一次。 SQL 必须以 `group by` 结尾，然后使用 `window_start` 或 `window_end` 或两者兼有。

✅ streaming query

🚫 historical query

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

✅ streaming query

🚫 historical query

### dedup

`dedup(stream, column1 [,otherColumns..] [liveInSecond,limit]) [liveInSecond,limit]) [liveInSecond,limit])`

在给定的数据流中使用指定的列 (s) 应用反复性。 `liveInSecond` 是指定在内存/状态中保存密钥的时间。 默认永远存在。 但是，如果您只想在特定时间段内避免重复，例如2分钟，则可以设置 `120s` 例如 `dedup(subquery,myId,120s)`

最后一个参数 `限制` 是可选的，默认是 `100 000`。 它限制在查询引擎中最大唯一密钥。 如果达到限制，系统将回收最早的密钥以保持这一限制。

您可以将此表函数级，例如 `tumble(table...)` 并且到目前为止，包装顺序必须在这个序列中：tumble/hop/session -> dep-> 表。

✅ streaming query

✅ historical query

### lag

`lag(<column_name> [, <offset=1>] [, <default_value>])`: 同时用于流式查询和历史查询。 如果您省略了 `offset` ，最后一行将被比较。 。

`lag(总计)` 以获得最后一行的 `总计` 的值。 `lag(总计, 12)` 以获得12行前的值。 `lag(total, 0)` 如果指定行不可用则使用0作为默认值。

✅ streaming query

🚫 historical query

### lags

`lags(<column_name>, begin_offset, end_offset [, <default_value>])` 与 `lags` 函数相似，但可以获得一个数值列表。 例如: `lags(total,1,3)` 将返回一个数组，最后1，最后2和最后3个值。

✅ streaming query

🚫 historical query

### latest

`latest(<column_name>)` 获取特定列的最新值，用于与群组的串流聚合。

✅ streaming query

🚫 historical query

### earliest

`earliest(<column_name>)` 获得特定列的最早值，与分组的串流聚合一起工作。

✅ streaming query

🚫 historical query

### now

`now()`

显示当前日期时间，例如2022-01-28 05:08:16

当now()用在流式SQL,无论是 `SELECT` 或 `WHERE` 或 `tumble/hop` 窗口, 他想反应运行时的时间。

✅ streaming query

✅ historical query

### now64

类似于 `now ()` 但有额外毫秒信息，例如2022-01-28 05:08:22.680

它也可以用于流查询以显示最新的日期时间和毫秒。

✅ streaming query

✅ historical query

### date_diff_within

`date_diff_within(timegap,time1, time2)` 返回 true 或 false。  此函数只能在 [stream-to-stream join](query-syntax#stream_stream_join) 使用。 检查 `time1` 和 `time2` 之间的差距是否在特定范围内。 例如 `date_diff_within(10s,payment.time,notification.time)` 来检查付款时间和通知时间是否在10秒或更短。

### emit_version

`emit_version()` 以显示流查询结果的每个发射的自动增加数字。 它只适用于流聚合，而不是尾部或过滤器。

例如，如果运行 `select emit_version(),count(*) from car_live_data` 查询将每2秒发布结果，而第一个结果将是emit_version=0。 emit_version=1的第二个结果。 当每个发射结果中有多行时，此函数特别有用。 例如，您可以运行一个tumble窗口聚集时加group by。 相同聚合窗口的所有结果将在相同的 emit_version。 然后您可以在同一聚合窗口中显示所有行的图表。

✅ streaming query

🚫 historical query

### changelog

`changelog（stream [，[key_col1 [，key_column，[..]]，version_column]，drop_late_rows]）` 用于将流（无论是仅限附加的流还是版本控制的流）转换为具有给定主键的变更日志流。

* 如果数据源流是常规流，即仅附加流，则可以选择一个或多个列作为主键列。 `changelog(append_stream, key_col1)`  比如[car_live_data](usecases#car_live_data) 流包含 `cid` 列作为车辆 ID, `speed_kmh` 作为最新上报的时速。 运行下面的 SQL 来为每辆车创建一个更新日志流以跟踪速度变化 `select * from changelog(car_live_data,cid)` 。一个新列 `_tp_delta` 包含在流查询结果中。 `-1` 表示行已被重新编辑(移除)。 _tp_delta=1，使用新值。
* 如果源流是 [版本流](versioned-stream)，因为在版本流中已经指定了主键和版本列， `changelog` 函数可以直接这样使用 `changelog(versioned_kv)`
* 默认情况下， `drop_late_rows` 为 false。 但是，如果你确实想删除同一个主键的延迟事件，那么你需要将 drop_late_rows 设置为 true，并指定 version_column。 版本_列值越大，它意味着的最新版本。 在大多数情况下，您可以将事件时间 (_tp_time) 设置为 version_column。 删除 car_live_data 的迟到事件的示例：

```sql
select _tp_time,cid,speed_kmh, _tp_delta 
from changelog(car_live_data, cid, _tp_time, true)
```



✅ streaming query

🚫 historical query
