## Read Data from NATS JetStream

Timeplus allows reading NATS JetStream messages in multiple data formats, including:

* Plain string (raw)
* CSV / TSV
* JSON
* Protobuf
* Avro

### Read NATS Messages as Raw String

Use this mode when:

* Messages contain **unstructured text or binary data**
* No built-in format is applicable
* You want to **debug raw NATS messages**

#### Raw String Example

```sql
CREATE EXTERNAL STREAM ext_application_logs (raw string)
SETTINGS type='nats_jetstream',
         url='nats://localhost:4222',
         stream_name='application_logs',
         subject='app.logs.*'
```

You can use functions like regex string processing or JSON extract functions to further process the raw string.

#### Regex Example – Parse Application Logs

```sql
SELECT
    to_time(extract(raw, '^(\\d{4}\\.\\d{2}\\.\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d+)')) AS timestamp,
    extract(raw, '} <(\\w+)>') AS level,
    extract(raw, '} <\\w+> (.*)') AS message
FROM ext_application_logs;
```

### Read JSON NATS Messages

Assuming NATS messages contain JSON text with this schema:

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
CREATE EXTERNAL STREAM ext_json_raw (raw string)
SETTINGS type='nats_jetstream',
         url='nats://localhost:4222',
         stream_name='github_events',
         subject='github.events.>';
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

This method is most flexible and works well for dynamic JSON with new or missing fields. It can also extract nested JSON fields.

#### Option B: Use JSONEachRow Format

Define a NATS JetStream external stream with columns mapped to the JSON fields and specify `data_format='JSONEachRow'`:

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
SETTINGS type='nats_jetstream',
         url='nats://localhost:4222',
         stream_name='github_events',
         subject='github.events',
         data_format='JSONEachRow'
```

When you query the stream, JSON fields are parsed and cast to the target column types automatically.

This method is most convenient when the JSON schema is stable and works for top-level JSON fields.

### Read CSV NATS Messages

Similar to `JSONEachRow`, you can read CSV formatted messages:

```sql
CREATE EXTERNAL STREAM ext_csv_parsed
    (
        actor string,
        created_at datetime64(3, 'UTC'),
        id string,
        payload string,
        repo string,
        type string
    )
SETTINGS type='nats_jetstream',
         url='nats://localhost:4222',
         stream_name='csv_stream',
         subject='csv.data',
         data_format='CSV';
```

### Read TSV NATS Messages

Identical to CSV, but expects **tab-separated values**:

```sql
SETTINGS data_format='TSV';
```

### Read Avro or Protobuf Messages

To read Avro-encoded or Protobuf-encoded NATS messages, please refer to [Schema](/timeplus-format-schema) documentation.

### Access NATS Message Metadata

Timeplus provides **virtual columns** for NATS JetStream message metadata.

| Virtual Column | Description | Type |
|----------------|-------------|------|
| `_tp_time` | NATS message timestamp | `datetime64(3, 'UTC')` |
| `_tp_append_time` | Message append time | `datetime64(3, 'UTC')` |
| `_tp_process_time` | Processing time | `datetime64(3, 'UTC')` |
| `_tp_sn` | Stream sequence number | `int64` |
| `_tp_shard` | Always 0 for NATS | `int32` |
| `_tp_message_headers` | NATS headers as key-value map | `map(string, string)` |
| `_nats_subject` | NATS subject | `string` |

### NATS Message Metadata Examples

```sql
-- View message time and payload
SELECT _tp_time, raw FROM ext_github_events;

-- View message subject
SELECT _nats_subject, raw FROM ext_github_events;

-- Access headers
SELECT _tp_message_headers['trace_id'], raw FROM ext_github_events;

-- View sequence number
SELECT _tp_sn, raw FROM ext_github_events;
```

### Query Settings for NATS JetStream External Streams

#### Controlling Where to Start Reading

Use the `seek_to` query setting to control where to start consuming messages. 

##### Start from Earliest (All Messages)

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='earliest'
```

For non-streaming queries (using `table()` function), `seek_to` defaults to `'earliest'`.

##### Start from Latest (New Messages Only)

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='latest'
```

For streaming queries, `seek_to` defaults to `'latest'`.

##### Start from Specific Stream Sequence Number

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='1000'
```

This starts reading from sequence number 1000.

##### Start from Specific Timestamp

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='2025-01-01T00:00:00.000'
```

Timeplus converts the timestamp to the appropriate starting point in the stream.

:::info
:::

#### record_consume_timeout_ms

Use `record_consume_timeout_ms` to determine how long the external stream waits for new messages before returning results. Smaller values reduce latency but may impact performance.

```sql
SELECT raw FROM ext_stream SETTINGS record_consume_timeout_ms=100
```

#### record_consume_batch_count

Use `record_consume_batch_count` to control the number of messages fetched in each batch. Default is `1000`.

```sql
SELECT raw FROM ext_stream SETTINGS record_consume_batch_count=500
```
