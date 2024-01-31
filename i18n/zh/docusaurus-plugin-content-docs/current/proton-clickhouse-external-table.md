# ClickHouse External Table

Since Proton v1.4.2(not released yet), it added the support to read or write ClickHouse tables. This unlocks a set of new use cases, such as

- Use Proton to efficiently process real-time data in Kafka/Redpanda, apply flat transformation or stateful aggregation, then write the data to the local or remote ClickHouse for further analysis or visualization.
- Enrich the live data with the static or slow-changing data in ClickHouse. Apply streaming JOIN.
- Use Proton to query historical or recent data in ClickHouse

This integration is done by introducing a new concept in Proton: "External Table". Similar to [External Stream](external-stream), there is no data persisted in Proton. However, since the data in ClickHouse is in the form of table, not data stream, so we call this as External Table. In the roadmap, we will support more integrations by introducing other types of External Table.

## CREATE EXTERNAL TABLE

### 语法

```sql
CREATE EXTERNAL TABLE name
SETTINGS type='clickhouse',
         address='..',
         user='..',
         password='..',
         database='..',
         secure=true|false,
         table='..'; 
```

The required settings are type and address. For other settings, the default values are

- "default" for `user`
- "" for `password`
- "default" for `database`
- "false" for `secure`
- if you omit the table name, it will use the name of the external table

You don't need to specify the columns, since the table schema will be fetched from the ClickHouse server.

You can define the external table and use it to read data from the ClickHouse table, or write to it.

### Connect to a local ClickHouse {#local}

Example SQL to connect to a local ClickHouse server without password:

```sql
CREATE EXTERNAL TABLE ch_local
SETTINGS type='clickhouse',
         address='localhost:9000',
         table='events'
```

### Connect to ClickHouse Cloud {#ch_cloud}

Example SQL to connect to [ClickHouse Cloud](https://clickhouse.com/):

```sql
CREATE EXTERNAL TABLE ch_cloud
SETTINGS type='clickhouse',
         address='abc.clickhouse.cloud:9440',
         user='default',
         password='..',
         secure=true,
         table='events';  
```

### Connect to Aiven for ClickHouse {#aiven}

Example SQL to connect to [Aiven for ClickHouse](https://docs.aiven.io/docs/products/clickhouse/getting-started):

```sql
CREATE EXTERNAL TABLE ch_aiven
SETTINGS type='clickhouse',
         address='abc.aivencloud.com:28851',
         user='avnadmin',
         password='..',
         secure=true,
         table='events';
```

## Read data from ClickHouse {#read}

Once the external table is created successfully, it means Proton can connect to the ClickHouse server and fetch the table schema.

You can query it via the regular `select .. from table_name`.

:::info

Please note, in the current implementation, all rows will be fetched from ClickHouse to Proton, with the selected columns. Then Proton applies the SQL functions and `LIMIT n` locally. It's not recommended to run `SELECT *` for a large ClickHouse table.

:::

Limitations:

1. tumble/hop/session/table functions are not supported for External Table (coming soon)
2. scalar or aggregation functions are performed by Proton, not the remote ClickHouse
3. `LIMIT n` is performed by Proton, not the remote ClickHouse

## Write data to ClickHouse {#write}

You can run regular `INSERT INTO` to add data to ClickHouse table. However it's more common to use a Materialized View to send the streaming SQL results to ClickHouse.

Say you have created an external table `ch_table`. You can create an materialized view to read Kafka data(via an external stream) and transform/aggregate the data and send to the external table:

```sql
-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO ch_table AS
    SELECT now64() AS _tp_time,
           raw:requestedUrl AS url,
           raw:method AS method,
           lower(hex(md5(raw:ipAddress))) AS ip
    FROM kafka_events;
```

## Supported data types {#datatype}

All ClickHouse data types are supported in the external table. While reading or writing data, Proton applies a data type mapping, such as converting Proton's `uint8` to ClickHouse's `UInt8`. If you find anything wrong with the data type, please let us know.
