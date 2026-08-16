# ALTER VIEW

You can use this SQL to change a materialized view. You can adjust query settings or update the underlying query without dropping and recreating the object, as long as the output schema stays compatible. Note `MODIFY QUERY`, `MODIFY QUERY SETTING` and `RESET QUERY SETTING` only apply to materialized views; plain views only support comment changes.

## MODIFY QUERY

Update the underlying query definition for a materialized view without dropping it. Keep the result schema backward compatible (column order and types) to avoid query breakage.

```sql
ALTER VIEW <view_name> MODIFY QUERY <new_select_query>
```

**Examples:**

- Add/Update expression to an existing ETL materialized view:

```sql
--- update res: `a + b` -> `a - b`
ALTER VIEW test_mv MODIFY QUERY SELECT a - b AS res FROM source_stream;

--- add res2: `a - b` (`res2` must be one column of target stream)
ALTER VIEW test_mv MODIFY QUERY SELECT a + b AS res, a - b AS res2 FROM source_stream;
```

- Add/Update aggregates to an existing aggregate materialized view:

```sql
--- add aggregate `sum(a)` as res2 (`res2` must be one column of target stream)
ALTER VIEW test_mv MODIFY QUERY
SELECT count() AS res, sum(a) AS res2 FROM source_stream EMIT ON UPDATE;

--- remove aggregate `sum(a)` (UNSUPPORTED)
ALTER VIEW test_mv MODIFY QUERY
SELECT count() AS res FROM source_stream EMIT ON UPDATE;

--- replace aggregate `sum(a)` with `sum(b)`
--- TRICK: rename `sum(a) as res2` as unknown name `sum(a) as deleted` since removing state is not supported, then add aggregate `sum(b) as res2`
ALTER VIEW test_mv MODIFY QUERY
SELECT count() AS res, sum(a) AS deleted, sum(b) AS res2 FROM source_stream EMIT ON UPDATE;
```

## MODIFY QUERY SETTING

By default, the checkpoint interval for materialized views is chosen dynamically: every 5 seconds for lightweight state, every 60 seconds for normal state, and up to every 15 minutes for heavy state (over 500 MB). You can change the checkpoint interval without recreating the materialized views.

```sql
ALTER VIEW mv_with_inner_stream MODIFY QUERY SETTING checkpoint_interval=600
```

## RESET QUERY SETTING

After you change the checkpoint interval, you can reset it to the default behavior.

```sql
ALTER VIEW mv_with_inner_stream RESET QUERY SETTING checkpoint_interval
```

## See also

* [ALTER STREAM](/sql-alter-stream) - Alter streams
* [CREATE STREAM](/sql-create-stream) - Create streams
* [CREATE MATERIALIZED VIEW](/sql-create-materialized-view) - Create materialized views
* [DROP STREAM](/sql-drop-stream) - Drop streams
* [DROP VIEW](/sql-drop-view) - Drop materialized views
