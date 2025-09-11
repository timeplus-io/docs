# Redpanda Connect

Since December 2022, Timeplus has utilized the [Benthos framework](https://github.com/redpanda-data/benthos) to connect with external systems beyond Kafka and ClickHouse. For example, WebSocket sources are powered by Redpanda Connect. We offer a user-friendly wizard that allows developers to effortlessly consume data from WebSockets.

With the release of [Timeplus Enterprise v2.5](/enterprise-v2.5), we've elevated this integration. All Redpanda Connect input and output components are now available within Timeplus Enterprise.

:::info
Since [Timeplus Enterprise v2.7](/enterprise-v2.7), we've added support for postgres_cdc, mysql_cdc, and snowflake_streaming connectors. Please note those connectors require an enterprise license from Redpanda, which you need to set the `REDPANDA_CONNECT_LICENSE` environment variable.
:::

## Key Concepts in Redpanda Connect
[Redpanda Connect](https://www.redpanda.com/connect) is a declarative data streaming service that solves a wide range of data engineering problems with simple, chained, stateless processing steps.

### Inputs
An [input](https://docs.redpanda.com/redpanda-connect/components/inputs/about/) is a source of data piped through an array of optional [processors](#processors), such as:
```yaml
input:
  label: my_redis_input

  redis_streams:
    url: tcp://localhost:6379
    streams:
      - benthos_stream
    body_key: body
    consumer_group: benthos_group

  # Optional list of processing steps
  processors:
   - mapping: |
       root.document = this.without("links")
       root.link_count = this.links.length()
```
In Timeplus Enterprise, you can open the "Data Collection" page and choose a type of input connector provided by Redpanda Connect, then set the configuration yaml. You can add any number of inputs or processors, but cannot set the output in the yaml file, since Timeplus will send the input data to a stream. You can run queries on the stream or send data from the stream to other systems.

### Outputs
An [output](https://docs.redpanda.com/redpanda-connect/components/outputs/about/) is a sink where we wish to send our consumed data after applying an optional array of [processors](#processors).
```yaml
output:
  label: my_s3_output

  aws_s3:
    bucket: name
    path: '${! meta("kafka_topic") }/${! json("message.id") }.json'

  # Optional list of processing steps
  processors:
    - mapping: '{"message":this,"meta":{"link_count":this.links.length()}}'
```
In Timeplus Enterprise, you can submit a streaming SQL in SQL Console, and click the "Save As" button and choose "Sink". Expand the "Send data via Redpanda Connect" section or type a keyword to search for suitable output components. You should not add input or processor in the yaml configuration file, since Timeplus will send the streaming SQL results to the pipeline as input. You can transform the input data via SQL.

### Processors

Redpanda Connect [processors](https://docs.redpanda.com/redpanda-connect/components/processors/about/) are functions applied to messages passing through a pipeline. The function signature allows a processor to mutate or drop messages depending on the content of the message. There are many types on offer but the most powerful are the mapping and mutation processors, for example:
```yaml
processors:
  - mapping: |
      root = {}
      root.raw = content().string()
```
Processors can be defined in `inputs` section or at the top level.

## Available Connectors

All input/output/processor components from the latest Redpanda Connect are available in Timeplus Enterprise, except the following ones:
* `kafka` and `kafka_franz`: please create [external streams for Kafka](/kafka-source) to read or write Kafka data.
* `pulsar`: please create [external streams for Pulsar](/pulsar-source) to read or write Pulsar data.
* `snowflake_put` and `splunk`: those 2 components require [Enterprise Edition license](https://redpanda.com/compare-platform-editions) from Redpanda. Please contact [Redpanda Sales](https://redpanda.com/try-redpanda) to request a trial license, or to purchase an Enterprise Edition license.
* `csv`, `file`, `stdin`: those are designed for local development and tests. Please use the "CSV Upload" feature in "Data Collection" page.

## Support Level

For those data sources and sinks listed in "Timeplus Connect" section, those are supported by Timeplus Inc, such as external streams for Kafka or Pulsar, or external tables for ClickHouse, as well as WebSocket, HTTP Stream, NATS. UI wizards are also available for those integrations.

For items in the "Redpanda Connect" section, no matter in "Data Collection" page or "Sink" page, you need to ensure the proper yaml configuration file. Some of them are supported by Redpanda Data Inc, and some are supported by Redpanda Community. Please check the [support level](https://docs.redpanda.com/redpanda-connect/components/connector-support-levels/) tag in the web UI or refer to the [Connect Catalog](https://docs.redpanda.com/redpanda-connect/components/catalog/) documentation of Redpanda.

## How to build and debug the yaml

Please read the [Get Started](https://docs.redpanda.com/redpanda-connect/guides/getting_started/) documentation of Redpanda Connect to learn how to use the framework. It's recommended you setup a local Redpanda Connect environment and use proper logging to debug the pipeline. You can set
```yaml
output:
  stdout: {}
```
while debugging an input pipeline. After you confirm it works as expected, you can put the yaml configuration in Timeplus Enterprise, just need to remove the `output` section.

## Example: Read data from S3 bucket and send outliers to Postgres

In this demo, we'll show you how to load a large file from Amazon S3, store it in Timeplus, and apply streaming ETL to downsample the data and write it into an external Postgres database.

For visual learners, please check the following video: PLACEHOLDER

### Step 1: Create the S3 Source

Begin by typing `s3` in the search bar and select the AWS S3 input. Here is the sample configuration file:
```yaml
input:
  aws_s3:
    bucket: "tptest-large-files"
    region: "us-west-2"
    codec: lines
    credentials:
      id: ".."
      secret: ".."
  processors:
    - mapping: |
        root = {}
        root.raw = content().string()
```
There is a web access log file (3.3GB) in the bucket. Each line is a plain text, like this:
```
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET /filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```
You can save each line as a string column in a Timeplus stream.

### Step 2: Create a Stream
Create a stream, such as `web_access_logs`.

As data is ingested, immediate querying is possible via:
```sql
SELECT * FROM web_access_logs
```

On the streams list page, you can monitor the number of rows imported.

Next, let's parse this web access log data using the built-in [grok](/functions_for_text#grok) function, which is more readable than regular expressions.

```sql
SELECT grok(raw,'%{DATA:ip} - - \[%{DATA:timestamp}\] ("?)%{DATA:method} %{DATA:path}("?) %{INT:code} %{INT:size} ("?)%{DATA:url}("?) ("?)%{DATA:browser}("?) ("?)-("?)') as event,
event['browser'] as browser,event['code'] as code, event['ip'] as ip,event['method'] as method,event['path'] as path,to_int32_or_zero(event['size']) as size,event['timestamp'] as timestamp
FROM table(web_access_logs)  limit 10
```

### Step 3: Create a Materialized View for transformation

We’ll now create a materialized view in Timeplus to apply streaming transformations.

```sql
create materialized view parsed_webaccesslog AS
select * except event from(SELECT grok(raw,'%{DATA:ip} - - \[%{DATA:timestamp}\] ("?)%{DATA:method} %{DATA:path}("?) %{INT:code} %{INT:size} ("?)%{DATA:url}("?) ("?)%{DATA:browser}("?) ("?)-("?)') as event,
event['browser'] as browser,event['code'] as code, event['ip'] as ip,event['method'] as method,event['path'] as path,to_int32_or_zero(event['size']) as size,event['timestamp'] as timestamp
FROM web_access_logs where _tp_time > earliest_ts())
```

### Step 4: Query the Materialized View and send to Postgres
Finally, let's use a tumbling window aggregation to identify the top five IP addresses with the largest HTTP request sizes and send this data to a Postgres database.

```sql
select window_start as windowStart, ip, sum(size) as total_size from tumble(parsed_webaccesslog,5s)
where _tp_time > earliest_ts()
group by window_start, ip
order by total_size desc limit 5 by window_start
```
Execute the query to read from the materialized view and save it as a sink.

By typing 'postgres' as the keyword, you can choose `sql_insert`. Set the configuration file as following:
```yaml
output:
  label: ""
  sql_insert:
    driver: "postgres"
    dsn: "postgres://user:password@host:port/defaultdb?sslmode=require"
    init_statement: |
      CREATE TABLE IF NOT EXISTS top_traffic (
      windowStart varchar NULL,
      ip varchar NULL,
      total_size bigint NULL
      )
    table: "top_traffic"
    columns: ["windowStart","ip","total_size"]
    args_mapping: root = [ this.windowStart, this.ip,this.total_size]

```
This will create the table if it doesn’t already exist.

Once the data sink is created, let's review the end-to-end data pipeline. This is visualized on our data lineage page, where a diagram is automatically generated, illustrating the relationships between the data source, data stream, materialized views, and sink. You can review configurations and metrics for each component.

Lastly, we’ll verify the data in Postgres by a SQL client and checking the newly inserted rows.

## Summary

The new version of Timeplus Enterprise unlocks the full potential of Redpanda Connect. Developers now have access to over 200 connectors within Timeplus Enterprise. By combining the powerful stream processing and unified analytics capabilities of Timeplus, we anticipate exciting new applications from our developer community.

## Limitations

* Many input components from Redpanda Connect are designed for one-time batch load. After all data is loaded, please delete the source in Timeplus. Otherwise, when the Timeplus server is restarted, those input pipelines will be executed again.
* For data sources and downstream supported by Timeplus, such as Kafka, Pulsar, ClickHouse, S3 (coming), please use the native integrations. Those will perform better and work well in clusters.
