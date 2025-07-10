# CREATE ALERT
Starting from [Timeplus Enterprise 2.9](/enterprise-v2.9), you can create alerts to monitor your streaming data and automatically trigger actions when specific conditions are met.

## Syntax
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

## Limitations
* The alerts only run on the metadata leader node.
* The return value of the Python UDF is ignored.
* The select query cannot include any aggregation or JOIN.
* Check `system.stream_state_log` for the alert states or logs.
* The checkpoints of the alerts are available in `system.alert_ckpt_log` stream with the `_tp_sn` column.

## Python UDF
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

## See also
* [SHOW ALERTS](/sql-show-alerts) - Show alerts
* [DROP ALERT](/sql-drop-alert) - Drop alerts
