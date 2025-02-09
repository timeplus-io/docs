# DROP FUNCTION
No matter UDF or UDAF, you can remove the function via `DROP FUNCTION`

Example:

```sql
DROP FUNCTION test_add_five_5;
```

## Drop a function forcefully {#force}
If the UDF or UDAF is used in other queries, you can force to drop it.

```sql
DROP FUNCTION test_udf SETTINGS force=true
```

This new setting is available since [Timeplus Enterprise v2.5.12](/enterprise-v2.5#2_5_12). Please recreate the UDF or UDAF before running the queries that depend on it.
