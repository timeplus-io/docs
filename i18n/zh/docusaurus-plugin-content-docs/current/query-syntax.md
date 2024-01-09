# 查询语法

Timeplus引入了几个SQL扩展来支持流式处理。 总的语法如下：

```sql
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
```

总体而言，Timeplus中的流式查询会与客户端建立长的HTTP/TCP连接，并持续评估查询。 它将继续根据`EMIT`策略返回结果，直到查询被用户、终端客户端或异常事件停止。

## Query Settings

时间插件支持一些高级`设置`来微调下列流式查询处理行为：

1. `enable_backfill_from_historical_store=0|1`. By default, if it's omitted, it's `1`.
   * 当它为0时，查询引擎要么从流存储中加载数据，要么从历史存储中加载数据。
   * 当它为1时，查询引擎会评估是否需要从历史存储中加载数据（例如时间范围在流式存储空间之外），或者从历史存储中获取数据的效率会更高（例如，count/min/max 是在历史存储中预先计算的，比在流式存储中扫描数据更快）。
2. `force_backfill_in_order=0|1`. By default, if it's omitted, it's `0`.
   1. When it's 0, the data from the historical storage are turned without extra sorting. This would improve the performance.
   2. When it's 1, the data from the historical storage are turned with extra sorting. This would decrease the performance. So turn on this flag carefully.

3. `emit_aggregated_during_backfill=0|1`. By default, if it's omitted, it's `0`.
   1. When it's 0, the query engine won't emit intermediate aggregation results during the historical data backfill.
   2. When it's 1, the query engine will emit intermediate aggregation results during the historical data backfill. This will ignore the `force_backfill_in_order` setting. As long as there are aggregation functions and time window functions(e.g. tumble/hop/session) in the streaming SQL, when the `emit_aggregated_during_backfill` is on, `force_backfill_in_order` will be applied to 1 automatically.
4. `query_mode=<table|streaming>` 默认情况下，如果省略，则为`streaming`。 一种常规设置，用于决定整体查询是流数据处理还是历史数据处理。 This can be overwritten in the port. If you use 3128, default is streaming. If you use 8123, default is historical.
5. `seek_to=<timestamp|earliest|latest>`. 默认情况下，如果省略，则为`latest`。 设置告诉Timeplus通过时间戳在流存储中查找旧数据。 它可以是相对的时间戳或绝对的时间戳。 默认情况下，是`latest`，表示了Timeplus不寻找旧数据。 例如:`seek_to='2022-01-12 06:00:00.000'`, `seek_to='-2h'`, 或 `seek_to='earliest'`

:::info

Please note, as of Jan 2023, we no longer recommend you use `SETTINGS seek_to=..`(except for [External Stream](external-stream)). 请使用`WHERE _tp_time>='2023-01-01'`或其他类似的。 `_tp_time` is the special timestamp column in each raw stream to represent the [event time](eventtime). 您可以使用 `>`, `<`, `BETWEEN... AND` operations to filter the data in Timeplus storage. 唯一的例外是[外部流](external-stream)。 If you need to scan all existing data in the Kafka topic, you need to run the SQL with seek_to, e.g. `select raw from my_ext_stream settings seek_to='earliest'`

:::



## PARTITION BY

`PARTITION BY` in Streaming SQL is to create [substreams](substream).

## 流式扫描

```sql
SELECT <expr>, <columns>
FROM <table_name>
[WHERE clause]
```

示例：

```sql
SELECT device, cpu_usage
FROM devices_utils
WHERE cpu_usage >= 99
```

The above example continuously evaluates the filter expression on the new events in the stream `device_utils` to filter out events which have `cpu_usage` less than 99. 最后的事件将会流向客户端。

## 全局流聚合 {#global}

在 Timeplus 中，我们将全局聚合定义为一个聚合查询，而不使用诸如tumble、hop等流式窗口。 不同于流式窗口聚合，全局流式聚合并不分割根据时间戳将未绑定的流式数据放入窗口， 相反，它作为一个巨大的全局窗口处理无界流数据。 由于这个属性，Timeplus现在不能根据时间戳为全局聚合回收的内存聚合状态/结果。

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <table_name>
[WHERE clause]
EMIT PERIODIC [<n><UNIT>]
```

`PERIODIC <n><UNIT>` 告诉Timeplus号定期发布聚合。 `UNIT` 可以是 ms（毫秒）、s（秒）、m（分钟）、h（小时）、d（天）。`<n>` 应为大于 0 的整数。

示例：

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
EMIT PERIODIC 5s
```

