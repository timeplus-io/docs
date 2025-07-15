# Views in system namespace
Timeplus provides system views that enable effective troubleshooting and monitoring of your streaming data operations.

## v_failed_mat_views
```sql
CREATE OR REPLACE VIEW system.v_failed_mat_views
AS
WITH running_mvs_in_last_5m AS
(
    SELECT
      database, name
    FROM system.stream_state_log
    WHERE (_tp_time > (now() - 5m)) AND (dimension = 'materialized_view') AND (state_name = 'status') AND (state_string_value = 'ExecutingPipeline')
    ORDER BY _tp_time DESC -- order here to make sure we have the latest state
    SETTINGS query_mode = 'table'
)
SELECT database, name, state_string_value AS state, _tp_time
FROM system.stream_state_log
WHERE (_tp_time > (now() - 5m)) AND (dimension = 'materialized_view') AND (state_name = 'status') AND NOT ((database, name) IN running_mvs_in_last_5m)
SETTINGS query_mode = 'table'
COMMENT 'version 2';
```

## v_mat_view_lags
```sql
CREATE OR REPLACE VIEW system.v_mat_view_lags
AS
WITH last_5m_progressing_status AS
(
  SELECT database, name, state_name, dimension, state_value, _tp_time AS ts
  FROM system.stream_state_log
  WHERE (_tp_time > (now() - 5m)) AND (state_name IN ('processed_sn', 'ckpt_sn', 'end_sn'))
  ORDER BY _tp_time DESC -- order here to make sure we have latest state
  SETTINGS query_mode = 'table'
),
latest_mv_lagging_per_source AS
(
  SELECT database, name, state_name, earliest(state_value) AS state_value, earliest(ts) AS ts
  FROM last_5m_progressing_status
  GROUP BY database, name, state_name, dimension
),
mv_lagging_aggr_per_state AS
( -- Aggregate all sources
  SELECT database, name, state_name, sum(state_value) AS state_value, earliest(ts) AS ts
  FROM last_5m_progressing_status
  GROUP BY database, name, state_name
),
mv_lagging_aggr_per_mv AS
(
  SELECT
      database,
      name,
      group_array(state_name) AS state_names,
      group_array(state_value) AS state_values,
      map_from_arrays(state_names, state_values) AS states,
      earliest(ts) AS ts
  FROM mv_lagging_aggr_per_state
  GROUP BY database, name
)
SELECT
    database,
    name,
    states['processed_sn'] AS processed_sn,
    states['ckpt_sn'] AS ckpt_sn,
    states['end_sn'] AS end_sn,
    if (end_sn != 0, end_sn - processed_sn, 0) AS lag,
    if (ckpt_sn != 0 AND processed_sn != 0, processed_sn - ckpt_sn, 0) AS ckpt_lag,
    ts
FROM mv_lagging_aggr_per_mv
COMMENT 'version 2';
```

## v_no_leader_shards
```sql
CREATE OR REPLACE VIEW system.v_no_leader_shards
AS
WITH last_5m_stream_shards AS
(
  SELECT database, name, dimension AS shard
  FROM system.stream_state_log
  WHERE _tp_time > (now() - 5m) AND state_name = 'committed_sn'
  GROUP BY database, name, dimension
  SETTINGS query_mode = 'table'
),
last_5m_quorum_status AS
(
  SELECT database, name, dimension AS shard
  FROM system.stream_state_log
  WHERE _tp_time > (now() - 5m) AND state_name = 'quorum_replication_status'
  GROUP BY database, name, dimension
  SETTINGS query_mode = 'table'
)
SELECT database, name, shard
FROM last_5m_stream_shards
WHERE (database, name, shard) NOT IN last_5m_quorum_status
COMMENT 'version 1';
```

## v_replication_lags
```sql
CREATE OR REPLACE VIEW system.v_replication_lags
AS
WITH recent_replication_statuses AS
(
  SELECT
    database,
    name,
    state_string_value:shard AS shard,
    node_id AS leader_node,
    state_string_value:shard_replication_statuses[*] AS replica_statuses,
    array_map(x -> to_uint64(x:node), replica_statuses) AS replica_nodes,
    map_cast(array_map(x -> to_uint64(x:node), replica_statuses), replica_statuses) AS replicas_map,
    _tp_time AS ts
  FROM system.stream_state_log
  WHERE (_tp_time > (now() - 5m)) AND (state_name = 'quorum_replication_status')
  ORDER BY _tp_time DESC
  SETTINGS query_mode = 'table'
),
latest_replication_statuses AS
(
  SELECT
    database,
    name,
    to_int(shard) AS shard,
    earliest(leader_node) AS leader_node,
    array_join(latest(replica_nodes)) AS replica_node,
    earliest(replicas_map) AS replicas_map,
    earliest(ts) AS ts
  FROM recent_replication_statuses
  GROUP BY database, name, shard
)
SELECT
    database,
    name,
    shard,
    leader_node,
    replica_node,
    to_int64((replicas_map[leader_node]):next_sn) - to_int64((replicas_map[replica_node]):next_sn) AS lagging,
    ts
FROM latest_replication_statuses
COMMENT 'version 2';
```

## v_shard_leaders
```sql
CREATE OR REPLACE VIEW system.v_shard_leaders
AS
WITH last_5m_quorum_status AS
(
  SELECT database, name, dimension AS shard, node_id AS leader, _tp_time AS ts
  FROM system.stream_state_log
  WHERE _tp_time > (now() - 5m) AND state_name = 'quorum_replication_status'
  ORDER BY _tp_time DESC -- order here to make sure we have latest state
  SETTINGS query_mode = 'table'
)
SELECT database, name, shard, earliest(leader) AS leader, earliest(ts) AS  ts
FROM last_5m_quorum_status
GROUP BY database, name, shard
COMMENT 'version 1';
```

## v_under_replication_replicas
```sql
CREATE OR REPLACE VIEW system.v_under_replication_replicas
AS
WITH recent_replication_statuses AS
(
  SELECT
     database,
     name,
     state_string_value:shard AS shard,
     node_id AS leader_node,
     state_string_value:shard_replication_statuses[*] AS replica_statuses,
     array_map(x -> to_uint64(x:node), replica_statuses) AS replica_nodes,
     map_from_arrays(array_map(x -> to_uint64(x:node), replica_statuses), replica_statuses) AS replicas_map,
     _tp_time AS ts
  FROM system.stream_state_log
  WHERE (_tp_time > (now() - 5m)) AND (state_name = 'quorum_replication_status')
  ORDER BY _tp_time DESC
  SETTINGS query_mode = 'table'
),
latest_replication_statuses AS
(
  SELECT
      database,
      name,
      to_int(shard) AS shard,
      earliest(leader_node) AS leader_node,
      array_join(earliest(replica_nodes)) AS replica_node,
      earliest(replicas_map) AS replicas_map,
      earliest(ts) AS ts
  FROM recent_replication_statuses
  GROUP BY database, name, shard
)
SELECT database, name, shard, leader_node, replica_node, (replicas_map[replica_node]):state AS state, ts
FROM latest_replication_statuses
WHERE state != 'Replicate'
COMMENT 'version 2';
```
