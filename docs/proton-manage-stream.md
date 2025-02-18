# Manage Stream

## List Streams

```sql
SHOW STREAMS
```

## Describe a stream

```sql
SHOW CREATE <stream>
```

## ALTER STREAM

Currently we don't recommend to alter the schema of streams in Timeplus. The only exception is you can modify the retention policy for historical store.

### MODIFY TTL

You can add or modify the retention policy. e.g.

```sql
ALTER STREAM stream_name MODIFY TTL to_datetime(created_at) + INTERVAL 48 HOUR
```

## DROP STREAM

Run the following SQL to drop a stream or an external stream, with all data in streaming storage and historical storage.

```sql
DROP STREAM [IF EXISTS] db.<stream_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

:::info note for Timeplus Enterprise users

In Timeplus Enterprise deployments, we recommend you to drop streams with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::
