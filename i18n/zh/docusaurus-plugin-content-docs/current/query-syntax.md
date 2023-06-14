# 查询语法

## 串流SQL 语法{#select-syntax}

Timeplus引入了几个SQL扩展来支持流式处理。 总的语法看起来像的

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
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
```

总体来说，Timeplus中的流式查询建立了一个与客户端的长长HTTP/TCP连接，并且根据 `EMIT` 策略持续评估查询和流返回结果，直到结束客户端 中止查询或出现一些异常。 时间插件支持一些内部 `设置` 来微调流式查询处理行为。 以下是一份详尽无遗的清单。 我们将在下面的章节中再谈这些问题。

1. `query_mode=<table|streaming>` 总体查询是否为历史数据处理或流数据处理的常规设置。 默认情况下，是 `串流`。
2. `seek_to=<timestamp|earliest|latest>`. A setting which tells Timeplus to seek old data in streaming storage by a timestamp. It can be a relative timestamp or an absolute timestamp. 默认情况下， `是最新` 表示不寻找旧数据。 Example:`seek_to='2022-01-12 06:00:00.000'`, `seek_to='-2h'`, or `seek_to='earliest'`

:::info

请注意，自2023年1月起， `SETTINGS seek_to=..` 不再被推荐使用。 请使用 `WHERE _tp_time>='2023-01-01'` 或类似的WHERE条件。 `_tp_time` 是每个原始流中的特殊时间戳列，用于表示事件时间。 您可以使用 `>`, `<`, `BETWEEN... 您可以使用 <code>>`, `<`, `BETWEEN... AND` 操作用于筛选 Timeplus 流存储中的数据。

:::

### 流式扫描

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

上面的示例持续评估表 `device_utils` 中新事件的过滤器表达式，过滤事件 `cpu_usage` 小于99。 最后的事件将会流向客户端。

### 全局流聚合 {#global}

In Timeplus, we define global aggregation as an aggregation query without using streaming windows like tumble, hop. 不同于串流窗口聚合，全局流式聚合并不分割 根据时间戳将未绑定的流式数据放入窗口， 相反，它作为一个巨大的全球窗口处理无界流数据。 由于这个属性，Timeplus现在不能 根据时间戳为全局聚合回收的内存聚合状态/结果。

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

正如 [流式扫描](#streaming-tailing), Timeplus持续监控数据流`device_utils`, 不断过滤和 **增量**计数 每当指定的延迟间隔为上，项目当前的聚合结果 到客户端。 每当指定的延迟间隔为上，项目当前的聚合结果 到客户端。

### 简易流窗口聚合 {#tumble}

将无边界数据根据其参数混合成不同的窗户。 在内部，Timeplus观察数据流，并自动决定何时 关闭一个分割窗口并释放该窗口的最终结果。

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

Timeplus中的`tumble` 窗口左闭右开 `[)` meaning it includes all events which have timestamps **greater or equal** to the **lower bound** of the window, but **less** than the **upper bound** of the window.

`上述SQL spec中的tumble` 是一个表函数, 其核心责任是在 流式方式中为每个事件分配tumble窗口。 `tumble` 表函数将生成2个新列： `window_start, wind_end` 对应于低和高 圆形窗口的界限。

`tumble` 表格函数接受4个参数： `<timestamp_column>` 和 `<time-zone>` 是可选的，其他函数是强制性的。

When the `<timestamp_column>` parameter is omitted from the query, the table's default event timestamp column which is `_tp_time` will be used.

When the `<time_zone>` parameter is omitted the system's default timezone will be used. `<time_zone>` 是一个字符串类型的参数，例如 `UTC`。

`<tumble_window_size>` 是一个间隔参数： `<n><UNIT>` `<UNIT>` 支持 `s`, `m`, `h`, `d`, `w`. 它还不支持 `M`, `q`, `y`。 它还不支持 `M`, `q`, `y`。 例如： `tumble(my_table, 5s)`。

Timeplus支持tumble窗口的2个发射策略，所以 `<window_emit_policy>` 可以是：

1. `AFTER WATERMARK`: aggregation results will be emitted and pushed to clients right after a watermark is observed. This is the default behavior when this clause is omitted.
2. `AFTER WATERMARK AND DELAY <interval>`: aggregation results will be held after the watermark is observed until the specified delay reaches. 用户可以对延迟使用间隔快捷键。 例如， `DELAY 5s`。

**注意** `水印` 是一个内部的时间戳，由Timeplus观察、计算和释放，用来表示流式窗口何时关闭。 保证每个流量查询都能增加单一流量。

示例：

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

上面的示例 SQL 持续聚合每个设备每个tumble窗口最大的 cpu 使用量，用于表 `设备 _utils`。 每次关闭窗口 时，Timeplus号发布聚合结果。

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WATERMARK DELAY 2s;
```

上面的示例 SQL 持续聚合每个设备对表 `设备 _utils` 的最大cpu 使用量。 每当窗口 被关闭时，Timeplus等着2秒，然后发布聚合结果。

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

### 热流窗口聚合 {#hop}

