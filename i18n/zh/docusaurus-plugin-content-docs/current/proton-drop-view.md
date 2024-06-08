# 拖放视图

运行以下 SQL 来删除视图或物化视图。

```sql
删除视图 [如果存在] 数据库。<view_name>;
```

像 [CREATE STREAM](proton-create-stream)一样，直播删除是一个异步过程。

::: Timeplus Cloud 用户须知

在 Timeplus Cloud 或私有云部署中，我们建议您使用 GUI 或 [Terraform Provider](terraform)删除视图，以便更好地跟踪世系和权限。

:::