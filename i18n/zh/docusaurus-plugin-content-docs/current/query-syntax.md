# 查询语法

Timeplus引入了几个SQL扩展来支持流式处理。 总的语法如下：

```sql
[WITH common_table_expression ..]
SELECT <expr, columns, aggr>
FROM <streaming_window_function>(<table_name>, [<time_column>], [<window_size>], ...)
[WHERE clause]
[GROUP BY clause]
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
[WHERE clause]
[GROUP BY clause]
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
[WHERE clause]
[GROUP BY clause]
[PARTITION BY clause]
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
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

- `SELECT .. FROM stream` will query the future events. Once you run the query, it will process new events. For example, if there are 1,000 events in the stream already, running `SELECT count() FROM stream` could return 0, if there is more new events.
- `SELECT .. FROM table(stream)` will query the historical data, just like many of other databases. In the above sample stream, if you run `SELECT count() FROM table(stream)`, you will get 1000 as the result and the query completed.

## Query Settings

Timeplus supports some advanced `SETTINGS` to fine tune the streaming query processing behaviors. Check [Query Settings](query-settings).

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

You can omit `EMIT AFTER WATERMARK`, since this is the default behavior for time window aggregations. 例如：

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results. How to determine the window should be closed? This is done by [Watermark](stream-query#window-watermark), which is an internal timestamp. 保证每个流量查询都能增加单一流量。

### EMIT AFTER WATERMARK WITH DELAY {#emit_after_wm_with_delay}

:::warning

Before Proton 1.5, the syntax was `EMIT AFTER WATERMARK AND DELAY`. Since Proton 1.5, we use `WITH DELAY` instead of `AND DELAY`, in order to make `AND` as the keyword to combine multiple emit polices.

:::

示例：

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WATERMARK DELAY 2s;
```

上面的示例 SQL 持续聚合每个设备对表 `设备 _utils` 的最大cpu 使用量。 Every time a window is closed, Timeplus waits for another 2 seconds and then emits the aggregation results.

### EMIT PERIODIC {#emit_periodic}

`PERIODIC <n><UNIT>` tells Proton to emit the aggregation periodically. `UNIT` 可以是 ms（毫秒）、s（秒）、m（分钟）、h（小时）、d（天）。`<n>` 应为大于 0 的整数。

示例：

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
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <table_name>
[WHERE clause]
GROUP BY ...
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
```

### EMIT ON UPDATE {#emit_on_update}

:::info

This is a new emit policy added in Proton 1.5.

:::

Since Proton 1.5, you can apply `EMIT ON UPDATE` in time windows, such as tumble/hop/session, with `GROUP BY` keys. 例如：

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

在流处理中，有一个典型的查询正在处理过去 X 秒/分钟/小时的数据。 例如，在过去 1 小时内显示每台设备的 cpu 使用量。 我们称这种类型的处理 `最后X 流处理` Timeplus和Timeplus提供专门的 SQL 扩展以便于使用： `EMIT LAST <n><UNIT>` 与流式查询的其他部分一样，用户可以在这里使用间隔快捷键。 与流式查询的其他部分一样，用户可以在这里使用间隔快捷键。

:::info

By default, `EMIT LAST` uses the event time. Timeplus Proton will seek both streaming storage and historical to backfill data in last X time range. `EMIT LAST .. ON PROCTIME` uses the wall clock time to do the seek.

:::

#### EMIT LAST for Streaming Tail

正在修改事件时间戳处于最后X范围内的事件。

子查询

```sql
SELECT *
FROM device_utils
WHERE cpu_usage > 80
EMIT LAST 5m
```

上面的示例过滤器事件在 `device_utils` 表中，其中 `cpu_usage` 大于80%，事件在过去 5 分钟内被添加。 在内部，Timeplus寻求流式存储回到5分钟(从现在起全时时间)并从那里压缩数据。

#### EMIT LAST for Global Aggregation

```sql
SELECT <column_name1>, <column_name2>, ...
FROM <table_name>
WHERE <clause>
EMIT LAST INTERVAL <n> <UNIT>;
SELECT <column_name1>, <column_name2>, ...
FROM <table_name>
WHERE <clause>
EMIT LAST INTERVAL <n> <UNIT>;
FROM <table_name>
WHERE <clause>
EMIT LAST INTERVAL <n> <UNIT>;
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
```

**注意** 内部Timeplus片段数据流到小窗口，并在每个小窗口和时间结束时进行聚合， 它滑出旧的小窗口，以保持整个时间窗口的固定并保持递增聚合的效率。 默认情况下，最大保留窗口是 100。 如果最后的 X 间隔非常大且周期性的发射间隔较小。 然后用户将需要明确设置一个较大的最大窗口： `last_x_interval / period_emit_interval`。

示例：

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, now64(3, 'UTC'), 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK DELAY 2s;
```

#### EMIT LAST for Windowed Aggregation

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <streaming_window_function>(<stream_name>, [<time_column>], [<window_size>], ...)

