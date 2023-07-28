# 历史查询

Timeplus还支持纯历史数据查询处理。 有两种方法来做它

1. 为整个查询设置 `query_mode='table'` 。 如果查询中有多个流，并且用户喜欢在查询中作为一个整体进行历史数据处理，则此模式非常有用。

```sql
SELECT * FROM device_utils 设置 TTINGS query_mode='table';
```



2. 使用 [table](functions_for_streaming#table) 函数对每个流运行历史查询。 这种模式比较灵活的，比如在某些情景中，你需要对某个数据集做流式查询，而同时JOIN一个维度表，这个维度表就可以用table(..)方式在固化下来。

```sql
SELECT * FROM table(device_utils)；
```

