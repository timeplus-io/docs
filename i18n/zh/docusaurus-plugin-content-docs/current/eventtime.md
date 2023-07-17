# _tp_time (Event time)

## 所有流数据都应有事件时间

Streams are where data live and each data contains a `_tp_time` column as the event time. Timeplus takes this attribute as one important identity of an event.

事件时间用来确定事件发生的时间，例如一个人生日。  It can be the exact timestamp when the order is placed, when the user logins a system, when an error occurs, or when an IoT device reports its status. If there is no suitable timestamp attribute in the event, Timeplus will generate the event time based on the data ingestion time.

By default, the `_tp_time` column is in `datetime64(3, 'UTC')` type with millisecond precision. You can also create it it in `datetime` type with second precision.

## 为什么事件时间受到不同的处理

事件时间几乎在任何地方在 Timeplus 数据处理和分析工作流程中使用：

* 在执行基于时间窗口的聚合时， 例如 [tumble](functions#tumble) 或 [hop](functions#hop) 以获取每次窗口中的下载数据或外部数据， Timeplus将使用事件时间来决定某些事件是否属于特定窗口
* 在这种具有时间敏感性的分析中，事件时间也用来识别不合顺序的事件或较晚的事件， 并丢弃它们以便及时获得串流洞察力。
* when one data stream is joined with the other, event time is the key to collate the data, without expecting two events to happen in  exactly the same millisecond.
* 事件时间也发挥重要作用来设备数据在流中保存的时间

## 如何指定事件时间

### 在数据摄取过程中指定

当你 [摄取数据](ingestion) 到 Timeplus 时，你可以在数据中指定一个属性来最能代表事件时间。 Even if the attribute is in `String` type, Timeplus will automatically convert it to a timestamp for further processing.

如果您不在向导中选择属性，则Timeplus将使用摄取时间来显示事件时间。 当Timeplus接收数据时。 这可能对大多数静态或维数据很有用，例如带有邮政编码的城市名称。

### 在查询时指定

[tumble](functions#tumble) 或 [hop](functions#hop) 窗口函数将可选参数作为事件时间列。 默认情况下，我们将使用每个数据中的事件时间。 然而，您也可以指定一个不同的列作为事件时间。

举出租车乘客为例。 数据流可以是

| 车号   | 用户ID | 旅行开始                | trip_end            | 费用 |
| ---- | ---- | ------------------- | ------------------- | -- |
| c001 | u001 | 2022-03-01 10:00:00 | 2022-03-01 10:30:00 | 45 |

数据可能来自Kafka专题。 配置完成后，我们可以将 `trip_end` 设置为 (默认) 事件时间。 所以，如果我们想要在每个小时内找出多少乘客，我们就可以这样运行查询

```sql
select count(*) from tumble(taxi_data,1h) group by window_end
```

此查询使用 `trip_start` ，默认事件时间来运行聚合。 如果旅客在午夜时00时01分结束行程，则行程将包括在00时00分-00时59时窗内。

在某些情况下，你作为分析员可能想要集中注意乘客乘坐出租车的人数。 而不是每小时离开出租车， 然后您可以设置 `trip_end` 作为查询的事件时间，通过 `tumblet(taxi_data,trip_end,1h)`

完整查询：

```sql
select count(*) from tumble(taxi_data,trip_end,1h) group by window_end
```

