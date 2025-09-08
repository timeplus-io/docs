# HTTP External Stream

You can send data to HTTP endpoints via the HTTP External Stream. You can use this feature to trigger Slack notifications or send streaming data to downstream systems, such as Splunk, Datadog, Elasticsearch, Databricks, or any other HTTP-based service.

Currently, it only supports writing data to HTTP endpoints, but reading data from HTTP endpoints is not supported yet.

## CREATE EXTERNAL STREAM

To create an external stream for HTTP endpoints, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] name
    (<col_name1> <col_type1>, <col_name2> <col_type2>, ...)
SETTINGS
    type = 'http',
    url = '', -- the HTTP URL the external stream read/write data from/to
    data_format = '..', -- case-sentive, besides common ones as JSONEachRow, also support OpenSearch and ElasticSearch. Use Template to create customized payload
    write_method = 'POST', -- optional, the HTTP method for write, default to POST
    compression_method = 'none', -- optional, method for handle request/response body
    use_chunked_encoding = true, -- optional, use Chunked Transfer Encoding for sending data
    http_header_..= '..', -- optional, HTTP header key-value pairs
    -- optional auth settings
    username = '..', -- usename for HTTP basic authentication ( conflicts with http_header_Authorization )
    password = '..', -- password for HTTP basic authentication
    -- settings for Template format
    format_template_resultset_format = '..',
    format_template_row_format = '..',
    format_template_rows_between_delimiter = '..', --default to '\n'
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

#### Write to Datadog {#example-write-to-datadog}

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

#### Write to Algolia {#example-write-to-algolia}

