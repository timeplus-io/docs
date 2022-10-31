# 查询语法

## 串流SQL 语法{#select-syntax}

时间加载引入了几个SQL扩展来支持流媒体处理。 总的语法看起来像的

```sql
选择 <expr, columns, aggr>
来自 <streaming_window_function>(<table_name>, [<time_column>], [<window_size>], ...)
[即时条款]
[GROUP BY clause]
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
```

总体来说，时间plus中的流式查询建立了一个与客户端的长长HTTP/TCP连接，并且根据 `EMIT` 策略持续评估查询和流返回结果，直到结束客户端 中止查询或出现一些异常。 时间插件支持一些内部 `设置` 来微调流式查询处理行为。 以下是一份详尽无遗的清单。 我们将在下面的章节中再谈这些问题。

1. `query_mode=<table|streaming>` 总体查询是否为历史数据处理或流数据处理的常规设置。 默认情况下，是 `串流`。
3. `search_to=<timestamp|eariest|latest>` 一个设置，告诉TimePlus通过时间戳在流媒体存储中寻找旧数据。 它可以是相对的时间戳或绝对的时间戳。 默认情况下， `是最新` 表示不寻找旧数据。 例如：`search _to='2022-01-12 06:00:00:00'`, `search_to='-2h'`, 或 `search_to='eariest'`

### 正在串流

```sql
设置 <expr>, <columns>
ROM <table_name>
[WHERE 条款]
```

示例：

```sql
SELECT 设备，cpu_usage
FROM devices_utils
WHERE cpu_usage >= 99
```

上面的示例持续评估表 `device_utils` 中新事件的过滤器表达式，过滤事件 `cpu_usage` 小于99。 最后的事件将会流向客户端。

### 全局流聚合

在 Timeplus 中，我们将全球聚合定义为一个聚合查询，而不使用诸如肿瘤、跳跃等流媒体窗口。 不同于串流窗口聚合，全局流媒体聚合并不分割 根据时间戳将未绑定的流媒体数据放入窗口， 相反，它作为一个巨大的全球窗口处理无界流数据。 由于这个属性，时间plus现在不能 根据时间戳为全局聚合回收的内存聚合状态/结果。

```sql
选择 <column_name1>, <column_name2>, <aggr_function>
FROM <table_name>
[WHERE 条款]
EMIT PERIODIC [<n><UNIT>]
```

`PERIODIC <n><UNIT>` 告诉时间加号定期发布聚合。 `UNIT` 可以是 s(second), m(minute), hhour), d(day), w(week), M(week), M(month), q(quarter), y(y).`<n>` 应该是大于0的整数。

示例：

```sql
SELECT 设备，计数(*)
FROM device_utils
WHERE cpu_usage > 99
EMIT PERIODIC 5s
```

