

# 外部流

您也可以在 Timeplus 中创建 **外部流** 来查询外部系统中的数据，而不需要将数据加载到 Timeplus 中。 这样做的主要好处是在外部系统（例如Kafka）中保持一个单一的事实来源，而不是复制它们。 In many cases, this can also achieve even lower latency to process Kafka data, because the data is read by Timeplus database, without other components.

您可以以与其他流类似的方式对外部流运行流分析，但有一些限制。

## 支持的外部系统

支助的外部系统有：

* 开源 Apache Kafka 或 Redpanda，无需身份验证。
* Confluent Cloud 与SASL Plain 认证。

主题应包含纯文本或 JSON 格式的消息。 A single `raw` column will be created in the stream to capture the value of the messages in Kafka.

## 创建外部流

To create an external stream, go to the **Data Ingestion** page, then click the **Add Data** button on the right side and choose **External Streams** in the popup dialog. 设置流名称，Kafka 经纪人和主题名称。 选择正确的身份验证方法，然后点击 **创建**。 You cannot customize the stream schema. A single `raw` column will be created in the stream to capture the value of the messages in Kafka.

## 查询外部流

要查询外部系统中的数据，请以类似的方式运行流式 SQL，比如： `SELECT count(*) FROM my_external_stream` 您也可以根据外部流创建 [视图](view) 或 [实际化视图](view#materialized-view)。

## 限制

基于 Kafka 的外部流有一些限制，因为 TimePlus 不控制外部流的储存或数据格式。

1. 身份验证不是无，也不是 SASL Plain。 暂不支持 SASL Scram 256 或 512 。
2. 使用 JSON 或 TEXT 格式的数据格式。 尚不支持 AVRO 或架构注册服务。 整个消息将放入 `原始的` 字符串列。
3. 由于原始数据没有保存在 Timeplus 中，我们不能为每个事件在摄取时间附加事件时间或索引时间。 您可以在查询中指定表达式的事件时间，例如 `tumble(ext_stream,to_time(raw:order_time),1m)`。
4. 与正常流不同的是，外部流没有历史存储。 因此您不能运行 `table(my_ext_stream)` 或 `settings query_mode='table'` 来查询历史数据。为了查询在您创建外部流之前的数据，您可以使用 `WHERE _tp_time >'2023-01-15'` 来查询留在 Kafka 上的过去的数据。
5. 在 Timeplus 中没有关于外部流的保留政策。 您需要在 Kafka/Confluent/Redpanda 配置保留政策。 如果外部系统不再提供数据，则不能在 Timeplus 搜索。