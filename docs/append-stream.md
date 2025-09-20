# Append Stream

An **Append Stream** in Timeplus is best understood as a **streaming ClickHouse / Snowflake** table that uses a columnar format, designed and optimized for streaming analytics workloads where frequent data mutations are uncommon.

## Create Append Stream

```sql
CREATE STREAM [IF NOT EXISTS] <db.stream-name>
(
    name1 [type1] [DEFAULT | ALIAS expr1] [COMMENT 'column-comment'] [compression_codec],
    name2 [type2] [DEFAULT | ALIAS expr1] [COMMENT 'column-comment'] [compression_codec],
    ...
)
ORDER BY (column, ...)
[PARTITION BY <expression>]
[PRIMARY KEY (column, ...)]
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

By default, Timeplus applies `lz4` compression. 

You can also define the compression method for each individual column in the `CREATE STREAM` query.

```sql
CREATE STREAM codec_example
(
    dt date CODEC(ZSTD),
    ts datetime CODEC(LZ4HC),
    float_value float32 CODEC(NONE),
    double_value float64 CODEC(LZ4HC(9)),
    value float32 CODEC(Delta, ZSTD)
)
```

### General Purpose Codecs

Timeplus supports general purpose codecs and specialized codecs.

#### NONE {#none}

`NONE` — No compression.

#### LZ4 {#lz4}

`LZ4` — Lossless [data compression algorithm](https://github.com/lz4/lz4) used by default. Applies LZ4 fast compression.

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — LZ4 HC (high compression) algorithm with configurable level. Default level: 9. Setting `level <= 0` applies the default level. Possible levels: \[1, 12\]. Recommended level range: \[4, 9\].

#### ZSTD {#zstd}

`ZSTD[(level)]` — [ZSTD compression algorithm](https://en.wikipedia.org/wiki/Zstandard) with configurable `level`. Possible levels: \[1, 22\]. Default level: 1.

High compression levels are useful for asymmetric scenarios, like compress once, decompress repeatedly. Higher levels mean better compression and higher CPU usage.

### Specialized Codecs {#specialized-codecs}

These codecs are designed to make compression more effective by exploiting specific features of the data. Some of these codecs do not compress data themselves, they instead preprocess the data such that a second compression stage using a general-purpose codec can achieve a higher data compression rate.

#### Delta {#delta}

`Delta(delta_bytes)` — Compression approach in which raw values are replaced by the difference of two neighboring values, except for the first value that stays unchanged. Up to `delta_bytes` are used for storing delta values, so `delta_bytes` is the maximum size of raw values. Possible `delta_bytes` values: 1, 2, 4, 8. The default value for `delta_bytes` is `sizeof(type)` if equal to 1, 2, 4, or 8. In all other cases, it's 1. Delta is a data preparation codec, i.e. it cannot be used stand-alone.

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — Calculates delta of deltas and writes it in compact binary form. Possible `bytes_size` values: 1, 2, 4, 8, the default value is `sizeof(type)` if equal to 1, 2, 4, or 8. In all other cases, it's 1. Optimal compression rates are achieved for monotonic sequences with a constant stride, such as time series data. Can be used with any fixed-width type. Implements the algorithm used in Gorilla TSDB, extending it to support 64-bit types. Uses 1 extra bit for 32-bit deltas: 5-bit prefixes instead of 4-bit prefixes. For additional information, see Compressing Time Stamps in [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf). DoubleDelta is a data preparation codec, i.e. it cannot be used stand-alone.

#### GCD {#gcd}

`GCD()` - - Calculates the greatest common denominator (GCD) of the values in the column, then divides each value by the GCD. Can be used with integer, decimal and date/time columns. The codec is well suited for columns with values that change (increase or decrease) in multiples of the GCD, e.g. 24, 28, 16, 24, 8, 24 (GCD = 4). GCD is a data preparation codec, i.e. it cannot be used stand-alone.
#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — Calculates XOR between current and previous floating point value and writes it in compact binary form. The smaller the difference between consecutive values is, i.e. the slower the values of the series changes, the better the compression rate. Implements the algorithm used in Gorilla TSDB, extending it to support 64-bit types. Possible `bytes_size` values: 1, 2, 4, 8, the default value is `sizeof(type)` if equal to 1, 2, 4, or 8. In all other cases, it's 1. For additional information, see section 4.1 in [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078).

#### FPC {#fpc}

`FPC(level, float_size)` - Repeatedly predicts the next floating point value in the sequence using the better of two predictors, then XORs the actual with the predicted value, and leading-zero compresses the result. Similar to Gorilla, this is efficient when storing a series of floating point values that change slowly. For 64-bit values (double), FPC is faster than Gorilla, for 32-bit values your mileage may vary. Possible `level` values: 1-28, the default value is 12.  Possible `float_size` values: 4, 8, the default value is `sizeof(type)` if type is Float. In all other cases, it's 4. For a detailed description of the algorithm see [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf).

#### T64 {#t64}

`T64` — Compression approach that crops unused high bits of values in integer data types (including `Enum`, `Date` and `DateTime`). At each step of its algorithm, codec takes a block of 64 values, puts them into 64x64 bit matrix, transposes it, crops the unused bits of values and returns the rest as a sequence. Unused bits are the bits, that do not differ between maximum and minimum values in the whole data part for which the compression is used.

`DoubleDelta` and `Gorilla` codecs are used in Gorilla TSDB as the components of its compressing algorithm. Gorilla approach is effective in scenarios when there is a sequence of slowly changing values with their timestamps. Timestamps are effectively compressed by the `DoubleDelta` codec, and values are effectively compressed by the `Gorilla` codec. For example, to get an effectively stored table, you can create it in the following configuration:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```
### Encryption Codecs {#encryption-codecs}

These codecs don't actually compress data, but instead encrypt data on disk. These are only available when an encryption key is specified by encryption settings. Note that encryption only makes sense at the end of codec pipelines, because encrypted data usually can't be compressed in any meaningful way.

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — Encrypts data with AES-128 in [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV mode.

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — Encrypts data with AES-256 in GCM-SIV mode.

These codecs use a fixed nonce and encryption is therefore deterministic.

**Example**

```sql
CREATE STREAM mystream
(
    x string CODEC(AES_128_GCM_SIV)
)
ORDER BY x;
```

:::note
If compression needs to be applied, it must be explicitly specified. Otherwise, only encryption will be applied to data.
:::

**Example**

```sql
CREATE STREAM mystream
(
    x string Codec(Delta, LZ4, AES_128_GCM_SIV)
)
ORDER BY x;
```

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

You can store WAL (NativeLog) data in S3-compatible cloud storage. To enable this, configure a disk and then create a mutable stream using that disk.  

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

For more details on its benefits, see [Cluster](/cluster#zero_replication_log). 

## Examples

The following example creates an append-stream with:
- Multiple shards
- Secondary indexes
- Zero-replication WAL (NativeLog) enabled
- zstd compression for WAL data

```sql
CREATE MUTABLE STREAM elastic_serving_stream
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
