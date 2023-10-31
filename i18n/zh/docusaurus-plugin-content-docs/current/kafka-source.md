# 从Apache Kafka加载流数据

当前Kafka是Timeplus最主要的实时数据来源(和下游)。 你也可以创建[外部流](working-with-streams#external_stream)来分析Confluent/Kafka/Redpanda中的数据而不移动数据。

## Apache Kafka数据源

1. 在左侧导航菜单中，单击 **数据摄取**，然后单击右上角的 **添加数据** 按钮。
2. 在此弹出窗口中，您将看到您可以连接的数据源以及其他添加数据的方法。 点击**Apache Kafka**。
3. 输入broker URL 你也可以在需要时启用TLS或身份验证。
4. 输入 Kafka 主题的名称，并指定“读取为”的数据格式。 我们目前支持JSON、AVRO和文本格式。
   1. 如果 Kafka 主题中的数据采用 JSON 格式，但架构可能会随着时间的推移而发生变化，我们建议您选择 Text。 这样，整个 JSON 文档将保存为字符串，即使架构发生变化，您也可以应用与 JSON 相关的函数来提取值。
   2. 如果您选择AVRO，则有一个“自动提取”选项。 默认情况下，此选项处于关闭状态，这意味着整条消息将另存为字符串。 如果您将其打开，则 AVRO 消息中的顶级属性将被放入不同的列中。 这对您更方便查询，但不支持模式进化。 当选择AVRO时，您还需要指定schema注册表的地址、API密钥和密钥。
5. 在接下来的“预览”步骤中，我们将从您指定的Confluent Cloud数据源中向您展示至少一个事件。
6. 默认情况下，您的新数据源将在 Timeplus 中创建一个新流。 给这个新流命名并验证列信息（列名和数据类型）。 您也可以将一列设置为事件时间列。 如果您不这样做，我们将使用摄取时间作为事件时间。 或者，您可以从下拉列表中选择一个现有的流。
7. 在预览您的数据后，您可以给源提供一个名称和一个可选的描述，并审查配置。 单击“完成”后，您的流数据将立即在指定的流中可用。

## 自定义Kafka部署

与上面类似的步骤。 请确保 Timeplus 能够与您的 Kafka 服务器直接连接。 您可以使用像 [ngrok](https://ngrok.com) 这样的工具将你的本地 Kafka 代理安全地暴露在互联网上，这样 Timeplus Cloud 就可以连接到它。 查看[博客](https://www.timeplus.com/post/timeplus-cloud-with-ngrok)了解更多详情。

:::info

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`52.83.159.13` 对于 cloud.timeplus.com.cn

:::

## Kafka源说明

请注意：

1. 目前，我们支持 Kafka 主题中的消息采用 JSON 和 AVRO 格式
2. 主题级别 JSON 属性将被转换为流列。 对于嵌套属性， 元素将被保存为 `String` 列，然后您可以用 [JSON functions](functions_for_json) 之一来查询它们。
3. JSON消息中的数值或布尔值类型将被转换为流中的对应类型。
4. 日期时间或时间戳将被保存为字符串列。 您可以通过 [to_time function](functions_for_type#to_time)将它们转换回 DateTime。
