# OLAP Query

In addition to stream processing, Timeplus also store and serve for historical data, like many OLAP databases. By default, data are saved in Timeplus' columnar storage, with optional secondary indexes. For [mutable streams](/mutable-stream), historical data are saved in row-based storage, for fast update and range queries.

When you run `SELECT .. FROM stream`, it's in streaming mode by default, and the query is long-running. To run historical query and stop the query when results are returned, there are 3 ways to do it:

## query_mode='table'
Run historical query by setting `query_mode='table'`. 如果查询中有多个流，并且用户喜欢在查询中作为一个整体进行历史数据处理，则此模式非常有用。

```sql
SELECT * FROM device_utils 设置 TTINGS query_mode='table';
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
