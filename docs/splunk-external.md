# Splunk

Leveraging HTTP external stream, you can write / materialize data to Splunk directly from Timeplus.

## Write to Splunk {#example-write-to-splunk}

Follow [the guide](https://docs.splunk.com/Documentation/Splunk/9.4.1/Data/UsetheHTTPEventCollector) to set up and use HTTP Event Collector(HEC) in Splunk. Make sure you create a HEC token for the desired index and enable it.

You can create either 'http' or 'splunk-hec-output' external stream to write to Splunk.

### HTTP

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

### Splunk HEC Output

External stream type `splunk-hec-output` is specialized for writing data to Splunk HEC. It is easier to use in most cases and error-proofing.

Create Splunk HEC Output
```sql
CREATE EXTERNAL STREAM splunk_output
SETTINGS
    type='splunk-hec-output',
    url='https://127.0.0.1:8088/services/collector/event',
    token='b8be719b-e243-4bb2-b79b-58795253ee1a',
    skip_ssl_cert_check=true;
```

The external stream defines columns of Splunk event string and other metadata.

```sql
SHOW CREATE splunk_output;
```

You can insert the event data and optional metadata columns.

```sql
INSERT INTO splunk_output(event, host, source, sourcetype)
VALUES ('event1', 'host1', 'source1', 'sourcetype1');
```
