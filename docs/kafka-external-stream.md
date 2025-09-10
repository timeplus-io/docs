## Kafka External Stream

Timeplus allows users to **read from** and **write to** Apache Kafka (and compatible platforms like **Confluent Cloud** and **Redpanda**) using **Kafka External Streams**.

By combining external streams with [Materialized Views](/view#m_view) and [Target Streams](/view#target-stream), users can build robust **real-time streaming pipelines**.

## CREATE EXTERNAL STREAM

Use the following SQL command to create a Kafka external stream:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] <stream_name>
    (<col_name1> <col_type>)
SETTINGS
    type='kafka', -- required
    brokers='ip:9092', -- required
    topic='..', -- required
    security_protocol='..',
    sasl_mechanism='..',
    username='..',
    password='..',
    config_file='..',
    data_format='..',
    format_schema='..',
    one_message_per_row=..,
    kafka_schema_registry_url='..',
    kafka_schema_registry_credentials='..',
    ssl_ca_cert_file='..',
    ssl_ca_pem='..',
    skip_ssl_cert_check=..,
    properties='..'
```

### Settings

#### type

Must be set to `kafka`. Compatible with:

* Apache Kafka
* Confluent Platform or Cloud
* Redpanda
* Other Kafka-compatible systems

#### brokers

Comma-separated list of broker addresses (host\:port), e.g.:

```
kafka1:9092,kafka2:9092,kafka3:9092
```

#### topic

Kafka topic name to connect to.

#### security_protocol

The supported values for `security_protocol` are:

- PLAINTEXT: when this option is omitted, this is the default value.
- SASL_SSL: when this value is set, username and password should be specified.
  - If users need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'`. Users can also put the full content of the pem file as a string in the `ssl_ca_pem` setting.
  - To skip the SSL certification verification: `skip_ssl_cert_check=true`.

#### sasl_mechanism

The supported values for `sasl_mechanism` are:

- PLAIN: when setting security_protocol to SASL_SSL, this is the default value for sasl_mechanism.
- SCRAM-SHA-256
- SCRAM-SHA-512
- AWS_MSK_IAM (for AWS MSK IAM role-based access when EC2 or Kubernetes pod is configured with a proper IAM role)

#### username / password

Required when `sasl_mechanism` is set to SCRAM-SHA-256 or SCRAM-SHA-512. 

