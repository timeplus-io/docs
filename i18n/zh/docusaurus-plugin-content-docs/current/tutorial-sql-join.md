# 流式 JOIN

:::info

1. 本教程主要面向 Timeplus Proton 用户。 对于Timeplus Cloud用户，请查看 [指南]（quickstart），以使用网页界面将Timeplus与Confluent Cloud连接起来。 本指南中的SQL可以在Timeplus Proton和Timeplus Cloud/Enterprise中运行。
2. 查看 [前面的教程]（tutorial-sql-kafka）来设置示例数据。

:::

在 “owlshop-customers” 主题中，有一份包含以下元数据的客户列表

- id
-
-
-
-

在 “owlshop-addresses” 主题中，它包含每位客户的详细地址

- customer.id
-
-

您可以创建流式 JOIN 来验证这两个主题中的数据是否相互匹配。

```sql
```

备注：

- 定义了两个 CTE 以将 JSON 属性解析为列
- `SETTINGS seek_to='earliest'` 是从 Kafka 主题中获取最早数据的特殊设置
- `USING (id) `与 `ON left.id=right.id` 相同
- 选中 [JOIN]（连接）以获取更多连接动态和静态数据的选项

:::info

默认情况下，质子客户端以单行和单查询模式启动。 要同时运行多个查询语句，请从 `-n` 参数开始，即 docker exec-it proton-cainer-name proton-cainer-name proton-client-n

:::
