# CREATE MATERIALIZED VIEW
The difference between a materialized view and a regular view is that the materialized view is running in background after creation and the resulting stream is physically written to internal storage (hence it's called materialized).

To create a materialized view:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]<view_name>
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

## Target Stream

By default, when you create a materialized view, an internal stream will be created automatically as the data storage. Querying on the materialized view will result in querying the underlying internal stream.

Use cases for specifying a target stream:

1. In some cases, you may want to build multiple materialized views to write data to the same stream. In this case, each materialized view serves as a real-time data pipeline.
2. Or you may need to use [Changelog Stream](/proton-create-stream#changelog-stream) or [Versioned Stream](/proton-create-stream#versioned-stream) to build lookups.
3. Or you may want to set the retention policy for the materialized view.
4. You can also use materialized views to write data to Apache Kafka with an external stream.

To create a materialized view with the target stream:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]<view_name>
INTO <target_stream> AS <SELECT ...>
```

## Settings

The following settings are supported when you create a materialized view, with syntax:

```sql
CREATE MATERIALIZED VIEW <view_name>
INTO <target_stream> AS <SELECT ...>
SETTINGS <settings>
```
### pause_on_start
By default, once the materialized view is created, the streaming query will start automatically. If you don't want to start the query immediately, you can set `pause_on_start=true`. The default value is `false`.

### memory_weight

Starting from [Timeplus Enterprise v2.3](/enterprise-v2.3), when you create a materialized view with DDL SQL, you can add an optional `memory_weight` setting for those memory-consuming materialized views, e.g.
```sql
CREATE MATERIALIZED VIEW my_mv
SETTINGS memory_weight = 10
AS SELECT ..
```

When `memory_weight` is not set, by default the value is 0. When Timeplus Enterprise server starts, the system will list all materialized views, ordered by the memory weight and view names, and schedule them in the proper node.

For example, in a 3-node cluster, you define 10 materialized views with names: mv1, mv2, .., mv9, mv10. If you create the first 6 materialized views with `SETTINGS memory_weight = 10`, then node1 will run mv1 and mv4; node2 will run mv2 and mv5; node3 will run mv3 and mv6; Other materialized views(mv7 to mv10) will be randomly scheduled on any nodes.

It's recommended that each node in the Timeplus Enterprise cluster shares the same hardware specifications. For those resource-consuming materialized views, it's recommended to set the same `memory_weight`, such as 10, to get the expected behaviors to be dispatched to the proper nodes for load-balancing.

### mv_preferred_exec_node

Starting from [Timeplus Enterprise v2.7.6](/enterprise-v2.7#2_7_6), when you create a materialized view with DDL SQL, you can add an optional `mv_preferred_exec_node` setting to explicitly assign a node to run the materialized view.

```sql
CREATE MATERIALIZED VIEW my_mv
SETTINGS mv_preferred_exec_node=3
AS SELECT ..
```

In most cases, you don't need to specify this setting. Timeplus will automatically select an available node to run the materialized view. It's also recommended to set [memory_weight](#memory_weight) to have the system to automatically choose the appropriate node for load balancing. If you need to fine-tune the load balancing or resource utilization, you can specify this setting. As a result, load balancing or failover won't be available when this is set. You cannot change the value after the materialized view is created, even the node is having issue. In this case, please drop and re-create the materialized view with new node ID.
