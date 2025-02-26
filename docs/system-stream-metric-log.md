# system.stream_metric_log
You can query the `system.stream_metric_log` stream to check the performance and usage statistics.

## Schema

This system stream is provisioned by Timeplus and cannot be modified.

:::info
We first introduced this stream in Timeplus Enterprise 2.6. Based on user feedback and performance optimization, we have updated the schema in Timeplus Enterprise 2.7. If you upgrade from 2.6 to 2.7, the system will automatically recreate the stream with the new schema. The previous metric log data will be dropped.
:::

Here is the schema definition with comments:

```sql
CREATE STREAM system.stream_metric_log
(
  `elapsed_ms` int64, -- elapsed time since last metric collection in milliseconds
  `node_id` uint64,
  `database` low_cardinality(string),
  `name` string, -- name of the stream
  `uuid` uuid, -- unique identifier of the stream
  `type` low_cardinality(fixed_string(32)), -- type of the stream, e.g. 'Stream', 'MaterializedView'
  `read_bytes` uint64, -- bytes read since last metric collection
  `read_rows` uint64, -- rows read since last metric collection
  `written_bytes` uint64,  -- bytes written since last metric collection
  `written_rows` uint64, -- rows written since last metric collection
  `external_ingress` bool, -- whether the metric is collected for external ingress(true) or internal processing(false)
  `_tp_time` datetime64(3),
  `_tp_sn` int64,
  INDEX _tp_time_index _tp_time TYPE minmax GRANULARITY 32,
  INDEX _tp_sn_index _tp_sn TYPE minmax GRANULARITY 32
)
PARTITION BY to_YYYYMM(_tp_time)
ORDER BY (to_hour(_tp_time), database, name)
TTL to_datetime(_tp_time) + INTERVAL 1 YEAR
SETTINGS logstore_codec = 'zstd', index_granularity = 8192
```

Notes:
* By default, every 5 seconds Timeplus collects the metrics and adds the data points to this stream.
* Each collection represents the delta value since the last collection.
* For Materialized View, the metrics are collected both for the view and the target stream.
* System databases (such as `system`, `information_schema`) are excluded from the metrics.
* The `database` and `type` columns use the `low_cardinality` data type optimization, which improves query performance for columns with a small number of distinct values.

## Examples

### Average Throughput in the Last 5 Minutes

You can get the throughput of the read/write operations. For example, the following query will get the average read/write bytes per second and read/write rows per second for each stream in the last 5 minutes:

```sql
SELECT
    name,
    avg((read_bytes / elapsed_ms) * 1000) AS read_bps,
    avg((read_rows / elapsed_ms) * 1000) AS read_eps,
    avg((written_bytes / elapsed_ms) * 1000) AS written_bps,
    avg((written_rows / elapsed_ms) * 1000) AS written_eps
FROM table(system.stream_metric_log)
WHERE elapsed_ms > 0 AND _tp_time > now() - 5m
GROUP BY name;
```

### Average Throughput for every 5 Minutes

The following query will get the average read/write bytes per second and read/write rows per second for each stream in every 5 minutes:

```sql
SELECT
    window_start,
    sum(read_bps) AS total_read_bps,
    sum(read_eps) AS total_read_eps
FROM (
    SELECT
        window_start,
        node_id,
        avg((read_bytes / elapsed_ms) * 1000) AS read_bps,
        avg((read_rows / elapsed_ms) * 1000) AS read_eps
    FROM tumble(table(system.stream_metric_log), 5m)
    WHERE elapsed_ms > 0
    GROUP BY window_start, node_id
)
GROUP BY window_start
ORDER BY window_start DESC;
```

### Daily Ingestion Volume
The following query will get the daily ingestion volume for all streams:

```sql
SELECT
    to_date(_tp_time) AS event_date,
    sum(written_bytes) AS ingest_bytes
FROM table(system.stream_metric_log)
WHERE type = 'Stream'
    AND external_ingress = true
GROUP BY event_date
ORDER BY event_date DESC;
```

### Metrics for a Specific Node
The following query will get the total read/write bytes and rows for each node in the last minute:
```sql
SELECT
    node_id,
    sum(read_bytes) AS total_read_bytes,
    sum(written_bytes) AS total_written_bytes,
    sum(read_rows) AS total_read_rows,
    sum(written_rows) AS total_written_rows
FROM table(system.stream_metric_log)
WHERE _tp_time > (now() - INTERVAL 1 minute)
GROUP BY node_id;
```

### Performance by Storage Type
This query shows metrics aggregated by storage type:

```sql
SELECT
    type,
    COUNT(DISTINCT name) AS stream_count,
    SUM(read_bytes) AS total_read_bytes,
    SUM(written_bytes) AS total_written_bytes,
    SUM(read_rows) AS total_read_rows,
    SUM(written_rows) AS total_written_rows
FROM table(system.stream_metric_log)
WHERE _tp_time > now() - 1h
GROUP BY type
ORDER BY stream_count DESC;
```
