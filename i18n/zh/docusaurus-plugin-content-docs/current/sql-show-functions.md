# SHOW FUNCTIONS

List available User-Defined Functions.

:::info
This feature is only available in Timeplus Enterprise v2.x.
:::

## Show All UDF

```sql
SHOW FUNCTIONS
```

## Show Matching UDF

```sql
SHOW FUNCTIONS WHERE name LIKE 'get%'
```

This command will list all UDFs with names starting with 'get'.

:::warning Known issue for [Timeplus Enterprise 2.4.15](enterprise-releases#known_issue_2_4_15)
Running `SHOW FUNCTION ..` in Timeplus Console (web UI) won't render the results properly. Running such SQL via timeplusd client CLI or JDBC/ODBC will get the expected results.
:::
