# TRUNCATE STREAM
Run the following SQL to remove the historical data from a stream, keeping the schema and the stream itself.

```sql
TRUNCATE STREAM db.<stream_name>;
```

:::info
This feature is available in Timeplus Enterprise v2.6.x or above, and in Timeplus Proton 3.x.
:::

In Timeplus Proton, `TRUNCATE STREAM` removes the data in the historical store, so `SELECT .. FROM table(stream)` returns no rows afterwards. Data that is still in the streaming store is not removed and can be returned by a streaming query that rewinds, such as `SELECT .. FROM stream WHERE _tp_time > earliest_ts()`, until the retention policy of the streaming store removes it. This is tracked in [proton#115](https://github.com/timeplus-io/proton/issues/115).
