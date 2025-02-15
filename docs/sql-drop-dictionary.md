# DROP DICTIONARY
Starting from [Timeplus Enterprise 2.7](/enterprise-v2.7), you can create dictionaries to store key-value pairs in memory, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.

When you no longer need a dictionary, you can drop it with the following SQL:

```sql
DROP DICTIONARY IF EXISTS my_dictionary;
```

## See also
* [CREATE DICTIONARY](/sql-create-dictionary) - Create dictionaries
* [SHOW DICTIONARIES](/sql-show-dictionaries) - Show dictionaries
