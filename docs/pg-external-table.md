# PostgreSQL External Table

Timeplus can read or write PostgreSQL tables directly. This unlocks a set of new use cases, such as

- Use Timeplus to efficiently process real-time data in Kafka/Redpanda, apply flat transformation or stateful aggregation, then write the data to the local or remote PostgreSQL for further analysis or visualization.
- Enrich the live data with the static or slow-changing data in PostgreSQL. Apply streaming JOIN.
- Use Timeplus to query historical or recent data in PostgreSQL.

This integration is done by introducing "External Table" in Timeplus. Similar to [External Stream](/external-stream), there is no data persisted in Timeplus. However, since the data in PostgreSQL is in the form of table, not data stream, so we call this as External Table. Currently, we support MySQL, PostgreSQL and ClickHouse. In the roadmap, we will support more integration by introducing other types of External Table.

## CREATE EXTERNAL TABLE

### Syntax

```sql
CREATE EXTERNAL TABLE name
SETTINGS type='postgresql',
         address='..',
         user='..',
         password='..',
         database='..',
         secure=true|false,
         config_file='..',
         table='..';
```

The required settings are type and address. For other settings, the default values are

- 'default' for `user`
- '' (empty string) for `password`
- 'default' for `database`
- 'false' for `secure`
- If you omit the table name, it will use the name of the external table

The `config_file` setting is available since Timeplus Enterprise 2.7. You can specify the path to a file that contains the configuration settings. The file should be in the format of `key=value` pairs, one pair per line. You can set the PostgreSQL user and password in the file.

Please follow the example in [Kafka External Stream](/proton-kafka#config_file).

You don't need to specify the columns, since the table schema will be fetched from the PostgreSQL server.

Once the external table is created successfully, you can run the following SQL to list the columns:

```sql
DESCRIBE name
```

:::info

The data types in the output will be Timeplus data types, such as `uint8`, instead of PostgreSQL data type. Timeplus maintains a mapping for those types. [Learn more.](#datatype)

:::

You can define the external table and use it to read data from the PostgreSQL table, or write to it.

### Connect to a local PostgreSQL {#local}

Example SQL to connect to a local PostgreSQL server without password:

```sql
CREATE EXTERNAL TABLE ch_local
SETTINGS type='postgresql',
         address='localhost:5432',
         user='postgres',
         password='postgres',
         table='events'
```

### Connect to Aiven for PostgreSQL {#aiven}

Example SQL to connect to [Aiven for PostgreSQL](https://aiven.io/docs/products/postgresql/get-started):

```sql
CREATE EXTERNAL TABLE postgres_aiven
SETTINGS type='postgresql',
         address='abc.aivencloud.com:28851',
         user='avnadmin',
         password='..',
         secure=true,
         table='events';
```

## Read data from PostgreSQL {#read}

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

## Write data to MySQL {#write}

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

* `max_insert_block_size` - The maximum block size for insertion, i.e. maximum number of rows in a batch. Default value: 65409
* `max_insert_block_bytes` - The maximum size in bytes of block for insertion. Default value: 1 MiB.
* `insert_block_timeout_ms` - The maximum time in milliseconds for constructing a block(a block) for insertion. Increasing the value gives greater possibility to create bigger blocks (limited by `max_insert_block_bytes` and `max_insert_block_size`), but also increases latency. Negative numbers means no timeout. Default value: 500.

## Supported data types {#datatype}

All MySQL data types are supported in the external table. While reading or writing data, Timeplus applies a data type mapping, such as converting Timeplus' `uint8` to MySQL's `SMALLINT`. If you find anything wrong with the data type, please let us know.
