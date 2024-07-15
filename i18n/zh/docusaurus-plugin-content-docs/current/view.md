# 视图{#views}

Timeplus 有两种类型的视图：逻辑视图（或普通View）和物化视图（Materialized View）。

## 视图

如果您有一个常见的查询，且您会在一周或一个月运行多次，您可以把它们保存为“书签”。 虽然您可以在查询编辑器中一键加载书签而不用重新输入SQL，但您不能在 SQL 中直接引用书签。 这个时候视图会是更合适的选择。

您可以为所有类型的查询创建视图，并在其他查询中引用视图。

- 如果基于串流查询创建视图，您可以将视图视为虚拟流。 For example, `create view view1 as select * from my_stream where c1 ='a'` will create a virtual stream to filter all events with c1 ='a'. 您可以把这个视图当作另一个流来使用，例如 `select count(*) from tumble(view1,1m) group by window_start` 创建一个视图本身并不会执行查询。 只有当其他查询引用这个视图时才能会展开视图对应的查询。
- 如果视图是使用 [table ()](functions_for_streaming#table) 函数使用有界查询创建的，例如 `以从表中选择 * 的形式创建视图 view2 (my_stream)` 则每次运行 `select count (*) 时从视图2中选择计数 (*)` 将立即返回 my_stream 的当前行号，无需等待将来的事件。

请注意，基于流查询而创建的视图，不能通过 `table(streaming_view)` 将视图转换为历史查询

创建普通视图

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```

删除普通视图

```sql
DROP VIEW [IF EXISTS] <view_name>
```

## 物化视图 Materialized View {#m_view}

物化视图与常规视图之间的区别在于，物化视图在创建后一直在后台运行，由此产生的数据将写入内部存储(即所谓的物化)。

要创建一个实际的视图，请单击“创建视图”页面中的“创建视图”按钮，并开启“物化视图”？ 切换按钮，并指定视图名称和 SQL。

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
