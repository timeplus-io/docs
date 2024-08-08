# 下拉流

运行以下 SQL 来删除流或外部流，并将所有数据存储在流存储和历史存储中。

```sql
DROP STREAM [IF EXISTS] db.<stream_name>;
```

Like [CREATE STREAM](sql-create-stream), stream deletion is an async process.

:::info Timeplus Cloud 用户注意事项

在Timeplus云或私有云部署中，我们建议您使用GUI或 [Terraform提供商]（terraform）删除流，以更好地跟踪血统和权限。

:::
