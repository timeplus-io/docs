

# 外部流

您也可以在 Timeplus 中创建 **外部流** 来查询外部系统中的数据，而不需要将数据加载到 Timeplus 中。 这样做的主要好处是在外部系统（例如：Apache Kafka）中保持一个单一的事实来源，而不是复制它们。 在许多情况下，这还可以实现更低的处理Kafka数据的延迟，因为数据由Timeplus读取，无需其他组件。

您可以以与其他流类似的方式对外部流运行流分析，但有一些限制。

Timeplus supports 3 types of external streams:
* [Kafka 外部流](/proton-kafka)
* [Timeplus External Stream](/timeplus-external-stream), only available in Timeplus Enterprise
* Log External Stream (experimental)
