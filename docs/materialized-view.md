# Materialized View {#m_view} 

## Overview

**Materialized View** is a core concept in Timeplus because it brings together nearly all Timeplus features into a single mechanism, enabling users to deliver real-time value from their data.

A Materialized View is always bound to a **streaming query** and runs continuously in the background once created.  It incrementally evaluates the streaming query (with filtering, joins, and/or aggregations), persists (materializes) the query results to a target stream or an external system and optionally, checkpoints query state to durable storage for fault tolerance.  

A Materialized View involves three main components (illustrated in the diagram below):

1. **Streaming Query**  
   - The underlying query that is continuously evaluated.  

2. **Target Stream / System**  
   - The destination where the streaming query results are materialized.  
   - Can be a Timeplus native stream or an external system (Kafka, ClickHouse, S3 etc).  

3. **Checkpoint of Query State**  
   - Stores intermediate state of the query (e.g., for windowed aggregations or joins).  
   - Enables recovery after failure by resuming from the last checkpoint.  

![MatView](/img/mat-view.png)

When a Materialized View checkpoints its query state, it ensures durability and fault tolerance. If the process fails mid-execution, it can **restart from the last checkpoint** without reprocessing the entire stream.  

There are several checkpointing strategies (or "flavors") available. For detailed options and trade-offs, see the [Checkpoint documentation](/checkpoint).

By combining other Timeplus features / components such as:

- [Streaming Joins](/streaming-joins) / [Streaming Aggregations](/streaming-aggregations)
- [Scheduled Tasks](/task)  
- [Native Streams](/working-with-streams)  
- [External Streams](/kafka-sink)  
- [External Tables](/clickhouse-external-table)  

you can build **complex, end-to-end data processing pipelines** with Materialized Views.  

![Pipeline](/img/pipelines.png)

## Create Materialized View

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <db.mat-view-name>
[INTO <db.target-stream-or-table>]
AS 
<SELECT ...>
[SETTINGS 
    checkpoint_settings='<ckpt-settings>', 
    memory_weight=<weight>,
    mv_preferred_exec_node=<node-id>,
    default_hash_table=['memory'|'hybrid'], 
    default_hash_join=['memory'|'hybrid'],
    max_hot_keys=<num-keys>
 ...]
```

Example

```sql
-- Create a source stream
CREATE RANDOM STREAM random_source(i int, s string);

-- Create a target stream to hold the Materialized View results
CREATE STREAM aggr_results(win_start datetime64(3), s string, total int64);

-- Create a Materialized View which calculates the sum for each key `s` in a 2 seconds (tumble) window 
-- When the query results are available (when window closes), it materializes the results to 
-- target `aggr_results` stream 
CREATE MATERIALIZED VIEW tumble_aggr_mv 
INTO aggr_results
AS
SELECT 
    window_start AS win_start,
    s,
    sum(i) AS total
FROM 
    tumble(random_source, 2s)
GROUP BY 
    window_start, s; 

