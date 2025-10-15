# ALTER STREAM

You can modify the retention policy for historical store via [MODIFY TTL](#ttl) and modify the retention policy for streaming storage via [MODIFY SETTING](#modify_setting). For mutable streams, you can also run `MODIFY SETTING` to change the RocksDB settings.

You can also use [ALTER VIEW](/sql-alter-view) to modify the settings of materialized views (only available in Timeplus Enterprise).

## MODIFY TTL{#ttl}
You can add or modify the retention policy. e.g.

```sql
ALTER STREAM stream_name MODIFY TTL
to_datetime(created_at) + INTERVAL 48 HOUR
```

## MODIFY SETTING{#modify_setting}
You can add or modify the retention policy for streams or mutable streams, e.g.

```sql
ALTER STREAM stream_name MODIFY SETTING
logstore_retention_ms = ...,
logstore_retention_bytes = ...;
```

```sql
ALTER STREAM test MODIFY SETTING log_kvstore=1, kvstore_options='write_buffer_size=1024;max_write_buffer_number=2;max_background_jobs=4';
```

You can also change the codec for mutable streams. e.g.

```sql
ALTER STREAM test MODIFY SETTING logstore_codec='lz4';
```

## MODIFY QUERY SETTING

By default, the checkpoint will be updated every 15 minutes for materialized views. You can change the checkpoint interval without recreating the materialized views.

```sql
ALTER STREAM mv_with_inner_stream MODIFY QUERY SETTING checkpoint_interval=600
```

## RESET QUERY SETTING

By default, the checkpoint will be updated every 15 minutes for materialized views. After you change the interval you can reset it.

```sql
ALTER STREAM mv_with_inner_stream RESET QUERY SETTING checkpoint_interval
```

## ADD COLUMN

You can add a column to an existing stream. The value of the new column in the existing rows will be set to the default value of the data type, such as 0 for integer.

Syntax:
```sql
ALTER STREAM stream_name ADD COLUMN column_name data_type
```

```sql
ALTER STREAM stream_99005 ADD COLUMN e int, ADD COLUMN f int;
```

`DELETE COLUMN` is not supported yet. Contact us if you have strong use cases.

## RENAME COLUMN

```sql
ALTER STREAM stream_name RENAME COLUMN column_name TO new_column_name
```

## ADD INDEX

```sql
ALTER STREAM mutable_stream ADD INDEX index_name
```

## DROP INDEX

You can drop an index from a mutable stream.
```sql
ALTER STREAM mutable_stream DROP INDEX index_name
```

## MATERIALIZE INDEX

You can rebuild the secondary index `name` for the specified `partition_name`.

```sql
ALTER STREAM mutable_stream MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name] SETTINGS mutations_sync = 2"
```

For example:
```sql
ALTER STREAM minmax_idx MATERIALIZE INDEX idx IN PARTITION 2 SETTINGS mutations_sync = 2
```

## CLEAR INDEX

You can delete the secondary index `name` from disk.
```sql
ALTER STREAM mutable_stream CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name] SETTINGS mutations_sync = 2"
```

For example:
```sql
ALTER STREAM minmax_idx CLEAR INDEX idx IN PARTITION 2 SETTINGS mutations_sync = 2
```

## DROP PARTITION
You can delete some data in the stream without dropping the entire stream via `ALTER STREAM .. DROP PARTITION ..`.

By default the streams in Timeplus are partitioned by `_tp_time`: `PARTITION BY to_YYYYMMDD(_tp_time)`.

You can query the `system.parts` table to check the partitions for the given streams:
```sql
SELECT partition, table,name,active FROM system.parts
```
This may show results like this:
```
┌─partition─┬─table─────────┬─name───────────┬─active─┐
│ 20241014  │ test_stream   │ 20241014_1_1_0 │      0 │
│ 20241014  │ test_stream   │ 20241014_1_4_1 │      1 │
│ 20241014  │ test_stream   │ 20241014_2_2_0 │      0 │
│ 20241014  │ test_stream   │ 20241014_3_3_0 │      0 │
│ 20241014  │ test_stream   │ 20241014_4_4_0 │      0 │
│ 20241015  │ test_stream   │ 20241015_5_5_0 │      1 │
└───────────┴───────────────┴────────────────┴────────┘
```
You can delete data in certain partitions via SQL:
```sql
ALTER STREAM stream DROP PARTITION partition
```
Such as
```sql
ALTER STREAM test_stream DROP PARTITION 20241015
```

## See also
* [CREATE STREAM](/sql-create-stream) - Create streams
* [CREATE MATERIALIZED VIEW](/sql-create-materialized-view) - Create materialized views
* [ALTER VIEW](/sql-alter-view) - Alter views or materialized views
* [DROP STREAM](/sql-drop-stream) - Drop streams
* [DROP VIEW](/sql-drop-view) - Drop materialized views
