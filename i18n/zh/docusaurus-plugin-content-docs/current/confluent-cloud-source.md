# 从 Confluent Cloud 中加载流数据

我们很高兴能与 [Confluent Cloud](https://www.confluent.io/confluent-cloud/?utm_campaign=tm.pmm_cd.2023_partner_cwc_timeplus_generic&utm_source=timeplus&utm_medium=partnerref)合作，让您可以轻松地连接您的流媒体数据。

## Confluent Cloud 资源

1. 在左侧导航菜单中，单击 **数据摄取**，然后单击右上角的 **添加数据** 按钮。
2. 在此弹出窗口中，您将看到您可以连接的数据源以及其他添加数据的方法。 点击 **Confluent Cloud**。
3. 输入您Confluent Cloud集群的bootstrap UR，然后设置Kafka API 密钥和密码提示。 点击 **下一个**。
4. 输入 Kafka 主题的名称，并指定“读取为”的数据格式。 我们目前支持JSON，Avro，Protobuf，Text和其他格式。
    1. 如果 Kafka 主题中的数据采用 JSON 格式，但架构可能会随着时间的推移而发生变化，我们建议您选择 Text。 这样，整个 JSON 文档将保存为字符串，即使架构发生变化，您也可以应用与 JSON 相关的函数来提取值。
    2. 如果您选择Avro，则有一个“自动提取”选项。 默认情况下，此选项处于关闭状态，这意味着整条消息将另存为字符串。 如果您将其打开，则 AVRO 消息中的顶级属性将被放入不同的列中。 这对您而言更方便查询，但不支持架构进化。 当选择 Avro 时，您还需要指定架构注册表的地址、API 密钥和密码提示。
    3. 如果您选择 Protobuf，请将整个 Protobuf 定义粘贴到其中，然后指定根消息名称。
5. 在接下来的“预览”步骤中，我们将从您指定的 Confluent Cloud 数据源中向您展示至少一个事件。
6. 默认情况下，您的新数据源将在 Timeplus 中创建一个新流。 给这个新流命名并验证列信息（列名和数据类型）。 您也可以将一列设置为事件时间列。 如果您不这样做，我们将使用摄取时间作为事件时间。 或者，您可以从下拉列表中选择一个现有的流。
7. 在预览您的数据后，您可以给源提供一个名称和一个可选的描述，并审查配置。 单击“完成”后，您的流数据将立即在指定的流中可用。 
