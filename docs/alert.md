# Alert

## Overview

A **Timeplus Alert** continuously monitors events in a source stream using a **streaming query**. When the specified conditions are met, it triggers a [Python UDF](/py-udf) to **interact with external systems** — for example, sending notifications to **Slack**, **Email**, or other services.

Alerts are often used in combination with [Scheduled Tasks](/task) and [Materialized Views](/materialized-view) to form a **complete, automated data pipeline**, as illustrated below:

![AlertPipeline](/img/alert-pipeline.png)

## Create Alert

```sql
CREATE ALERT [IF NOT EXISTS] <db.alert-name>
BATCH <N> EVENTS WITH TIMEOUT <interval>
LIMIT <M> ALERTS PER <interval>
CALL <python-udf-name>
AS <streaming-select-query>;
```

:::info
The **streaming select query** in an **Alert** must be a **simple** `SELECT` statement that consumes data directly from a stream.
Stateful operations such as **joins** or **aggregations** are **not supported** within Alerts.

If your use case requires joins, aggregations, or other complex logic, create a **Materialized View** first to perform those computations and **materialize** the results into a target stream.
Then, the Alert can consume that **pre-computed stream** to trigger external actions.
:::

### `BATCH N EVENTS WITH TIMEOUT interval`

Defines how events are **batched** before invoking the alert action, improving efficiency and throughput.  
Batching can also help with **alert suppression**, reducing redundant or noisy alerts.

The alert is triggered when **either** of the following conditions is met:
- The batch accumulates **`N` events**, or  
- The specified **timeout interval** elapses.

**Example:**

```sql
BATCH 10 EVENTS WITH TIMEOUT 5s
```

In this example, the alert will invoke the configured Python UDF **as soon as**:

- 10 events are collected, or
- 5 seconds pass — whichever happens first.

### `LIMIT M ALERTS PER interval`

Defines **alert suppression** rules to prevent excessive notifications.  
This limits the invocation of the configured Python UDF to at most **`M` alerts** within each specified **`interval`**.

**Example:**

```sql
LIMIT 1 ALERTS PER 10s
```

This example restricts the system to trigger **no more than one alert every 10 seconds**,
even if multiple batches or events meet the alert conditions during that period.

### `CALL python-udf-name`

Specifies the **Python UDF** to invoke when events are emitted from the streaming query and both the **batching** and **suppression** conditions are met.  

The Python UDF must have a compatible function signature (input parameters) that matches the **projection output** of the streaming query (`SELECT` clause).

:::info
Currently, only **Python UDFs** are supported.
:::

### Checkpoint

Timeplus automatically **checkpoints** the sequence numbers (or offsets) of the source stream.  
This ensures that upon recovery, **duplicate alerts are not triggered**.

:::info
Alert checkpoints are stored in the `system.alert_ckpt_log` **Mutable Stream**.
:::

## Example

```sql
CREATE FUNCTION send_star_events_to_slack(actor string) 
RETURNS string 
LANGUAGE PYTHON AS $$
import json
import requests

def send_star_events_to_slack(value):
    for github_id in value:
        requests.post(
            "https://hooks.slack.com/services/T123/B456/other_id",
            data=json.dumps({
                "text": f"New 🌟 for Timeplus Proton from https://github.com/{github_id}"
            })
        )
    return value
$$

CREATE ALERT default.watch_event_alert
BATCH 10 EVENTS WITH TIMEOUT 5s
LIMIT 1 ALERTS PER 15s
CALL send_star_events_to_slack
AS 
SELECT actor 
FROM github_events 
WHERE repo = 'timeplus-io/proton' AND type = 'WatchEvent';
```

**Explanation**:

- The alert continuously monitors the `github_events` stream in the background.
- When a new `WatchEvent` occurs for the GitHub repository `timeplus-io/proton`, the Python UDF `send_star_events_to_slack` is triggered.
- The UDF posts a formatted message to a Slack webhook, notifying the team of new stars.
- To avoid alert flooding, the alert is **rate-limited** to **1 alert every 15 seconds**.
- The alert also **batches events** for efficiency — the UDF is invoked when either **10 events** accumulate or **5 seconds** have passed, whichever comes first.

## List Alerts

```sql
SHOW ALERTS [FROM db] [SETTINGS verbose=true]
```

## Show Alert

```sql
SHOW CREATE ALERT <db.alert-name> [SETTINGS show_multi_versions=true]
```

## Drop Alert

```sql
DROP ALERT <db.alert-name>
```
