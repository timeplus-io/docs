# Alert

Timeplus provides out-of-box charts and dashboards. You can also create [sinks](/destination) to send downsampled data to Kafka or other message buses, or notify others via email/slack. You can even send new messages to Kafka, then consume such messages timely in the downstream system. This could be a solution for alerting and automation.

Since it's a common use case to define and manage alerts, Timeplus supports alerting out-of-box.

Before Timeplus Enterprise v2.9, the alert feature was implemented in the application server. To improve performance, stability and SQL-based manageability, the alert feature is available in the core engine since v2.9.

The previous alerting feature will be deprecated in the future releases.

## Create New Alert Rule

```sql
-- using to_interval_xxx
CREATE ALERT default.test
BATCH 10 EVENTS WITH TIMEOUT to_interval_second(5)
LIMIT 1 ALERTS PER to_interval_second(15)
AS SELECT value  FROM default.foo
CALL send_to_http;

-- using INTERVAL operator
CREATE ALERT default.test
BATCH 10 EVENTS WITH TIMEOUT INTERVAL 5 SECOND
LIMIT 1 ALERTS PER INTERVAL 15 SECOND
AS SELECT value  FROM default.foo
CALL send_to_http;

-- using interval alias
CREATE ALERT default.test
BATCH 10 EVENTS WITH TIMEOUT 5s
LIMIT 1 ALERTS PER 15s
AS SELECT value  FROM default.foo
CALL send_to_http;
```

## List Alerts



## List Alerts Rules
