# Kafka 外部流

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Timeplus Proton with [External Stream](/external-stream). Combining with [Materialized View](/proton-create-view#m_view) and [Target Stream](/proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## 创建外部流

In Timeplus Proton, the external stream supports Kafka API as the only type. In Timeplus Enterprise, it also [supports the connection to the other Timeplus deployment](/timeplus-external-stream).

To create an external stream:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
    (<col_name1> <col_type>)
SETTINGS
    type='kafka',
    brokers='ip:9092',
    topic='..',
    security_protocol='..',
    username='..',
    password='..',
    sasl_mechanism='..',
    data_format='..',
    kafka_schema_registry_url='..',
    kafka_schema_registry_credentials='..',
    ssl_ca_cert_file='..',
    ss_ca_pem='..',
    skip_ssl_cert_check=..
```

`security_protocol` 的支持值为：

- 纯文本：省略此选项时，这是默认值。
- SASL_SSL：设置此值时，应指定用户名和密码。
  - 如果你需要指定自己的 SSL 认证文件，可以添加另一个设置 `ssl_ca_cert_file='/ssl/ca.pem'` Proton 1.5.5 中的新增内容，如果你不想或无法使用文件路径，例如在 Timeplus Cloud 或 Docker/Kuker/Kup 中，也可以将 pem 文件的全部内容作为字符串放入 `ssl_ca_pem` 设置中伯内特斯环境。
  - 可以通过 `设置 skip_ssl_cert_check=true`来跳过 SSL 认证验证。

`sasl_mechanmic` 的支持值为：

- PLAIN：当你将 security_protocol 设置为 SASL_SSL 时，这是 sasl_mechanmic 的默认值。
- SCRAM-SHA-256
- SCRAM-SHA-512

`data_format` 的支持值为：

- jsoneAchrow：每条 Kafka 消息可以是一个 JSON 文档，也可以每行都是一个 JSON 文档。 [了解更多](#jsoneachrow).
- CSV：不太常用。 [了解更多](#csv).
- protobufSingle：为每条 Kafka 消息提供一条 Protobuf 消息
- Protobuf：一条 Kafka 消息中可能有多条 Protobuf 消息。
- Avro：在 Proton 1.5.2 中添加
- rawBlob：默认值。 以纯文本形式读取/写入 Kafka 消息。

:::info

For examples to connect to various Kafka API compatitable message platforms, please check [this doc](/tutorial-sql-connect-kafka).

:::

### 定义列

#### 从 Kafka 读取的单列 {#single_col_read}

如果 Kafka 主题中的消息是纯文本格式或 JSON，则可以创建只有 `字符串` 类型的 `原始` 列的外部流。

示例：

```sql

```

Then use query time [JSON extraction functions](/functions_for_json) or shortcut to access the values, e.g. `raw:id`.

#### 以纯文本写入 Kafka {#single_col_write}

您可以使用带有单列的外部流向 Kafka 主题写入纯文本消息。

```sql

```

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](/proton-ingest-api), or set it as the target stream for a materialized view to write message to the Kafka topic. 实际的 `data_format` 值为 `rawBlob` 但可以省略。 By default `one_message_per_row` is `true`.

:::info
Since Timeplus Proton 1.5.11, a new setting `kafka_max_message_size` is available. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message, ensuring it won't exceed the `kafka_max_message_size` limit.
:::

#### 从 Kafka 中读取多列{#multi_col_read}

If the keys in the JSON message never change, or you don't care about the new columns, you can also create the external stream with multiple columns.

您可以在 JSON 中选取一些顶级键作为列，或将所有可能的键选为列。

Please note the behaviors are changed in recent versions, based on user feedback:

| 版本             | 默认行为                                                                                                                               | 如何覆盖                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.4.2 或以上      | 假设在 JSON 中有 5 个顶级键/值对，则可以在外部流中定义 5 列或少于 5 列。 数据将被正确读取。                                                                             | 如果你不想读取带有意外列的新事件，请在 `CREATE` DDL 中设置 `input_format_skip_unknown_fields=false` 。                                     |
| 1.3.24 到 1.4.1 | 假设JSON中有5个顶级键/值对，则可能需要定义5列才能全部读取。 或者在 DDL 中定义少于 5 列，并确保在每个 `SELECT` 查询设置中添加 `input_format_skip_unknown_fields=true` ，否则不会返回任何搜索结果。 | or only define some keys as columns and append this to your query: `SETTINGS input_format_skip_unknown_fields=true` |
| 1.3.23 或更高版本   | 你必须为整个 JSON 文档定义一个 `字符串` 列，并将查询时 JSON 解析应用于提取字段。                                                                                   | 不适用                                                                                                                 |

示例：

```sql

```

如果消息中有嵌套的复杂 JSON，则可以将该列定义为字符串类型。 实际上，任何 JSON 值都可以保存在字符串列中。

:::info

Protobuf messages can be read with all or partial columns. Please check [this page](/proton-format-schema).

:::

#### 要写入 Kafka 的多列{#multi_col_write}

To write data via Kafka API, you can choose different data formats:

##### jsoneaChrow

你可以使用 `data_format='jsoneachrow'，one_message_per_row=true` 通知 Proton 将每个事件写成 JSON 文档。 外部流的列将转换为 JSON 文档中的密钥。 例如：

```sql

```

消息将在特定主题中生成

```json

```

:::info

Please note, by default multiple JSON documents will be inserted to the same Kafka message. 每行/每行一个 JSON 文档。 这种默认行为旨在为Kafka/Redpanda获得最大的写入性能。 但是你需要确保下游应用程序能够正确拆分每条 Kafka 消息的 JSON 文档。

如果你需要每条 Kafka 消息的有效的 JSON，而不是 JSONL，请设置 `one_message_per_row=true` 例如

```sql

```

The default value of one_message_per_row, if not specified, is false for `data_format='JSONEachRow'` and true for `data_format='RawBLOB'`.

Since Timeplus Proton 1.5.11, a new setting `kafka_max_message_size` is available. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message and when to create new Kafka message, ensuring each message won't exceed the `kafka_max_message_size` limit.

:::

##### CSV

你可以使用 `data_format='csv'` 来通知 Proton 将每个事件写成 JSON 文档。 外部流的列将转换为 JSON 文档中的密钥。 例如：

```sql

```

消息将在特定主题中生成

```csv
“2023-10-29 05:35:54.176 “，” https://www.nationalwhiteboard.info/sticky/recontextualize/robust/incentivize","PUT","3eaf6372e909e033fcfc2d6a3bc04ace”
```

##### ProtobufSingle

You can either define the [Protobuf Schema in Proton](/proton-format-schema), or specify the [Kafka Schema Registry](/proton-schema-registry) when you create the external stream.

##### Avro

Starting from Proton 1.5.2, you can use Avro format when you specify the [Kafka Schema Registry](/proton-schema-registry) when you create the external stream.

### 读/写 Kafka 消息密钥 {#messagekey}

对于 Kafka 主题中的每条消息，其价值肯定至关重要。 密钥是可选的，但可以携带重要的元数据。

#### _message_key {#_message_key}

:::warning
`_message_key` is deprecated since Timeplus Proton 1.5.15 and timeplusd 2.3.10. Please use [_tp_message_key](#_tp_message_key)

From Timeplus Proton 1.5.4 to 1.5.14, it supports `_message_key` as a virtual column in Kafka external streams. 如果你运行 `SELECT * FROM ext_stream`，则不会查询这样的虚拟列。 你需要明确选择该列来检索消息密钥，例如 `SELECT _message_key，* FROM ext_stream`。

To write the message key and value, you need to set the `message_key` in the `CREATE` DDL. 它是一个返回字符串值的表达式，该表达式返回的值将用作每条消息的密钥。

示例：

```sql

```

`message_key` 可以与 `sharding_expr`（在 Kafka 主题中指定目标分区号）一起使用，而且 `sharding_expr` 将优先级更高。
:::

#### _tp_message_key

Based on user feedback, we introduced a better way to read or write the message key. Starting from timeplusd 2.3.10, you can define the `_tp_message_key` column when you create the external stream. This new approach provides more intuitive and flexible way to write any content as the message key, not necessarily mapping to a specify column or a set of columns.

例如：
```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _tp_message_key string
) SETTINGS type='kafka',...;
```
You can insert any data to the Kafka topic.

When insert a row to the stream like:
```sql
INSERT INTO foo(id,name,_tp_message_key) VALUES (1, 'John', 'some-key');
```
`'some-key'` will be used for the message key for the Kafka message (and it will be excluded from the message body, so the message will be `{"id": 1, "name": "John"}` for the above SQL).

When doing a SELECT query, the message key will be populated to the `_tp_message_key` column as well. `SELECT * FROM foo` will return `'some-key'` for the `_tp_message_key` message.

`_tp_message_key` support the following types: `uint8`, `uint16`, `uint32`, `uint64`, `int8`, `int16`, `int32`, `int64`, `bool`, `float32`, `float64`, `string`, and `fixed_string`.

`_tp_message_key` also support `nullable`. Thus we can create an external stream with optional message key. 例如：
```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _tp_message_key nullable(string) default null
) SETTINGS type='kafka',...;
```

## 删除外部流

```sql
删除外部流 [如果存在] stream_name
```

## 使用 SQL 查询 Kafka 数据

你可以在外部流上运行流式传输 SQL，例如

```sql

