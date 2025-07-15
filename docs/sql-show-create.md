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

## show_multi_versions
Starting from Timeplus Enterprise v2.8.2, you can track the history of the SQL definition via `settings show_multi_versions=true`.

For example:
```sql
show create github_events settings show_multi_versions=true
```

The output includes the following columns:
* statement
* version
* last_modified
* last_modified_by
* created
* created_by
* uuid
