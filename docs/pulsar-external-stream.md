# Pulsar External Stream

[Apache® Pulsar™](https://pulsar.apache.org/) is a multi-tenant, high-performance solution for server-to-server messaging.

In [Timeplus Enterprise v2.5](/) (unreleased yet), we added the first-class integration for Apache Pulsar, as a new type of [External Stream](/external-stream). You can read or write data in Apache Pulsar or StreamNative Cloud.

## CREATE EXTERNAL STREAM

To create an external stream for Apache Pulsar, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
    (<col_name1> <col_type>)
SETTINGS
    type='pulsar', -- required
    service_url='pulsar://host:port',-- required
    topic='..', -- required
    jwt='..',
    data_format='..',
    format_schema='..',
    one_message_per_row=..,
    skip_server_cert_check=..,
    validate_hostname=..,
    ca_cert='..',
    client_cert='..',
    client_key='..',
    connections_per_broker=..,
    memory_limit=..,
    io_threads=..
```
### Connect to a local Apache Pulsar

If you have a local Apache Pulsar server running, you can run the following SQL DDL to create an external stream to connect to it.

```sql
CREATE EXTERNAL STREAM local_pulsar (raw string)
SETTINGS type='pulsar',
         service_url='pulsar://localhost:6650',
         topic='persistent://public/default/my-topic'
```

### Connect to StreamNative Cloud
If you have the access to [StreamNative Cloud](https://console.streamnative.cloud), you can run the following SQL DDL to create an external stream to connect to it, with a proper [API Key](https://docs.streamnative.io/docs/api-keys-overview) for a service account. Make sure you choose "Create API Key", instead of the "Get JWT Token (Depreciated)".

![screenshot](/img/pulsar_api_key.png)

```sql
CREATE EXTERNAL STREAM ext_stream (raw string)
SETTINGS type='pulsar',
         service_url='pulsar+ssl://pc-12345678.gcp-shared-usce1.g.snio.cloud:6651',
         topic='persistent://tenant/namespace/topic',
         jwt='eyJh..syFQ'
```

### DDL Settings

#### skip_server_cert_check
Default false. If set to true, it will accept untrusted TLS certificates from brokers.

#### validate_hostname

Default false. Configure whether it allows validating hostname verification when a client connects to a broker over TLS.
#### ca_cert
The CA certificate (PEM format), which will be used to verify the server's certificate.
#### client_cert
The certificate (PEM format) for the client to use mTLS authentication. [Learn more](https://pulsar.apache.org/docs/3.3.x/security-tls-authentication/).
#### client_key
The private key (PEM format) for the client to use mTLS authentication.
#### jwt
The JSON Web Tokens for the client to use JWT authentication. [Learn more](https://docs.streamnative.io/docs/api-keys-overview).
#### connections_per_broker
Default 1. Sets the max number of connection that this external stream will open to a single broker. By default, the connection pool will use a single connection for all the producers and consumers.
#### memory_limit
Default 0 (unlimited). Configure a limit on the amount of memory that will be allocated by this external stream.
#### io_threads
Default 1. Set the number of I/O threads to be used by the Pulsar client.

Like [Kafka External Stream](/proton-kafka), Pulsar External Stream also supports all format related settings: `data_format`, `format_schema`, `one_message_per_row`, etc.

#### data_format
The supported values for `data_format` are:

- JSONEachRow: parse each row of the message as a single JSON document. The top level JSON key/value pairs will be parsed as the columns. [Learn More](#jsoneachrow).
- CSV: less commonly used. [Learn More](#csv).
- TSV: similar to CSV but tab as the separator
- ProtobufSingle: for single Protobuf message per message
- Protobuf: there could be multiple Protobuf messages in a single message.
- Avro
- RawBLOB: the default value. Read/write message as plain text.

For data formats which write multiple rows into one single message (such as `JSONEachRow` or `CSV`), two more advanced settings are available:

#### max_insert_block_size
`max_insert_block_size` to control the maximum number of rows can be written into one message.

#### max_insert_block_bytes
`max_insert_block_bytes` to control the maximum size (in bytes) that one message can be.

## Read Data in Pulsar
### Read messages in a single column {#single_col_read}

If the message in Pulsar topic is in plain text format or JSON, you can create an external stream with only a `raw` column in `string` type.

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events (raw string)
SETTINGS type='pulsar', service_url='pulsar://host:port', topic='..'
```

Then use query time [JSON extraction functions](/functions_for_json) or shortcut to access the values, e.g. `raw:id`.

### Read messages as multiple columns{#multi_col_read}

If the keys in the JSON message never change, or you don't care about the new columns, you can also create the external stream with multiple columns.

You can pick up some top level keys in the JSON as columns, or all possible keys as columns.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream_parsed
    (address string, firstName string, middleName string, lastName string, email string, username string, password string,sex string,telephoneNumber string, dateOfBirth int64, age uint8, company string,companyEmail string,nationalIdentityCardNumber string,nationalIdentificationNumber string,
    passportNumber string)
SETTINGS type='pulsar',
         service_url='pulsar+ssl://pc-12345678.gcp-shared-usce1.g.snio.cloud:6651',
         topic='persistent://docs/ns/datagen',
         data_format='JSONEachRow',
         jwt='eyJhb..syFQ'
```

If there are nested complex JSON in the message, you can define the column as a string type. Actually any JSON value can be saved in a string column.

### Virtual Columns

Pulsar external stream has the follow virtual columns:
#### _tp_time
the event time of the Pulsar message if it's available, or it's the publish time otherwise.
#### _tp_append_time
the publish time of the pulsar message.
#### _tp_process_time
the timestamp when the message was read by Pulsar External Stream.
#### _tp_shard
the partition ID, starting from 0.
#### _pulsar_message_id
an `array` which contains 4 elements: ledger_id, entry_id, partition, and batch_index.
#### _tp_sn
the sequence number in Timeplus, in int64 type.
#### _tp_message_key
the message key (a.k.a partition key). Can be empty.

### Query Settings
#### shards
You can read in specified Pulsar partitions. By default, all partitions will be read. But you can also read from a single partition via the `shards` setting, e.g.

```sql
SELECT raw FROM ext_stream SETTINGS shards='0'
```

Or you can specify a set of partition ID, separated by comma, e.g.

```sql
SELECT raw FROM ext_stream SETTINGS shards='0,2'
```

#### record_consume_timeout_ms
Use setting `record_consume_timeout_ms` to determine how much time the external can wait for new messages before returning the query result. The smaller the value is, the smaller the latency will be, but also will be less performant.

### Read existing messages {#rewind}

When you run `SELECT raw FROM ext_stream `, Timeplus will read the new messages in the topics, not the existing ones.
#### seek_to
If you need to read all existing messages, you can use the following settings:

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='earliest'
```

Or the following SQL:

```sql
SELECT raw FROM table(ext_stream) WHERE ...
```
Note: both `earliest` and `latest` are supported. You can also use `seek_to='2024-10-14'` for date or datetime based rewind. But number-based seek_to is not supported.


:::warning
Please avoid scanning all existing data via `select * from table(ext_stream)`.
:::

### Read/Write Pulsar Message Key {#messagekey}

For each message in the topic, the value is critical for sure. The key is optional but could carry important meta data.

You can define the `_tp_message_key` column when you create the external stream.

For example:
```sql
CREATE EXTERNAL STREAM test_msg_key (
    id int32,
    name string,
    _tp_message_key string
)  SETTINGS type='pulsar',
                      service_url='pulsar://host.docker.internal:6650',
                      topic='persistent://public/default/msg-key'
```
You can insert any data to the Pulsar topic.

When insert a row to the stream like:
```sql
INSERT INTO test_msg_key(id,name,_tp_message_key) VALUES (1, 'John', 'some-key');
```
`'some-key'` will be used for the message key for the Pulsar message (and it will be excluded from the message body, so the message will be `{"id": 1, "name": "John"}` for the above SQL).

When doing a SELECT query, the message key will be populated to the `_tp_message_key` column as well.
`SELECT * FROM test_msg_key` will return `'some-key'` for the `_tp_message_key` message.

`_tp_message_key` support the following types: `uint8`, `uint16`, `uint32`, `uint64`, `int8`, `int16`, `int32`, `int64`, `bool`, `float32`, `float64`, `string`, and `fixed_string`.

`_tp_message_key` also support `nullable`. Thus we can create an external stream with optional message key. For example:
```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _tp_message_key nullable(string) default null
) SETTINGS type='pulsar',...;
```

## Write Data to Pulsar

### Write to Pulsar in Plain Text {#single_col_write}

You can write plain text messages to Pulsar topics with an external stream with a single column.

```sql
CREATE EXTERNAL STREAM ext_github_events (raw string)
SETTINGS type='pulsar', service_url='pulsar://host:port', topic='..'
```

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](/proton-ingest-api), or set it as the target stream for a materialized view to write message to the Pulsar topic. The actual `data_format` value is `RawBLOB` but this can be omitted. By default `one_message_per_row` is `true`.

