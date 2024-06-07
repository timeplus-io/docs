# Kafka 外部流

你可以使用 [External Stream](external-stream)从 Proton 中的 Apache Kafka（以及 Confluent Cloud 或 Redpanda）读取数据。 You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). Combining with [Materialized View](proton-create-view#m_view) and [Target Stream](proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## 创建外部直播

目前，Timeplus 外部直播仅支持 Kafka API 作为唯一类型。

要在 Proton 中创建外部流，请执行以下操作：

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (\<col_name1> \<col_type>)
SETTINGS type='kafka'，brokers='ip: 9092'，topic='.. '，security_protocol='.. '，用户名='.. '，密码='.. '，sasl_mechanism='.. '，data_format='.. '，kafka_schema_registry_url='.. '，kafka_schema_registry_credentials='.. '，ssl_ca_cert_file='.. '，ss_ca_pem='.. '，skip_ssl_cert_check=。
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

有关连接各种 Kafka API 兼容消息平台的示例，请查看 [此文档](tutorial-sql-connect-kafka)。

:::

### 定义列

#### 从 Kafka 读取的单列 {#single_col_read}

如果 Kafka 主题中的消息是纯文本格式或 JSON，则可以创建只有 `字符串` 类型的 `原始` 列的外部流。

示例：

```sql
创建外部直播 ext_github_events
         （原始字符串）
设置类型='kafka'，
         brokers='localhost: 9092'，
         topic='github_events'
```

然后使用查询时间 [JSON 提取函数](functions_for_json) 或快捷方式来访问这些值，例如 `raw: id`。

#### 以纯文本写入 Kafka {#single_col_write}

您可以使用带有单列的外部流向 Kafka 主题写入纯文本消息。

```sql
创建外部直播 ext_github_events
         （原始字符串）
设置类型='kafka'，
         brokers='localhost: 9092'，
         topic='github_events'
```

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](proton-ingest-api), or set it as the target stream for a materialized view to write message to the Kafka topic. The actual `data_format` value is `RawBLOB` but this can be omitted. 实际的 `data_format` 值为 `rawBlob` 但可以省略。

#### 从 Kafka 中读取多列{#multi_col_read}

If the keys in the JSON message never change, you can also create the external stream with multiple columns (only available to Proton v1.3.24+).

您可以在 JSON 中选取一些顶级键作为列，或将所有可能的键选为列。

请注意，根据用户反馈，最新版本中的行为已更改：

| 版本             | By default, proton-client is started in single line and single query mode. To run multiple query statements together, start with the `-n` parameters, i.e. `docker exec -it proton-container-name proton-client -n` | 如何覆盖                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.4.2 或以上      | 假设在 JSON 中有 5 个顶级键/值对，则可以在外部流中定义 5 列或少于 5 列。 数据将被正确读取。                                                                                                                                                              | 如果你不想读取带有意外列的新事件，请在 `CREATE` DDL 中设置 `input_format_skip_unknown_fields=false` 。                                     |
| 1.3.24 到 1.4.1 | 假设JSON中有5个顶级键/值对，则可能需要定义5列才能全部读取。 或者在 DDL 中定义少于 5 列，并确保在每个 `SELECT` 查询设置中添加 `input_format_skip_unknown_fields=true` ，否则不会返回任何搜索结果。                                                                                  | or only define some keys as columns and append this to your query: `SETTINGS input_format_skip_unknown_fields=true` |
| 1.3.23 或更高版本   | 你必须为整个 JSON 文档定义一个 `字符串` 列，并将查询时 JSON 解析应用于提取字段。                                                                                                                                                                    | 不适用                                                                                                                 |

示例：

```sql
创建外部流 ext_github_events
         （演员字符串、
          created_at 字符串、
          id 字符串、
          负载字符串、
          回购字符串、
          类型字符串
         ）
设置类型='kafka'、
         brokers='localhost: 9092'、
         topic='github_events'，
         data_format='jsoneachrow'
```

如果消息中有嵌套的复杂 JSON，则可以将该列定义为字符串类型。 实际上，任何 JSON 值都可以保存在字符串列中。

:::info

Since Proton v1.3.29, Protobuf messages can be read with all or partial columns. Please check [this page](proton-format-schema). 请查看 [此页面](proton-format-schema)。

:::

#### 要写入 Kafka 的多列{#multi_col_write}

要通过 Kafka API 写入数据（仅适用于 Proton v1.3.18+），你可以选择不同的数据格式：

