# DROP STREAM

Run the following SQL to drop a stream, with all data in streaming storage and historical storage.

```sql
DROP STREAM [IF EXISTS] db.<stream_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

:::info note for Timeplus Enterprise users

In Timeplus Enterprise deployments, we recommend you to drop streams with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::
