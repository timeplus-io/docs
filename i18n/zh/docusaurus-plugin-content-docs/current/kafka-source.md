# 从Apache Kafka加载流数据

当前Kafka是Timeplus最主要的实时数据来源(和下游)。 通过与Confluent的强大伙伴关系，我们可以将来自Confluent Cloud、Confluent Platform或Apache Kafka的实时数据加载到Timeplus流式引擎。 (最近引入了一个新功能来创建 [个外部流](working-with-streams#external_stream) 来分析Confluent/Kafka/Redpanda 中的数据而不移动数据)

## 汇合式云

1. 在左侧导航菜单中，单击 **数据源**。 然后单击 **Apache Kafka** 并确认你拥有必要的权限。
2. 为该数据源指定名称，并提供可选的备注。
2. 选择Kafka部署类型的汇流云。
2. 指定 broker(s) URL，例如 `pkc-abc12.us-west-2.aws.confluent.cloud:9092`
4. 指定Kafka主题的名称。
4. 当您选择Confluent Cloud时， **SASL Plain** 会被自动选中。 输入您的集群的 API 密钥和秘密密钥。
4. 对于数据格式，我们目前支持JSON、AVRO和文本格式。 如果Kafka 的数据格式为 JSON 格式，但模式可能会随着时间而变化，我们建议您选择文本格式。 这样整个JSON文件将被保存为字符串， 并且您可以使用 JSON 相关的函数来提取值，即使模式已更改。
4. 如果您选择AVRO，则有一个“自动提取”选项。 默认情况下它被关闭，意味着整个消息将被保存为字符串。 如果您开启，那么AVRO消息中的顶级属性将会放入不同的列中。 这对您更方便查询，但不支持模式进化。  当选择AVRO时，您还需要指定schema注册表的地址、API密钥和密钥。
5. 默认情况下，源可以在 Timeplus 中创建一个新流。 请指定新的流名称。 或者，您可以禁用流创建并从列表中选择一个现有的流。
7. 点击 **下一个** 预览来自指定的 Kafka 源的流量数据，并选择列作为事件时间。 如果你没有选择时间标记列，Timeplus 将使用摄取时间作为事件时间
8. 您可以更改您的配置。 单击 **Finish**后，您的流数据将立即在新流中可用。

## 自定义Kafka部署

类似于从 Confluent Cloud 加载数据的步骤。 您可能不需要指定 `SASL 纯` 作为身份验证方法。 请确保Timeplus能够与您的Kafka 服务器直接连接。 你可以使用像 [ngrok](https://ngrok.com) 这样的工具将你的本地 Kafka 代理安全地暴露在互联网上，这样 Timeplus Cloud 就可以连接到它。 查看 [此博客](https://www.timeplus.com/post/timeplus-cloud-with-ngrok) 了解更多详情。

## Kafka源说明

请注意：

1. 目前，我们支持 Kafka 主题中的消息采用 JSON 和 AVRO 格式
2. 主题级别 JSON 属性将被转换为流列。 对于嵌套属性， 元素将被保存为 `String` 列，然后您可以用 [JSON 函数之一](functions#processing-json) 查询它们。
3. Values in number or boolean types in the JSON message will be converted to corresponding types in the stream.
4. 日期时间或时间戳将被保存为字符串列。 你可以通过 [to_time 函数](functions#to_time)将它们转换回 DateTime。