Like [Tumble](#tumble), Hop also slices the unbounded streaming data into smaller windows, and it has an additional sliding step.

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

Hop window is a more generalized window compared to tumble window. Hop window has an additional parameter called `<hop_slide_size>` which means window progresses this slide size every time. 共有3起案件：

1. `<hop_slide_size>` 等于 `<hop_window_size>`。 衰落到tumble窗口。
2. `<hop_slide_size>` 小于 `<hop_window_size>`. Hop窗口有重叠，意味着事件可能会进入几个节点窗口。 衰落到tumble窗口。
3. `<hop_slide_size>` 大于 `<hop_window_size>`。 Windows has a gap in between. 通常没有用处，因此迄今不予支持。

请注意此点。 您需要在 `<hop_slide_size>` 和 `<hop_window_size>`中使用相同的时间单位 例如 `hop(device_utils, 1s, 60s)` 代替 `hop(device_utils, 1s, 1m)`

这是一个 hop窗口示例，它有2秒的幻灯片和5秒的跳跃窗口。

```
["2020-01-01:00:00:00:00:00", "2020-01-01:00:00:00:00:00:00:00:05"
["2020-01-01:00:00:00:00:00:00:00:00:00:00", "2020-01-01:00:00,007"
["2020-01-01-00:00:00:00:00:00:00:00:00.09"
["2020-01-01:00:00:00:00:000.00.00", "2020-01-01:00:00000006", "202020-01-01:00:00:00:00:00:00:00:00:00:00:11］
...
```

Except that the hop window can have overlaps, other semantics are identical to the tumble window.

```sql
SELECT device, max(cpu_usage)
FROM hop(device_utils, 2s, 5s)
GROUP BY device, window_end
EMIT AFTER WATERMARK;
```

上面的示例 SQL 持续聚合每个设备在表 `设备 _utils` 中的最大cpu 使用量。 每次关闭一个窗口，Timeplus号发布聚合结果。

### 最后X流处理

In streaming processing, there is one typical query which is processing the last X seconds / minutes / hours of data. 例如，在过去 1 小时内显示每台设备的 cpu 使用量。 We call this type of processing `Last X Streaming Processing` in Timeplus and Timeplus provides a specialized SQL extension for ease of use: `EMIT LAST <n><UNIT>`. As in other parts of streaming queries, users can use interval shortcuts here.

**现在请注意** 最后的 X 串流处理是默认的处理时间处理，Timeplus 将寻找流式存储器以在最后的 X 时间范围内回填数据，它正在使用墙时钟时间进行寻找。 Event time based on last X processing is still under development. 当基于事件的最后X处理准备就绪时，默认的最后X处理将被更改为事件时间。

#### 最后X 尾迹

Tailing events whose event timestamps are in the last X range.

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

The above example filters events in the `device_utils` table where `cpu_usage` is greater than 80% and events are appended in the last 5 minutes. 在内部，Timeplus寻求流式存储回到5分钟(从现在起全时时间)并从那里压缩数据。

#### 最后X 全球聚合

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

**注意** 内部Timeplus片段数据流到小窗口，并在每个小窗口和时间结束时进行聚合， 它滑出旧的小窗口，以保持整个时间窗口的固定并保持递增聚合的效率。 默认情况下，最大保留窗口是 100。 If the last X interval is very big and the periodic emit interval is small, then users will need to explicitly set up a bigger max window : `last_x_interval / periodic_emit_interval`.

示例：

```sql
SELECT device, count(*)
FROM device_utils
WHERE cpu_usage > 80
GROUP BY device
EMIT LAST 1h AND PERIODIC 5s
SETTINGS max_keep_windows=720;
```

#### 最后X 窗口聚合

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

Similarly, we can apply the last X on hopping window.

### Subquery

#### Vanilla Subquery

原版子查询没有任何聚合(这是一个递归定义)，但可以任意数目的过滤预测、转换函数。 一些系统调用这个 `平坦地图`。

示例：

```sql
SELECT device, max(cpu_usage)
FROM (
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
) GROUP BY device;
```

Vanilla subquery can be arbitrarily nested until Timeplus's system limit is hit. 外部父查询可以是任何正常的原版查询或窗口聚合或全局聚合。

Users can also write the query by using Common Table Expression (CTE) style.

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

#### 流式窗口聚合子查询

窗口合计子查询包含窗口聚合物。 有一些限制用户可以处理这类子查询。

1. Timeplus支持窗口聚合父查询对风聚合子查询的窗口聚合查询(跳过跳过跳过，tumble等)，但它只支持两个层次。 当在窗口聚合中设置窗口聚合时，请注意窗口大小：窗口
2. 时间插件支持在一个风能子查询上的多个外部全球聚合。 (现在不工作)
3. Timeplus允许任意对窗口子查询进行平坦转换(原版查询)，直到系统限制被触及。

示例：

```sql
-- tumble over tumble
WITH (
    SELECT device, avg(cpu_usage) AS avg_usage, any(window_start) AS window_start -- tumble subquery
    FROM
      tumble(device_utils, 5s)
    GROUP BY device, window_start
) AS avg_5_second
SELECT device, max(avg_usage), window_end -- outer tumble aggregation query
FROM tumble(avg_5_second, window_start, 10s)
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

#### 全球聚合子查询

全球综合子查询包括全球汇总。 有一些限制用户可以处理全局总合子查询：

1. Timeplus supports global over global aggregation and there can be multiple levels until a system limit is hit.
2. 全局聚合的平面转换可以是多层次，直到系统限制被击中。
3. 不支持全局聚合的窗口聚合。

示例：

```sql
SELECT device, maxK(5)(avg_usage) -- outer global aggregation query
FROM
(
    SELECT device, avg(cpu_usage) AS avg_usage -- global aggregation subquery
    FROM device_utils
    GROUP BY device
) AS avg_5_second;
```

### 流量和尺寸表加入{#stream_table_join}

在 Timeplus 中，所有数据都生活在流中，默认查询模式正在流中。 Streaming mode focuses on the latest real-time tail data which is suitable for streaming processing. On the other hand, historical focuses on the old indexed data in the past and optimized for big batch processing like terabytes large scans. 当一个查询正在对其运行时，流是默认模式。 要查询流的历史数据，可以使用 `table()` 函数。

There are typical cases that an unbounded data stream needs enrichment by connecting to a relative static dimension table. Timeplus can do this in one single engine by storing streaming data and dimension tables in it via a streaming to dimension table join.

示例：

```sql
SELECT device, vendor, cpu_usage, timeestamp
FROM device_utils
INNER JOIN table(device_products_info)
on device_utils.product_id = device_products_info.id
WHERE device_products_info._tp_time > '2020-01-01T01:01';
```

在上述例子中， 来自 `device_utils` 的数据是一个流，而来自 `device_products_info` 的数据是历史数据，因为它已经被标记 `table()` 函数。 For every (new) row from `device_utils`, it is continuously (hashed) joined with rows from dimension table `device_products_info` and enriches the streaming data with product vendor information.

串流到尺寸表的加入有一些限制

1. 加入中的左侧对象需要是一个串流。
2. 只支持INNER / LEFT 加入，用户只能做到这一点。
   1. `流` INNER JOIN `单个或多个维度表`
   2. `流` LEFT [OUTER] JOIN `单个或多个维度表`

### 流到串流连接 {#stream_stream_join}

In some cases, the real-time data flows to multiple data streams. 例如，当广告展示给最终用户时，当用户点击广告时。 Timeplus允许您对多个数据流进行关联搜索。 当用户点击广告后，您可以检查平均时间。

```sql
选择... 选择... FROM stream1
INNER JOIN stream2
ON stream1.id=stream2.id AND date_diff_within(1m)
WHERE ..
```

您也可以加入一个流到自己。 一个典型的使用情况是检查同一流中数据是否有某种模式，例如： 是否在两分钟内购买相同的信用卡。 小规模购买后有大宗购买。 这可能是一种欺诈模式。

```sql
选择... 选择... FROM stream1
INNER JOIN stream1 AS stream2
ON stream1.id=stream2.id AND date_diff_within(1m)
WHERE ..
```

Timeplus 支持多种类型的JOIN：

* 常见是 `INNER JOIN`, `LEFT JOIN`, `Right JOIN`, `FULL JOIN`.
* A special `CROSS JOIN`, which produces the full cartesian product of the two streams without considering join keys. 左侧流中的每一行与右侧流的每一行合并在一起。
* 特殊的 `ASOF JOIN` 提供非精确匹配功能。 This can work well if two streams have the same id, but not with exactly the same timestamps.
* 特别的 `LATEST JOIN`.  For two append-only streams, if you use `a INNER LATEST JOIN b on a.key=b.key`, any time when the key changes on either stream, the previous join result will be canceled and a new result will be added.



更多细节：

#### LATEST JOIN {#latest-join}

例如，您创建了 2 个仅限追加的流（Timeplus 中的默认流类型）

* 流 `left`，有两列：id（整数）、name（字符串）
* 流 `right`，有两列：id（整数）、amount（整数）

然后你运行流式SQL

```sql
SELECT *, _tp_delta FROM left LATEST JOIN right USING(id)
```

备注：

1.  `using (id)` 是 `on left.id=right.id`的快捷语法
2. _tp_delta 是仅在变更日志流中可用的特殊列。

然后，您可以向两个流中添加一些事件。

| 添加数据                               | SQL 结果                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 添加一行到 `left` (id=100, name=apple)  | 没有结果                                                                                                                           |
| 添加一行到 `right` (id=100, amount=100) | 1. id=100, name=apple, amount=100, _tp_delta=1                                                                               |
| 添加一行到 `right` (id=100, amount=200) | （新增2 行）<br />2. id=100, name=apple, amount=100,_tp_delta=-1<br />3. id=100, name=apple, amount=200,_tp_delta=1 |
| 添加一行到 `left` (id=100, name=apple)  | （新增2 行）<br />4. id=100, name=apple, amount=200,_tp_delta=-1<br />5. id=100, name=appl, amount=200,_tp_delta=1  |

If you run an aggregation function, say `count(*)` with such INNER LATEST JOIN, the result will always be 1, no matter how many times the value with the same key is changed.