#### Advanced Settings for writing data
Settings for controlling the producer behavior:
  * `output_batch_max_messages` - Set the max number of messages permitted in a batch. If you set this option to a value greater than 1, messages are queued until this threshold is reached or batch interval has elapsed.
  * `output_batch_max_size_bytes` - Set the max size of messages permitted in a batch. If you set this option to a value greater than 1,  messages are queued until this threshold is reached or batch interval has elapsed.
  * `output_batch_max_delay_ms` - Set the max time for message publish delay permitted in a batch.
  * `pulsar_max_pending_messages` - Set the max size of the producer's queue holding the messages pending to receive an acknowledgment from the broker. When the queue is full, the producer will be blocked.

### Multiple columns to write to Pulsar{#multi_col_write}

To write structured data to Pulsar topics, you can choose different data formats:

#### JSONEachRow

You can use `data_format='JSONEachRow',one_message_per_row=true` to inform Timeplus to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3),
    url string,
    method string,
    ip string)
    SETTINGS type='pulsar',
             service_url='pulsar://host:port',
             topic='..',
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

Please note, by default multiple JSON documents will be inserted to the same Pulsar message. One JSON document each row/line. Such default behavior aims to get the maximum writing performance to Pulsar. But you need to make sure the downstream applications are able to properly split the JSON documents per message.