-- Streaming query to continously monitor the results in target stream `aggr_results`
SELECT * FROM aggr_results;
```

:::info
A **Materialized View** is always bound to a **streaming `SELECT` query**.  
If you want to materialize a **historical query** on a schedule, consider using a [Timeplus scheduled task](/task) instead.
:::

### Settings

#### `checkpoint_settings`

`checkpoint_settings` is a **semicolon-separated key/value string** that controls how query states are checkpointed. It supports the following keys:

1. **`type`**  
   - Defines the checkpoint type.  
   - Supported values: `auto` (default), `file`.  
   - In most cases, no explicit configuration is required.

2. **`storage_type`**  
   - Defines where checkpoint data is stored.  
   - Supported values: `auto` (default), `nativelog`, `shared`, `local_file_system`.  
   - Users may fine-tune this for better checkpoint efficiency and performance.

3. **`interval`**  
   - Checkpoint interval in **seconds**.  
   - If not set, Timeplus dynamically adjusts the interval based on Materialized View metrics:  
     - **Light-weight views** → shorter intervals.  
     - **Heavy queries** → longer intervals (to reduce checkpoint workload).  
   - Manual tuning may be useful for balancing performance and efficiency.

4. **`async`**  
   - Determines whether checkpoints are **asynchronous** or **synchronous**.  
   - `true` / `1` (default): Dump state to local disk, then replicate asynchronously across the cluster (minimal pipeline blocking).  
   - `false` / `0`: Replicate state synchronously, which takes longer and blocks the pipeline more.  
   - **Recommendation:** Keep `async` enabled unless you require strict synchronous consistency.

5. **`incremental`**  
   - Controls whether checkpoints are **incremental** or **full**.  
   - Incremental checkpoints only persist updated state.  
   - Supported values:  
     - `true` / `1`: Enable incremental checkpointing.  
     - `false` / `0`: Use full checkpoints.  
   - Timeplus automatically selects incremental checkpointing when **hybrid join/aggregation** is enabled.  
   - Users may disable incremental mode if needed.

6. **`shared_disk`**  
   - When enabled, checkpoints are written to **shared storage** (e.g., S3).  
   - This avoids replication overhead across the cluster and can improve efficiency in large deployments.

#### memory_weight 

#### mv_preferred_exec_node

#### default_hash_table 

#### default_hash_join 


## With or Without Target Stream 

When you create a Materialized View without an explicit target stream or table (without `INTO <db.target-stream-or-table>` clause), Timeplus will create an internal [append stream](/append-stream) to hold the query results. The syntax is simpler and easier for users to do experiement since users don't need create an explicit target stream separately. But it is not recommended running Materialized View like this in production because 

1. It is harder for users to fine tune this internal target stream. For example, fine tuning column compression, sorting keys, skipping indexes, shards, and other storage related settigns are not supported. Fine tuning TTL is supported but more difficult. 
2. Users sometimes may like to choose a different stream type as the target stream, [Mutable stream](/mutable-stream) for instance. User can't fine tune this neither in this mode. 
3. Schema evolution (adding a new column for instance) is much more difficult. 

So for best practice, it is recommended to create an explicit target stream always. 

## Querying Materialized View

When you query a Materialized View like `SELECT * FROM mat_view` this for example, the query is actually proxied to the target stream or table which holds the query results. Depending on if the Materialized View sink is an external table or external stream or native stream, the query to Materialized View can be a streaming query or a historical query

## Load Balancing

It's common to define many materialized views in Timeplus for various computation and analysis. Some materialized views can be memory-consuming or cpu-consuming.

In Timeplus Enterprise cluster mode, you can schedule the materialized views in a proper way to ensure each node gets similar workload.

### Manual Load Balancing {#memory_weight}

Starting from [Timeplus Enterprise v2.3](/enterprise-v2.3), when you create a materialized view with DDL SQL, you can add an optional `memory_weight` setting for those memory-consuming materialized views, e.g.
```sql
CREATE MATERIALIZED VIEW my_mv
SETTINGS memory_weight = 10
AS SELECT ..
```

When `memory_weight` is not set, by default the value is 0. When Timeplus Enterprise server starts, the system will list all materialized views, ordered by the memory weight and view names, and schedule them in the proper node.

For example, in a 3-node cluster, you define 10 materialized views with names: mv1, mv2, .., mv9, mv10. If you create the first 6 materialized views with `SETTINGS memory_weight = 10`, then node1 will run mv1 and mv4; node2 will run mv2 and mv5; node3 will run mv3 and mv6; Other materialized views(mv7 to mv10) will be randomly scheduled on any nodes.

It's recommended that each node in the Timeplus Enterprise cluster shares the same hardware specifications. For those resource-consuming materialized views, it's recommended to set the same `memory_weight`, such as 10, to get the expected behaviors to be dispatched to the proper nodes for load-balancing.

### Auto Load Balancing {#auto-balancing}

Starting from [Timeplus Enterprise v2.5](/enterprise-v2.5), you can also apply auto-load-balancing for memory-consuming materialized views in Timeplus Enterprise cluster. By default, this feature is enabled and there are 3 settings at the cluster level:

```yaml
workload_rebalance_check_interval: 30s
workload_rebalance_overloaded_memory_util_threshold: 50%
workload_rebalance_heavy_mv_memory_util_threshold: 10%
```

As the administrator, you no longer need to determine which materialized views need to set a `memory_weight` setting. In a cluster, Timeplus will monitor the memory consumption for each materialized view. Every 30 seconds, configurable via `workload_rebalance_check_interval`, the system will check whether there are any node with memory over 50% full. If so, check whether there is any materialized view in such node consuming 10% or more memory. When those conditions are all met, rescheduling those materialized views to less busy nodes. During the rescheduling, the materialized view on the previous node will be paused and its checkpoint will be transferred to the target node, then the materialized view on target node will resume the streaming SQL based on the checkpoint.

## Auto-Scaling Materialized Views {#autoscaling_mv}
Starting from [Timeplus Enterprise v2.8](/enterprise-v2.8), materialized views can be configured to run on elastic compute nodes. This can reduce TCO (Total Cost of Ownership), by enabling high concurrent materialized views scheduling, auto scale-out and scale-in according to workload.

To enable this feature, you need to
1. create a S3 disk in the `s3_plain` type.
2. create a materialized view by setting the checkpoint storage to `s3` and use the s3 disk.
3. enable compute nodes in the cluster, with optional autoscaling based on your cloud or on-prem infrastructure.

For example:
```sql
--S3 based checkpoint
CREATE DISK ckpt_s3_disk disk(
    type = 's3_plain',
    endpoint = 'https://mat-view-ckpt.s3.us-west-2.amazonaws.com/matv_ckpt/',
    access_key_id = '...',
    secret_access_key = '...');

CREATE MATERIALIZED VIEW mat_v_scale INTO clickhouse_table
AS SELECT …
SETTINGS
checkpoint_settings=’storage_type=s3;disk_name=ckpt_s3_disk;async=true;interval=5’;
```

## Drop Materialized Views

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](/sql-create-stream), stream deletion is an async process.
