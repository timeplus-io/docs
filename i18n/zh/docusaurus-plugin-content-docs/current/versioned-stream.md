# 多版本流

当您使用 `versioned_kv` 的模式创建一个流时，流中的数据不再是附加的。 当您直接查询流时，仅显示相同主键的最新版本。 当您在与其他流的 JOIN 中将这个流用作 “右表” 时，Timeplus 会自动选择最接近的版本。

A HOWTO video:

<iframe width="560" height="315" src="https://www.youtube.com/embed/6iplMdHJUMw?si=LGiBkw6QUjq0RGTL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 查询单个流

在此示例中，您在 `versioned_kv` 模式中创建了一个带有以下列的流 `dim_products`：

| 列名         | 数据类型                | 描述                                           |
| ---------- | ------------------- | -------------------------------------------- |
| _tp_time | datetime64(3,'UTC') | 它是为所有在 Timeplus 中的流自动创建的，并且具有毫秒精度和UTC时区的事件时间 |
| 产品名称       | 字符串                 | 产品的唯一 ID，作为主键                                |
| 价格         | float32             | 当前价格                                         |

This stream can be created using UI wizard on Timeplus Cloud or Timeplus Enterprise. You can also create it with SQL in Timeplus Proton:

```sql
CREATE STREAM dim_products(product_id string, price float32) 
PRIMARY KEY (product_id) 
SETTINGS mode='versioned_kv'
```

如果您没有添加任何数据，查询 `SELECT * FROM dim_products` 将不返回任何结果并继续等待新的结果。

现在取消此查询，再向流中添加几行。

```sql
INSERT INTO dim_products(product_id,price) VALUES ('iPhone15',799),('iPhone15_Plus',899);
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
INSERT INTO dim_products(product_id,price) VALUES ('iPhone15',800);
```

Then query `SELECT * FROM dim_products` again will get 2 rows (not 3, because the initial price of "iPhone15" is overwritten).

| 产品名称          | 价格  |
| ------------- | --- |
| iPhone15      | 800 |
| iPhone15_Plus | 899 |

正如您想象的，您可以继续添加新的行。 如果主键是新的，那么您将在查询结果中获得一个新的行。 如果主键已经存在，则前一行将被新添加行中的值覆盖。

:::info

事实上，您可以指定一个表达式作为主键。 例如，您可以使用 `first_name|' '||last_name` 来合并全名作为主键，而不是使用单列。 Or you can create a tuple as compound keys `PRIMARY KEY (first_name,last_name)`

:::

You can also query the stream in the table mode, i.e. `select * from table(dim_products)`

## 在 INNER JOIN 中使用多版本流

在上述示例中，您总是获得具有相同主键的事件的最新版本。 其运行方式与 [变更日志流](changelog-stream) 类似。 这种流模式之所以被称为多版本流，是因为 Timeplus 将跟踪多个版本。 这主要在多版本流充当 JOIN 的 “右表” 时使用。

Imagine you have the other versioned stream for the `orders`:

```sql
CREATE STREAM orders(order_id int8, product_id string, quantity int8)
PRIMARY KEY order_id
SETTINGS mode='versioned_kv';
```

| _tp_time | 订单编号 | 产品名称 | 数量 |
| ---------- | ---- | ---- | -- |
|            |      |      |    |

现在运行流式SQL：

```sql
SELECT orders._tp_time, order_id,product_id,quantity, price*quantity AS revenue
FROM orders JOIN dim_products USING(product_id)
```

然后添加两行：

```sql
INSERT INTO orders(order_id, product_id, quantity) 
VALUES (1, 'iPhone15',1),(2, 'iPhone15_Plus',2);
```



| _tp_time               | 订单编号 | 产品名称          | 数量 |
| ------------------------ | ---- | ------------- | -- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone15      | 1  |
| 2023-04-20T10:01:00.000Z | 2    | iPhone15_Plus | 1  |

在查询控制台中，您将逐一看到这两行：

