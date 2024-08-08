# CREATE MUTABLE STREAM

Mutable streams are only available in Timeplus Enterprise. Please check [this page](mutable-stream) for details.

```sql
CREATE MUTABLE STREAM [IF NOT EXISTS] stream_name (
    <col1> <col_type>,
    <col2> <col_type>,
    <col3> <col_type>,
    <col4> <col_type>
    INDEX <index1> (col3)
    FAMILY <family1> (col3,col4)
    )
PRIMARY KEY (col1, col2)
SETTINGS
    logstore_retention_bytes=..,
    logstore_retention_ms=..,
    shards=..
```

Only the `PRIMARY KEY` are required. `INDEX`, `FAMILY`, or the `SETTINGS` are optional.
