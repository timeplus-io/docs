# ALTER VIEW

You can use this SQL to change a view or a materialized view. Today only the settings can be changed. To change the SQL query behinds the view, you have to drop and re-create it.

## MODIFY QUERY SETTING

By default, the checkpoint will be updated every 15 minutes for materialized views. You can change the checkpoint interval without recreating the materialized views.

```sql
ALTER VIEW mv_with_inner_stream MODIFY QUERY SETTING checkpoint_interval=600
```

## RESET QUERY SETTING

By default, the checkpoint will be updated every 15 minutes for materialized views. After you change the interval you can reset it.

```sql
ALTER VIEW mv_with_inner_stream RESET QUERY SETTING checkpoint_interval
```

## See also

* [ALTER STREAM](/sql-alter-stream) - Alter streams
* [CREATE STREAM](/sql-create-stream) - Create streams
* [CREATE MATERIALIZED VIEW](/sql-create-materialized-view) - Create materialized views
* [DROP STREAM](/sql-drop-stream) - Drop streams
* [DROP VIEW](/sql-drop-view) - Drop materialized views
