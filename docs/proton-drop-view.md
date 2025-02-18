# DROP VIEW

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](/proton-create-stream), stream deletion is an async process.

:::info note for Timeplus Enterprise users

In Timeplus Enterprise deployments, we recommend you to drop views with GUI or [Terraform Provider](/terraform), to better tracking the lineage and permission.

:::
