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