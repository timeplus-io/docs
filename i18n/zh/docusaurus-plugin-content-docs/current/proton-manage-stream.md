# 管理流

## 列出流

```sql
显示流
```

## 描述流

```sql
显示创建 <stream>
```

## 改变流

Currently we don't recommend to alter the schema of streams in Proton. The only exception is you can modify the retention policy for historical store. 唯一的例外是您可以修改历史存储的保留政策。

### 修改 TTL

You can add or modify the retention policy. 例如 例如

```sql
ALTER STREAM stream_name 将 TTL 修改为_datetime (created_at) + 间隔 48 小时
```

## 下拉流

运行以下 SQL 来删除流或外部流，并将所有数据存储在流存储和历史存储中。

```sql
DROP STREAM [如果存在] db。<stream_name>;
```

像 [CREATE STREAM]（质子创建流）一样，流删除是一个异步过程。

:::info Timeplus Cloud 用户注意事项

在Timeplus云或私有云部署中，我们建议您使用GUI或 [Terraform提供商]（terraform）删除流，以更好地跟踪血统和权限。

:::
