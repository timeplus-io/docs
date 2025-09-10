# Splunk

Leveraging HTTP external stream, you can write / materialize data to Splunk directly from Timeplus.

## Write to Splunk {#example-write-to-splunk}

Follow [the guide](https://docs.splunk.com/Documentation/Splunk/9.4.1/Data/UsetheHTTPEventCollector) to set up and use HTTP Event Collector(HEC) in Splunk. Make sure you create a HEC token for the desired index and enable it.

Create the HTTP external stream in Timeplus:
```sql
CREATE EXTERNAL STREAM http_splunk_t1 (event string)
SETTINGS
type = 'http',
data_format = 'JSONEachRow',
http_header_Authorization='Splunk the-hec-token',
url = 'http://host:8088/services/collector/event'
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO http_splunk_t1 VALUES('test1'),('test2');
```
