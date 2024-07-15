# 创建视图

Timeplus 有两种类型的视图：逻辑视图（或普通View）和物化视图（Materialized View）。

您可以为所有类型的查询创建视图，并在其他查询中引用视图。

- 如果基于串流查询创建视图，您可以将视图视为虚拟流。 For example, `create view view1 as select * from my_stream where c1 ='a'` will create a virtual stream to filter all events with c1 = 'a'. You can use this view as if it's another stream, e.g. `select count(*) from tumble(view1,1m) group by window_start` Creating a view won't trigger any query execution. 只有当其他查询引用这个视图时才能会展开视图对应的查询。
- a view could be a bounded stream if the view is created with a bounded query using [table()](functions_for_streaming#table) function, e.g. `create view view2 as select * from table(my_stream)` then each time you run `select count(*) from view2` will return the current row number of the my_stream immediately without waiting for the future events.

Please note, once the view is created based on a streaming query, you cannot turn it to a bounded stream via `table(streaming_view)`

要创建原版视图，请执行以下操作：

```sql
CREATE VIEW [IF NOT EXISTS] <view_name> AS <SELECT ...>
```
