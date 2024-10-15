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

## DROP VIEW

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.
