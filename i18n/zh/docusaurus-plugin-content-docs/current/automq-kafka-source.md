# 从 AutoMQ for Kafka 中加载流数据

[AutoMQ for Kafka](https://docs.automq.com/zh/docs/automq-s3kafka/YUzOwI7AgiNIgDk1GJAcu6Uanog)(简称 AutoMQ Kafka ) 是一款基于云重新设计的云原生 Kafka。 AutoMQ Kafka [内核开源](https://github.com/AutoMQ/automq-for-kafka)并且100% 兼容 Kafka 协议，可以充分兑现云的红利。 相比自建 Apache Kafka，AutoMQ Kafka 在其云原生架构基础上实现的自动弹性、流量自平衡、秒级分区移动等特性可以为用户带来更低的总体拥有成本（TCO）。

本文将介绍如何通过 Timeplus 控制台将数据从 AutoMQ Kafka 导入 Timeplus。 AutoMQ Kafka 100% 兼容 Apache Kafka 协议，因此你也可以创建 Kafka 的[外部流](external-stream)来分析 AutoMQ 中的数据而不移动数据。

## 准备 AutoMQ Kafka 环境和测试数据

参考 AutoMQ [快速入门](https://docs.automq.com/zh/docs/automq-s3kafka/VKpxwOPvciZmjGkHk5hcTz43nde)部署好 AutoMQ Kafka 集群。 请确保 Timeplus 能够与您的 AutoMQ Kafka 服务器直接连接。 您可以使用像 [ngrok](https://ngrok.com/) 这样的工具将你的本地 AutoMQ Kafka 代理安全地暴露在互联网上，这样 Timeplus Cloud 就可以连接到它 查看[博客](https://www.timeplus.com/post/timeplus-cloud-with-ngrok)了解更多详情。

> 如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：
>
> 44.232.236.191 对于 us.timeplus.cloud52.83.159.13 对于 cloud.timeplus.com.cn

在AutoMQ Kafka中快速创建一个名为 example\_topic 的主题并向其中写入一条测试JSON数据，可以通过以下步骤实现：

#### 创建Topic

使用 Kafka 的命令行工具创建主题。 确保您可以访问 Kafka 环境并且 Kafka 服务正在运行。 以下是创建主题的命令：

```shell
./kafka-topics.sh --create --topic example_topic --bootstrap-server 10.0.96.4:9092 --partitions 1 --replication-factor 1
```

> 注意：将 “topic” 和 “bootstrap-server” 替换为你的 Kafka 服务器地址。

要检查主题创建的结果，请使用以下命令：

```shell
./kafka-topics.sh --describe example_topic --bootstrap-server 10.0.96.4:9092
```

#### 写入测试数据

使用 Kafka 的命令行工具或编程方法将测试数据写入 example\_topic。 以下是使用命令行工具的示例：

```shell
echo '{"id": 1, "name": "test user", "timestamp": "2023-11-10T12:00:00", "status": "active"}' | sh kafka-console-producer.sh --broker-list 10.0.96.4:9092 --topic example_topic
```

> 注意：将 “topic” 和 “bootstrap-server” 替换为你的 Kafka 服务器地址。

要查看最近写入的主题数据，请使用以下命令：

```shell
sh kafka-console-consumer.sh --bootstrap-server 10.0.96.4:9092 --topic example_topic --from-beginning
```

## 添加数据源

1. 在左侧导航菜单中，单击 数据摄取，然后单击右上角的 添加数据 按钮。
2. 在此弹出窗口中，您将看到您可以连接的数据源以及其他添加数据的方法。 由于 AutoMQ Kafka 与 Apache Kafka 完全兼容，因此你可以直接点击这里 Apache Kafka。
3. 输入broker URL 由于默认创建的 AutoMQ Kafka 不启用 TLS 和身份验证，因此请在此处关闭 TLS 和身份验证。
4. 输入 Kafka 主题的名称，并指定“读取为”的数据格式。 我们目前支持JSON、AVRO和文本格式。
   1. 如果 Kafka 主题中的数据采用 JSON 格式，但架构可能会随着时间的推移而发生变化，我们建议您选择 Text。 这样，整个 JSON 文档将保存为字符串，即使架构发生变化，您也可以应用与 JSON 相关的函数来提取值。
   2. 如果您选择 AVRO，则会有一个 “自动提取” 选项。 默认情况下，此选项处于关闭状态，这意味着整条消息将另存为字符串。 如果您开启，那么AVRO消息中的顶级属性将会放入不同的列中。 这对您而言更方便查询，但不支持架构进化。 选择 AVRO 时，您还需要指定架构注册表的地址、API 密钥和密钥。
5. 在下一个**预览**步骤中，我们将向您显示来自您指定 AutoMQ Kafka 数据源的至少一个事件。
6. 默认情况下，您的新数据源将在 Timeplus 中创建一个新流。 邀请您命名此新流并验证列信息，包括列名和数据类型。 您还可以选择将一列指定为事件时间列。 如果您不这样做，我们将使用摄取时间作为事件时间。 或者，您可以从下拉列表中选择一个现有的流。
7. 在预览您的数据后，您可以给源提供一个名称和一个可选的描述，并审查配置。 单击 **Finish** 后，流数据将立即在指定的流中可用。
