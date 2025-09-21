# Append Stream

An **Append Stream** in Timeplus is best understood as a **streaming ClickHouse / Snowflake** table that uses a columnar format, designed for high data ignest rates and huge data volumes, and optimized for streaming analytics workloads where frequent data mutations are uncommon. 

## Create Append Stream

```sql
CREATE STREAM [IF NOT EXISTS] <db.stream-name>
(
    name1 [type1] [DEFAULT | ALIAS expr1] [COMMENT 'column-comment'] [compression_codec],
    name2 [type2] [DEFAULT | ALIAS expr2] [COMMENT 'column-comment'] [compression_codec],
    ...
    INDEX index-name1 expr1 TYPE type1(...) [GRANULARITY value1],
    INDEX index-name2 expr2 TYPE type2(...) [GRANULARITY value1],
    ...
)
ORDER BY <expression>
[PARTITION BY <expression>]
[PRIMARY KEY <expression>]
[TTL expr
    [DELETE | TO DISK 'xxx' | TO VOLUME 'xxx' [, ...] ]
    [WHERE conditions]
]
COMMENT '<stream-comment>'
SETTINGS
    shards=<num-of-shards>,
    replication_factor=<replication-factor>,
    mode=['append'|'changelog_kv'|'versioned_kv'],
    version_column=<version-column>,
    storage_type=['hybrid'|'streaming'|'inmemory'],
    logstore_codec=['lz4'|'zstd'|'none'],
    logstore_retention_bytes=<retention-bytes>,
    logstore_retention_ms=<retention-ms>,
    placement_policies='<placement-policies>',
    shared_disk='<shared-disk>',
    ingest_mode=['async'|'sync'],
    ack=['quorum'|'local'|'none'],
    ingest_batch_max_bytes=<batch-bytes>,
    ingest_batch_timeout_ms=<batch-timeout>,
    fetch_threads=<remote-fetch-threads>,
    flush_threshold_count=<batch-flush-rows>,
    flush_threshold_ms=<batch-flush-timeout>,
    flush_threshold_bytes=<batch-flush-size>;
```

### Storage Architecture

