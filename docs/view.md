# View

Like in regular database, Timeplus View is a logical definition of a virtual table which doesn't store any data by itself nor itself runs. It gets bounded to a SQL statement and serves as a reusable component that other views or queries or [Materialized Views](/materialized-view) can use.

## Create View

To create a view:

```sql
CREATE VIEW [IF NOT EXISTS] <db.view_name> AS <SELECT ...>
```

If the underlying SELECT query is a streaming query, then the view is streaming when you query it, otherwise it is one shot historical query running to end.

## Drop View

To drop a view:

```sql
DROP VIEW [IF EXISTS] <db.view_name>
```

## Parameterized View

Parameterized views allow users to specify placeholds in the view definition and populate the placeholds when you run them.

Example

```sql
-- Create a test stream
CREATE STREAM test(i int);

-- Create a parameterized view with one int8 parameter
CREATE VIEW test_param_view
AS
SELECT * FROM test WHERE i > {range_start:int} AND i < {range_end:int};

-- Query the parameterized view by populating the placeholds
SELECT * FROM test_param_view(range_start=100, range_end=200);
```
