# 多版本流

当您使用 `versioned_kv` 的模式创建一个流时，流中的数据不再是附加的。 当您直接查询流时，仅显示相同主键的最新版本。 当您在与其他流的 JOIN 中将这个流用作 “右表” 时，Timeplus 会自动选择最接近的版本。

一段 HOWTO 视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/6iplMdHJUMw?si=LGiBkw6QUjq0RGTL" title="优酷视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 查询单个流

在此示例中，您在 `versioned_kv` 模式中创建了一个带有以下列的流 `dim_products`：

| 列名         | 数据类型                | 描述                                           |
| ---------- | ------------------- | -------------------------------------------- |
| _tp_time | datetime64(3,'UTC') | 它是为所有在 Timeplus 中的流自动创建的，并且具有毫秒精度和UTC时区的事件时间 |
| 产品名称       | 字符串                 | 产品的唯一 ID，作为主键                                |
| 价格         | float32             | 当前价格                                         |

这个直播可以在Timeplus Cloud或Timeplus Enterprise上使用用户界面向导创建。 你也可以在 Timeplus Proton 中使用 SQL 创建它：

```sql
创建 STREAM dim_products（product_id 字符串，价格浮动32） 
主键 (product_id) 
设置模式='versioned_kv'
```

如果您没有添加任何数据，查询 `SELECT * FROM dim_products` 将不返回任何结果并继续等待新的结果。

现在取消此查询，再向流中添加几行。

```sql
在 dim_products（商品编号、价格）中插入值（'iPhone15',799），（'iPhone15_Plus',899）；
```

| 产品名称          | 价格  |
| ------------- | --- |
| iPhone15      | 799 |
| iPhone15_Plus | 899 |

再次运行 `SELECT * FROM dim_products` 将获得这两行。

现在，如果您再添加一行：

| 产品名称     | 价格  |
| -------- | --- |
| iPhone15 | 800 |

```sql
在 dim_products（商品编码、价格）中插入值（'iPhone15',800）；
```

然后再次查询 `SELECT * FROM dim_products` 将获得 2 行（不是 3 行，因为 “iPhone15” 的初始价格已被覆盖）。

| 产品名称          | 价格  |
| ------------- | --- |
| iPhone15      | 800 |
| iPhone15_Plus | 899 |

正如您想象的，您可以继续添加新的行。 如果主键是新的，那么您将在查询结果中获得一个新的行。 如果主键已经存在，则前一行将被新添加行中的值覆盖。

:::info

事实上，您可以指定一个表达式作为主键。 例如，您可以使用 `first_name|' '||last_name` 来合并全名作为主键，而不是使用单列。 或者你可以创建一个元组作为复合键 `PRIMARY KEY (first_name, last_name)`

:::

你也可以在表格模式下查询直播，即 `select * from table (dim_products)`

## 在 INNER JOIN 中使用多版本流

在上述示例中，您总是获得具有相同主键的事件的最新版本。 其运行方式与 [变更日志流](changelog-stream) 类似。 这种流模式之所以被称为多版本流，是因为 Timeplus 将跟踪多个版本。 这主要在多版本流充当 JOIN 的 “右表” 时使用。

想象一下你有 `订单`的另一个版本化直播：

```sql
创建 STREAM 订单（order_id int8、product_id 字符串、数量 int8）
主键 order_id
设置模式='versioned_kv'；
```

| _tp_time | 订单编号 | 产品名称 | 数量 |
| ---------- | ---- | ---- | -- |
|            |      |      |    |

现在运行流式SQL：

```sql
选择订单。_tp_time、订单编号、产品编号、数量、价格*数量作为收入
来自订单加入 dim_products 使用 (product_id)
```

然后添加两行：

```sql
在订单中插入（订单编号、商品编号、数量） 
值 (1, 'iPhone15',1), (2, 'iPhone15_Plus',2)；
```



| _tp_time               | 订单编号 | 产品名称          | 数量 |
| ------------------------ | ---- | ------------- | -- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone15      | 1  |
| 2023-04-20T10:01:00.000Z | 2    | iPhone15_Plus | 1  |

在查询控制台中，您将逐一看到这两行：

