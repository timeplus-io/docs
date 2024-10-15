# 拖放视图

运行以下 SQL 来删除视图或物化视图。

```sql
删除视图 [如果存在] 数据库。<view_name>;
```

像 [CREATE STREAM](/proton-create-stream)一样，流删除是一个异步过程。

::: Timeplus Cloud 用户须知

In Timeplus Cloud or Private Cloud deployments, we recommend you to drop views with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::