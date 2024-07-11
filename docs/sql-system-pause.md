# SYSTEM PAUSE

## SYSTEM PAUSE MATERIALIZED VIEW

```sql
SYSTEM PAUSE MATERIALIZED VIEW mv
```
Materialized views are long-running queries. In some cases, you may want to pause the query so that no more data is sent to the downstream. You can unpause the materialized view later. Please avoid restarting the server when the materialized view is paused.
