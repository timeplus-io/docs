# Quickstart

Timeplus is a high-performance converged platform that unifies streaming and historical data processing, to empower developers to build the most powerful and reliable streaming analytics applications, at speed and scale, anywhere. 

Timeplus Cloud provides the following major features:

* [Streaming SQL](query-syntax)
* [Streaming Data Collection](ingestion)
* [Streaming Visualization](viz)
* [Streaming Alerts and Destinations](destination)

The following section contains step-by-step instructions on how to easily get started with Timeplus Cloud.

## Step 1: Sign up for a Timeplus account {#step1}

Let's start by creating an account for [Timeplus Cloud](https://us.timeplus.cloud/). Currently, Google or Microsoft Single Sign-On (SSO) are supported. Please choose a work email or Google/Microsoft account to sign up. It usually takes less than 2 minutes to get the account set up and have the first [workspace](glossary#workspace) created.

![Signup](/img/signup_screen.png)

## Step 2: Set up your account and workspace {#step2}

Tell us a bit about yourself by completing a quick account setup:

![Onboarding Survey](/img/onboarding-survey.png)

The final step of the setup is for naming your new workspace, the isolated storage and computing unit for you to run streaming data collection and analysis. Give it a name:

![Choose a workspace name](/img/workspace-name-setup.png)

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
