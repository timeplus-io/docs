# 从Apache Kafka加载流数据

当前Kafka是Timeplus最主要的实时数据来源(和下游)。 你也可以创建[外部流](working-with-streams#external_stream)来分析Confluent/Kafka/Redpanda中的数据而不移动数据。

## Apache Kafka数据源

1. 在左侧导航菜单中，单击 **数据提取**。 在这里，您将看到连接源或外部流的方法。 单击 **Apache Kafka** （外部流）。
2. 输入经纪商 URL。 如果需要，您还可以启用 TLS 或身份验证。
3. 输入 Kafka 主题的名称，并指定 “读取为” 数据格式。 我们目前支持 JSON、AVRO 和文本格式。
   1. 如果 Kafka 主题中的数据采用 JSON 格式，但架构可能会随时间而变化，我们建议您选择文本。 这样，整个 JSON 文档将保存为字符串，即使架构发生变化，您也可以应用 JSON 相关函数来提取值。
   2. 如果您选择 AVRO，则可以选择 “自动提取”。 默认情况下，它处于关闭状态，这意味着整条消息将另存为字符串。 如果您将其打开，则 AVRO 消息中的顶级属性将放入不同的列中。 这会更方便你查询，但不支持架构演变。 选择 AVRO 时，您还需要为架构注册表指定地址、API 密钥和密钥。
4. 在下一步 “预览” 步骤中，我们将向您显示来自您指定 Apache Kafka 源的至少一个事件。
5. 默认情况下，您的新源将在Timeplus中创建新的流。 为这个新流命名并验证列信息（列名和数据类型）。 您也可以将一列设置为事件时间列。 如果您不这样做，我们将使用摄取时间作为活动时间。 或者，您可以从下拉列表中选择现有流。
6. 预览数据后，您可以为源指定名称和可选描述，并查看配置。 单击 “完成” 后，您的流数据将立即在指定的流中可用。

## 自定义Kafka部署

与上面类似的步骤。 请确保 Timeplus 能够与您的 Kafka 服务器直接连接。 您可以使用像 [ngrok](https://ngrok.com) 这样的工具将你的本地 Kafka 代理安全地暴露在互联网上，这样 Timeplus Cloud 就可以连接到它。 查看[博客](https://www.timeplus.com/post/timeplus-cloud-with-ngrok)了解更多详情。

:::info

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`44.232.236.191` for us-west-2.timeplus.cloud

:::

## Kafka源说明

请注意：

1. 目前，我们支持 Kafka 主题中的消息采用 JSON 和 AVRO 格式
2. 主题级别 JSON 属性将被转换为流列。 对于嵌套属性， 元素将被保存为 `String` 列，然后您可以用 [JSON functions](functions_for_json) 之一来查询它们。
3. JSON消息中的数值或布尔值类型将被转换为流中的对应类型。
4. 日期时间或时间戳将被保存为字符串列。 您可以通过 [to_time function](functions_for_type#to_time)将它们转换回 DateTime。
