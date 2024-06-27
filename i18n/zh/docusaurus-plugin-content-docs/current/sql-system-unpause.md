# SYSTEM UNPAUSE

## SYSTEM UNPAUSE MATERIALIZED VIEW

```sql
SYSTEM UNPAUSE MATERIALIZED VIEW mv
```

Materialized views are long-runing queries. In some cases, you may want to pause the query so that no more data is sent to the downstream. Then unpause the materialized view later. Please avoid restarting the server when the materialized view is paused.
