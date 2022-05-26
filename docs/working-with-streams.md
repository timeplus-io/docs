# Stream

## All data live in streams

Timeplus is a streaming analytics platform and data lives in streams. Timeplus `streams` are similar to `tables` in the traditional SQL databases. Both of them are essentially dataset. The key difference is that Timeplus stream is an append-only, unbounded, constantly changing events group.



## Create a stream

In the most cases, you don't need to explicitly create a stream in Timeplus. When you [ingest data](ingestion) into Timeplus from Kafka or file sources, streams can be created automatically to match the schema of the data.



## Query a stream

By default, querying the stream will continuously scan new events and output new results. It never ends unless the user cancels the query. For example, you can get the latest web logs with HTTP 500 error or get the min/max/avg of a metric for every minute from a IoT device. Please read [Streaming Queries](stream-query) for more details.

If you only want to analyze the existing data and need an immediate response, you can run [Non-streaming Queries](history) via the [table](functions#table) function. This will turn the query in the bounded mode and only scan the existing data. For example, you can run `select count(*) from table(stream1)` to get the total number of rows in the data stream.



## Delete a stream

From the web console, you can delete the stream. This will permanently delete all data in the stream and delete the stream itself. Data cannot be recovered after deletion.



## External Streams (New) {#external_stream}

You can also create **external streams** in Timeplus to query data in the external systems without loading the data into Timeplus. The main benefit for doing so is to keep a single source of truth in the external systems (e.g. Kafka), without duplicating them. You can run streaming analytics with the external streams in the similar way as other streams, with some limitations. 

### supported external systems

The supported external systems are:

* Open source Apache Kafka or Redpanda, without authentication. 
* Confluent Cloud with SASL Plain authentication.

The topics should contain messages in plain-text or JSON format.

### create an external stream

To create an external stream, go to the **STREAMS** page, then click the button on the right side and change it to **Create an external stream**. Set the stream name, Kafka broker(s) and topic name. Choose the right authentication method and click **Create**.

### query external streams

To query the data in the external systems, run the streaming SQL in the similar way for normal streams, e.g. `SELECT count(*) FROM my_external_stream` You can also create [views](view) or [materialized views](view#materialized-view) based on external streams.

### limitations

There are some limitations for the Kafka-based external streams, because Timeplus doesn’t control the storage or the data format for the external stream.

1. Authentication is either None or SASL Plain. SASL Scram 256 or 512 is not supported yet.
2. Data format in JSON or TEXT format. AVRO or schema registry service is not supported yet. The entire message will be put in a `raw` string column.
3. Since the raw data is not stored in Timeplus, we cannot attach event time or index time for each event at ingestion time. You can specify the event time with an expression in the query, such as `tumble(ext_stream,to_time(raw:order_time),1m)`
4. Unlike normal streams, there is no historical store for the external streams. Hence you cannot run `table(my_ext_stream)`or `settings query_mode='table'` To access data even before you create the external stream, you can use `settings seek_to='earliest'` or `seek_to` a specific timestamp in the past.
5. There is no retention policy for the external streams in Timeplus. You need to configure the retention policy on Kafka/Confluent/Redpanda. If the data is no longer available in the external systems, they cannot be searched in Timeplus either.



