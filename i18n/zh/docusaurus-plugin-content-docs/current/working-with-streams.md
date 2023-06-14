# 流

## 所有数据都在流中

Timeplus是一个流式分析平台和数据流中的生命值。 Timeplus中的`stream`类似传统数据库中的`table` 两者基本上都是数据集。 Both of them are essentially datasets. The key difference is that Timeplus stream is an append-only (by default), unbounded, constantly changing events group.

:::info

Timeplus supports multiple types of streams:

1. By default, the streams are append-only and immutable (older data can be purged automatically by setting a retention policy).
2. If you want to create a stream to track the latest value for a primary key, you can create [Changelog Streams](changelog-stream). It works great with CDC(Change Data Capture) data sources, such as [Debezium](https://debezium.io/) for PostgreSQL, MongoDB or other databases. The INSERT, UPDATE, DELETE operations can be converted to update to the Changelog Stream, and you can always get the latest row for any primary key.
3. You can also create [Versioned Streams](versioned-stream) if you need to keep more than the latest value. When you run SQL to join an append-only stream with such a versioned stream, Timeplus will automatically use the version with the closest timestamp to match the append-only stream.
4. You can also define [External Streams](external-stream) to run SQL against remote Kafka/Redpanda brokers.

:::

## 创建一个流

In most cases, you don't need to explicitly create a stream in Timeplus. 当您 [从 Kafka 或 file 源到 Timeplus 的](ingestion) 数据时，可以自动创建数据流以匹配数据模式。



## 查询流

默认情况下，查询流将持续扫描新事件和输出新结果。 除非用户取消查询，否则它永远不会结束。 For example, you can get the latest web logs with HTTP 500 error or get the min/max/avg of a metric for every minute from an IoT device. 欲了解更多详情，请阅读 [流查询](stream-query)。

如果您只想分析现有数据并需要立即响应， 您可以通过 [表](functions#table) 函数运行 [非流式查询](history)。 这将在边界模式下转向查询，只扫描现有数据。 例如，您可以运行 `从表(串流1)` 中选择计数(*)以获取数据流中的行数。



## 删除流

您可以从网页控制台删除该流。 这将永久删除流中的所有数据并删除流本身。 删除后无法恢复数据。

