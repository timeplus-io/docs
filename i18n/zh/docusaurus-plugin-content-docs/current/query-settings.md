# 查询设置

Timeplus 支持一些高级 “设置” 来微调流式查询处理行为，如下所示：

## 查询模式

`query_mode=<table|streaming>`。 默认情况下，如果省略它，则为 “直播”。 一种常规设置，用于决定整体查询是流数据处理还是历史数据处理。 这可以在端口中覆盖。 This can be overwritten in the port. If you use 3128, default is streaming. If you use 8123, default is historical. 如果您使用 8123，则默认为历史记录。

## seek_to

`seek_to=<timestamp|earliest|latest>`。 默认情况下，如果省略它，则为 “最新”。 设置告诉Timeplus通过时间戳在流存储中查找旧数据。 它可以是相对的时间戳或绝对的时间戳。 默认情况下，它是 “最新”，它告诉Timeplus不要寻找旧数据。 示例：`seek_to='2022-01-12 06:00:00.000 '`、`seek_to='-2h'或 `seek_to='earliest'\`

:::info

请注意，自 2023 年 1 月起，我们不再建议您使用 `SETTINGS seek_to=...`（[外部流]（外部流）除外）。 请使用 `WHERE _tp_time>='2023-01-01'或类似的。 `_tp_time`是每个原始流中的特殊时间戳列，用于表示 [事件时间]（事件时间）。 你可以使用`\>`、`\<`、`BETWEEN.. 用于过滤 Timeplus 存储空间中的数据的 AND 操作。 唯一的例外是 [外部流]（外部流）。 如果你需要扫描 Kafka 主题中的所有现有数据，你需要使用 seek_to 运行 SQL，例如 `从 my_ext_stream 设置中选择原始数据 seek_to='earliest'`

:::

## 启用历史存储库中的回填功能

`enable_backfill_from_historical_store=0|1`。 默认情况下，如果省略它，则为 `1`。

- 当它为0时，查询引擎要么从流存储中加载数据，要么从历史存储中加载数据。
- 当它为1时，查询引擎会评估是否需要从历史存储中加载数据（例如时间范围在流式存储空间之外），或者从历史存储中获取数据的效率会更高（例如，count/min/max 是在历史存储中预先计算的，比在流式存储中扫描数据更快）。

## 按顺序强制回填

`force_backfill_in_order=0|1`。 默认情况下，如果省略它，则为 `0`。

1. When it's 0, the data from the historical storage are turned without extra sorting. This would improve the performance. 这将提高性能。
2. When it's 1, the data from the historical storage are turned with extra sorting. This would decrease the performance. So turn on this flag carefully. 这会降低性能。 因此，请小心打开这面旗帜。

## 在回填期间发射

`emit_during_backfill=0|1`。 默认情况下，如果省略它，则为 `0`。

1. 当它为 0 时，查询引擎在历史数据回填期间不会发出中间聚合结果。
2. 当它为 1 时，查询引擎将在历史数据回填期间发出中间聚合结果。 这将忽略 force_backfill_in_order 设置。 只要串流 SQL 中有聚合函数和时间窗函数（例如 tumble/hop/session），当 “emit_during_backfill” 开启时，“force_backfill_in_order” 将自动应用于 1。

## 恢复政策

`recovery_policy=<strict|best_effort>`。 默认情况下，如果省略它，则为 “严格”。 物化视图的主要用例是，如果新事件处理失败，例如将字符串转换为 int32，则默认行为将使物化视图不可用。 你可以监视Timeplus日志，对脏数据采取行动。 但是，如果你设置了 “SETTINGS recovery_policy=best_effort”，那么Timeplus将尝试从检查点恢复并尝试最多3次，然后跳过脏数据继续处理其余数据。

## replay_speed

`replay_speed=n` 当 replay_speed 设置为 1 时，它将使用 `replay_time_column`（默认为 `_tp_append_time`）来重播历史数据。 当 replay_speed 未设置或设置为 0 时，将尽可能快地重放历史数据。 当 replay_speed 设置为 0 到 1 时，重播速度会变慢。 如果大于 1，则重播速度会更快。

例如

```sql
从 test_stream 中选择 * 其中 _tp_time > earliest_timestamp ()
设置 replay_speed=1，replay_time_column='time_column='time_column'
```

## replay_time_column

`replay_time_column=columnName` 指定重播时间列，默认列为 `_tp_append_time`。
