

# 外部流

您也可以在 Timeplus 中创建 **外部流** 来查询外部系统中的数据，而不需要将数据加载到 Timeplus 中。 这样做的主要好处是在外部系统（例如：Apache Kafka）中保持一个单一的事实来源，而不是复制它们。 在许多情况下，这还可以实现更低的处理Kafka数据的延迟，因为数据由Timeplus读取，无需其他组件。

:::info

从 Proton 1.3.18 开始，你还可以通过外部流和物化视图向 Apache Kafka 写入数据。 [点击此处，了解更多](proton-kafka#write-to-kafka-with-sql)

:::

您可以以与其他流类似的方式对外部流运行流分析，但有一些限制。

## 创建外部流

:::info

此页面的其余部分均假设您正在使用 TimePlus 控制台。 如果您使用的是 Proton，则可以使用 DDL 创建外部流。 [了解更多](proton-kafka)

:::

要创建外部流，请前往 **数据提取** 页面，然后选择一个以 **外部流** 作为数据类型的支持系统。 设置流名称，Kafka 经纪人和主题名称。 选择正确的身份验证方法，然后点击 **创建**。 对于 **Read as** 选项，如果你选择 **JSON**，那么 Timeplus 将在示例 Kafka 消息中使用顶级 JSON 键/值对创建多列。 如果你选择 **文本**，则将在流中创建一个 `原始` 列来捕获 Kafka 中消息的价值。

## 查询外部流

要查询外部系统中的数据，请以类似的方式运行流式 SQL，比如： `SELECT count(*) FROM my_external_stream` 您也可以根据外部流创建 [视图](view) 或 [实际化视图](view#materialized-view)。

## 限制

基于 Kafka 的外部流有一些限制，因为 TimePlus 不控制外部流的储存或数据格式。

1. 用户界面向导仅支持 JSON 或文本。 要使用 Avro、Protobuf 或架构注册表服务，你需要 [使用 SQL](proton-kafka)创建外部流。
2. `_tp_time` 可在外部流中使用（自 Proton 1.3.30 起）。 `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_append_time` is set only when message timestamp is an append time.
3. 与正常流不同的是，外部流没有历史存储。 因此，你无法运行 `table (my_ext_stream)`或 `设置 query_mode='table'` 要在创建外部流之前访问数据，你可以使用 `WHERE _tp_time >'2023-01-15'` 前往过去的特定时间戳，或者使用 `SETTINGS seek_to='earliest'`。
4. 在 Timeplus 中没有关于外部流的保留政策。 您需要在 Kafka/Confluent/Redpanda 配置保留政策。 如果外部系统不再提供数据，则不能在 Timeplus 搜索。
