# system.stream_state_log
You can query the `system.stream_state_log` stream to check the state changes of database resources in Timeplus. This stream gives you full visibility of the state of the streams, materialized views, and other resources in Timeplus.

## Schema

This system stream is provisioned by Timeplus and cannot be modified. Here is the schema definition with comments:

```sql
CREATE STREAM system.stream_state_log
(
  `node_id` uint64,
  `database` string,
  `name` string, -- name of the stream
  `uuid` uuid, -- unique identifier of the stream
  `state_name` string, -- name of the state metric
  `state_value` uint64, -- numeric value of the state metric
  `state_string_value` string, -- string value of the state metric
  `_tp_time` datetime64(3), -- time of the state is collected
  `_tp_sn` int64, -- sequence number of the data
  INDEX _tp_time_index _tp_time TYPE minmax GRANULARITY 32,
  INDEX _tp_sn_index _tp_sn TYPE minmax GRANULARITY 32
)
PARTITION BY to_YYYYMMDD(_tp_time)
ORDER BY (to_hour(_tp_time), database, name)
TTL to_datetime(_tp_time) + INTERVAL 1 YEAR -- keep the historical data for 1 year by default
SETTINGS logstore_retention_ms = 31536000000, index_granularity = 8192 -- keep the streaming data for 1 year by default
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
    format_readable_size(latest(state_value)) AS size,
    latest(_tp_time) AS last_update
FROM table(system.stream_state_log)
WHERE state_name IN ('stream_logstore_disk_size', 'stream_historical_store_disk_size')
  AND _tp_time > now() - 5m
GROUP BY database, name, node_id, state_name
ORDER BY database, name, node_id
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

#### stream_logstore_disk_size
The size of the logstore on disk.

#### stream_historical_store_disk_size
The size of the historical store on disk.

### Stream Sequence Number

The sequence number of the stream. It's used to track the progress of the stream. For example, the following query will compare the sequence number of the streams:

```sql
SELECT
    database,
    name AS stream_name,
    node_id,
    state_name,
    latest(state_value) AS sequence_number,
    latest(_tp_time) AS last_update
FROM table(system.stream_state_log)
WHERE (state_name LIKE 'applied_sn_%' OR state_name LIKE 'committed_sn_%')
  AND _tp_time > now() - 5m
GROUP BY database, name, node_id, state_name
ORDER BY database, name, node_id, state_name
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```

#### applied_sn_
`applied_sn_{shard}`. The shard number starts from 0. So for single node, it's `applied_sn_0`.

The sequence number of the stream that has been applied.

#### committed_sn_
`committed_sn_{shard}`. The shard number starts from 0. So for single node, it's `committed_sn_0`.

The sequence number of the stream that has been committed.

#### start_sn_
`start_sn_{source}[description]`. For example `start_sn_StreamingStoreSource[stream=default.my_stream,shard=0]`

The starting sequence number of the stream or materialized view source.

#### end_sn_
`end_sn_{source}[description]`. For example `end_sn_StreamingStoreSource[stream=default.my_stream,shard=0]`

The ending sequence number of the stream or materialized view source.

#### processed_sn_
`processed_sn_{source}[description]`. For example `processed_sn_StreamingStoreSource[stream=default.my_stream,shard=0]`

Last processed sequence number for the stream or materialized view source.

### Materialized View

#### mv_checkpoint_storage_size
The size of the checkpoint storage on disk.

#### mv_status
The status of the materialized view. Read the `state_string_value` column for the status. If the materialized view is running healthy, the status will be `ExecutingPipeline`.

#### mv_last_error_message
The last error message of the materialized view. Read the `state_string_value` column for the error message.

#### mv_recover_times
The number of times the materialized view has been recovered.

#### mv_memory_usage
The memory usage of the materialized view.

#### processed_record_ts_
`processed_record_ts_{source}[description]`.

The timestamp of the last processed record for the materialized view source.

#### ckpt_sn_
`ckpt_sn_{source}[description]`.

Last checkpoint sequence number for the materialized view source.

### Ingestion Performance

#### ingest_dropped
The number of dropped messages during ingestion.

#### ingest_lt_500ms
The number of messages that are ingested within 500ms.

#### ingest_500ms_1s
The number of messages that are ingested between 500ms and 1s.

#### ingest_1_3s
The number of messages that are ingested between 1s and 3s.

#### ingest_3_6s
The number of messages that are ingested between 3s and 6s.

#### ingest_gt_6s
The number of messages that are ingested over 6s.

### External Stream

#### external_stream_read_failed
The number of failed read operations from the external stream.

#### external_stream_written_failed
The number of failed write operations to the external stream.

### Dictionary

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
The start time of the loading process.

#### last_successful_update_time
The last successful update time of the dictionary.

#### loading_duration_ms
The duration of the loading process.

#### last_exception
The last exception message of the dictionary. Read the `state_string_value` column for the exception message.

### Replication

#### quorum_replication_status
The status of the quorum replication. Read the `state_string_value` column for the status.

For example, the following query will get the quorum replication status:

```sql
SELECT
  database, name AS stream_name, node_id AS reporting_node, latest(state_string_value) AS quorum_status, latest(_tp_time) AS last_update
FROM
  table(system.stream_state_log)
WHERE
  (state_name = 'quorum_replication_status') AND (_tp_time > (now() - INTERVAL 5 MINUTE))
GROUP BY database, name, node_id
ORDER BY database, name, node_id
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
            arg_max(state_string_value, _tp_time) AS status_json,
            max(_tp_time) AS last_update
        FROM table(system.stream_state_log)
        WHERE state_name = 'quorum_replication_status'
          AND _tp_time > (now() - INTERVAL 5 MINUTE)
        GROUP BY database, name, node_id
    )
SELECT
    database,
    name AS stream_name,
    node_id AS reporting_node,
    status_json:shard AS shard,
    json_extract_array_raw(status_json, 'shard_replication_statuses') as statuses,
    array_map(x -> json_extract_int(x, 'node'), statuses) AS member_nodes,
    array_map(x -> json_extract_string(x, 'state'), statuses) AS member_states,
    array_map(x -> json_extract_int(x, 'replicated_sn'), statuses) AS replicated_sns,
    array_map(x -> json_extract_int(x, 'next_sn'), statuses) AS next_sns,
    last_update
FROM latest_status
ORDER BY database, name, node_id
SETTINGS
  max_threads = 1, force_backfill_in_order = true;
```
