

# External Stream

You can also create **external streams** in Timeplus to query data in the external systems without loading the data into Timeplus. The main benefit for doing so is to keep a single source of truth in the external systems (e.g. Apache Kafka), without duplicating them. In many cases, this can also achieve even lower latency to process Kafka data, because the data is read by Timeplus, without other components.

:::info

Starting from Proton 1.3.18, you can also write data to Apache Kafka via the external streams and materialized views. [Learn More](proton-kafka#write-to-kafka-with-sql)

:::

You can run streaming analytics with the external streams in the similar way as other streams, with some limitations. 

## Create an external stream

:::info

The rest of this page assumes you are using Timeplus Console. If you are using Proton, you can create the external stream with DDL. [Learn more](proton-kafka)

:::

To create an external stream, go to the **Data Ingestion** page, then choose one of the supported system with **External Stream** as the data type. Set the stream name, Kafka broker(s) and topic name. Choose the right authentication method and click **Create**. For the **Read as** option, if you choose **JSON**, then Timeplus will create multiple columns with the top level JSON key/value pairs in the sample Kafka message. If you choose **Text**, then a single `raw` column will be created in the stream to capture the value of the messages in Kafka.

## Query external streams

To query the data in the external systems, run the streaming SQL in the similar way for normal streams, e.g. `SELECT count(*) FROM my_external_stream` You can also create [views](view) or [materialized views](view#materialized-view) based on external streams.

## Limitations

There are some limitations for the Kafka-based external streams, because Timeplus doesn’t control the storage or the data format for the external stream.

1. The UI wizard only support JSON or TEXT. To use Avro, Protobuf, or schema registry service, you need to [create the external stream with SQL](proton-kafka).
2. `_tp_time` is available in the external streams (since Proton 1.3.30). `_tp_append_time` is set only when message timestamp is an append time.
3. Unlike normal streams, there is no historical storage for the external streams. Hence you cannot run `table(my_ext_stream)`or `settings query_mode='table'` To access data even before you create the external stream, you can use `WHERE _tp_time >'2023-01-15'` to travel to a specific timestamp in the past, or use `SETTINGS seek_to='earliest'`.
4. There is no retention policy for the external streams in Timeplus. You need to configure the retention policy on Kafka/Confluent/Redpanda. If the data is no longer available in the external systems, they cannot be searched in Timeplus either.