# Why Timeplus?

![概览](/img/overview.png)

## 高性能存储 {#fast}

Timeplus 设计了一种基于列的数据格式，称为 **Timeplus数据格式(TDF)**，它支持极快的序列化和反序列化。 由于数据为列式存储，数据可以通过向量化进行高性能分析计算。  为了充分利用TDF的能力，Timeplus还设计了一个叫做Timeplus **原生日志 NativeLog** 的流存储。 加上TDF, Timeplus NativeLog 提供了高性能数据摄取， 它可以在磁盘上快速扫描数据并过滤流数据处理中不需要的内容。  Timeplus NativeLog也支持基于时间戳的快速寻找和针对时间序列数据分析的优化。

## 强大的分析引擎 {#powerful}

Timeplus具有高性能流式SQL引擎，带动矢量化数据计算能力。 利用现代并行处理技术指令/多数据（SIMD），以超高效率处理流量数据。 Timeplus为分析实时数据和历史数据提供了独特的解决办法。 正如我们的公司名称所暗示的那样，我们专门处理实时数据。 Timeplus中的每个查询都可以检测到延迟的事件，您可以选择丢弃或等待它们。 支持常用时间窗口，如固定窗口tubmle、滑动窗口hop、会话窗口session。 您可以联合查询多个流（JOIN），或者通过CSV、S3或数据库来对数据添加上下问（Enrichment）。

## 端到端分析平台 {#intuitive}

Timeplus不仅仅是流式SQL数据库，它提供了端到端分析能力。  Timeplus支持各种数据源连接，如Apache Kafka、Amazon S3和Amazon Kinesis。  Timeplus提供了一个用户能够实时交互进行数据分析的网页。  提供实时可视化和仪表板。  用户也可以使用 API 与数据交互或将分析结果发送到下游数据系统，例如Apache Kafka、数据库、数据仓或数据湖。  提供警报，以便用户能够根据流式分析结果检测到的异常进行实时操作。

了解我们的密钥使用案例和功能的完整列表请访问 [示例](showcases) 页面。