群组由...
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <table_name>
[WHERE clause]
GROUP BY ...
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>
```

示例：

```sql
SELECT device, window_end, count(*)
FROM tumblex(device_utils, 5s)
WHERE cpu_usage > 80
GROUP BY device, window _end
EMIT LaST 1h
SETTTINGS max_keep_windows=720;
```

同样，我们可以在跳跃窗口上应用最后X。

## PARTITION BY

`PARTITION BY` in Streaming SQL is to create [substreams](substream).

## GROUP BY and HAVING {#group_having}

`GROUP BY` applies aggregations for 1 or more columns.

When `GROUP BY` is applied, `HAVING` is optional to filter the aggregation results. The difference between `WHERE` and`HAVING` is data will be filtered by `WHERE` clause first, then apply `GROUP BY`, and finally apply `HAVING`.

## JOINs

请查看[Joins](joins)。

## WITH cte

CTE, or Common Table Expression, is a handy way to define [subqueries](#subquery) one by one, before the main SELECT clause.

## 子查询 {#subquery}

### 普通子查询

原版子查询没有任何聚合(这是一个递归定义)，但可以任意数目的过滤预测、转换函数。 一些系统调用这个 `平坦地图`。

示例：

```sql
SELECT device, max(cpu_usage)
FROM (
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
) GROUP BY device;
```

Vanilla 子查询可以任意嵌套，直到达到Timeplus的系统限制。 外部父查询可以是任何正常的原版查询或窗口聚合或全局聚合。

用户也可以通过使用通用表表达式(CTE)样式来写查询。

```sql
WITH filtered AS(
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
)
SELECT device, max(cpu_usage) FROM filtered GROUP BY device;
```

在一个查询中可以定义多个CTE，例如：

```sql
WITH cte1 AS (SELECT ..),
     cte2 AS (SELECT ..)
选择... FROM cte1 UNION SELECT .. 从 Cte2
选择... FROM cte1 UNION SELECT .. 从 Cte2
选择... FROM cte1 UNION SELECT .. 从 Cte2
选择... FROM cte1 UNION SELECT .. 从 Cte2
```

不支持带列别名的 CTE。

### 流式窗口聚合子查询

窗口合计子查询包含窗口聚合物。 有一些限制用户可以处理这类子查询。

1. Timeplus支持窗口聚合父查询对风聚合子查询的窗口聚合查询(跳过跳过跳过，tumble等)，但它只支持两个层次。 当在窗口聚合中设置窗口聚合时，请注意窗口大小：窗口
2. 时间插件支持在一个风能子查询上的多个外部全球聚合。 (现在不工作)
3. Timeplus允许任意对窗口子查询进行平坦转换(原版查询)，直到系统限制被触及。

示例：

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

### 全局聚合子查询

全球综合子查询包括全球汇总。 有一些限制用户可以处理全局总合子查询：

1. Timeplus支持全局聚合而不是全局聚合，可以是多个层次，直到达到系统限制为止。
2. 全局聚合的平面转换可以是多层次，直到系统限制被击中。
3. 不支持全局聚合的窗口聚合。

示例：

```sql
SELECT device, max_k(avg_usage,5) -- outer global aggregation query
FROM
(
    SELECT device, avg(cpu_usage) AS avg_usage -- global aggregation subquery
    FROM device_utils
    GROUP BY device
) AS avg_5_second;
```

## 普通子查询

### 流式扫描 {#streaming-tailing}

```sql
SELECT <expr>, <columns>
FROM <table_name>
[WHERE clause]
```

子查询

```sql
SELECT device, cpu_usage
FROM devices_utils
WHERE cpu_usage >= 99
```

The above example continuously evaluates the filter expression on the new events in the stream `device_utils` to filter out events which have `cpu_usage` less than 99. 最后的事件将会流向客户端。 最后的事件将会流向客户端。

### 全局流聚合 {#global}

在 Timeplus 中，我们将全局聚合定义为一个聚合查询，而不使用诸如tumble、hop等流式窗口。 不同于流式窗口聚合，全局流式聚合并不分割根据时间戳将未绑定的流式数据放入窗口， 相反，它作为一个巨大的全局窗口处理无界流数据。 由于这个属性，Timeplus现在不能根据时间戳为全局聚合回收的内存聚合状态/结果。

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <table_name>
[WHERE clause]
EMIT PERIODIC [<n><UNIT>]
```

`PERIODIC <n><UNIT>` 告诉Timeplus号定期发布聚合。 `UNIT` 可以是 ms（毫秒）、s（秒）、m（分钟）、h（小时）、d（天）。 `<n>` 应为大于 0 的整数。

