# Kafka External Stream

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). Combining with [Materialized View](proton-create-view#m_view) and [Target Stream](proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## CREATE EXTERNAL STREAM

Currently Timeplus external stream only supports Kafka API as the only type.

To create an external stream in Proton:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..',username='..',password='..',sasl_mechanism='..',data_format='..',kafka_schema_registry_url='..',kafka_schema_registry_credentials='..',ssl_ca_cert_file='..'
```

The supported values for `security_protocol` are:

* PLAINTEXT: when this option is omitted, this is also the default value.
* SASL_SSL: when this value is set, username and password should be specified. 
  * If you need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'`
  * Skipping the SSL certification verfication can be done via `SETTINGS properties='enable.ssl.certificate.verification=false'`. Check [this section](#properties) for details.


The supported values for `sasl_mechanism` are:

* PLAIN: when you set security_protocol to SASL_SSL, this is the default value for sasl_mechanism.
* SCRAM-SHA-256
* SCRAM-SHA-512

The supported values for `data_format` are:

* ProtobufSingle: for single Protobuf message per Kafka message
* Protobuf: there could be multiple Protobuf messages in a single Kafka message.
* Avro: added in Proton 1.5.2

### Connect to local Kafka or Redpanda {#connect-kafka}

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events'
```

### Connect to Confluent Cloud{#connect-confluent}

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='github_events',
         security_protocol='SASL_SSL', 
         username='..', 
         password='..'
```

### Connect to Redpanda Cloud{#connect-rp-cloud}

Example:

```sql
CREATE EXTERNAL STREAM hello(raw string)
SETTINGS type='kafka', 
         brokers='abc.any.us-east-1.mpx.prd.cloud.redpanda.com:9092',
         topic='hello-world',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='..', 
         password='..'
```

### Connect to Aiven for Apache Kafka{#connect-aiven}

You can connect Proton with an Aiven for Apache Kafka service.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin', 
         password='..',
         ssl_ca_cert_file='/kafka.cert'
```

Make sure the `ssl_ca_cert_file` can be accessed via Proton. You can do so via:

```bash
chown timeplus:timeplus kafka.cert
chmod 400 kafka.cert
```

If you want to skip verifying the CA (not recommended), you can create the external stream in the following way:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin', 
         password='..',
         properties='enable.ssl.certificate.verification=false'
```

### Connect to WarpStream{#connect-warp}

You can connect Proton with local deployment of WarpStream or WarpStream Serverless Cloud.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='serverless.prod-z.us-east-1.warpstream.com:9092',
         topic='topic',
         security_protocol='SASL_SSL', 
         username='..', 
         password='..'
```

### Connect to Upstash{#connect-upstash}

You can connect Proton with Upstash Serverless Kafka.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='grizzly-1234-us1-kafka.upstash.io:9092',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='..', 
         password='..'
```

More detailed instructions are available on [Upstash Docs](https://upstash.com/docs/kafka/integrations/proton).

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

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](proton-ingest-api), or set it as the target stream for a materialized view to write message to the Kafka topic. The actual `data_format` value is `RawBLOB` but this can be omitted.

#### Multiple columns to read from Kafka{#multi_col_read}

If the keys in the JSON message never change, or you don't care about the new columns, you can also create the external stream with multiple columns (only available to Proton v1.3.24+). 

You can pick up some top level keys in the JSON as columns, or all possible keys as columns. 

Please note the behaviors are changed in recent versions, based on user feedbacks:

 

| Version         | Default Behavior                                             | How to overwrite                                             |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1.4.2 or above  | Say there are 5 top level key/value pairs in JSON, you can define 5 or less than 5 columns in the external stream. Data will be read properly. | If you don't want to read new events with unexpected columns, set `input_format_skip_unknown_fields=false` in the `CREATE` DDL. |
| 1.3.24 to 1.4.1 | Say there are 5 top level key/value pairs in JSON, you can need to define 5 columns to read them all. Or define less than 5 columns in the DDL, and make sure to add `input_format_skip_unknown_fields=true` in each `SELECT` query settings, otherwise no search result will be returned. | In each `SELECT` query, you can specify the setting `input_format_skip_unknown_fields=true\|false`. |
| 1.3.23 or older | You have to define a single `string` column for the entire JSON document and apply query time JSON parsing to extract fields. | N/A                                                      |

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

You can use `data_format='JSONEachRow'`  to inform Proton to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3), 
    url string, 
    method string, 
    ip string) 
    SETTINGS type='kafka', 
             brokers='redpanda:9092', 
             topic='masked-fe-event', 
             data_format='JSONEachRow';
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