Like in [Streaming Tail](#streaming-tailing), Timeplus continuously monitors new events in the stream `device_utils`, does the filtering and then continuously does **incremental** count aggregation. 每当指定的延迟间隔为上，项目当前的聚合结果 到客户端。

### 简易流窗口聚合 {#tumble}

将无边界数据根据其参数混合成不同的窗户。 在内部，时间plus观察数据流，并自动决定何时 关闭一个分割窗口并释放该窗口的最终结果。

```sql
选择 <column_name1>, <column_name2>, <aggr_function>
FROM 肿瘤(<table_name>, [<timestamp_column>], <tumble_window_size>, [<time_zone>])
[WHERE 条款]
GROUP BY [window_start | wind], ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
```

简易窗口是指固定的非重叠时间窗口。 这是一个5秒肿瘤窗口的示例：

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:05", "2020-01-01 00:00:10]
["2020-01-01 00:00:10", "2020-01-01 00:00:15]
...
```

`tumble` window in Timeplus is left closed and right open `[)` meaning it includes all events which have timestamps **greater or equal** to the **lower bound** of the window, but **less** than the **upper bound** of the window.

`上述SQL spec中的肿瘤` 是一个表函数, 其核心责任是在 流媒体方式中为每个事件分配肿瘤窗口。 `肿瘤` 表函数将生成2个新列： `window_start, wind_end` 对应于低和高 圆形窗口的界限。

`肿瘤` 表格函数接受4个参数： `<timestamp_column>` 和 `<time-zone>` 是可选的，其他函数是强制性的。

当 `<timestamp_column>` 参数从查询中省略时，将使用该表的默认事件时间戳列，它是 `_tp_time`

当 `<time_zone>` 参数被省略时，系统的默认时区将被使用。 `<time_zone>` 是一个字符串类型的参数，例如 `UTC`。

`<tumble_window_size>` 是一个间隔参数： `<n><UNIT>` `<UNIT>` 支持 `s`, `m`, `h`, `d`, `w`. 它还不支持 `M`, `q`, `y`。 例如： `肿瘤(my_table, 5s)`。

时间plus支持肿瘤窗口的2个发射策略，所以 `<window_emit_policy>` 可以是：

1. `预留水印`: 集合结果将在水印观察后立即排放到客户端。 省略此条款时这是默认行为。
2. `预留水域和水域 <internval>`: 集合结果将在观察到水印后保存，直到指定的延迟到达为止。 用户可以对延迟使用间隔快捷键。 例如， `DELAY 5s`。

**注意** `水印` 是一个内部的时间戳，由时间plus观察、计算和释放，用来表示流媒体窗口何时关闭。 保证每个流量查询都能增加单一流量。

示例：

```sql
SELECT 设备, max(cpu_usage)
FROM tumblex(device_utils, 5s)
GROUP BY device, window_end
```

上面的示例 SQL 持续聚合每个设备每个肿瘤窗口最大的 cpu 使用量，用于表 `设备 _utils`。 每次关闭窗口 时，时间加号发布聚合结果。

```sql
SELECT 设备, max(cpu_usage)
FROM 肿瘤(device_utils, 5s)
GROUP BY 设备, widnow end
EMIT AFTER WATERMARK DELAY 2;
```

上面的示例 SQL 持续聚合每个设备对表 `设备 _utils` 的最大cpu 使用量。 每当窗口 被关闭时，时间plus等着2秒，然后发布聚合结果。

```sql
SELECT 设备, max(cpu_usage)
FROM 肿瘤(设备, 时间戳, 5s)
GROUP BY device, window _end
EMIT AFTER WATERMARK DELAY 2;
```

与上述延迟的肿瘤窗口聚合相同，但此查询除外； 用户指定 **特定时间列** `时间戳` 用于肿瘤窗口。

下面的例子是所谓的处理时间处理，它使用墙时钟时间分配窗口。 时间外挂内部以串流方式处理 `/现在64`。

```sql
SELECT 设备, max(cpu_usage)
FROM 肿瘤(设备, now64(3, 'UTC'), 5s)
GROUP BY 设备, window_end
EMIT AFTER WATERMARK DELAY 2;
```

### 热流窗口聚合 {#hop}

像 [Tumble](#tumble)一样，Hop也将无限流流量数据切片放入较小的窗口，它还有一个附加的滑动步骤。

```sql
选择 <column_name1>, <column_name2>, <aggr_function>
FROM chop(<table_name>, [<timestamp_column>], <hop_slide_size>, [hop_windows_size], [<time_zone>])
[WHERE 条款]
GROUP BY [<window_start | window_end>], ...
EMIT <window_emit_policy>
设置 <key1>=<value1>, <key2>=<value2>, ...
```

Hop窗口与肿瘤窗口相比是一个更加普遍化的窗口。 Hop窗口有一个额外的 参数，名为 `<hop_slide_size>` ，这意味着每次都要进这个幻灯片尺寸。 共有3起案件：

1. `<hop_slide_size>` 小于 `<hop_window_size>`. Hop窗口有重叠，意味着事件可能会进入几个节点窗口。
2. `<hop_slide_size>` 等于 `<hop_window_size>`。 衰落到肿瘤窗口。
3. `<hop_slide_size>` 大于 `<hop_window_size>`。 Windows之间有差距。 通常没有用处，因此迄今不予支持。

请注意此点。 您需要在 `<hop_slide_size>` 和 `<hop_window_size>`中使用相同的时间单位 例如 `hop(device_utils, 1s, 60s)` 代替 `hop(device_utils, 1s, 1m)`

这是一个 hop窗口示例，它有2秒的幻灯片和5秒的跳跃窗口。

```
["2020-01-01:00:00:00:00:00", "2020-01-01:00:00:00:00:00:00:00:05"
["2020-01-01:00:00:00:00:00:00:00:00:00:00", "2020-01-01:00:00,007"
["2020-01-01-00:00:00:00:00:00:00:00:00.09"
["2020-01-01:00:00:00:00:000.00.00", "2020-01-01:00:00000006", "202020-01-01:00:00:00:00:00:00:00:00:00:00:11］
...
```

除了这个跳跃窗口可能有重叠，其他语义与肿瘤窗口相同。

```sql
SELECT 设备，最大(cpu_usage)
FROM hop(device_utils, 2s, 5s)
GROUP BY device, window _end
EMIT AFTER WATERMARK;
```

上面的示例 SQL 持续聚合每个设备在表 `设备 _utils` 中的最大cpu 使用量。 每次关闭一个窗口，时间加号发布聚合结果。

### 最后X流处理

在串流处理中，有一个典型的查询正在处理过去 X 秒/分钟/小时的数据。 例如，在过去 1 小时内显示每台设备的 cpu 使用量。 我们称这种类型的处理 `最后X 流处理` 时间加载和时间加载提供专门的 SQL 扩展以便于使用： `EMIT LAST <n><UNIT>` 与流媒体查询的其他部分一样，用户可以在这里使用间隔快捷键。

**现在请注意** 最后的 X 串流处理是默认的处理时间处理，时间plus 将寻找流媒体存储器以在最后的 X 时间范围内回填数据，它正在使用墙时钟时间进行寻找。 基于事件时间的最后X处理仍在开发中。 当基于事件的最后X处理准备就绪时，默认的最后X处理将被更改为事件时间。

#### 最后X 尾迹

正在修改事件时间戳处于最后X范围内的事件。

```sql
选择 <column_name1>, <column_name2>, ...
来自 <table_name>
WERE <clause>
EMIT LAST INTERVAL <n> <UNIT>;
```

示例：

```sql
选择*
从设备中获取utils
WHERE cpu_usage > 80
EMIT LAST 5m
```

上面的示例过滤器事件在 `device_utils` 表中，其中 `cpu_usage` 大于80%，事件在过去 5 分钟内被添加。 在内部，时间plus寻求流媒体存储回到5分钟(从现在起全时时间)并从那里压缩数据。

#### 最后X 全球聚合

```sql
选择 <column_name1>, <column_name2>, <aggr_function>
FROM <table_name>
[WHERE 条款]
GROUP BY ...
EMIT LAST INTERVAL <n> <UNIT>
设置 max_keep_windows=<window_count>
```

**注意** 内部时间加片段数据流到小窗口，并在每个小窗口和时间结束时进行聚合， 它滑出旧的小窗口，以保持整个时间窗口的固定并保持递增聚合的效率。 默认情况下，最大保留窗口是 100。 如果最后的 X 间隔非常大且周期性的发射间隔较小。 然后用户将需要明确设置一个较大的最大窗口： `last_x_interval / period_emit_interval`。

示例：

```sql
SELECT device, count(*)
从device_utils
WHERE cpu_usage > 80
GROUP BY 设备
EMIT LAST 1h and PERIODIODIC 5s
设置最大窗口=720;
```

#### 最后X 窗口聚合

```sql
选择 <column_name1>, <column_name2>, <aggr_function>
FROM <streaming_window_function>(<table_name>, [<time_column>], [<window_size>], ...)

群组由...
EMIT LAST INTERVAL <n> <UNIT>
设置 max_keep_windows=<window_count>
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

### Subquery

#### Vanilla Subquery

原版子查询没有任何聚合(这是一个递归定义)，但可以任意数目的过滤预测、转换函数。 一些系统调用这个 `平坦地图`。

示例：

```sql
SELECT 设备，最大(cpu_usage)
ROM (
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- 原版子查询
) GROUP BY 设备；
```

Vanilla 子查询可以任意嵌套，直到达到Timeplus的系统限制。 外部父查询可以是任何正常的原版查询或窗口聚合或全局聚合。

用户也可以通过使用通用表表达式(CTE)样式来写查询。

```sql
用 AS(
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- 原版子查询
)
SELECT 设备 每台设备过滤过的 GROUP 最大值 (cpu_usage)；
```

在一个查询中可以定义多个CTE，例如：

```sql
使用 cte1 as (SELECT ...),
     cte2 as (SELECT ...)
选择... 从cte1 中选择... 从 Cte2    
```

不支持带列别名的 CTE。

#### 流媒体窗口聚合子查询

窗口合计子查询包含窗口聚合物。 有一些限制用户可以处理这类子查询。

1. 时间加载支持窗口聚合父查询对风聚合子查询的窗口聚合查询(跳过跳过跳过，肿瘤等)，但它只支持两个层次。 当在窗口聚合中设置窗口聚合时，请注意窗口大小：窗口
2. 时间插件支持在一个风能子查询上的多个外部全球聚合。 (现在不工作)
3. 时间plus允许任意对窗口子查询进行平坦转换(原版查询)，直到系统限制被触及。

示例：

```sql
— — 肿瘤形态的
与 (
    SELECT 设备，avg(cpu_usage) AS avg_usage， 任何(window_start) AS wind_start -- 肿瘤子查询
    FROM
      肿瘤(device_utils, 5s)
    GROUP BY 设备， window_start
) AS avg_5_second
SELECT device, max(avg_usage), window_end -- oututomble 聚合查询
FROM tumblex(avg_5_second, window _start, 10s)
GROUP BY device, window
```

```sql
— — 全局肿瘤了
SELECT 设备，max(avg_usage) — — 外部全球聚合查询
FROM
(
    SELECT 设备， avg(cpu_usage) AS avg_usage -- 肿瘤子查询
    FROM
        tomle(device_utils, 5s)
    GROUP BY device, window_start
) AS avg_5_second
GROUP BY device;
```

#### 全球聚合子查询

全球综合子查询包括全球汇总。 有一些限制用户可以处理全局总合子查询：

1. 时间plus支持全局聚合而不是全局聚合，它们可以是多个层次，直到达到系统限制为止。
2. 全局聚合的平面转换可以是多层次，直到系统限制被击中。
3. 不支持全局聚合的窗口聚合。

示例：

```sql
SELECT 设备，maxK(5)(avg_usage) -- 外部全局聚合查询
FROM
(
    SELECT 设备， avg(cpu_usage) AS avg_usage -- 全局聚合子查询
    FROM device_utils
    GROUP BY 设备
) AS avg_5_second;
```

### 流量和尺寸表加入{#stream_table_join}

在 Timeplus 中，所有数据都生活在流中，默认查询模式正在流中。 流流模式侧重于适合流媒体处理的最新实时尾部数据。 另一方面，历史重点是以往旧的索引数据，并且优化了大批处理，如太细胞扫描。 当一个查询正在对其运行时，流是默认模式。 要查询流的历史数据，可以使用 `table()` 函数。

有些典型的情况是，无约束的数据流需要通过连接到相对静态尺寸表来丰富。 时间plus可以在一个引擎中通过流媒体到维度表加入来存储流式数据和尺寸表。

示例：

```sql
SELECT device, vendor, cpu_usage, timeestamp
FROM device_utils
INNER JOIN table(device_products_info)
on device_utils.product_id = device_products_info.id
WHERE device_products_info._tp_time > '2020-01-01T01:01';
```

在上述例子中， 来自 `device_utils` 的数据是一个流，而来自 `device_products_info` 的数据是历史数据，因为它已经被标记 `table()` 函数。 对于来自 `device_utils`的每 (新) 行 它持续不断地加入了维度表 `device_products_info` 中的行，并用产品供应商信息丰富流数据。

串流到尺寸表的加入有一些限制

1. 加入中的左侧对象需要是一个串流。
2. 只支持INNER / LEFT 加入，用户只能做到这一点。
   1. `流` INNER JOIN `单个或多个维度表`
   2. `流` LEFT [OUTER] JOIN `单个或多个维度表`

### 流到串流连接 {#stream_stream_join}

:::info

这项实验性功能最近被引入beta方案。 请分享您在社区贫民窟中的反馈意见。

:::

在某些情况下，实时数据流向多个数据流。 例如，当广告展示给最终用户时，当用户点击广告时。 时间plus允许您对多个数据流进行关联搜索。 当用户点击广告后，您可以检查平均时间。

```sql
选择... 从流 1
INNER JOIN 流
开启串流. id=stream2.id 和 data_diff_with(1m)
WHERE ...
```

您也可以加入一个流到自己。 一个典型的使用情况是检查同一流中数据是否有某种模式，例如： 是否在两分钟内购买相同的信用卡。小规模购买后有大宗购买。 这可能是一种欺诈模式。

```sql
选择... 从流 1
INNER JOIN 串行1 as stream2
on stream.id=stream2.id and data_diff_with(1m)
WHER...
```

