# SHOW CREATE
## Show Details For A Stream

```sql
SHOW CREATE stream_name
```
or
```sql
SHOW CREATE STREAM stream_name
```
## Show Details For A Schema

```sql
SHOW CREATE FORMAT SCHEMA schema_name
```

## Show Details For A UDF

```sql
SHOW CREATE FUNCTION func_name
```

## Show Details For An Alert

```sql
SHOW CREATE ALERT [database.]alert_name
```

If you add `SETTINGS show_multi_versions=true`, it will list earlier versions.
