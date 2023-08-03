

# 外部流

您也可以在 Timeplus 中创建 **外部流** 来查询外部系统中的数据，而不需要将数据加载到 Timeplus 中。 这样做的主要好处是在外部系统（例如Kafka）中保持一个单一的事实来源，而不是复制它们。 您可以以与其他流类似的方式对外部流运行流分析，但有一些限制。

## 支持的外部系统

支助的外部系统有：

* 开源 Apache Kafka 或 Redpanda，无需身份验证。
* Confluent Cloud 与SASL Plain 认证。

主题应包含纯文本或 JSON 格式的消息。

## 创建外部流

要创建外部流，请转到 **STREAMS** 页， 然后点击右侧的按钮，将其更改为 **创建外部流**。 设置流名称，Kafka 经纪人和主题名称。 选择正确的身份验证方法，然后点击 **创建**。

## 查询外部流

要查询外部系统中的数据，请以类似的方式运行流式SQL，比如： `SELECT count(*) FROM my_external_stream` 你也可以根据外部流创建 [视图](view) 或 [实际化视图](view#materialized-view)

## 限制

基在Kafka的外部流有一些限制，因为TimePlus不控制外部流的储存或数据格式。

1. 身份验证不是无，也不是SASL 平原。 还不支持 SASL Scram 256 或 512 。
2. 使用 JSON 或 TEXT 格式的数据格式。 AVRO或schema注册服务尚不被支持。 整个消息将放入 `个原始的` 字符串列。
3. 由于原始数据没有保存在Timeplus中，我们不能为每个事件在摄取时间附加事件时间或索引时间。 您可以在查询中指定表达式的事件时间，例如 `tumble(ext_stream,to_time(raw:order_time),1m)`
4. 与正常流不同的是，外部流没有历史存储。 因此您不能运行 `table(my_ext_stream)`或 `settings query_mode='table'` 来查询历史数据。 为了查询在您创建外部流之前的数据， 您可以使用 `WHERE _tp_time >'2023-01-15'` 来查询留在Kafka上的过去的数据。
5. 在Timeplus中没有关于外部流的保留政策。 您需要在Kafka/Confluent/Redpanda配置保留政策。 如果外部系统不再提供数据，则不能在Timeplus搜索。