| _tp_time               | 订单编号 | 产品名称          | 数量 | revenue |
| ------------------------ | ---- | ------------- | -- | ------- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone15      | 1  | 800     |
| 2023-04-20T10:01:00.000Z | 2    | iPhone15_Plus | 1  | 899     |

Then you can change the price of iPhone15 back to 799, by adding a new row in `dim_products`

| 产品名称     | 价格  |
| -------- | --- |
| iPhone15 | 799 |

也在 `订单` 中添加新的一行

| _tp_time               | 订单编号 | 产品名称     | 数量 |
| ------------------------ | ---- | -------- | -- |
| 2023-04-20T11:00:00.000Z | 3    | iPhone15 | 1  |

您将在前一个流式 SQL 中获得第三行：

| _tp_time               | 订单编号 | 产品名称          | 数量 | revenue |
| ------------------------ | ---- | ------------- | -- | ------- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone15      | 1  | 800     |
| 2023-04-20T10:01:00.000Z | 2    | iPhone15_Plus | 1  | 899     |
| 2023-04-20T11:00:00.000Z | 3    | iPhone15      | 1  | 799     |

It shows that the latest price of iPhone15 is applied to the JOIN of new events.

您也可以运行一个流式 SQL `select sum(price) from dim_products`，它应显示1698，因为最新的价格是799和899。

If you add a new row to set iPhone15 to 800, cancel the previous query and run again, you will get 1699.

## Use Versioned Stream in LEFT JOIN

Since Proton 1.5.7, `LEFT JOIN` 2 versioned streams are also supported.

For example, you run a streaming SQL:

```sql
SELECT orders._tp_time, order_id,product_id,
       quantity, price*quantity AS revenue
FROM dim_products LEFT JOIN orders USING(product_id);
```

Then add a new product:

```sql
INSERT INTO dim_products(product_id,price) VALUES ('Vision Pro',3000);
```

Because there is no order for this product, you will get revenue 0 with the `LEFT JOIN` (if you are using `INNER JOIN` or just `JOIN`, this new product won't be counted).

Adding a new order:

```sql
INSERT INTO orders(order_id, product_id, quantity)
VALUES (4, 'Vision Pro',1);
```

The LEFT JOIN SQL will updated the result.

## 在 ASOF JOIN 中使用多版本流

多版本流的最佳部分是在 `ASOF JOIN` 中 Timeplus 能够自动选择最接近的版本。

继续前面的场景。

```sql
SELECT orders._tp_time, order_id,product_id,quantity, price*quantity AS revenue
FROM orders ASOF JOIN dim_products 
ON orders.product_id=dim_products.product_id AND orders._tp_time >= dim_products._tp_time
```

If the current iPhone15 price is 800, and you add a new order for 1 iPhone15, then you will get a transaction amount of 800.

Then you change the iPhone15 price to 799, and add a new order for 1 iPhone15, you will get a transaction amount of 799.

但是，如果您在价格变动之前使用 _tp_time 添加订单，则交易金额将再次变为 800，因为 Timeplus 保留了多个版本的价格，并选择了与订单时间最匹配的旧版本。

:::info

如果你不熟悉 `ASOF JOIN` ，这个特殊的 JOIN 可以提供非精确匹配功能。 如果两个流具有相同的id，但时间戳不完全相同，这也可以很好的运作。

:::



## The advanced keep_versions setting:

In the above example, you can add `settings keep_versions=3` at the end of the query. This will inform the query engine to read the base version from the historical storage for the versioned_kv stream, then read the new events in the streaming storage and based on the ASOF time condition to pick up 3 versions in the memory, and finally join events from left append_stream with the right 3 versions, and find the best candidate to join together.

## Retention Policy

You should not set the TTL(Time-To-Live) for the historical storage of versioned_kv stream. Because only the last version of the same primary key is kept in the historical storage (via an auto-compact background process). Manually set a TTL may remove those events who haven't been updated recently.

You may set a time-based or size-based retention policy for the streaming storage for the versioned_kv stream. But this is optional. By default a 4GB segment file is used for the streaming storage.