```

### 阅读现有消息 {#rewind}

When you run `SELECT raw FROM ext_stream` , Proton will read the new messages in the topics, not the existing ones. If you need to read all existing messages, you can use the following settings: 如果您需要阅读所有现有消息，则可以使用以下设置：

```sql

```

或者如果你运行的是 Proton 1.5.9 或更高版本，则使用以下 SQL：

```sql

```

:: warning  
请避免通过 `select * from table (ext_stream)`扫描所有数据。 应用一些筛选条件，或者运行优化的 `从表 (ext_stream)` 中选择计数 (*) 来获取当前的消息数量。
:::

### 读取指定分区

从 Proton 1.3.18 开始，你还可以在指定的 Kafka 分区中读取。 默认情况下，将读取所有分区。 但是你也可以通过 `shards` 设置从单个分区读取，例如

```sql

```

或者你可以指定一组用逗号分隔的分区 ID，例如

```sql

```

## 使用 SQL 写入 Kafka

你可以使用物化视图将数据作为外部流写入到 Kafka，例如

```sql

```

## Docker Compose 教程 {#tutorial}

请查看教程：

- [使用 SQL 查询 Kafka](/tutorial-sql-kafka)
- [流加入](/tutorial-sql-join)
- [流 ETL](/tutorial-sql-etl)

## Kafka 客户端的属性 {#properties}

对于更高级的用例，可以在创建外部流时指定自定义属性。 For more advanced use cases, you can specify customized properties while creating the external streams. Those properties will be passed to the underlying Kafka client, which is [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).

例如：

```sql

