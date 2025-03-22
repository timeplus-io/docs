# CREATE DATABASE
Starting from [Timeplus Enterprise 2.6](/enterprise-v2.6), you can create a database to organize your streams, materialized views and other resources. The database is a logical container to help you to manage and query the data more efficiently.

When you create a database in a cluster, the database is automatically replicated to all the nodes in the cluster. You can create a database with the following SQL:

```sql
CREATE DATABASE IF NOT EXISTS my_database;
```

Once the database is created, you can create streams, materialized views, and other resources in the database by running `USE my_database` before creating the resources.

For example:

```sql
CREATE DATABASE my_database;

USE my_database;

CREATE STREAM my_stream (raw string);

INSERT INTO my_stream(raw) VALUES ('hello');

SELECT * FROM table(my_stream);
--if you are using other databases
SELECT * FROM table(my_database.my_stream);
```

Please note User-Defined Functions are global and not bound to a specific database.

## External Database
Starting from [Timeplus Enterprise 2.8](/enterprise-v2.8), you can create an external database to connect to external MySQL databases.

Syntax:
```sql
CREATE DATABASE mysql_database
SETTINGS
    type = 'mysql',
    host = 'localhost',
    port = 3306,
    user = 'root',
    password = 'password',
    database = 'my_database'
```

Then you can list all tables from the remote MySQL database:

```sql
SHOW STREAMS FROM mysql_database;
```

Or query them:

```sql
SELECT * FROM mysql_database.my_stream;
```
## See also
* [SHOW DATABASES](/sql-show-databases) - Show databases
* [DROP DATABASE](/sql-drop-database) - Drop databases
