# ALTER VIEW

You can use this SQL to change a view or a materialized view. You can adjust query settings or update the underlying query without dropping and recreating the object, as long as the output schema stays compatible.

## MODIFY QUERY SETTING

By default, the checkpoint will be updated every 15 minutes for materialized views. You can change the checkpoint interval without recreating the materialized views.

```sql
ALTER VIEW mv_with_inner_stream MODIFY QUERY SETTING checkpoint_interval=600
```

## MODIFY QUERY

Update the underlying query definition for a view or materialized view without dropping it. Keep the result schema backward compatible (column order and types) to avoid query breakage. For materialized views, see [Alter Materialized View Query](/materialized-view#alter-materialized-view-query) for more guidance on stateful changes.

```sql
ALTER VIEW <view_name> MODIFY QUERY
SELECT
	<columns>
FROM
	<source>
[WHERE <conditions>]
[GROUP BY <columns>]
```

**Example:**
```sql
-- Update view logic while keeping the same output columns
ALTER VIEW user_active_v MODIFY QUERY
SELECT user_id, status = 'active' AS is_active
FROM users
WHERE deleted_at IS NULL;
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