| _tp_time               | 订单编号 | 产品名称          | 数量 | 收入  |
| ------------------------ | ---- | ------------- | -- | --- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone15      | 1  | 800 |
| 2023-04-20T10:01:00.000Z | 2    | iPhone15_Plus | 1  | 899 |

然后你可以在 `dim_products`中添加新的一行，将 iPhone15 的价格改回 799 美元

| 产品名称     | 价格  |
| -------- | --- |
| iPhone15 | 799 |

也在 `订单` 中添加新的一行

| _tp_time               | 订单编号 | 产品名称     | 数量 |
| ------------------------ | ---- | -------- | -- |
| 2023-04-20T11:00:00.000Z | 3    | iPhone15 | 1  |

您将在前一个流式 SQL 中获得第三行：

| _tp_time               | 订单编号 | 产品名称          | 数量 | 收入  |
| ------------------------ | ---- | ------------- | -- | --- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone15      | 1  | 800 |
| 2023-04-20T10:01:00.000Z | 2    | iPhone15_Plus | 1  | 899 |
| 2023-04-20T11:00:00.000Z | 3    | iPhone15      | 1  | 799 |

它表明，iPhone15的最新价格适用于新活动的加入。

您也可以运行一个流式 SQL `select sum(price) from dim_products`，它应显示1698，因为最新的价格是799和899。

如果你添加一个新行来将 iPhone15 设置为 800，取消之前的查询然后再次运行，你会得到 1699。

## 在 LEFT JOIN 中使用版本化直播

自 Proton 1.5.7 起，还支持 `LEFT JOIN` 2 版本化直播。

例如，你运行流式 SQL：

```sql
选择订单。_tp_time、order_id、product_id、
       数量、价格*数量作为收入
来自 dim_products 向左加入订单使用 (product_id)；
```

然后添加新产品：

```sql
在 dim_products（产品编号、价格）中插入值（'Vision Pro',3000）；
```

由于此产品没有订单，因此使用 `LEFT JOIN` 将获得0收入（如果您使用的是 `INNER JOIN` 或者只使用 `JOIN`，则此新产品不计算在内）。

添加新订单：

```sql
在订单中插入（订单编号、商品编号、数量）
VALUES (4，'Vision Pro',1)；
```

LEFT JOIN SQL 将更新结果。

## 在 ASOF JOIN 中使用多版本流

多版本流的最佳部分是在 `ASOF JOIN` 中 Timeplus 能够自动选择最接近的版本。

继续前面的场景。

```sql
选择订单。_tp_time、订单编号、产品编号、数量、价格*数量作为收入
来自订单 ASOF 在 orders.products.products.products.products.products.products.products.products 和订单上加入 d 
_tp_time >= dim_products。_tp_time
```

如果当前iPhone15的价格为800美元，并且您添加了购买1部iPhone15的新订单，那么您将获得800美元的交易金额。

然后，你将iPhone15的价格更改为799美元，然后添加1部iPhone15的新订单，你将获得799美元的交易金额。

但是，如果您在价格变动之前使用 _tp_time 添加订单，则交易金额将再次变为 800，因为 Timeplus 保留了多个版本的价格，并选择了与订单时间最匹配的旧版本。

:::info

如果你不熟悉 `ASOF JOIN` ，这个特殊的 JOIN 可以提供非精确匹配功能。 如果两个流具有相同的id，但时间戳不完全相同，这也可以很好的运作。

:::



## 高级 keep_versions 设置：

在上面的示例中，你可以在查询的末尾添加 `设置 keep_versions=3` 。 这将通知查询引擎从 versioned_kv 流的历史存储中读取基础版本，然后读取流存储中的新事件并根据 ASOF 时间条件在内存中获取 3 个版本，最后将左侧的 append_stream 中的事件与右侧的 3 个版本连接起来，并找到最佳的候选人加入。

## 保留政策

您不应为 versioned_kv 流的历史存储设置 TTL（生存时间）。 因为只有同一主键的最后一个版本保存在历史存储中（通过自动压缩后台进程）。 手动设置 TTL 可能会删除最近未更新的那些事件。

您可以为 versioned_kv 流的流存储设置基于时间或大小的保留政策。 但这是可选的。 默认情况下，使用 4GB 的分段文件作为流媒体存储。
