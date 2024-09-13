# FAQ

2023 年 9 月 21 日，Timeplus 宣布了开源项目： [Timeplus Proton](https://github.com/timeplus-io/proton/)。 我们使用这个常见问题作为主要参考来了解什么是Timeplus Proton，我们如何许可代码开源，今天如何使用Timeplus Proton等等。

## 什么是 Timeplus Proton？

Timeplus Proton 是 [Timeplus Enterprise](https://www.timeplus.com)的核心引擎，这是一个统一的流和历史数据处理引擎，专为提高效率和强劲性能而设计。 Timeplus Proton 没有外部服务依赖关系，这使您可以将其部署在裸机、边缘设备、容器内或作为协调的云环境的一部分进行部署。

Timeplus Proton建立在广受欢迎的开源项目 [ClickHouse项目](https://github.com/ClickHouse/ClickHouse) 之上，其历史数据、存储、计算功能和部分查询引擎是其历史数据、存储、计算功能和部分查询引擎的。

通过利用ClickHouse的成熟技术，Timeplus Proton为开源社区带来了更成熟的在线分析处理（OLAP）功能，并进行了许多新开发以统一流和处理引擎。 你可以将Timeplus Proton与现有的ClickHouse部署一起使用，以启用其他功能。

## Timeplus Proton 是如何获得许可的？ {#license}

Timeplus Proton 遵循 ClickHouse 许可模式，推出了 [Apache License 2.0](https://github.com/timeplus-io/proton/blob/develop/LICENSE)，而 [Kubernetes](https://github.com/kubernetes/kubernetes) 和 [Apache Flink](https://github.com/apache/flink)等热门开源项目也使用该许可模式。

Apache 许可证 2.0 是一个 [许可证](https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/) ，它允许不受限制地进行大多数用途。 我们将在接下来的 [部分](#use)中更多地讨论如何使用 Timeplus Proton。

我们之所以选择这个许可证，有几个重要原因：

- **我们走的是 ClickHouse 最初铺设的**之路。 由于Timeplus Proton利用了许多优秀的ClickHouse技术，我们希望看到我们的社区共同成长，随着时间的推移，这两个开源项目得到更深入的整合。

- **我们希望看到 Timeplus Proton 在独特而异国情调的环境中突破流和数据处理的极限**. 尽管Timeplus Proton已经为企业级Timeplus Cloud提供了支持，但开发者或其他最终用户可以下载和部署Timeplus Proton或在本地修改代码以用于私有云基础架构。 使用Timeplus Proton不需要您采用Timeplus Enterprise或与我们的销售团队会面。

- **我们渴望看看 _免费_ 流和历史数据处理引擎能带来什么价值**。 通过向开源社区发布 Timeplus Proton 的单节点版本，我们为开发者、业余爱好者、发烧友以及任何想尝试新技术的人提供了一条完全免费的新途径。

- **我们正在围绕统一流和批数据处理** 建立一个新的社区。 ClickHouse 为处理铺平了道路，但围绕流计算，我们还有很多东西要一起实验和发现。 我们迫不及待地想从各种规模和流成熟度的组织中获得开发者和用户的反馈。

## Timeplus Proton 项目允许哪些商业用途及其他用途？ {#use}

在 Apache License 2.0 下，你可以修改、分发和再许可 Timeplus Proton，因为它在 GitHub 上可用。

您还可以在专有软件中加入Timeplus Proton，然后将其出售给客户，但这并不授予您使用宝腾或Timeplus商标的任何权利，也不会暗示您的组织与Timeplus之间存在商业关系或合作关系。

Apache License 2.0还防止Timeplus Proton的任何贡献者（Timeplus团队的成员或外部贡献者）被最终用户追究责任，无论他们是个人开发者还是商业组织。

## Timeplus Proton 与 Timeplus Enterprise 有哪些功能可用？ {#compare}

Timeplus Proton 在单个数据库节点上为统一的流和数据处理提供支持。 它的商业版本支持高级部署策略，并包括企业就绪功能。 我们还想澄清其他一些差异。

|               | **Timeplus Proton**       | **Timeplus 企业版**          |
| ------------- | ------------------------- | ------------------------- |
| **部署**        | <ul><li>单节点 Docker 镜像</li><li>Mac/Linux 上的单一二进制</li></ul> | <ul><li>单节点</li><li>集群</li><li>基于 Kubernetes 的 “自带云” (BYOC)</li><li>Fully-managed cloud service</li></ul> |
| **数据来源**      | <ul><li>随机流</li><li>外部流向 Apache Kafka、Confluent Cloud、Redpanda</li><li>[Streaming ingestion via REST API (compact mode only)](/proton-ingest-api)</li></ul> | <ul><li>Timeplus Proton 中的所有内容</li><li>WebSocket 和 HTTP 流</li><li>Apache Pulsar</li><li>上传 CSV</li><li>[Streaming ingestion via REST API (with API key and flexible modes)](/ingest-api)</li></ul> |
| **数据目的地（汇点）** | <ul><li>外部流向 Apache Kafka、Confluent Cloud、Redpanda</li></ul> | <ul><li>Timeplus Proton 中的所有内容</li><li>Apache Pulsar</li><li>Slack</li><li>网络挂钩</li><li>Timeplus 流</li></ul> |
| **支持**        | <ul><li>来自 GitHub 和 Slack 的社区支持</li></ul> | <ul><li>通过电子邮件、Slack 和 Zoom 提供企业支持，并附有 SLA</li></ul> |

这些细节可能会发生变化，但我们将尽最大努力确保它们准确代表Timeplus Proton和Timeplus Enterprise的最新路线图。

## 我的组织已经在使用ClickHouse了——是否有计划将Timeplus Proton与开源ClickHouse项目整合在一起？

You can create an [External Table](/proton-clickhouse-external-table) to read or write ClickHouse tables from Timeplus Proton. Check the tutorials for how to build streaming ETL [from Kafka to ClickHouse](/tutorial-sql-etl-kafka-to-ch), or [from MySQL to ClickHouse](/tutorial-sql-etl-mysql-to-ch), via Timeplus.

我们还在与ClickHouse, Inc.以及整个ClickHouse开源项目的人士进行对话，以探讨这些项目之间深度整合的可能性。

## 如果我熟悉 ClickHouse，那么使用 Timeplus Proton 对我来说有多容易？

简短的答案：非常简单。 我们将Timeplus Proton的用法设计为与ClickHouse类似，但有一些关键区别：

- Timeplus 的默认 SQL 查询模式是 **streaming**，这意味着它可以长时间运行，持续跟踪和评估更改后的数据，并将结果推送给用户或目标系统。 To create a [historical data query](/functions_for_streaming#table), wrap your SQL in `table(stream)`.
- 要为表、流或列创建临时名称，必须使用 SQL 关键字 `AS` 。
- 我们重命名了数据类型和函数以删除驼峰大小写。 例如，在 Timeplus Proton 中，ClickHouse 的 `toInt8 ()` 被重命名为 `to_int8 ()` 。 Our [functions](/functions) docs have additional details.
- 目前，并非所有的ClickHouse功能都可以在Timeplus Proton中启用，也不是在流查询中都能使用。 如果我们应该添加或增强 Timeplus Proton 中可用的功能，请在 [GitHub 问题](https://github.com/timeplus-io/proton/issues)中告诉我们。
- ClickHouse 中的物化视图适用于一个源表，数据在索引时处理。 In Timeplus Proton, you can define a [Materialized View](/proton-create-view#m_view) with a streaming SQL, for any number of streams, with JOIN, CTE, or subqueries. Timeplus Proton 持续运行查询，并将结果发送到内部流或目标流。
- In Timeplus Proton, [JOINs](/joins) are a powerful and flexible means of combining data from multiple sources into a single stream.

有关完整用法的详细信息，请参阅文档。

## Timeplus Proton 的使用情况是否被追踪？

是的。 我们在以下领域启用了遥测功能，以了解社区如何使用Timeplus Proton并帮助我们改进项目：

- **通过 Docker 镜像下载统计信息**，由 GitHub _提供，没有_ 任何个人识别信息 (PII)，例如 IP 地址。

- **启动**时，Timeplus Proton 向公共端点报告以下数据：

  - 当前 Timeplus Proton 版本
  - CPU 和内存可用性

Timeplus Proton 从未向该公共端点发送过任何用户数据、架构、SQL 语句或个人身份信息 (PII)。

你可以通过环境变量 `TELEMETRY_ENABLED`在 Timeplus Proton 中禁用遥测，比如 `docker run--env telemetry_enabled=false--name proton ghcr.io/timeplus-io/proton: latest` 或者使用以下步骤更新配置：

1. 启动 Timeplus Proton Docker 镜像
2. 使用 `docker exec-it proton bin/sh`连接到正在运行的容器
3. 运行以下命令来编辑容器的配置：

```bash
sed-i 's/telemetry_enabled：true/telemetry_enabled：false/g' /etc/proton-server/config.yaml
```

4.  停止并再次启动容器以在禁用所有遥测的情况下运行 Timeplus Proton。

如果你使用单一二进制，环境变量 `TELEMETRY_ENABLED` 也可以使用。 或者，你可以手动更新 config.yaml 文件来设置 `telemetry_enabled: false`。

有关我们收集和使用的遥测数据的完整详细信息，请参阅我们的 [隐私政策](https://www.timeplus.com/privacy-policy) 。

## Timeplus Proton 是否提供 JDBC/ODBC 驱动程序？

JDBC 驱动程序可在 https://github.com/timeplus-io/proton-java-driver 获得，ODBC 驱动程序可在 https://github.com/timeplus-io/proton-odbc 获得。

同时，你可以通过外部流将处理后的数据发送到Kafka主题，使用 [proton-go-driver](https://github.com/timeplus-io/proton-go-driver)或 [Redpanda Connect](https://github.com/redpanda-data/connect) 将数据发送到其他系统。

如果你使用的是 Timeplus Enterprise，你可以使用 REST API 或 [SDK](https://github.com/timeplus-io/gluon) 通过不属于 Timeplus Proton 的 API 服务器在 Timeplus 中运行查询或管理资源。

## 我可以为 Timeplus Proton 捐款吗？

是的！

最好的入门方法是查看 GitHub 上的 Timeplus Proton 仓库中的 [现有问题](https://github.com/timeplus-io/proton/issues) 。 我们还在我们 [Timeplus 社区 Slack](https://timeplus.com/slack)的 `#proton` 和 `#contributing` 频道中积极讨论 Timeplus Proton 的未来版本。

## 在哪里可以了解有关 Timeplus Proton 的更多信息？

我们目前正在开发资源，您可以在其中了解Timeplus Proton的架构、功能和未来：

- [GitHub](https://github.com/timeplus-io/proton/)
- [文档](/proton)
- [高级架构](/proton-architecture)
- [视频](https://youtube.com/@timeplusdata)
- [维基](https://github.com/timeplus-io/proton/wiki)

我们还在 [公告文章](https://www.timeplus.com/post/timeplus-journey-to-open-source)中讨论了我们以开源形式发布 Timeplus Proton 的旅程。

## 我怎样才能开始？

Learn how to pull and run the Timeplus Proton image and query a test stream in our [documentation](/proton#get-started). To see a more complete use case in action, using Timeplus Proton, Redpanda, and sample live data, check out our [tutorial](/proton-kafka#tutorial) that leverages Docker Compose.

If you need advanced deployment strategies or features, with Timeplus Proton running behind the scenes, create your first workspace with [Timeplus Cloud](https://us-west-2.timeplus.cloud/).
