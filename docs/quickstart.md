# Quickstart

Timeplus is a fast and powerful real-time analytics platform.

Users get access to free public beta or can choose a subscription plan for more storage and computing resources.

Timeplus Cloud provides the following major features:

* [Streaming SQL](query-syntax)
* [Streaming Data Collection](ingestion)
* [Streaming Visualization](viz)
* [Streaming Alerts and Destinations](destination)

The following section contains step-by-step instructions on how to easily get started with Timeplus Cloud.

## Step 1: Sign up for a Timeplus account {#step1}

Let's start by creating an account for [Timeplus Cloud](https://beta.timeplus.cloud). Currently Google or Microsoft Single Sign-On (SSO) are supported. Please choose a work email or Google/Microsoft work subscription to apply the beta access.

## Step 2: Create your first workspace {#step2}

A workspace is the isolated storage and computing unit for you to run streaming data collection and analysis. During the beta program, every user can create up to 1 free workspace and join many workspaces. Usually a group of users in the same organization join the same workspace, to build one or more streaming analytics solutions.

To create a workspace:

1. Sign in [Timeplus Cloud](https://beta.timeplus.cloud)
2. Click **Create a Workspace** on the landing page
3. The workspace ID is automatically created. Create a readable name, such as the legal name for the organization or team name.

(Screenshot)



## Step 3: Try the sample streaming dataset {#step3}

Login the Timeplus Cloud. Choose the workspace if you have access to more than 1 workspace. Go to the **SOURCES** page and click the **Try our sample dataset** button on the top-right corner.

![Try the sample dataset](/img/sampledata.png)

By default, the **iot_data** template will be used. You can choose a Source Name, e.g. `iot`. The **Source Description** is optional. Scroll down. Leave the **Create a stream with the name** enabled as default, and specify a stream name, e.g. `iot`

![IOT sample dataset config](/img/sampledata_cfg.png)

Click **Next**. You will preview the sample data. Feel free to click **Next** button again. Optionally, you can click the image button near the TIME column and enable the **SET AS TIMESTAMP COLUMN**

![IOT sample dataset config](/img/sampledata_ts.png)

Click **Next** button. You will review the source configuration. Click **Create the source button**

![IOT sample dataset confirm](/img/sampledata_confirm.png)

A message will be shown the source is created successfully.

![IOT sample dataset confirm](/img/sampledata_ok.png)

## Step 4: Explore the streaming data {#step4}

Open the QUERY page. You will see the newly created stream under the query editor. Click on the name(e.g. `iot`)

![Click iot stream](/img/sampledata_click_iot.png)

The query will be generated automatically: `SELECT * FROM iot` Click the RUN QUERY button (or press Ctrl+Enter) to run the query.

![Run query](/img/sampledata_click_run_bn.png)

The streaming SQL willl keep showing latest results in the UI.

![Run query](/img/sampledata_click_query_live.png)

You can switch to the VISUALIZATION tab to view the streaming chart of the data.

![Run query](/img/sampledata_click_viz.png)

## Next steps

* Try more streaming SQL capabilities, such as `tumble` window and `seek_to`
* Create a dashboard
* Send the results to Kafka/Pulsar, or email/slack

