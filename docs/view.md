# View & Materialized View
Real-time data pipelines are built via [Materialized Views](#m_view) in Timeplus.

There are two types of views in Timeplus: logical view (or just view) and materialized view.

## View

If you have a common query you'll run multiple times a week or month, you can save it as a "Bookmark" in web console. While you can load the bookmarked query in the query editor without typing it again, you can't refer to bookmarked queries in a SQL query. This is where views come in.

### Create or Drop Views

You can create views for all kinds of queries, and refer to the views in other queries. Creating a view won't trigger any query execution. Views are evaluated only when other queries refer to it.

To create a vanilla view:

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

To drop a vanilla view:

```sql
DROP VIEW [IF EXISTS] <view_name>
```

If the view is created based on a streaming query, then you can consider the view as a virtual stream. For example:
```sql
CREATE VIEW view1 AS SELECT * FROM my_stream WHERE c1 = 'a'
```
This will create a virtual stream to filter all events with c1 = 'a'. You can use this view as if it's another stream, e.g.
```sql
SELECT count(*) FROM tumble(view1,1m) GROUP BY window_start
```

A view could be a bounded stream if the view is created with a bounded query using [table](/functions_for_streaming#table) function, e.g.
```sql
CREATE VIEW view2 AS SELECT * FROM table(my_stream)
```
Then each time you run `SELECT count(*) FROM view2` will return the current row number of the my_stream immediately without waiting for the future events.

### Parameterized Views
Starting from Timeplus Enterprise 2.9, you can create views with parameters. For example:
```sql
-- create a parameterized view with one int8 parameter
create view github_param_view as
select * from github_events limit {limit:int8};

-- run a SQL with the view and the parameter value
select * from github_param_view(limit=2);
```

## Materialized view {#m_view}

The difference between a materialized view and a regular view is that the materialized view is running in background after creation and the resulting stream is physically written to internal storage (hence it's called materialized).

Once the materialized view is created, Timeplus will run the query in the background continuously and incrementally emit the calculated results according to the semantics of its underlying streaming select.

### Create a Materialized View

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
[INTO <target>]
AS <SELECT ...>
[SETTINGS ...]
```

It's required to create a materialized view using a streaming select query.

#### Without Target Stream {#mv_internal_storage}
By default, when you create a materialized view without `INTO ..`, an internal stream will be created automatically as the data storage. Querying on the materialized view will result in querying the underlying internal stream.

:::warning
While this approach is easy to use, it's not recommended for production data processing. The internal stream will be created with default settings, lack of optimization for sharding, retention, etc.
:::

#### With Target Stream {#target-stream}

It's recommended to specify a target stream when creating a materialized view, no matter a stream in Timeplus, an external stream to Apache Kafka, Apache Pulsar, or external tables to ClickHouse, S3, Iceberg, etc.

Use cases for specifying a target stream:

1. In some cases, you may want to build multiple materialized views to write data to the same stream. In this case, each materialized view serves as a real-time data pipeline.
2. Or you may need to use [Changelog Stream](/sql-create-stream#changelog-stream), [Versioned Stream](/sql-create-stream#versioned-stream) or [Mutable Stream](/mutable-stream) to build lookups.
3. Or you may want to set the retention policy for the materialized view.
4. You can also use materialized views to write data to downstream systems, such as ClickHouse, Kafka, or Iceberg.

To create a materialized view with the target stream:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
INTO <target_stream> AS <SELECT ...>
```

### Use Materialized Views

There are different ways to use the materialized views in Timeplus:

1. Streaming mode: `SELECT * FROM materialized_view` Get the result for future data. This works in the same way as views.
2. Historical mode: `SELECT * FROM table(materialized_view)` Get all past results for the materialized view.
3. Historical + streaming mode: `SELECT * FROM materialized_view WHERE _tp_time>='1970-01-01'` Get all past results and as well as the future data.
4. Pre-aggregation mode: `SELECT * FROM table(materialized_view) where _tp_time in (SELECT max(_tp_time) as m from table(materialized_view))` This immediately returns the most recent query result. If `_tp_time` is not available in the materialized view, or the latest aggregation can produce events with different `_tp_time`, you can add the `emit_version()` to the materialized view to assign a unique ID for each emit and pick up the events with largest `emit_version()`. For example:

```sql
create materialized view mv as
select emit_version() as version, window_start as time, count() as n, max(speed_kmh) as h from tumble(car_live_data,10s)
group by window_start, window_end;

select * from table(mv) where version in (select max(version) from table(mv));
```

You build data pipelines in Timeplus using materialized views.


### Load Balancing

It's common to define many materialized views in Timeplus for various computation and analysis. Some materialized views can be memory-consuming or cpu-consuming.

In Timeplus Enterprise cluster mode, you can schedule the materialized views in a proper way to ensure each node gets similar workload.

#### Manual Load Balancing {#memory_weight}

Starting from [Timeplus Enterprise v2.3](/enterprise-v2.3), when you create a materialized view with DDL SQL, you can add an optional `memory_weight` setting for those memory-consuming materialized views, e.g.
```sql
CREATE MATERIALIZED VIEW my_mv
SETTINGS memory_weight = 10
AS SELECT ..
```

When `memory_weight` is not set, by default the value is 0. When Timeplus Enterprise server starts, the system will list all materialized views, ordered by the memory weight and view names, and schedule them in the proper node.

For example, in a 3-node cluster, you define 10 materialized views with names: mv1, mv2, .., mv9, mv10. If you create the first 6 materialized views with `SETTINGS memory_weight = 10`, then node1 will run mv1 and mv4; node2 will run mv2 and mv5; node3 will run mv3 and mv6; Other materialized views(mv7 to mv10) will be randomly scheduled on any nodes.

It's recommended that each node in the Timeplus Enterprise cluster shares the same hardware specifications. For those resource-consuming materialized views, it's recommended to set the same `memory_weight`, such as 10, to get the expected behaviors to be dispatched to the proper nodes for load-balancing.

#### Auto Load Balancing {#auto-balancing}

Starting from [Timeplus Enterprise v2.5](/enterprise-v2.5), you can also apply auto-load-balancing for memory-consuming materialized views in Timeplus Enterprise cluster. By default, this feature is enabled and there are 3 settings at the cluster level:

```yaml
workload_rebalance_check_interval: 30s
workload_rebalance_overloaded_memory_util_threshold: 50%
workload_rebalance_heavy_mv_memory_util_threshold: 10%
```

As the administrator, you no longer need to determine which materialized views need to set a `memory_weight` setting. In a cluster, Timeplus will monitor the memory consumption for each materialized view. Every 30 seconds, configurable via `workload_rebalance_check_interval`, the system will check whether there are any node with memory over 50% full. If so, check whether there is any materialized view in such node consuming 10% or more memory. When those conditions are all met, rescheduling those materialized views to less busy nodes. During the rescheduling, the materialized view on the previous node will be paused and its checkpoint will be transferred to the target node, then the materialized view on target node will resume the streaming SQL based on the checkpoint.

### Auto-Scaling Materialized Views {#autoscaling_mv}
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

### Drop Materialized Views

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](/sql-create-stream), stream deletion is an async process.
