## Write Data to NATS JetStream

Timeplus supports writing data to NATS JetStream using various encoding formats such as strings, JSON, CSV, TSV, Avro, and Protobuf. You can write to NATS JetStream using SQL `INSERT` statements, the [Ingest REST API](/proton-ingest-api), or as the target of a [Materialized View](/sql-create-materialized-view).

### Write as Raw String

You can encode data as a raw string in NATS messages:

```sql
CREATE EXTERNAL STREAM ext_github_events (raw string)
SETTINGS type='nats_jetstream',
         url='nats://localhost:4222',
         stream_name='github_events',
         subject='github.events'
```

You can then write data via:

* `INSERT INTO ext_github_events VALUES ('some string')`
* [Ingest REST API](/proton-ingest-api)
* Materialized View

:::info

Internally, the `data_format` is `RawBLOB`, and `one_message_per_row=true` by default.

:::

### Write as JSONEachRow

Encode each row as a separate JSON object (JSONL format):

```sql
CREATE EXTERNAL STREAM target(
    url string,
    method string,
    ip string)
SETTINGS type='nats_jetstream',
         url='nats://localhost:4222',
         stream_name='events_stream',
         subject='masked.events',
         data_format='JSONEachRow',
         one_message_per_row=true;
```

The messages will be published to the JetStream subject 'masked.events' as:

```json
{
    "url":"https://www.example.io/methodologies/killer/web-readiness",
    "method":"POST",
    "ip":"c4ecf59a9ec27b50af9cc3bb8289e16c"
}
```

:::info

By default, multiple JSON documents may be inserted into the same NATS message when using `JSONEachRow`. Set `one_message_per_row=true` to ensure each NATS message contains exactly one JSON document.

:::

### Write as CSV / TSV

Each row is encoded as one CSV/TSV line.

### Write as Protobuf / Avro

To write Protobuf-encoded or Avro-encoded messages, please refer to [Protobuf Schema](/data-formats#protobuf) and [Avro Schema](/data-formats#avro) documentation.

### Specify Subject with `_nats_subject`

By default, the message is published to subject defined in the external stream setting 'subject'.

You can use the `_nats_subject` column to route messages to different NATS subjects dynamically, overriding the default `subject` setting:

```sql
CREATE EXTERNAL STREAM foo (
    id int32,
    name string,
    _nats_subject string
) SETTINGS type='nats_jetstream',
           url='nats://localhost:4222',
           stream_name='multi_subject_stream',
           subject='users.*';
```

Insert data with different subjects:

```sql
INSERT INTO foo(id, name, _nats_subject) VALUES (1, 'John', 'users.john');
INSERT INTO foo(id, name, _nats_subject) VALUES (2, 'Jane', 'users.jane');
```

Messages will be published to subjects `users.john` and `users.jane` correspondingly.

:::info
The JetStream stream must have subjects configured to accept messages on these dynamic subjects. Ensure the stream's subject filter matches all possible `_nats_subject` values.
:::

`_nats_subject` can be nullable - when null or empty, messages are published to the default `subject`.

### Write NATS Message Headers

Add NATS headers via `_tp_message_headers` (map of key-value pairs):

```sql
CREATE EXTERNAL STREAM example (
    s string,
    i int,
    _tp_message_headers map(string, string)
) SETTINGS type='nats_jetstream',
           url='nats://localhost:4222',
           stream_name='headers_stream',
           subject='headers.data';
```

Insert data with headers:

```sql
INSERT INTO example(s, i, _tp_message_headers) VALUES ('data', 42, map('trace_id', 'abc123', 'content-type', 'application/json'));
```
