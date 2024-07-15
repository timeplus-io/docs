# Timeplus Enterprise self-hosted

Timeplus Enterprise is a high-performance converged platform that unifies streaming and historical data processing, to empower developers to build the most powerful and reliable streaming analytics applications, at speed and scale, anywhere.

Timeplus Enterprise provides the following major features:

* [Streaming SQL](query-syntax)
* [Streaming Data Collection](ingestion)
* [Streaming Visualization](viz)
* [Streaming Alerts and Destinations](destination)

Timeplus Enterprise is available as a fully-managed cloud service with zero ops and elastic scaling, or as a self-hosted deployment, ideal for enterprise users requiring flexible and advanced configurations.

The following section contains step-by-step instructions on how to easily get started with a self-hosted Timeplus Enterprise.

## Step 1: install Timeplus Enterprise via a single command {#step1}

If your server or computer is running Linux or MacOS, you can run the following command to download the package and start Timeplus Enterprise without any other dependencies. For Windows users, please follow [our guide](singlenode_install#docker) for running Timeplus Enterprise with Docker.

```shell
curl https://install.timeplus.com | sh
```

This script will download the latest package (based on your operating system and CPU architecture) to the current folder. Uncompress the package and start the Timeplus Enterprise server.

## Step 2: Setup the user account {#step2}
Access the Timeplus Enterprise web console via http://localhost:8000. On your first login, please create an account with a password to start the 30-day free trial.

![Create an account](/img/onprem-account.png)

After creating the account, login with that username and password.
![Login](/img/onprem-login.png)

## Step 3: Load your streaming data {#step3}

If your streaming data resides in or a publicly accessible Kafka or Pulsar instance, follow one of following docs to
create a source in Timeplus Cloud, then return here to complete the quickstart:

- [Apache Kafka](kafka-source)
- [Confluent Cloud](confluent-cloud-source)
- [Apache Pulsar](pulsar-source)
- [REST API, SDK, and others](ingestion)

If you don't yet have a streaming data source and would like test out how Timeplus works, Timeplus provides a built-in
data source to generate streaming data for some common use cases.

### Create a sample source

1. Create the first [source](glossary#source) in your workspace. From the left side navigation menu, click **Data
   Ingestion**, then click the **Add Data** button in the top right corner.

   ![Data Ingestion page](/img/sample-source-button-1.png)

2. In this pop-up, click the **Sample Dataset** link.

   ![Add Data dialog](/img/sample-source-dialog-2.png)

3. Choose from one of three templates:

   1. **IoT**: Data for three devices
   2. **User** logins: Data for two users and two cities
   3. **DevOps**: Data for three hosts and three regions

   ![Sample dataset templates](/img/sample-source-template-3.png)

4. Preview your data and create a new stream to load your data into. For the stream name, it can contain only letters,
   numbers, or underscores, and must start with a letter. You can also give it an optional description.

   ![IoT sample data, preview step](/img/sample-source-preview-4.png)

5. Give your same source a name, such as `iot`, and review the JSON configuration.

   ![IoT sample data, configuration step](/img/sample-source-configuration-5.png)

### Explore streaming data

1. To check out the data in your newly created stream, you can either:

   a. Go to the **Streams** page, and click on the **Explore** icon.

   ![IoT sample data, preview step](/img/streams-list.png)

   b. Or, go to the **Query** page, and click on the name of the stream in the SQL helper below the SQL editor.

   ![IoT sample data, preview step](/img/stream_name-in-list.png)

2. Timeplus generates a basic query for you, such as `SELECT * FROM iot`, or you can type your own query into the
   editor. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query.

   ![Run Query in Query page](/img/run-query.png)

The streaming results table will now appear below the editor. To create charts, click on the **Visualization** tab.
[Learn more about Dashboards and Charts]

![Example of visualization for sample dataset](/img/viz-sample-iot.png)

## What's next?

- [Ingest](ingestion) additional data streams
- Write [streaming queries](query-syntax)
- Create additional charts from streaming data with [visualizations](viz) and dashboards
- Send the results of your queries to a [sink](destination)
