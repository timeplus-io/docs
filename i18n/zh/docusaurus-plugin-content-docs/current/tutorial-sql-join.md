# 流加入

:::info

1. 本教程主要面向 Timeplus Proton 用户。 对于Timeplus Cloud用户，请查看 [指南]（快速入门），以使用网络用户界面将Timeplus与Confluent Cloud连接起来。 本指南中的SQL可以在Timeplus Proton和Timeplus Cloud/Enterprise中运行。
2. 查看 [前面的教程]（教程-sql-kafka）来设置示例数据。

:::

在 “owlshop-customers” 主题中，有一份包含以下元数据的客户列表

- id
- 名字
- 姓氏
- 两性平等
- 电子邮件地址

在 “猫头鹰商店地址” 主题中，它包含每位客户的详细地址

- customer.id
- 街道、州、城市、邮政编码
- 名字，姓氏

您可以创建流 JOIN 来验证这两个主题中的数据是否相互匹配。

```sql
创建外部流客户（原始字符串）
设置类型='kafka'，
         brokers='redpanda: 9092'，
         topic='owlshop-customers；

创建外部流地址（原始字符串）
设置类型='kafka'，
         brokers='redpanda: 9092'，
         topic='owlshop-addresses'；

使用 parsed_customer AS（选择 raw: id 作为 ID，raw: firstName|' '||raw: LastName 作为姓名，
raw: gender 作为性别从客户设置中选择 seek_to='earliest '），
parsed_addr AS（选择 raw: customer.id 作为 ID，raw: street|' '|raw: city 作为地址，
raw: firstname|' ||raw: LastName 作为名字来自地址设置 seek_to='earliest')
选择 * 从 parsed_customer 中选择 * 使用 (id) 加入 parsed_addr；
```

备注：

- 定义了两个 CTE 以将 JSON 属性解析为列
- `SETTINGS seek_to='earliest'` 是从 Kafka 主题中获取最早数据的特殊设置
- `USING (id) `与 `ON left.id=right.id` 相同
- 选中 [JOIN]（连接）以获取更多连接动态和静态数据的选项

:::info

默认情况下，质子客户端以单行和单查询模式启动。 要同时运行多个查询语句，请从 `-n` 参数开始，即 docker exec-it proton-cainer-name proton-cainer-name proton-client-n

:::
