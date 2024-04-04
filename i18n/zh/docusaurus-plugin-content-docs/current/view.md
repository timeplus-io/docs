# 视图{#views}

Timeplus 有两种类型的视图：逻辑视图（或普通View）和物化视图（Materialized View）。

## 视图

如果您有一个常见的查询，且您会在一周或一个月运行多次，您可以把它们保存为“书签”。 虽然您可以在查询编辑器中一键加载书签而不用重新输入SQL，但您不能在 SQL 中直接引用书签。 这个时候视图会是更合适的选择。

您可以为所有类型的查询创建视图，并在其他查询中引用视图。

- 如果基于串流查询创建视图，您可以将视图视为虚拟流。 例如， `create view view1 as select * from my_stream where c1='a'` 将创建一个视图（就像一个虚拟的数据流）来筛选所有满足 c1='a' 条件的事件。 您可以把这个视图当作另一个流来使用，例如 `select count(*) from tumble(view1,1m) group by window_start` 创建一个视图本身并不会执行查询。 只有当其他查询引用这个视图时才能会展开视图对应的查询。
- a view could be a bounded stream if the view is created with a bounded query using [table()](functions_for_streaming#table) function, e.g. `create view view2 as select * from table(my_stream)` then each time you run `select count(*) from view2` will return the current row number of the my_stream immediately without waiting for the future events.

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

Once the materialized view is created, Timeplus will run the query in the background continuously and incrementally emit the calculated results according to the semantics of its underlying streaming select.

使用物化视图的不同方式：

1. Streaming mode: `SELECT * FROM materialized_view` Get the result for future data. 这与视图的工作方式相同。
2. Historical mode: `SELECT * FROM table(materialized_view)` Get all past results for the materialized view.
3. 历史记录 + 流式模式：`SELECT * FROM materialized_view WHERE _tp_time>='1970-01-01'` 获取所有过去的结果和未来的数据。
4. Pre-aggregation mode: `SELECT * FROM table(materialized_view) where _tp_time in (SELECT max(_tp_time) as m from table(materialized_view))` This immediately returns the most recent query result. If `_tp_time` is not available in the materialized view, or the latest aggregation can produce events with different `_tp_time`, you can add the `emit_version()` to the materialized view to assign a unique ID for each emit and pick up the events with largest `emit_version()`. 例如：

   ```sql
   create materialized view mv as
   select emit_version() as version, window_start as time, count() as n, max(speed_kmh) as h from tumble(car_live_data,10s)
   group by window_start, window_end;

   select * from table(mv) where version in (select max(version) from table(mv));
   ```

   We are considering providing new syntax to simplify this.
