# Kafka External Stream

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Timeplus with [External Stream](/external-stream). Combining with [Materialized View](/proton-create-view#m_view) and [Target Stream](/proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## CREATE EXTERNAL STREAM

In Timeplus Proton, the external stream supports Kafka API as the only type.

In Timeplus Enterprise, it also supports [External Stream for Apache Pulsar](/pulsar-external-stream) and [External Stream for other Timeplus deployment](/timeplus-external-stream).

To create an external stream for Apache Kafka or Kafka-compatiable messaging platforms, you can run the following DDL SQL:

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
    ssl_ca_pem='..',
    skip_ssl_cert_check=..
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

- JSONEachRow: parse each row of the message as a single JSON document. The top level JSON key/value pairs will be parsed as the columns. [Learn More](#jsoneachrow).
- CSV: less commonly used. [Learn More](#csv).
- ProtobufSingle: for single Protobuf message per message
- Protobuf: there could be multiple Protobuf messages in a single message.
- Avro: added in Proton 1.5.2
- RawBLOB: the default value. Read/write message as plain text.

:::info

For examples to connect to various Kafka API compatitable message platforms, please check [this doc](/tutorial-sql-connect-kafka).

:::

### Define columns

#### Single column to read {#single_col_read}

If the message in Kafka topic is in plain text format or JSON, you can create an external stream with only a `raw` column in `string` type.

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events
         (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

Then use query time [JSON extraction functions](/functions_for_json) or shortcut to access the values, e.g. `raw:id`.

#### Write to Kafka in Plain Text {#single_col_write}

You can write plain text messages to Kafka topics with an external stream with a single column.

```sql
CREATE EXTERNAL STREAM ext_github_events
         (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](/proton-ingest-api), or set it as the target stream for a materialized view to write message to the Kafka topic. The actual `data_format` value is `RawBLOB` but this can be omitted. By default `one_message_per_row` is `true`.

:::info
Since Timeplus Proton 1.5.11, a new setting `kafka_max_message_size` is available. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message, ensuring it won't exceed the `kafka_max_message_size` limit.
:::

#### Multiple columns to read from Kafka{#multi_col_read}

If the keys in the JSON message never change, or you don't care about the new columns, you can also create the external stream with multiple columns.

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

Protobuf messages can be read with all or partial columns. Please check [this page](/proton-format-schema).

:::

#### Multiple columns to write to Kafka{#multi_col_write}

To write data to Kafka topics, you can choose different data formats:

##### JSONEachRow

You can use `data_format='JSONEachRow',one_message_per_row=true` to inform Timeplus to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

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

Please note, by default multiple JSON documents will be inserted to the same Kafka message. One JSON document each row/line. Such default behavior aims to get the maximum writing performance to Kafka/Redpanda. But you need to make sure the downstream applications are able to properly split the JSON documents per Kafka message.

If you need a valid JSON per each Kafka message, instead of a JSONL, please set `one_message_per_row=true` e.g.

```sql
CREATE EXTERNAL STREAM target(_tp_time datetime64(3), url string, ip string)
SETTINGS type='kafka', brokers='redpanda:9092', topic='masked-fe-event',
         data_format='JSONEachRow',one_message_per_row=true
```

The default value of one_message_per_row, if not specified, is false for `data_format='JSONEachRow'` and true for `data_format='RawBLOB'`.

Since Timeplus Proton 1.5.11, a new setting `kafka_max_message_size` is available. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message and when to create new Kafka message, ensuring each message won't exceed the `kafka_max_message_size` limit.

:::

##### CSV

You can use `data_format='CSV'` to inform Timeplus to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

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

You can either define the [Protobuf Schema in Proton](/proton-format-schema), or specify the [Kafka Schema Registry](/proton-schema-registry) when you create the external stream.

##### Avro

Starting from Proton 1.5.2, you can use Avro format when you specify the [Kafka Schema Registry](/proton-schema-registry) when you create the external stream.

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

Based on user feedback, we introduced a better way to read or write the message key. Starting from timeplusd 2.3.10, you can define the `_tp_message_key` column when you create the external stream. This new approach provides more intuitive and flexible way to write any content as the message key, not necessarily mapping to a specify column or a set of columns.

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
`'some-key'` will be used for the message key for the Kafka message (and it will be excluded from the message body, so the message will be `{"id": 1, "name": "John"}` for the above SQL).

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
DROP STREAM [IF EXISTS] stream_name
```

## Query Kafka Data with SQL

You can run streaming SQL on the external stream, e.g.

```sql
SELECT raw:timestamp, raw:car_id, raw:event FROM ext_stream WHERE raw:car_type in (1,2,3);
SELECT window_start, count() FROM tumble(ext_stream,to_datetime(raw:timestamp)) GROUP BY window_start;
```

### Read existing messages {#rewind}

When you run `SELECT raw FROM ext_stream `, Timeplus will read the new messages in the topics, not the existing ones. If you need to read all existing messages, you can use the following settings:

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='earliest'
```

Or the following SQL if you are running Proton 1.5.9 or above:

```sql
SELECT raw FROM table(ext_stream) WHERE ...
```

:::warning
Please avoid scanning all data via `select * from table(ext_stream)`. However `select count(*) from table(ext_stream)` is optimized to get the number of current message count from the Kafka topic.
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

- [Query Kafka with SQL](/tutorial-sql-kafka)
- [Streaming JOIN](/tutorial-sql-join)
- [Streaming ETL](/tutorial-sql-etl)

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

(C/P legend: C = Consumer, P = Producer, * = both)


Property                                 | C/P | Range           |       Default | Importance | Description
-----------------------------------------|-----|-----------------|--------------:|------------| --------------------------
client.id                                |  *  |                 |       rdkafka | low        | Client identifier.  *Type: string*
message.max.bytes                        |  *  | 1000 .. 1000000000 |       1000000 | medium     | Maximum Kafka protocol request message size. Due to differing framing overhead between protocol versions the producer is unable to reliably enforce a strict max message limit at produce time and may exceed the maximum size by one message in protocol ProduceRequests, the broker will enforce the topic's `max.message.bytes` limit (see Apache Kafka documentation).  *Type: integer*
message.copy.max.bytes                   |  *  | 0 .. 1000000000 |         65535 | low        | Maximum size for message to be copied to buffer. Messages larger than this will be passed by reference (zero-copy) at the expense of larger iovecs.  *Type: integer*
receive.message.max.bytes                |  *  | 1000 .. 2147483647 |     100000000 | medium     | Maximum Kafka protocol response message size. This serves as a safety precaution to avoid memory exhaustion in case of protocol hickups. This value must be at least `fetch.max.bytes`  + 512 to allow for protocol overhead; the value is adjusted automatically unless the configuration property is explicitly set.  *Type: integer*
max.in.flight.requests.per.connection    |  *  | 1 .. 1000000    |       1000000 | low        | Maximum number of in-flight requests per broker connection. This is a generic property applied to all broker communication, however it is primarily relevant to produce requests. In particular, note that other mechanisms limit the number of outstanding consumer fetch request per broker to one.  *Type: integer*
max.in.flight                            |  *  | 1 .. 1000000    |       1000000 | low        | Alias for `max.in.flight.requests.per.connection`: Maximum number of in-flight requests per broker connection. This is a generic property applied to all broker communication, however it is primarily relevant to produce requests. In particular, note that other mechanisms limit the number of outstanding consumer fetch request per broker to one.  *Type: integer*
metadata.request.timeout.ms              |  *  | 10 .. 900000    |         60000 | low        | Non-topic request timeout in milliseconds. This is for metadata requests, etc.  *Type: integer*
topic.metadata.refresh.interval.ms       |  *  | -1 .. 3600000   |        300000 | low        | Period of time in milliseconds at which topic and broker metadata is refreshed in order to proactively discover any new brokers, topics, partitions or partition leader changes. Use -1 to disable the intervalled refresh (not recommended). If there are no locally referenced topics (no topic objects created, no messages produced, no subscription or no assignment) then only the broker list will be refreshed every interval but no more often than every 10s.  *Type: integer*
metadata.max.age.ms                      |  *  | 1 .. 86400000   |        900000 | low        | Metadata cache max age. Defaults to topic.metadata.refresh.interval.ms * 3  *Type: integer*
topic.metadata.refresh.fast.interval.ms  |  *  | 1 .. 60000      |           250 | low        | When a topic loses its leader a new metadata request will be enqueued with this initial interval, exponentially increasing until the topic metadata has been refreshed. This is used to recover quickly from transitioning leader brokers.  *Type: integer*
topic.metadata.refresh.fast.cnt          |  *  | 0 .. 1000       |            10 | low        | **DEPRECATED** No longer used.  *Type: integer*
topic.metadata.refresh.sparse            |  *  | true, false     |          true | low        | Sparse metadata requests (consumes less network bandwidth)  *Type: boolean*
topic.metadata.propagation.max.ms        |  *  | 0 .. 3600000    |         30000 | low        | Apache Kafka topic creation is asynchronous and it takes some time for a new topic to propagate throughout the cluster to all brokers. If a client requests topic metadata after manual topic creation but before the topic has been fully propagated to the broker the client is requesting metadata from, the topic will seem to be non-existent and the client will mark the topic as such, failing queued produced messages with `ERR__UNKNOWN_TOPIC`. This setting delays marking a topic as non-existent until the configured propagation max time has passed. The maximum propagation time is calculated from the time the topic is first referenced in the client, e.g., on produce().  *Type: integer*
topic.blacklist                          |  *  |                 |               | low        | Topic blacklist, a comma-separated list of regular expressions for matching topic names that should be ignored in broker metadata information as if the topics did not exist.  *Type: pattern list*
debug                                    |  *  | generic, broker, topic, metadata, feature, queue, msg, protocol, cgrp, security, fetch, interceptor, plugin, consumer, admin, eos, mock, assignor, conf, all |               | medium     | A comma-separated list of debug contexts to enable. Detailed Producer debugging: broker,topic,msg. Consumer: consumer,cgrp,topic,fetch  *Type: CSV flags*
socket.timeout.ms                        |  *  | 10 .. 300000    |         60000 | low        | Default timeout for network requests. Producer: ProduceRequests will use the lesser value of `socket.timeout.ms` and remaining `message.timeout.ms` for the first message in the batch. Consumer: FetchRequests will use `fetch.wait.max.ms` + `socket.timeout.ms`. Admin: Admin requests will use `socket.timeout.ms` or explicitly set `rd_kafka_AdminOptions_set_operation_timeout()` value.  *Type: integer*
socket.blocking.max.ms                   |  *  | 1 .. 60000      |          1000 | low        | **DEPRECATED** No longer used.  *Type: integer*
socket.send.buffer.bytes                 |  *  | 0 .. 100000000  |             0 | low        | Broker socket send buffer size. System default is used if 0.  *Type: integer*
socket.receive.buffer.bytes              |  *  | 0 .. 100000000  |             0 | low        | Broker socket receive buffer size. System default is used if 0.  *Type: integer*
socket.keepalive.enable                  |  *  | true, false     |         false | low        | Enable TCP keep-alives (SO_KEEPALIVE) on broker sockets  *Type: boolean*
socket.nagle.disable                     |  *  | true, false     |         false | low        | Disable the Nagle algorithm (TCP_NODELAY) on broker sockets.  *Type: boolean*
socket.max.fails                         |  *  | 0 .. 1000000    |             1 | low        | Disconnect from broker when this number of send failures (e.g., timed out requests) is reached. Disable with 0. WARNING: It is highly recommended to leave this setting at its default value of 1 to avoid the client and broker to become desynchronized in case of request timeouts. NOTE: The connection is automatically re-established.  *Type: integer*
broker.address.ttl                       |  *  | 0 .. 86400000   |          1000 | low        | How long to cache the broker address resolving results (milliseconds).  *Type: integer*
broker.address.family                    |  *  | any, v4, v6     |           any | low        | Allowed broker IP address families: any, v4, v6  *Type: enum value*
reconnect.backoff.jitter.ms              |  *  | 0 .. 3600000    |             0 | low        | **DEPRECATED** No longer used. See `reconnect.backoff.ms` and `reconnect.backoff.max.ms`.  *Type: integer*
reconnect.backoff.ms                     |  *  | 0 .. 3600000    |           100 | medium     | The initial time to wait before reconnecting to a broker after the connection has been closed. The time is increased exponentially until `reconnect.backoff.max.ms` is reached. -25% to +50% jitter is applied to each reconnect backoff. A value of 0 disables the backoff and reconnects immediately.  *Type: integer*
reconnect.backoff.max.ms                 |  *  | 0 .. 3600000    |         10000 | medium     | The maximum time to wait before reconnecting to a broker after the connection has been closed.  *Type: integer*
statistics.interval.ms                   |  *  | 0 .. 86400000   |             0 | high       | librdkafka statistics emit interval. The application also needs to register a stats callback using `rd_kafka_conf_set_stats_cb()`. The granularity is 1000ms. A value of 0 disables statistics.  *Type: integer*
log_level                                |  *  | 0 .. 7          |             6 | low        | Logging level (syslog(3) levels)  *Type: integer*
log.thread.name                          |  *  | true, false     |          true | low        | Print internal thread name in log messages (useful for debugging librdkafka internals)  *Type: boolean*
log.connection.close                     |  *  | true, false     |          true | low        | Log broker disconnects. It might be useful to turn this off when interacting with 0.9 brokers with an aggressive `connection.max.idle.ms` value.  *Type: boolean*
api.version.request.timeout.ms           |  *  | 1 .. 300000     |         10000 | low        | Timeout for broker API version requests.  *Type: integer*
api.version.fallback.ms                  |  *  | 0 .. 604800000  |             0 | medium     | Dictates how long the `broker.version.fallback` fallback is used in the case the ApiVersionRequest fails. **NOTE**: The ApiVersionRequest is only issued when a new connection to the broker is made (such as after an upgrade).  *Type: integer*
broker.version.fallback                  |  *  |                 |        0.10.0 | medium     | Older broker versions (before 0.10.0) provide no way for a client to query for supported protocol features (ApiVersionRequest, see `api.version.request`) making it impossible for the client to know what features it may use. As a workaround a user may set this property to the expected broker version and the client will automatically adjust its feature set accordingly if the ApiVersionRequest fails (or is disabled). The fallback broker version will be used for `api.version.fallback.ms`. Valid values are: 0.9.0, 0.8.2, 0.8.1, 0.8.0. Any other value >= 0.10, such as 0.10.2.1, enables ApiVersionRequests.  *Type: string*
ssl.cipher.suites                        |  *  |                 |               | low        | A cipher suite is a named combination of authentication, encryption, MAC and key exchange algorithm used to negotiate the security settings for a network connection using TLS or SSL network protocol. See manual page for `ciphers(1)` and `SSL_CTX_set_cipher_list(3).  *Type: string*
ssl.curves.list                          |  *  |                 |               | low        | The supported-curves extension in the TLS ClientHello message specifies the curves (standard/named, or 'explicit' GF(2^k) or GF(p)) the client is willing to have the server use. See manual page for `SSL_CTX_set1_curves_list(3)`. OpenSSL >= 1.0.2 required.  *Type: string*
ssl.sigalgs.list                         |  *  |                 |               | low        | The client uses the TLS ClientHello signature_algorithms extension to indicate to the server which signature/hash algorithm pairs may be used in digital signatures. See manual page for `SSL_CTX_set1_sigalgs_list(3)`. OpenSSL >= 1.0.2 required.  *Type: string*
ssl.key.location                         |  *  |                 |               | low        | Path to client's private key (PEM) used for authentication.  *Type: string*
ssl.key.password                         |  *  |                 |               | low        | Private key passphrase (for use with `ssl.key.location` and `set_ssl_cert()`)  *Type: string*
ssl.key.pem                              |  *  |                 |               | low        | Client's private key string (PEM format) used for authentication.  *Type: string*
ssl.certificate.location                 |  *  |                 |               | low        | Path to client's public key (PEM) used for authentication.  *Type: string*
ssl.certificate.pem                      |  *  |                 |               | low        | Client's public key string (PEM format) used for authentication.  *Type: string*
ssl.ca.location                          |  *  |                 |               | low        | File or directory path to CA certificate(s) for verifying the broker's key. Defaults: On Windows the system's CA certificates are automatically looked up in the Windows Root certificate store. On Mac OSX this configuration defaults to `probe`. It is recommended to install openssl using Homebrew, to provide CA certificates. On Linux install the distribution's ca-certificates package. If OpenSSL is statically linked or `ssl.ca.location` is set to `probe` a list of standard paths will be probed and the first one found will be used as the default CA certificate location path. If OpenSSL is dynamically linked the OpenSSL library's default path will be used (see `OPENSSLDIR` in `openssl version -a`).  *Type: string*
ssl.ca.certificate.stores                |  *  |                 |          Root | low        | Comma-separated list of Windows Certificate stores to load CA certificates from. Certificates will be loaded in the same order as stores are specified. If no certificates can be loaded from any of the specified stores an error is logged and the OpenSSL library's default CA location is used instead. Store names are typically one or more of: MY, Root, Trust, CA.  *Type: string*
ssl.crl.location                         |  *  |                 |               | low        | Path to CRL for verifying broker's certificate validity.  *Type: string*
ssl.keystore.location                    |  *  |                 |               | low        | Path to client's keystore (PKCS#12) used for authentication.  *Type: string*
ssl.keystore.password                    |  *  |                 |               | low        | Client's keystore (PKCS#12) password.  *Type: string*
enable.ssl.certificate.verification      |  *  | true, false     |          true | low        | Enable OpenSSL's builtin broker (server) certificate verification. This verification can be extended by the application by implementing a certificate_verify_cb.  *Type: boolean*
ssl.endpoint.identification.algorithm    |  *  | none, https     |          none | low        | Endpoint identification algorithm to validate broker hostname using broker certificate. https - Server (broker) hostname verification as specified in RFC2818. none - No endpoint verification. OpenSSL >= 1.0.2 required.  *Type: enum value*
ssl.certificate.verify_cb                |  *  |                 |               | low        | Callback to verify the broker certificate chain.  *Type: see dedicated API*
sasl.kerberos.service.name               |  *  |                 |         kafka | low        | Kerberos principal name that Kafka runs as, not including /hostname@REALM  *Type: string*
sasl.kerberos.principal                  |  *  |                 |   kafkaclient | low        | This client's Kerberos principal name. (Not supported on Windows, will use the logon user's principal).  *Type: string*
sasl.kerberos.kinit.cmd                  |  *  |                 |
sasl.kerberos.keytab                     |  *  |                 |               | low        | Path to Kerberos keytab file. This configuration property is only used as a variable in `sasl.kerberos.kinit.cmd` as ` ... -t "%{sasl.kerberos.keytab}"`.  *Type: string*
sasl.kerberos.min.time.before.relogin    |  *  | 0 .. 86400000   |         60000 | low        | Minimum time in milliseconds between key refresh attempts. Disable automatic key refresh by setting this property to 0.  *Type: integer*
sasl.password                            |  *  |                 |               | high       | SASL password for use with the PLAIN and SASL-SCRAM-.. mechanism  *Type: string*
sasl.oauthbearer.config                  |  *  |                 |               | low        | SASL/OAUTHBEARER configuration. The format is implementation-dependent and must be parsed accordingly. The default unsecured token implementation (see https://tools.ietf.org/html/rfc7515#appendix-A.5) recognizes space-separated name=value pairs with valid names including principalClaimName, principal, scopeClaimName, scope, and lifeSeconds. The default value for principalClaimName is "sub", the default value for scopeClaimName is "scope", and the default value for lifeSeconds is 3600. The scope value is CSV format with the default value being no/empty scope. For example: `principalClaimName=azp principal=admin scopeClaimName=roles scope=role1,role2 lifeSeconds=600`. In addition, SASL extensions can be communicated to the broker via `extension_NAME=value`. For example: `principal=admin extension_traceId=123`  *Type: string*
enable.sasl.oauthbearer.unsecure.jwt     |  *  | true, false     |         false | low        | Enable the builtin unsecure JWT OAUTHBEARER token handler if no oauthbearer_refresh_cb has been set. This builtin handler should only be used for development or testing, and not in production.  *Type: boolean*
partition.assignment.strategy            |  C  |                 | range,roundrobin | medium     | The name of one or more partition assignment strategies. The elected group leader will use a strategy supported by all members of the group to assign partitions to group members. If there is more than one eligible strategy, preference is determined by the order of this list (strategies earlier in the list have higher priority). Cooperative and non-cooperative (eager) strategies must not be mixed. Available strategies: range, roundrobin, cooperative-sticky.  *Type: string*
session.timeout.ms                       |  C  | 1 .. 3600000    |         10000 | high       | Client group session and failure detection timeout. The consumer sends periodic heartbeats (heartbeat.interval.ms) to indicate its liveness to the broker. If no hearts are received by the broker for a group member within the session timeout, the broker will remove the consumer from the group and trigger a rebalance. The allowed range is configured with the **broker** configuration properties `group.min.session.timeout.ms` and `group.max.session.timeout.ms`. Also see `max.poll.interval.ms`.  *Type: integer*
heartbeat.interval.ms                    |  C  | 1 .. 3600000    |          3000 | low        | Group session keepalive heartbeat interval.  *Type: integer*
group.protocol.type                      |  C  |                 |      consumer | low        | Group protocol type. NOTE: Currently, the only supported group protocol type is `consumer`.  *Type: string*
coordinator.query.interval.ms            |  C  | 1 .. 3600000    |        600000 | low        | How often to query for the current client group coordinator. If the currently assigned coordinator is down the configured query interval will be divided by ten to more quickly recover in case of coordinator reassignment.  *Type: integer*
max.poll.interval.ms                     |  C  | 1 .. 86400000   |        300000 | high       | Maximum allowed time between calls to consume messages (e.g., rd_kafka_consumer_poll()) for high-level consumers. If this interval is exceeded the consumer is considered failed and the group will rebalance in order to reassign the partitions to another consumer group member. Warning: Offset commits may be not possible at this point. Note: It is recommended to set `enable.auto.offset.store=false` for long-time processing applications and then explicitly store offsets (using offsets_store()) *after* message processing, to make sure offsets are not auto-committed prior to processing has finished. The interval is checked two times per second. See KIP-62 for more information.  *Type: integer*
auto.commit.interval.ms                  |  C  | 0 .. 86400000   |          5000 | medium     | The frequency in milliseconds that the consumer offsets are committed (written) to offset storage. (0 = disable). This setting is used by the high-level consumer.  *Type: integer*
queued.min.messages                      |  C  | 1 .. 10000000   |        100000 | medium     | Minimum number of messages per topic+partition librdkafka tries to maintain in the local consumer queue.  *Type: integer*
queued.max.messages.kbytes               |  C  | 1 .. 2097151    |         65536 | medium     | Maximum number of kilobytes of queued pre-fetched messages in the local consumer queue. If using the high-level consumer this setting applies to the single consumer queue, regardless of the number of partitions. When using the legacy simple consumer or when separate partition queues are used this setting applies per partition. This value may be overshot by fetch.message.max.bytes. This property has higher priority than queued.min.messages.  *Type: integer*
fetch.wait.max.ms                        |  C  | 0 .. 300000     |           500 | low        | Maximum time the broker may wait to fill the Fetch response with fetch.min.bytes of messages.  *Type: integer*
fetch.message.max.bytes                  |  C  | 1 .. 1000000000 |       1048576 | medium     | Initial maximum number of bytes per topic+partition to request when fetching messages from the broker. If the client encounters a message larger than this value it will gradually try to increase it until the entire message can be fetched.  *Type: integer*
max.partition.fetch.bytes                |  C  | 1 .. 1000000000 |       1048576 | medium     | Alias for `fetch.message.max.bytes`: Initial maximum number of bytes per topic+partition to request when fetching messages from the broker. If the client encounters a message larger than this value it will gradually try to increase it until the entire message can be fetched.  *Type: integer*
fetch.max.bytes                          |  C  | 0 .. 2147483135 |      52428800 | medium     | Maximum amount of data the broker shall return for a Fetch request. Messages are fetched in batches by the consumer and if the first message batch in the first non-empty partition of the Fetch request is larger than this value, then the message batch will still be returned to ensure the consumer can make progress. The maximum message batch size accepted by the broker is defined via `message.max.bytes` (broker config) or `max.message.bytes` (broker topic config). `fetch.max.bytes` is automatically adjusted upwards to be at least `message.max.bytes` (consumer config).  *Type: integer*
fetch.min.bytes                          |  C  | 1 .. 100000000  |             1 | low        | Minimum number of bytes the broker responds with. If fetch.wait.max.ms expires the accumulated data will be sent to the client regardless of this setting.  *Type: integer*
fetch.error.backoff.ms                   |  C  | 0 .. 300000     |           500 | medium     | How long to postpone the next fetch request for a topic+partition in case of a fetch error.  *Type: integer*
offset.store.method                      |  C  | none, file, broker |        broker | low        | **DEPRECATED** Offset commit store method: 'file' - DEPRECATED: local file store (offset.store.path, et.al), 'broker' - broker commit store (requires Apache Kafka 0.8.2 or later on the broker).  *Type: enum value*
isolation.level                          |  C  | read_uncommitted, read_committed | read_committed | high       | Controls how to read messages written transactionally: `read_committed` - only return transactional messages which have been committed. `read_uncommitted` - return all messages, even transactional messages which have been aborted.  *Type: enum value*
check.crcs                               |  C  | true, false     |         false | medium     | Verify CRC32 of consumed messages, ensuring no on-the-wire or on-disk corruption to the messages occurred. This check comes at slightly increased CPU usage.  *Type: boolean*
allow.auto.create.topics                 |  C  | true, false     |         false | low        | Allow automatic topic creation on the broker when subscribing to or assigning non-existent topics. The broker must also be configured with `auto.create.topics.enable=true` for this configuraiton to take effect. Note: The default value (false) is different from the Java consumer (true). Requires broker version >= 0.11.0.0, for older broker versions only the broker configuration applies.  *Type: boolean*
client.rack                              |  *  |                 |               | low        | A rack identifier for this client. This can be any string value which indicates where this client is physically located. It corresponds with the broker config `broker.rack`.  *Type: string*
transactional.id                         |  P  |                 |               | high       | Enables the transactional producer. The transactional.id is used to identify the same transactional producer instance across process restarts. It allows the producer to guarantee that transactions corresponding to earlier instances of the same producer have been finalized prior to starting any new transactions, and that any zombie instances are fenced off. If no transactional.id is provided, then the producer is limited to idempotent delivery (if enable.idempotence is set). Requires broker version >= 0.11.0.  *Type: string*
transaction.timeout.ms                   |  P  | 1000 .. 2147483647 |         60000 | medium     | The maximum amount of time in milliseconds that the transaction coordinator will wait for a transaction status update from the producer before proactively aborting the ongoing transaction. If this value is larger than the `transaction.max.timeout.ms` setting in the broker, the init_transactions() call will fail with ERR_INVALID_TRANSACTION_TIMEOUT. The transaction timeout automatically adjusts `message.timeout.ms` and `socket.timeout.ms`, unless explicitly configured in which case they must not exceed the transaction timeout (`socket.timeout.ms` must be at least 100ms lower than `transaction.timeout.ms`). This is also the default timeout value if no timeout (-1) is supplied to the transactional API methods.  *Type: integer*
enable.idempotence                       |  P  | true, false     |         false | high       | When set to `true`, the producer will ensure that messages are successfully produced exactly once and in the original produce order. The following configuration properties are adjusted automatically (if not modified by the user) when idempotence is enabled: `max.in.flight.requests.per.connection=5` (must be less than or equal to 5), `retries=INT32_MAX` (must be greater than 0), `acks=all`, `queuing.strategy=fifo`. Producer instantation will fail if user-supplied configuration is incompatible.  *Type: boolean*
enable.gapless.guarantee                 |  P  | true, false     |         false | low        | **EXPERIMENTAL**: subject to change or removal. When set to `true`, any error that could result in a gap in the produced message series when a batch of messages fails, will raise a fatal error (ERR__GAPLESS_GUARANTEE) and stop the producer. Messages failing due to `message.timeout.ms` are not covered by this guarantee. Requires `enable.idempotence=true`.  *Type: boolean*
queue.buffering.max.messages             |  P  | 1 .. 10000000   |        100000 | high       | Maximum number of messages allowed on the producer queue. This queue is shared by all topics and partitions.  *Type: integer*
queue.buffering.max.kbytes               |  P  | 1 .. 2147483647 |       1048576 | high       | Maximum total message size sum allowed on the producer queue. This queue is shared by all topics and partitions. This property has higher priority than queue.buffering.max.messages.  *Type: integer*
queue.buffering.max.ms                   |  P  | 0 .. 900000     |             5 | high       | Delay in milliseconds to wait for messages in the producer queue to accumulate before constructing message batches (MessageSets) to transmit to brokers. A higher value allows larger and more effective (less overhead, improved compression) batches of messages to accumulate at the expense of increased message delivery latency.  *Type: float*
linger.ms                                |  P  | 0 .. 900000     |             5 | high       | Alias for `queue.buffering.max.ms`: Delay in milliseconds to wait for messages in the producer queue to accumulate before constructing message batches (MessageSets) to transmit to brokers. A higher value allows larger and more effective (less overhead, improved compression) batches of messages to accumulate at the expense of increased message delivery latency.  *Type: float*
message.send.max.retries                 |  P  | 0 .. 2147483647 |    2147483647 | high       | How many times to retry sending a failing Message. **Note:** retrying may cause reordering unless `enable.idempotence` is set to true.  *Type: integer*
retries                                  |  P  | 0 .. 2147483647 |    2147483647 | high       | Alias for `message.send.max.retries`: How many times to retry sending a failing Message. **Note:** retrying may cause reordering unless `enable.idempotence` is set to true.  *Type: integer*
retry.backoff.ms                         |  P  | 1 .. 300000     |           100 | medium     | The backoff time in milliseconds before retrying a protocol request.  *Type: integer*
queue.buffering.backpressure.threshold   |  P  | 1 .. 1000000    |             1 | low        | The threshold of outstanding not yet transmitted broker requests needed to backpressure the producer's message accumulator. If the number of not yet transmitted requests equals or exceeds this number, produce request creation that would have otherwise been triggered (for example, in accordance with linger.ms) will be delayed. A lower number yields larger and more effective batches. A higher value can improve latency when using compression on slow machines.  *Type: integer*
compression.codec                        |  P  | none, gzip, snappy, lz4, zstd |          none | medium     | compression codec to use for compressing message sets. This is the default value for all topics, may be overridden by the topic configuration property `compression.codec`.   *Type: enum value*
compression.type                         |  P  | none, gzip, snappy, lz4, zstd |          none | medium     | Alias for `compression.codec`: compression codec to use for compressing message sets. This is the default value for all topics, may be overridden by the topic configuration property `compression.codec`.   *Type: enum value*
batch.num.messages                       |  P  | 1 .. 1000000    |         10000 | medium     | Maximum number of messages batched in one MessageSet. The total MessageSet size is also limited by batch.size and message.max.bytes.  *Type: integer*
batch.size                               |  P  | 1 .. 2147483647 |       1000000 | medium     | Maximum size (in bytes) of all messages batched in one MessageSet, including protocol framing overhead. This limit is applied after the first message has been added to the batch, regardless of the first message's size, this is to ensure that messages that exceed batch.size are produced. The total MessageSet size is also limited by batch.num.messages and message.max.bytes.  *Type: integer*
delivery.report.only.error               |  P  | true, false     |         false | low        | Only provide delivery reports for failed messages.  *Type: boolean*
sticky.partitioning.linger.ms            |  P  | 0 .. 900000     |            10 | low        | Delay in milliseconds to wait to assign new sticky partitions for each topic. By default, set to double the time of linger.ms. To disable sticky behavior, set to 0. This behavior affects messages with the key NULL in all cases, and messages with key lengths of zero when the consistent_random partitioner is in use. These messages would otherwise be assigned randomly. A higher value allows for more effective batching of these messages.  *Type: integer*


## Limitations

There are some limitations for the Kafka-based external streams, because Timeplus doesn’t control the storage or the data format for the external stream.

1. The UI wizard to setup Kafka External Stream only supports JSON or TEXT. To use Avro, Protobuf, or schema registry service, you need the SQL DDL.
2. `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_append_time` is set only when message timestamp is an append time.
3. Unlike normal streams, there is no historical storage for the external streams. In recent versions, you can run `table(kafka_ext_stream)` but it will scan all messages in the topic, unless you are running a `count()`. If you need to frequently run query for historical data, you can use a Materialized View to query the Kafka External Stream and save the data in Timeplus columnar or row storage. This will improve the query performance.
4. There is no retention policy for the external streams in Timeplus. You need to configure the retention policy on Kafka/Confluent/Redpanda. If the data is no longer available in the external systems, they cannot be searched in Timeplus either.
