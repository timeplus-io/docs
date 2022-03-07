#  Destination

With Timeplus Console, you can easily explore and analyze streaming data, with intuitive UI, standard SQL and streaming charts. But you won't stop here. Timeplus enables you to send real-time insights to other systems, either to notify individuals or power up downstream applications.

## Notify others via Email or Slack

After you start running a streaming query, you can click the icon to send real-time results to other systems.

### Slack

You need to create a Slack incoming webhook so that Timeplus can send a slack message in the specific channel for each result. Please follow the [Slack documentation](https://api.slack.com/messaging/webhooks) for the instructions.

Once you've got the Slack webhook URL, you can specify it in the dialog and set a message body. You can refer to column name via the `{{.column}}` expression. For instance, assume the output of the query is

| time                    | number | note |
| ----------------------- | ------ | ---- |
| 2022-01-23 10:00:00.123 | 50     | foo  |
| 2022-01-23 10:05:00.123 | 95     | Bar  |

You can set the message body to be `The sensor data at {{.time}} is {{.number}}, with note: {{.note}}`

### Email

You can configure Timeplus to send an email for each result by specifying the email server, user name, password, etc. Similar to the Slack action, you can refer to the value for each column using the `{{.column}}` expression.

## Send Data to Kafka{#kafka}

You can leverage Timeplus for various streaming analysis, such as

* Downsample the data from iot devices and get min/max/avg values every 5 second
* Identify any outlier based on the past pattern
* transform the data by removing sensitive information, remove duplication, or apply lookup with dimension tables

The transformed data or outlier events can be sent to a Kafka topic for other systems to further process.

To send data to Kafka, submit a streaming query, then click the icon to send streaming results to Kafka. The following parameters are required:

* Kafka broker(s) URL
* Topic name: either an existing topic or specify the new topic name for Timeplus to create.
* Authentication

Please refer to the [Kafka source](ingestion#kafka) for details of the parameters. You can send data to Confluent Cloud, Confluent Platform, or custom managed Apache Kafka. The events will be encoded as JSON documents.

## Send Data to Snowflake{#snowflake}

You can apply streaming analysis in Timeplus, then send the results to Snowflake. There are a few different ways to make it happen:

1. You can send the streaming results to Confluent Cloud or Kafka. Then leverage the [Snowflake sink in Confluent Cloud](https://docs.confluent.io/cloud/current/connectors/cc-snowflake-sink.html) to move the data into Snowflake. This approach will achieve lower latency. Please note the Confluent Cloud Kafka cluster need reside in the same cloud vendor and region, for example, both of them in us-west-1 of AWS. By default, the table in Snowflake will be created with the same name of the Kafka topic and the JSON document is saved in a TEXT column `RECORD_CONTENT`

```mermaid
flowchart LR
  Timeplus -->KafkaTopic
  KC --> KafkaTopic
  KC[Kafka Connect] --Kinesis Sink Connector--> Snowflake
```

For example, the query to downsample the data in Timeplus is

```sql
select window_end as time,cid,avg(speed_kmh) as speed_kmh,max(total_km) as total_km,
avg(gas_percent) as gas_percent,min(locked) as locked,min(in_use) as in_use 
from tumble(car_live_data,2s) group by cid, window_end
```

Then create a Kafka sink to send such data to the topic: snowflake.

After setting up the sink connector in Confluent Cloud, a `snowflake` table will be created the specified database and schema in your snowflake environment.  Then you can create a view to flatten the JSON document, such as

```sql
create view downsampled as select RECORD_CONTENT:time::timestamp_tz as time,
RECORD_CONTENT:cid as cid, RECORD_CONTENT:gas_percent as gas_percent,
RECORD_CONTENT:in_use as in_use,RECORD_CONTENT:locked as locked,
RECORD_CONTENT:speed_kmh as speed_kmh,RECORD_CONTENT:total_km as total_km from snowflake
```



2. You can also use other data integration tools to move data. For example, using AirByte to load latest data from Timeplus table, then move them to Snowflake or other destinations. 

```mermaid
flowchart LR
  Airbyte --source connector-->Timeplus
  Airbyte --sink connector-->Snowflake:::info
```

:::info

The Timeplus source plugin for Airbyte is in the early stage. Please contact us to arrange the integration. 

:::

## Trigger Actions via webhook{#webhook}

You can also add automations to trigger other systems to take actions when Timeplus finds any real-time insights. Simply choose the **Webhook** as the action type and optionally set a message body. You can use this approach to perform rule-based automation without human interaction, such as swapping a overheated equipment, scaling up to scaling down the server farm, etc.