# SYSTEM PAUSE

## SYSTEM PAUSE MATERIALIZED VIEW

```sql
SYSTEM PAUSE MATERIALIZED VIEW <mv> [PERMANENT]
```

Materialized views are long-running queries. In some cases, you may want to pause the query so that no more data is sent to the downstream. You can resume the materialized view later. Note: Without the PERMANENT flag, paused views will automatically resume after a service restart.

`PERMANENT` (Optional) - Keeps the paused state after a service restart; without it, the view resumes automatically on restart.

## SYSTEM PAUSE TASK

```sql
SYSTEM PAUSE TASK task;
```

