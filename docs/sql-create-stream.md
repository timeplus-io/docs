# CREATE STREAM

[Stream](/working-with-streams) is a key [concept](/glossary) in Timeplus. All data lives in streams, no matter static data or data in motion. We don't recommend you to create or manage `TABLE` in Timeplus.

## Syntax

### Append Stream

```sql
CREATE STREAM [IF NOT EXISTS] [db.]<stream_name>
(
    <col_name1> <col_type_1> [DEFAULT <col_expr_1>] [compression_codec_1],
    <col_name1> <col_type_2> [DEFAULT <col_expr_2>] [compression_codec_2]
)
[TTL expr]
[SETTINGS <event_time_column>='<col>', <key1>=<value1>, <key2>=<value2>, ...]
```

:::info

Stream creation is an async process.

:::

If you omit the database name, `default` will be used. Stream name can be any utf-8 characters and needs backtick quoted if there are spaces in between. Column name can be any utf-8 characters and needs backtick quoted if there are spaces in between.

### Mutable Stream

Mutable Streams are available in Timeplus Enterprise. Guide: [CREATE MUTABLE STREAM](/sql-create-mutable-stream)

### Versioned Stream

[Versioned Stream](/versioned-stream) allows you to specify the primary key(s) and focus on the latest value. For example:

```sql
CREATE STREAM versioned_kv(i int, k string, k1 string)
PRIMARY KEY (k, k1)
SETTINGS mode='versioned_kv', version_column='i';
```

The default `version_column` is `_tp_time`. For the data with same primary key(s), Proton will use the ones with maximum value of  `version_column`. So by default, it tracks the most recent data for same primary key(s). If there are late events, you can use specify other column to determine the end state for your live data.

### Changelog Stream

[Changelog Stream](/changelog-stream) allows you to specify the primary key(s) and track the add/delete/update of the data. For example:

```sql
CREATE STREAM changelog_kv(i int, k string, k1 string)
PRIMARY KEY (k, k1)
SETTINGS mode='changelog_kv', version_column='i';
```

The default `version_column` is `_tp_time`. For the data with same primary key(s), Proton will use the ones with maximum value of  `version_column`. So by default, it tracks the most recent data for same primary key(s). If there are late events, you can use specify other column to determine the end state for your live data.

## SETTINGS
#### mode
Type: string

Default: `append`

Stream mode. It can be `append`, `versioned_kv`, `changelog_kv`, `changelog`.

#### shards
Type: int64

Default: 1

Number of shards for the stream.

#### replication_factor
Type: int64

Default: 1 for single node and 3 for cluster.

#### version_column
Type: string

Default: `_tp_time`

Column name to determine the version of the data. It's only used in `versioned_kv` and `changelog_kv` mode.

#### keep_versions
Type: int64

Default: 1

Number of versions to keep for each key. It's only used in `versioned_kv` mode.

#### event_time_column
Type: string

Default: `now64(3, 'UTC')`

Column name or expression to determine the event time of the data.

#### logstore_codec
Type: string

Default: `none`

Codec for the logstore. It can be `none`, `zstd`, `lz4`.

#### logstore_retention_bytes
Type: int64

Default: -1

Maximum size of the logstore in bytes. -1 means no limit.

#### logstore_retention_ms
Type: int64

Default: -1

Maximum time to keep the logstore in milliseconds. -1 means no limit.

#### logstore_flush_messages
Type: int64

Default: 1,000

Messages to trigger a fsync

#### logstore_flush_ms
Type: int64

Default: 120,000

Time in milliseconds to trigger a fsync

#### storage_type
This is an advanced setting. Default value is `hybrid` to use both a streaming storage and a historical storage for the stream.

It can be:
* `streaming`: Use only streaming storage, together with settings `logstore_codec`, `logstore_retention_bytes`, `logstore_retention_ms`.
* `memory`: put data in memory only, mainly for testing.

## TTL (Time-To-Live) {#ttl}

The [logstore_retention_bytes](#logstore_retention_bytes) and [logstore_retention_ms](#logstore_retention_ms) settings control the maximum size and time to keep the streaming storage. The historical storage for the stream is controlled by the TTL expression.

Syntax:
```sql
TTL time_column + interval
```

For example, `TTL _tp_time + INTERVAL 1 DAY` will delete rows older than one day, `TTL _tp_time + INTERVAL 7 DAY` will delete rows older than one week.

For [S3 Tried Storage](/append-stream-tiered-storage#create-a-stream-with-the-policy), you can also specify when the cold data will be moved to S3. For example:
```sql
CREATE STREAM my_stream (
    id uint32,
    name string,
    age uint8
)
TTL to_start_of_day(_tp_time) + interval 7 day to volume 'cold'
SETTINGS storage_policy = 'hcs';
```
