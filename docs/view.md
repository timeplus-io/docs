# View

There are two types of views in Timeplus: logical view (or just view ) and materialized view.

## View

If you have a common query you'll run multiple times a week or month, you can save it as a "Bookmark" in web console. While you can load the bookmarked query in the query editor without typing it again, you can't refer to bookmarked queries in a SQL query. This is where views come in.

You can create views for all kinds of queries, and refer to the views in other queries.

- If the view is created based on a streaming query, then you can consider the view as a virtual stream. For example, `create view view1 as select * from my_stream where c1 ='a'` will create a virtual stream to filter all events with c1 ='a'. You can use this view as if it's another stream, e.g. `select count(*) from tumble(view1,1m) group by window_start` Creating a view won't trigger any query execution. Views are evaluated only when other queries refer to it.
- a view could be a bounded stream if the view is created with a bounded query using [table()](/functions_for_streaming#table) function, e.g. `create view view2 as select * from table(my_stream)` then each time you run `select count(*) from view2` will return the current row number of the my_stream immediately without waiting for the future events.

Please note, once the view is created based on a streaming query, you cannot turn it to a bounded stream via `table(streaming_view)`

To create a vanilla view

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

To delete a vanilla view

```sql
DROP VIEW [IF EXISTS] <view_name>
```

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

To create a materialized view, click the 'Create View' button in the VIEWS page, and turn on the 'Materialized view?' toggle button, and specify the view name and SQL.

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
