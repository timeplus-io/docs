# Query Settings

Timeplus supports some advanced `SETTINGS` to fine tune the streaming query processing behaviors, listed below:

## query_mode

`query_mode=<table|streaming>`. By default, if it's omitted, it's `streaming`. A general setting which decides if the overall query is streaming data processing or historical data processing. This can be overwritten in the port. If you use 3218, default is streaming. If you use 8123, default is historical.

## seek_to

`seek_to=<timestamp|earliest|latest>` sets a streaming read's starting position. It can be a relative timestamp or an absolute timestamp. An append stream defaults to `latest` when no starting position or time predicate is given. A keyed stream can load an initial snapshot to construct its current state. Example:`seek_to='2022-01-12 06:00:00.000'`, ` seek_to='-2h'`, or ` seek_to='earliest'`

:::info

Use `WHERE _tp_time>='2023-01-01'` or similar to filter by event time. `_tp_time` is the special timestamp column in each raw stream to represent the [event time](/glossary#event_time). You can use `>`, `<`, and `BETWEEN .. AND` to filter the data in Timeplus storage. To start at the earliest retained offset in a Kafka [external stream](/external-stream), use `seek_to='earliest'`, e.g. `select raw from my_ext_stream settings seek_to='earliest'`.

:::

## enable_backfill_from_historical_store

`enable_backfill_from_historical_store=0|1`. By default, if it's omitted, it's `1`.

- When enabled, eligible native streaming queries can backfill from historical storage at startup and fill gaps encountered later in the streaming log.
- When disabled, the streaming read relies on the streaming store. The amount of data it can read depends on log retention.
- Some reads require the streaming store, such as explicit sequence-number seeks, paced replay, and queries that request streaming-only virtual columns. See [Backfill and continue streaming](/streaming-query#backfill-and-continue-streaming).

## force_backfill_in_order

`force_backfill_in_order=0|1`. By default, if it's omitted, it's `0`.

1. When it's 0, no extra sorting is requested by this setting.
2. When it's 1, historical backfill is sorted by ascending `_tp_time` on each native source shard. This can add sorting cost. For window aggregations, this order can differ from the order of the window's timestamp expression.

## emit_during_backfill

`emit_during_backfill=0|1`. By default, if it's omitted, it's `0`.

1. When it's 0, the query engine holds back normal event-time watermark emissions during historical backfill.
2. When it's 1, the query engine can emit intermediate results according to the query's `EMIT` policy. For window aggregations such as tumble, hop, and session, Timeplus automatically requests ordered backfill.

## recovery_policy

`recovery_policy=<strict|best_effort>`. By default, if it's omitted, it's `strict`. If new events fail to process, Timeplus retries recovery without skipping them. With `SETTINGS recovery_policy=best_effort`, Timeplus can skip problematic events for recognized parsing errors when it knows the affected source offsets. See [materialized view recovery settings](/materialized-view#recovery_policy).

## replay_speed

You can replay historical data with `replay_speed` setting via a streaming SQL query. The syntax is:

```sql
select * from test_stream where _tp_time > earliest_timestamp()
settings replay_speed=1, replay_time_column='time_col'
```

When `replay_speed` set to 1, it will use the `replay_time_column` (`_tp_append_time` as the default) to replay the historical data. When `replay_speed` is not set or set to 0, historical data will be replayed as fast as possible. When `replay_speed` set to 0 to 1, it will replay slower. If it's greater than 1, it will replay faster.

Starting from [Timeplus Enterprise 2.7](/enterprise-v2.7) and Timeplus Proton 1.6.10, you can replay both normal streams and Kafka external streams.

## replay_time_column

`replay_time_column=columnName` Specify the replay time column, default column is `_tp_append_time`. On Timeplus Enterprise 3.4.1, a replay that relies on this default fails with ``Column `_tp_append_time` not found``, so set the column explicitly, for example `replay_time_column='_tp_time'`.

## replay_start_time
`replay_start_time` is the start time for replaying historical data, inclusive. It's a timestamp string. For example, `replay_start_time='2025-01-01 00:00:00.000'`. This should be equal or greater than `WHERE _tp_time > ..` time rewind condition. It only applies when `replay_speed` is greater than 0; otherwise it is ignored without an error.

## replay_end_time
`replay_end_time` is the end time for replaying historical data, exclusive. It's a timestamp string. For example, `replay_end_time='2025-01-02 00:00:00.000'`. When all data is replayed, the query will end. It only applies when `replay_speed` is greater than 0; otherwise it is ignored without an error.

## default_hash_table

Default value is `memory`. To optimize memory usage for large data streams, you can set `default_hash_table='hybrid'`. This will use both memory and disk to store the hash table. Available since Timeplus Enterprise 2.6.0.

Aggregations using `PARTITION BY` require the memory aggregator.

## default_hash_join

Default value is `memory`. To optimize memory usage for joining large data streams, you can set `default_hash_join='hybrid'`. This will use both memory and disk to store the hash table. Available since Timeplus Enterprise 2.6.0.

## max_hot_keys

The default is `100000`. This setting controls how many hot keys each hybrid hash table keeps in memory before spilling older keys to disk. Use `0` to disable this limit. A large input batch can temporarily exceed the configured number of keys. One query can build multiple tables, for example across shuffle lanes.

## aggregate_state_ttl_sec and join_state_ttl_sec

These settings configure TTL for spilled aggregation and join state, respectively. Both default to `0` (disabled). The TTL uses the wall-clock timestamp written with the spilled entry. RocksDB removes expired entries during compaction. A later event or lookup can miss state that has already been removed.

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

Maximum buffered input data per in-memory stream-to-stream hash join instance. The query fails when an instance reaches this limit. Hybrid joins use spill settings instead.

Example:

```sql
SELECT * FROM tableA
LEFT JOIN tableB ON tableA.id=tableB.id
SETTINGS join_max_buffered_bytes=8589934592;
```

## join_algorithm
Type: string

Default: `hash,direct`

Specifies which [JOIN](/streaming-joins) algorithm is used.

Possible values:
* `default`: Deprecated. Same as `direct,hash`, i.e. try to use direct join and hash join.
* `hash`: Use hash join. The most generic implementation that supports all combinations of kind and strictness and multiple join keys that are combined with OR in the JOIN ON section. When using the hash algorithm, the right part of JOIN is uploaded into RAM.
* `direct`: This algorithm can be applied when the storage for the right table supports key-value requests, such as a [dictionary](/dictionary). The direct algorithm performs a lookup in the right table using rows from the left table as keys. It only supports INNER JOIN and LEFT JOIN.
* `auto`: When set to auto, hash join is tried first, and the algorithm is switched on the fly to another algorithm if the memory limit is violated.

## precise_float_parsing
By default this setting is disabled. Setting this to 1 or `true` to handle precise parsing for float values. For example:
```sql
select to_float32('6.000000000000001e-9')
settings precise_float_parsing=1
```

Please note, enabling this can slow down the query performance to some extent. One of the common use cases is the upstream, such as CDC, shares the precise float numbers as string values in Kafka or Pulsar messages. You can add this setting to the materialized view to parse the float value from string precisely.
