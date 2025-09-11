# Slack 

Leveraging HTTP external stream, you can write / materialize data to Slack directly from Timeplus to trigger notifications.

## Trigger Slack Notifications {#example-trigger-slack}

You can follow [the guide](https://api.slack.com/messaging/webhooks) to configure an "incoming webhook" to send notifications to a Slack channel.

```sql
CREATE EXTERNAL STREAM http_slack_t1 (text string) SETTINGS
type = 'http', data_format='Template',
format_template_resultset_format='{"blocks":[{"type":"section","text":{"type":"mrkdwn","text":"${data}"}}]}',
format_template_row_format='${text:Raw}',
url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
```

Then you can insert data via a materialized view or just via `INSERT` command:
```sql
INSERT INTO http_slack_t1 VALUES('Hello World!');
INSERT INTO http_slack_t1 VALUES('line1\nline2');
INSERT INTO http_slack_t1 VALUES('msg1'),('msg2');
INSERT INTO http_slack_t1 VALUES('This is unquoted text\n>This is quoted text\n>This is still quoted text\nThis is unquoted text again');
```

Please follow Slack's [text formats](https://api.slack.com/reference/surfaces/formatting) guide to add rich text to your messages.
