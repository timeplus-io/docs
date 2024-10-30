# View & Materialized View

There are two types of views in Timeplus: logical view (or just view ) and materialized view.

## CREATE VIEW

You can create views for all kinds of queries, and refer to the views in other queries.

- If the view is created based on a streaming query, then you can consider the view as a virtual stream. For example, `create view view1 as select * from my_stream where c1 = 'a'` will create a virtual stream to filter all events with c1 = 'a'. You can use this view as if it's another stream, e.g. `select count(*) from tumble(view1,1m) group by window_start` Creating a view won't trigger any query execution. Views are evaluated only when other queries refer to it.
- a view could be a bounded stream if the view is created with a bounded query using [table()](/functions_for_streaming#table) function, e.g. `create view view2 as select * from table(my_stream)` then each time you run `select count(*) from view2` will return the current row number of the my_stream immediately without waiting for the future events.

Please note, once the view is created based on a streaming query, you cannot turn it to a bounded stream via `table(streaming_view)`

To create a vanilla view:

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

## CREATE MATERIALIZED VIEW{#m_view}

The difference between a materialized view and a regular view is that the materialized view is running in background after creation and the resulting stream is physically written to internal storage (hence it's called materialized).

To create a materialized view:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
AS <SELECT ...>
```

Once the materialized view is created, Timeplus will run the query in the background continuously and incrementally emit the calculated results according to the semantics of its underlying streaming select.

Different ways to use the materialized views:

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

   We are considering providing new syntax to simplify this.

### Target Stream

By default, when you create a materialized view, an internal stream will be created automatically as the data storage. Querying on the materialized view will result in querying the underlying internal stream.

Use cases for specifying a target stream:

1. In some cases, you may want to build multiple materialized views to write data to the same stream. In this case, each materialized view serves as a real-time data pipeline.
2. Or you may need to use [Changelog Stream](/proton-create-stream#changelog-stream) or [Versioned Stream](/proton-create-stream#versioned-stream) to build lookups.
3. Or you may want to set the retention policy for the materialized view.
4. You can also use materialized views to write data to Apache Kafka with an external stream.

To create a materialized view with the target stream:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
INTO <target_stream> AS <SELECT ...>
```

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

As the administrator, you no longer need to determine which materialized views need to set a `memory_weight` setting. In a cluster, Timeplus will monitor the memory consumption for each materialized view. Every 30 seconds, configurable via `workload_rebalance_check_interval`, the system will check whether there are any node with memory over 50% full. If so, check whether there is any materialized view in such node consuming 10% or more memory. When those conditions are all met, rescheduling those materialized views to less busy nodes. During the rescheduling, the materialized view on the previous node will be paused and its checkpoint will be transfer to the target node, then the materialized view on target node will resume the streaming SQL based on the checkpoint.

## DROP VIEW

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.
