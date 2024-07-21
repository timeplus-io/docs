# Kafka External Stream

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). Combining with [Materialized View](proton-create-view#m_view) and [Target Stream](proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## CREATE EXTERNAL STREAM

Currently Timeplus external stream only supports Kafka API as the only type.

To create an external stream in Proton:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..',username='..',password='..',sasl_mechanism='..',data_format='..',kafka_schema_registry_url='..',kafka_schema_registry_credentials='..',ssl_ca_cert_file='..',ss_ca_pem='..',skip_ssl_cert_check=..
```

The supported values for `security_protocol` are:

- PLAINTEXT: when this option is omitted, this is the default value.
- SASL_SSL: when this value is set, username and password should be specified.
  - If you need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'` New in Proton 1.5.5, you can also put the full content of the pem file as a string in the `ssl_ca_pem` setting if you don't want to, or cannot use a file path, such as on Timeplus Cloud or in Docker/Kubernetes environments.
  - Skipping the SSL certification verification can be done via `SETTINGS skip_ssl_cert_check=true`.

The supported values for `sasl_mechanism` are:

- PLAIN: when you set security_protocol to SASL_SSL, this is the default value for sasl_mechanism.
- SCRAM-SHA-256
- SCRAM-SHA-512

The supported values for `data_format` are:

- JSONEachRow: each Kafka message can be a single JSON document, or each row is a JSON document. [Learn More](#jsoneachrow).
- CSV: less commonly used. [Learn More](#csv).
- ProtobufSingle: for single Protobuf message per Kafka message
- Protobuf: there could be multiple Protobuf messages in a single Kafka message.
- Avro: added in Proton 1.5.2
- RawBLOB: the default value. Read/write Kafka message as plain text.

:::info

For examples to connect to various Kafka API compatitable message platforms, please check [this doc](tutorial-sql-connect-kafka).

:::

### Define columns

#### Single column to read from Kafka {#single_col_read}

If the message in Kafka topic is in plain text format or JSON, you can create an external stream with only a `raw` column in `string` type.

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events
         (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

Then use query time [JSON extraction functions](functions_for_json) or shortcut to access the values, e.g. `raw:id`.

#### Write to Kafka in Plain Text {#single_col_write}

You can write plain text messages to Kafka topics with an external stream with a single column.

```sql
CREATE EXTERNAL STREAM ext_github_events
         (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](proton-ingest-api), or set it as the target stream for a materialized view to write message to the Kafka topic. The actual `data_format` value is `RawBLOB` but this can be omitted. By default `one_message_per_row` is `true`.

:::info
Since Timeplus Proton 1.5.11, a new setting `kafka_max_message_size` is available. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message, ensuring it won't exceed the `kafka_max_message_size` limit.
:::

#### Multiple columns to read from Kafka{#multi_col_read}

If the keys in the JSON message never change, or you don't care about the new columns, you can also create the external stream with multiple columns (only available to Proton v1.3.24+).

You can pick up some top level keys in the JSON as columns, or all possible keys as columns.

Please note the behaviors are changed in recent versions, based on user feedback:

| Version         | Default Behavior                                                                                                                                                                                                                                                                           | How to overwrite                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1.4.2 or above  | Say there are 5 top level key/value pairs in JSON, you can define 5 or less than 5 columns in the external stream. Data will be read properly.                                                                                                                                             | If you don't want to read new events with unexpected columns, set `input_format_skip_unknown_fields=false` in the `CREATE` DDL. |
| 1.3.24 to 1.4.1 | Say there are 5 top level key/value pairs in JSON, you can need to define 5 columns to read them all. Or define less than 5 columns in the DDL, and make sure to add `input_format_skip_unknown_fields=true` in each `SELECT` query settings, otherwise no search result will be returned. | In each `SELECT` query, you can specify the setting `input_format_skip_unknown_fields=true\|false`.                             |
| 1.3.23 or older | You have to define a single `string` column for the entire JSON document and apply query time JSON parsing to extract fields.                                                                                                                                                              | N/A                                                                                                                             |

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events
         (actor string,
          created_at string,
          id string,
          payload string,
          repo string,
          type string
         )
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events',
         data_format='JSONEachRow'
```

If there are nested complex JSON in the message, you can define the column as a string type. Actually any JSON value can be saved in a string column.

:::info

Since Proton v1.3.29, Protobuf messages can be read with all or partial columns. Please check [this page](proton-format-schema).

:::

#### Multiple columns to write to Kafka{#multi_col_write}

To write data via Kafka API (only available to Proton v1.3.18+), you can choose different data formats:

##### JSONEachRow

You can use `data_format='JSONEachRow',one_message_per_row=true` to inform Proton to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3),
    url string,
    method string,
    ip string)
    SETTINGS type='kafka',
             brokers='redpanda:9092',
             topic='masked-fe-event',
             data_format='JSONEachRow',
             one_message_per_row=true;
```

The messages will be generated in the specific topic as

```json
{
"_tp_time":"2023-10-29 05:36:21.957"
"url":"https://www.nationalweb-enabled.io/methodologies/killer/web-readiness"
"method":"POST"
"ip":"c4ecf59a9ec27b50af9cc3bb8289e16c"
}
```

:::info

Please note, since 1.3.25, by default multiple JSON documents will be inserted to the same Kafka message. One JSON document each row/line. Such default behavior aims to get the maximum writing performance to Kafka/Redpanda. But you need to make sure the downstream applications are able to properly split the JSON documents per Kafka message.

If you need a valid JSON per each Kafka message, instead of a JSONL, please set `one_message_per_row=true` e.g.

```sql
CREATE EXTERNAL STREAM target(_tp_time datetime64(3), url string, ip string)
SETTINGS type='kafka', brokers='redpanda:9092', topic='masked-fe-event',
         data_format='JSONEachRow',one_message_per_row=true
```

The default value of one_message_per_row, if not specified, is false for `data_format='JSONEachRow'` and true for `data_format='RawBLOB'`.

:::info
Since Timeplus Proton 1.5.11, a new setting `kafka_max_message_size` is available. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message and when to create new Kafka message, ensuring each message won't exceed the `kafka_max_message_size` limit.
:::

:::

##### CSV

You can use `data_format='CSV'` to inform Proton to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3),
    url string,
    method string,
    ip string)
    SETTINGS type='kafka',
             brokers='redpanda:9092',
             topic='masked-fe-event',
             data_format='CSV';
```

The messages will be generated in the specific topic as

```csv
"2023-10-29 05:35:54.176","https://www.nationalwhiteboard.info/sticky/recontextualize/robust/incentivize","PUT","3eaf6372e909e033fcfc2d6a3bc04ace"
```

##### ProtobufSingle

You can either define the [Protobuf Schema in Proton](proton-format-schema), or specify the [Kafka Schema Registry](proton-schema-registry) when you create the external stream.

##### Avro

Starting from Proton 1.5.2, you can use Avro format when you specify the [Kafka Schema Registry](proton-schema-registry) when you create the external stream.

### Read/Write Kafka Message Key {#messagekey}

For each message in the Kafka topic, the value is critical for sure. The key is optional but could carry important meta data.

#### _message_key {#_message_key}

:::warning
`_message_key` is deprecated since Timeplus Proton 1.5.15 and timeplusd 2.3.10. Please use [_tp_message_key](#_tp_message_key)

From Timeplus Proton 1.5.4 to 1.5.14, it supports `_message_key` as a virtual column in Kafka external streams. If you run `SELECT * FROM ext_stream`, such virtual column won't be queried. You need to explicitly select the column to retrieve the message key, e.g. `SELECT _message_key, * FROM ext_stream`.

To write the message key and value, you need to set the `message_key` in the `CREATE` DDL. It is an expression that returns a string value, the values return by the expression will be used as the key for each message.

Examples:

```sql
-- use a column
CREATE EXTERNAL STREAM example_one (
  one string,
  two int32
) SETTINGS type='kafka',...,message_key='one';

-- use a complex expression
CREATE EXTERNAL STREAM example_two (
  one string,
  two int32
) SETTINGS type='kafka',...,message_key='split_by_string(\',\', one)[1]';
```

`message_key` can be used together with `sharding_expr`(which specify the target partition number in the Kafka topic), and `sharding_expr` will take higher priority.
:::

#### _tp_message_key

Based on user feedback, we introduced a better way to read or write the message key. Starting from timeplusd 2.3.10, you can define the `_tp_message_key` column when you create the external stream. This new approach provides more intuiative and flexible way to write any content as the message key, not necessarily mapping to a specify column or a set of columns.

For example:
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
`'some-key'` will be used for the message key for the Kafka message (and it will be exlcuded from the message body, so the message will be `{"id": 1, "name": "John"}` for the above SQL).

When doing a SELECT query, the message key will be populated to the `_tp_message_key` column as well.
`SELECT * FROM foo` will return `'some-key'` for the `_tp_message_key` message.

`_tp_message_key` support the following types: `uint8`, `uint16`, `uint32`, `uint64`, `int8`, `int16`, `int32`, `int64`, `bool`, `float32`, `float64`, `string`, and `fixed_string`.

`_tp_message_key` also support `nullable`. Thus we can create an external stream with optional message key. For example:
```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _tp_message_key nullable(string) default null
) SETTINGS type='kafka',...;
```

## DROP EXTERNAL STREAM

```sql
DROP EXTERNAL STREAM [IF EXISTS] stream_name
```

## Query Kafka Data with SQL

You can run streaming SQL on the external stream, e.g.

```sql
SELECT raw:timestamp, raw:car_id, raw:event FROM ext_stream WHERE raw:car_type in (1,2,3);
SELECT window_start, count() FROM tumble(ext_stream,to_datetime(raw:timestamp)) GROUP BY window_start;
```

### Read existing messages {#rewind}

When you run `SELECT raw FROM ext_stream ` , Proton will read the new messages in the topics, not the existing ones. If you need to read all existing messages, you can use the following settings:

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='earliest'
```

Or the following SQL if you are running Proton 1.5.9 or above:

```sql
SELECT raw FROM table(ext_stream) WHERE ...
```

:::warning
Please avoid scanning all data via `select * from table(ext_stream)`. Apply some filtering conditions, or run the optimized `select count(*) from table(ext_stream)` to get the number of current message count.
:::

### Read specified partitions

Starting from Proton 1.3.18, you can also read in specified Kafka partitions. By default, all partitions will be read. But you can also read from a single partition via the `shards` setting, e.g.

```sql
SELECT raw FROM ext_stream SETTINGS shards='0'
```

Or you can specify a set of partition ID, separated by comma, e.g.

```sql
SELECT raw FROM ext_stream SETTINGS shards='0,2'
```

## Write to Kafka with SQL

You can use materialized views to write data to Kafka as an external stream, e.g.

```sql
-- read the topic via an external stream
CREATE EXTERNAL STREAM frontend_events(raw string)
                SETTINGS type='kafka',
                         brokers='redpanda:9092',
                         topic='owlshop-frontend-events';

-- create the other external stream to write data to the other topic
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3),
    url string,
    method string,
    ip string)
    SETTINGS type='kafka',
             brokers='redpanda:9092',
             topic='masked-fe-event',
             data_format='JSONEachRow',
             one_message_per_row=true;

-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO target AS
    SELECT now64() AS _tp_time,
           raw:requestedUrl AS url,
           raw:method AS method,
           lower(hex(md5(raw:ipAddress))) AS ip
    FROM frontend_events;
```

## Tutorial with Docker Compose {#tutorial}

Please check the tutorials:

- [Query Kafka with SQL](tutorial-sql-kafka)
- [Streaming JOIN](tutorial-sql-join)
- [Streaming ETL](tutorial-sql-etl)

## Properties for Kafka client {#properties}

For more advanced use cases, you can specify customized properties while creating the external streams. Those properties will be passed to the underlying Kafka client, which is [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).

For example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events',
         properties='message.max.bytes=1000000;message.timeout.ms=6000'
```

Please note, not all properties in [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) are supported. The following ones are accepted in Proton today. Please check the configuration guide of [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) for details.

| key                                | range                                  | default | description                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enable.idempotence                 | true, false                            | true    | When set to `true`, the producer will ensure that messages are successfully produced exactly once and in the original produce order.                                             |
| message.timeout.ms                 | 0 .. 2147483647                        | 0       | Local message timeout.                                                                                                                                                           |
| queue.buffering.max.messages       | 0 .. 2147483647                        |         | Maximum number of messages allowed on the producer queue.                                                                                                                        |
| queue.buffering.max.kbytes         | 1 .. 2147483647                        |         | Maximum total message size sum allowed on the producer queue.                                                                                                                    |
| queue.buffering.max.ms             | 0 .. 900000                            |         | Delay in milliseconds to wait for messages in the producer queue to accumulate before constructing message batches (MessageSets) to transmit to brokers.                         |
| message.max.bytes                  | 1000 .. 1000000000                     |         | Maximum Kafka protocol request message size.                                                                                                                                     |
| message.send.max.retries           | 0 .. 2147483647                        |         | How many times to retry sending a failing Message.                                                                                                                               |
| retries                            | 0 .. 2147483647                        |         | Alias for `message.send.max.retries`: How many times to retry sending a failing Message.                                                                                         |
| retry.backoff.ms                   | 1 .. 300000                            |         | The backoff time in milliseconds before retrying a protocol request                                                                                                              |
| retry.backoff.max.ms               | 1 .. 300000                            |         | The max backoff time in milliseconds before retrying a protocol request,                                                                                                         |
| batch.num.messages                 | 1 .. 1000000                           |         | Maximum number of messages batched in one MessageSet.                                                                                                                            |
| batch.size                         | 1 .. 2147483647                        |         | Maximum size (in bytes) of all messages batched in one MessageSet, including protocol framing overhead.                                                                          |
| compression.codec                  | none, gzip, snappy, lz4, zstd, inherit |         | Compression codec to use for compressing message sets. inherit = inherit global compression.codec configuration.                                                                 |
| compression.type                   | none, gzip, snappy, lz4, zstd          |         | Alias for `compression.codec`: compression codec to use for compressing message sets.                                                                                            |
| compression.level                  | -1 .. 12                               |         | Compression level parameter for algorithm selected by configuration property `compression.codec`.                                                                                |
| topic.metadata.refresh.interval.ms | -1 .. 3600000                          |         | Period of time in milliseconds at which topic and broker metadata is refreshed in order to proactively discover any new brokers, topics, partitions or partition leader changes. |
