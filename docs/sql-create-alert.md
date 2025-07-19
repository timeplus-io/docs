# CREATE ALERT
Starting from [Timeplus Enterprise 2.9](/enterprise-v2.9), you can create alerts to monitor your streaming data and automatically trigger actions when specific conditions are met.

## Syntax
```sql
CREATE [OR REPLACE] ALERT [IF NOT EXISTS] [database.]alert_name
BATCH <N> EVENTS WITH TIMEOUT <nUnit>
LIMIT <N> ALERTS PER <nUnit>
CALL <python_udf_name>
AS <select_query>
```

For example:
```sql
CREATE ALERT default.test
BATCH 10 EVENTS WITH TIMEOUT 5s
LIMIT 1 ALERTS PER 15s
CALL send_to_http
AS SELECT value FROM default.foo;
```

## Limitations
* The alerts only run on the metadata leader node.
* The return value of the Python UDF is ignored.
* The select query cannot include any aggregation or JOIN.
* Check `system.stream_state_log` for the alert states or logs.
* The checkpoints of the alerts are available in `system.alert_ckpt_log` stream with the `_tp_sn` column.

## Python UDF
You can import Python libraries and build the custom alert action via [Python UDF](/py-udf). The return value doesn't matter. Here is an example to send events to a specific Slack channel via Slack webhook:

```sql
CREATE OR REPLACE FUNCTION alert_action_proton_new_star(actor string) RETURNS string LANGUAGE PYTHON AS $$
import json
import requests
def alert_action_proton_new_star(value):
    for i in range(len(value)):
        github_id=value[i]
        requests.post("https://hooks.slack.com/services/T123/B456/other_id", data=json.dumps({"text": f"New 🌟 for Timeplus Proton from https://github.com/{github_id}"}))
    return value
$$
```
Please note, similar to regular Python UDF, the input parameter of the Python UDF is an array, instead of a single event. The return value can be anything but you can return the input value, so that you can test the Python UDF via `SELECT udf_name(input)`.

## See also
* [SHOW ALERTS](/sql-show-alerts) - Show alerts
* [DROP ALERT](/sql-drop-alert) - Drop alerts
