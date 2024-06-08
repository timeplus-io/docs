# 为什么选择 Timeplus？

![概览](/img/overview.png)

Timeplus 是一款简单、强大、经济实惠的流媒体处理器。

## 很简单{#simple}

Timeplus的核心引擎被设计和实现为单个二进制文件，没有任何依赖关系，例如JVM或Kubernetes。 这可以帮助开发人员轻松下载和设置系统，然后轻松管理和扩展系统。 Timeplus SQL 易于学习，Timeplus Console 易于使用。 简单性是该产品的关键 DNA，它使更多的数据团队能够以简单易维护的方式进行流处理。

## 强大 {#powerful}

Timeplus为分析实时数据和历史数据提供了独特的解决办法。 正如我们的公司名称所暗示的那样，我们专门处理实时数据。 Timeplus中的每个查询都可以检测到延迟的事件，您可以选择丢弃或等待它们。 支持常用时间窗口，如固定窗口tubmle、滑动窗口hop、会话窗口session。 您可以联合查询多个流（JOIN），或者通过CSV、S3或数据库来对数据添加上下问（Enrichment）。

Timeplus 不仅仅是一个流媒体处理器。 它提供端到端的分析功能。 Timeplus 支持其他数据连接，例如 NATS 和 WebSocket。 Timeplus提供了一个用户能够实时交互进行数据分析的网页。 提供实时可视化和仪表板。 用户可以将分析结果发送到Apache Kafka等下游数据系统，也可以触发警报，以便用户可以根据流分析结果检测到的异常情况进行实时操作。

了解我们的密钥使用案例和功能的完整列表请访问 [示例](showcases) 页面。

## 具有成本效益 {#cost_efficient}

Timeplus 用户无需为 Lambda 样式的数据堆栈设置和维护多个系统，因为 Proton 将流处理和历史数据分析统一到一个系统中。 这可以显著节省成本。

作为一种流处理，Timeplus是用C++语言实现的，它利用了矢量化数据计算能力和现代并行处理技术指令/多数据（SIMD）。 基础设施成本远低于传统的基于JVM的流处理器，例如Apache Flink或KSQLDB。

此外，由于Timeplus非常注重简单性和易用性，因此与Apache Flink或KSQLDB相比，工程师在开始使用Proton上的时间可以更少。 此外，由于Timeplus易于使用，企业主无需雇用许多高级工程师来构建流媒体应用程序。