Each shard in a Append Stream has [dural storage](/architecture#dural-storage), consisting of:

- Write-Ahead Log (WAL), powered by NativeLog. Enabling incremental processing.
- Historical store, powered by high performant columnar data store.

Data is first ingested into the WAL, and then asynchronously committed to the historical columnar store in large batches.  

The Append Stream settings allow fine-tuning of both storage layers to balance performance, durability, and efficiency.

### Default Values

The column description can specify a default value expression in the form of `DEFAULT expr`, or `ALIAS expr`. Example: `urldomain string DEFAULT domain(url)`.

The expression `expr` is optional. If it is omitted, the column type must be specified explicitly and the default value will be `0` for numeric columns, `''` (the empty string) for string columns, `[]` (the empty array) for array columns, `1970-01-01` for date columns, or `null` for nullable columns.

The column type of a default value column can be omitted in which case it is inferred from `expr`'s type. For example the type of column `event_date DEFAULT to_date(event_time)` will be date.

If both a data type and a default value expression are specified, an implicit type casting function inserted which converts the expression to the specified type. Example: `hits uint32 DEFAULT 0` is internally represented as `hits uint32 DEFAULT to_uint32(0)`.

A default value expression `expr` may reference arbitrary table columns and constants. Timeplus checks that changes of the stream structure do not introduce loops in the expression calculation. For `INSERT`, it checks that expressions are resolvable – that all columns they can be calculated from have been passed.

#### `DEFAULT expr`

 If the value of such a column is not specified in an `INSERT` query, it is computed from `expr`.

 ```sql
 CREATE STRAM test
(
    id uint64,
    updated_at datetime DEFAULT now(),
    updated_at_date date DEFAULT to_date(updated_at)
)
ORDER BY id;

INSERT INTO test (id) VALUES (1);

SELECT * FROM table(test);
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2025-09-19 07:06:46 │      2025-09-19 │
└────┴─────────────────────┴─────────────────┘
```

#### `ALIAS expr`

Calculated columns (synonym). Column of this type are not stored in the table and it is not possible to `INSERT` values into them.

When `SELECT` queries explicitly reference columns of this type, the value is computed at query time from `expr`. By default, `SELECT *` excludes ALIAS columns. This behavior can be disabled with setting `asterisk_include_alias_columns`.

When using the `ALTER` query to add new columns, old data for these columns is not written. Instead, when reading old data that does not have values for the new columns, expressions are computed on the fly by default. However, if running the expressions requires different columns that are not indicated in the query, these columns will additionally be read, but only for the blocks of data that need it.

If you add a new column to a table but later change its default expression, the values used for old data will change (for data where values were not stored on the disk). Note that when running background merges, data for columns that are missing in one of the merging parts is written to the merged part.

It is not possible to set default values for elements in nested data structures.

```sql
CREATE STREAM test
(
    id uint64,
    size_bytes int64,
    size string ALIAS format_readable_size(size_bytes)
)
ORDER BY id;

INSERT INTO test(id, size_bytes) VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```

### Column Compression Codecs

See [column compression codecs](/append-stream-codecs) for details.

### `ORDER BY expr`

**ORDER BY** — Defines the sorting key. **Required.**  

You can specify a tuple of column names or arbitrary expressions.  

Example:  
```sql
ORDER BY (counter_id + 1, event_date)
```

The sorting key determines the physical order of rows in the historical store. This not only improves query performance but can also enhance data compression. Internally, data in the historical store is always sorted by this key.

### `PRIMARY KEY expr`

**PRIMARY KEY** — Defines the primary index.

If not explicitly declared, the primary key defaults to the same expression as **ORDER BY**. If specified, the primary key expression must be a prefix of the **ORDER BY** expression.


Example:
```sql
CREATE STREAM append
(
  p string,
  p1 string,
  i int
)
ORDER BY (p, p1, i)
PRIMARY KEY (p, p1); -- Primary key expression '(p, p1)' is a prefix of sorting expression '(p, p1, i)'
```

In Append Streams, the primary key does not need to be unique (multiple rows can have same primary key which is different than [Mutable Stream](/mutable-stream#primary-key)).

Choosing an effective primary key can significantly speed up historical queries when **WHERE** predicates can leverage the primary index.

### `PARTITION BY expr`

**PARTITION BY** — Defines the partitioning key. **Optional.**

In most cases, you don't need a partition key, and if you do need to partition, generally you do not need a partition key more granular than by month. You should never use too granular partitioning. Don't partition your data by client identifiers or names (instead, make client identifier or name the first column in the **ORDER BY** expression).

For partitioning by month, use the `to_YYYYMM(date_column)` expression, where `date_column` is a column with a date of the type `date`. The partition names here have the `YYYYMM` format.

### Settings

#### `shards`

The number of shards in a Append Stream.
Increasing the shard count typically improves performance for ingestion and query.

**Default**: `1`

#### `replication_factor`

The number of replicas to maintain for high availability in a cluster deployment.

- **Default (single instance)**: `1`
- **Default (cluster deployment)**: `3`

#### `mode`

Controls the behavior of the historical storage engine during merge operations.

Supported values:
- **`'append'`** (default): Data is simply appended to historical storage.
- **`'versioned_kv'`**: Rows with the same primary key are overridden based on the `version_column`. See [Versioned Key Value Stream](/versioned-stream) for details.
- **`'chanelog_kv'`**: Rows with the same primary key are compacted based on the `version_column`. See [Changelog Key Value Stream](/changelog-stream) for details.

#### `version_column`

Specifies the column used for versioning keys. Required for `versioned_kv` and `changelog_kv` modes.

**Default**: `_tp_time`

#### `storage_type`

Controls the storage type used by the stream.

Supported values:
- **`'hybrid'`** (default): Both the WAL (NativeLog, a.k.a. streaming store) and the historical store are enabled.
- **`'streaming'`**: Only the WAL (NativeLog) is enabled; the historical store is disabled.
- **`'inmemory'`**: WAL operates fully in memory; the historical store is disabled. Works only in a single-instance setup.

#### `logstore_codec`

Compression codec for the WAL (Write-Ahead Log, a.k.a. NativeLog) to reduce disk usage.

Supported values:
- `lz4`
- `zstd`
- `none`

**Default**: `none`

#### `logstore_retention_bytes`

Retention policy by **size** for the WAL. When accumulated WAL segments exceed this size, older replicated segments are garbage collected.
Garbage collection runs periodically in the background (default: every 5 minutes).

**Default**: `1` (collect old segments as soon as possible)

#### `logstore_retention_ms`

Retention policy by **time** for the WAL.  Replicated WAL segments older than this threshold are garbage collected.
Garbage collection runs periodically in the background (default: every 5 minutes).

**Default**: `86400000` (1 day)

#### `placement_policies`

It is used to control the stream shard placement affinity (rack-aware replica placement). See [rack aware placement](/rack-aware-placements) documentation for details.

**Default**: `""`

#### `shared_disk`

Stores WAL data on shared storage specified by `shared_disk`.
See [Zero-Replication NativeLog](/cluster#zero-replication-nativelog) for more details.

#### `ingest_mode`

Controls whether ingestion into a stream is synchronous or asynchronous. Works together with [`ack`](#ack).

Supported values:
- `sync`: insert is synchronous
- `async`: insert is asynchronous
- `""`: system decides automatically

#### `ack`

Controls when to acknowledge the client for an insert.

Supported values:
- `quorum`: acknowledge after quorum commit
- `local`: acknowledge after local commit (may risk data loss)
- `none`: fire-and-forget, acknowledge immediately

**Examples:**
- `ack=quorum` + `ingest_mode=async`: **async quorum insert**
  - The client inserts data continuously without waiting for acks.
  - Internally, the system tracks outstanding inserts with unique IDs and removes them when acks arrive.
  - It improves throughput and reduces overall latency in continuous insert (e.g in Materialized View).

- `ack=quorum` + `ingest_mode=sync`: **sync quorum insert**
  - Waits for an ack for each insert before proceeding to the next one.

#### `ingest_batch_max_bytes`

(Works only `shared_disk` is configured)
Flushes to shared storage when the batch size threshold is reached, improving throughput.

**Default**: `67108864` (64MB)

#### `ingest_batch_timeout_ms`

(Works only `shared_disk` is configured)
Flushes to shared storage when the batch timeout threshold is reached, improving throughput.

**Default**: `500`

#### `fetch_threads`

(Works only `shared_disk` is configured)
Controls the parallelism when fetching data from remote shared storage.

**Default**: `1`

#### `flush_threshold_count`

Flushes data to the backend columnar store when this row threshold is reached.

#### `flush_threshold_ms`

Flushes data to the backend columnar store when this time threshold is reached.

#### `flush_threshold_bytes`

Flushes data to the backend columnar store when this bytes threshold is reached.

## Enable Zero-Replication WAL

You can store WAL (NativeLog) data in S3-compatible cloud storage. To enable this, configure a disk and then create an append stream using that disk.

```sql
CREATE DISK s3_plain_disk DISK(
    type = 's3_plain',
    endpoint = 'http://localhost:9000/disk/shards/',
    access_key_id = 'minioadmin',
    secret_access_key = 'minioadmin'
);

CREATE STREAM shared_disk_mutable_stream(i int, s string)
SETTINGS
    shared_disk = 's3_plain_disk',
    ingest_batch_max_bytes = 67108864,
    ingest_batch_timeout_ms = 200,
    fetch_threads = 1;
```

For more details on its benefits, see [Cluster](/cluster#zero-replication-nativelog).

## Examples

The following example creates an append-stream with:
- Multiple shards
- Zero-replication WAL (NativeLog) enabled
- zstd compression for WAL data

```sql
CREATE STREAM elastic_serving_stream
(
  p string,
  id uint64,
  p2 uint32,
  c1 string,
  c2 int,
  v datetime64(3),
)
SETTINGS
  shards = 3,
  shared_disk='s3_disk',
  ingest_batch_timeout_ms=200,
  fetch_threads=2,
  logstore_codec='zstd',
  ttl_seconds=86400;
```

```sql
-- Insert data to append-stream
INSERT INTO elastic_serving_stream(p, id, p2, c1, c2, v) VALUES ('p', 100, 1, 'c', 2, '2025-09-18 00:00:00');

SELECT * FROM table(elastic_serving_stream);
```
