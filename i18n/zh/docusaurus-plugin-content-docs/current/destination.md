# Sending Data Out

使用 Timeplus 控制台，您可以轻松地探索和分析流式数据，使用直观的用户界面、标准的 SQL 和流式图表。 但您不会停留在这里。 Timeplus enables you to setup real-time data pipelines to send data to other systems, or notify individuals or power up downstream applications.

## 概览
Timeplus supports various systems as the downstreams:
* [Send data to Kafka topics](#kafka)
* [Send data to Pulsar topics](/pulsar-external-stream#write-data-to-pulsar)
* [Send data to ClickHouse tables](/proton-clickhouse-external-table#write)
* [Send data to another Timeplus deployment](/timeplus-external-stream)
* [Send data to Webhook endpoints](#webhook)
* [Notify others via Slack](#slack)
* [Send data to other systems via Redpanada Connect](#rpconnect)

## Send data to Kafka{#kafka}

您可以利用 Timeplus 进行各种流分析，如：

* 从 iot 设备下载数据并每 5 秒获得最小/最大/平均值
* 根据以往的模式识别任何外值
* 通过移除敏感信息，删除重复，或使用尺寸表进行查找来转换数据

转换后的数据或异常事件可以发送给 Kafka 主题，供其他系统进一步处理。

To send data to Kafka, you can submit a streaming SQL in SQL Console, and click the "Save As" button and choose "Sink".

![Send data out](/img/sink.png)

Then choose "Apache Kafka". 需要以下参数：

* Kafka broker(s) URL
* 主题名称：已存在的主题或指定要创建的 Timeplus 的新主题名称。
* 认证

Please refer to the [this page](/ingestion#kafka) for details of the parameters. 您可以向 Confluent Cloud、Confluent Platform 或自定义的 Apache Kafka 发送数据。

## Trigger actions via Webhook{#webhook}

您还可以添加自动功能，在Timeplus发现任何实时见解时触发其他系统采取行动。 只需选择**Webhook**作为操作类型，并可选地设置消息内容（默认情况下，整行将被编码为 JSON 文档并发送到 webhook）。 您可以使用这种方法来执行基于规则的自动化，无需人为干预，例如更换过热的设备、向上扩展到缩小服务器群的规模，或者提醒用户使用 slack 等。 请检查 [这个博客](https://www.timeplus.com/post/build-a-real-time-security-app-in-3-easy-steps) 来了解真实示例。

## Notify others via Slack {#slack}

当您开始运行流式查询后，您可以点击图标向其他系统发送实时结果。

您需要创建一个 Slack 传入的 webhook，以便 Timeplus 能够在特定群组中为每个结果发送一个消息。 请按照 [Slack文档](https://api.slack.com/messaging/webhooks) 了解说明。

一旦您得到 SlackWebhook URL，您可以在对话框中指定它并设置一个消息主体。 您可以通过 `{{.column}}` 表达式提及列名称。 例如，假设查询的输出为

| 时间                      | 数量 | 备注  |
| ----------------------- | -- | --- |
| 2022-01-23 10:00:00.123 | 50 | foo |
| 2022-01-23 10:05:00.123 | 95 | Bar |

您可以设置消息主体为 `传感器数据为 {{.time}} {{.number}}，并备注: {{.note}}`

## Send data to other systems via Redpanda Connect {#rpconnect}

Starting from Timeplus Enterprise 2.5, you can send data to various systems by editing a [Redpanda Connect](https://www.redpanda.com/connect) yaml file.

Redpanda Connect is a declarative data streaming service that solves a wide range of data engineering problems with simple, chained, stateless processing steps.

You can submit a streaming SQL in SQL Console, and click the "Save As" button and choose "Sink". Expand the "Send data via Redpanda Connect" section or type a keyword to search for suitable components.

Please refer to [Redpanda Connect Documenatations for Outputs](https://docs.redpanda.com/redpanda-connect/components/outputs/about/) for how to edit the configuration.
