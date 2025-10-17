# Materialized View Lifecycle

A Timeplus Materialized View maintains its internal state and can transition between different states.  
Understanding these transitions is important for operating and troubleshooting Materialized View pipelines.  

## States

Materialized Views can exist in the following states. Some are **transient** (short-lived during transitions):

- **`Initializing`** *(transient)*: The view is being initialized.  
- **`CheckingDependencies`** *(transient)*: The system is verifying source dependencies.  
- **`BuildingPipeline`** *(transient)*: The query execution pipeline is being constructed.  
- **`ExecutingPipeline`**: The view is running and executing its streaming query pipeline. This is the normal operating state.  
- **`Error`**: The view encountered an error.  
- **`Suspended`**: The view is inactive because it is not the Raft leader. Only the leader executes the pipeline. Suspended views act as standby replicas for failover.  
- **`Paused`**: The view is paused, either due to the `pause_on_start` setting or a `SYSTEM PAUSE` command.  
- **`AutoRecovering`** *(transient)*: The view is automatically recovering from transient errors.  
- **`Resuming`** *(transient)*: The view is transitioning from `Paused` to `ExecutingPipeline`.  
- **`Recovering`** *(transient)*: The view is being manually recovered from `Error` state using `SYSTEM RECOVER`.  

The state transitions are illustrated in the diagram below:  

![MaterializedViewStates](/img/materialized-view-states-transition.png)

## System Commands

Timeplus provides system commands to manage Materialized Views.  

### Pause Materialized View

```sql
SYSTEM PAUSE MATERIALIZED VIEW <db.mat_view_name> [PERMANENT];
```

When pausing a Materialized View:

1. The leader triggers a checkpoint.
2. The leader stops the query pipeline and marks the state as `Paused`.
3. If `PERMANENT` is specified, the system updates `pause_on_start=true` in the DDL metadata and commits it to the metastore.
   - This ensures the view remains paused even after node restarts.
   - Without `PERMANENT`, the view will resume automatically on restart.

**Example**:
```sql
SYSTEM PAUSE MATERIALIZED VIEW tumble_aggr_mv;
```

### Resume Materialized View

```sql
SYSTEM RESUME MATERIALIZED VIEW <db.mat_view_name> [PERMANENT];
```

When resuming a view:
1. The leader rebuilds the query pipeline.
2. The pipeline recovers from the last checkpoint.
3. If successful, the state transitions to `ExecutingPipeline` state.

Only paused Materialized Views can be resumed. 

**Example**:
```sql
SYSTEM RESUME MATERIALIZED VIEW tumble_aggr_mv;
```

### Abort Materialized View 

Aborting is similar to pausing, but:
- No checkpoint is triggered.
- The `pause_on_start` setting is not modified in the DDL metadata.

```sql
SYSTEM ABORT MATERIALIZED VIEW <db.mat_view_name>;
```

**Example**:
```sql
SYSTEM ABORT MATERIALIZED VIEW tumble_aggr_mv;
```

### Recover a Materialized View

Used to recover views in the `Error` state. Recovery involves:

1. Re-initializing the query pipeline.
2. Restoring state from the last checkpoint.
3. Transitioning to ExecutingPipeline.

```sql
SYSTEM RECOVER MATERIALIZED VIEW <db.mat_view_name>;
```

**Example**:
```sql
SYSTEM RECOVER MATERIALIZED VIEW tumble_aggr_mv;
```

### Transfer Materialized View Leader

For Materialized Views governed by Raft, you can transfer leadership to another replica. This helps balance workload or mitigate temporary issues.

```sql
SYSTEM TRANSFER LEADER <db.mat_view_name> <mat_view_shard_id> FROM <leader_node> TO <follower_node>;
```

:::info
The shard ID of a Materializzed View is always `1001`. 
:::

Once transferred, the new leader continues execution from the last checkpoint.

**Example**:
```sql
SYSTEM TRANSFER LEADER tumble_aggr_mv 1001 FROM 1 TO 2;
```
