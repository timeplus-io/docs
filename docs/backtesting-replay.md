# Backtesting and Replay

A common question is how to test a streaming query against data from the past, for example to backtest a trading strategy or to validate an alert rule before it goes live. Some engines let you set the engine clock for this. Timeplus does not need a settable clock, because streaming windows are driven by the event time of the data, not by the clock of the server.

## Event time drives the windows

Each event has an event time in the `_tp_time` column. You can set it from your data when you create the stream:

```sql
CREATE STREAM trades(
  product_id string,
  price float64,
  last_size float64,
  ts datetime64(3, 'UTC'),
  _tp_time datetime64(3, 'UTC') DEFAULT ts
)
```

[Tumble](/tumble-aggregation), [hop](/hop-aggregation) and [session](/session-aggregation) windows, and the watermark that closes them, advance with `_tp_time`. If you load data from last year and run a streaming query from the beginning of the stream, you get the same windows and the same results that the query would have produced live:

```sql
SELECT window_start, product_id, sum(price * last_size) AS traded_value
FROM tumble(trades, 1m)
WHERE _tp_time > earliest_ts()
GROUP BY window_start, product_id
```

## `now()` is the wall clock

`now()` and `now64()` always return the current time of the server. They cannot be set to another time. In a query that you want to backtest, use `_tp_time`, `window_start` or `window_end` where you would otherwise use `now()`. For example, write `tumble(trades, 1m)` and not `tumble(trades, now(), 1m)`, since the latter assigns windows by processing time.

## Replay at a controlled speed

By default, a streaming query that rewinds reads the historical data as fast as possible. To simulate the original pace of the data, use the replay settings:

```sql
SELECT * FROM trades
WHERE _tp_time > earliest_ts()
SETTINGS replay_speed = 1, replay_time_column = '_tp_time'
```

| Setting | Description |
| ------- | ----------- |
| [replay_speed](/query-settings#replay_speed) | `1` replays at the original speed, `10` is ten times faster, a value between 0 and 1 is slower. `0` (default) replays as fast as possible. |
| [replay_time_column](/query-settings#replay_time_column) | The time column that defines the gaps between events. Set it explicitly to `_tp_time` or to your own `datetime` or `datetime64` column. The built-in default is `_tp_append_time`, but on Timeplus Enterprise 3.4.1 a replay that relies on this default fails with ``Column `_tp_append_time` not found``. |
| [replay_start_time](/query-settings#replay_start_time) | Start time of the replay, inclusive. Applies only when `replay_speed` is greater than 0. |
| [replay_end_time](/query-settings#replay_end_time) | End time of the replay, exclusive: an event at exactly this time is not returned. Applies only when `replay_speed` is greater than 0. The query ends when all data is replayed. |

:::warning
`replay_start_time` and `replay_end_time` are ignored without an error when `replay_speed` is `0` (the default). To replay a time range as fast as possible, filter on the time column in the `WHERE` clause instead.
:::

You can replay both normal streams and Kafka external streams.
