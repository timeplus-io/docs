# MySQL External Table

## Overview

Timeplus can read or write MySQL tables directly. This unlocks a set of new use cases, such as

- **Stream Processing**: Use Timeplus to efficiently process real-time data in Kafka/Redpanda, apply flat transformations or stateful aggregations, then write the processed data to the local or remote MySQL for further analysis or visualization.
- **Data Enrichment**: Enrich live streaming data with the static or slow-changing data from MySQL using streaming JOINs.
- **Unified Analytics**: Use Timeplus to query historical or recent data in MySQL alongside your streaming data for comprehensive analytics.

This integration is done by introducing "External Table" in Timeplus. Similar to [External Stream](/external-stream), there is no data persisted in Timeplus. They are called as "External Table" since the data in MySQL is structured as table rather than stream.

The implementation is built on top of StorageMySQL with connection pooling and failover support.

## Create MySQL External Table

```sql
CREATE EXTERNAL TABLE
    table_name
SETTINGS
    type='mysql',
    address='host:port',
    [ database='..', ]
    [ table='..', ]
    [ user='..', ]
    [ password='..', ]
    [ replace_query=false, ]
    [ on_duplicate_clause='..', ]
    [ pooled_connections=16, ]
    [ config_file='..', ]
    [ named_collection='..' ]
```

### Required Settings

- **type** (string) - Must be set to `'mysql'`
- **address** (string) - MySQL server address in format `'host:port'`. Default port is 3306

### Database Settings
  **user** (string, default: `'default'`) - MySQL username.
- **password** (string, default: `''`) - MySQL password.
- **database** (string, default: `'default'`) - MySQL database name.
- **table** (string, default: external table name) - Remote MySQL table name. If omitted, uses the external table name.
- **replace_query** (bool, default: `false`) - Flag that converts `INSERT INTO` queries to `REPLACE INTO`. If `true`, the query is executed as `INSERT INTO`. If `false`, the query is executed as `REPLACE INTO`.
- **on_duplicate_clause** (string, default: `''`) - The `ON DUPLICATE KEY on_duplicate_clause` expression that is added to the `INSERT` query. Can be specified only with `replace_query=false`. Example: `UPDATE c=c+1`. See the [MySQL documentation](https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html) to find which on_duplicate_clause you can use with the ON DUPLICATE KEY clause.
- **pooled_connections** (uint64, default: `16`) - Maximum pooled TCP connections.

#### Configuration Management Settings

- **config_file** (string, default: `''`) - Path to configuration file containing `key=value` pairs
- **named_collection** (string, default: `''`) - Name of pre-defined named collection configuration

The `config_file` setting is available since Timeplus Enterprise 2.7. You can specify the path to a configuration file that contains the configuration settings. The file should be in the format of `key=value` pairs, one pair per line. You can set the MySQL user and password in the file.

Example configuration file content:

```ini
address=localhost:3306
user=root
password=secret123
database=production
```

The `named_collection` setting is available since Timeplus Enterprise 3.0. Similar with `config_file`, you can specify the name of a pre-defined named collection which contains the configuration settings.

Example named collection definition:

```sql
CREATE NAMED COLLECTION
    mysql_config
AS
    address='localhost:3306',
    user='root',
    password='secret123',
    database='production';
```

### Columns Definition

You don't need to specify the columns in external table DDL, since the table schema will be fetched from the MySQL server.

Once the external table is created successfully, you can run the following SQL to list the columns:

```sql
DESCRIBE table_name;
```

:::info

The data types in the output will be Timeplus data types, such as `uint8`, instead of MySQL data type. Timeplus maintains a mapping for those types. [Learn more.](#datatype)

:::

:::info

Timeplus fetches and caches the MySQL table schema when the external table is attached. When the remote MySQL table schema changes (e.g., adding columns, changing data types, dropping columns), you must **restart** to reload the updated schema.

:::

You can define the external table and use it to read data from the MySQL table, or write to it.

## Connect to a local MySQL {#local}

Example SQL to connect to a local MySQL server without password:

```sql
CREATE EXTERNAL TABLE ch_local
SETTINGS type='mysql',
         address='localhost:3306',
         table='events'
```

## Read data from MySQL {#read}

Once the external table is created successfully, it means Timeplus can connect to the MySQL server and fetch the table schema.

You can query it via the regular `select .. from table_name`.

:::warning

Please note, in the current implementation, all rows will be fetched from MySQL to Timeplus, with the selected columns. Then Timeplus applies the SQL functions and `LIMIT n` locally. It's not recommended to run `SELECT *` for a large MySQL table.

Also note, use the Timeplus function names when you query the external table, such as [to_int](/functions_for_type#to_int), instead of MySQL's naming convention, e.g. CONVERT. In current implementation, the SQL functions are applied in Timeplus engine. We plan to support some function push-down to MySQL in future versions.

:::

Limitations:

1. tumble/hop/session/table functions are not supported for External Table (coming soon)
2. scalar or aggregation functions are performed by Timeplus, not the remote MySQL
3. `LIMIT n` is performed by Timeplus, not the remote MySQL
4. No query predicate pushdown to MySQL (planned for future versions)

## Write data to MySQL {#write}
MySQL external tables support standard INSERT operations with the following behaviors:

- **Standard INSERT**: Uses `INSERT INTO` semantics
- **Replace Mode**: When `replace_query=true`, uses `REPLACE INTO` instead
- **On Duplicate Key**: Custom conflict resolution with `on_duplicate_clause`

You can run regular `INSERT INTO` to add data to MySQL table. However it's more common to use a Materialized View to send the streaming SQL results to MySQL.

Say you have created an external table `mysql_table`. You can create a materialized view to read Kafka data(via an external stream) and transform/aggregate the data and send to the external table:

```sql
-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO mysql_table AS
    SELECT now64() AS _tp_time,
           raw:requestedUrl AS url,
           raw:method AS method,
           lower(hex(md5(raw:ipAddress))) AS ip
    FROM kafka_events;
```

### Batching Settings

In Timeplus Enterprise, additional performance tuning settings are available, such as

```sql
INSERT INTO mysql_table
SELECT * FROM some_source_stream
SETTINGS max_insert_block_size=10, max_insert_block_bytes=1024, insert_block_timeout_ms = 100;
```

- `max_insert_block_size` - The maximum block size for insertion, i.e. maximum number of rows in a batch. Default value: 65409
- `max_insert_block_bytes` - The maximum size in bytes of block for insertion. Default value: 1 MiB.
- `insert_block_timeout_ms` - The maximum time in milliseconds for constructing a block(a block) for insertion. Increasing the value gives greater possibility to create bigger blocks (limited by `max_insert_block_bytes` and `max_insert_block_size`), but also increases latency. Negative numbers means no timeout. Default value: 500.

## Supported data types {#datatype}

All MySQL data types are supported in the external table. While reading or writing data, Timeplus applies a data type mapping, such as converting Timeplus' `uint8` to MySQL's `SMALLINT`. If you find anything wrong with the data type, please let us know.
