# View{#views}

There are two types of views in Timeplus: logical view (or just view ) and materialized view

## View

You may have some common queries to run multiple times a week or month. You can save them in the web UI as "Saved Query". Just like how you add bookmarks for your favorite web sites. You can load the saved query in the query editor without typing it again. However you cannot refer to saved queries in a query. That's when you need to use views.

You can create views for all kinds of queries, and refer to the views in other queries.

* If the view is created based on a streaming query, then you can consider the view as a virtual stream. For example, `create view view1 as select * from my_stream where c1='a'` will create a virtual stream to filter all events with c1='a'. You can use this view as if it's another stream, e.g. `select count(*) from tumble(view1,1m) group by window_start` Creating a view won't trigger any query execution. Views are evaluated only when other queries refer to it.
* a view could be a bounded stream if the view is created with a bounded query using [table()](functions#table) function, e.g. `create view view2 as select * from table(my_stream)` then each time you run `select count(*) from view2` will return the current  row number of the my_stream immediately without waiting for the future events.

Please note, once the view is created based on a streaming query, you cannot turn it to a bounded stream via `table(streaming_view)`

To create a vanilla view

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

To delete a vanilla view

```sql
DROP VIEW [IF EXISTS] <view_name>
```



## Materialized view {#m_view}

A materialized view is a view. The only difference is that the materialized view is running in background after creation and the result stream is physically written to internal storage , which is why it is called materialized.

To create a materialized view, click the 'Create View' button in the VIEWS page, and turn on the 'Materialized view?' toggle button, and specify the view name and SQL.

Once the materialized view is created, internally Timeplus runs the query in background continuously and incrementally and emit the calculated results according to the semantics of its underlying streaming select.  There is a timestamp version `__tp_version` to every row. 

Different ways to use the materialized views:

1. Streaming mode:  `SELECT * FROM materialized_view` Get the result for future data. This works in the same way as views.
2. Historical mode:  `SELECT * FROM table(materialized_view)` Get all past results for the materialized view.
3. Historical + streaming mode: `SELECT * FROM materialized_view SETTINGS seek_to='earliest'` Get all past results and as well as the future data.
4. Pre-aggregation mode: `SELECT * FROM table(materialized_view) where __tp_version in (SELECT max(__tp_version) as m from table(materialized_view))` This immediately returns the most recent query result. We will provide new syntax to simplify this.
