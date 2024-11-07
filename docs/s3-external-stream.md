# Amazon S3 External Stream

Amazon S3 is cloud object storage with industry-leading scalability, data availability, security, and performance.

In [Timeplus Enterprise v3.0](/) (unreleased yet), we added the first-class integration for S3-compatible object storage systems, as a new type of [External Stream](/external-stream). You can read or write data in Amazon S3 or S3-compatible cloud or local storage.

## CREATE EXTERNAL STREAM

To create an external stream for S3, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
    (<col_name1> <col_type>)
SETTINGS
    type='s3', -- required
    url='https://..',-- required
    data_format='..',
    s3_file='..',
    s3_file_pattern='..'
```
### Connect to a public Amazon S3 bucket

There are some public datasets shared by different organizations. For example the following SQL allows you to consume Parquet files for customer review comments at Amazon.com.

```sql
CREATE EXTERNAL STREAM amazon_reviews(
    review_date	uint16,
    marketplace	string,
    customer_id	uint64,
    review_id	string,
    product_id	string,
    product_parent	uint64,
    product_title	string,
    product_category	string,
    star_rating	uint8,
    helpful_votes	uint32,
    total_votes	uint32,
    vine	bool,
    verified_purchase	bool,
    review_headline	string,
    review_body	string
)
SETTINGS type='s3',data_format='Parquet',
url='https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet';
```

Then you can run SQL queries on the S3 data, without having to load them to the current server. For example:
```sql
SELECT count() FROM amazon_reviews;

--output:
┌──count()─┐
│ 41905631 │
└──────────┘

1 row in set. Elapsed: 15.996 sec. Processed 41.91 million rows, 41.91 MB (2.62 million rows/s., 2.62 MB/s.)

SELECT star_rating, count() FROM amazon_reviews GROUP BY star_rating;
--output:
┌─star_rating─┬──count()─┐
│           1 │  3253070 │
│           2 │  1865322 │
│           3 │  3130345 │
│           4 │  6578230 │
│           5 │ 27078664 │
└─────────────┴──────────┘

5 rows in set. Elapsed: 9.380 sec. Processed 41.91 million rows, 41.91 MB (4.47 million rows/s., 4.47 MB/s.)
```

### Connect to a private Amazon S3 bucket

### Connect to GCS, Minio or others

If you have a local Apache Pulsar server running, you can run the following SQL DDL to create an external stream to connect to it.

```sql
CREATE EXTERNAL STREAM local_pulsar (raw string)
SETTINGS type='pulsar',
         service_url='pulsar://localhost:6650',
         topic='persistent://public/default/my-topic'
```

### Settings

#### url
This is the only mandatory setting for creating a S3 external stream. The `url` need to start with `http` or `https` (cannot be `s3://`).

It can be a single file on S3, or can contain bash-like wildcards to specify multiple files, when you create the external stream for read (Inserting data to an external stream that uses wildcards in `url` will fail.). The supported wildcards:
* `*` — Substitutes any number of any characters except `/` including empty string.
* `**` — Substitutes any number of any character include `/` including empty string.
* `?` — Substitutes any single character.
* `{some_string,another_string,yet_another_one}` — Substitutes any of strings `'some_string'`, `'another_string'`, `'yet_another_one'`.
* `{N..M}` — Substitutes any number in range from `N` to `M` including both borders. `N` and `M` can have leading zeroes e.g. `000..078`.

For example:
* `url = 'https://my-bucket.us-west-2.amazonaws.com/my_folder/file-{000..999}.csv'`
* `url = 'https://my-bucket.us-west-2.amazonaws.com/{some,another}_folder/some_file_{1..3}'`
* `url = 'https://my-bucket.us-west-2.amazonaws.com/{some,another}_folder/some_file_?'`
* `url = 'https://my-bucket.us-west-2.amazonaws.com/{some,another}_folder/*'`

#### s3_file
It's possible to overwrite the path specified in the `url` setting. Two settings are provided to support this feature: `s3_file` and `s3_file_pattern`. `s3_file` can be used in both read and write, while `s3_file_pattern` is designed for write cases only.

You can specify `s3_file` in both `SELECT` and `INSERT INTO` queries. Timeplus will combine both `url` and `s3_file` together to compute the final object URL, and use the final URL for reading and writing S3 objects.

`s3_file` can be either an absolute path or a relative path:
* when `s3_file` is absolute path, it will overwrite the `url` from the root, for example:
  * Given `url = 'https://my-bucket.us-west-2.amazonaws.com/path/to/my-file.json'`, and `s3_file = '/another-path/to/another.csv'`. The final URL will be `https://my-bucket.us-west-2.amazonaws.com/another-path/to/another.csv`.
