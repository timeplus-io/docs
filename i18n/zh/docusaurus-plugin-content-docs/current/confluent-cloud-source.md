# 从 Confluent Cloud 中加载流数据

我们很高兴与 [Confluent Cloud](https://www.confluent.io/confluent-cloud/?utm_campaign=tm.pmm_cd.2023_partner_cwc_timeplus_generic&utm_source=timeplus&utm_medium=partnerref)合作，让您在不移动数据的情况下通过 [外部流](/external-stream) 轻松连接流数据。

## Video Tutorial

我们录制了一个视频来解释细节。

<iframe width="1253" height="697" src="https://www.youtube.com/embed/vf8uYJtoXAA" title="Timeplus 和 Confluent Cloud 入门" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Detailed Steps

1. From the left side navigation menu, click **Data Collection**. 在这里，您将看到连接源或外部流的方法。 单击 **Confluent Cloud** （外部流）。
2. 输入 Confluent Cloud 集群的引导 URL，然后设置 Kafka API 密钥和密钥。 点击 **下一步**。
3. 输入 Kafka 主题的名称，并指定 “读取为” 数据格式。 我们目前支持 JSON、Avro、Protobuf、文本和其他格式。
    1. 如果 Kafka 主题中的数据采用 JSON 格式，但架构可能会随时间而变化，我们建议您选择文本。 这样，整个 JSON 文档将保存为字符串，即使架构发生变化，您也可以应用 JSON 相关函数来提取值。
    2. 如果您选择 Avro，则可以选择 “自动提取”。 默认情况下，它处于关闭状态，这意味着整条消息将另存为字符串。 如果您将其打开，则 AVRO 消息中的顶级属性将放入不同的列中。 这会更方便你查询，但不支持架构演变。 选择 Avro 时，您还需要为架构注册表指定地址、API 密钥和密钥。
    3. 如果你选择 Protobuf，请将整个 Protobuf 定义粘贴进去，并指定根消息名称。
4. 在下一步 “预览” 步骤中，我们将向您显示来自您指定 Confluent 云源的至少一个事件。
5. 默认情况下，您的新源将在Timeplus中创建新的流。 为这个新流命名并验证列信息（列名和数据类型）。 您也可以将一列设置为事件时间列。 如果您不这样做，我们将使用摄取时间作为活动时间。 或者，您可以从下拉列表中选择现有流。
6. 预览数据后，您可以为源指定名称和可选描述，并查看配置。 单击 “完成” 后，您的流数据将立即在指定的流中可用。
