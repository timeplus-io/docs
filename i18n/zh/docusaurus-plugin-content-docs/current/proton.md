# Timeplus Proton

Timeplus Proton 是 Timeplus Enterprise 的核心引擎，是 ksqlDB 或 Apache Flink 的快速、轻量级替代品。 它使开发人员能够解决来自Apache Kafka、Redpanda和更多来源的流数据处理、路由和分析挑战，并将聚合数据发送到下游系统。 Timeplus Proton 正在 Apache 2.0 许可下积极开发，支持 [Timeplus Enterprise](timeplus-enterprise)。

## 💪 为何使用 Timeplus Proton？

1. **[Apache Flink](https://github.com/apache/flink) 或 [ksqlDB](https://github.com/confluentinc/ksql) 替代方案。** Timeplus Proton 提供强大的流 SQL 功能，例如流 ETL、翻滚/跳跃/会话窗口、水印、物化视图、CDC 和数据修订处理等。
2. **快点。** Timeplus Proton 用 C++ 编写，通过 SIMD 优化了性能。 [例如](https://www.timeplus.com/post/scary-fast)，在配备 M2 Max 的苹果 MacBookPro 上，Timeplus Proton 可以提供 9000 万次 EPS、4 毫秒的端到端延迟以及具有 100 万个唯一密钥的高基数聚合。
3. **轻盈。** Timeplus Proton 是一个单一二进制 (\<500MB)。 没有 JVM 或任何其他依赖关系。 你也可以使用 Docker 或 AWS t2.nano 实例（1 个 vCPU 和 0.5 GiB 内存）运行它。
4. **由快速、资源节约和成熟的 [ClickHouse](https://github.com/clickhouse/clickhouse)提供支持。** Timeplus Proton 通过流处理扩展了 ClickHouse 的历史数据、存储和计算功能。 Timeplus Proton 中有数千个 SQL 函数可用。 以毫秒为单位查询数十亿行。
5. Next, create an external stream in Proton with SQL to consume data from your Kafka or Redpanda. Follow this [tutorial](proton-kafka#tutorial) for SQL snippets.

![质子架构](/img/proton-arch.png) See our [architecture](proton-architecture) doc for technical details and the [FAQ](proton-faq) for more information on the various editions of Proton, how it's related to ClickHouse, and why we chose Apache License 2.0.

## 🎬 演示视频

<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="优酷视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## ⚡ 部署

```shell
curl https://install.timeplus.com/oss | sh
```

如需更多指南，请查看 [安装指南](install#proton)。

### Timeplus 云服务

在 [Timeplus Cloud](https://us.timeplus.cloud/)中试用 Timeplus Proton 的第一步

### 🔎 用法

From `proton-client`, run the following SQL to create a stream of random data:

```sql
--使用随机数据创建流
创建随机流设备 (
  设备字符串默认 'device'||to_string (rand ()%4)，
  温度浮点数默认 rand ()%1000/10)
```

```sql
--运行流式传输 SQL
SELECT 设备，计数 (*)、最小（温度）、最大值（温度）
从设备分组按设备分组
```

你应该看到如下数据：

```
──设备───计数 () ──min（温度）──最大（温度）─
│ device0 │ 2256 │ 0 │ 99.6 │
│ 2260 │ 2260 │ 0.1 │ 99.7 │
│ device3 │ 2259 │ 0.3 │ 99.9 │
│ 2225 │ 0.2 │ 99.8 ──────────────────────────────────────────────────────────────────────────────────────────────────

```

### What's next?

要查看更多使用 Timeplus Proton 的示例，请查看 [示例](https://github.com/timeplus-io/proton/tree/develop/examples) 文件夹。

要访问更多功能，例如来源、接收器、仪表板、警报和数据沿袭，请在 [Timeplus Cloud](https://us.timeplus.cloud) 上创建工作空间，或尝试我们的 [实时演示](https://demo.timeplus.cloud) 以及预建的实时数据和仪表板。

## 🧩 集成

以下驱动程序可用：

- https://github.com/timeplus-io/proton-java-driver JDBC 和其他 Java 客户端
- https://github.com/timeplus-io/proton-go-driver
- https://github.com/timeplus-io/proton-python-driver

与其他系统的集成：

- ClickHouse https://docs.timeplus.com/proton-clickhouse-external-table
- Grafana https://github.com/timeplus-io/proton-grafana-source
- Metabase https://github.com/timeplus-io/metabase-proton-driver
- Pulse 用户界面 https://github.com/timeplus-io/pulseui/tree/proton
- Homebrew https://github.com/timeplus-io/homebrew-timeplus
- dbt https://github.com/timeplus-io/dbt-proton

## 贡献

我们欢迎您的捐款！ We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

有关更多详细信息，请参阅 [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) ，参见 [Build.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) 以在不同的平台上编译 Proton。

We also encourage you to join the [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## 需要帮助吗？

加入我们的 [Timeplus 社区 Slack](https://timeplus.com/slack) 与 Timeplus 工程师和其他 Timeplus Proton 用户建立联系。

要提交错误、提出改进建议或申请新功能，请参阅 GitHub 上的 [未解决问题](https://github.com/timeplus-io/proton/issues) 。

## 许可

Proton 使用 Apache 许可证 2.0。 请参阅 [许可证](https://github.com/timeplus-io/proton/blob/master/LICENSE)中的详细信息。
