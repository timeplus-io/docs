

# 外部流

您也可以在 Timeplus 中创建 **外部流** 来查询外部系统中的数据，而不需要将数据加载到 Timeplus 中。 这样做的主要好处是在外部系统（例如：Apache Kafka）中保持一个单一的事实来源，而不是复制它们。 In many cases, this can also achieve even lower latency to process Kafka data, because the data is read by Timeplus, without other components.

:::info

从 Proton 1.3.18 开始，你还可以通过外部流和物化视图向 Apache Kafka 写入数据。 [点击此处，了解更多](proton-kafka#write-to-kafka-with-sql)

:::

您可以以与其他流类似的方式对外部流运行流分析，但有一些限制。

## 创建外部流

:::info

此页面的其余部分均假设您正在使用 TimePlus 控制台。 If you are using Proton, you can create the external stream with DDL. [Learn more](proton-kafka)

:::

To create an external stream, go to the **Data Ingestion** page, then choose one of the supported system with **External Stream** as the data type. 设置流名称，Kafka 经纪人和主题名称。 选择正确的身份验证方法，然后点击 **创建**。 For the **Read as** option, if you choose **JSON**, then Timeplus will create multiple columns with the top level JSON key/value pairs in the sample Kafka message. If you choose **Text**, then a single `raw` column will be created in the stream to capture the value of the messages in Kafka.

## 查询外部流

要查询外部系统中的数据，请以类似的方式运行流式 SQL，比如： `SELECT count(*) FROM my_external_stream` 您也可以根据外部流创建 [视图](view) 或 [实际化视图](view#materialized-view)。

## 限制

基于 Kafka 的外部流有一些限制，因为 TimePlus 不控制外部流的储存或数据格式。

1. The UI wizard only support JSON or TEXT. To use Avro, Protobuf, or schema registry service, you need to [create the external stream with SQL](proton-kafka).
2. `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_append_time` is set only when message timestamp is an append time.
3. 与正常流不同的是，外部流没有历史存储。 Hence you cannot run `table(my_ext_stream)`or `settings query_mode='table'` To access data even before you create the external stream, you can use `WHERE _tp_time >'2023-01-15'` to travel to a specific timestamp in the past, or use `SETTINGS seek_to='earliest'`.
4. 在 Timeplus 中没有关于外部流的保留政策。 您需要在 Kafka/Confluent/Redpanda 配置保留政策。 如果外部系统不再提供数据，则不能在 Timeplus 搜索。