##### jsoneaChrow

你可以使用 `data_format='jsoneachrow'，one_message_per_row=true` 通知 Proton 将每个事件写成 JSON 文档。 外部流的列将转换为 JSON 文档中的密钥。 例如：

```sql
创建外部直播目标 (
    _tp_time datetime64 (3)、
    网址字符串、
    方法字符串、
    ip 字符串)
    settings type='kafka'、
             brokers='redpanda: 9092'、
             topic='masked-fe-event'、
             data_format='jsoneachrow'、
             one_message_per_row=true；
```

消息将在特定主题中生成

```json
{
“_tp_time”: “2023-10-29 05:36:21.957”
“网址”:” https://www.nationalweb-enabled.io/methodologies/killer/web-readiness “
“方法”: “POST”
“ip”: “c4ecf59a9ec27b50af9cc3bb8289e16c”

```

:::info

Please note, since 1.3.25, by default multiple JSON documents will be inserted to the same Kafka message. One JSON document each row/line. Such default behavior aims to get the maximum writing performance to Kafka/Redpanda. But you need to make sure the downstream applications are able to properly split the JSON documents per Kafka message. 每行/每行一个 JSON 文档。 这种默认行为旨在为Kafka/Redpanda获得最大的写入性能。 但是你需要确保下游应用程序能够正确拆分每条 Kafka 消息的 JSON 文档。

如果你需要每条 Kafka 消息的有效的 JSON，而不是 JSONL，请设置 `one_message_per_row=true` 例如

```sql
创建外部直播目标（_tp_time datetime64 (3)、网址字符串、IP 字符串）
设置类型='kafka'、brokers='redpanda: 9092'、topic='masked-fe-event'、
         data_format='jsoneachrow'、one_message_per_row=true
```

如果未指定，one_message_per_row 的默认值为 false。

:::

##### CSV

你可以使用 `data_format='csv'` 来通知 Proton 将每个事件写成 JSON 文档。 外部流的列将转换为 JSON 文档中的密钥。 例如：

```sql
创建外部直播目标（
    _tp_time datetime64 (3)、
    网址字符串、
    方法字符串、
    ip 字符串）
    设置 type='kafka'，
             brokers='redpanda: 9092'，
             topic='masked-fe-event'，
             data_format='csv'；
```

消息将在特定主题中生成

```csv
“2023-10-29 05:35:54.176 “，” https://www.nationalwhiteboard.info/sticky/recontextualize/robust/incentivize","PUT","3eaf6372e909e033fcfc2d6a3bc04ace”
```

##### ProtobufSingle

你可以在 Proton中定义

Protobuf 架构，也可以在创建外部流时指定 [Kafka 架构注册表](proton-schema-registry) 。



##### Avro

从 Proton 1.5.2 开始，在创建外部流时指定 [Kafka 架构注册表](proton-schema-registry) 时，可以使用 Avro 格式。



### 读/写 Kafka 消息密钥 {#messagekey}

对于 Kafka 主题中的每条消息，其价值肯定至关重要。 密钥是可选的，但可以携带重要的元数据。

**阅读：** 自 Proton 1.5.4 起，你可以通过 Kafka 外部流中的 `_message_key` 虚拟列读取消息密钥。 如果你运行 `SELECT * FROM ext_stream`，则不会查询这样的虚拟列。 你需要明确选择该列来检索消息密钥，例如 `SELECT _message_key，* FROM ext_stream`。

**写入：** 当你创建外部流并通过物化视图或 `INSERT`向其发送数据时，你可以指定如何生成消息密钥。

这是通过在 `CREATE` DDL 中设置 `message_key` 来完成的。 它是一个返回字符串值的表达式，该表达式返回的值将用作每条消息的密钥。

示例：



```sql
— 使用一列
CREATE EXTERNAL STREAM example_one (
  一个字符串，
  two int32
) 设置 type='kafka'，...，message_key='one'；

— 使用复杂的表达式
CREATE EXTERNAL STREAM example_two（
  一个字符串，
  两个 int32
）设置 type='kafka'，...，message_key='split_by_string (\ ',\', one) [1] ';
```


`message_key` 可以与 `sharding_expr`（在 Kafka 主题中指定目标分区号）一起使用，而且 `sharding_expr` 将优先级更高。



## 删除外部直播



```sql
删除外部流 [如果存在] stream_name
```




## 使用 SQL 查询 Kafka 数据

