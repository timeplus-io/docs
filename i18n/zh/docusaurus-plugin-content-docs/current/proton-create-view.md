# View Management

Timeplus 有两种类型的视图：逻辑视图（或普通View）和物化视图（Materialized View）。

## CREATE VIEW

您可以为所有类型的查询创建视图，并在其他查询中引用视图。

* 如果基于串流查询创建视图，您可以将视图视为虚拟流。 例如， `create view view1 as select * from my_stream where c1='a'` 将创建一个视图（就像一个虚拟的数据流）来筛选所有满足 c1='a' 条件的事件。 您可以把这个视图当作另一个流来使用，例如 `select count(*) from tumble(view1,1m) group by window_start` 创建一个视图本身并不会执行查询。 只有当其他查询引用这个视图时才能会展开视图对应的查询。
* 如果使用 [table()](functions_for_streaming#table) 函数用有边界的查询创建视图，视图可以是一个有边界的流，例如：`create view view2 as select * from table(my_stream)` 然后每次运行 `select count(*) from view2` 将立即返回my_stream的当前行数，而不必等待将来的事件。

请注意，基于流查询而创建的视图，不能通过 `table(streaming_view)` 将视图转换为历史查询

To create a vanilla view:

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

## CREATE MATERIALIZED VIEW{#m_view}

物化视图与常规视图之间的区别在于，物化视图在创建后一直在后台运行，由此产生的数据将写入内部存储(即所谓的物化)。

To create a materialized view:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name> 
AS <SELECT ...>
```

创建物化视图后， Timeplus 在后台持续运行查询，并增量的计算结果写入存储。  每行都有一个 `__tp_version` 的时间戳版本。

使用物化视图的不同方式：

1. 流式查询：`SELECT * FROM materialized_view` 获取未来数据的结果。 这与视图的工作方式相同。
2. 历史模式：`SELECT * FROM table(materialized_view)` 获取所有过去的结果用于物化视图。
3. 历史记录 + 流式模式：`SELECT * FROM materialized_view WHERE _tp_time>='1970-01-01'` 获取所有过去的结果和未来的数据。
4. 预聚合模式：`SELECT * FROM table(materialized_view) where __tp_version in (SELECT max(__tp_version) as m from table(materialized_view))` 这立即返回最近的查询结果。 我们将提供新的语法来简化它。

### Target Stream

By default, when you create a materialized view, an internal stream will be created automatically as the data storage. Querying on the materialized view will result in querying the underlying internal stream.

In some cases, you may want to build multiple materialized views to write data to the same stream. In this case, each materialized view serves as a real-time data pipeline.

You can also use materialized views to write data to Apache Kafka with an external stream.

To create a materialized view with the target stream:

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] <view_name>
INTO <target_stream> AS <SELECT ...>
```

## DROP VIEW

Run the following SQL to drop a view or a materialized view.

```sql
DROP VIEW [IF EXISTS] db.<view_name>;
```

Like [CREATE STREAM](proton-create-stream), stream deletion is an async process.

:::info note for Timeplus Cloud users

In Timeplus Cloud or Private Cloud deployments, we recommend you to drop views with GUI or [Terraform Provider](terraform), to better tracking the lineage and permission.

:::
