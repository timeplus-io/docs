# Query Settings

Timeplus supports some advanced `SETTINGS` to fine tune the streaming query processing behaviors, listed below:

## query_mode

`query_mode=<table|streaming>`. By default, if it's omitted, it's `streaming`. A general setting which decides if the overall query is streaming data processing or historical data processing. This can be overwritten in the port. If you use 3128, default is streaming. If you use 8123, default is historical.

## seek_to

`seek_to=<timestamp|earliest|latest>`. By default, if it's omitted, it's `latest`. A setting which tells Timeplus to seek old data in the streaming storage by timestamp. It can be a relative timestamp or an absolute timestamp. By default, it is `latest`, which tells Timeplus to not seek old data. Example:`seek_to='2022-01-12 06:00:00.000'`, ` seek_to='-2h'`, or ` seek_to='earliest'`

:::info

Please note, as of Jan 2023, we no longer recommend you use `SETTINGS seek_to=..`(except for [External Stream](/external-stream)). Please use `WHERE _tp_time>='2023-01-01'` or similar. `_tp_time` is the special timestamp column in each raw stream to represent the [event time](/glossary#event_time). You can use `>`, `<`, `BETWEEN .. AND` operations to filter the data in Timeplus storage. The only exception is [External Stream](/external-stream). If you need to scan all existing data in the Kafka topic, you need to run the SQL with seek_to, e.g. `select raw from my_ext_stream settings seek_to='earliest'`

:::

## enable_backfill_from_historical_store

`enable_backfill_from_historical_store=0|1`. By default, if it's omitted, it's `1`.

- When it's 0, the query engine either loads data from streaming storage, or from historical storage.
- When it's 1, the query engine evaluates whether it's necessary to load data from historical storage(such as the time range is outside of the streaming storage), or it'll be more efficient to get data from historical storage(for example, count/min/max is pre-computed in historical storage, faster than scanning data in streaming storage).

## force_backfill_in_order

`force_backfill_in_order=0|1`. By default, if it's omitted, it's `0`.

1.  When it's 0, the data from the historical storage are turned without extra sorting. This would improve the performance.
2.  When it's 1, the data from the historical storage are turned with extra sorting. This would decrease the performance. So turn on this flag carefully.

## emit_during_backfill

`emit_during_backfill=0|1`. By default, if it's omitted, it's `0`.

1.  When it's 0, the query engine won't emit intermediate aggregation results during the historical data backfill.
2.  When it's 1, the query engine will emit intermediate aggregation results during the historical data backfill. This will ignore the `force_backfill_in_order` setting. As long as there are aggregation functions and time window functions(e.g. tumble/hop/session) in the streaming SQL, when the `emit_during_backfill` is on, `force_backfill_in_order` will be applied to 1 automatically.

## recovery_policy

`recovery_policy=<strict|best_effort>`. By default, if it's omitted, it's `strict`. The main use case for materialized views, if new events fail to process, such as converting a string to an int32, the default behavior will make the materialized view unusable. You may monitor the Timeplus logs to act on the dirty data. However, if you set `SETTINGS recovery_policy=best_effort`, then Timeplus will attempt to recover from checkpoint and try up to 3 times, then skip dirty data and continue processing the rest of the data.

## replay_speed

You can replay historical data with `replay_speed` setting via a streaming SQL query. The syntax is:

```sql
select * from test_stream where _tp_time > earliest_timestamp()
settings replay_speed=1, replay_time_column='time_col'
```

When `replay_speed` set to 1, it will use the `replay_time_column` (`_tp_append_time` as the default) to replay the historical data. When `replay_speed` is not set or set to 0, historical data will be replayed as fast as possible. When `replay_speed` set to 0 to 1, it will replay slower. If it's greater than 1, it will replay faster.

Starting from [Timeplus Enterprise 2.7](/enterprise-v2.7) and Timeplus Proton 1.6.10, you can replay both normal streams and Kafka external streams.

## replay_time_column

`replay_time_column=columnName` Specify the replay time column, default column is `_tp_append_time`.

## replay_start_time
`replay_start_time` is the start time for replaying historical data. It's a timestamp string. For example, `replay_start_time='2025-01-01 00:00:00.000'`. This should be equal or greater than `WHERE _tp_time > ..` time rewind condition.

## replay_end_time
`replay_end_time` is the end time for replaying historical data. It's a timestamp string. For example, `replay_end_time='2025-01-02 00:00:00.000'`. When all data is replayed, the query will end.

## default_hash_table

Default value is `memory`. To optimize memory usage for large data streams, you can set `default_hash_table='hybrid'`. This will use both memory and disk to store the hash table. Available since Timeplus Enterprise 2.6.0.

## default_hash_join

Default value is `memory`. To optimize memory usage for joining large data streams, you can set `default_hash_join='hybrid'`. This will use both memory and disk to store the hash table. Available since Timeplus Enterprise 2.6.0.

## max_threads
Type: uint64

Default: 0, which means the number of threads for request execution is equal to the number of CPU cores.

## enable_idempotent_processing
Type: bool

Default: false

Whether to enable idempotent processing for the query. If set to true, the query will be processed idempotently. If set to 0, the query will be processed non-idempotently. [Learn more](/idempotent).

## join_max_buffered_bytes
Type: uint64

Default: 524288000 (500MB)

Maximum size of the buffer for streaming join operations. Affects memory usage and performance.

Example:

```sql
SELECT * FROM tableA
LEFT JOIN tableB ON tableA.id=tableB.id
SETTINGS join_max_buffered_bytes=8589934592;
```

## join_algorithm
Type: string

Default: `default`

Specifies which [JOIN](/joins) algorithm is used.

Possible values:
* `default`: Same as `direct`,`parallel_hash`,`hash`, i.e. try to use direct join, parallel hash join, and hash join (in this order).
* `hash`: Use hash join. The most generic implementation that supports all combinations of kind and strictness and multiple join keys that are combined with OR in the JOIN ON section. When using the hash algorithm, the right part of JOIN is uploaded into RAM.
* `direct`: This algorithm can be applied when the storage for the right table supports key-value requests, such as a [dictionary](/sql-create-dictionary). The direct algorithm performs a lookup in the right table using rows from the left table as keys. It only supports INNER JOIN and LEFT JOIN.
* `auto`: When set to auto, hash join is tried first, and the algorithm is switched on the fly to another algorithm if the memory limit is violated.

## precise_float_parsing
By default this setting is disabled. Setting this to 1 or `true` to handle precise parsing for float values. For example:
```sql
select to_float32('6.000000000000001e-9')
settings precise_float_parsing=1
```

Please note, enabling this can slow down the query performance to some extent. One of the common use cases is the upstream, such as CDC, shares the precise float numbers as string values in Kafka or Pulsar messages. You can add this setting to the materialized view to parse the float value from string precisely.
