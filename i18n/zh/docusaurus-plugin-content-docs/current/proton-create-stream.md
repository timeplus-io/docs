# 流

::: Timeplus Cloud 用户须知

在 Timeplus Cloud 或 Timeplus Enterprise 部署中，我们建议你使用 GUI 或 [Terraform Provider](terraform)创建直播，因为它们具有更好的可用性和更多的功能。

:::

## 创建直播

[Stream](working-with-streams) 是 Timeplus Proton 中的一个关键 [概念](glossary) 。 所有数据都存在于流中，无论是静态数据还是动态数据。 我们不建议你在 Proton 中创建或管理 `TABLE` 。

### 仅限追加的直播

默认情况下，这些流是仅附加且不可变的。 By default, the streams are append-only and immutable. You can create a stream, then use `INSERT INTO` to add data.

语法：

```sql
创建流 [如果不存在] [db.]<stream_name>
(
    <col_name1> <col_type_1> [默认 <col_expr_1>] [compression_codec_1],
    <col_name1> <col_type_2> [DEFAULT <col_expr_2>] [compression_codec_2]
) 设置
 <event_time_column>='<col>', <key1>=<value1>, <key2>=<value2>,...
```

:::info

直播创建是一个异步过程。

:::

如果省略数据库名称，则将使用 `默认` 。 If you omit the database name, `default` will be used. Stream name can be any utf-8 characters and needs backtick quoted if there are spaces in between. Column name can be any utf-8 characters and needs backtick quoted if there are spaces in between. 列名可以是任何 utf-8 字符，如果两者之间有空格，则需要反引号。

#### 数据类型

Proton 支持以下列类型

1. int8/16/32/64/128/256
2. uint8/16/32/64/128/256
3. boolean
4. 十进制（精度、小数位数）：精度的有效范围是 [1：76]，小数位数的有效范围是 [0：精度]
5. float32/64
6. 日期
7. 日期时间
8. dateTime64（精度，[time_zone]）
9. 字符串
10. fixed_string (N)
11. 数组 (T)
12. uuid

#### 活动时间

In Timeplus, each stream with a `_tp_time` as [Event Time](eventtime). If you don't create the `_tp_time` column when you create the stream, the system will create such a column for you, with `now64()` as the default value. You can also choose a column as the event time, using 如果您在创建直播时没有创建 `_tp_time` 列，则系统将为您创建这样的列，默认值为 `now64 ()` 。 您也可以选择一列作为事件时间，使用

```sql
设置 event_time_column='my_datetime_column'
```

 它可以是任何导致 datetime64 类型的 SQL 表达式。

#### 保留政策

Proton 支持保留政策，可自动从流中删除过时的数据。

##### 用于历史存储

质子利用ClickHouse TTL表达式来制定历史数据的保留政策。 Proton leverages ClickHouse TTL expression for the retention policy of historical data. When you create the stream, you can add `TTL to_datetime(_tp_time) + INTERVAL 12 HOUR` to remove older events based a specific datetime column and retention period.

##### 用于流媒体存储

Today it's not exposed in SQL to control the retention policies for streaming storage. In Timeplus Cloud, you can set them via 在 Timeplus Cloud 中，你可以通过以下方式进行设置

* logstore_retention_bytes
* logstore_retention_ms

### 多版本流

[Versioned Stream](versioned-stream) allows you to specify the primary key(s) and focus on the latest value. 例如： 例如：

```sql
创建 STREAM versioned_kv（i int，k 字符串，k1 字符串） 
主键 (k, k1) 
设置模式 ='versioned_kv'，version_column='i'；
```

默认 `version_column` 是 `_tp_time`。 对于具有相同主键的数据，Proton 将使用最大值为  `version_column`的数据。 因此，默认情况下，它会跟踪相同主键的最新数据。 如果有延迟事件，您可以使用指定其他列来确定实时数据的结束状态。

### 变更日志流

[Changelog Stream](changelog-stream) allows you to specify the primary key(s) and track the add/delete/update of the data. 例如： 例如：

```sql
创建 STREAM changelog_kv（i int，k 字符串，k1 字符串） 
主键（k，k1） 
设置模式 ='changelog_kv'，version_column='i'；
```

默认 `version_column` 是 `_tp_time`。 对于具有相同主键的数据，Proton 将使用最大值为  `version_column`的数据。 因此，默认情况下，它会跟踪相同主键的最新数据。 如果有延迟事件，您可以使用指定其他列来确定实时数据的结束状态。

## 创建随机流

You may use this special stream to generate random data for tests. 例如： 例如：

```sql
创建随机流设备 (
  设备字符串默认 'device'||to_string (rand ()%4)， 
  位置字符串默认 'city'|to_string (rand ()%10)，
  温度浮动默认兰德 ()%1000/10)；
```

以下功能可供使用：

1. [rand](functions_for_random#rand) 在 uint32 中生成一个数字
2. [rand64](functions_for_random#rand64) 在 uint64 中生成一个数字
3. [random_printable_ascii](functions_for_random#random_printable_ascii) 用于生成可打印字符
4. [random_string](functions_for_random#random_string) 用于生成字符串
5. [random_fixed_string](functions_for_random#random_fixed_string) 生成固定长度的字符串
7. [random_in_type](functions_for_random#random_in_type) 生成具有最大值和自定义逻辑的值

在查询期间，随机流的数据保存在内存中。 The data of random stream is kept in memory during the query time. If you are not querying the random stream, there is no data generated or kept in memory.

By default, Proton tries to generate as many data as possible. If you want to (roughly) control how frequent the data is generated, you can use the `eps` setting. For example, the following SQL generates 10 events every second: 如果你想（大致）控制数据的生成频率，你可以使用 `eps` 设置。 例如，以下 SQL 每秒生成 10 个事件：

```sql
创建随机流 rand_stream (i int 默认 rand ()%5) 设置 eps=10
```

您可以通过 `interval_time` 设置进一步自定义数据生成速率。 You can further customize the rate of data generation via the `interval_time` setting. For example, you want to generate 1000 events each second, but don't want all 1000 events are generated at once, you can use the following sample SQL to generate events every 200 ms. The default interval is 5ms (in Proton 1.3.27 or the earlier versions, the default value is 100ms) 默认间隔为 5 毫秒（在 Proton 1.3.27 或更早版本中，默认值为 100 毫秒）

```sql
创建随机流 rand_stream (i int 默认 rand ()%5) 设置 eps=1000，interval_time=200
```

请注意，为了平衡性能和流量控制，数据生成率不准确。

:::info

Proton v1.4.2 的新增功能是，您可以将 eps 设置为 1 以下。 比如 `eps=0.5` 将每 2 秒生成 1 个事件。 `eps` 小于 0.00001 将被视为 0。

:::

## 创建外部直播

请查看 [使用外部流读取/写入 Kafka](proton-kafka)。