# Non-streaming query

Timeplus also supports pure historical data query processing. There are 2 ways to do it

1. Run historical query to the whole query by setting `query_mode='table'`. This mode is useful if there are multiple tables in the query and users like to do historical data processing as whole in the query.

```sql
SELECT * FROM device_utils SETTINGS query_mode='table';
```



2. Run historical query per table by wrapping table with [table](functions#table) function. This mode is flexible and sometimes required in some scenarios like streaming and dimension table join. 

```sql
SELECT * FROM table(device_utils);
```

Timeplus also supports  PostgresSQL protocols. If users access via these protocols, `table` mode is the default mode. For Clickhouse protocol, one port for streaming query, one port for non-streaming query.

:::danger

Whether to expose PostgresSQL / Clickhouse protocols to the beta users and how to protect it via api-key/password is TBD

:::