# Top-N

You can get the top-most or bottom-most events in a Timeplus stream or a view, based on a condition.

There are 3 types of Top-N query patterns:

1. Top-K: to get the most common value for a field. For example, each event with an `action` field, can be add/remove/service. You want to check which actions are most common in the live data. To avoid confusion with the general Top-N patterns, we call this pattern as Top-K.
2. Max-K: to get the top-most value for a field. For example, each event with a `speed_kmh` field. You want to get the cars with top speed. In some systems, this is called TopN. But we think Max-N or Max-K will be more accurate.
3. Min-K: to get the bottom-most value for a field. For example, each event with a `speed_kmh` field. You want to get the cars with slowest speed.

Please read on for more detailed explanations and examples.

## Top-K

Sample query:

```sql
select top_k(action,3) from bookings where _tp_time > now()-1d
```

Result:

| top_k(action,3)                                              |
| ------------------------------------------------------------ |
| [ "add","service","cancel" ] |

This query lists the most common `action` in the `bookings` stream since `1d` (one day) ago. If you need the number of appearance for each value,  you can pass `true` as the 3rd parameter for the [top_k](/functions_for_agg#top_k) function, e.g.

Sample query:

```sql
select top_k(action,3,true) from bookings where _tp_time > now()-1d
```

Result:

| top_k(action,3, true)                |
| ------------------------------ |
| [ [ "add", 86342, 0 ], [ "service", 82013, 0 ], [ "cancel", 4291, 0 ] ] |

Please note, this sample query is a [Global Aggregation](/streaming-aggregations#global), which calculate and emit results every 2 seconds. You can also use various time windows to run the aggregation, e.g.

```sql
select window_start, top_k(action,3)
from tumble(bookings,1h)
where _tp_time > now()-1d
group by window_start
```

## Max-K

In some systems, this is called TopN. But we think Max-N or Max-K will be more accurate.

Sample query:

```sql
select max_k(speed_kmh,10) from car_live_data
```

Result:

| max_k(speed_kmh,10)                        |
| ------------------------------------------ |
| [ 55, 54, 54, 53, 53, 53, 53, 53, 53, 53 ] |
| [ 55, 55, 55, 55, 54, 54, 54, 54, 54, 54 ] |

In many cases, you need to know the value of other columns with such max value. You can add any number of column name as the optional parameters in the [max_k](/functions_for_agg#max_k) function.

```sql
select max_k(speed_kmh,3,cid,_tp_time) from car_live_data
```

Result:

| max_k(speed_kmh,3,cid,_tp_time)                              |
| ------------------------------------------------------------ |
| [ [ 56, "c00002", "2023-07-16T17:25:55.65Z" ], [ 54, "c00128", "2023-07-16T17:25:55.336Z" ], [ 54, "c00075", "2023-07-16T17:25:55.65Z" ] ] |
| [ [ 56, "c00002", "2023-07-16T17:25:55.65Z" ], [ 55, "c00043", "2023-07-16T17:25:58.433Z" ], [ 54, "c00075", "2023-07-16T17:25:55.65Z" ] ] |

## Min-K

The opposite of Max-K. Get the bottom-most value with optional context columns.

Sample queries:

```sql
select min_k(speed_kmh,10) from car_live_data
```

Or:

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
