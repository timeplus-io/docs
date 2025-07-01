# Historical Data Processing

In addition to stream processing, Timeplus also store and serve for historical data, like many OLAP databases. By default, data are saved in Timeplus' columnar storage, with optional secondary indexes. For [mutable streams](/mutable-stream), historical data are saved in row-based storage, for fast update and range queries.

When you run `SELECT .. FROM stream`, it's in streaming mode by default, and the query is long-running. To run historical query and stop the query when results are returned, there are 3 ways to do it:

## query_mode='table'
Run historical query by setting `query_mode='table'`. This mode is useful if there are multiple streams in the query and users like to do historical data processing as a whole in the query.

```sql
SELECT * FROM device_utils SETTINGS query_mode='table';
```

## table(stream)
Run historical query per stream by wrapping stream with [table](/functions_for_streaming#table) function. This mode is flexible as you can query certain streams in the streaming way and other streams in batch way. For example enrich an append-only stream with a static dimension table join.

```sql
-- Query the historical data for the stream
SELECT * FROM table(device_utils);

-- Query the streaming data in iot_read and JOIN it with the historical data from metadata
SELECT * FROM iot_read LEFT JOIN table(metadata) as m USING(id)
```

## 8123 or 7587 ports
While using [one of our SDK](/jdbc) to connect to Timeplus, you can choose HTTP port 8123 or TCP port 7587. Timeplus will automatically turn on historical query mode while receiving queries in these 2 ports. [Learn more](/proton-ports).
