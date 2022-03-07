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



## Materialized view

A materialized view is a view. The only difference is that the materialized view is running in background after creation and the result stream is physically written to internal storage , which is why it is called materialized.

To create a materialized streaming view, user can use this SQL spec

```sql
CREATE MATERIALIZED VIEW [IF NOT EIXSTS] <streaming_view_name> AS 
<select .. >
SETTINGS key1=value1, key2=value2, ...
```

Once the streaming view is created, internally Timeplus run the query in background continuously and incrementally and emit the calculated results according to the semantics of its underlying streaming select. The results will be materialized into 2 places

1. An in-memory table
2. An internal physical table

```
                                 ------>  In-memory table 
                                /
Underlying streaming SELECT -> |
                                \
                                 ------> Internal physical table
```

The materialized data gets stored in in-memory table and internal physical depends on the underlying streaming select query:

1. If the underlying streaming SELECT is a global aggregation, Timeplus does
   1. Only store the latest results of the underlying query to the in-memory table and there is a timestamp version `__tp_version` to every row. 
   2. Always appends the results of the underlying query to the internal physical table and there is a `__tp_version` is attached to every row.

2. If the underlying streaming SELECT is a windowed aggregation or a flat transformation like tail, Timeplus does
   1. Append the latest results of the underlying query to the in-memory table until a configured memory limit (by default 100 MB) or block count limit (100 blocks) has reached. If a limit has reached, Timeplus will roll out old results.
   2. Always appends the results of the underlying query to the internal physical table

There are 2 modes to query streaming view

1. Streaming mode: like `SELECT * FROM streaming_view`. In this mode, the query is against the underlying inner physical table.
2. Historical mode: like `SELECT * FROM table(streaming_view)`. In this mode, the query is against the in-memory table and it always returns the latest table of data. 

**Note** Users have a chance to tune the in-memory table size by setting up the following 2 settings

1. `max_streaming_view_cached_block_count`: By default it is 100 blocks
2. `max_streaming_view_cached_block_bytes`: By default it is 100 MB

**Note** For now, Timeplus doesn't implement checkpoint yet, so materialized streaming view may miss new updates / data across system reboot or process crashes etc.
The in-memory data will be discarded as well and will not be replayed across system reboot or process crashes.

Examples

```sql
CREATE MATERIALIZED VIEW count_sv AS 
SELECT device, count(*) FROM device_utils GROUP BY device 
SETTINGS max_streaming_view_cached_block_count=1000,  max_streaming_view_cached_block_bytes=10000000;
```

And query the latest results

```sql
SELECT * FROM table(count_cv);
```

User can do further streaming processing or create streaming views on top of existing streaming query (Streaming processing cascading / fanout) by querying
the existing streaming view in the streaming mode.

```sql
SELECT count(*) FROM count_cv;
```

To delete a streaming view, users can run the following SQL. Dropping the streaming view drops everything including the inner physical table.

```sql
DROP VIEW [IF EXISTS] <streaming_view_name>;
```

