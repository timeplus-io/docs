# Query Settings

Timeplus supports some advanced `SETTINGS` to fine tune the streaming query processing behaviors, listed below:

## query_mode

`query_mode=<table|streaming>`. By default, if it's omitted, it's `streaming`. 一种常规设置，用于决定整体查询是流数据处理还是历史数据处理。 This can be overwritten in the port. This can be overwritten in the port. If you use 3128, default is streaming. If you use 8123, default is historical. If you use 8123, default is historical.

## seek_to

`seek_to=<timestamp|earliest|latest>`. By default, if it's omitted, it's `latest`. 设置告诉Timeplus通过时间戳在流存储中查找旧数据。 它可以是相对的时间戳或绝对的时间戳。 By default, it is `latest`, which tells Timeplus to not seek old data. Example:`seek_to='2022-01-12 06:00:00.000'`, ` seek_to='-2h'`, or ` seek_to='earliest'`

:::info

Please note, as of Jan 2023, we no longer recommend you use `SETTINGS seek_to=..`(except for [External Stream](external-stream)). Please use `WHERE _tp_time>='2023-01-01'` or similar. `_tp_time` is the special timestamp column in each raw stream to represent the [event time](eventtime). You can use `>`, `<`, `BETWEEN .. AND` operations to filter the data in Timeplus storage. The only exception is [External Stream](external-stream). If you need to scan all existing data in the Kafka topic, you need to run the SQL with seek_to, e.g. `select raw from my_ext_stream settings seek_to='earliest'`

:::

## enable_backfill_from_historical_store

`enable_backfill_from_historical_store=0|1`. By default, if it's omitted, it's `1`.

- 当它为0时，查询引擎要么从流存储中加载数据，要么从历史存储中加载数据。
- 当它为1时，查询引擎会评估是否需要从历史存储中加载数据（例如时间范围在流式存储空间之外），或者从历史存储中获取数据的效率会更高（例如，count/min/max 是在历史存储中预先计算的，比在流式存储中扫描数据更快）。

## force_backfill_in_order

`force_backfill_in_order=0|1`. By default, if it's omitted, it's `0`.

1. When it's 0, the data from the historical storage are turned without extra sorting. This would improve the performance. This would improve the performance.
2. When it's 1, the data from the historical storage are turned with extra sorting. This would decrease the performance. So turn on this flag carefully. This would decrease the performance. So turn on this flag carefully.

## emit_during_backfill

`emit_during_backfill=0|1`. By default, if it's omitted, it's `0`.

1. When it's 0, the query engine won't emit intermediate aggregation results during the historical data backfill.
2. When it's 1, the query engine will emit intermediate aggregation results during the historical data backfill. This will ignore the `force_backfill_in_order` setting. As long as there are aggregation functions and time window functions(e.g. tumble/hop/session) in the streaming SQL, when the `emit_during_backfill` is on, `force_backfill_in_order` will be applied to 1 automatically.

## recovery_policy

`recovery_policy=<strict|best_effort>`. By default, if it's omitted, it's `strict`. The main use case for materialized views, if new events fail to process, such as converting a string to a int32, the default behavior will make the materialized view unusable. You may monitor the Timeplus logs to act on the dirty data. However, if you set `SETTINGS recovery_policy=best_effort`, then Timeplus will attempt to recover from checkpoint and try up to 3 times, then skip dirty data and continue processing the rest of the data.

## replay_speed

`replay_speed=N` When replay_speed set to 1, it will use the `replay_time_column` (`_tp_append_time` as the default) to replay the historical data. When replay_speed is not set or set to 0, historical data will be replayed as fast as possible. When replay_speed set to 0 to 1, it will replay slower. If it's greater than 1, it will replay faster.

例如

```sql
select * from test_stream where _tp_time > earliest_timestamp()
settings replay_speed=1, replay_time_column='time_col'
```

## replay_time_column

`replay_time_column=columnName` Specify the replay time column, default column is `_tp_append_time`.
