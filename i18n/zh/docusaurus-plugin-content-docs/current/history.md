# 历史查询

Timeplus还支持纯历史数据查询处理。 有两种方法来做它

1. 为整个查询设置 `query_mode='table'` 。 This mode is useful if there are multiple streams in the query and users like to do historical data processing as a whole in the query.

```sql
SELECT * FROM device_utils 设置 TTINGS query_mode='table';
```



2. 使用 [table](functions#table) 函数来把每个stream临时当作表格来进行历史查询。 这种模式比较灵活的，比如在某些情景中，你需要对某个数据集做流式查询，而同时JOIN一个维度表，这个维度表就可以用table(..)方式在固化下来。

```sql
SELECT * FROM table(device_utils)；
```

