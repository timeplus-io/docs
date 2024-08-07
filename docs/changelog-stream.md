# Changelog Stream

When you create a stream with the mode `changelog_kv`, the data in the stream is no longer append-only. When you query the stream directly, only the latest version for the same primary key(s) will be shown. Data can be updated or deleted. You can use Changelog Stream in JOIN either on the left or on the right. Timeplus will automatically choose the latest version.

:::warning
For Timeplus Enterprise customers, we recommend to use [Mutable Streams](mutable-stream) with the enhanced performance for UPSERT and queries. The changelog streams are not supported in Timeplus Enterprise, and will be removed in Timeplus Proton.
:::

Here are some examples:

## Create the Stream

In this example, you create a stream `dim_products` in `changelog_kv` mode with the following columns:

| Column Name | Date Type           | Description                                                  |
| ----------- | ------------------- | ------------------------------------------------------------ |
| _tp_time    | datetime64(3,'UTC') | this is automatically created for all streams in Timeplus, with the event time at millisecond precision and UTC timezone |
| _tp_delta   | int                 | a special column, 1 means new data, -1 means deleted data    |
| product_id  | string              | unique id for the product, as the primary key                |
| price       | float               | current price                                                |

:::info

The rest of this page assumes you are using Timeplus Console. If you are using Proton, you can create the stream with DDL. [Learn more](proton-create-stream#changelog-stream)

:::

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

Cancel the query `SELECT * FROM dim_products` and run again, you will get only 1 row in the product list:

| _tp_delta | product_id | price |
| --------- | ---------- | ----- |
| 1         | iPhone14   | 800   |

As you can imagine, you can keep adding new rows. If _tp_delta is 1 and the primary key is new, then you will get a new row in the query result. If _tp_delta is -1 and the primary key exists already, then the previous row is deleted. You can update the value by adding a new row with the primary key.

:::info

In fact, you can assign an expression as the primary key. For example you can use `first_name||' '||last_name` to use the combined full name as the primary key, instead of using a single column.

:::

### Show aggregated results

If you run queries like `select count(1), sum(price) from dim_products` , this streaming SQL will always give you latest results:

| count(1) | sum(price) |                                    |
| -------- | ---------- | ---------------------------------- |
| 1        | 800        | when there is only 1 row: iPhone14 |
| 2        | 1699       | when  iPhone14_Plus is added       |
| 1        | 800        | when  iPhone14_Plus is removed     |

## Use Changelog Stream in JOIN as lookup

In the above examples, you always get the latest version of the event with the same primary key. This is very useful when such streams acts as the "lookup-table" for the JOIN.

Imagine you have an append-only stream for the `orders`:

| _tp_time | order_id | product_id | quantity |
| -------- | -------- | ---------- | -------- |

The current `dim_products` stream is:

| _tp_delta | product_id    | price |
| --------- | ------------- | ----- |
| 1         | iPhone14      | 799   |
| 1         | iPhone14_Plus | 899   |

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
| 2023-04-20T10:00:00.000Z | 1        | iPhone14      | 1        | 799    |
| 2023-04-20T10:01:00.000Z | 2        | iPhone14_Plus | 1        | 899    |

Then you can change the price of iPhone14 to 800, by adding 2 new rows in `dim_products`

| _tp_delta | product_id | price |
| --------- | ---------- | ----- |
| -1        | iPhone14   | 799   |
| 1         | iPhone14   | 800   |

Also add a new row in `orders`

| _tp_time                 | order_id | product_id | quantity |
| ------------------------ | -------- | ---------- | -------- |
| 2023-04-20T11:00:00.000Z | 3        | iPhone14   | 1        |

You will get the 3rd row in the previous streaming SQL:

| _tp_time                 | order_id | product_id    | quantity | amount |
| ------------------------ | -------- | ------------- | -------- | ------ |
| 2023-04-20T10:00:00.000Z | 1        | iPhone14      | 1        | 799    |
| 2023-04-20T10:01:00.000Z | 2        | iPhone14_Plus | 1        | 899    |
| 2023-04-20T11:00:00.000Z | 3        | iPhone14      | 1        | 800    |

It shows that the latest price of iPhone14 is applied to the JOIN of new event.

## Use Changelog Stream in JOIN as left table

You can also use Changelog Stream on the left side of the JOIN.

Let's create a new stream `order2` in Changelog Stream mode:

| _tp_time | _tp_delta | order_id | product_id | quantity |
| -------- | --------- | -------- | ---------- | -------- |

You can add/update/delete orders by adding the rows with proper _tp_delta value. When you run streaming SQL like:

```sql
SELECT orders2._tp_time, order_id,product_id,quantity, price*quantity AS amount
FROM orders2 JOIN dim_products USING(product_id)
```

Timeplus will use the latest version of order records to join with the lookup table.

What's more useful is that if you run aggregations such as:

```sql
SELECT count(1) AS order_count, sum(price*quantity) AS revenue
FROM orders2 JOIN dim_products USING(product_id)
```

you will get the correct numbers whenever the order is added, updated, or deleted.

## Setup CDC with Changelog Stream

CDC, or Change Data Capture, is a critical part of Modern Data Stack. Most of the modern databases support CDC to sync the data changes to other systems at real-time. One popular open-source solution is [Debezium](https://debezium.io/).

Timeplus Changelog Stream can work with Debezium or other CDC solutions. It can also work without them, if your applications can generate events with the proper _tp_delta flag (1 for adding data, -1 for deleting data).

For example, you created 2 tables in PostgreSQL 14:

### Setup PostgreSQL Tables

```sql
CREATE TABLE dim_products(
	product_id VARCHAR PRIMARY KEY,
	price FLOAT
);
CREATE TABLE orders(
  order_id serial PRIMARY KEY,
  product_id varchar,
  quantity int8 DEFAULT 1,
  timestamp timestamp DEFAULT NOW()
);
```

In order to capture the `before` values for UPDATE or DELETE, you also need to set `REPLICA IDENTIFY` to `FULL`. Check the [Debezium documentation](https://debezium.io/documentation/reference/2.2/connectors/postgresql.html#postgresql-replica-identity) for more details.

```sql
ALTER TABLE dim_products REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
```

### Setup Debezium

Now start Debezium with Kafka Connect in your preferred way. You also need a local or remote Kafka/Redpanda as message brokers to receive CDC data.

In this example, we are going to use Redpanda Cloud as message broker, and a local docker image for the Kafka Connect with built-in Debezium. The docker-compose file:

```yaml
version: "3.7"
services:
  connect:
    image: quay.io/debezium/connect:2.2.0.Final
    container_name: connect
    ports:
      - 8083:8083
    environment:
      - GROUP_ID=1
      - CONFIG_STORAGE_TOPIC=my_connect_configs
      - OFFSET_STORAGE_TOPIC=my_connect_offsets
      - STATUS_STORAGE_TOPIC=my_connect_statuses
      - BOOTSTRAP_SERVERS=${BOOTSTRAP_SERVERS}
      # CONNECT_ properties are for the Connect worker
      - CONNECT_BOOTSTRAP_SERVERS=${BOOTSTRAP_SERVERS}
      - CONNECT_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
      - CONNECT_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
      - CONNECT_SASL_MECHANISM=SCRAM-SHA-512
      - CONNECT_PRODUCER_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
      - CONNECT_PRODUCER_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
      - CONNECT_PRODUCER_SASL_MECHANISM=SCRAM-SHA-512
      - CONNECT_CONSUMER_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
      - CONNECT_CONSUMER_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
      - CONNECT_CONSUMER_SASL_MECHANISM=SCRAM-SHA-512
      - CONNECT_KEY_CONVERTER_SCHEMAS_ENABLE=false
      - CONNECT_VALUE_CONVERTER_SCHEMAS_ENABLE=false
```

 You can put the credentials in a `.env` file in the same folder:

```
BOOTSTRAP_SERVERS=demourl.cloud.redpanda.com:9092
SASL_USERNAME=yourname
SASL_PASSWORD=yourpassword
SASL_JAAS_CONFIG=org.apache.kafka.common.security.scram.ScramLoginModule required username="${SASL_USERNAME}" password="${SASL_PASSWORD}";
SECURITY_PROTOCOL=SASL_SSL
```

Optionally, you can add Redpanda Console in the docker compose file. It provides a nice UI for you to add/review topics and manage connectors.

```yaml
  console:
    image: docker.redpanda.com/redpandadata/console:v2.2.3
    container_name: redpanda_console
    depends_on:
      - connect
    ports:
      - 8080:8080
    entrypoint: /bin/sh
    command: -c "echo \"$$CONSOLE_CONFIG_FILE\" > /tmp/config.yml; /app/console"
    environment:
      CONFIG_FILEPATH: /tmp/config.yml
      CONSOLE_CONFIG_FILE: |
        kafka:
          brokers: ${BOOTSTRAP_SERVERS}
          sasl:
            enabled: true
            username: ${SASL_USERNAME}
            password: ${SASL_PASSWORD}
            mechanism: SCRAM-SHA-512
          tls:
            enabled: true
        connect:
          enabled: true
          clusters:
            - name: local-connect-cluster
              url: http://connect:8083
```



### Add PostgreSQL Connector

Start the docker-compose with `docker-compose up`. It will load the images for Debezium and Redpanda Console. You can access the Redpanda Console via http://localhost:8080 and the Kafka Connect REST API endpoint is http://localhost:8083

You may add the Debezium connector via the web UI. But the following command line just works fine:

```bash
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
localhost:8083/connectors \
-d '{"name":"pg-connector","config":{"connector.class": "io.debezium.connector.postgresql.PostgresConnector","publication.autocreate.mode": "filtered",  "database.dbname": "defaultdb",  "database.user": "avnadmin",  "schema.include.list": "public",  "database.port": "28851",  "plugin.name": "pgoutput",  "database.sslmode": "require",  "topic.prefix": "doc",  "database.hostname": "xyz.aivencloud.com",  "database.password": "***",  "table.include.list": "public.dim_products,public.orders"}}'
```

This will add a new connector with the name `pg-connector`, connecting to a PostgreSQL database in a remote server (in this case, Aiven Cloud). A few notes to the configuration items:

* `publication.autocreate.mode` is `filtered`, and `table.include.list` is a list of tables you want to apply CDC. Sometimes you don't have permissions to enable publications for all tables. So `filtered` is recommended.
* `plugin.name` is `pgoutput`. This works well with new versions of PostgreSQL (10+). The default value is `decoderbufs`, which is required to be installed separately.
* `topic.prefix` is set to `doc`. As the name implies, it will be the prefix for Kafka topics. Since the schema is `public`, the topics to be used will be `doc.public.dim_products` and `doc.public.orders`

Make sure you create those 2 topics in Kafka/Redpanda. Then in a few seconds, new messages should be available in the topics.

You can try INSERT/UPDATE/DELETE data in PostgreSQL and check the generated JSON messages.

### Sample CDC Data

#### INSERT

SQL:

```sql
INSERT INTO dim_products ("product_id", "price") VALUES ('iPhone14', 799)
```

CDC Data:

```json
{
    "before": null,
    "after": {
        "product_id": "iPhone14",
        "price": 799
    },
    "source": {
    },
    "op": "c",
    "ts_ms": 1682217357439,
    "transaction": null
}
```

#### UPDATE

SQL:

```sql
UPDATE dim_products set price=800 WHERE product_id='iPhone14'
```

CDC Data:

```json
{
    "before": {
        "product_id": "iPhone14",
        "price": 799
    },
    "after": {
        "product_id": "iPhone14",
        "price": 800
    },
    "source": {
    },
    "op": "u",
    "ts_ms": 1682217416358,
    "transaction": null
}
```

#### DELETE

SQL:

```sql
DELETE FROM dim_products
```

CDC Data:

```json
{
    "before": {
        "product_id": "iPhone14",
        "price": 800
    },
    "after": null,
    "source": {
    },
    "op": "d",
    "ts_ms": 1682217291411,
    "transaction": null
}
```

#### For existing rows

Debezium also read all existing rows and generate messages like this

```json
{
    "before": null,
    "after": {
        "product_id": "iPhone14",
        "price": 799
    },
    "source": {
    },
    "op": "r",
    "ts_ms": 1682217357439,
    "transaction": null
}
```



### Load data to Timeplus

You can follow this [guide](kafka-source) to add 2 data sources to load data from Kafka or Redpanda.  For example:

* Data source name `s1` to load data from topic `doc.public.dim_products` and put in a new stream `rawcdc_dim_products`
* Data source name `s2` to load data from topic `doc.public.orders` and put in a new stream `rawcdc_orders`

Then run the following SQL in query page:

```sql
select 1::int8 as _tp_delta, after:product_id as product_id, after:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op in ('c','r')
union
select -1::int8 as _tp_delta, before:product_id as product_id, before:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op='d'
union
select -1::int8 as _tp_delta, before:product_id as product_id, before:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op='u'
union
select 1::int8 as _tp_delta, after:product_id as product_id, after:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op='u'
```

Click the **Send as Sink** button and choose Timeplus type, to send the results to an existing stream `dim_products` .

:::info

In the coming version of Timeplus, we will simplify the process so that you don't need to write custom SQL to extract the Debezium CDC messages.

:::

Similarly, here is the SQL to convert raw CDC messages for `orders` :

```sql
select 1::int8 as _tp_delta, after:order_id as order_id, after:product_id as product_id, after:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op in ('c','r')
union
select -1::int8 as _tp_delta, before:order_id as order_id, before:product_id as product_id, before:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op='d'
union
select -1::int8 as _tp_delta, before:order_id as order_id, before:product_id as product_id, before:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op='u'
union
select 1::int8 as _tp_delta, after:order_id as order_id, after:product_id as product_id, after:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op='u'
```
