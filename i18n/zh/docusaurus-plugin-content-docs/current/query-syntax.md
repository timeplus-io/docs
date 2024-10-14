# 查询语法

Timeplus introduces several SQL extensions to support streaming processing. 总的语法如下：

```sql
[使用 common_table_expression...]
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
[OFFSET n]
[EMIT emit_policy]
[SETTINGS <key1>=<value1>, <key2>=<value2>, ...]
```

只有 `SELECT` 和 `FROM` 条款是必填的（你甚至可以省略 `FORM`，比如 `SELECT now ()`，但它不太实用）。 `[...] 中的其他条款` 是可选的。 We will talk about them one by one in the reverse order, i.e. [SETTINGS](/query-syntax#settings), then [EMIT](/query-syntax#emit), [LIMIT](/query-syntax#limit), etc.

SQL 关键字和函数名不区分大小写，而列名和流名称区分大小写。

## 流式传输优先查询行为 {#streaming_first}

在我们研究查询语法的细节之前，我们想重点介绍一下 Timeplus Proton 中的默认查询行为是流模式，即

- `选择... FROM stream` 将查询未来的事件。 运行查询后，它将处理新事件。 例如，如果流中已经有 1,000 个事件，则如果还有更多新事件，则运行 `SELECT count () FROM Stream` 可能会返回 0。
- `选择... FROM 表（流）` 将查询历史数据，就像许多其他数据库一样。 在上面的示例流中，如果你运行 `SELECT count () FROM table (stream)`，你将得到 1000 作为结果并且查询完成。

## Query Settings

Timeplus 支持一些高级 `设置` 来微调流式查询处理行为。 Check [Query Settings](/query-settings).

## 发出{#emit}

作为一项高级功能，Timeplus Proton支持各种策略，以在流式查询期间发出结果。

语法是：

```sql
发出
 [在水印之后 [有延迟 <interval>]
 [定期 <interval>]
 [更新时]
  -[[和] TIMEOUT <interval>]
  -[[和] 最后一个 <interval> [ON PROCTIME]]
```

请注意，Proton 1.5 中添加了一些政策，与 1.4 或更早版本不兼容。

### 在水印后发出 {#emit_after_wm}

您可以省略 `在水印`之后发出，因为这是时间窗聚合的默认行为。 例如：

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

上面的示例 SQL 连续汇总了流 `devices_utils`的每个滚动窗口中每台设备的最大 CPU 使用量。 每次关闭窗口时，Timeplus Proton都会发布聚合结果。 如何确定窗户应该关闭？ This is done by [Watermark](/stream-query#window-watermark), which is an internal timestamp. 保证每个流量查询都能增加单一流量。

### 延迟在水印后发出 {#emit_after_wm_with_delay}

:::warning

在 Proton 1.5 之前，语法是 `EMIT AFTER WATERMARK AND DELAY`。 从 Proton 1.5 开始，我们使用 `WITH DELAY` 而不是 `和 DELAY`，以便将 `和` 作为组合多个发射策略的关键字。

:::

示例：

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WATERMARK DELAY 2s;
```

上面的示例 SQL 持续聚合每个设备对表 `设备 _utils` 的最大cpu 使用量。 Every time a window is closed, Timeplus waits for another 2 seconds and then emits the aggregation results.

### 定期发射 {#emit_periodic}

`PERIODIC <n><UNIT>` 告诉 Proton 定期发出聚合。 `UNIT` 可以是 ms（毫秒）、s（秒）、m（分钟）、h（小时）、d（天）。`<n>` 应为大于 0 的整数。

示例：

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 99
EMIT PERIODIC 5s
```

对于 [Global Streaming Aggregation](#global) ，默认的周期性发射间隔为 `2s`，即 2 秒。

从 Proton 1.5 开始，你还可以在时间窗中应用 `EMIT PERIODIC` ，例如翻滚/跳跃/会话。

当你运行 tumble 窗口聚合时，默认情况下，Proton 将在窗口关闭时发出结果。 因此 `tumble (stream,5s)` 将每 5 秒发出一次结果，除非窗口中没有事件可以处理水印。

在某些情况下，即使窗口未关闭，您也可能希望获得聚合结果，以便及时收到警报。 例如，以下 SQL 将运行一个 5 秒的 tumble 窗口，如果事件数量超过 300，则每 1 秒就会发出一行。

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

### 更新时发出 {#emit_on_update}

:::info

这是 Proton 1.5 中添加的一项新排放政策。

:::

从 Proton 1.5 开始，你可以使用 `GROUP BY` 键在时间窗口（例如 tumble/hop/session）中应用 `EMIT ON UPDATE` 。 例如：

```sql
从
  tumble（car_live_data，5s）中选择
  window_start、cid、count () 作为 cnt

WHERE
  cid IN ('c00033'、'c00022')
分组 BY
  window_start，cid
更新时发出
```

在 5 秒的 tumble 窗口期间，即使窗口没有关闭，只要相同 `cid` 的聚合值 (`cnt`) 不同，就会发出结果。

### 定期发射... 更新时 {#emit_periodic_on_update}

:::info

这是 Proton 1.5 中添加的一项新排放政策。

:::

你可以将 `EMIT PERIODIAL` 和 `更新时发射` 组合在一起。 在这种情况下，即使窗口没有关闭，Proton 也会按指定的间隔检查中间聚合结果，如果结果发生变化，则发出行。

### 发射超时{#emit_timeout}

对于基于时间窗的聚合，窗口的关闭时间由水印决定。 窗口外的新事件将推进水印处理，并通知查询引擎关闭前一个窗口并发出聚合结果。

假设你在时间窗口内只有一个赛事。 由于没有更多的事件，水印无法移动，因此窗口不会关闭。

`EMIT TIMEOUT` 是强制关闭窗口，在看到最后一个事件后超时。

请注意，如果数据流中或时间窗口中没有单个事件，Proton 将不会发出结果。 例如，在以下 SQL 中，你不会得到 0 作为计数：

```sql
选择 window_start，count () 作为从 tumble 开始计数 (stream,2s)
按 window_start 分组
```

即使你在 SQL 中添加了 `EMIT TIMEOUT` ，它也不会触发超时，因为查询引擎在窗口中看不到任何事件。 如果您需要在某个时间窗口内检测此类缺失事件，一种解决方法是创建一个心跳流，并使用 `UNION` 创建一个子查询，将心跳流和目标流合并到一个时间窗内，如果所有观测到的事件都来自心跳流，这意味着目标流中没有事件。 请在社区 slack 中与我们讨论更多内容。

### 最后发出

在流处理中，有一个典型的查询正在处理过去 X 秒/分钟/小时的数据。 例如，在过去 1 小时内显示每台设备的 cpu 使用量。 我们称这种类型的处理 `最后X 流处理` Timeplus和Timeplus提供专门的 SQL 扩展以便于使用： `EMIT LAST <n><UNIT>` 与流式查询的其他部分一样，用户可以在这里使用间隔快捷键。 与流式查询的其他部分一样，用户可以在这里使用间隔快捷键。

:::info

默认情况下， `EMIT LAST` 使用事件时间。 Timeplus Proton将同时寻找流存储空间和历史存储空间，以回填最近X个时间范围内的数据。 `最后发射... ON PROCTIME` 使用挂钟时间进行搜索。

:::

#### 最后发出 Streaming Tail

正在修改事件时间戳处于最后X范围内的事件。

子查询

```sql
SELECT *
FROM device_utils
WHERE cpu_usage > 80
EMIT LAST 5m
```

上面的示例过滤器事件在 `device_utils` 表中，其中 `cpu_usage` 大于80%，事件在过去 5 分钟内被添加。 在内部，Timeplus寻求流式存储回到5分钟(从现在起全时时间)并从那里压缩数据。

#### 发出 LAST 以进行全局聚合

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

#### 为窗口聚合发出 LAST

```sql
从 <streaming_window_function>(<stream_name>, [<time_column>], [<window_size>],...) 中选择 <column_name1>, <column_name2>, <aggr_function>


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

## 分割依据

`PARTITION BY` in Streaming SQL is to create [substreams](/substream).

## 分组依据并拥有 {#group_having}

`GROUP BY` 对 1 个或更多列应用聚合。

当应用 `GROUP BY` 时，可以选择 `HAVING` 来筛选聚合结果。 `WHERE` 和`HAVING` 的区别在于，数据将首先按 `WHERE` 子句过滤，然后应用 `GROUP BY`，最后应用 `HAVING`。

## LIMIT
`LIMIT n` When the nth result is emitted, the query will stop, even it's a streaming SQL.

### OFFSET
You can combine LIMIT and OFFSET, such as:
```sql
SELECT * FROM table(stream) ORDER BY a LIMIT 3 OFFSET 1
```
This will fetch the 3 rows from the 2nd smallest value of `a`.

## JOINs

Please check [Joins](/joins).

## WITH CTE

CTE（公用表表达式）是在主 SELECT 子句之前逐一定义 [子查询](#subquery) 的便捷方法。

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

Vanilla subquery can be arbitrarily nested until Timeplus' system limit is hit. 外部父查询可以是任何正常的原版查询或窗口聚合或全局聚合。

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

Like in [Streaming Tail](#streaming-tailing), Timeplus continuously monitors new events in the stream `device_utils`, does the filtering and then continuously does **incremental** count aggregation. Whenever the specified delay interval is up, project the current aggregation result to clients. 每当指定的延迟间隔达到时，都会将当前聚合结果投影到客户端。

### 简易流窗口聚合 {#tumble}

将无边界数据根据其参数混合成不同的窗户。 在内部，Timeplus观察数据流，并自动决定何时关闭切片窗口并发布该窗口的最终结果。

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

Timeplus 中的 `tumble` 窗口左关右开 `[)` 这意味着它包括所有时间戳 **大于或等于窗口的 **下限** 的事件 **** ** **窗口的上界** 。

`tumble` in the above SQL spec is a table function whose core responsibility is assigning tumble window to each event in a streaming way. The `tumble` table function will generate 2 new columns: `window_start, window_end` which correspond to the low and high bounds of a tumble window. `tumble` 表函数将生成 2 个新列： `window_start、window_end` ，它们对应于滚动窗口的低界和高界。

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

让我们把 `tumble（流，5s）` 改成 `tumble（流，timestmap，5s）` ：

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

### 会话流窗口聚合

这类似于 tumble and hop 窗口。 Please check the [session](/functions_for_streaming#session) function.
