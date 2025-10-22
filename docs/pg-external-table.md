# PostgreSQL External Table

## Overview

Timeplus can read or write PostgreSQL tables directly. This unlocks a set of new use cases, such as

- **Stream Processing**: Use Timeplus to efficiently process real-time data in Kafka/Redpanda, apply flat transformations or stateful aggregations, then write the processed data to the local or remote PostgreSQL for further analysis or visualization.
- **Data Enrichment**: Enrich live streaming data with the static or slow-changing data from PostgreSQL using streaming JOINs.
- **Unified Analytics**: Use Timeplus to query historical or recent data in PostgreSQL alongside your streaming data for comprehensive analytics.

This integration is done by introducing "External Table" in Timeplus. Similar to [External Stream](/external-stream), there is no data persisted in Timeplus. They are called as "External Table" since the data in PostgreSQL is structured as table rather than stream.

## Create PostgreSQL External Table

```sql
CREATE EXTERNAL TABLE table_name
SETTINGS
    type='postgresql',
    address='host:port',
    [ user='..', ]
    [ password='..', ]
    [ database='..', ]
    [ table='..', ]
    [ schema='..', ]
    [ on_conflict='..', ]
    [ pooled_connections=16, ]
    [ config_file='..', ]
    [ named_collection='..' ]
```

### Required Settings

- **type** (string) - Must be set to `'postgresql'`
- **address** (string) - PostgreSQL server address in format `'host:port'`

### Database Settings

