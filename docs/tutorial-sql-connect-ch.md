# Connect to ClickHouse

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
