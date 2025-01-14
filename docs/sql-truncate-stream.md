# TRUNCATE STREAM
Run the following SQL to remove the historical data from a stream, keeping the schema and the stream itself.

```sql
TRUNCATE STREAM db.<stream_name>;
```

:::info
This feature is only available in Timeplus Enterprise v2.6.x or above.
:::