你可以在外部流上运行流式传输 SQL，例如



```sql
从 ext_stream 中选择 raw: timestamp、raw: car_id、raw: event 其中 raw: car_type 输入 (1,2,3)；
选择 window_start，count () from tumble (ext_stream，to_datetime (raw: timestamp)) 按 window_start 分组；
```




### 阅读现有消息 {#rewind}

When you run `SELECT raw FROM ext_stream` , Proton will read the new messages in the topics, not the existing ones. If you need to read all existing messages, you can use the following settings: 如果您需要阅读所有现有消息，则可以使用以下设置：



```sql
从 ext_stream 设置中选择原始内容 seek_to='earliest'
```


或者如果你运行的是 Proton 1.5.9 或更高版本，则使用以下 SQL：



```sql
从表中选择原始数据 (ext_stream) 其中...
```


:: warning
请避免通过 `select * from table (ext_stream)`扫描所有数据。 应用一些筛选条件，或者运行优化的 `从表 (ext_stream)` 中选择计数 (*) 来获取当前的消息数量。
:::



### 读取指定分区

Starting from Proton 1.3.18, you can also read in specified Kafka partitions. By default, all partitions will be read. But you can also read from a single partition via the `shards` setting, e.g. 默认情况下，将读取所有分区。 但是你也可以通过 `shards` 设置从单个分区读取，例如



```sql
从 ext_stream 设置中选择原始数据 shards='0'
```


或者你可以指定一组用逗号分隔的分区 ID，例如



```sql
从 ext_stream 设置中选择原始数据 shards='0,2'
```




## 使用 SQL 写入 Kafka

你可以使用物化视图将数据作为外部流写入到 Kafka，例如



```sql
— 通过外部直播阅读话题
创建外部流 frontend_events（原始字符串）
                SETTINGS type='kafka'，
                         brokers='redpanda: 9092'，
                         topic='owlshop-frontend-events'；

— 创建另一个外部流向另一个主题
创建外部流目标 (
    _tp_time datetime64 (3)，
    url 字符串，
    方法字符串，
    ip 字符串）
    设置类型='kafka'，
             brokers='redpanda: 9092'，
             topic='masked-fe-event'，
             data_format='jsoneachrow'，
             one_message_per_row=true；

— 通过物化视图设置 ETL 管道
在目标中创建物化视图 mv 作为
    SELECT now64 () 作为 _tp_time，
           raw: requestedURL 作为 url，
           raw: method 作为方法，
           向下（十六进制 (md5 (raw: IPAddress)) 作为 ip
    来自 frontend_events；
```




## Docker Compose 教程 {#tutorial}

请查看教程：

- [使用 SQL 查询 Kafka](tutorial-sql-kafka)
- [直播加入](tutorial-sql-join)
- [直播 ETL](tutorial-sql-etl)



## Kafka 客户端的属性 {#properties}

对于更高级的用例，可以在创建外部流时指定自定义属性。 For more advanced use cases, you can specify customized properties while creating the external streams. Those properties will be passed to the underlying Kafka client, which is [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).

例如：



```sql
创建外部流 ext_github_events（原始字符串）
设置类型='kafka'，
         brokers='localhost: 9092'，
         topic='github_events'，
         properties='message.max.bytes=1000000；message.timeout.ms=6000'
```


Please note, not all properties in [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) are supported. The following ones are accepted in Proton today. Please check the configuration guide of [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) for details. 今天，Proton 接受了以下内容。 有关详细信息，请查看 [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) 的配置指南。

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
| 批次大小                               | 1.。 1 .. 2147483647       |      | 一个 MessageSet 中批处理的所有消息的最大大小（以字节为单位），包括协议帧开销。                                                                                    |
| 压缩编解码器                             | 无、gzip、snappy、lz4、zstd、继承 |      | 用于压缩消息集的压缩编解码器。 Compression codec to use for compressing message sets. inherit = inherit global compression.codec configuration. |
| 压缩类型                               | 无、gzip、snappy、lz4、zstd    |      | `compression.codec`的别名：用于压缩消息集的压缩编解码器。                                                                                           |
| 压缩级别                               | -1。。 12                   |      | 由配置属性 `compression.codec`选择的算法的压缩级别参数。                                                                                           |
| topic.metadata.refresh.interval.ms | -1。。 3600000              |      | 刷新主题和代理元数据以便主动发现任何新的代理、主题、分区或分区领导变更的时间段（以毫秒为单位）。                                                                                 |
