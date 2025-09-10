## Write Data to Kafka

Timeplus supports writing data to Kafka using various encoding formats such as strings, JSON, CSV, TSV, Avro, and Protobuf. You can write to Kafka using SQL `INSERT` statements, the [Ingest REST API](/proton-ingest-api), or as the target of a [Materialized View](/sql-create-materialized-view).

### Write as Raw String 

You can encode data as a raw string in Kafka messages:

```sql
CREATE EXTERNAL STREAM ext_github_events (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

You can then write data via:

* `INSERT INTO ext_github_events VALUES ('some string')`
* [Ingest REST API](/proton-ingest-api)
* Materialized View


:::info

Internally, the `data_format` is `RawBLOB`, and `one_message_per_row=true` by default.

Pay attention to setting `kafka_max_message_size`. When multiple rows can be written to the same Kafka message, this setting will control how many data will be put in a Kafka message, ensuring it won't exceed the `kafka_max_message_size` limit.
:::

### Write as JSONEachRow

Encode each row as a separate JSON object (aka JSONL or jsonlines):

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

Please note, by default multiple JSON documents will be inserted to the same Kafka message. One JSON document each row/line (JSONEachRow, jsonl). Such default behavior aims to get the maximum writing performance to Kafka/Redpanda. But users need to make sure the downstream applications are able to properly process the json lines.

If users need a valid JSON per each Kafka message, instead of a JSONL, please set `one_message_per_row=true` e.g.

```sql
CREATE EXTERNAL STREAM target(_tp_time datetime64(3), url string, ip string)
SETTINGS type='kafka', brokers='redpanda:9092', topic='masked-fe-event',
         data_format='JSONEachRow',one_message_per_row=true
```

The default value of one_message_per_row is false for `data_format='JSONEachRow'` and true for `data_format='RawBLOB'`.

:::

### Write as CSV

Each row is encoded as one CSV line:

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

### Write as TSV

Same as CSV,  but uses **tab characters** as delimiters instead of commas.

### Write as ProtobufSingle

To write Protobuf-encoded messages from Kafka topics, please refer to [Protobuf Schema](/proton-format-schema), and [Kafka Schema Registry](/proton-schema-registry) pages for details.

### Write as Avro

To write Avro-encoded messages from Kafka topics, please refer to [Avro Schema](/proton-format-schema), and [Kafka Schema Registry](/proton-schema-registry) pages for details.

### Write Kafka Message Metadata 

#### _tp_message_key

If users like to populate Kafka message key when producing data to a Kafka topic, users can define the `_tp_message_key` column when creating the external stream.

For example:
```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _tp_message_key string
) SETTINGS type='kafka',...;
```

After inserting a row to the stream like this:
```sql
INSERT INTO foo(id,name,_tp_message_key) VALUES (1, 'John', 'some-key');
```

* Kafka key will be `'some-key'`
* Message body: `{"id": 1, "name": "John"}`. Kafka key was excluded from the message body.

`_tp_message_key` supports these types:

* Numeric: `uint8/16/32/64`, `int8/16/32/64`
* Others: `string`, `bool`, `float32`, `float64`, `fixed_string`
* Nullable are also supported:

```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _tp_message_key nullable(string) default null
) SETTINGS type='kafka',...;
```

#### _tp_message_headers

Add Kafka headers via `_tp_message_headers` (map of key-value pairs):

```sql
CREATE EXTERNAL STREAM example (
    s string,
    i int,
    ...,
    _tp_message_headers map(string, string)
) settings type='kafka',...;
```

Then insert rows to the external stream via `INSERT INTO` or Materialized Views, the `_tp_message_headers` will be set to the headers of the Kafka message.

#### sharding_expr {#sharding_expr}

`sharding_expr` is used to control how rows are distributed to Kafka partitions:

```sql
CREATE EXTERNAL STREAM foo (
    id int32,..
) SETTINGS type='kafka', sharding_expr='hash(id)'...;
```

When inserting rows, the partition ID will be evaluated based on the `sharding_expr` and Timeplus will put the message into the corresponding Kafka partition.
