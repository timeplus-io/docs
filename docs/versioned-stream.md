# Versioned Stream

When you create a stream with the mode `versioned_kv`, the data in the stream is no longer append-only. When you query the stream with `table` function, only the latest version for the same primary key(s) will be shown. When you use this stream as "right-table" in a streaming JOIN with other streams, Timeplus Proton will automatically choose the closest version.

Here are some examples:

## Query Single Stream

In this example, you create a stream `dim_products` in `versioned_kv` mode with the following columns:

| Column Name | Date Type           | Description                                                  |
| ----------- | ------------------- | ------------------------------------------------------------ |
| _tp_time    | datetime64(3,'UTC') | this is automatically created for all streams in Timeplus, with the event time at millisecond precision and UTC timezone |
| product_id  | string              | unique id for the product, as the primary key                |
| price       | float               | current price                                                |

If you don't add any data, query `SELECT * FROM dim_products` will return no results and keep waiting for the new results.

Now cancel this query, and add a few more rows to the stream.

| product_id    | price |
| ------------- | ----- |
| iPhone14      | 799   |
| iPhone14_Plus | 899   |

Running `SELECT * FROM dim_products` again will get those 2 rows.

Now if you add one more row:

| product_id | price |
| ---------- | ----- |
| iPhone14   | 800   |

Then query `SELECT * FROM dim_products` again will get 2 rows (not 3, because the initial price of "iPhone14" is overwritten).

| product_id    | price |
| ------------- | ----- |
| iPhone14      | 800   |
| iPhone14_Plus | 899   |

As you can imagine, you can keep adding new rows. If the primary key is new, then you will get a new row in the query result. If the primary key exists already, then the previous row is overwritten with the values in the newly-added row.

:::info

In fact, you can assign an expression as the primary key. For example you can use `first_name||' '||last_name` to use the combined full name as the primary key, instead of using a single column.

:::

You can also query the stream in the table mode, i.e. `select * from table(dim_products)`

## Use Versioned Stream in INNER JOIN

In the above example, you always get the latest version of the event with the same primary key. This works in the similar way as [Changelog Stream](changelog-stream). The reason why this stream mode is called Versioned Stream is that multiple versions will be tracked by Timeplus. This is mainly used when the Versioned Stream acts as the "right-table" for the JOIN.

Imagine you have an append-only stream for the `orders`:

| _tp_time | order_id | product_id | quantity |
| -------- | -------- | ---------- | -------- |

Now start a streaming SQL:

```sql
SELECT orders._tp_time, order_id,product_id,quantity, price*quantity AS amount
FROM orders JOIN dim_products USING(product_id)
```

Then add 2 rows:

| _tp_time                 | order_id | product_id    | quantity |
| ------------------------ | -------- | ------------- | -------- |
| 2023-04-20T10:00:00.000Z | 1        | iPhone14      | 1        |
| 2023-04-20T10:01:00.000Z | 2        | iPhone14_Plus | 1        |

In the query console, you will see 2 rows one by one:

| _tp_time                 | order_id | product_id    | quantity | amount |
| ------------------------ | -------- | ------------- | -------- | ------ |
| 2023-04-20T10:00:00.000Z | 1        | iPhone14      | 1        | 800    |
| 2023-04-20T10:01:00.000Z | 2        | iPhone14_Plus | 1        | 899    |

Then you can change the price of iPhone14 back to 799, by adding a new row in `dim_products`

| product_id | price |
| ---------- | ----- |
| iPhone14   | 799   |

Also add a new row in `orders`

| _tp_time                 | order_id | product_id | quantity |
| ------------------------ | -------- | ---------- | -------- |
| 2023-04-20T11:00:00.000Z | 3        | iPhone14   | 1        |

You will get the 3rd row in the previous streaming SQL:

| _tp_time                 | order_id | product_id    | quantity | amount |
| ------------------------ | -------- | ------------- | -------- | ------ |
| 2023-04-20T10:00:00.000Z | 1        | iPhone14      | 1        | 800    |
| 2023-04-20T10:01:00.000Z | 2        | iPhone14_Plus | 1        | 899    |
| 2023-04-20T11:00:00.000Z | 3        | iPhone14      | 1        | 799    |

It shows that the latest price of iPhone14 is applied to the JOIN of new events.

You can also run a streaming SQL `select sum(price) from dim_products`, it should show the number 1698, because the latest prices are 799 and 899.

If you add a new row to set iPhone14 to 800, cancel the previous query and run again, you will get 1699.

## Use Versioned Stream in ASOF JOIN

The best part of Versioned Stream is that in `ASOF JOIN` Timeplus is able to automatically choose the closest version.

Continue on our previous scenario. 

```sql
SELECT orders._tp_time, order_id,product_id,quantity, price*quantity AS amount
FROM orders ASOF JOIN dim_products 
ON orders.product_id=dim_products.product_id AND orders._tp_time >= dim_products._tp_time
```

If the current iPhone14 price is 800, and you add a new order for 1 iPhone14, then you will get a transaction amount of 800.

Then you change the iPhone14 price to 799, and add a new order for 1 iPhone14, you will get a transaction amount of 799.

But if you add an order with _tp_time before the price change, you will get the transaction amount as 800 again, because Timeplus keeps multiple versions for the price and chooses the older version that best matches the order time. 

:::info

If you are not familiar with `ASOF JOIN`, this special JOIN provides non-exact matching capabilities. This can work well if two streams have the same id, but not exactly the same timestamps.

:::



## The advanced keep_versions setting:

In the above example, you can add `settings keep_versions=3` at the end of the query. This will inform the query engine to read the base version from the historical storage for the versioned_kv stream, then read the new events in the streaming storage and based on the ASOF time condition to pick up 3 versions in the memory, and finally join events from left append_stream with the right 3 versions, and find the best candidate to join together.

## Retention Policy

You should not set the TTL(Time-To-Live) for the historical storage of versioned_kv stream. Because only the last version of the same primary key is kept in the historical storage (via an auto-compact background process). Mannually set a TTL may remove those events who haven't been updated recently.

You may set a time-based or size-based retention policy for the streaming storage for the versioned_kv stream. But this is optional. By default a 4GB segment file is used for the streaming storage.