```

请注意，并非支持 [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) 中的所有属性。 今天，Proton 接受了以下内容。 有关详细信息，请查看 [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) 的配置指南。

| 钥匙                                 | range                     | 默认   | 描述                                                                                                                               |
| ---------------------------------- | ------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| enable.idempotence                 | 真的，假的                     | true | 当设置为 `true`时，生产者将确保消息仅按原始生成顺序成功生成一次。                                                                                             |
| message.timeout.ms                 | 1 .. 1000000 2147483647   | 0    | 本地消息超时。                                                                                                                          |
| 队列缓冲最大消息                           | 0。。 2147483647            |      | 生产者队列中允许的最大消息数。                                                                                                                  |
| 队列缓冲最大千字节                          | 1.。 2147483647            |      | 生产者队列允许的最大消息总大小总和。                                                                                                               |
| 队列缓冲区.max.ms                       | 0。。 0 .. 900000           |      | 在构造要传输给代理的消息批处理 (MessageSet) 之前，等待生产者队列中的消息累积的延迟（以毫秒为单位）。                                                                        |
| message.max.bytes                  | 1000。。 1000 .. 1000000000 |      | Kafka 协议请求消息的最大大小。                                                                                                               |
| message.send.max.retries           | 0。。 2147483647            |      | 重试发送失败的消息多少次。                                                                                                                    |
| retries                            | 0。。 2147483647            |      | `message.send.max.retries 的别名`：重试发送失败的消息多少次。                                                                                     |
| 重试.backoff.ms                      | 1.。 1 .. 300000           |      | 重试协议请求之前的退避时间（以毫秒为单位）                                                                                                            |
| 重试.backoff.max.ms                  | 1.。 1 .. 300000           |      | 重试协议请求之前的最大退避时间（以毫秒为单位），                                                                                                         |
| batch.num.messages                 | 1.。 1000000               |      | 一个 MessageSet 中批处理的最大消息数。                                                                                                        |
| 批次大小                               | 1.。 2147483647            |      | 一个 MessageSet 中批处理的所有消息的最大大小（以字节为单位），包括协议帧开销。                                                                                    |
| 压缩编解码器                             | 无、gzip、snappy、lz4、zstd、继承 |      | 用于压缩消息集的压缩编解码器。 Compression codec to use for compressing message sets. inherit = inherit global compression.codec configuration. |
| 压缩类型                               | 无、gzip、snappy、lz4、zstd    |      | `compression.codec`的别名：用于压缩消息集的压缩编解码器。                                                                                           |
| 压缩级别                               | -1。。 12                   |      | 由配置属性 `compression.codec`选择的算法的压缩级别参数。                                                                                           |
| topic.metadata.refresh.interval.ms | -1。。 3600000              |      | 刷新主题和代理元数据以便主动发现任何新的代理、主题、分区或分区领导变更的时间段（以毫秒为单位）。                                                                                 |

## 限制

There are some limitations for the Kafka-based external streams, because Timeplus doesn’t control the storage or the data format for the external stream.

1. The UI wizard only support JSON or TEXT. To use Avro, Protobuf, or schema registry service, you need the SQL DDL.
2. `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_append_time` is set only when message timestamp is an append time.
3. Unlike normal streams, there is no historical storage for the external streams. Hence you cannot run `table(my_ext_stream)`or `settings query_mode='table'` To access data even before you create the external stream, you can use `WHERE _tp_time >'2023-01-15'` to travel to a specific timestamp in the past, or use `SETTINGS seek_to='earliest'`.
4. There is no retention policy for the external streams in Timeplus. You need to configure the retention policy on Kafka/Confluent/Redpanda. If the data is no longer available in the external systems, they cannot be searched in Timeplus either.
