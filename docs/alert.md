# Alert

Timeplus provides out-of-box charts and dashboards. You can also create [sinks](/destination) to send downsampled data to Kafka or other message buses, or notify others via email/slack. You can even send new messages to Kafka, then consume such messages timely in the downstream system. This could be a solution for alerting and automation.

Since it's a common use case to define and manage alerts, Timeplus supports alerting out-of-box.

Before Timeplus Enterprise v2.9, the alert feature was implemented in the application server. To improve performance, stability and SQL-based manageability, the alert feature is available in the core engine since v2.9.

The previous alerting feature will be deprecated in the future releases.

## Create New Alert

### Syntax
```sql
CREATE [OR REPLACE] ALERT [IF NOT EXIST] [database.]alert_name
BATCH <N> EVENTS WITH TIMEOUT <nUnit>
LIMIT <N> ALERTS PER <nUnit>
AS <select_query>
CALL <python_udf_name>;
```

For example:
```sql
CREATE ALERT default.test
BATCH 10 EVENTS WITH TIMEOUT 5s
LIMIT 1 ALERTS PER 15s
AS SELECT value FROM default.foo
CALL send_to_http;
```

### Limitations
* The alerts only run on the metadata leader node.
* The return value of the Python UDF is ignored.
* The select query cannot include any aggregation or JOIN.
* Check `system.stream_state_log` for the alert states or logs.
* The checkpoints of the alerts are available in `system.alert_ckpt_log` stream with the `_tp_sn` column.

### Python UDF
You can import Python libraries and build the custom alert action via [Python UDF](/py-udf). The return value doesn't matter. Here is an example:

```sql
CREATE OR REPLACE FUNCTION send_to_http(value uint16)
RETURNS bool LANGUAGE PYTHON AS
$$
import datetime
import json
import requests

def send_to_http(value):
    if len(value) < 1:
    return False

    resp = requests.post("http://mock_server:7890/alerts", data=json.dumps({"ts": str(datetime.datetime.utcnow()), "data": value}))
    return resp.status_code < 300
$$;
```

## List Alerts
```sql
SHOW ALERTS [FROM database_name] [SETTINGS verbose=true]
```

## Show Alert Definition
```sql
SHOW CREATE ALERT [database.]alert_name [SETTINGS show_multi_versions=true]
```

## Drop Alerts
```sql
DROP ALERT [database.]alert_name
```
