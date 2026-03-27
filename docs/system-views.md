# Views in system namespace
Timeplus provides system views that enable effective troubleshooting and monitoring of your streaming data operations.

In Timeplus Enterprise 3.0 and later, these built-in views are defined on `system.introspection_state_log`. If you are running an older 2.x release, the equivalent state stream is `system.stream_state_log`.

## v_failed_mat_views
```sql
CREATE OR REPLACE VIEW system.v_failed_mat_views
AS
WITH running_mvs_in_last_5m AS
(
    SELECT
      database, name
    FROM system.introspection_state_log
    WHERE (_tp_time > (now() - 5m)) AND starts_with(dimension, 'materialized_view') AND (state_name = 'status') AND (state_string_value = 'Executing')
    ORDER BY _tp_time DESC -- order here to make sure we have the latest state
    SETTINGS query_mode = 'table'
)
SELECT database, name, state_string_value AS state, _tp_time
FROM system.introspection_state_log
WHERE (_tp_time > (now() - 5m)) AND starts_with(dimension, 'materialized_view') AND (state_name = 'status') AND NOT ((database, name) IN running_mvs_in_last_5m)
SETTINGS query_mode = 'table'
COMMENT 'version 3';
```

## v_mat_view_lags
```sql
CREATE OR REPLACE VIEW system.v_mat_view_lags
AS
WITH last_5m_progressing_status AS
(
  SELECT database, name, state_name, dimension, state_value, _tp_time AS ts
  FROM system.introspection_state_log
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
COMMENT 'version 3';
```

## v_no_leader_shards
```sql
CREATE OR REPLACE VIEW system.v_no_leader_shards
AS
WITH last_5m_stream_shards AS
(
  SELECT database, name, dimension AS shard
  FROM system.introspection_state_log
  WHERE _tp_time > (now() - 5m) AND state_name = 'committed_sn'
  GROUP BY database, name, dimension
  SETTINGS query_mode = 'table'
),
last_5m_quorum_status AS
(
  SELECT database, name, dimension AS shard
  FROM system.introspection_state_log
  WHERE _tp_time > (now() - 5m) AND state_name = 'quorum_replication_status'
  GROUP BY database, name, dimension
  SETTINGS query_mode = 'table'
)
SELECT database, name, shard
FROM last_5m_stream_shards
WHERE (database, name, shard) NOT IN last_5m_quorum_status
COMMENT 'version 2';
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
  FROM system.introspection_state_log
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
COMMENT 'version 3';
```

## v_shard_leaders
```sql
CREATE OR REPLACE VIEW system.v_shard_leaders
AS
WITH last_5m_quorum_status AS
(
  SELECT database, name, dimension AS shard, node_id AS leader, _tp_time AS ts
  FROM system.introspection_state_log
  WHERE _tp_time > (now() - 5m) AND state_name = 'quorum_replication_status'
  ORDER BY _tp_time DESC -- order here to make sure we have latest state
  SETTINGS query_mode = 'table'
)
SELECT database, name, shard, earliest(leader) AS leader, earliest(ts) AS  ts
FROM last_5m_quorum_status
GROUP BY database, name, shard
COMMENT 'version 2';
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
  FROM system.introspection_state_log
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
COMMENT 'version 3';
```

## v_stream_applied_lags
```sql
CREATE OR REPLACE VIEW system.v_stream_applied_lags
AS
WITH applied_sn_data AS
(
  SELECT database, name, node_id, state_value AS applied_sn, _tp_time AS ts
  FROM system.introspection_state_log
  WHERE (_tp_time > (now() - 5m)) AND (state_name = 'applied_sn')
  ORDER BY _tp_time DESC
  SETTINGS query_mode = 'table'
),
latest_applied_sn_per_node AS
(
  SELECT database, name, node_id,
    arg_max(applied_sn, ts) AS applied_sn,
    arg_max(ts, ts) AS latest_ts
  FROM applied_sn_data
  GROUP BY database, name, node_id
),
quorum_replication_data AS
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
  FROM system.introspection_state_log
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
    arg_max(leader_node, ts) AS leader_node,
    arg_max(replica_nodes, ts) AS replica_nodes,
    arg_max(replicas_map, ts) AS replicas_map,
    arg_max(ts, ts) AS latest_ts
  FROM quorum_replication_data
  GROUP BY database, name, shard
),
combined_sn_data AS
(
  SELECT
    a.database,
    a.name,
    a.node_id,
    a.applied_sn,
    r.shard,
    to_int64((r.replicas_map[a.node_id]):next_sn) - 1 AS log_replicated_sn,
    log_replicated_sn - a.applied_sn AS lags
  FROM latest_applied_sn_per_node a
  JOIN latest_replication_statuses r ON a.database = r.database AND a.name = r.name
)
SELECT
  database,
  name,
  shard,
  node_id,
  log_replicated_sn,
  applied_sn AS storage_applied_sn,
  lags
FROM combined_sn_data
ORDER BY lags DESC
COMMENT 'version 1';
```

## v_storages
```sql
CREATE OR REPLACE VIEW system.v_storages
AS
WITH storage_sizes AS
  (
    SELECT
      database, name, uuid, dimension AS store_type, any(state_string_value) AS stream_type, sum(state_value) AS total_bytes
    FROM
      system.introspection_state_log
    WHERE
      (_tp_time > (now() - 5m)) AND (state_name = 'disk_size') AND (database != 'neutron')
    GROUP BY
      database, name, uuid, dimension
    UNION ALL
    SELECT
      database, name, uuid, 'ckpt_size' AS store_type, dimension AS stream_type, sum(state_value) AS total_bytes
    FROM
      system.introspection_state_log
    WHERE
      (_tp_time > (now() - 5m)) AND state_name = 'checkpoint_storage_size'
    GROUP BY
      database, name, uuid, dimension
  )
SELECT
    database, name, uuid, store_type, stream_type, total_bytes
FROM
    storage_sizes
ORDER BY
    total_bytes DESC
SETTINGS query_mode = 'table'
COMMENT 'version 2';
```
