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

To read Avro-encoded / Protobuf-encoded Kafka message, please refer to [Schema](/timeplus-format-schema) and [Schema Registry](/kafka-schema-registry) for details.

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
