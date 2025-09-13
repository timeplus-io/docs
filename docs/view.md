# View

## Overview

Like in regular database, Timeplus View is a logical definition of a virtual table which doesn't store any data by itself nor itself runs. It gets bounded to a SQL statement and serves as a reusable component that other views or queries or Materialized Views can use. 

## Create or Drop Views

To create a view:

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

To drop a view:

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

## Parameterized View

Starting from Timeplus Enterprise 2.9, you can create views with parameters. For example:
```sql
-- create a parameterized view with one int8 parameter
create view github_param_view as
select * from github_events limit {limit:int8};

-- run a SQL with the view and the parameter value
select * from github_param_view(limit=2);
```
