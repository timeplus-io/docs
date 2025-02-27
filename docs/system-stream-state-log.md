# system.stream_state_log
You can query the `system.stream_state_log` stream to check the state changes of database resources in Timeplus. This stream gives you full visibility of the state of the streams, materialized views, and other resources in Timeplus.

## Schema

This system stream is provisioned by Timeplus and cannot be modified.

:::info
We first introduced this stream in Timeplus Enterprise 2.6. Based on user feedback and performance optimization, we have updated the schema in Timeplus Enterprise 2.7. If you upgrade from 2.6 to 2.7, the system will automatically recreate the stream with the new schema. The previous state log data will be dropped.
:::

Here is the schema definition with comments:

```sql
CREATE STREAM system.stream_state_log
(
  `node_id` uint64,
  `database` low_cardinality(string),
  `name` string, -- name of the stream
  `uuid` uuid, -- unique identifier of the stream
  `state_name` low_cardinality(string), -- name of the state metric
  `state_value` uint64, -- numeric value of the state metric
  `state_string_value` string, -- string value of the state metric
  `dimension` string, -- additional dimensions for the metric
  `_tp_time` datetime64(3), -- time of the state is collected
  `_tp_sn` int64, -- sequence number of the data
  INDEX _tp_time_index _tp_time TYPE minmax GRANULARITY 32,
  INDEX _tp_sn_index _tp_sn TYPE minmax GRANULARITY 32
)
PRIMARY KEY (database, name, state_name, dimension, node_id)
ORDER BY (database, name, state_name, dimension, node_id)
TTL to_datetime(_tp_time) + INTERVAL 2 MONTH
SETTINGS mode = 'versioned_kv', logstore_codec = 'zstd', index_granularity = 8192
```

By default, every 5 seconds Timeplus collects the states and add the data points to this stream.

## Categories of State
Different types of resources in Timeplus have different states. Here are the categories of the state:

### Stream Storage

You can get the current size of the stream on disk for both streaming storage and historical storage. For example, the following query will get all stream storage states:

```sql
SELECT
    database,
    name AS stream_name,
    node_id,
    state_name,
    dimension,
    format_readable_size(latest(state_value)) AS size,
    latest(_tp_time) AS last_update
FROM table(system.stream_state_log)
WHERE state_name = 'disk_size'
  AND _tp_time > now() - 5m
GROUP BY database, name, node_id, state_name, dimension
ORDER BY database, name, node_id, dimension
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

#### disk_size
The disk size metric with dimensions:
- `log_store`: The size of the logstore on disk.
- `historical_store`: The size of the historical store on disk.

### Stream Sequence Number

The sequence number of the stream. It's used to track the progress of the stream. For example, the following query will compare the sequence number of the streams:

```sql
SELECT
    database,
    name AS stream_name,
    node_id,
    state_name,
    dimension AS shard,
    latest(state_value) AS sequence_number,
    latest(_tp_time) AS last_update
FROM table(system.stream_state_log)
WHERE state_name IN ('applied_sn', 'committed_sn')
  AND _tp_time > now() - 5m
GROUP BY database, name, node_id, state_name, dimension
ORDER BY database, name, node_id, state_name, dimension
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

#### applied_sn
The sequence number of the stream that has been applied. The shard number is stored in the `dimension` field.

#### committed_sn
The sequence number of the stream that has been committed. The shard number is stored in the `dimension` field.

#### start_sn
The starting sequence number of the stream or materialized view source. The source information is stored in the `dimension` field.

#### end_sn
The ending sequence number of the stream or materialized view source. The source information is stored in the `dimension` field.

#### processed_sn
Last processed sequence number for the stream or materialized view source. The source information is stored in the `dimension` field.

### Materialized View

#### checkpoint_storage_size
The size of the checkpoint storage on disk. The dimension is set to `materialized_view`.

#### status
The status of the materialized view. Read the `state_string_value` column for the status. If the materialized view is running healthy, the status will be `ExecutingPipeline`. The dimension is set to `materialized_view`.

#### last_error_message
The last error message of the materialized view. Read the `state_string_value` column for the error message. The timestamp of the error is stored in the `state_value` field. The dimension is set to `materialized_view`.

#### recover_times
The number of times the materialized view has been recovered. The dimension is set to `materialized_view`.

#### memory_usage
The memory usage of the materialized view. The dimension is set to `materialized_view`.

#### processed_record_ts
The timestamp of the last processed record for the materialized view source. The source information is stored in the `dimension` field.

#### ckpt_sn
Last checkpoint sequence number for the materialized view source. The source information is stored in the `dimension` field.

