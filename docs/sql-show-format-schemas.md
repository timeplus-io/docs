# SHOW FORMAT SCHEMAS
List schemas in the current Timeplus deployment:
```sql
SHOW FORMAT SCHEMAS
```

:::warning Known issue for [Timeplus Enterprise 2.4.15](enterprise-releases#known_issue_2_4_15)
Running this SQL in Timeplus Console (web UI) won't render the results properly. Running such SQL via timeplusd client CLI or JDBC/ODBC will get the expected results.
:::
