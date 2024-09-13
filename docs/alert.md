# Alert

:::info

The alert system and UI are experimental. Please share your feedback to help us to improve it.

:::

Timeplus provides out-of-box charts and dashboards. You can also create [sinks](/destination) to send downsampled data to Kafka or other message buses, or notify others via email/slack. You can even send new messages to Kafka, then consume such messages timely in the downstream system. This could be a solution for alerting and automation.

Since it's a common use case to define and manage alerts, Timeplus started supporting alerts out-of-box.

## Create New Alert Rule

Access the `/console/alerts` page to open the new Alert Manager.

You can check the button to create a new alert. Parameters:

* Name: required, a unique name to identify the alert among other alerts in your workspace.
* Severity: Critical, High, Low
* Description: optional text to describe the purpose or logic of the alert
* Trigger SQL: required. A streaming SQL. Once there is any new result from the query, Timeplus will fire the alert.
* Clear SQL: optional. Another streaming SQL. Once there is any new result from the query, Timeplus will set this alert as resolved.
* Output: currently we support Slack and PagerDuty to notify the users.
  * Slack: 
    * Webhook URL: required. Please follow the [guide](/destination#slack) to create one from slack.com.
    * (Trigger) message body: optional. The message title is `New Alert alert on ALERT_NAME is triggered!` By default the message is ` Event: JSON` You can customize the default template. Refer to the value for each column using the `{{.column}}` expression.
    * (Clear) message body: optional. The message title is ` Alert alert on ALERT_NAME is resolved!` By default the message is ` Event: JSON` You can customize the default template. Refer to the value for each column using the `{{.column}}` expression.
  * PagerDuty:
    * Routing Key: required. 32 character Integration Key for an integration on a PagerDuty service or rule set.  Please check the PagerDuty documentation for details.
    * Component: optional, the additional context about what component goes wrong.

Example:

* You can set the Trigger SQL as `select avg(speed_kmh) as avg from tumble(car_live_data,5s) group by window_start having avg>51`
* Clear SQL as `select avg(speed_kmh) as avg from tumble(car_live_data,5s) group by window_start having avg<=51`
* The message body for trigger message is `Avg car speed is {{.avg}}`

## List Alerts

The **Alerts** tab shows the alert history. The alert status is either ALERT or OK. You can manually resolve an alert in ALERT status.



## List Alerts Rules

The **Alert Rules** tab lists all defined alert rules. You can edit  or delete the rule or resolve one alert no matter what status it is.