* When `s3_file` is a relative path, it will append to the `url` (the file part of `url` will be removed).
  * Given `url = 'https://my-bucket.us-west-2.amazonaws.com/path/to/my-file.json'`
    * with `s3_file = 'another-file.json'`, the final result will be `https://my-bucket.us-west-2.amazonaws.com/path/to/another-file.json`.
    * with `s3_file = '../../another-path/to/another-file.json'`, the final result will be `https://my-bucket.us-west-2.amazonaws.com/another-path/to/another-file.json`.
  * Given `url = 'https://my-bucket.us-west-2.amazonaws.com/some-path/'` (points to a folder, this **MUST** ends with a forward slash `/`, removing the tailing slash, `some-path` will be treated as the file name
    * with `s3_file = 'my-file.json'`, the final result will be `https://my-bucket.us-west-2.amazonaws.com/some-path/my-file.json`.
    * with `s3_file = ../another-path/my-file.json'`, the final result will be `https://my-bucket.us-west-2.amazonaws.com/another-path/my-file.json`.

`s3_file` supports wildcards as well (only useful for `SELECT`), e.g. `s3_file = '2024-0{1..3}/*.json'`.

`s3_file` is mostly useful for writing to external streams which have wildcards in their `url`. As mentioned above, it's not supported to write to an external stream that uses wildcards in `url`. So, you will need `s3_file` (or `s3_file_pattern`) for such use case.

For example, there is an example stream that reads all CSV files under `https://my-bucket.us-west-2.amazonaws.com/some_folder/`:
```sql
CREATE EXTERNAL STREAM example (name string, value uint32)
SETTINGS
  type = 's3',
  url = 'https://my-bucket.us-west-2.amazonaws.com/some_folder/*.csv',
  data_format = 'CSV';
```

In order to write data to this stream, you can do it with `s3_file` like this:
```sql
INSERT INTO example VALUES ... SETTINGS s3_file = 'new.csv';
```
So, data from the above query will be written into the object `https://my-bucket.us-west-2.amazonaws.com/some_folder/new.csv`.

##### Writing To Multiple Files

As timeplusd is a streaming engine, it's common to write data from a stream to a S3 bucket. So, it's important to be able to split the data into multiple S3 objects. There are two settings to control this behavior:
* `s3_min_upload_file_size` - the minimum size of file to upload to S3, i.e. once the size of accumulated data reaches this value, the stream will complete the current upload, an object will be created in the S3 bucket, and the stream will start a new upload.
* `s3_multipart_upload_max_idle_ms` - (WIP) this defines the amount of time the stream can be idle, i.e. if there is no data comes in for this amount of time, the stream will complete the current upload, create an object in the S3 bucket and starts a new upload.

##### Example with s3_min_upload_file_size #####

Given stream:
```sql
CREATE EXTERNAL STREAM example (name string, value uint32
SETTINGS
  type = 's3',
  url = 'https://my-bucket.us-west-2.amazonaws.com/some_folder/data.csv',
  data_format = 'CSV';
```

With
```sql
INSERT INTO example SETTINGS s3_min_upload_file_size = 1048576 SELECT name, value FROM my_data_stream;
```
It will create one new S3 object whenever it writes 1 MiB data. Note, the S3 objects could have a size bigger than 1 MiB, because `s3_min_upload_file_size` flushes the current file when it reaches 1 MiB of data (that's why there is a `min` in the setting's name).

The first file will be named `data.csv` (as defined in `url`, you can define the file name with `s3_file` too as explained above), this is called the basic file name. The consecutive files will have a continuous integer prepend to the file's extension name (if there is one). So, in this case, the consecutive files will be named: `data.1.csv`, `data.2.csv`, ..., `data.10.csv`, `data.11.csv`, ...

##### Setting: s3_file_pattern #####

With the above example, it does not give you much control on the file path/file name of the generated S3 objects. For some use cases, it requires a better way to control the generated file names. This is what the setting `s3_file_pattern` could help.

`s3_file_pattern` works the as way as the `s3_file` setting, the only difference is that the value of `s3_file_pattern` is a SQL expression that will be evaluated at runtime to generate the file names.

For example, it's a common pattern to put files under folders named with the dates when the files were generated, then we can use `s3_file_pattern = 'format_datetime(now(), \'%F/log-%H%i%s.json\')'`, which will generate file names like: `2024-10-15/log-100000.json`, `2024-10-15/log-173050.json`, `2024-10-16/log-000000.json`, etc.

**IMPORTANT:**
* Each file name is evaluated using the **first** record of data in that file.
* The expression should guarantee that when it gets evaluated, it will return a unique value.

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

## Read Data in S3
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
    _tp_message_key string default null
) SETTINGS type='pulsar',...;
```

## Write Data to S3

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
         favorite_color string)
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
