# ALTER STREAM

Currently we don't recommend to alter the schema of streams in Proton. The only exception is you can modify the retention policy for historical store. The only exception is you can modify the retention policy for historical store.

## MODIFY TTL

You can add or modify the retention policy. 例如 例如

```sql
ALTER STREAM stream_name MODIFY TTL to_datetime(created_at) + INTERVAL 48 HOUR
```

