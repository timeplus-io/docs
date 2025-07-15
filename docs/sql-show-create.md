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

## show_uuid
Starting from Timeplus Enterprise v2.7, you can show the uuid of the SQL object to map the name with folder name in file systems via `settings show_uuid=true`.

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

## verbose
Starting from Timeplus Enterprise v2.9, you can use `settings verbose=true` to show extra information for materialized views.

For example:
```sql
show create github_events settings show_multi_versions=true
```
Besides the `statement` column, there is also a `placements` column with content like
```json
{
	"1": [
		{
			"replica": 1,
			"shard": 0
		}
	],
	"2": [
		{
			"replica": 0,
			"shard": 0
		}
	],
	"3": [
		{
			"replica": 2,
			"shard": 0
		}
	]
}
```
