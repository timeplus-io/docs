# DROP STREAM
Run the following SQL to drop a stream or an external stream, with all data in streaming storage and historical storage.

```sql
DROP STREAM [IF EXISTS] db.<stream_name>;
```

Like [CREATE STREAM](/sql-create-stream), stream deletion is an async process.

## force_drop_big_stream
By default, if the total size of the stream is more than 50 GB, the SQL will fail to run. You can edit the config.yml to set a different threshold. You can also add `force_drop_big_stream=true` to the `DROP` command, e.g.

```sql
DROP STREAM <stream_name> SETTINGS force_drop_big_stream=true;
```

:::info
`force_drop_big_stream` is available since Timeplus Enterprise 2.4.17 and Timeplus Proton 1.5.17.
:::
