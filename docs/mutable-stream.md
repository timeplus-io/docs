# Mutable Stream

This type of stream is only available in Timeplus Enterprise, with high performance query and UPSERT (UPDATE or INSERT). Starting from [Timeplus Enterprise 2.7](/enterprise-v2.7), mutable streams are enhanced to support DELETE operation.

As the name implies, the data in the stream is mutable. Value with the same primary key(s) will be overwritten.

The primary use case of mutable streams is serving as the lookup/dimensional data in [Streaming JOIN](/streaming-joins), supporting millions or even billions of unique keys. You can also use mutable streams as the "fact table" to efficiently do range queries or filtering for denormalized data model, a.k.a. OBT (One Big Table).

Learn more about why we introduced Mutable Streams by checking [this blog](https://www.timeplus.com/post/introducing-mutable-streams).

## CREATE
```sql
CREATE MUTABLE STREAM [IF NOT EXISTS] stream_name (
    <col1> <col_type>,
    <col2> <col_type>,
    <col3> <col_type>,
    <col4> <col_type>
    INDEX <index1> (col3)
    FAMILY <family1> (col3,col4)
    )
PRIMARY KEY (col1, col2)
SETTINGS
    logstore_retention_bytes=..,
    logstore_retention_ms=..,
    shards=..,
    version_column=..,
    coalesced=..,
    ttl_seconds=..
```

Since Timeplus Enterprise 2.7, if you create a mutable stream with `low_cardinality` columns, the system will ignore the `low_cardinality` modifier to improve performance.
[Learn more](/sql-create-mutable-stream).

`PARTITION BY`, `ORDER BY` or `SAMPLE BY` clauses are not allowed while creating the mutable stream.

Since Timeplus Enterprise 2.8.2, the following features are added:
* you can set `coalesced` (default to false). If it's true and the insert data only contains partial columns in the WAL, the partial columns will merge with the existing rows. [Learn more](#coalesced).
* you can set `ttl_seconds` (default to -1). If it's set to a positive value, then data with primary key older than the `ttl_seconds` will be scheduled to be pruned in the next key compaction cycle. [Learn more](#ttl_seconds).
* you can set `version_column` to make sure only rows with higher value of the `version_column` will override the rows with same primary key. This setting can work with or without `coalesced`.

## INSERT
You can insert data to the mutable stream with the following SQL:
```sql
INSERT INTO mutable_stream_name(column1, column2, column3, ...)
VALUES (value1, value2, value3, ...)

-- Alternatively, you can insert data from a query result
INSERT INTO mutable_stream_name(column1, column2, column3, ...)
SELECT ..

-- Or set the mutable stream as the target for a Materialized View
CREATE MATERIALIZED VIEW mv_name INTO mutable_stream_name AS SELECT ..
```

## UPDATE
To update the data in the mutable stream, you can insert the data with the same primary key(s). The new data will overwrite the existing data.

```sql
-- Add a new row with ID 1
INSERT INTO mutable_stream_name VALUES (1,'A')
-- Update the row with same ID
INSERT INTO mutable_stream_name VALUES (1,'B')
```

## DELETE
Starting from Timeplus Enterprise 2.7, you can delete data from the mutable stream.

```sql
DELETE FROM mutable_stream_name WHERE condition
```

It's recommended to use the primary key(s) in the condition to delete the data efficiently. You can also use the secondary index or other columns in the condition.

## SELECT
You can query the mutable stream with the following SQL:
```sql
-- streaming query
SELECT * FROM mutable_stream_name WHERE condition

-- batch query
SELECT * FROM table(mutable_stream_name) WHERE condition
```

Mutable streams can be used in [JOINs](/streaming-joins) or as the source or cache for [Dictionaries](/sql-create-dictionary).

## Example

### Create a mutable stream {#example_create}

Create the stream with the following SQL:

```sql
CREATE MUTABLE STREAM device_metrics
(
  device_id string,
  timestamp datetime64(3),
  batch_id uint32,
  region string,
  city string,
  lat float32,
  lon float32,
  battery float32,
  humidity uint16,
  temperature float32
)
PRIMARY KEY (device_id, timestamp, batch_id)
```

Note:
* The compound primary key is a combination of device_id, timestamp and the batch_id. Data with exactly the same value for those 3 columns will be overridden.
* Searching data with any column in the primary key is very fast.
* By default there is only 1 shard and no extra index or optimization.

### Load millions of rows {#example_load}

You can use [CREATE RANDOM STREAM](/sql-create-random-stream) and a Materialized View to generate data and send to the mutable stream. But since we are testing massive historical data with duplicated keys, we can also use `INSERT INTO .. SELECT` to load data.

```sql
INSERT INTO device_metrics
SELECT
    'device_' || to_string(floor(rand_uniform(0, 2400))) AS device_id,
    now64(9) AS timestamp,
    floor(rand_uniform(0, 50)) AS batch_id,
    'region_'||to_string(rand()%5) AS region,
    'city_'||to_string(rand()%10) AS city,
    rand()%1000/10 AS lat,
    rand()%1000/10 AS lon,
    rand_uniform(0,100) AS battery,
    floor(rand_uniform(0,80)) AS humidity,
    rand_uniform(0,100) AS temperature,
    now64() AS _tp_time
FROM numbers(50_000_000)
```

Depending on your hardware and server configuration, it may take a few seconds to add all data.
```
0 rows in set. Elapsed: 11.532 sec. Processed 50.00 million rows, 400.00 MB (4.34 million rows/s., 34.69 MB/s.)
```

### Query the mutable stream {#example_query}

When you query the mutable stream, Timeplus will read all historical data without any duplicated primary key.
```sql
SELECT count() FROM table(device_metrics)
```
Sample output:
```
┌─count()─┐
│  120000 │
└─────────┘

1 row in set. Elapsed: 0.092 sec.
```

You can filter data efficiently with any part of the primary key:
```sql
SELECT count() FROM table(device_metrics) WHERE batch_id=5
```
Sample output:
```
┌─count()─┐
│    2400 │
└─────────┘

1 row in set. Elapsed: 0.078 sec. Processed 120.00 thousand rows, 480.00 KB (1.54 million rows/s., 6.15 MB/s.)
```

Another example:
```sql
SELECT * FROM table(device_metrics) WHERE device_id='device_1' AND timestamp>now()-1h
```
Sample output:
```
┌─device_id─┬───────────────timestamp─┬─batch_id─┬─region───┬─city───┬──lat─┬──lon─┬───battery─┬─humidity─┬─temperature─┬────────────────_tp_time─┐
│ device_1  │ 2024-07-10 11:38:14.878 │        0 │ region_1 │ city_1 │ 21.1 │ 21.1 │  81.35298 │       41 │    81.35298 │ 2024-07-10 11:38:14.880 │
│ device_1  │ 2024-07-10 11:38:14.878 │       49 │ region_3 │ city_3 │ 33.3 │ 33.3 │ 62.507397 │       79 │   62.507397 │ 2024-07-10 11:38:14.880 │
└───────────┴─────────────────────────┴──────────┴──────────┴────────┴──────┴──────┴───────────┴──────────┴─────────────┴─────────────────────────┘

50 rows in set. Elapsed: 0.015 sec.
```

You can also query the mutable stream in the streaming SQL.
```sql
SELECT .. FROM mutable_stream
```
This will query all existing data and accept new incoming data.

Mutable stream can also be used in [JOINs](/streaming-joins).

## Advanced Settings

### Retention Policy for Historical Storage{#ttl_seconds}
Like normal streams in Timeplus, mutable streams use both streaming storage and historical storage. New data are added to the streaming storage first, then continuously write to the historical data with deduplication/merging process.

Starting from Timeplus Enterprise 2.9 (also backported to 2.8.2), you can set `ttl_seconds` on mutable streams. If the data's age (based on when the data is inserted, not _tp_time or particular columns) is older than this value, it is scheduled to be pruned in the next key compaction cycle. Default value is -1. Any value less than 0 means this feature is disabled.

```sql
CREATE MUTABLE STREAM ..
(
  ..
)
PRIMARY KEY ..
SETTINGS
    ttl_seconds=604800; -- 7 days
```

### Retention Policy for Streaming Storage {#streaming_ttl}
When you create the mutable stream, you can configure the maximum size of the streaming storage or Time-To-Live (TTL).

For example, if you want to keep up to 8GB or half an hour data in the streaming storage, you can add the following settings in the DDL:
```sql
CREATE MUTABLE STREAM ..
(
  ..
)
PRIMARY KEY ..
SETTINGS
    logstore_retention_bytes=8589934592, -- 8GB
    logstore_retention_ms=1800000; -- half an hour
```

### Secondary Index {#index}
Regardless of whether you choose a single column or multiple columns as the primary key(s), Timeplus will build an index for those columns. Queries with filtering on these columns will leverage the index to boost performance and minimize data scanning.

For other columns, if they are frequently filtered, you can also define secondary indexes for them.

For example:
```sql
CREATE MUTABLE STREAM device_metrics
(
  device_id string,
  timestamp datetime64(3),
  batch_id uint32,
  region string,
  city string,
  ..
  index sidx1 (region)
  index sidx2 (city)
)
PRIMARY KEY (device_id, timestamp, batch_id)
```
When you query data with filters on those columns, Timeplus will automatically leverage the indexed data to improve query performance.

### Column Family {#column_family}
For One-Big-Table(OBT) or extra wide table with dozens or even hundreds of columns, it's not recommended to run `SELECT * FROM ..`, unless you need to export data.

More commonly, you need to query a subset of the columns in different use cases. For those columns which are commonly queried together, you can define column families to group them, so that data for those columns will be saved together in the same file. Properly defining column families can optimize the disk i/o and avoid reading unnecessary data files.

Please note, one column can appear in up to one column family. The columns as primary keys are in a special column family. There should be no overlap for the column families or primary keys.

Taking the previous `device_metrics` as an example, the `lat` and `lon` are commonly queried together. You can define a column family for them.

```sql
CREATE MUTABLE STREAM device_metrics
(
  device_id string,
  timestamp datetime64(3),
  batch_id uint32,
  region string,
  city string,
  lat float32,
  lon float32,
  battery float32,
  humidity uint16,
  temperature float32,
  FAMILY cf1 (lat,lon)
)
PRIMARY KEY (device_id, timestamp, batch_id)
```

### Multi-shard {#shards}
Another optimization is to create multiple shards to partition the data when it scales. For example, to create 3 shards for `device_metrics`:
```sql
CREATE MUTABLE STREAM device_metrics
(
  device_id string,
  timestamp datetime64(3),
  batch_id uint32,
  region string,
  city string,
  lat float32,
  lon float32,
  battery float32,
  humidity uint16,
  temperature float32
)
PRIMARY KEY (device_id, timestamp, batch_id)
SETTINGS shards=3
```

### Coalesced and Versioned Mutable Stream {#coalesced}
For a mutable stream with many columns, there are some cases that only some columns are updated over time. Create a mutable stream with [Column Family](#column_family) and `coalesced=true` setting to enable the partial merge. For example, given a mutable stream:
```sql
create mutable stream kv_99061_1 (
       p string, m1 int, m2 int, m3 int, v uint64,
       family cf1(m1),
       family cf2(m2),
       family cf3(m3),
       family cf4(_tp_time)
) primary key p
settings coalesced = true;
```
If we insert one row with `m1=1`:
```sql
insert into kv_99061_1 (p, m1, _tp_time) values ('p1', 1, '2025-01-01T00:00:01');
```
Query the mutable stream. You will get one row.

Then insert the other row with the same primary key and `m2=2`.
```sql
insert into kv_99061_1 (p, m2, _tp_time) values ('p1', 2, '2025-01-01T00:00:02');
```
Query it again with
```sql
select * from table(kv_99061_1);
```
You will see one row with m1 and m2 updated and other columns in the default value.

Compared to the [Versioned Stream](versioned-stream), coalesced mutable streams don't require you to set all column values when you update a primary key. You can also set `version_column` to the column name to indicate which column with the version number. Say there are updates for the same primary key, `v` as the `version_column`, the first update is "v=1,p=1,m=1" and the second update is "v=2,p=1,m=2". For some reasons, if Timeplus receives the second update first, then when it gets the "v=1,p=1,m=1", since the version is 1, lower than the current version, so this update will be reject and we keep the latest update as "v=2,p=1,m=2". This is beneficial specially in distributed environment with potential out of order events.

## Performance Tuning {#tuning}
If you are facing performance challenges with massive data in mutable streams, please consider adding [secondary indexes](#index), [column families](#column_family) and use [multiple shards](#shards).

### key_space_full_scan_threads
Additionally, you can configure the number of threads for full-scan of the key space at the query time using the `key_space_full_scan_threads` setting, e.g.:
```sql
SELECT * FROM table(a_mutable_stream) WHERE num=166763.6691744028
SETTINGS key_space_full_scan_threads=8;
```
