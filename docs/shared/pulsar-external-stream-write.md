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

##### RawBLOB
Write the content as pain text.

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

##### TSV
Similar to CSV but tab as the separator.

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

Please refer to [Protobuf/Avro Schema](/timeplus-format-schema) for more details.

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

Please refer to [Protobuf/Avro Schema](/timeplus-format-schema) for more details.

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