If you need a valid JSON per each Kafka message, instead of a JSONL, please set one_message_per_row=true  e.g.

```sql
CREATE EXTERNAL STREAM target(_tp_time datetime64(3), url string, ip string) 
SETTINGS type='kafka', brokers='redpanda:9092', topic='masked-fe-event',
         data_format='JSONEachRow',one_message_per_row=true
```

The default value of one_message_per_row, if not specified, is false.

:::

##### CSV

You can use `data_format='CSV'`  to inform Proton to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

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

**Read:** since Proton 1.5.4, you can read the message key via the `_message_key` virtual column in the Kafka external stream. If you run `SELECT * FROM ext_stream`, such virtual column won't be queried. You need to explicitly select the column to retrieve the message key, e.g. `SELECT _message_key, * FROM ext_stream`.

**Write:** when you create an external stream and send data to it, via a materialized view or `INSERT`, you can specify how the message key is to be generated.

This is done by the setting `message_key` in the `CREATE` DDL. It is an expression that returns a string value, the values return by the expression will be used as the key for each message. 

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
             data_format='JSONEachRow';

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

* [Query Kafka with SQL](tutorial-sql-kafka)
* [Streaming JOIN](tutorial-sql-join)
* [Streaming ETL](tutorial-sql-etl)

## Properties for Kafka client {#properties}

For more advanced use cases, you can specify customized properties while creating the external streams. Those properties will be passed to the underlying Kafka client, which is [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md). 

For example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events',
         properties='enable.ssl.certificate.verification=false;message.max.bytes=1000000;message.timeout.ms=6000'
```

Please note, not all properties in [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) are supported. The following ones are accepted in Proton today. Please check the configuration guide of [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) for details.

| key                                 | range                                  | default | description                                                  |
| ----------------------------------- | -------------------------------------- | ------- | ------------------------------------------------------------ |
| enable.idempotence                  | true, false                            | true    | When set to `true`, the producer will ensure that messages are successfully produced exactly once and in the original produce order. |
| message.timeout.ms                  | 0 .. 2147483647                        | 0       | Local message timeout.                                       |
| queue.buffering.max.messages        | 0 .. 2147483647                        |         | Maximum number of messages allowed on the producer queue.    |
| queue.buffering.max.kbytes          | 1 .. 2147483647                        |         | Maximum total message size sum allowed on the producer queue. |
| queue.buffering.max.ms              | 0 .. 900000                            |         | Delay in milliseconds to wait for messages in the producer queue to accumulate before constructing message batches (MessageSets) to transmit to brokers. |
| message.max.bytes                   | 1000 .. 1000000000                     |         | Maximum Kafka protocol request message size.                 |
| message.send.max.retries            | 0 .. 2147483647                        |         | How many times to retry sending a failing Message.           |
| retries                             | 0 .. 2147483647                        |         | Alias for `message.send.max.retries`: How many times to retry sending a failing Message. |
| retry.backoff.ms                    | 1 .. 300000                            |         | The backoff time in milliseconds before retrying a protocol reques |
| retry.backoff.max.ms                | 1 .. 300000                            |         | The max backoff time in milliseconds before retrying a protocol request, |
| batch.num.messages                  | 1 .. 1000000                           |         | Maximum number of messages batched in one MessageSet.        |
| batch.size                          | 1 .. 2147483647                        |         | Maximum size (in bytes) of all messages batched in one MessageSet, including protocol framing overhead. |
| compression.codec                   | none, gzip, snappy, lz4, zstd, inherit |         | Compression codec to use for compressing message sets. inherit = inherit global compression.codec configuration. |
| compression.type                    | none, gzip, snappy, lz4, zstd          |         | Alias for `compression.codec`: compression codec to use for compressing message sets. |
| compression.level                   | -1 .. 12                               |         | Compression level parameter for algorithm selected by configuration property `compression.codec`. |
| topic.metadata.refresh.interval.ms  | -1 .. 3600000                          |         | Period of time in milliseconds at which topic and broker metadata is refreshed in order to proactively discover any new brokers, topics, partitions or partition leader changes. |
| enable.ssl.certificate.verification | true,false                             | true    | whether to verify the SSL certification                      |
