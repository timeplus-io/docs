# DROP DATABASE
Starting from [Timeplus Enterprise 2.6](/enterprise-v2.6), you can create a database to organize your streams, materialized views and other resources. The database is a logical container to help you to manage and query the data more efficiently.

## DROP DATABASE
When you no longer need a database, you can drop it with the following SQL:

```sql
DROP DATABASE IF EXISTS my_database;
```

If there are streams, materialized views, or other resources in the database, this operation will fail. You need to drop them first, or use the `CASCADE` option to drop all the resources in the database.

## DROP DATABASE CASCADE
This feature is available in Timeplus Enterprise 2.8 and later versions.

```sql
DROP DATABASE my_database CASCADE;
```

:::warning
Adding `CASCADE` to the `DROP DATABASE` command is a permanent operation and cannot be undone. All the streams, materialized views, and other resources in the database will be deleted. Please be cautious when you run this command. The only exception is the external database to Iceberg or MySQL/PostgreSQL. Running `DROP DATABASE my_database CASCADE` won't remove tables in the remote database.
:::

## See also
* [CREATE DATABASE](/sql-create-database) - Create databases
* [SHOW DATABASES](/sql-show-databases) - Show databases
