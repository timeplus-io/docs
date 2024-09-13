# CREATE MATERIALIZED VIEW
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

## Target Stream

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

## Settings

The following settings are supported when you create a materialized view, with syntax:

```sql
CREATE MATERIALIZED VIEW <view_name>
INTO <target_stream> AS <SELECT ...>
SETTINGS <settings>
```
### pause_on_start
By default, once the materialized view is created, the streaming query will start automatically. If you don't want to start the query immediately, you can set `pause_on_start=true`. The default value is `false`.
