# 使用 Timeplus Cloud 快速入门

Timeplus是一个融合流处理和历史数据处理的高性能平台， 让开发者能够以最快的速度和最高的效率构建最强大和最可靠的流分析应用。

Timeplus Cloud提供以下主要功能：

* [Streaming SQL](query-syntax)
* [流数据收集](ingestion)
* [流式可视化](viz)
* [流式告警和数据导出](destination)

下面章节教你如何开始使用 Timeplus Cloud。

## 步骤 1：注册一个Timeplus账户 {#step1}

目前，支持谷歌或微软单一登录 (SSO)。 请选择工作电子邮件或 Google/Microsoft 帐户进行注册。 Let's start by creating an account for [Timeplus Cloud](https://us.timeplus.cloud/). Currently, Google or Microsoft Single Sign-On (SSO) are supported. 请选择工作电子邮件或 Google/Microsoft 帐户进行注册。 设置账户并创建第一个 [工作空间](glossary#workspace) 通常需要不到 2 分钟。

![注册一个账户](/img/sign-up-page.png)

## 第 2 步：设置您的账户和工作空间 {#step2}

通过快速完成账户设置，向我们介绍一下你自己：

![入职调查](/img/onboarding-survey.png)

The final step of the setup is for naming your new workspace, the isolated storage and computing unit for you to run streaming data collection and analysis. Give it a name: 给它起个名字：

![选择工作区名称](/img/workspace-name-setup.png)

## 第 3 步：加载您的直播数据 {#step3}

If your streaming data resides in or a publicly accessible Kafka or Pulsar instance, follow one of following docs to create a source in Timeplus Cloud, then return here to complete the quickstart:

- [阿帕奇卡夫卡](kafka-source)
- [融合云](confluent-cloud-source)
- [阿帕奇脉冲星](pulsar-source)
- [REST API、SDK 等](ingestion)

If you don't yet have a streaming data source and would like test out how Timeplus works, Timeplus provides a built-in data source to generate streaming data for some common use cases.

### 创建示例源

1. 在您的工作空间中创建第一个 [源](glossary#source) 。 Create the first [source](glossary#source) in your workspace. From the left side navigation menu, click **Data Ingestion**, then click the **Add Data** button in the top right corner.

   ![“数据提取” 页面](/img/sample-source-button-1.png)

2. 在此弹出窗口中，单击 **示例数据集** 链接。

   ![“添加数据” 对话框](/img/sample-source-dialog-2.png)

3. 从三个模板中选择一个：

   1. **IoT**：三台设备的数据
   2. **用户** 登录：两个用户和两个城市的数据
   3. **DevOps**：三台主机和三个区域的数据

   ![示例数据集模板](/img/sample-source-template-3.png)

4. Preview your data and create a new stream to load your data into. For the stream name, it can contain only letters, numbers, or underscores, and must start with a letter. You can also give it an optional description. 对于直播名称，它只能包含字母、 数字或下划线，并且必须以字母开头。 你也可以给它一个可选的描述。

   ![物联网示例数据，预览步骤](/img/sample-source-preview-4.png)

5. 给同一个源起一个名字，比如 `iot`，然后查看 JSON 配置。

   ![物联网示例数据，配置步骤](/img/sample-source-configuration-5.png)

### 探索流媒体数据

1. 要查看新创建的直播中的数据，您可以：

   a。 a. Go to the **Streams** page, and click on the **Explore** icon.

   ![物联网示例数据，预览步骤](/img/streams-list.png)

   b。 b. Or, go to the **Query** page, and click on the name of the stream in the SQL helper below the SQL editor.

   ![物联网示例数据，预览步骤](/img/stream_name-in-list.png)

2. Timeplus generates a basic query for you, such as `SELECT * FROM iot`, or you can type your own query into the editor. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query. 单击 **运行查询** 按钮（或在 PC 上按 `Ctrl+Enter` ，在 Mac 上按 `Cmd + Enter` ）运行查询。

   ![在 “查询” 页面中运行查询](/img/run-query.png)

直播结果表现在将显示在编辑器下方。 The streaming results table will now appear below the editor. To create charts, click on the **Visualization** tab. \[Learn more about Dashboards and Charts\] \[了解有关仪表板和图表的更多信息\]

![示例数据集的可视化示例](/img/viz-sample-iot.png)

## 下一步是什么？

- [摄取](ingestion) 额外数据流
- 写下 [直播查询](query-syntax)
- 使用 [可视化](viz) 和仪表板根据流数据创建其他图表
- 将您的查询结果发送到 [数据下游](destination)
