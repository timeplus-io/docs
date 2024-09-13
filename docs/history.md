# Non-streaming query

Timeplus also supports pure historical data query processing. There are 2 ways to do it

1. Run historical query to the whole query by setting `query_mode='table'`. This mode is useful if there are multiple streams in the query and users like to do historical data processing as a whole in the query.

```sql
SELECT * FROM device_utils SETTINGS query_mode='table';
```



2. Run historical query per stream by wrapping stream with [table](/functions_for_streaming#table) function. This mode is flexible and sometimes required in some scenarios like streaming and dimension table join. 

```sql
SELECT * FROM table(device_utils);
```

