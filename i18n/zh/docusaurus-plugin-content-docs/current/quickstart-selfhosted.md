# Timeplus Enterprise self-hosted

Timeplus Enterprise is a high-performance converged platform that unifies streaming and historical data processing, to empower developers to build the most powerful and reliable streaming analytics applications, at speed and scale, anywhere.

Timeplus Enterprise provides the following major features:

- [Streaming SQL](query-syntax)
- [Streaming Data Collection](ingestion)
- [Streaming Visualization](viz)
- [Streaming Alerts and Destinations](destination)

Timeplus Enterprise is available as a fully-managed cloud service with zero ops and elastic scaling, or as a self-hosted deployment, ideal for enterprise users requiring flexible and advanced configurations.

The following section contains step-by-step instructions on how to easily get started with a self-hosted Timeplus Enterprise.

## Step 1: install Timeplus Enterpise via a single command {#step1}

如果你的服务器或电脑运行的是 Linux 或 macOS，你可以运行以下命令来下载软件包并在没有任何其他依赖关系的情况下启动 Timeplus Enterprise。 For Windows users, please follow [our guide](singlenode_install#docker) for running Timeplus Enterprise with Docker.

```shell
curl https://install.timeplus.com | sh
```

此脚本会将最新的软件包（基于您的操作系统和 CPU 架构）下载到当前文件夹。 解压缩包并启动 Timeplus 企业服务器。

## Step 2: Setup the user account {#step2}

通过 http://localhost:8000 访问 Timeplus Enterprise 网络控制台。 首次登录时，请使用密码创建一个帐户以开始 30 天免费试用。

![Create an account](/img/onprem-account.png)

After creating the account, login with that username and password.
![Login](/img/onprem-login.png)

## Step 3: Load your streaming data {#step3}

如果你的流数据位于或可公开访问的 Kafka 或 Pulsar 实例中，请按照以下任一文档
在 Timeplus Cloud 中创建源，然后返回此处完成快速入门：

- [Apache Kafka](kafka-source)
- [Confluent Cloud](confluent-cloud-source)
- [Apache Pulsar](pulsar-source)
- [REST API, SDK, and others](ingestion)

如果你还没有流式数据源并且想测试一下Timeplus的工作原理，Timeplus提供内置的
数据源，为一些常见用例生成流式数据。

### 创建示例源

1. Create the first [source](glossary#source) in your workspace. From the left side navigation menu, click **Data
   Ingestion**, then click the **Add Data** button in the top right corner.

   ![Data Ingestion page](/img/sample-source-button-1.png)

2. In this pop-up, click the **Sample Dataset** link.

   ![Add Data dialog](/img/sample-source-dialog-2.png)

3. 从三个模板中选择一个：

   1. **IoT**: Data for three devices
   2. **User** logins: Data for two users and two cities
   3. **DevOps**: Data for three hosts and three regions

   ![Sample dataset templates](/img/sample-source-template-3.png)

4. 预览您的数据并创建一个新的数据流来加载数据。 For the stream name, it can contain only letters,
   numbers, or underscores, and must start with a letter. 你也可以给它一个可选的描述。

   ![IoT sample data, preview step](/img/sample-source-preview-4.png)

5. Give your same source a name, such as `iot`, and review the JSON configuration.

   ![IoT sample data, configuration step](/img/sample-source-configuration-5.png)

### 探索流媒体数据

1. 要查看新创建的流中的数据，您可以：

   a。 Go to the **Streams** page, and click on the **Explore** icon.

   ![IoT sample data, preview step](/img/streams-list.png)

   b。 Or, go to the **Query** page, and click on the name of the stream in the SQL helper below the SQL editor.

   ![IoT sample data, preview step](/img/stream_name-in-list.png)

2. Timeplus generates a basic query for you, such as `SELECT * FROM iot`, or you can type your own query into the
   editor. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query.

   ![Run Query in Query page](/img/run-query.png)

流结果表现在将显示在编辑器下方。 To create charts, click on the **Visualization** tab.
[了解有关仪表板和图表的更多信息]

![Example of visualization for sample dataset](/img/viz-sample-iot.png)

## 下一步是什么？

- [Ingest](ingestion) additional data streams
- Write [streaming queries](query-syntax)
- Create additional charts from streaming data with [visualizations](viz) and dashboards
- Send the results of your queries to a [sink](destination)