If you need a valid JSON per each message, instead of a JSONL, please set `one_message_per_row=true` e.g.

```sql
CREATE EXTERNAL STREAM target(_tp_time datetime64(3), url string, ip string)
SETTINGS type='pulsar', service_url='pulsar://host:port', topic='..',
         data_format='JSONEachRow',one_message_per_row=true
```

The default value of one_message_per_row, if not specified, is false for `data_format='JSONEachRow'` and true for `data_format='RawBLOB'`.
:::

#### CSV

You can use `data_format='CSV'` to inform Timeplus to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. For example:

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3),
    url string,
    method string,
    ip string)
    SETTINGS type='pulsar',
             service_url='pulsar://host:port',
             topic='..',
             data_format='CSV';
```

The messages will be generated in the specific topic as

```csv
"2023-10-29 05:35:54.176","https://www.nationalwhiteboard.info/sticky/recontextualize/robust/incentivize","PUT","3eaf6372e909e033fcfc2d6a3bc04ace"
```

#### ProtobufSingle

You can write Protobuf-encoded messages in Pulsar topics.

First, you need to create a schema with SQL, e.g.
```sql
CREATE OR REPLACE FORMAT SCHEMA schema_name AS '
              syntax = "proto3";

              message SearchRequest {
                string query = 1;
                int32 page_number = 2;
                int32 results_per_page = 3;
              }
              ' TYPE Protobuf
