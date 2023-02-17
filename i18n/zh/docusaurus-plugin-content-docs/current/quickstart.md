# 快速开始

Timeplus是一个融合流处理和历史数据处理的高性能平台， 让开发者能够以最快的速度和最高的效率构建最强大和最可靠的流分析应用。

Timeplus Cloud提供以下主要功能：

* [Streaming SQL](query-syntax)
* [流数据收集](ingestion)
* [流式可视化](viz)
* [流式告警和数据导出](destination)

下面章节教你如何开始使用 Timeplus Cloud。

## 步骤 1：注册一个Timeplus账户 {#step1}

Let's start by creating an account for [Timeplus Cloud](https://us.timeplus.cloud/). Currently, Google or Microsoft Single Sign-On (SSO) are supported. 请选择工作电子邮件或 Google/Microsoft 帐户进行注册。 获取账户设置并创建第一个 [工作区](glossary#workspace) 通常需要不到2分钟。

![注册](/img/signup_screen.png)

## 第 2 步：创建您的第一个工作区 {#step2}

工作区是您运行流数据收集和分析的独立存储和计算单位。 通常，一个组织中的用户组加入了相同的工作区，以建立一个或多个流式分析解决方案。 每个用户最多可以创建 1 个免费工作空间并加入多个工作区。

要创建工作区：

1. Sign in to [Timeplus Cloud](https://us.timeplus.cloud/)
2. 点击 **在登陆页面上创建一个工作区**
3. 自动创建工作区 ID。 创建一个可读的名称，例如组织名称或团队名称。

![选择工作区名称](/img/workspace_name.png)



## 第 3 步：加载示例数据

如果您的流式数据位于Confluent Cloud或可公开访问 Kafka 或 Pulsar，您可以在 Timeplus 中创建源以便现在加载它们。 否则，您可以按照下面的指南之一使用样本数据。

* [从 Confluent 云中加载示例流数据](quickstart-confluent)
* [加载示例流数据时不使用 Confluent Cloud](quickstart-sample)

## 今后的步骤

* 尝试更多流的 SQL 功能，例如 `tumble` 窗口和 `seek_to`
* 创建仪表板
* 发送结果到 Kafka/Pulsar 或 email/slack
* 检查 [术语](glossary)

