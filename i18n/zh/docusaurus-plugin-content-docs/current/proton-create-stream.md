# 流

::: Timeplus Cloud 用户须知

In Timeplus Cloud or Timeplus Enterprise deployments, we recommend you to create streams with GUI or [Terraform Provider](/terraform), with better usability and more capabilities.

:::

## 创建流

[Stream](/working-with-streams) is a key [concept](/glossary) in Timeplus. 所有数据都存在于流中，无论是静态数据还是动态数据。 We don't recommend you to create or manage `TABLE` in Timeplus.

### 仅限追加的流

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

流创建是一个异步过程。

:::

如果省略数据库名称，则将使用 `默认` 。 If you omit the database name, `default` will be used. Stream name can be any utf-8 characters and needs backtick quoted if there are spaces in between. Column name can be any utf-8 characters and needs backtick quoted if there are spaces in between. 列名可以是任何 utf-8 字符，如果两者之间有空格，则需要反引号。

#### 数据类型

Timeplus Proton supports the following column types:

1. int8/16/32/64/128/256
2. uint8/16/32/64/128/256
3. 布尔值
4. 十进制（精度、小数位数）：精度的有效范围是 [1：76]，小数位数的有效范围是 [0：精度]
5. float32/64
6. 日期
7. 日期时间
8. datetime64(precision, [time_zone])
9. 字符串
10. fixed_string (N)
11. 数组 (T)
12. uuid
13. ipv4/ipv6

For more details, please check [Data Types](/datatypes).

#### 活动时间

In Timeplus, each stream with a `_tp_time` as [Event Time](/eventtime). 如果您在创建流时没有创建 `_tp_time` 列，则系统将为您创建这样的列，默认值为 `now64 ()` 。 您也可以选择一列作为事件时间，使用

```sql
设置 event_time_column='my_datetime_column'
```

 它可以是任何导致 datetime64 类型的 SQL 表达式。

#### 保留政策

Proton 支持保留政策，可自动从流中删除过时的数据。

##### 用于历史存储

Proton利用ClickHouse TTL表达式来制定历史数据的保留政策。 Proton leverages ClickHouse TTL expression for the retention policy of historical data. When you create the stream, you can add `TTL to_datetime(_tp_time) + INTERVAL 12 HOUR` to remove older events based a specific datetime column and retention period.

##### 用于流存储

You can set the retention policies for streaming storage when you create the stream or update the setting after creation.

```sql
CREATE STREAM .. SETTINGS logstore_retention_bytes=.., logstore_retention_ms=..;

ALTER STREAM .. MODIFY SETTINGS logstore_retention_bytes=.., logstore_retention_ms=..;
```

### 多版本流

[Versioned Stream](/versioned-stream) allows you to specify the primary key(s) and focus on the latest value. 例如：

```sql
CREATE STREAM versioned_kv(i int, k string, k1 string)
PRIMARY KEY (k, k1)
SETTINGS mode='versioned_kv', version_column='i';
```

默认 `version_column` 是 `_tp_time`。 对于具有相同主键的数据，Proton 将使用最大值为  `version_column`的数据。 因此，默认情况下，它会跟踪相同主键的最新数据。 如果有延迟事件，您可以使用指定其他列来确定实时数据的结束状态。

### 变更日志流

[Changelog Stream](/changelog-stream) allows you to specify the primary key(s) and track the add/delete/update of the data. 例如：

```sql
CREATE STREAM changelog_kv(i int, k string, k1 string)
PRIMARY KEY (k, k1)
SETTINGS mode='changelog_kv', version_column='i';
```

默认 `version_column` 是 `_tp_time`。 对于具有相同主键的数据，Proton 将使用最大值为  `version_column`的数据。 因此，默认情况下，它会跟踪相同主键的最新数据。 如果有延迟事件，您可以使用指定其他列来确定实时数据的结束状态。

## 创建随机流

You may use this special stream to generate random data for tests. 例如： 例如：

```sql
CREATE RANDOM STREAM devices(
  device string default 'device'||to_string(rand()%4),
  location string default 'city'||to_string(rand()%10),
  temperature float default rand()%1000/10);
```

以下功能可供使用：

1. [rand](/functions_for_random#rand) to generate a number in uint32
2. [rand64](/functions_for_random#rand64) to generate a number in uint64
3. [random_printable_ascii](/functions_for_random#random_printable_ascii) to generate printable characters
4. [random_string](/functions_for_random#random_string) to generate a string
5. [random_fixed_string](/functions_for_random#random_fixed_string) to generate string in fixed length
7. [random_in_type](/functions_for_random#random_in_type) to generate value with max value and custom logic

When you run a Timeplus SQL query with a random stream, the data will be generated and analyzed by the query engine. Depending on the query, all generated data or the aggregated states can be kept in memory during the query time. The data of random stream is kept in memory during the query time. If you are not querying the random stream, there is no data generated or kept in memory.

By default, Proton tries to generate as many data as possible. If you want to (roughly) control how frequent the data is generated, you can use the `eps` setting. For example, the following SQL generates 10 events every second: 如果你想（大致）控制数据的生成频率，你可以使用 `eps` 设置。 例如，以下 SQL 每秒生成 10 个事件：

```sql
CREATE RANDOM STREAM rand_stream(i int default rand()%5) SETTINGS eps=10
```

您可以通过 `interval_time` 设置进一步自定义数据生成速率。 You can further customize the rate of data generation via the `interval_time` setting. For example, you want to generate 1000 events each second, but don't want all 1000 events are generated at once, you can use the following sample SQL to generate events every 200 ms. The default interval is 5ms (in Proton 1.3.27 or the earlier versions, the default value is 100ms) 默认间隔为 5 毫秒（在 Proton 1.3.27 或更早版本中，默认值为 100 毫秒）

```sql
CREATE RANDOM STREAM rand_stream(i int default rand()%5) SETTINGS eps=1000, interval_time=200
```

请注意，为了平衡性能和流量控制，数据生成率不准确。

:::info

Proton v1.4.2 的新增功能是，您可以将 eps 设置为 1 以下。 比如 `eps=0.5` 将每 2 秒生成 1 个事件。 `eps` 小于 0.00001 将被视为 0。

:::

## 创建外部流

Please check [Read/Write Kafka with External Stream](/proton-kafka).