Alternatively, use [`config_file`](#config_file) to securely pass credentials.

#### config_file

Use this to point to a file containing key-value config lines for Kafka external stream, e.g.:

```properties
username=my_username
password=my_password
data_format='Avro'
one_message_per_row=true
```

This is especially useful in Kubernetes environments with secrets managed via [HashiCorp Vault](https://learn.hashicorp.com/tutorials/vault/kubernetes-sidecar).

**HarshiCorp Vault injection example:**

```yaml
annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/agent-inject-status: "update"
        vault.hashicorp.com/agent-inject-secret-kafka-secret: "secret/kafka-secret"
        vault.hashicorp.com/agent-inject-template-kafka-secret: |
          {{- with secret "secret/kafka-secret" -}}
          username={{ .Data.data.username }}
          password={{ .Data.data.password }}
          {{- end }}
        vault.hashicorp.com/role: "vault-role"
```

:::info

Please note values in settings in the DDL will override those in config_file and it will only merge the settings from the config_file which are not explicitly specified in the DDL. 

:::


#### data_format

Defines how Kafka messages are parsed and written. Supported formats are

| Format           | Description                              |
| ---------------- | ---------------------------------------- |
| `JSONEachRow`    | Parses one JSON document per line        |
| `CSV`            | Parses comma-separated values            |
| `TSV`            | Like CSV, but tab-delimited              |
| `ProtobufSingle` | One Protobuf message per Kafka message   |
| `Protobuf`       | Multiple Protobuf messages per Kafka msg |
| `Avro`           | Avro-encoded messages                    |
| `RawBLOB`        | Raw text, no parsing (default)           |

#### format_schema

Required for these data formats:

* `ProtobufSingle`
* `Protobuf`
* `Avro`

#### one_message_per_row

Set to `true` to ensure each Kafka message maps to exactly **one JSON document**, especially when writing with `JSONEachRow`.

#### kafka_schema_registry_url

URL of the [Kafka Schema Registry](/proton-schema-registry), including the protocol is required (`http://` or `https://`).

#### kafka_schema_registry_credentials

Credentials for the registry, in `username:password` format.

#### ssl_ca_cert_file / ssl_ca_pem

Use either:

* `ssl_ca_cert_file='/path/to/cert.pem'`
* `ssl_ca_pem='-----BEGIN CERTIFICATE-----\n...'`

#### skip_ssl_cert_check

* Default: `false`
* Set to `true` to **bypass SSL verification**.

#### properties

Used for advanced configurations. These settings are passed directly to the Kafka client ([librdkafka config options](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)) to fine tune the Kafka producer, consumer or topic behaviors.

For more, see the [Advanced Settings](#advanced_settings) section.

## Read Data from Kafka

Timeplus allows reading Kafka messages in multiple data formats, including:

* Plain string (raw)
* CSV / TSV
* JSON
* Protobuf
* Avro

### Read Kafka Messages as Raw String 

Use this mode when:

* Messages contain **unstructured text or binary data**
* No built-in format is applicable
* You want to **debug raw Kafka messages**

#### Raw String Example

```sql
CREATE EXTERNAL STREAM ext_application_logs
         (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='application_logs'
```

Users can use functions like regex string processing or JSON extract etc functions to further process the raw string.

#### Regex Example – Parse Application Logs

```sql
SELECT 
    to_time(extract(raw, '^(\\d{4}\\.\\d{2}\\.\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d+)')) AS timestamp, 
    extract(raw, '} <(\\w+)>') AS level,
    extract(raw, '} <\\w+> (.*)') AS message
FROM application_logs;
```

### Read JSON Kafka Message 

Assuming Kafka message contains JSON text with this schema

```json
{
  "actor": string,
  "created_at": timestamp,
  "id": string,
  "payload": string,
  "repo": string,
  "type": string
}
```

You can process JSON in two ways:

#### Option A: Parse with JSON Extract Functions

1. Create a raw stream:

```sql
CREATE EXTERNAL STREAM ext_json_raw
    (raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events';
```

2. Extract fields using JSON extract shortcut syntax or [JSON extract functions](/functions_for_json):

```sql
SELECT 
    raw:actor AS actor,
    raw:created_at::datetime64(3, 'UTC') AS created_at,
    raw:id AS id,
    raw:payload AS payload,
    raw:repo AS repo,
    raw:type AS type
FROM ext_json_raw;
```

This method is most flexible and is best for dynamic JSON text with new fields or missing fields and it can also extract nested JSON fields. 

#### Option B: Use JSONEachRow Format

Define a Kafka external stream with columns which are mapped to the JSON fields and also specify the `data_format` as `JSONEachRow`. 

```sql
CREATE EXTERNAL STREAM ext_json_parsed
    (
        actor string,
        created_at datetime64(3, 'UTC'),
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

When users query the `ext_json_parsed` stream, the JSON fields will be parsed and cast to the target column type automatically. 

This method is most convenient when the JSON text is in stable schema and can be used to extract JSON fields at top level.

### Read CSV Kafka Messages 

Similar to data format `JSONEachRow`, users can read Kafka message in CSV format.

```
CREATE EXTERNAL STREAM ext_json_parsed
    (
        actor string,
        created_at datetime64(3, 'UTC'),
        id string,
        payload string,
        repo string,
        type string
    )
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='csv_topic',
         data_format='CSV';
```

###  Read TSV Kafka Messages

Identical to CSV, but expects **tab-separated values**:

```sql
SETTINGS data_format='TSV';
```

### Read Avro or Protobuf Messages

To read Avro-encoded / Protobuf-encoded Kafka message, please refer to [Schema](/proton-format-schema) and [Schema Registry](/proton-schema-registry) for details.

### Access Kafka Message Metadata

Timeplus provides **virtual columns** for Kafka message metadata.

| Virtual Column        | Description                    | Type                   |
| --------------------- | ------------------------------ | ---------------------- |
| `_tp_time`            | Kafka message timestamp        | `datetime64(3, 'UTC')` |
| `_tp_message_key`     | Kafka message key              | `string`               |
| `_tp_message_headers` | Kafka headers as key-value map | `map(string, string)`  |
| `_tp_sn`              | Kafka message offset           | `int64`                |
| `_tp_shard`           | Kafka partition ID             | `int32`                |


### Kafka Message Metadata Examples

```sql
-- View message time and payload
SELECT _tp_time, raw FROM ext_github_events;

-- View message key
SELECT _tp_message_key, raw FROM ext_github_events;

-- Access headers
SELECT _tp_message_headers['trace_id'], raw FROM ext_github_events;

-- View message offset and partition
SELECT _tp_sn, _tp_shard, raw FROM ext_github_events;
```

### Query Settings for Kafka External Streams

Timeplus supports several query-level settings to control how data is read from Kafka topics. These settings can be especially useful for targeting specific partitions or replaying messages from a defined point in time.

#### Read from Specific Kafka Partitions

By default, Timeplus reads from **all partitions** of a Kafka topic. You can override this by using the `shards` setting to specify which partitions to read from.

##### Read from a Single Partition

```sql
SELECT raw FROM ext_stream SETTINGS shards='0'
```

##### Read from Multiple Partitions

Separate partition IDs with commas:

```sql
SELECT raw FROM ext_stream SETTINGS shards='0,2'
```

#### Rewind via seek_to

By default, Timeplus only reads **new messages** published after the query starts. To read historical messages, use the `seek_to` setting.

#### Rewind to the Earliest Offset (All Partitions)

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='earliest'
```

#### Rewind to Specific Offsets (Per Partition)

Offsets are specified **in partition order**. For example:

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='5,3,11'
```

This seeks to:

* Offset `5` in partition `0`
* Offset `3` in partition `1`
* Offset `11` in partition `2`

#### Rewind to a Specific Timestamp (All Partitions)

You can also rewind based on a timestamp:

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='2025-01-01T00:00:00.000'
```

:::info

Timeplus will use Kafka API to convert the timestamp to the corresponding offsets for each partition internally.

:::

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
