# 拖放视图

运行以下 SQL 来删除视图或物化视图。

```sql
删除视图 [如果存在] 数据库。<view_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

::: Timeplus Cloud 用户须知

In Timeplus Cloud or Private Cloud deployments, we recommend you to drop views with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::