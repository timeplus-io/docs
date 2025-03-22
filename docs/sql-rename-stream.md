# RENAME STREAM

You can rename a stream using the `RENAME STREAM` statement.

Syntax:

```sql
RENAME STREAM [db.]<stream_name> TO [db.]<new_stream_name>
```

Make sure the new stream name is unique within the database. You cannot rename a stream when the stream is being used by any active queries or when the stream is part of a view or materialized view.

Renaming a stream cannot change the database it belongs to.
