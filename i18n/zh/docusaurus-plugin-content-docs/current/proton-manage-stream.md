# 数据流管理

## 列出流

```sql
```

## 描述流

```sql
```

## 改变流

Currently we don't recommend to alter the schema of streams in Timeplus. 唯一的例外是您可以修改历史存储的保留政策。

### 修改 TTL

您可以添加或修改保留政策。 例如

```sql
```

## 删除流

运行以下 SQL 来删除流或外部流，并将所有数据存储在流存储和历史存储中。

```sql
```

像 [CREATE STREAM]（Proton创建流）一样，流删除是一个异步过程。

:::info Timeplus Cloud 用户注意事项

在Timeplus云或私有云部署中，我们建议您使用GUI或 [Terraform提供商]（terraform）删除流，以更好地跟踪血统和权限。

:::
