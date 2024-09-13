# DROP VIEW

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

Like [CREATE STREAM](/sql-create-stream), stream deletion is an async process.

## force_drop_big_stream
By default, if the total size of the materialized view is more than 50 GB, the SQL will fail to run. You can edit the config.yml to set a different threshold. You can also add `force_drop_big_stream=true` to the `DROP` command, e.g.

```sql
DROP VIEW <stream_name> SETTINGS force_drop_big_stream=true;
```

:::info
`force_drop_big_stream` is available since Timeplus Enterprise 2.4.17 and Timeplus Proton 1.5.17.
:::
