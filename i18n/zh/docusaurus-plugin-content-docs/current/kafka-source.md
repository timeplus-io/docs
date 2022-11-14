# 从Apache Kafka加载流数据

As of today, Apache Kafka is the primary data source (and sink) for Timeplus. 通过与Confluent的强大伙伴关系，我们可以将来自Confluent Cloud、Confluent Platform或Apache Kafka的实时数据加载到Timeplus流式引擎。 (最近引入了一个新功能来创建 [个外部流](working-with-streams#external_stream) 来分析Confluent/Kafka/Redpanda 中的数据而不移动数据)

## 汇合式云

1. From the left side navigation menu, click **Sources**. Then click **Apache Kafka** and confirm you have the necessary permissions.
2. Specify a name for this data source, and provide an optional readable description.
2. 选择Kafka部署类型的汇流云。
2. 指定 broker(s) URL，例如 `pkc-abc12.us-west-2.aws.confluent.cloud:9092`
4. 指定Kafka主题的名称。
4. 当您选择Confluent Cloud时， **SASL Plain** 会被自动选中。 输入您的集群的 API 密钥和秘密密钥。
4. 对于数据格式，我们目前支持JSON、AVRO和文本格式。 If the data in the Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text format, so that the entire JSON document will be saved as a string, and you can apply JSON related functions to extract value, even the schema is changed.
4. 如果您选择AVRO，则有一个“自动提取”选项。 默认情况下它被关闭，意味着整个消息将被保存为字符串。 如果您开启，那么AVRO消息中的顶级属性将会放入不同的列中。 这对您更方便查询，但不支持模式进化。  当选择AVRO时，您还需要指定schema注册表的地址、API密钥和密钥。
5. 默认情况下，源可以在 Timeplus 中创建一个新流。 请指定新的流名称。 或者，您可以禁用流创建并从列表中选择一个现有的流。
7. 点击 **下一个** 预览来自指定的 Kafka 源的流量数据，并选择列作为事件时间。 If you don't specify an event time column, we will use the ingestion time as the event time.
8. You can review your configuration again. Once you click **Finish**, your streaming data will be available in the new stream immediately.

## 自定义Kafka部署

类似于从 Confluent Cloud 加载数据的步骤。 您可能不需要指定 `SASL 纯` 作为身份验证方法。 请确保Timeplus能够与您的Kafka 经纪人联系。



## Kafka源说明

请注意：

1. Currently we support JSON and AVRO formats for the messages in Kafka topics
2. 主题级别 JSON 属性将被转换为流列。 对于嵌套属性， 元素将被保存为 `String` 列，然后您可以用 [JSON 函数之一](functions#processing-json) 查询它们。
3. JSON消息中的数值或布尔值类型将被转换为流中的对应类型。
4. 日期时间或时间戳将被保存为字符串列。 你可以通过 [to_time 函数](functions#to_time)将它们转换回 DateTime。
