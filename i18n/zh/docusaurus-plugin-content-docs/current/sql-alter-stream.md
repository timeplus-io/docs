# 改变流

Currently we don't recommend to alter the schema of streams in Timeplus. 唯一的例外是您可以修改历史存储的保留政策。

## 修改 TTL

You can add or modify the retention policy. 例如 例如

```sql
ALTER STREAM stream_name MODIFY TTL to_datetime(created_at) + INTERVAL 48 HOUR
```
