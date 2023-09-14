# 内置示例数据快速开始

Timeplus provides a built-in data source to generate streaming data for some typical use cases. To start, log in to [Timeplus Cloud](https://us.timeplus.cloud/).

## Create a Sample Source

1. Let's create the first [source](glossary#source) in your workspace. From the left side navigation menu, click **Data Ingestion**, then click the **Add Data** button in the top right corner.

![Data Ingestion page](/img/sample-source-button-1.png)

2. In this pop-up, click the **Sample Dataset** link.

![Add Data dialog](/img/sample-source-dialog-2.png)

3. Choose from one of 3 templates: a. IoT: Data for 3 devices b. User logins: Data for 2 users and 2 cities c. DevOps: Data for 3 hosts and 3 regions

![Sample dataset templates](/img/sample-source-template-3.png)

Preview your data and create a new stream to load your data into. For the stream name, it can contain only letters, numbers, or underscores, and must start with a letter. You can also give it an optional description.

![IoT sample data, preview step](/img/sample-source-preview-4.png)

 Finally, you can give this sample Source a name, such as `iot`, and review the JSON configuration.

![IoT sample data, configuration step](/img/sample-source-configuration-5.png)

## Explore the Streaming Data

1. To check out the data in your newly created stream, you can either: a. Go to the Streams page, and click on the Explore icon.

  ![IoT sample data, preview step](/img/streams-list.png)

  b. Or, go to the Query page, and click on the name of the stream in the SQL helper below the SQL editor.

  ![IoT sample data, preview step](/img/stream_name-in-list.png)

2. We will generate a basic query for you: SELECT * FROM iot. You can also type your own query into the editor. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query.

![Run Query in Query page](/img/run-query.png)

The streaming results table will now appear below the editor. To create charts, click on the **Visualization** tab. [Learn more about Dashboards and Charts](viz)

![Example of visualization for sample dataset](/img/viz-sample-iot.png)