```
Then refer to this schema while creating an external stream for Pulsar:
```sql
CREATE EXTERNAL STREAM stream_name(
         query string,
         page_number int32,
         results_per_page int32)
SETTINGS type='pulsar',
         service_url='pulsar://host.docker.internal:6650',
         topic='persistent://public/default/protobuf',
         data_format='ProtobufSingle',
         format_schema='schema_name:SearchRequest'
```

Then you can run `INSERT INTO` or use a materialized view to write data to the topic.
```sql
INSERT INTO stream_name(query,page_number,results_per_page) VALUES('test',1,100)
```

Please refer to [Protobuf/Avro Schema](/proton-format-schema) for more details.

#### Avro

You can write messages in Avro format.

First, you need to create a schema with SQL, e.g.
```sql
CREATE OR REPLACE FORMAT SCHEMA avro_schema AS '{
                "namespace": "example.avro",
                "type": "record",
                "name": "User",
                "fields": [
                  {"name": "name", "type": "string"},
                  {"name": "favorite_number",  "type": ["int", "null"]},
                  {"name": "favorite_color", "type": ["string", "null"]}
                ]
              }
              ' TYPE Avro;
```
Then refer to this schema while creating an external stream for Pulsar:
```sql
CREATE EXTERNAL STREAM stream_avro(
         name string,
         favorite_number nullable(int32),
         favorite_color nullable(string))
SETTINGS type='pulsar',
         service_url='pulsar://host.docker.internal:6650',
         topic='persistent://public/default/avro',
         data_format='Avro',
         format_schema='avro_schema'
```

Then you can run `INSERT INTO` or use a materialized view to write data to the topic.
```sql
INSERT INTO stream_avro(name,favorite_number,favorite_color) VALUES('test',1,'red')
```

Please refer to [Protobuf/Avro Schema](/proton-format-schema) for more details.

### Continuously Write to Pulsar via MV

You can use materialized views to write data to Pulsar as an external stream, e.g.

```sql
-- read the topic via an external stream
CREATE EXTERNAL STREAM frontend_events(raw string)
                SETTINGS type='pulsar',
                         service_url='pulsar://host:port',
                         topic='owlshop-frontend-events';

-- create the other external stream to write data to the other topic
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3),
    url string,
    method string,
    ip string)
    SETTINGS type='pulsar',
             service_url='pulsar://host:port',
             topic='..',
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

## DROP EXTERNAL STREAM

```sql
DROP STREAM [IF EXISTS] stream_name
```

## Limitations

There are some limitations for the Pulsar-based external streams, because Timeplus doesn’t control the storage or the data format for the external stream.

1. The UI wizard to setup Pulsar External Stream is coming soon. Before it's ready, you need the SQL DDL.
2. Unlike normal streams, there is no historical storage for the external streams. You can run `table(ex_pulsar_stream)` but it will scan all messages in the topic. There is no way to implement an efficient `count`. Thus, `SELECT count() FROM table(ex_pulsar_stream)` will always scan the whole topic. If you need to frequently run query for historical data, you can use a Materialized View to query the Pulsar External Stream and save the data in Timeplus columnar or row storage. This will improve the query performance.
3. You use `seek_to` in the streaming query. `earliest` and `latest` are supported. You can also use `seek_to='2024-10-14'` for date or datetime based rewind. But number-based seek_to is not supported.
4. There is no retention policy for the external streams in Timeplus. You need to configure the retention policy on Pulsar. If the data is no longer available in the external systems, they cannot be searched in Timeplus either.
5. Like Kafka external stream, Pulsar external stream will fetch the partition list after the streaming SQL starts running. Thus, it won't be automatically detect new partitions at runtime. Users must re-execute the query in order to read data from the new partitions.
