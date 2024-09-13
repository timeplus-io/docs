# 入门开始

本教程指导您如何将数据加载到Timeplus并通过数据运行分析查询。 要执行此教程，您需要一个 Timeplus 帐户。 If you don't have a Timeplus account, go to https://us-west-2.timeplus.cloud/ and sign up for free.

## 添加数据

为了帮助您快速入门，我们在每个工作空间中设置了演示数据集。 Please check the schema and common queries on [Demo Scenario](/usecases) page. 您可以立即探索和查询流。

当然，您可以加载自己的数据，例如：

* [上传一个 CSV 文件](/ingestion#streamgen)
* [Create a Kafka source](/ingestion#kafka) to load JSON documents from Confluent Cloud or Apache Kafka cluster.

## 探索数据

打开 **QUERY** 页面。 您将看到数据流列表。 点击任意Stream的名字，会在编辑器中自动生成`select * from ..`这样的查询。 You can click the **RUN QUERY** button to run a [streaming tail](/query-syntax#streaming-tailing) for the incoming data. 此流视图将让您很好地了解传入的数据结构和样本值。 将显示最近的10行结果。 更重要的是，您可以看到每一列的最高值和总体趋势。

要添加一些过滤条件或更改查询的其他部分， 您可以单击 **CANCEL QUERY** 按钮，也可以使用顶部的 **+** 按钮打开一个新的查询选项卡。

## 查询数据

SQL 是数据分析员最常用的工具。 Timeplus supports powerful yet easy-to-use [query syntax](/query-syntax) and [functions](/functions). You can also follow the samples in [Demo Scenario](/usecases) to query data.

## 可视化数据

您可以点击 **VISUALIZATION** 标签，将流式查询转换到带高FPS的流式图表(每秒帧)。 作为X轴选择时间列，然后选择带有聚合方法的数字列。 您可以添加您的主页图表。 从方框流式仪表板将很快添加到Timeplus。

同时，可以利用其他工具来直观时间插播。 如果您想要了解详细信息，请与我们联系。

## 发送数据输出

流出的洞察力或下取样数据可以设置为另一个Kafka主题，或通过电子邮件或斜杠通知某些用户。 运行串流查询，然后单击箭头图标。 您可以选择四个目的地中的一个：Slack、Email、Kafka、Webhook。

也可以将数据发送到其他系统，例如Snowflake。 如果您想要了解详细信息，请与我们联系。
