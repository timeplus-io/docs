# Streaming ETL: MySQL to ClickHouse

A Docker Compose stack is provided at https://github.com/timeplus-io/proton/tree/develop/examples/cdc, to demonstrate how to mirror the data from MySQL to ClickHouse. The common use case is to keep MySQL as the transactional database, while using ClickHouse for the analytics workload.


## Start the example

Clone the [proton](https://github.com/timeplus-io/proton) repo or just download the docker-compose.yml in a folder. Run `docker compose up` in the folder. Six docker containers in the stack:

1. ghcr.io/timeplus-io/proton:latest, as the streaming database.
2. docker.redpanda.com/redpandadata/redpanda, as the Kafka compatible streaming message bus
3. docker.redpanda.com/redpandadata/console, as the web UI to explore data in Kafka/Redpanda
4. debezium/connect, as the CDC engine to read changes from OLTP and send data to Kafka/Redpanda
5. debezium/example-mysql, a pre-configured MySQL, as pipeline source
6. clickhouse/clickhouse-server, the real-time OLAP as the pipeline destination

## Prepare the table in ClickHouse

Open the `clickhouse client` in the clickhouse container. Run the following SQL to create a regular MergeTree table.

```sql
CREATE TABLE customers
(
    id Int32,
    first_name String,
    last_name String,
    email String
)
ENGINE=MergeTree()
PRIMARY KEY (id);
```

## Create the CDC job

Perform the following command in your host server, since port 8083 is exposed from Debezium Connect.

```shell
curl --request POST \
  --url http://localhost:8083/connectors \
  --header 'Content-Type: application/json' \
  --data '{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "tasks.max": "1",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184054",
    "topic.prefix": "dbserver1",
    "database.include.list": "inventory",
    "schema.history.internal.kafka.bootstrap.servers": "redpanda:9092",
    "schema.history.internal.kafka.topic": "schema-changes.inventory"
  }
}'
```

## Run SQL

You can use `docker exec -it <name> proton-client -h 127.0.0.1 -m -n` to run the SQL client in Proton container. Or use the Docker Desktop UI to choose the container, choose "Exec" tab and type `proton-client -h 127.0.0.1 -m -n` to start the SQL client.

Copy the content of `mysql-to-clickhouse.sql`and paste in the Proton Client and run them together. What will happen:

1. One [Timeplus External Stream](/external-stream) will be created to read the MySQL CDC data from the Kafka/Redpanda topic.
2. One [External Table](/clickhouse-external-table) will be created to write data from Timeplus to ClickHouse.
3. One [Materialized View](/materialized-view#m_view) will be created to continuously read data from Kafka and write to ClickHouse.

The content of the `mysql-to-clickhouse.sql` is:

```sql
-- read the topic via an external stream
CREATE EXTERNAL STREAM customers_cdc(raw string)
                SETTINGS type='kafka',
                         brokers='redpanda:9092',
                         topic='dbserver1.inventory.customers';

-- create an external table so that Timeplus can write to ClickHouse
CREATE EXTERNAL TABLE customers
SETTINGS type='clickhouse',
        address='clickhouse:9000',
        table='customers';

-- create a materialized view as a streaming ETL job
CREATE MATERIALIZED VIEW mv_mysql2ch INTO customers AS
    SELECT
           raw:payload.after.id::int32 AS id,
           raw:payload.after.first_name AS first_name,
           raw:payload.after.last_name AS last_name,
           raw:payload.after.email AS email
    FROM customers_cdc WHERE raw:payload.op in ('r','c') SETTINGS seek_to='earliest';
```

## Verify the data is copied to ClickHouse

Go back to the ClickHouse client and run `select * from customers` to see the 4 rows from MySQL.

Use a MySQL client(e.g. DBeaver) to add some records to see the update from `select * from customers`. You can also run `select * from table(customers)` to avoid waiting for new updates.

:::info

Since we create a regular MergeTree-based table in ClickHouse. It doesn't support update or delete. You may create the table with ReplacingMergeTree engine, if you need to change the data in MySQL. In this case, Timeplus needs to handle CDC data with `op='u'`.

:::