The [Algolia Ingestion API](https://www.algolia.com/doc/rest-api/ingestion/) accepts multiple rows in a single request in the following JSON payload:
```json
{
  "action":"addObject",
  "records":[
    {"objectID":"id1","column1":"value1","column2":"value2"},
    {"objectID":"id2","column1":"value1","column2":"value2"},
  ]
}
```
The `objectID` need to be unique for each record. Assuming the document contains 3 columns: `firstname`, `lastname`, and `zip_code`, you can create the HTTP external stream as this:
```sql
CREATE EXTERNAL STREAM http_algolia_t1 (
    objectID string default uuid(),
    firstname string,
    lastname string,
    zip_code int32)
SETTINGS
type = 'http',
http_header_x_algolia_application_id='..',
http_header_x_algolia_api_key='..',
url = 'https://data.us.algolia.com/2/tasks/../push',
data_format = 'Template',
format_template_resultset_format='{"action":"addObject","records":[${data}]}',
format_template_row_format='{"objectID":${objectID:JSON},"firstname":${firstname:JSON},"lastname":${lastname:JSON},"zip_code":${zip_code:JSON}}',
format_template_rows_between_delimiter=','
```

Follow the [documentation](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/) to create a "Push to Algolia" connector, and obtain the task ID, as well as application ID and API key.

You can insert multiple rows to the algolia index via materialized views or `INSERT` command:
```sql
INSERT INTO http_algolia_t1(firstname,lastname,zip_code)
VALUES('firstnameA','lastnameA',123),('firstnameB','lastnameB',987)
```

#### Write to BigQuery {#example-write-to-bigquery}

Assume you have created a table in BigQuery with 2 columns:
```sql
create table `PROJECT.DATASET.http_sink_t1`(
    num int,
    str string);
```

Follow [the guide](https://cloud.google.com/bigquery/docs/authentication) to choose the proper authentication to Google Cloud, such as via the gcloud CLI `gcloud auth application-default print-access-token`.

Create the HTTP external stream in Timeplus:
```sql
CREATE EXTERNAL STREAM http_bigquery_t1 (num int,str string)
SETTINGS
type = 'http',
http_header_Authorization='Bearer $OAUTH_TOKEN',
url = 'https://bigquery.googleapis.com/bigquery/v2/projects/$PROJECT/datasets/$DATASET/tables/$TABLE/insertAll',
data_format = 'Template',
format_template_resultset_format='{"rows":[${data}]}',
format_template_row_format='{"json":{"num":${num:JSON},"str":${str:JSON}}}',
format_template_rows_between_delimiter=','
```

Replace the `OAUTH_TOKEN` with the output of `gcloud auth application-default print-access-token` or other secure way to obtain OAuth token. Replace `PROJECT`, `DATASET` and `TABLE` to match your BigQuery table path. Also change `format_template_row_format` to match the table schema.

Then you can insert data via a materialized view or just via `INSERT` command:
```sql
INSERT INTO http_bigquery_t1 VALUES(10,'A'),(11,'B');
```

#### Write to Databricks {#example-write-to-databricks}

Follow [the guide](https://docs.databricks.com/aws/en/dev-tools/auth/pat) to create an access token for your Databricks workspace.

Assume you have created a table in Databricks SQL warehouse with 2 columns:
```sql
CREATE TABLE sales (
  product STRING,
  quantity INT
);
```

Create the HTTP external stream in Timeplus:
```sql
CREATE EXTERNAL STREAM http_databricks_t1 (product string, quantity int)
SETTINGS
type = 'http',
http_header_Authorization='Bearer $TOKEN',
url = 'https://$HOST.cloud.databricks.com/api/2.0/sql/statements/',
data_format = 'Template',
format_template_resultset_format='{"warehouse_id":"$WAREHOUSE_ID","statement": "INSERT INTO sales (product, quantity) VALUES (:product, :quantity)", "parameters": [${data}]}',
format_template_row_format='{ "name": "product", "value": ${product:JSON}, "type": "STRING" },{ "name": "quantity", "value": ${quantity:JSON}, "type": "INT" }',
format_template_rows_between_delimiter=''
```

Replace the `TOKEN`, `HOST`, and `WAREHOUSE_ID` to match your Databricks settings. Also change `format_template_row_format` and `format_template_row_format` to match the table schema.

Then you can insert data via a materialized view or just via `INSERT` command:
```sql
INSERT INTO http_databricks_t1(product, quantity) VALUES('test',95);
```

This will insert one row per request. We plan to support batch insert and Databricks specific format to support different table schemas in the future.

#### Trigger Slack Notifications {#example-trigger-slack}

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
- Template: create the payload with customized templates

#### format_template_resultset_format
When you set `date_format` to `Template`, you need to specify both `format_template_resultset_format` and `format_template_row_format`, and optionally `format_template_rows_between_delimiter`.

`format_template_resultset_format` controls how all the rows will be combined to create the POST payload, and contains the following placeholders:
- `data` is the rows with data in `format_template_row_format`, separated by `format_template_rows_between_delimiter`.
- `totals` is the row with total values.
- `min` is the row with minimum values.
- `max` is the row with maximum values.
- `rows_before_limit` is the minimal number of rows there would have been without LIMIT.
- `time` is the request execution time in seconds.
- `rows_read` is the number of rows has been read.
- `bytes_read` is the number of bytes (uncompressed) has been read.

For example:
- To send markdown messages to Slack, the template is `'{"blocks":[{"type":"section","text":{"type":"mrkdwn","text":"${data}"}}]}'`
- To send rows to BigQuery, the template is `'{"rows":[${data}]}'`

#### format_template_row_format

The setting specifies format strings for rows with the following syntax:
```
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```
For example:
- To send markdown messages to Slack, the template is `'${text:Raw}'`
- To send rows to BigQuery, the template is `'{"json":{"num":${num:JSON},"str":${str:JSON}}}'` (replace the column names per your table schema)

The following escaping rules are supported:
  | Rules             | Description                          |
  |-------------------|--------------------------------------|
  | `CSV`, `JSON`, `XML` | Similar to the formats of the same names |
  | `Escaped` | Similar to `TSV` |
  | `Quoted` | Similar to `Values` |
  | `Raw` | 	Without escaping, similar to `TSVRaw`|

#### format_template_rows_between_delimiter
The setting format_template_rows_between_delimiter setting specifies the delimiter between rows, which is printed (or expected) after every row except the last one (`\`n by default)


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
