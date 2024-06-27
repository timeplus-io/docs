# CREATE EXTERNAL TABLE
## Syntax

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

- 'default' for `user`
- '' (empty string) for `password`
- 'default' for `database`
- 'false' for `secure`
- If you omit the table name, it will use the name of the external table

You don't need to specify the columns, since the table schema will be fetched from the ClickHouse server.

Once the external table is created successfully, you can run the following SQL to list the columns:

```sql
DESCRIBE name
```

:::info

The data types in the output will be Proton data types, such as `uint8`, instead of ClickHouse type `UInt8`. Proton maintains a mapping for those types. [Learn more.](#datatype)

:::

You can define the external table and use it to read data from the ClickHouse table, or write to it.
