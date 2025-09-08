# Alert

Timeplus alerts enable you to monitor your streaming data and automatically trigger actions when specific conditions are met. When your streaming queries detect events of interest, alerts can notify stakeholders via email or Slack, send data to downstream systems like Apache Kafka, or execute custom Python functions for automated responses.

## Create New Alert

### Syntax
```sql
CREATE [OR REPLACE] ALERT [IF NOT EXISTS] [database.]alert_name
BATCH <N> EVENTS WITH TIMEOUT <nUnit>
LIMIT <N> ALERTS PER <nUnit>
CALL <python_udf_name>
AS <select_query>;
```

For example:
```sql
CREATE ALERT default.test
BATCH 10 EVENTS WITH TIMEOUT 5s
LIMIT 1 ALERTS PER 15s
CALL alert_action_proton_new_star
AS SELECT actor FROM github_events WHERE repo='timeplus-io/proton' AND type='WatchEvent'
```

### Limitations
* The alerts only run on the metadata leader node.
* The return value of the Python UDF is ignored.
* The select query cannot include any aggregation or JOIN. You can create a materialized view with complex JOIN or aggregation logic to cache the alert events and `SELECT` the target stream of the materialized view in the alert definition.
* Check `system.stream_state_log` for the alert states or logs.
* The checkpoints of the alerts are available in `system.alert_ckpt_log` stream with the `_tp_sn` column.

### Python UDF
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

## List Alerts
```sql
SHOW ALERTS [FROM database_name] [SETTINGS verbose=true]
```

Without `SETTINGS verbose=true`, it lists the alert name and its UUID. With `SETTINGS verbose=true`, the following columns are added:
* version
* last_modified
* last_modified_by
* created
* created_by

## Show Alert Definition
```sql
SHOW CREATE ALERT [database.]alert_name [SETTINGS show_multi_versions=true]
```

## Drop Alerts
```sql
DROP ALERT [database.]alert_name
```
