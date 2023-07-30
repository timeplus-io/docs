# Top-N

您可以根据条件在 Timeplus 流或视图中获得最顶部或最底部的事件。

有 3 种类型的 Top-N 查询模式：

1. Top-K：获取字段的最常用值。 例如，每个具有 `action` 字段的事件都可以添加/移除/服务。 您想要检查哪些操作在实时数据中最常见。 为了避免与一般 Top-N 模式混淆，我们称这种模式为 Top-K。
2. Max-K：获取字段的最高值。 例如，每个事件都有一个 `speed_kmh` 字段。 您想要的是速度最快的车。 在某些系统中，这被称为 TopN。 但是我们认为 Max-N 或 Max-K 会更准确。
3. Min-K：获取字段的最底部值。 例如，每个事件都有一个 `speed_kmh` 字段。 您想要的是速度最慢的车。

请继续阅读以获取更详细的解释和示例。

## Top-K

示例查询：

```sql
select top_k(action,3) from bookings where _tp_time > now()-1d
```

结果：

| top_k(action,3)                                                |
| -------------------------------------------------------------- |
| [ [ "add", 86342 ], [ "service", 82013 ], [ "cancel", 4291 ] ] |
| [ [ "add", 86342 ], [ "service", 82013 ], [ "cancel", 4291 ] ] |

此查询列出 `1d`（一天）以来 `预订` 流中最常见的 `操作`。 它还显示该值的出现次数。 例如，“添加” 操作显示 86342 次，“服务” 操作显示 82013 次，依此类推。

如果您不需要出现次数，您可以传递 false 作为 [top_k](functions_for_agg#top_k) 函数的第三个参数，例如：

示例查询：

```sql
select top_k(action,3,false) from bookings where _tp_time > now()-1d
```

结果：

| top_k(action,3)                |
| ------------------------------ |
| [ "add", "service", "cancel" ] |
| [ "add", "service", "cancel" ] |

请注意，这个示例查询是一个 [全球聚合](query-syntax#global)，它每两秒计算并发出结果。 您也可以使用不同的时间窗口来运行聚合，例如：

```sql
select window_start, top_k(action,3) 
from tumble(bookings,1h) 
where _tp_time > now()-1d 
group by window_start
```

## Max-K

在某些系统中，这被称为 TopN。 但是我们认为 Max-N 或 Max-K 会更准确。

示例查询：

```sql
select max_k(speed_kmh,10) from car_live_data
```

结果：

| max_k(speed_kmh,10)                      |
| ------------------------------------------ |
| [ 55, 54, 54, 53, 53, 53, 53, 53, 53, 53 ] |
| [ 55, 55, 55, 55, 54, 54, 54, 54, 54, 54 ] |

在许多情况下，您需要知道具有这种最大值的其他列的值。 您可以在 [max_k](functions_for_agg#max_k) 函数中添加任意数量的列名作为可选参数。

```sql
select max_k(speed_kmh,3,cid,_tp_time) from car_live_data
```

结果：

| max_k(speed_kmh,3,cid,_tp_time)                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------ |
| [ [ 56, "c00002", "2023-07-16T17:25:55.65Z" ], [ 54, "c00128", "2023-07-16T17:25:55.336Z" ], [ 54, "c00075", "2023-07-16T17:25:55.65Z" ] ] |
| [ [ 56, "c00002", "2023-07-16T17:25:55.65Z" ], [ 55, "c00043", "2023-07-16T17:25:58.433Z" ], [ 54, "c00075", "2023-07-16T17:25:55.65Z" ] ] |

## Min-K

与 Max-K 相反。 使用可选的上下文列获取最底端的值。

示例查询:

```sql
select min_k(speed_kmh,10) from car_live_data
```

或者：

```sql
select min_k(speed_kmh,3,cid,_tp_time) from car_live_data
```



## Top-N By Group

No matter top_k, max_k, or min_k, you can also combine them with `partition by` to get the top-N value in a specify group.

Say if there is a `model` attribute for each car data.

This query can get the fastest 3 cars in each model

```sql
select max_k(speed_kmh,3,cid,_tp_time,model) over(partition by model) from car_live_data
```

