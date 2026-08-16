# CREATE EXTERNAL TABLE

Timeplus supports 5 types of external tables: ClickHouse, MySQL, PostgreSQL, MongoDB, and S3. Reading data from external tables are bounded, which means the query will end when all the data is read. Writing data to external tables are unbounded, which means the query will keep running until you cancel it.

## ClickHouse/MySQL External Table

```sql
CREATE EXTERNAL TABLE [db.]name
SETTINGS type='clickhouse|mysql',
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

You don't need to specify the columns, since the table schema will be fetched from the ClickHouse or MySQL server.

## S3 External Table

```sql
CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]name
    (<col_name1> <col_type1>, <col_name2> <col_type2>, ...)
PARTITION BY .. -- optional
SETTINGS
    type='s3', -- required
    use_environment_credentials=true|false, -- optional, default false
    access_key_id='..', -- optional
    secret_access_key='..', -- optional
    endpoint='..', -- optional, custom S3-compatible endpoint
    region='..', -- required, unless endpoint is set
    bucket='..', -- required, unless endpoint is set
    read_from='..', -- optional, but at least one of read_from/write_to is required
    write_to='..', -- optional, but at least one of read_from/write_to is required
    data_format='..', -- optional
    ...
```

## DESCRIBE

Once the external table is created successfully, you can run the following SQL to list the columns:

```sql
DESCRIBE [db.]name
```

:::info

The data types in the output will be Timeplus data types, such as `uint8`.

:::

You can define the external table and use it to read data from the ClickHouse or MySQL table, or write to it.