- **user** (string, default: `'default'`) - Username for PostgreSQL authentication.
- **password** (string, default: `''`) - Password for PostgreSQL authentication.
- **database** (string, default: `'default'`) - PostgreSQL database name.
- **table** (string, default: <external table name>) - PostgreSQL table name. If you omit the table name, it will use the name of the external table.
- **schema** (string, default: `''`) - Non-default table schema.
- **on_conflict** (string, default: `''`) - Conflict resolution strategy for INSERT operations. Example: `ON CONFLICT DO NOTHING`, `ON CONFLICT <conflict_target> DO UPDATE SET column = EXCLUDED.column`, etc. ([PostgreSQL INSERT](https://www.postgresql.org/docs/current/sql-insert.html))
- **pooled_connections** (uint64, default: `16`) - Connection pool size for PostgreSQL.

### Configuration Management Settings

- **config_file** (string, default: `''`) - Path to configuration file containing key=value pairs
- **named_collection** (string, default: `''`) - Name of pre-defined named collection configuration

The `config_file` setting is available since Timeplus Enterprise 2.7. You can specify the path to a configuration file that contains the configuration settings. The file should be in the format of `key=value` pairs, one pair per line. You can set the PostgreSQL user and password in the file.

Example configuration file content:

```ini
address=localhost:5432
user=postgres
password=secret123
database=production
```

The `named_collection` setting is available since Timeplus Enterprise 3.0. Similar with `config_file`, you can specify the name of a pre-defined named collection which contains the configuration settings.

Example named collection definition:

```sql
CREATE NAMED COLLECTION
    pg_config
AS
    address='localhost:5432',
    user='postgres',
    password='secret123',
    database='production';
```

### Columns Definition

You don't need to specify the columns in external table DDL, since the table schema will be fetched from the PostgreSQL server.

You can run the following SQL to list the columns after the external table is created:

```sql
DESCRIBE table_name;
```

:::info

The data types in the output will be Timeplus data types, such as `uint8`, instead of PostgreSQL data type. Timeplus maintains a mapping for those types. [Learn more.](#datatype)

:::

:::info

Timeplus fetches and caches the PostgreSQL table schema when the external table is attached. When the remote PostgreSQL table schema changes (e.g., adding columns, changing data types, dropping columns), you must **restart** to reload the updated schema.

:::

## Connect to a local PostgreSQL (example) {#local}

You can use the following command to start a local PostgreSQL via Docker:

```bash
docker run --name=postgres --rm --env=POSTGRES_PASSWORD=foo -p 5432:5432 postgres:latest -c log_statement=all
```

Then open a new terminal and run the following command to connect to the PostgreSQL server:

```bash
psql -p 5432 -U postgres -h localhost
```

Create a table and add some rows:

```sql
-- Table Definition
CREATE TABLE "public"."dim_products" (
    "product_id" varchar NOT NULL,
    "price" float8,
    PRIMARY KEY ("product_id")
);

INSERT INTO "public"."dim_products" ("product_id", "price") VALUES ('1', '10.99'), ('2', '19.99'), ('3', '29.99');
```

In Timeplus, you can create an external table to read data from the PostgreSQL table:

```sql
CREATE EXTERNAL TABLE pg_local
SETTINGS type='postgresql',
         address='localhost:5432',
         database='postgres',
         user='postgres',
         password='foo',
         table='dim_products';
```

Then query the table:

```sql
SELECT * FROM pg_local;
```

## Read data from PostgreSQL {#read}

Once the external table is created successfully, it means Timeplus can connect to the PostgreSQL server and fetch the table schema.

You can query it via the regular `SELECT .. FROM table_name`.

:::warning

Please note, in the current implementation, all rows will be fetched from PostgreSQL to Timeplus, with the selected columns. Then Timeplus applies the SQL functions and `LIMIT n` locally. It's not recommended to run `SELECT *` for a large PostgreSQL table.

Also note, use the Timeplus function names when you query the external table, such as [to_int](/functions_for_type#to_int), instead of PostgreSQL's naming convention, e.g. CONVERT. In current implementation, the SQL functions are applied in Timeplus engine. We plan to support some function push-down to PostgreSQL in future versions.

:::

Limitations:

1. tumble/hop/session/table functions are not supported for External Table (coming soon)
2. scalar or aggregation functions are performed by Timeplus, not the remote PostgreSQL
3. `LIMIT n` is performed by Timeplus, not the remote PostgreSQL

## Write data to PostgreSQL {#write}

You can run regular `INSERT INTO` to add data to PostgreSQL table, such as:

```sql
INSERT INTO pg_local (product_id, price) VALUES ('10', 90.99), ('20', 199.99);
```

:::info
Please note, since the `price` column is in `float8` type, in Timeplus, you need to insert via `90.99`, instead of a string `"90.99"` as in PostgreSQL INSERT command.
:::

However it's more common to use a Materialized View in Timeplus to send the streaming SQL results to PostgreSQL.

Say you have created an external table `pg_table`. You can create a materialized view to read Kafka data(via [Kafka External Stream](/kafka-source)) and transform/aggregate the data and send to the external table:

```sql
-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO pg_table AS
    SELECT now64() AS _tp_time,
           raw:requestedUrl AS url,
           raw:method AS method,
           lower(hex(md5(raw:ipAddress))) AS ip
    FROM kafka_events;
```

You may use `on_conflict` to upsert data instead of insert.

```sql
CREATE EXTERNAL TABLE pg_local_upsert
SETTINGS type='postgresql',
         address='localhost:5432',
         database='postgres',
         user='postgres',
         password='foo',
         table='dim_products',
         on_conflict='ON CONFLICT (product_id) DO UPDATE SET price = EXCLUDED.price';

-- Update price of product_id=1 to 9.99
INSERT INTO pg_local (product_id, price) VALUES ('1', 9.99);
```

### Batching Settings

In Timeplus Enterprise, additional performance tuning settings are available, such as

```sql
INSERT INTO pg_table
SELECT * FROM some_source_stream
SETTINGS max_insert_block_size=10, max_insert_block_bytes=1024, insert_block_timeout_ms = 100;
```

- `max_insert_block_size` - The maximum block size for insertion, i.e. maximum number of rows in a batch. Default value: 65409
- `max_insert_block_bytes` - The maximum size in bytes of block for insertion. Default value: 1 MiB.
- `insert_block_timeout_ms` - The maximum time in milliseconds for constructing a block for insertion. Increasing the value gives greater possibility to create bigger blocks (limited by `max_insert_block_bytes` and `max_insert_block_size`), but also increases latency. Negative numbers means no timeout. Default value: 500.

## Supported data types {#datatype}

All PostgreSQL data types are supported in the external table. While reading or writing data, Timeplus applies a data type mapping, such as converting Timeplus' `uint8` to PostgreSQL's `SMALLINT`. If you find anything wrong with the data type, please let us know.
