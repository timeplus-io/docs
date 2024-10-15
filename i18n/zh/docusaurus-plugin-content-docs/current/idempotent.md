# Insert Idempotency

Since [Timeplus Enterprise v2.4](/enterprise-v2.4) there are new settings `idempotent_id` and `enable_idempotent_processing`:

- INSERT INTO .. SETTINGS idempotent_id='..' VALUES ..
- 选择... FROM .. SETTINGS enable_idempotent_processing=true

These settings allow you to define a unique ID for each batch INSERT. Sending the data with the same value of idempotent_id won't result in duplicated data in the target stream. You can retry safely with those settings.

Here is an example.

## Create a stream for testing

Let's create a stream with 2 columns:

```sql
CREATE STREAM test_stream(`i` int,  `v` string)
```

This is an append-only stream. You can insert duplicated data, e.g.

```sql
INSERT INTO test43_stream (i, v) VALUES (1, 'a') (1, 'a')
```

## Insert with idempotent_id

Recreate the stream if you have inserted any data. You can run the following SQL multiple times:

```sql
INSERT INTO test_stream (i, v) SETTINGS idempotent_id = 'batch1' VALUES (1, 'a') (2, 'b');
```

Then run

```sql
SELECT count() FROM table(test_stream)
```

You will get 2.

If you remove `SETTINGS idempotent_id = 'batch1'` and run the SQL again, duplicated data will be inserted.

## Streaming SQL with enable_idempotent_processing

When you insert data with `idempotent_id`, querying the stream with `table` function will retrieve the historical data of the stream, without duplication. However if you run:

```sql
SELECT count() FROM test_stream
```

Every time you run the INSERT SQL, no matter with `idempotent_id` or not, a bigger count number will be returned. To enable idempotent processing, set the flag to true in the Streaming SQL, e.g.

```sql
SELECT count() FROM test_stream SETTINGS enable_idempotent_processing=true;
```

With this setting, your Streaming SQL will only emit results when it accepts new data.
