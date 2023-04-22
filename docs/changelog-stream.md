# Changelog Stream

When you create a stream with the mode `changelog_kv`, the data in the stream is no longer append-only. When you query the stream direclty, only the latest version for the same primary key(s) will be shown. Data can be updated or deleted. You can use Changelog Stream in JOIN either on the left or on the right. Timeplus will automatically choose the latest version.

Here are some examples:

## Create the Stream

In this example, you create a stream `dim_products` in `changelog_kv` mode with the following columns:

| Column Name | Date Type           | Description                                                  |
| ----------- | ------------------- | ------------------------------------------------------------ |
| _tp_time    | datetime64(3,'UTC') | this is automatically created for all streams in Timeplus, with the event time at millisecond precision and UTC timezone |
| _tp_delta   | int                 | a special column, 1 means new data, -1 means deleted data    |
| product_id  | string              | unique id for the product, as the primary key                |
| price       | float               | current price                                                |

## Query Single Stream

If you don't add any data, query `SELECT * FROM dim_products` will return no results and keep waiting for the new results.

### Add data

Keep the query running and add a few more rows to the stream (via REST API or create a new browser tab and add rows to the streams directly).

| _tp_delta | product_id    | price |
| --------- | ------------- | ----- |
| 1         | iPhone14      | 799   |
| 1         | iPhone14_Plus | 899   |

The query console will show those 2 rows automatically. 

### Delete data

Somehow, you don't want to list iPhone14_Plus any more. All you need is to add a row with `_tp_delta=-1`:

| _tp_delta | product_id    | price |
| --------- | ------------- | ----- |
| -1        | iPhone14_Plus | 899   |

Then cancel the query and run it again, you will only get 1 row, not 3 rows. The reason for that is the 2nd row and 3rd row are with the same primary id but with opposite _tp_delta, so Timeplus merges them. This process is called "compaction".

| _tp_delta | product_id | price |
| --------- | ---------- | ----- |
| 1         | iPhone14   | 799   |

### Update data

Now if you want to change the price of iPhone14, you need to add two rows:

| _tp_delta | product_id | price |
| --------- | ---------- | ----- |
| -1        | iPhone14   | 799   |
| 1         | iPhone14   | 800   |

Cancel the query `SELECT * FROM dim_products` and run again, you will get only 1 row in the produt list:

| _tp_delta | product_id | price |
| --------- | ---------- | ----- |
| 1         | iPhone14   | 800   |

As you can imagine, you can keep adding new rows. If the primary key is new, then you will get a new row in the query result. If the primary key exists already, then the previous row is overwritten with the values in the newly-added row.

:::info

In fact, you can assign an expression as the primary key. For example you can use `first_name||' '||last_name` to use the combined full name as the primary key, instead of using a single column.

:::

## Use Changelog Stream in INNER JOIN

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

Also add new row in `orders`

| _tp_time                 | order_id | product_id | quantity |
| ------------------------ | -------- | ---------- | -------- |
| 2023-04-20T11:00:00.000Z | 3        | iPhone14   | 1        |

You will get the 3rd row in the previous streaming SQL:

| _tp_time                 | order_id | product_id    | quantity | amount |
| ------------------------ | -------- | ------------- | -------- | ------ |
| 2023-04-20T10:00:00.000Z | 1        | iPhone14      | 1        | 800    |
| 2023-04-20T10:01:00.000Z | 2        | iPhone14_Plus | 1        | 899    |
| 2023-04-20T11:00:00.000Z | 3        | iPhone14      | 1        | 799    |

It shows that the latest price of iPhone14 is applied to the JOIN of new event.

You can also run a streaming SQL `select sum(price) from dim_products`, it should show the number 1698, because the latest prices are 799 and 899.

If you add a new row to set iPhone14 to 800, cancel the previous query and run again, you will get 1699.

## Use Changelog Stream in ASOF JOIN

The best part of Versioned Stream is that in `ASOF JOIN` Timeplus is able to automatically choose the closest version.

Continue on our previous scenario. 

```sql
SELECT orders._tp_time, order_id,product_id,quantity, price*quantity AS amount
FROM orders ASOF JOIN dim_products 
ON orders.product_id=dim_products.product_id AND orders._tp_time >= dim_products._tp_time
```

If the current iPhone14 price is 800, and you add a new order for 1 iPhone14, then you will get transaction amount as 800.

Then you change iPhone14 price to 799, and add a new order for 1 iPhone14, you will get transaction amount as 799.

But if you add an order with _tp_time before the price change, you will get the transaction amount as 800 again, because Timeplus keeps multiple versions for the price and choose the older version that best matches the order time. 

:::info

If you are not familiar with `ASOF JOIN`, this special JOIN provides non-exact matching capabilities. This can work well if two streams with same id, but not with exactly same timestamps.

:::