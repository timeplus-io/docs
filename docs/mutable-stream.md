# Mutable Stream

A **Mutable Stream** in Timeplus is best thought of as a **streaming table** (similar to MySQL/PostgreSQL), but designed and optimized for **streaming workloads** and **high-performance analytics**.

Each Mutable Stream must define a **primary key**, which can consist of one or more columns. Each key corresponds to at most one row, and rows are distributed across shards by their primary key value (if the Mutable Stream is sharded). Keys are sorted in each shard enabling fast range query.

Mutable Streams are **row-encoded** and are ideal for workloads requiring frequent mutations with high carinality keys (billions of keys).

Key use cases include:
- **Incremental data revision processing** (changelog processing) in streaming join and aggregation when combined with [Materialized Views](/materialized-view).
- Serving as **dynamic lookup or dimensional data** in [Streaming JOINs](/streaming-joins).
- Acting as a **serving table** for efficient point or range queries using primary and/or secondary indexes. For example, storing metadata / checkpoint / Materialized View results etc in Mutable Streams to serve your applications.

For more details on the motivation behind Mutable Streams, see [this blog post](https://www.timeplus.com/post/introducing-mutable-streams).

## Create Mutable Stream

```sql
CREATE MUTABLE STREAM [IF NOT EXISTS] <db.stream-name>
(
    <column definitions>,
    INDEX <secondary-index-name1> (column, ...) [UNIQUE] STORING (column, ...),
    INDEX <secondary-index-name2> (column, ...) [UNIQUE] STORING (column, ...),
    ...
    FAMILY <column-family-name1> (column, ...),
    FAMILY <column-family-name2> (column, ...),
    ...
)
PRIMARY KEY (column, ...)
SETTINGS
    shards=<num-of-shards>,
    replication_factor=<replication-factor>,
    version_column=<version-column>,
    coalesced=[true|false],
    logstore_codec=['lz4'|'zstd'|'none'],
    logstore_retention_bytes=<retention-bytes>,
    logstore_retention_ms=<retention-ms>,
    ttl_seconds=<ttl-seconds>,
    auto_cf=[true|false],
    placement_policies='<placement-policies>',
    late_insert_overrides=[true|false],
    shared_disk='<shared-disk>',
    ingest_mode=['async'|'sync'],
    ack=['quorum'|'local'|'none'],
    ingest_batch_max_bytes=<batch-bytes>,
    ingest_batch_timeout_ms=<batch-timeout>,
    fetch_threads=<remote-fetch-threads>,
    flush_rows=<batch-flush-rows>,
    flush_ms=<batch-flush-timeout>,
    log_kvstore=[true|false],
    kvstore_codec=['snappy'|'lz4'|'zstd'],
    kvstore_options='<kvstore-options>',
    enable_hash_index=[true|false],
    enable_statistics=[true|false]
```

### Storage Architecture

Each shard in a Mutable Stream has [dural storage](/architecture#dural-storage), consisting of:

- Write-Ahead Log (WAL), powered by NativeLog. Enabling incremental processing.
- Historical key-value store, powered by RocksDB.

The Mutable Stream settings allow fine-tuning of both storage layers to balance performance, durability, and efficiency.

### Settings

#### `shards`

The number of shards in a Mutable Stream.
Increasing the shard count typically improves performance when the primary key cardinality is high, since each shard holds a distinct subset of keys.

**Default**: `1`

#### `replication_factor`

The number of replicas to maintain for high availability in a cluster deployment.

- **Default (single instance)**: `1`
- **Default (cluster deployment)**: `3`

#### `version_column`

Specifies a column used to version keys. A Mutable Stream always stores only the **latest version** of a key, regardless of insert order.

See [Versioned Mutable Stream](/mutable-stream-versioned) for details on usage, behavior, and use cases.

**Default**: `""`

#### `coalesced`

Enables coalesced mode for the Mutable Stream.

See [Coalesced Mutable Stream](/mutable-stream-coalesced) for details.

**Default**: `false`

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

#### `ttl_seconds`

Retention policy for the **historical key-value store (RocksDB)** based on ingest time (wall clock).  When a row exceeds this threshold, it is eligible for deletion. Garbage collection is background and **non-deterministic**, so do not rely on exact deletion timing.

**Default**: `-1` (no retention)

#### `auto_cf`

Automatically groups columns of similar type/characteristics into column families.
For example, all fixed-width columns (`int`, `int32`, `int64`, `datetime`, etc.) are grouped together.

**Default**: `false`

#### `placement_policies`

It is used to control the stream shard placement affinity (rack-aware replica placement). See [rack aware placement](/mutable-stream-rack-aware) documentation for details.

**Default**: `""`

#### `late_insert_overrides`

Applicable to [Versioned Mutable Streams](/mutable-stream-versioned).

- If `true`: when there is a version tie for rows with the same primary key, the **later insert** overrides the earlier one.
- If `false`: the **earliest row** is kept, and later rows are discarded.

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

#### `flush_rows`

Flushes data to the backend key-value store (RocksDB) when this row threshold is reached.

#### `flush_ms`

Flushes data to the backend key-value store (RocksDB) when this time threshold is reached.

#### `log_kvstore`

If `true`, logs internal RocksDB activity for debugging.

#### `kvstore_codec`

Controls data compression in RocksDB for better disk efficiency.

Supported values:
- `snappy`
- `lz4`
- `zstd`

#### `kvstore_options`

Specifies RocksDB options as semicolon-separated `key=value` pairs for fine-tuning.

**Example:**

```sql
kvstore_options='write_buffer_size=1024;max_write_buffer_number=2;max_background_jobs=4'
```

#### `enable_hash_index`

Uses HashIndex instead of BinarySearch in the RocksDB engine.

#### `enable_statistics`

Enables RocksDB statistics for monitoring and debugging.

## Auto-Increment Column

A **mutable stream** supports at most **one auto-increment column**.

**Rules and Restrictions**:
- Must be of type **`uint64`**.
- Always starts at **`1`**. User provided value will be discarded in the insert.
- Auto-increment values are **local to each shard** (not globally unique across shards).
- The auto-increment column is always **automatically secondary indexed**.

**Example**:

```sql
CREATE MUTABLE STREAM auto_incr
(
  id uint64 AUTO_INCREMENT,
  p string
)
PRIMARY KEY (p);
```

## Secondary Index

See the [Secondary Index](/mutable-stream-secondary-index) documentation for details.

## Column Family

A **column family** is a way to group related columns together with these grouping rules.
- Each column can belong to only one family (no overlaps).
- Columns not explicitly assigned to a family are placed in a **default column family**.
- Primary key columns are always stored in a reserved column family and cannot be reassigned.

There are 2 major use cases:
1. **Improve read performance for wide-column mutable streams**
   - Example: A mutable stream has 100 columns, but queries usually access only a subset.
   - By grouping frequently co-accessed columns into families, only the required family is read and deserialized, reducing overhead.

2. **Support collaborative updates**
   - Multiple clients can update different column families independently.
   - Together, the families form complete rows.
   - See [Coalesced Mutable Stream](/mutable-stream-coalesced) for details.

**Example**:

```sql
CREATE MUTABLE STREAM multi_cf_mu
(
  p1 string,
  p2 int,
  i uint64,
  k string,
  d datetime64(3),
  m string,
  FAMILY cf1 (i, d), -- Columns 'i' and 'd' are usually queried together
  FAMILY cf2 (k, m)  -- Columns 'k' and 'm' are usually queried together
)
PRIMARY KEY (p1, p2);

-- Only column family `cf1` is read and deserialized
SELECT i, d FROM table(multi_cf_mu);

-- Only column family `cf2` is read and deserialized
SELECT k, m FROM table(multi_cf_mu);
```

:::info
Using column families can slow down ingestion speed, since each family is internally grouped and encoded separately as distinct key/value pairs (increasing the number of internal keys in RocksDB).
:::

## Delete Rows

You can delete rows from a Mutable Stream using the `DELETE` statement:

```sql
DELETE FROM <db.mutable-stream-name> WHERE <predicates>;
```

- If the `WHERE` predicates can leverage the primary index or a secondary index, the delete operation will be fast.
- If no suitable index is available, the engine must perform a full scan to locate matching rows, which can be slower depending on the dataset size.

**Example**
```sql
-- Delete by priamry key is fast
DELETE FROM multi_cf_mu WHERE p1 = 'p1' AND p2 = 1;
```

## Examples

The following example creates a versioned mutable stream with:
- Multiple shards
- Secondary indexes
- One column family
- Zero-replication WAL (NativeLog) enabled
- zstd compression for WAL data
- One day key retention

```sql
CREATE MUTABLE STREAM elastic_serving_mu
(
  p string,
  id uint64 auto_increment,
  p2 uint32,
  c1 string,
  c2 int,
  v datetime64(3),
  INDEX sidx1 (c1),
  INDEX sidx2 (v),
  FAMILY cf1 (c1, c2)
)
PRIMARY KEY (p1, p2)
SETTINGS
  shards = 3,
  version_column='v',
  shared_disk='s3_disk',
  ingest_batch_timeout_ms=200,
  fetch_threads=2,
  logstore_codec='zstd',
  ttl_seconds=86400;
```

```sql
-- Insert data to mutable stream
-- value for `id` will be ignored since it is auto-incremental
INSERT INTO elastic_serving_mu(p, id, p2, c1, c2, v) VALUES ('p', 100, 1, 'c', 2, '2025-09-18 00:00:00');

-- Upsert for the same primary key `p`
INSERT INTO elastic_serving_mu(p, id, p2, c1, c2, v) VALUES ('p', 1000, 11, 'cc', 22, '2025-09-18 00:00:01');

-- Delete via priamry `p`
DELETE FROM elastic_serving_mu WHERE p = 'p';
```
