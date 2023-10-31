# 流

## 所有数据都在流中

Timeplus 是一个流分析平台，数据存在于流中。 Timeplus 中的 `stream` 类似传统 SQL 数据库中的 `tables`。 两者基本上都是数据集。 关键的区别在于 Timeplus 流是一个只能附加的（默认情况下）、无界的、不断变化的事件组。

:::info

Timeplus 支持多种类型的流：

1. 默认情况下，这些流是仅限附加且不可变的（可以通过设置保留策略自动清除较旧的数据）。
2. 如果您想要创建一个流来追踪主键的最新值，您可以创建 [变更日志流](changelog-stream)。 它非常适合与 CDC（更改数据捕获）数据源配合使用，例如适用于 PostgreSQL，MongoDB 或其他数据库的 [Debezium](https://debezium.io/) 。 可以将插入，更新，删除这些操作转换并更新到变更日志流，并且您总是可以获得任何主键的最新行。
3. 如果需要保留比最新值更多的值，您也可以创建 [多版本流](versioned-stream)。 当您运行 SQL 将仅限附加的流与此类版本化流连接时，Timeplus 将自动使用时间戳最接近的版本来匹配仅限附加的流。
4. 您也可以定义 [外部流](external-stream) 来对远程的 Kafka/Redpanda 代理运行 SQL 。

:::

## 创建一个流

在大多数情况下，您不需要在 Timeplus 中明确创建一个流。 当您从 Kafka 或文件来源 [摄取数据](ingestion) 到 Timeplus 中，可以自动创建数据流以匹配数据模式。

:::info

此页面的其余部分均假设您正在使用 TimePlus 控制台。 如果您使用的是 Proton，则可以使用 DDL 创建流。 [Learn more](proton-create-stream)

:::

## 查询流

默认情况下，查询流将持续扫描新事件和输出新结果。 除非用户取消查询，否则它永远不会结束。 例如， 您可以从 HTTP 500 错误获取最新的网页日志，或从 IoT 设备获取每分钟的最大/最大/平均公尺。 欲了解更多详情，请阅读 [流查询](stream-query)。

如果您只想分析现有数据并需要立即响应，您可以通过 [table](functions_for_streaming#table) 函数运行 [非流式查询](history)。 这将在边界模式下转向查询，只扫描现有数据。 例如，您可以运行 `select count(*) from table(stream1)` 中以获取数据流中的行数。



## 删除流

您可以从网页控制台删除该流。 这将永久删除流中的所有数据并删除流本身。 删除后无法恢复数据。

