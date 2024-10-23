#  Sending Data Out

With Timeplus Console, you can easily explore and analyze streaming data, with intuitive UI, standard SQL and streaming charts. But you won't stop here. Timeplus enables you to setup real-time data pipelines to send data to other systems, or notify individuals or power up downstream applications.

## Overview
Timeplus supports various systems as the downstreams:
* [Send data to Kafka topics](#kafka)
* [Send data to Pulsar topics](/pulsar-external-stream#write-data-to-pulsar)
* [Send data to ClickHouse tables](/proton-clickhouse-external-table#write)
* [Send data to another Timeplus deployment](/timeplus-external-stream)
* [Send data to Webhook endpoints](#webhook)
* [Notify others via Slack](#slack)
* [Send data to other systems via Redpanda Connect](#rpconnect)

## Send data to Kafka{#kafka}

You can leverage Timeplus for various streaming analysis, such as

* Downsample the data from iot devices and get min/max/avg values every 5 second
* Identify any outlier based on the past pattern
* transform the data by removing sensitive information, remove duplication, or apply lookup with dimension tables

The transformed data or outlier events can be sent to a Kafka topic for other systems to further process.

To send data to Kafka, you can submit a streaming SQL in SQL Console, and click the "Save As" button and choose "Sink".

![Send data out](/img/sink.png)

Then choose "Apache Kafka". The following parameters are required:

* Kafka broker(s) URL
* Topic name: either an existing topic or specify the new topic name for Timeplus to create.
* Authentication

Please refer to the [this page](/ingestion#kafka) for details of the parameters. You can send data to Confluent Cloud, Confluent Platform, or custom managed Apache Kafka.

## Trigger actions via Webhook{#webhook}

You can also add automation to trigger other systems to take actions when Timeplus finds any real-time insights. Simply choose the **Webhook** as the action type and optionally set a message body (by default, the entire row will be encoded as a JSON document and sent to the webhook). You can use this approach to perform rule-based automation without human interaction, such as swapping an overheated equipment, scaling up to scaling down the server farm, or reminder users on slack, etc. Please check [this blog](https://www.timeplus.com/post/build-a-real-time-security-app-in-3-easy-steps) for real-world examples.

## Notify others via Slack {#slack}

After you start running a streaming query, you can click the icon to send real-time results to other systems.

You need to create a Slack incoming webhook so that Timeplus can send a slack message in the specific channel for each result. Please follow the [Slack documentation](https://api.slack.com/messaging/webhooks) for the instructions.

Once you've got the Slack webhook URL, you can specify it in the dialog and set a message body. You can refer to the column name via the `{{.column}}` expression. For instance, assume the output of the query is

| time                    | number | note |
| ----------------------- | ------ | ---- |
| 2022-01-23 10:00:00.123 | 50     | foo  |
| 2022-01-23 10:05:00.123 | 95     | Bar  |

You can set the message body to be `The sensor data at {{.time}} is {{.number}}, with note: {{.note}}`

## Send data to other systems via Redpanda Connect {#rpconnect}

Starting from Timeplus Enterprise 2.5, you can send data to various systems by editing a [Redpanda Connect](https://www.redpanda.com/connect) yaml file.

Redpanda Connect is a declarative data streaming service that solves a wide range of data engineering problems with simple, chained, stateless processing steps.

You can submit a streaming SQL in SQL Console, and click the "Save As" button and choose "Sink". Expand the "Send data via Redpanda Connect" section or type a keyword to search for suitable components.

Please refer to [Redpanda Connect Documenatations for Outputs](https://docs.redpanda.com/redpanda-connect/components/outputs/about/) for how to edit the configuration.
