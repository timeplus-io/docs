# SHOW DICTIONARIES
Starting from [Timeplus Enterprise 2.7](/enterprise-v2.7), you can create dictionaries to store key-value pairs in memory, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.

You can list all the dictionaries in the cluster with the following SQL:

```sql
SHOW DICTIONARIES;
```

The output will include a single column `name` with the names of the dictionaries.

You can also add a `WHERE` clause to filter the dictionaries by name:

```sql
SHOW DICTIONARIES WHERE name LIKE 'my%';
SHOW DICTIONARIES WHERE name='taxi_zone_dictionary';
```

## See also
* [CREATE DICTIONARY](/sql-create-dictionary) - Create dictionaries
* [DROP DICTIONARY](/sql-drop-dictionary) - Drop dictionaries
