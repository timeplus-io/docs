# 改变直播

Currently we don't recommend to alter the schema of streams in Proton. The only exception is you can modify the retention policy for historical store. 唯一的例外是您可以修改历史存储的保留政策。

## 修改 TTL

You can add or modify the retention policy. 例如 例如

```sql
ALTER STREAM stream_name 将 TTL 修改为_datetime (created_at) + 间隔 48 小时
```

