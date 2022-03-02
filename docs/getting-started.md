# Getting started

This tutorial teaches you how to load data into Timeplus and run analytics queries over the data. To perform this tutorial, you need an active Timeplus account. If you dont have a Timeplus account, send email to `hello@timeplus.io` and request an account.

## Add Data

To help you quicky get started, we setup each tenant with the demo dataset. Please check the schema and common queries on [Demo Scenario](usecases) page. You can explore and query the streams right away.

Of course, you can load your own data, such as

* [Upload a CSV file](ingestion#load-sample-streaming-data)
* [Create a Kafka source](ingestion#kafka) to load JSON documents from Confluent Cloud or Apache Kafka culster.

## Explore Data

Open the **QUERY** page. You will see a list of data streams. Clicking on any of it will generate the `select * from ..` in the query editor. You can click the **RUN QUERY** button to run a [streaming tail](query-syntax#streaming-tailing) for the incoming data. The recent 10 rows of result will be shown. More importantly, you can see the top values for each column and overall trend. This live view will give you a good understanding of incoming data structure and sample value.

To add some filter conditions or change other part of the query, you can either click the **CANCEL QUERY** button or use the **+** button on the top to open a new query tab.

## Query Data

SQL is the most common tool for data analyts. Timeplus supports powerful yet easy-to-use [query syntax](query-syntax) and [functions](functions). You can also follow the samples in [Demo Scenario](usecases) to query data. 

## Visualize Data

You can click the **VIZ** tab to turn a streaming query to a streaming chart with high FPS (frame-per-second). Choose the time column as X-axis and choose the numeric column with an aggregation method. You can add the chart the your home page. Out of box streaming dashboards will be added to Timeplus soon.

In the meanwhile, it's possible to leverage other tools to visualize insights from Timeplus. Please contact us if you want to learn the details.

## Send Data Out

Streaming insights or downsampled data can be set to another Kafka topic, or notify certain users via email or slack. Run a streaming query, then click the arrow icon. You can choose one of the four destinations: Slack, Email, Kafka, Webhook.

Sending data to other systems, such as Snowflake, are possible. Please contact us if you want to learn the details.
