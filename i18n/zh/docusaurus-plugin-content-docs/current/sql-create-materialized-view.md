# CREATE MATERIALIZED VIEW

物化视图与常规视图之间的区别在于，物化视图在创建后一直在后台运行，由此产生的数据将写入内部存储(即所谓的物化)。

要创建物化视图，请执行以下操作：

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
AS <SELECT ...>
```

创建物化视图后，Timeplus 将在后台持续运行查询，并根据其底层流选择的语义逐步发出计算结果。

使用物化视图的不同方式：

1. Streaming mode: `SELECT * FROM materialized_view` Get the result for future data. 这与视图的工作方式相同。
2. Historical mode: `SELECT * FROM table(materialized_view)` Get all past results for the materialized view.
3. Historical + streaming mode: `SELECT * FROM materialized_view WHERE _tp_time>='1970-01-01'` Get all past results and as well as the future data.
4. Pre-aggregation mode: `SELECT * FROM table(materialized_view) where _tp_time in (SELECT max(_tp_time) as m from table(materialized_view))` This immediately returns the most recent query result. If `_tp_time` is not available in the materialized view, or the latest aggregation can produce events with different `_tp_time`, you can add the `emit_version()` to the materialized view to assign a unique ID for each emit and pick up the events with largest `emit_version()`. 例如：

   ```sql
   create materialized view mv as
   select emit_version() as version, window_start as time, count() as n, max(speed_kmh) as h from tumble(car_live_data,10s)
   group by window_start, window_end;

   select * from table(mv) where version in (select max(version) from table(mv));
   ```

   我们正在考虑提供新的语法来简化这一点。

## 目标流

By default, when you create a materialized view, an internal stream will be created automatically as the data storage. Querying on the materialized view will result in querying the underlying internal stream. 对物化视图进行查询将导致对底层内部流的查询。

指定目标流的用例：

1. In some cases, you may want to build multiple materialized views to write data to the same stream. In this case, each materialized view serves as a real-time data pipeline. 在这种情况下，每个物化视图都充当实时数据管道。
2. Or you may need to use [Changelog Stream](proton-create-stream#changelog-stream) or [Versioned Stream](proton-create-stream#versioned-stream) to build lookups.
3. 或者，您可能需要为物化视图设置保留策略。
4. 您还可以使用物化视图通过外部流向 Apache Kafka 写入数据。

要使用目标流创建物化视图，请执行以下操作：

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
INTO <target_stream> AS <SELECT ...>
```

## Settings

The following settings are supported when you create a materialized view, with syntax:

```sql
CREATE MATERIALIZED VIEW <view_name>
INTO <target_stream> AS <SELECT ...>
SETTINGS <settings>
```

### pause_on_create

By default, once the materialized view is created, the streaming query will start automatically. If you don't want to start the query immediately, you can set `pause_on_create=true`. The default value is `false`.
