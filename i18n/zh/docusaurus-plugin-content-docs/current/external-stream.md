

# 外部流

您也可以在 Timeplus 中创建 **外部流** 来查询外部系统中的数据，而不需要将数据加载到 Timeplus 中。 这样做的主要好处是在外部系统（例如：Apache Kafka）中保持一个单一的事实来源，而不是复制它们。 在许多情况下，这还可以实现更低的处理 Kafka 数据的延迟，因为数据是由 Timeplus 数据库（Proton）读取的，无需其他组件。

:::info

从 Proton 1.3.18 开始，你还可以通过外部流和物化视图向 Apache Kafka 写入数据。 [点击此处，了解更多](proton-kafka#write-to-kafka-with-sql)

:::

您可以以与其他流类似的方式对外部流运行流分析，但有一些限制。

## 支持的外部系统

支助的外部系统有：

* 开源 Apache Kafka 或 Redpanda，无需身份验证。
* Confluent Cloud 与SASL Plain 认证。

主题应包含纯文本或 JSON 格式的消息。 将在流中创建一个 `raw` 列，用于捕获 Kafka 中消息的值。

## 创建外部流

:::info

此页面的其余部分均假设您正在使用 TimePlus 控制台。 如果您使用的是 Proton，则可以使用 DDL 创建流。 [点击此处，了解更多](proton-create-stream#create-external-stream)

:::

要创建外部流，请转到 **数据摄取** 页面，然后单击右侧的 **添加数据** 按钮，然后在弹出对话框中选择 **外部流** 。 设置流名称，Kafka 经纪人和主题名称。 选择正确的身份验证方法，然后点击 **创建**。 您无法自定义流架构。 将在流中创建一个 `raw` 列，用于捕获 Kafka 中消息的值。

## 查询外部流

要查询外部系统中的数据，请以类似的方式运行流式 SQL，比如： `SELECT count(*) FROM my_external_stream` 您也可以根据外部流创建 [视图](view) 或 [实际化视图](view#materialized-view)。

## 限制

基于 Kafka 的外部流有一些限制，因为 TimePlus 不控制外部流的储存或数据格式。

1. Data format in JSON, TEXT, or Protobuf format. 尚不支持 AVRO 或架构注册服务。 整个消息将放入 `原始的` 字符串列。
2. `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_append_time` is set only when message timestamp is an append time.
3. 与正常流不同的是，外部流没有历史存储。 因此您不能运行 `table(my_ext_stream)` 或 `settings query_mode='table'` 来查询历史数据。为了查询在您创建外部流之前的数据，您可以使用 `WHERE _tp_time >'2023-01-15'` 来查询留在 Kafka 上的过去的数据。
4. 在 Timeplus 中没有关于外部流的保留政策。 您需要在 Kafka/Confluent/Redpanda 配置保留政策。 如果外部系统不再提供数据，则不能在 Timeplus 搜索。