# Quickstart with Timeplus Cloud

Timeplus是一个融合流处理和历史数据处理的高性能平台， 让开发者能够以最快的速度和最高的效率构建最强大和最可靠的流分析应用。

Timeplus Cloud提供以下主要功能：

* [Streaming SQL](query-syntax)
* [流数据收集](ingestion)
* [流式可视化](viz)
* [流式告警和数据导出](destination)

下面章节教你如何开始使用 Timeplus Cloud。

## 步骤 1：注册一个Timeplus账户 {#step1}

目前，支持谷歌或微软单一登录 (SSO)。 请选择工作电子邮件或 Google/Microsoft 帐户进行注册。 Let's start by creating an account for [Timeplus Cloud](https://us.timeplus.cloud/). Currently, Google or Microsoft Single Sign-On (SSO) are supported. 请选择工作电子邮件或 Google/Microsoft 帐户进行注册。 It usually takes less than 2 minutes to get the account set up and have the first [workspace](glossary#workspace) created.

![Sign up for an account](/img/sign-up-page.png)

## Step 2: Set up your account and workspace {#step2}

Tell us a bit about yourself by completing a quick account setup:

![Onboarding Survey](/img/onboarding-survey.png)

The final step of the setup is for naming your new workspace, the isolated storage and computing unit for you to run streaming data collection and analysis. Give it a name: Give it a name:

![选择工作区名称](/img/workspace-name-setup.png)

## Step 3: Load your streaming data {#step3}

If your streaming data resides in or a publicly accessible Kafka or Pulsar instance, follow one of following docs to create a source in Timeplus Cloud, then return here to complete the quickstart:

- [Apache Kafka](kafka-source)
- [Confluent Cloud](confluent-cloud-source)
- [Apache Pulsar](pulsar-source)
- [REST API, SDK, and others](ingestion)

If you don't yet have a streaming data source and would like test out how Timeplus works, Timeplus provides a built-in data source to generate streaming data for some common use cases.

### Create a sample source

1. Create the first [source](glossary#source) in your workspace. Create the first [source](glossary#source) in your workspace. From the left side navigation menu, click **Data Ingestion**, then click the **Add Data** button in the top right corner.

   ![Data Ingestion page](/img/sample-source-button-1.png)

2. In this pop-up, click the **Sample Dataset** link.

   ![Add Data dialog](/img/sample-source-dialog-2.png)

3. Choose from one of three templates:

   1. **IoT**: Data for three devices
   2. **User** logins: Data for two users and two cities
   3. **DevOps**: Data for three hosts and three regions

   ![Sample dataset templates](/img/sample-source-template-3.png)

4. Preview your data and create a new stream to load your data into. For the stream name, it can contain only letters, numbers, or underscores, and must start with a letter. You can also give it an optional description. For the stream name, it can contain only letters, numbers, or underscores, and must start with a letter. You can also give it an optional description.

   ![IoT sample data, preview step](/img/sample-source-preview-4.png)

5. Give your same source a name, such as `iot`, and review the JSON configuration.

   ![IoT sample data, configuration step](/img/sample-source-configuration-5.png)

### Explore streaming data

1. To check out the data in your newly created stream, you can either:

   a. a. Go to the **Streams** page, and click on the **Explore** icon.

   ![IoT sample data, preview step](/img/streams-list.png)

   b. b. Or, go to the **Query** page, and click on the name of the stream in the SQL helper below the SQL editor.

   ![IoT sample data, preview step](/img/stream_name-in-list.png)

2. Timeplus generates a basic query for you, such as `SELECT * FROM iot`, or you can type your own query into the editor. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query.

   ![Run Query in Query page](/img/run-query.png)

The streaming results table will now appear below the editor. The streaming results table will now appear below the editor. To create charts, click on the **Visualization** tab. \[Learn more about Dashboards and Charts\] \[Learn more about Dashboards and Charts\]

![Example of visualization for sample dataset](/img/viz-sample-iot.png)

## What's next?

- [Ingest](ingestion) additional data streams
- Write [streaming queries](query-syntax)
- Create additional charts from streaming data with [visualizations](viz) and dashboards
- Send the results of your queries to a [sink](destination)
