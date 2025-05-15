# HTTP External Stream

Since [Timeplus Enterprise v2.9](/enterprise-v2.9), Timeplus can send data to HTTP endpoints via the HTTP External Stream. You can use this feature to trigger Slack notifications or send streaming data to downstream systems, such as Splunk, Elasticsearch, or any other HTTP-based service.

Currently, it only supports writing data to HTTP endpoints, but reading data from HTTP endpoints is not supported yet.

## CREATE EXTERNAL STREAM

To create an external stream for HTTP endpoints, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] name
    (<col_name1> <col_type1>, <col_name2> <col_type2>, ...)
SETTINGS
    type = 'http',
    url = '', -- the HTTP URL the external stream read/write data from/to
    data_format = '..', -- case-sentive, besides common ones as JSONEachRow, also support OpenSearch and ElasticSearch
    write_method = 'POST', -- optional, the HTTP method for write, default to POST
    compression_method = 'none', -- optional, method for handle request/response body
    use_chunked_encoding = true, -- optional, use Chunked Transfer Encoding for sending data
    http_header_..= '..', -- optional, HTTP header key-value pairs
    -- optional auth settings
    username = '..', -- usename for HTTP basic authentication ( conflicts with http_header_Authorization )
    password = '..', -- password for HTTP basic authentication
    -- optiona SSL related settings
    ssl_ca_cert_file = '..', -- the path of the CA certificate file
    ssl_ca_pem = '..', -- the content of the CA certificate file (in PEM format), conflicts with ssl_ca_cert_file
    skip_ssl_cert_check = true|false, -- optional, default to false. Set it to true for self-signed certificate
    client_key = '..', -- the private key for client
    -- timeout settings
    http_keep_alive_timeout = 10, -- timeout (in seconds) for HTTP keep-alive connection
    send_timeout = 300, -- seconds
    receive_timeout = 300 -- seconds
```
For the full list of settings, see the [DDL Settings](#ddl-settings) section.

### Examples

#### Write to OpenSearch/ElasticSearch {#example-write-to-es}
Assuming you have created an index `students` in a deployment of OpenSearch or ElasticSearch, you can create the following external stream to write data to the index.

```sql
CREATE EXTERNAL STREAM opensearch_t1 (
  name string,
  gpa float32,
  grad_year int16
) SETTINGS
type = 'http',
data_format = 'OpenSearch', --can also use the alias "ElasticSearch"
url = 'https://opensearch.company.com:9200/students/_bulk',
username='admin',
password='..'
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO opensearch_t1(name,gpa,grad_year) VALUES('Jonathan Powers',3.85,2025);
```

#### Write to Splunk {#example-write-to-splunk}
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

#### Trigger Slack Notifications {#example-trigger-slack}

You can follow [the guide](https://api.slack.com/messaging/webhooks) to configure an "incoming webhook" to send notifications to a Slack channel.

```sql
CREATE EXTERNAL STREAM http_slack_t1 (text string) SETTINGS
type = 'http',
data_format = 'JSONEachRow',
url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO http_slack_t1 VALUES('Hello World!');
```

The above example only supports plain text message. If you want to send messages with rich format, such as quote, new line, you need to create blocks and sections with markdown format. Please follow Slack's [text formats](https://api.slack.com/reference/surfaces/formatting) guide to add rich text to your messages. Please note not all features are supported, and you may need to construct a complex JSON payload.
```sql
CREATE EXTERNAL STREAM http_slack_t2 (text string) SETTINGS
type = 'http', data_format='RawBLOB',
url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
;
INSERT INTO http_slack_t2 VALUES('{"blocks":[{"type":"section","text":{"type":"mrkdwn","text":"line1\nline2"}}]}');
INSERT INTO http_slack_t2 VALUES('{"blocks":[{"type":"section","text":{"type":"mrkdwn","text":"This is unquoted text\n>This is quoted text\n>This is still quoted text\nThis is unquoted text again"}}]}');
```

Since the Slack HTTP API only supports one message per request, in the `INSERT` or `CREATE MATERIALIZED VIEW`, add `SETTINGS max_insert_block_size=1 ` to ensure the HTTP external stream only send one row for one request.

### DDL Settings

#### type
The type of the external stream. The value must be `http` to send data to HTTP endpoints.

#### config_file
The `config_file` setting is available since Timeplus Enterprise 2.7. You can specify the path to a file that contains the configuration settings. The file should be in the format of `key=value` pairs, one pair per line. You can set the HTTP credentials or Authentication tokens in the file.

Please follow the example in [Kafka External Stream](/proton-kafka#config_file).

#### url
The endpoint of the HTTP service. Different services and different use cases may have different endpoints. For example, to send data to a specified OpenSearch index, you can use `http://host:port/my_index/_bulk`. To send data to multiple indexes (depending on the column in the streaming SQL), you can use `http://host:port/_bulk` and also specify the `output_format_opensearch_index_column`.

#### data_format
The `data_format` specifies how the HTTP POST body is constructed. We have built a special integration with OpenSearch or ElasticSearch, with data_format='OpenSearch' or data_format='ElasticSearch'.

Other supported values for `data_format` are:

- JSONEachRow: each row of the message as a single JSON document. The top level JSON key/value pairs will be parsed or constructed as the columns. If you need the POST body to be a JSON array for multiple rows in a batch, also set `output_format_json_array_of_rows=1` in the DDL. If you need each POST body represents a single row as a JSON object, set `one_message_per_row=true`.
- CSV: less commonly used.
- TSV: similar to CSV but tab as the separator
- ProtobufSingle: for single Protobuf message per message
- Protobuf: there could be multiple Protobuf messages in a single message.
- Avro
- RawBLOB: the default value. Read/write message as plain text.

#### http_header_Authorization
You can set key/value pairs in HTTP header, using the format `http_header_key=value`. For example to set the Authorization header for Splunk HEC, you can use `http_header_Authorization=Splunk hec_token`.

#### output_format_json_array_of_rows
If you need the POST body to be a JSON array for multiple rows in a batch, set `output_format_json_array_of_rows=1`, e.g.
```sql
CREATE EXTERNAL STREAM http_openobserve_t1 (
  level string,
  job string,
  log string
) SETTINGS
type = 'http',
data_format = 'JSONEachRow',
output_format_json_array_of_rows = 1,
username='..',
password='..',
url = 'https://api.openobserve.ai/api/../default/_json'
```

## DROP EXTERNAL STREAM

```sql
DROP STREAM [IF EXISTS] name
```
