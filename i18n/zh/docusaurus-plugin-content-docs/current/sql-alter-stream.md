# 改变流

Currently we don't recommend to alter the schema of streams in Timeplus. You can modify the retention policy for historical store via [MODIFY TTL](#ttl) and modify the retention policy for streaming storage via [MODIFY SETTING](#stream_ttl).

You can also use [ALTER VIEW](/sql-alter-view) to modify the settings of materialized views (only available in Timeplus Enterprise).

## MODIFY TTL{#ttl}

You can add or modify the retention policy. 例如 例如

```sql
ALTER STREAM stream_name MODIFY TTL
to_datetime(created_at) + INTERVAL 48 HOUR
```

## MODIFY SETTING{#stream_ttl}

You can add or modify the retention policy for streaming storage. 例如

```sql
ALTER STREAM stream_name MODIFY SETTING
logstore_retention_ms = ...,
logstore_retention_bytes = ...;
```

## MODIFY QUERY SETTING

:::info
This feature is available in Timeplus Enterprise v2.2.8 or above. Not available in Timeplus Proton.

Please use [ALTER VIEW](/sql-alter-view) for this use cases. Altering views or materialized views will be deprecated and removed from the `ALTER STREAM` SQL command.
:::

By default, the checkpoint will be updated every 15 minutes for materialized views. You can change the checkpoint interval without recreating the materialized views.

```sql
ALTER STREAM mv_with_inner_stream MODIFY QUERY SETTING checkpoint_interval=600
```

## RESET QUERY SETTING

:::info
This feature is available in Timeplus Enterprise v2.2.8 or above. Not available in Timeplus Proton.

Please use [ALTER VIEW](/sql-alter-view) for this use cases. Altering views or materialized views will be deprecated and removed from the `ALTER STREAM` SQL command.
:::

By default, the checkpoint will be updated every 15 minutes for materialized views. After you change the interval you can reset it.

```sql
ALTER STREAM mv_with_inner_stream RESET QUERY SETTING checkpoint_interval
```

## ADD COLUMN

:::info
This feature is available in single-node of [Timeplus Enterprise v2.4.15](/enterprise-v2.4#2415) or above. Not available in cluster or Timeplus Proton.
:::

You can add a column to an existing stream. The value of the new column in the existing rows will be set to the default value of the data type, such as 0 for integer.

语法：

```sql
ALTER STREAM stream_name ADD COLUMN column_name data_type
```

`DELETE COLUMN` or `RENAME COLUMN` are not supported yet. Contact us if you have strong use cases.

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

- [CREATE STREAM](/sql-create-stream) - Create streams
- [CREATE MATERIALIZED VIEW](/sql-create-materialized-view) - Create materialized views
- [ALTER VIEW](/sql-alter-view) - Alter views or materialized views
- [DROP STREAM](/sql-drop-stream) - Drop streams
- [DROP VIEW](/sql-drop-view) - Drop materialized views