### Ingestion Performance

#### ingest
The number of dropped messages during ingestion. The dimension is set to `dropped`.

#### ingest_latency
The number of messages that are ingested with different latency ranges, indicated by the following dimensions:
- `lt_500ms`: Within 500ms
- `500ms_1s`: Between 500ms and 1s
- `1_3s`: Between 1s and 3s
- `3_6s`: Between 3s and 6s
- `gt_6s`: Over 6s

Example query:
```sql
SELECT
    database,
    name AS stream_name,
    node_id,
    state_name,
    dimension AS latency_range,
    latest(state_value) AS message_count,
    latest(_tp_time) AS last_update
FROM table(system.stream_state_log)
WHERE state_name = 'ingest_latency'
  AND _tp_time > now() - 5m
GROUP BY database, name, node_id, state_name, dimension
ORDER BY database, name, node_id, dimension
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

### External Stream

#### read_failed
The number of failed read operations from the external stream. The dimension is set to `external_stream`.

#### written_failed
The number of failed write operations to the external stream. The dimension is set to `external_stream`.

### Dictionary

Dictionary metrics all use the dimension value `dict`:

#### bytes_allocated
The number of bytes allocated in the memory for the dictionary.

#### hierarchical_index_bytes_allocated
The number of bytes allocated in the memory for the hierarchical index.

#### query_count
The number of queries executed with the dictionary.

#### hit_rate_pct
The hit rate percentage of the dictionary.

#### found_rate_pct
The found rate percentage of the dictionary.

#### element_count
The number of elements in the dictionary.

#### load_factor_pct
The load factor percentage of the dictionary.

#### loading_start_time
The start time of the loading process as milliseconds since epoch.

#### last_successful_update_time
The last successful update time of the dictionary as milliseconds since epoch.

#### loading_duration_ms
The duration of the loading process in milliseconds.

#### last_exception
The last exception message of the dictionary. Read the `state_string_value` column for the exception message.

Example query for dictionary stats:
```sql
SELECT
    database,
    name AS dict_name,
    node_id,
    state_name,
    latest(state_value) AS value,
    latest(state_string_value) AS string_value,
    latest(_tp_time) AS last_update
FROM table(system.stream_state_log)
WHERE dimension = 'dict'
  AND _tp_time > now() - 5m
GROUP BY database, name, node_id, state_name
ORDER BY database, name, state_name
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

### Replication

#### quorum_replication_status
The status of the quorum replication. Read the `state_string_value` column for the status. The shard ID is now stored in the `dimension` field.

For example, the following query will get the quorum replication status:

```sql
SELECT
  database,
  name AS stream_name,
  node_id AS reporting_node,
  dimension AS shard,
  latest(state_value) AS quorum_commit_sn,
  latest(state_string_value) AS quorum_status,
  latest(_tp_time) AS last_update
FROM
  table(system.stream_state_log)
WHERE
  state_name = 'quorum_replication_status'
  AND _tp_time > (now() - INTERVAL 5 MINUTE)
GROUP BY database, name, node_id, dimension
ORDER BY database, name, node_id, dimension
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

A sample message of the quorum replication status is:
```json
{
	"shard": 0,
	"shard_replication_statuses": [
		{
			"append_message_flow_paused": false,
			"inflight_messages": 0,
			"is_learner": false,
			"next_sn": 0,
			"node": 1,
			"pending_snapshot_sn": 0,
			"recent_active": false,
			"replicated_sn": 613219,
			"state": "Replicate"
		}
	]
}
```
You can further extract the fields from the JSON message. For example:
```sql
WITH
    latest_status AS (
        SELECT
            database,
            name,
            node_id,
            dimension AS shard,
            arg_max(state_string_value, _tp_time) AS status_json,
            max(_tp_time) AS last_update
        FROM table(system.stream_state_log)
        WHERE state_name = 'quorum_replication_status'
          AND _tp_time > (now() - INTERVAL 5 MINUTE)
        GROUP BY database, name, node_id, dimension
    )
SELECT
    database,
    name AS stream_name,
    node_id AS reporting_node,
    shard,
    json_extract_array_raw(status_json, 'shard_replication_statuses') as statuses,
    array_map(x -> json_extract_int(x, 'node'), statuses) AS member_nodes,
    array_map(x -> json_extract_string(x, 'state'), statuses) AS member_states,
    array_map(x -> json_extract_int(x, 'replicated_sn'), statuses) AS replicated_sns,
    array_map(x -> json_extract_int(x, 'next_sn'), statuses) AS next_sns,
    last_update
FROM latest_status
ORDER BY database, name, node_id, shard
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```
