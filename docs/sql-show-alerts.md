# SHOW ALERTS
Starting from [Timeplus Enterprise 2.9](/enterprise-v2.9), you can create alerts to monitor your streaming data and automatically trigger actions when specific conditions are met.

You can list all alerts in the current database via:
```sql
SHOW ALERTS [FROM database_name] [SETTINGS verbose=true]
```

Or list alerts from a specified database namespace:
```sql
SHOW ALERTS FROM database_name
```

If you add `SETTINGS verbose=true` to the SQL command, more details will be printed out.

## See also
* [CREATE ALERT](/sql-create-alert) - Create alerts
* [DROP ALERT](/sql-drop-alert) - Drop alerts
