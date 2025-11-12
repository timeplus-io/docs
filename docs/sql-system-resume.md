# SYSTEM RESUME

## SYSTEM RESUME MATERIALIZED VIEW

```sql
SYSTEM RESUME MATERIALIZED VIEW mv
```

Materialized views are long-running queries. In some cases, you may want to pause the query so that no more data is sent to the downstream. Then resume the materialized view later. Please avoid restarting the server when the materialized view is paused.

This command is only available in Timeplus Enterprise v2.7.0 or above. In earlier versions, you can use `SYSTEM UNPAUSE MATERIALIZED VIEW` to resume the materialized view.

## SYSTEM RESUME TASK

```sql
SYSTEM RESUME TASK task;
```
