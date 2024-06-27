# 拖放视图

运行以下 SQL 来删除视图或物化视图。

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

像 [CREATE STREAM]（Proton创建流）一样，流删除是一个异步过程。

:::info Timeplus Cloud 用户注意事项

In Timeplus Cloud or Private Cloud deployments, we recommend you to drop views with GUI or [Terraform Provider](terraform), to better tracking the lineage and permission.

:::
