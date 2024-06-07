# 下拉流

运行以下 SQL 删除流，并将所有数据存储在流存储和历史存储中。

```sql
DROP STREAM [如果存在] db。<stream_name>;
```

像 [CREATE STREAM](proton-create-stream)一样，流删除是一个异步过程。

::: Timeplus Cloud 用户须知

在Timeplus Cloud或私有云部署中，我们建议你使用GUI或 [Terraform Provider](terraform)删除流，以更好地跟踪血统和权限。

:::
