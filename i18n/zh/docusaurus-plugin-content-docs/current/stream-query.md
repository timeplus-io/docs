# 流查询

## 查询默认不受限制

默认情况下，Timeplus的查询行为不同于传统的 SQL ，后者回答了发生的问题。 而是这样。 Timeplus的查询试图回答目前正在实时发生的事情的问题，并在新事件进入系统时不断更新答案。

Timeplus查询正在运行于一个无边界流中。 在大多数情况下，除非用户取消查询，否则查询不会停止。 例如，下面的查询将在执行查询后实时返回输入Timeplus系统的流中的所有事件。 每个新事件将触发一个新的查询结果。 除非用户取消查询，这个查询不会停止。

```sql
select * from my_stream
```

无边界查询可以通过应用函数 [table()](functions#table), 转换为有边界的查询。 当用户想要询问像传统的 SQL 一样发生了什么情况。 Table() 函数可以用于装饰流. 例如，下面的查询将返回在执行查询时在流中已存在的所有事件。 一旦所有结果被退回用户，查询将会终止，它不会等待新的事件。

```sql
select * from table(my_stream)
```

## 如何触发串流查询

基于数据如何汇总的流式查询分为三类。

| 类别   | 描述                   | 触发者          |
| ---- | -------------------- | ------------ |
| 非聚合  | 每个事件处理，例如尾、过滤、转换/正常化 | 事件到达时        |
| 窗口聚合 | 在同一窗口中分组事件           | 窗口尾部和水标记     |
| 全球聚合 | 从现在开始一直持续到           | 固定间隔，默认每 2 秒 |

如果您看到一些新的词句，请不要担心。 让我们更多地探索它们。

### 非聚合

汇总是将不同事件的数据合并为一个或多个新数据的过程。 有些查询不涉及任何聚合，例如：

#### Tail

列出所有收到的数据，例如：

```sql
select * from my_stream
```

#### 筛选

只显示特定列或数据匹配特定模式，如：

```sql
select c1,c2 from weblogs where http_code>=400
```

#### 变换

对于每个事件，转换数据以删除敏感信息，或转换类型，如：

```sql
select 
concat(first_name,' ', last_name) as full_name,
replace_regex(phone,'(\\d{3})-(\\d{3})-(\\d{4})','\\1-***-****') as phone 
from user_activities
```


非聚合每个事件到达时都会触发，这意味着每次有一个新事件进入Timeplus时都会触发。 查询将使用新事件执行相关分析，分析结果将被触发并发送到客户端。

### 窗口聚合

基于窗口的聚合是流分析中典型的分析方法。 每个窗口都有一个固定范围，有一个特定的开始时间和结束时间。 窗口可能在分析过程中通过固定步骤移动。 分析结果将以这一窗口范围内所有事件的汇总功能为基础。

当使用窗口函数进行聚合时，事件时间用于决定事件是否在该窗口中。 如果用户没有指定时间戳，将使用默认时间。 用户也可以在此事件中使用任何字段作为日期时间类型作为时间戳或动态生成日期时间字段作为时间戳。

两个典型的窗口函数是 [tumble](functions#tumble) 和 [钩](functions#hop)。

例如：

```sql
select window_start, window_end, count(*) as count, max(c1) as max_c1
from tumble(my_stream,order_time, 5s) group by window_start, window_end
```

#### 窗口水位线

窗口聚合按窗口触发。 Timeplus有一个内部水印机制，用以检查特定窗口中的所有事件是否已经到达。 一旦水印表明该窗口中的所有事件都可用，总合分析结果将会被触发并发送给客户。

#### 水印和延迟

对于更高级的场景，您可以添加触发策略的延迟。 例如添加2秒的延迟，以便在每个时间窗口中考虑更多的延迟事件。

```sql
select window_start, window_end, count(*) as count, max(c1) as max_c1
from tumble(my_stream,order_time, 5s) group by window_start, window_end
emit after watermark delay 2s
```

### 全局聚合

自查询提交以来，全局聚合将启动所有传入事件的聚合，永远不会结束。

例如，如果用户想知道实时的总数事件：

```sql
select count(*) from my_stream
```

#### 设置触发间隔

定期触发全局聚合(默认，每2秒)。 用户可以在查询语句中指定间隔。

一个更复杂的例子是：

```sql
select count(*) from my_stream where type='order'
emit periodic 5s
```