Like in [Streaming Tail](#streaming-tailing), Timeplus continuously monitors new events in the stream `device_utils`, does the filtering and then continuously does **incremental** count aggregation. Whenever the specified delay interval is up, project the current aggregation result to clients.

## 简易流窗口聚合 {#tumble}

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
```

简易窗口是指固定的非重叠时间窗口。 这是一个5秒tumble窗口的示例：

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:05", "2020-01-01 00:00:10]
["2020-01-01 00:00:10", "2020-01-01 00:00:15]
...
```

`tumble` window in Timeplus is left closed and right open `[)` meaning it includes all events which have timestamps **greater or equal** to the **lower bound** of the window, but **less** than the **upper bound** of the window.

`tumble` in the above SQL spec is a table function whose core responsibility is assigning tumble window to each event in a streaming way. The `tumble` table function will generate 2 new columns: `window_start, window_end` which correspond to the low and high bounds of a tumble window.

`tumble` 表格函数接受4个参数： `<timestamp_column>` 和 `<time-zone>` 是可选的，其他函数是强制性的。

当 `<timestamp_column>` 参数从查询中省略时，将使用该表的默认事件时间戳列，它是 `_tp_time`

当 `<time_zone>` 参数被省略时，系统的默认时区将被使用。 `<time_zone>` 是一个字符串类型的参数，例如 `UTC`。

`<tumble_window_size>` 是一个间隔参数： `<n><UNIT>` `<UNIT>` 支持 `s`, `m`, `h`, `d`, `w`. 它还不支持 `M`, `q`, `y`。 它还不支持 `M`, `q`, `y`。 例如： `tumble(my_table, 5s)`。

Timeplus支持tumble窗口的2个发射策略，所以 `<window_emit_policy>` 可以是：

1. `预留水印`: 集合结果将在水印观察后立即排放到客户端。 省略此条款时这是默认行为。
2. `预留水域和水域 <interval>`: 集合结果将在观察到水印后保存，直到指定的延迟到达为止。 用户可以对延迟使用间隔快捷键。 例如， `DELAY 5s`。

**注意** `水印` 是一个内部的时间戳，由Timeplus观察、计算和释放，用来表示流式窗口何时关闭。 保证每个流量查询都能增加单一流量。

示例：

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

上面的示例 SQL 持续聚合每个设备每个tumble窗口最大的 cpu 使用量，用于表 `设备 _utils`。 每次关闭一个窗口，Timeplus号发布聚合结果。

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WATERMARK DELAY 2s;
```

上面的示例 SQL 持续聚合每个设备对表 `设备 _utils` 的最大cpu 使用量。 Every time a window is closed, Timeplus waits for another 2 seconds and then emits the aggregation results.

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, timestamp, 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK DELAY 2s;
```

与上述延迟的tumble窗口聚合相同，但此查询除外； 用户指定 **特定时间列** `时间戳` 用于tumble窗口。

下面的例子是所谓的处理时间处理，它使用墙时钟时间分配窗口。 时间外挂内部以串流方式处理 `/现在64`。

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, now64(3, 'UTC'), 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK DELAY 2s;
```

## 滑动窗口聚合 {#hop}

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

## 最近若干时间处理

在流处理中，有一个典型的查询正在处理过去 X 秒/分钟/小时的数据。 例如，在过去 1 小时内显示每台设备的 cpu 使用量。 我们称这种类型的处理 `最后X 流处理` Timeplus和Timeplus提供专门的 SQL 扩展以便于使用： `EMIT LAST <n><UNIT>` 与流式查询的其他部分一样，用户可以在这里使用间隔快捷键。 与流式查询的其他部分一样，用户可以在这里使用间隔快捷键。

**现在请注意** 最后的 X 串流处理是默认的处理时间处理，Timeplus 将寻找流式存储器以在最后的 X 时间范围内回填数据，它正在使用墙时钟时间进行寻找。 基于事件时间的最后X处理仍在开发中。 当基于事件的最后X处理准备就绪时，默认的最后X处理将被更改为事件时间。

### 最近若干时间数据扫描

正在修改事件时间戳处于最后X范围内的事件。

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
```

示例：

```sql
SELECT *
FROM device_utils
WHERE cpu_usage > 80
EMIT LAST 5m
```

上面的示例过滤器事件在 `device_utils` 表中，其中 `cpu_usage` 大于80%，事件在过去 5 分钟内被添加。 在内部，Timeplus寻求流式存储回到5分钟(从现在起全时时间)并从那里压缩数据。

### 最近若干时间全局聚合

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

**注意** 内部Timeplus片段数据流到小窗口，并在每个小窗口和时间结束时进行聚合， 它滑出旧的小窗口，以保持整个时间窗口的固定并保持递增聚合的效率。 默认情况下，最大保留窗口是 100。 如果最后的 X 间隔非常大且周期性的发射间隔较小。 然后用户将需要明确设置一个较大的最大窗口： `last_x_interval / period_emit_interval`。

示例：

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 80
GROUP BY device
EMIT LAST 1h AND PERIODIC 5s
SETTINGS max_keep_windows=720;
```

### 最近若干时间窗口聚合

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM <streaming_window_function>(<table_name>, [<time_column>], [<window_size>], ...)

群组由...
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>

群组由...
EMIT LAST INTERVAL <n> <UNIT>
SETTINGS max_keep_windows=<window_count>

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

## 子查询

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

## JOINs

请查看[Joins](joins)。
