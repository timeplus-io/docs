# 查看 & 物化视图

Timeplus 有两种类型的视图：逻辑视图（或普通View）和物化视图（Materialized View）。

## 创建视图

您可以为所有类型的查询创建视图，并在其他查询中引用视图。

- 如果基于串流查询创建视图，您可以将视图视为虚拟流。 例如， `create view view1 as select * from my_stream where c1='a'` 将创建一个视图（就像一个虚拟的数据流）来筛选所有满足 c1='a' 条件的事件。 您可以把这个视图当作另一个流来使用，例如 `select count(*) from tumble(view1,1m) group by window_start` 创建一个视图本身并不会执行查询。 只有当其他查询引用这个视图时才能会展开视图对应的查询。
- 如果视图是使用 [table ()](functions_for_streaming#table) 函数使用有界查询创建的，例如 `以从表中选择 * 的形式创建视图 view2 (my_stream)` 则每次运行 `select count (*) 时从视图2中选择计数 (*)` 将立即返回 my_stream 的当前行号，无需等待将来的事件。

请注意，基于流查询而创建的视图，不能通过 `table(streaming_view)` 将视图转换为历史查询

要创建原版视图，请执行以下操作：

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

## 创建物化视图{#m_view}

物化视图与常规视图之间的区别在于，物化视图在创建后一直在后台运行，由此产生的数据将写入内部存储(即所谓的物化)。

要创建物化视图，请执行以下操作：

```sql
创建物化视图 [如果不存在] <view_name>
AS <SELECT ...>
```

创建物化视图后，Timeplus 将在后台持续运行查询，并根据其底层流选择的语义逐步发出计算结果。

使用物化视图的不同方式：

1. 流模式： `SELECT * FROM materialized_view` 获取结果以备将来的数据。 这与视图的工作方式相同。
2. 历史模式： `SELECT * 从表 (materialized_view)` 获取物化视图的所有过去结果。
3. 历史记录 + 流式模式：`SELECT * FROM materialized_view WHERE _tp_time>='1970-01-01'` 获取所有过去的结果和未来的数据。
4. 预聚合模式： `SELECT * 从表 (materialized_view) 其中 _tp_time in (SELECT max (_tp_time) 作为表 (materialized_view) 中的 m)` 这会立即返回最新的查询结果。 如果 `_tp_time` 在物化视图中不可用，或者最新聚合可以生成具有不同的 `_tp_time`的事件，则可以将 `emit_version ()` 添加到物化视图中，为每个发射分配一个唯一的 ID，并选取最大的 `emit_version () 的事件`。 例如：

   ```sql
   创建物化视图 mv 为
   选择 emit_version () 作为版本，window_start 作为时间，count () 为 n，max (speed_kmh) 作为 h 从 tumble (car_live_data,10s)
   按 window_start，window_end 分组；

   从表 (mv) 中选择 * 其中版本（从表 (mv) 中选择最大（版本））；
   ```

   我们正在考虑提供新的语法来简化这一点。

### 目标流

By default, when you create a materialized view, an internal stream will be created automatically as the data storage. Querying on the materialized view will result in querying the underlying internal stream. 对物化视图进行查询将导致对底层内部流的查询。

指定目标流的用例：

1. In some cases, you may want to build multiple materialized views to write data to the same stream. In this case, each materialized view serves as a real-time data pipeline. 在这种情况下，每个物化视图都充当实时数据管道。
2. 或者你可能需要使用 [Changelog Stream](proton-create-stream#changelog-stream) 或 [Versioned Stream](proton-create-stream#versioned-stream) 来构建查询。
3. 或者，您可能需要为物化视图设置保留策略。
4. 您还可以使用物化视图通过外部流向 Apache Kafka 写入数据。

要使用目标流创建物化视图，请执行以下操作：

```sql
创建物化视图 [如果不存在] <view_name>
INTO <target_stream> AS <SELECT ...>
```

## 拖放视图

运行以下 SQL 来删除视图或物化视图。

```sql
删除视图 [如果存在] 数据库。<view_name>;
```

像 [CREATE STREAM](proton-create-stream)一样，流删除是一个异步过程。

::: Timeplus Cloud 用户须知

在 Timeplus Cloud 或私有云部署中，我们建议您使用 GUI 或 [Terraform Provider](terraform)删除视图，以便更好地跟踪世系和权限。

:::
