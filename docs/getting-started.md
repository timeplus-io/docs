# Getting started

This tutorial guides you how to load data into Timeplus and run analytics queries over the data. To perform this tutorial, you need an active Timeplus account. If you don't have a Timeplus account, go to https://us-west-2.timeplus.cloud/ and sign up for free.

## Add Data

To help you quickly get started, we setup each workspace with the demo dataset. Please check the schema and common queries on [Demo Scenario](/usecases) page. You can explore and query the streams right away.

Of course, you can load your own data, such as

* [Upload a CSV file](/ingestion#streamgen)
* [Create a Kafka source](/ingestion#kafka) to load JSON documents from Confluent Cloud or Apache Kafka cluster.

## Explore Data

Open the **QUERY** page. You will see a list of data streams. Clicking on any of it will generate the `select * from ..` in the query editor. You can click the **RUN QUERY** button to run a [streaming tail](/query-syntax#streaming-tailing) for the incoming data. The recent 10 rows of results will be shown. More importantly, you can see the top values for each column and overall trend. This live view will give you a good understanding of incoming data structure and sample value.

To add some filter conditions or change other parts of the query, you can either click the **CANCEL QUERY** button or use the **+** button on the top to open a new query tab.

## Query Data

SQL is the most common tool for data analysts. Timeplus supports powerful yet easy-to-use [query syntax](/query-syntax) and [functions](/functions). You can also follow the samples in [Demo Scenario](/usecases) to query data.

## Visualize Data

You can click the **VISUALIZATION** tab to turn a streaming query to a streaming chart with high FPS (frame-per-second). Choose the time column as X-axis and choose the numeric column with an aggregation method. You can add the chart to your home page. Out of box streaming dashboards will be added to Timeplus soon.

In the meanwhile, it's possible to leverage other tools to visualize insights from Timeplus. Please contact us if you want to learn the details.

## Send Data Out

Streaming insights or downsampled data can be set to another Kafka topic, or notify certain users via email or slack. Run a streaming query, then click the arrow icon. You can choose one of the four destinations: Slack, Email, Kafka, Webhook.

Sending data to other systems, such as Snowflake, is possible. Please contact us if you want to learn the details.
