# Streaming CDC: PostgreSQL to ClickHouse via Redpanda Connect

It's a common practice to utilize Debezium as the engine for implementing CDC, Change Data Capture. Then push the changes into Apache Kafka, and subsequently direct them to various destinations via Kafka Connect or Apache Flink.

However, managing these JVM-based components can be challenging and costly, in terms of both hardware resources and human effort.

With the new version of Redpanda Connect, as well as the built-in integration with Timeplus, now you can setup streaming CDC without the need for any Java components—delivering simplicity, power, and cost-efficiency.

[Redpanda Connect](https://docs.redpanda.com/redpanda-connect/get-started/about/) is a declarative data streaming service that solves a wide range of data engineering problems with simple, chained, stateless processing steps. Implemented in Golang, it's [simple to deploy](https://docs.redpanda.com/redpanda-connect/get-started/quickstarts/rpk/), and comes with a wide range of [connectors](https://docs.redpanda.com/redpanda-connect/get-started/about/#components). Since version 4.40, it supports streaming data changes from a PostgreSQL database using logical replication, with plans to extend support to MySQL and other databases.

```mermaid
flowchart LR
    A[PostgreSQL]--CDC---B

    subgraph Redpanda Connect
    B[postgres_cdc input]
    T[timeplus output]
    end
    T--REST-->C[Stream]
    subgraph Timeplus
    C-->M[MV]
    M-->CH[Ext Table]
    end
    CH-->D[(ClickHouse)]
```

In this tutorial, we will configure Redpanda Connect to load existing data and real-time changes from a PostgreSQL database, send the CDC events to a Timeplus stream, then subsequently write to a ClickHouse table via a materialized view.

## Install Redpanda Connect

There are various methods to install and setup Redpanda Connect. Follow [the guide](https://docs.redpanda.com/redpanda-connect/get-started/quickstarts/rpk/) to setup `rpk` command line tool. When you first run `rpk connect` , Redpanda Connect will be automatically installed.

```shell
rpk connect -v
Version: 4.43.1
Date: 2024-12-09T17:36:06Z
```

## Setup PostgreSQL and ClickHouse

You can set up a PostgreSQL server locally or utilize cloud services. For this tutorial, we'll use the PostgreSQL service on Aiven cloud, with a table `orders` structured as follows:

```sql
CREATE SEQUENCE IF NOT EXISTS orders_order_id_seq;
CREATE TABLE "public"."orders" (
    "order_id" int4 NOT NULL DEFAULT nextval('orders_order_id_seq'::regclass),
    "product_id" varchar,
    "quantity" int8 DEFAULT 1,
    "timestamp" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("order_id")
);
```

Similarly, you will create a table in a ClickHouse database:

```sql
CREATE TABLE orders(
  order_id Int32,
  product_id String,
  quantity Int32,
  timestamp DateTime64(6))
ENGINE = MergeTree
ORDER BY order_id;
```

## Redpanda CDC Pipeline

Now create a `connect.yml` with the following content:

```yaml
input:
  label: "pg_stream"
  postgres_cdc:
    dsn: postgres://avnadmin:${PG_PWD_DEMO}@demo-timeplus.aivencloud.com:28851/defaultdb?sslmode=require
    schema: public
    tables:
      - orders
    stream_snapshot: true
    snapshot_batch_size: 100000
    include_transaction_markers: false
    temporary_slot: true
    slot_name: test_slot_native_decoder
cache_resources:
  - label: data_caching
    file:
      directory: /tmp/cache
output:
  label: main
  stdout: {}
```

Note:

- The database connection is specified in the `dsn` You can store the database password as an environment variable and reference it using the `${VAR}` syntax in the pipeline.
- Use the `schema` and `tables` parameters to specify which tables to read.
- Set `stream_snapshot` to true to read both existing and newly inserted rows.

Insert some rows in your PostgreSQL `orders` table. Then run the pipeline using:

```bash
rpk connect run connect.yml
```

You will receive all the existing rows in JSON format:

```
INFO Running main config from specified file       @service=redpanda-connect benthos_version=4.43.1 path=connect.yml
INFO Listening for HTTP requests at: http://0.0.0.0:4195  @service=redpanda-connect
Creating publication pglog_stream_rs_test_slot_native_decoder for tables: [public.orders]  @service=redpanda-connect label=pg_stream path=root.input
INFO Input type postgres_cdc is now active         @service=redpanda-connect label=pg_stream path=root.input
{"order_id":1,"product_id":"iPhone14","quantity":"1","timestamp":"2023-04-23T17:10:46.312471Z"}
{"order_id":2,"product_id":"iPhone14_Plus","quantity":"1","timestamp":"2023-04-23T17:10:46.312471Z"}
```

If you add new rows in PostgreSQL now, they are shown immediately in the console.

## Setup Timeplus

Now, modify the output from `stdout` to `timeplus` . You can install Timeplus Enterprise locally, or create a cloud workspace via https://us-west-2.timeplus.cloud. Follow [the guide](https://docs.timeplus.com/apikey) to create an API key. Save it as an environment variable then update the pipeline accordingly:

```yaml
output:
  label: main
  timeplus:
    url: https://us-west-2.timeplus.cloud
    workspace: the_workspace_id
    stream: pg_cdc_orders_appendonly
    apikey: "${TP_API_KEY}"
```

You will need to create several resources in Timeplus:

### Append-only stream

The stream will receive data pushed from Redpanda Connect.

```sql
CREATE STREAM pg_cdc_orders_appendonly(
  order_id int32,
  product_id string,
  quantity int32,
  timestamp datetime64(6),
  _tp_time datetime64(3, 'UTC') DEFAULT timestamp
);
```

### ClickHouse External Table

Create an external table to connect to the ClickHouse database:

```sql
CREATE EXTERNAL TABLE ch_orders SETTINGS
  type = 'clickhouse',
  address = 'clickhouse-timeplus.a.aivencloud.com:28851',
  user = 'demo', password = '...',
  secure = 1, database = 'default', table = 'orders';
```

### Materialized View

Create a materialized view to synchronize data from the append-only stream to the ClickHouse external table:

```sql
create materialized view mv_pg2ch into ch_orders as
select order_id,product_id,quantity,timestamp
from pg_cdc_orders_appendonly;
```

With everything in place, run `rpk connect run connect.yml` again and you will observe all data in PostgreSQL is now available in ClickHouse!

## What's Next

This tutorial illustrates how to setup streaming CDC and optional ETL from PostgreSQL to ClickHouse. Additionally, you can retain the PostgreSQL data in Timeplus, serving as a query layer. Utilize Mutable Streams and Changelog Streams in Timeplus to manage UPSERT and DELETE operations:

- Mutable Streams take 1 or more columns as the primary key. If you insert data with the same primary key(s), the original data will be overwritten. You can use the above pipeline to write to a mutable stream.
- Changelog Streams take the `_tp_delta` column , where a value of 1 indicates data insertion and -1 indicates data deletion. You can create a mapping processor in the Redpanda Connect pipeline to generate the proper `_tp_delta`, e.g.

```yaml
output:
  label: main
  timeplus:
    stream: pg_cdc_orders_changelog
  processors:
    - mapping: |
        root = this
        root._tp_delta = match meta("operation"){
          "delete" => -1,
          "read" => 1,
          "insert" => 1,
          "update" => throw("this approach doesn't handle UPDATE")
```

This demonstration provides a robust foundation for implementing efficient and scalable data streaming solutions without the complexities associated with traditional Java-based components.
