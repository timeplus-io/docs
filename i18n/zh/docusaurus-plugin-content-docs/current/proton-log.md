# Read Log Files

You can use Proton as a lightweight and high-performance tool for log analysis. Please check [the blog](https://www.timeplus.com/post/log-stream-analysis) for more details.

:::info

Please note this feature is in Technical Preview. More settings to be added/tuned.

:::

```sql
CREATE EXTERNAL STREAM proton_log(
  raw string
)
SETTINGS
type='log',
   log_files='proton-server.log',
   log_dir='/var/log/proton-server',
   timestamp_regex='^(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}\.\d+)',
   row_delimiter='(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}\.\d+) \[ \d+ \] \{'
```
