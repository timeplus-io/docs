# 流

## 所有数据都在流中

Timeplus 是一个流分析平台，数据存在于流中。 Timeplus 中的 `stream` 类似传统 SQL 数据库中的 `tables`。 两者基本上都是数据集。 关键的区别在于 Timeplus 流是一个只能附加的（默认情况下）、无界的、不断变化的事件组。

Timeplus 支持多种类型的流：

1. 默认情况下，这些流是仅限附加且不可变的（可以通过设置保留策略自动清除较旧的数据）。
2. If you want to create a stream to track the latest value for a primary key or a set of keys, you can create [Mutable Streams](/mutable-stream). 这仅在 Timeplus Enterprise 中可用。
3. In [Timeplus Proton](/proton), you can also create [Versioned Streams](/versioned-stream) and [Changelog Stream](/changelog-stream). But those 2 stream modes will be deprecated and replaced by mutable streams.
4. You can also define [External Streams](/external-stream) to run SQL against remote Kafka/Redpanda brokers, or the other Timeplus/Proton server.

## 创建一个流
You can create a stream via the Timeplus Console UI, or via [SQL](/sql-create-stream). 当您从 Kafka 或文件来源 [摄取数据](/ingestion) 到 Timeplus 中，可以自动创建数据流以匹配数据模式。

## 查询流

默认情况下，查询流将持续扫描新事件和输出新结果。 除非用户取消查询，否则它永远不会结束。 例如， 您可以从 HTTP 500 错误获取最新的网页日志，或从 IoT 设备获取每分钟的最大/最大/平均公尺。 Please read [Streaming Queries](/stream-query) for more details.

如果您只想分析现有数据并需要立即响应， 您可以通过 [表](/functions_for_streaming#table) 函数运行 [非流式查询](/history)。 这将在边界模式下转向查询，只扫描现有数据。 例如，您可以运行 `select count(*) from table(stream1)` 中以获取数据流中的行数。



## 删除流

您可以从网页控制台删除该流。 这将永久删除流中的所有数据并删除流本身。 删除后无法恢复数据。
