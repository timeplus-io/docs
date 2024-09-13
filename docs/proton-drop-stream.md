# DROP STREAM

Run the following SQL to drop a stream, with all data in streaming storage and historical storage.

```sql
DROP STREAM [IF EXISTS] db.<stream_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

:::info note for Timeplus Cloud users

In Timeplus Cloud or Private Cloud deployments, we recommend you to drop streams with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::