示例：

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
EMIT PERIODIC 5s
```

Like in [Streaming Tail](#streaming-tailing), Timeplus continuously monitors new events in the stream `device_utils`, does the filtering and then continuously does **incremental** count aggregation. Whenever the specified delay interval is up, project the current aggregation result to clients. Whenever the specified delay interval is up, project the current aggregation result to clients.

### 简易流窗口聚合 {#tumble}

将无边界数据根据其参数混合成不同的窗户。 Internally, Timeplus observes the data streaming and automatically decides when to close a sliced window and emit the final results for that window.

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM tumble(<table_name>, [<timestamp_column>], <tumble_window_size>, [<time_zone>])
[WHERE clause]
GROUP BY [window_start | window_end], ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
```

简易窗口是指固定的非重叠时间窗口。 这是一个5秒tumble窗口的示例：

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:05", "2020-01-01 00:00:10]
["2020-01-01 00:00:10", "2020-01-01 00:00:15]
...
```

`tumble` window in Timeplus is left closed and right open `[)` meaning it includes all events which have timestamps **greater or equal** to the **lower bound** of the window, but **less** than the **upper bound** of the window.

`tumble` in the above SQL spec is a table function whose core responsibility is assigning tumble window to each event in a streaming way. The `tumble` table function will generate 2 new columns: `window_start, window_end` which correspond to the low and high bounds of a tumble window. The `tumble` table function will generate 2 new columns: `window_start, window_end` which correspond to the low and high bounds of a tumble window.

`tumble` 表格函数接受4个参数： `<timestamp_column>` 和 `<time-zone>` 是可选的，其他函数是强制性的。

当 `<timestamp_column>` 参数从查询中省略时，将使用该表的默认事件时间戳列，它是 `_tp_time`

`<time_zone>` 是一个字符串类型的参数，例如 `UTC`。 当 `<time_zone>` 参数被省略时，系统的默认时区将被使用。

`<tumble_window_size>` 是一个间隔参数： `<n><UNIT>` `<UNIT>` 支持 `s`, `m`, `h`, `d`, `w`. 它还不支持 `M`, `q`, `y`。 它还不支持 `M`, `q`, `y`。 例如： `tumble(my_table, 5s)`。

最近若干时间处理

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

上面的示例 SQL 持续聚合每个设备每个tumble窗口最大的 cpu 使用量，用于表 `设备 _utils`。 每次关闭一个窗口，Timeplus号发布聚合结果。

Let's change `tumble(stream, 5s)` to `tumble(stream, timestmap, 5s)` :

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, timestamp, 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK DELAY 2s;
```

与上述延迟的tumble窗口聚合相同，但此查询除外； 用户指定 **特定时间列** `时间戳` 用于tumble窗口。

下面的例子是所谓的处理时间处理，它使用墙时钟时间分配窗口。 时间外挂内部以串流方式处理 `/现在64`。

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 80
GROUP BY device
EMIT LAST 1h AND PERIODIC 5s
SETTINGS max_keep_windows=720;
```

### 滑动窗口聚合 {#hop}

像 [Tumble](#tumble)一样，Hop也将无限流流量数据切片放入较小的窗口，它还有一个附加的滑动步骤。

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM hop(<table_name>, [<timestamp_column>], <hop_slide_size>, [hop_windows_size], [<time_zone>])
[WHERE clause]
GROUP BY [<window_start | window_end>], ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
```

滑动窗口与tumble窗口相比是一个更加普遍化的窗口。 滑动窗口有一个额外的参数，名为 `<hop_slide_size>` ，指明滑动窗口的大小。 共有3起案件：

1. `<hop_slide_size>` 等于 `<hop_window_size>`。 衰落到tumble窗口。
2. `<hop_slide_size>` 小于 `<hop_window_size>`. Hop窗口有重叠，意味着事件可能会进入几个节点窗口。 衰落到tumble窗口。
3. `<hop_slide_size>` 大于 `<hop_window_size>`。 Windows之间有差距。 通常没有用处，因此迄今不予支持。

请注意此点。 您需要在 `<hop_slide_size>` 和 `<hop_window_size>`中使用相同的时间单位 例如 `hop(device_utils, 1s, 60s)` 代替 `hop(device_utils, 1s, 1m)`

这是一个滑动窗口示例，它是 5 秒作为窗口大小，每 2 秒滑动一次。

```
["2020-01-01:00:00:00:00:00", "2020-01-01:00:00:00:00:00:00:00:05"
["2020-01-01:00:00:00:00:00:00:00:00:00:00", "2020-01-01:00:00,007"
["2020-01-01-00:00:00:00:00:00:00:00:00.09"
["2020-01-01:00:00:00:00:000.00.00", "2020-01-01:00:00000006", "202020-01-01:00:00:00:00:00:00:00:00:00:00:11］
...
```

除了这个滑动窗口可能有重叠，其他语义与tumble窗口相同。

```sql
SELECT device, max(cpu_usage)
FROM hop(device_utils, 2s, 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK;
```

上面的示例 SQL 持续聚合每个设备在表 `设备 _utils` 中的最大cpu 使用量。 每次关闭一个窗口，Timeplus号发布聚合结果。

### Session Streaming Window Aggregation

This is similar to tumble and hop window. Please check the [session](functions_for_streaming#session) function.
