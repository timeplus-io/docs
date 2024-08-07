# Stream

## All data live in streams

Timeplus is a streaming analytics platform and data lives in streams. Timeplus `streams` are similar to `tables` in the traditional SQL databases. Both of them are essentially datasets. The key difference is that Timeplus stream is an append-only (by default), unbounded, constantly changing events group.

Timeplus supports multiple types of streams:

1. By default, the streams are append-only and immutable (older data can be purged automatically by setting a retention policy).
2. If you want to create a stream to track the latest value for a primary key or a set of keys, you can create [Mutable Streams](mutable-stream). This is only available in Timeplus Enterprise.
3. In [Timeplus Proton](proton), you can also create [Versioned Streams](versioned-stream) and [Changelog Stream](changelog-stream). But those 2 stream modes will be deprecated and replaced by mutable streams.
4. You can also define [External Streams](external-stream) to run SQL against remote Kafka/Redpanda brokers, or the other Timeplus/Proton server.

## Create a stream
You can create a stream via the Timeplus Console UI, or via [SQL](sql-create-stream). When you [ingest data](ingestion) into Timeplus from Kafka or file sources, streams can be created automatically to match the schema of the data.

## Query a stream

By default, querying the stream will continuously scan new events and output new results. It never ends unless the user cancels the query. For example, you can get the latest web logs with HTTP 500 error or get the min/max/avg of a metric for every minute from an IoT device. Please read [Streaming Queries](stream-query) for more details.

If you only want to analyze the existing data and need an immediate response, you can run [Non-streaming Queries](history) via the [table](functions_for_streaming#table) function. This will turn the query in the bounded mode and only scan the existing data. For example, you can run `select count(*) from table(stream1)` to get the total number of rows in the data stream.



## Delete a stream

From the web console, you can delete the stream. This will permanently delete all data in the stream and delete the stream itself. Data cannot be recovered after deletion.
