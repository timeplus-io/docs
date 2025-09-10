## Read Data from Pulsar

Timeplus allows reading Pulsar messages in multiple data formats, including:

* Plain string (raw)
* CSV / TSV
* JSON
* Protobuf
* Avro

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

#### _tp_message_headers

Starting from Timeplus Enterprise 2.8.2, you can read and write custom headers via this column.

Define the column in the DDL:
```sql
CREATE EXTERNAL STREAM example (
    s string,
    i int,
    ...,
    _tp_message_headers map(string, string)
) settings type='pulsar',...;
```
Then insert data to the external stream via `INSERT INTO` or materialized views, with a map of string pairs as custom headers for each message.

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

### Read / Write Pulsar Message Key {#messagekey}

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
