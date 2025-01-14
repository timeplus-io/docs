# Troubleshooting Guide
This guide provides solutions to common issues you may encounter when using Timeplus.

Please also query [system.stream_state_log](/system-stream-state-log) and [system.stream_metric_log](/system-stream-metric-log) to check the state changes, metrics and errors of database resources in Timeplus.

## Memory Issues

### JOIN queries run out of memory

Symptoms:
```
default.hop_mv: Background runtime error: Code: 191. DB::Exception:
Streaming join's memory reaches max size: 524288000,
current total: 524297968, left total: 177712480, right total: 346585488:
While executing StreamingJoinTransform.
```

Solution:
Increase the JOIN buffer size for the query or materialized view.

```sql
ALTER VIEW hop_mv MODIFY QUERY SETTING join_max_buffered_bytes=8589934592
```

### JavaScript UDF runs out of memory

Symptoms:
```
default.omv: Background runtime error: Code: 2531. DB::Exception:
Current V8 heap size used=571000 bytes, total=40307261440 bytes,
javascript_max_memory_bytes=2, exceed the limit=2 bytes, v8 heap stat={...}:
While executing GlobalAggregatingTransform. (UDF_MEMORY_THRESHOLD_EXCEEDED)
```

Solution:
Increase the memory limit for the JavaScript UDF.

```sql
ALTER VIEW <mv_name> MODIFY QUERY SETTING javascript_max_memory_bytes = 10485760000
```

## Data Consistency

### Materialized view is not updating

Symptoms:
```
default.HOP_mv: Background runtime error: Code: 2547. DB::Exception:
Failed to fetch for ns=default name=HOP_mv id=65496080-a11f-4db1-838c-072b5afcf4c0
shard=0, SEQUENCE_COMPACTED_AWAY: While executing StreamingStoreSource.
(SEQUENCE_COMPACTED_AWAY)
```

Solution:
* Check the definition of the materialized view via `SHOW CREATE <mv_name>`.
* Drop the materialized view and recreate it.

## Data Size and Ingestion

### TOO_LARGE_RECORD
Symptoms:
```
Code: 2514. DB::Exception: Failed to ingest, error=TOO_LARGE_RECORD. (TOO_LARGE_RECORD)
```

Solution:

For ad-hoc stream ingestion, you can increase the `max_insert_block_size` setting to allow larger records.

```sql
INSERT INTO appendOnlyStream
SETTINGS max_insert_block_size=10, max_insert_threads=8
SELECT ..
```

If you encounter this issue with a materialized view, you can increase the `max_entry_size` setting in timeplusd.yml.
 1. Stop the Timeplus service.
 2. Edit the `data.datastore.log.max_entry_size` setting in the `timeplusd.yml` configuration file. The default value is 10485760(10MB). You can set to 100MB, which is 104857600.
 3. Start the Timeplus service.

### Fail to drop streams with large data
Symptoms:
```
Stream or Partition in default.hop_mv was not dropped.
Reason: Size (81.49 GB) is greater than max_[table/partition]_size_to_drop (50.00 GB)
```

Solution:
You can drop with the `force_drop_big_stream` setting.

```sql
DROP STREAM hop_mv SETTINGS force_drop_big_stream=1
```

### Fail to ingest data when the disk is 90% full
Symptoms:

Ingestion fails with the error `Disk is 90% full`.

Solution:

Please free up some disk space to allow ingestion to continue.

## Concurrency

### Too many concurrent queries
Symptoms:
```
DB::Exception: Too many simultaneous queries. Maximum: 100.
(TOO_MANY_SIMULTANEOUS_QUERIES)
```

Solution:
Increase the `max_concurrent_queries` setting in timeplusd.yml.

 1. Stop the Timeplus service.
 2. Edit the `max_concurrent_queries` setting in the `timeplusd.yml` configuration file. The default value is 100. You can set to 200 or higher.
 3. Start the Timeplus service.

You can also set different values for `max_concurrent_insert_queries` and `max_concurrent_select_queries`.

Increasing these limits may impact the performance and require more system resources. Please monitor the system performance after changing these settings.
