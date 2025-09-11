# Datadog 

Leveraging HTTP external stream, you can write / materialize data to Datadog directly from Timeplus.

## Write to Datadog {#example-write-to-datadog}

Create or use an existing API key with the proper permission for sending data.

Create the HTTP external stream in Timeplus:
```sql
CREATE EXTERNAL STREAM datadog_t1 (event string)
SETTINGS
type = 'http',
data_format = 'JSONEachRow',
output_format_json_array_of_rows = 1,
http_header_DD_API_KEY = 'THE_API_KEY',
http_header_Content_Type = 'application/json',
url = 'https://http-intake.logs.us3.datadoghq.com/api/v2/logs' --make sure you set the right region
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO datadog_t1(message, hostname) VALUES('test message','a.test.com'),('test2','a.test.com');
```
