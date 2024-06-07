# Timeplus Proton 常见问题解答

2023 年 9 月 21 日，Timeplus 宣布了开源项目： [Timeplus Proton](https://github.com/timeplus-io/proton/)。 我们使用这个常见问题作为主要参考来了解什么是Timeplus Proton，我们如何许可代码开源，今天如何使用Timeplus Proton等等。

## 什么是 Timeplus Proton？

Timeplus Proton 是 [Timeplus Enterprise](https://www.timeplus.com)的核心引擎，这是一个统一的流和历史数据处理引擎，专为提高效率和强劲性能而设计。 Timeplus Proton 没有外部服务依赖关系，这使您可以将其部署在裸机、边缘设备、容器内或作为协调的云环境的一部分进行部署。

Timeplus Proton建立在广受欢迎的开源项目 [ClickHouse项目](https://github.com/ClickHouse/ClickHouse) 之上，其历史数据、存储、计算功能和部分查询引擎是其历史数据、存储、计算功能和部分查询引擎的。

通过利用ClickHouse的成熟技术，Timeplus Proton为开源社区带来了更成熟的在线分析处理（OLAP）功能，并进行了许多新开发以统一流媒体和处理引擎。 你可以将Timeplus Proton与现有的ClickHouse部署一起使用，以启用其他功能。

## Timeplus Proton 是如何获得许可的？ {#license}

Timeplus Proton 遵循 ClickHouse 许可模式，推出了 [Apache License 2.0](https://github.com/timeplus-io/proton/blob/develop/LICENSE)，而 [Kubernetes](https://github.com/kubernetes/kubernetes) 和 [Apache Flink](https://github.com/apache/flink)等热门开源项目也使用该许可模式。

Apache License 2.0 is a [permissive license](https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/) that allows for most uses without restriction. We'll talk more about how you can use Proton in the [following section](#use). 我们将在接下来的 [部分](#use)中更多地讨论如何使用 Timeplus Proton。

我们之所以选择这个许可证，有几个重要原因：

- **我们走的是 ClickHouse 最初铺设的**之路。 由于Timeplus Proton利用了许多优秀的ClickHouse技术，我们希望看到我们的社区共同成长，随着时间的推移，这两个开源项目得到更深入的整合。

- **我们希望看到 Timeplus Proton 在独特而异国情调的环境中突破流和数据处理的极限**. 尽管Timeplus Proton已经为企业级Timeplus Cloud提供了支持，但开发者或其他最终用户可以下载和部署Timeplus Proton或在本地修改代码以用于私有云基础架构。 使用Timeplus Proton不需要您采用Timeplus Enterprise或与我们的销售团队会面。

- **We're eager to see what value a _free_ streaming and historical data processing engine delivers**. By releasing the single-node edition of Proton to the open source community, we're giving developers, hobbyists, enthusiasts, and anyone who wants to try new technologies a new path that's entirely free. 通过向开源社区发布 Timeplus Proton 的单节点版本，我们为开发者、业余爱好者、发烧友以及任何想尝试新技术的人提供了一条完全免费的新途径。

- **We're building a new community around unified streaming and data processing**. ClickHouse paved the way for processing, but we have much to experiment and discover together around streaming. We can't wait to get feedback from developers and users within organizations of all sizes and degrees of streaming maturity. ClickHouse 为处理铺平了道路，但围绕流媒体，我们还有很多东西要一起实验和发现。 我们迫不及待地想从各种规模和流媒体成熟度的组织中获得开发者和用户的反馈。

## Timeplus Proton 项目允许哪些商业用途及其他用途？ {#use}

在 Apache License 2.0 下，你可以修改、分发和再许可 Timeplus Proton，因为它在 GitHub 上可用。

您还可以在专有软件中加入Timeplus Proton，然后将其出售给客户，但这并不授予您使用宝腾或Timeplus商标的任何权利，也不会暗示您的组织与Timeplus之间存在商业关系或合作关系。

Apache License 2.0还防止Timeplus Proton的任何贡献者（Timeplus团队的成员或外部贡献者）被最终用户追究责任，无论他们是个人开发者还是商业组织。

## Timeplus Proton 与 Timeplus Enterprise 有哪些功能可用？ {#compare}

Timeplus Proton 在单个数据库节点上为统一的流媒体和数据处理提供支持。 它的商业版本支持高级部署策略，并包括企业就绪功能。 我们还想澄清其他一些差异。

|               | **Timeplus Proton**       | **Timeplus 企业版**          |
| ------------- | ------------------------- | ------------------------- |
| **部署**        | <ul><li>单节点 Docker 镜像</li><li>Mac/Linux 上的单一二进制</li></ul> | <ul><li>单节点</li><li>集群</li><li>基于 Kubernetes 的 “自带云” (BYOC)</li><li>使用 SOC2 实现完全托管的云服务</li></ul> |
| **数据来源**      | <ul><li>随机流</li><li>外部流向 Apache Kafka、Confluent Cloud、Redpanda</li><li>[通过 REST API 进行流媒体采集（仅限紧凑模式）]（Proton摄取 API）</li></ul> | <ul><li>Timeplus Proton 中的所有内容</li><li>WebSocket 和 HTTP 流</li><li>阿帕奇脉冲星</li><li>干得好</li><li>上传 CSV</li><li>[通过 REST API 进行流式提取（使用 API 密钥和灵活模式）]（收录 API）</li></ul> |
| **数据目的地（汇点）** | <ul><li>外部流向 Apache Kafka、Confluent Cloud、Redpanda</li></ul> | <ul><li>Timeplus Proton 中的所有内容</li><li>阿帕奇脉冲星</li><li>Slack</li><li>网络挂钩</li><li>Timeplus 流</li></ul> |
| **支持**        | <ul><li>来自 GitHub 和 Slack 的社区支持</li></ul> | <ul><li>通过电子邮件、Slack 和 Zoom 提供企业支持，并附有 SLA</li></ul> |

这些细节可能会发生变化，但我们将尽最大努力确保它们准确代表Timeplus Proton和Timeplus Enterprise的最新路线图。

## 我的组织已经在使用ClickHouse了——是否有计划将Timeplus Proton与开源ClickHouse项目整合在一起？

你可以创建一个 [外部表](proton-clickhouse-external-table) 来读取或写入 Timeplus Proton 的 ClickHouse 表。 查看教程，了解如何通过 Timeplus 构建从 Kafka 到 ClickHouse的流式 ETL， [或者从 MySQL 构建到 ClickHouse](tutorial-sql-etl-kafka-to-ch)


我们还在与ClickHouse, Inc.以及整个ClickHouse开源项目的人士进行对话，以探讨这些项目之间深度整合的可能性。



## 如果我熟悉 ClickHouse，那么使用 Timeplus Proton 对我来说有多容易？

简短的答案：非常简单。 我们将Timeplus Proton的用法设计为与ClickHouse类似，但有一些关键区别：

- Timeplus' default SQL query mode is **streaming**, which means it is long-running and continuously tracks and evaluates changed data and pushes results to users or target systems. To create a [historical data query](functions_for_streaming#table), wrap your SQL in `table(stream)`. 要创建 [历史数据查询](functions_for_streaming#table)，请将您的 SQL 包装在 `表（流）`中。
- 要为表、流或列创建临时名称，必须使用 SQL 关键字 `AS` 。
- We renamed data types and functions to remove camelcase. For example, ClickHouse's `toInt8()` is renamed `to_int8()` in Proton. Our [functions](functions) docs have additional details. 例如，在 Timeplus Proton 中，ClickHouse 的 `toInt8 ()` 被重命名为 `to_int8 ()` 。 我们的 [函数](functions) 文档还有其他详细信息。
- 目前，并非所有的ClickHouse功能都可以在Timeplus Proton中启用，也不是在流查询中都能使用。 如果我们应该添加或增强 Timeplus Proton 中可用的功能，请在 [GitHub 问题](https://github.com/timeplus-io/proton/issues)中告诉我们。
- ClickHouse 中的物化视图适用于一个源表，数据在索引时处理。 在 Timeplus Proton 中，你可以使用流式 SQL 定义 [物化视图](proton-create-view#m_view) ，用于任意数量的流，使用 JOIN、CTE 或子查询。 Timeplus Proton 持续运行查询，并将结果发送到内部流或目标流。
- 在 Timeplus Proton 中， [JOIN](joins) 是一种将来自多个来源的数据合并为单个数据流的强大而灵活的手段。

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
- [文档](proton)
- [高级架构](proton-architecture)
- [视频](https://youtube.com/@timeplusdata)
- [维基](https://github.com/timeplus-io/proton/wiki)

我们还在 [公告文章](https://www.timeplus.com/post/timeplus-journey-to-open-source)中讨论了我们以开源形式发布 Timeplus Proton 的旅程。



## 我怎样才能开始？

在我们的 [文档](proton#get-started)中学习如何提取和运行 Timeplus Proton 镜像以及查询测试流。 要查看使用 Timeplus Proton、Redpanda 和示例实时数据的更完整用例，请查看我们利用 Docker Compose 的 [教程](proton-kafka#tutorial) 。

如果你需要高级部署策略或功能，让Timeplus Proton在幕后运行，那就使用 [Timeplus Cloud](https://us.timeplus.cloud/)创建你的第一个工作空间。
