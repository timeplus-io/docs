# 下拉流

运行以下 SQL 删除流，并将所有数据存储在流存储和历史存储中。

```sql
DROP STREAM [如果存在] db。<stream_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

::: Timeplus Cloud 用户须知

In Timeplus Cloud or Private Cloud deployments, we recommend you to drop streams with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::