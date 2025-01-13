# DROP DATABASE
Starting from [Timeplus Enterprise 2.6](/enterprise-v2.6), you can create a database to organize your streams, materialized views and other resources. The database is a logical container to help you to manage and query the data more efficiently.

When you no longer need a database, you can drop it with the following SQL:

```sql
DROP DATABASE IF EXISTS my_database;
```

:::warning
This is a permanent operation and cannot be undone. All the streams, materialized views, and other resources in the database will be deleted. Please be cautious when you run this command.
:::

## See also
* [CREATE DATABASE](/sql-create-database) - Create databases
* [SHOW DATABASES](/sql-show-databases) - Show databases
