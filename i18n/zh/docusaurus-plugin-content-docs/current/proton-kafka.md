# Kafka External Stream

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). Combining with [Materialized View](proton-create-view#m_view) and [Target Stream](proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## CREATE EXTERNAL STREAM

Currently Timeplus external stream only supports Kafka API as the only type.

To create an external stream in Proton:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..',username='..',password='..',sasl_mechanism='..',data_format='..',kafka_schema_registry_url='..',kafka_schema_registry_credentials='..',ssl_ca_cert_file='..'
```

The supported values for `security_protocol` are:

* PLAINTEXT: when this option is omitted, this is also the default value.
* SASL_SSL: when this value is set, username and password should be specified.
  * If you need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'`
  * Skipping the SSL certification verfication can be done via `SETTINGS properties='enable.ssl.certificate.verification=false'`. Check [this section](#properties) for details.


The supported values for `sasl_mechanism` are:

* PLAIN: when you set security_protocol to SASL_SSL, this is the default value for sasl_mechanism.
* SCRAM-SHA-256
* SCRAM-SHA-512

The supported values for `data_format` are:

* ProtobufSingle: for single Protobuf message per Kafka message
* Protobuf: there could be multiple Protobuf messages in a single Kafka message.
* Avro: added in Proton 1.5.2

### Connect to local Kafka or Redpanda {#connect-kafka}

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events'
```

### Connect to Confluent Cloud{#connect-confluent}

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='github_events',
         security_protocol='SASL_SSL', 
         username='..', 
         password='..'
```

### Connect to Redpanda Cloud{#connect-rp-cloud}

示例：

```sql
CREATE EXTERNAL STREAM hello(raw string)
SETTINGS type='kafka', 
         brokers='abc.any.us-east-1.mpx.prd.cloud.redpanda.com:9092',
         topic='hello-world',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='..', 
         password='..'
```

### Connect to Aiven for Apache Kafka{#connect-aiven}

You can connect Proton with an Aiven for Apache Kafka service.

示例：

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin', 
         password='..',
         ssl_ca_cert_file='/kafka.cert'
```

Make sure the `ssl_ca_cert_file` can be accessed via Proton. You can do so via:

```bash
chown timeplus:timeplus kafka.cert
chmod 400 kafka.cert
```

If you want to skip verifying the CA (not recommended), you can create the external stream in the following way:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin', 
         password='..',
         properties='enable.ssl.certificate.verification=false'
```

### Connect to WarpStream{#connect-warp}

You can connect Proton with local deployment of WarpStream or WarpStream Serverless Cloud.

示例：

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='serverless.prod-z.us-east-1.warpstream.com:9092',
         topic='topic',
         security_protocol='SASL_SSL', 
         username='..', 
         password='..'
```

### Connect to Upstash{#connect-upstash}

You can connect Proton with Upstash Serverless Kafka.

示例：

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='grizzly-1234-us1-kafka.upstash.io:9092',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='..', 
         password='..'
```

More detailed instructions are available on [Upstash Docs](https://upstash.com/docs/kafka/integrations/proton).

### Define columns

#### Single column to read from Kafka {#single_col_read}

If the message in Kafka topic is in plain text format or JSON, you can create an external stream with only a `raw` column in `string` type.

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events
         (raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events'
```

Then use query time [JSON extraction functions](functions_for_json) or shortcut to access the values, e.g. `raw:id`.

#### Write to Kafka in Plain Text {#single_col_write}

You can write plain text messages to Kafka topics with an external stream with a single column.

```sql
CREATE EXTERNAL STREAM ext_github_events
         (raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events'
```

Then use either `INSERT INTO <stream_name> VALUES (v)`, or [Ingest REST API](proton-ingest-api), or set it as the target stream for a materialized view to write message to the Kafka topic. The actual `data_format` value is `RawBLOB` but this can be omitted. The actual `data_format` value is `RawBLOB` but this can be omitted.

#### Multiple columns to read from Kafka{#multi_col_read}

If the keys in the JSON message never change, you can also create the external stream with multiple columns (only available to Proton v1.3.24+).

You can pick up some top level keys in the JSON as columns, or all possible keys as columns.

Please note the behaviors are changed in recent versions, based on user feedbacks:



| Version         | By default, proton-client is started in single line and single query mode. To run multiple query statements together, start with the `-n` parameters, i.e. `docker exec -it proton-container-name proton-client -n`                                                                        | How to overwrite                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1.4.2 or above  | Say there are 5 top level key/value pairs in JSON, you can define 5 or less than 5 columns in the external stream. Data will be read properly.                                                                                                                                             | If you don't want to read new events with unexpected columns, set `input_format_skip_unknown_fields=false` in the `CREATE` DDL. |
| 1.3.24 to 1.4.1 | Say there are 5 top level key/value pairs in JSON, you can need to define 5 columns to read them all. Or define less than 5 columns in the DDL, and make sure to add `input_format_skip_unknown_fields=true` in each `SELECT` query settings, otherwise no search result will be returned. | or only define some keys as columns and append this to your query: `SETTINGS input_format_skip_unknown_fields=true`             |
| 1.3.23 or older | You have to define a single `string` column for the entire JSON document and apply query time JSON parsing to extract fields.                                                                                                                                                              | N/A                                                                                                                             |

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events
         (actor string,
          created_at string,
          id string,
          payload string,
          repo string,
          type string
         )
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events',
         data_format='JSONEachRow';
```

If there are nested complex JSON in the message, you can define the column as a string type. Actually any JSON value can be saved in a string column.

:::info

Since Proton v1.3.29, Protobuf messages can be read with all or partial columns. Please check [this page](proton-format-schema). Please check [this page](proton-format-schema).

:::

#### Multiple columns to write to Kafka{#multi_col_write}

To write data via Kafka API (only available to Proton v1.3.18+), you can choose different data formats:

##### JSONEachRow

You can use `data_format='JSONEachRow'`  to inform Proton to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. 例如： The columns of the external stream will be converted to keys in the JSON documents. 例如：

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3), 
    url string, 
    method string, 
    ip string) 
    SETTINGS type='kafka', 
             brokers='redpanda:9092', 
             topic='masked-fe-event', 
             data_format='JSONEachRow';
```

The messages will be generated in the specific topic as
```json
{
"_tp_time":"2023-10-29 05:36:21.957"
"url":"https://www.nationalweb-enabled.io/methodologies/killer/web-readiness"
"method":"POST"
"ip":"c4ecf59a9ec27b50af9cc3bb8289e16c"
}
```

:::info

Please note, since 1.3.25, by default multiple JSON documents will be inserted to the same Kafka message. One JSON document each row/line. Such default behavior aims to get the maximum writing performance to Kafka/Redpanda. But you need to make sure the downstream applications are able to properly split the JSON documents per Kafka message. One JSON document each row/line. Such default behavior aims to get the maximum writing performance to Kafka/Redpanda. But you need to make sure the downstream applications are able to properly split the JSON documents per Kafka message.

If you need a valid JSON per each Kafka message, instead of a JSONL, please set one_message_per_row=true  e.g.

```sql
CREATE EXTERNAL STREAM target(_tp_time datetime64(3), url string, ip string) 
SETTINGS type='kafka', brokers='redpanda:9092', topic='masked-fe-event',
         data_format='JSONEachRow',one_message_per_row=true
```

The default value of one_message_per_row, if not specified, is false.

:::

##### CSV

You can use `data_format='CSV'`  to inform Proton to write each event as a JSON document. The columns of the external stream will be converted to keys in the JSON documents. 例如： The columns of the external stream will be converted to keys in the JSON documents. 例如：

```sql
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3), 
    url string, 
    method string, 
    ip string) 
    SETTINGS type='kafka', 
             brokers='redpanda:9092', 
             topic='masked-fe-event', 
             data_format='CSV';
```

The messages will be generated in the specific topic as

```csv
"2023-10-29 05:35:54.176","https://www.nationalwhiteboard.info/sticky/recontextualize/robust/incentivize","PUT","3eaf6372e909e033fcfc2d6a3bc04ace"
```

##### ProtobufSingle

You can either define the [Protobuf Schema in Proton](proton-format-schema), or specify the [Kafka Schema Registry](proton-schema-registry) when you create the external stream.

##### Avro
Starting from Proton 1.5.2, you can use Avro format when you specify the [Kafka Schema Registry](proton-schema-registry) when you create the external stream.

### Read/Write Kafka Message Key {#messagekey}

For each message in the Kafka topic, the value is critical for sure. The key is optional but could carry important meta data.

**Read:** since Proton 1.5.4, you can read the message key via the `_message_key` virtual column in the Kafka external stream. If you run `SELECT * FROM ext_stream`, such virtual column won't be queried. You need to explicitly select the column to retrieve the message key, e.g. `SELECT _message_key, * FROM ext_stream`.

**Write:** when you create an external stream and send data to it, via a materialized view or `INSERT`, you can specify how the message key is to be generated.

This is done by the setting `message_key` in the `CREATE` DDL. It is an expression that returns a string value, the values return by the expression will be used as the key for each message.

Examples:

```sql
-- use a column
CREATE EXTERNAL STREAM example_one (
  one string,
  two int32
) SETTINGS type='kafka',...,message_key='one';

-- use a complex expression
CREATE EXTERNAL STREAM example_two (
  one string,
  two int32
) SETTINGS type='kafka',...,message_key='split_by_string(\',\', one)[1]';
```

`message_key` can be used together with `sharding_expr`(which specify the target partition number in the Kafka topic), and `sharding_expr` will take higher priority.

## DROP EXTERNAL STREAM

```sql
DROP EXTERNAL STREAM [IF EXISTS] stream_name
```



## Query Kafka Data with SQL

You can run streaming SQL on the external stream, e.g.

```sql
SELECT raw:timestamp, raw:car_id, raw:event FROM ext_stream WHERE raw:car_type in (1,2,3);
SELECT window_start, count() FROM tumble(ext_stream,to_datetime(raw:timestamp)) GROUP BY window_start;
```

### Read existing messages {#rewind}

When you run `SELECT raw FROM ext_stream` , Proton will read the new messages in the topics, not the existing ones. If you need to read all existing messages, you can use the following settings: If you need to read all existing messages, you can use the following settings:

```sql
SELECT raw FROM ext_stream SETTINGS seek_to='earliest'
```



### Read specified partitions

Starting from Proton 1.3.18, you can also read in specified Kafka partitions. By default, all partitions will be read. But you can also read from a single partition via the `shards` setting, e.g. By default, all partitions will be read. But you can also read from a single partition via the `shards` setting, e.g.

```sql
SELECT raw FROM ext_stream SETTINGS shards='0'
```

Or you can specify a set of partition ID, separated by comma, e.g.

```sql
SELECT raw FROM ext_stream SETTINGS shards='0,2'
```



## Write to Kafka with SQL

You can use materialized views to write data to Kafka as an external stream, e.g.

```sql
-- read the topic via an external stream
CREATE EXTERNAL STREAM frontend_events(raw string)
                SETTINGS type='kafka',
                         brokers='redpanda:9092',
                         topic='owlshop-frontend-events';

-- create the other external stream to write data to the other topic
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3), 
    url string, 
    method string, 
    ip string) 
    SETTINGS type='kafka', 
             brokers='redpanda:9092', 
             topic='masked-fe-event', 
             data_format='JSONEachRow';

-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO target AS 
    SELECT now64() AS _tp_time, 
           raw:requestedUrl AS url, 
           raw:method AS method, 
           lower(hex(md5(raw:ipAddress))) AS ip 
    FROM frontend_events;
```

## Tutorial with Docker Compose {#tutorial}

A docker-compose file is created to bundle proton image with Redpanda (as lightweight server with Kafka API), Redpanda Console, and [owl-shop](https://github.com/cloudhut/owl-shop) as sample live data.

1. Download the [docker-compose.yml](https://github.com/timeplus-io/proton/blob/develop/docker-compose.yml) and put into a new folder.
2. Open a terminal and run `docker compose up` in this folder.
3. Wait for few minutes to pull all required images and start the containers. Visit http://localhost:8080 to use Redpanda Console to explore the topics and live data. Visit http://localhost:8080 to use Redpanda Console to explore the topics and live data.
4. Use `proton-client` to run SQL to query such Kafka data: `docker exec -it <folder>-proton-1 proton-client` You can get the container name via `docker ps`
5. Create an external stream to connect to a topic in the Kafka/Redpanda server and run SQL to filter or aggregate data.

### Create an external stream

```sql
CREATE EXTERNAL STREAM frontend_events(raw string)
SETTINGS type='kafka', 
         brokers='redpanda:9092',
         topic='owlshop-frontend-events'
```

:::info

Since Proton 1.3.24, you can also define multiple columns.

```sql
CREATE EXTERNAL STREAM frontend_events_json(
    version int,
    requestedUrl string,
    method string,
    correlationId string,
    ipAddress string,
    requestDuration int,
    response string,
    headers string
)   
SETTINGS type='kafka', 
         brokers='redpanda:9092',
         topic='owlshop-frontend-events',
         data_format='JSONEachRow';
```

Then select the columns directly, without JSON parsing, e.g. `select method from frontend_events_json` For nested data, you can `select headers:referrer from frontend_events_json`

:::

### Explore the data in Kafka

Then you can scan incoming events via

```sql
select * from frontend_events
```

There are about 10 rows in each second. There are about 10 rows in each second. Only one column `raw` with sample data as following:

```json
{
  "version": 0,
  "requestedUrl": "http://www.internationalinteractive.name/end-to-end",
  "method": "PUT",
  "correlationId": "0c7e970a-f65d-429a-9acf-6a136ce0a6ae",
  "ipAddress": "186.58.241.7",
  "requestDuration": 678,
  "response": { "size": 2232, "statusCode": 200 },
  "headers": {
    "accept": "*/*",
    "accept-encoding": "gzip",
    "cache-control": "max-age=0",
    "origin": "http://www.humanenvisioneer.com/engage/transparent/evolve/target",
    "referrer": "http://www.centralharness.org/bandwidth/paradigms/target/whiteboard",
    "user-agent": "Opera/10.41 (Macintosh; U; Intel Mac OS X 10_9_8; en-US) Presto/2.10.292 Version/13.00"
  }
}
```

Cancel the query by pressing Ctrl+C.

### Get live count

```sql
select count() from frontend_events
```

This query will show latest count every 2 seconds, without rescanning older data. This is a good example of incremental computation in Proton. This is a good example of incremental computation in Proton.

### Filter events by JSON attributes

```sql
select _tp_time, raw:ipAddress, raw:requestedUrl from frontend_events where raw:method='POST'
```

Once you start the query, any new event with method value as POST will be selected. `raw:key` is a shortcut to extract string value from the JSON document. It also supports nested structure, such as `raw:headers.accept` `raw:key` is a shortcut to extract string value from the JSON document. It also supports nested structure, such as `raw:headers.accept`

### Aggregate data every second

```sql
select window_start, raw:method, count() from tumble(frontend_events,now(),1s)
group by window_start, raw:method
```

Every second, it will show the aggregation result for the number of events per HTTP method.

### Show a live ASCII bar chart

Combining the interesting [bar](https://clickhouse.com/docs/en/sql-reference/functions/other-functions#bar) function from ClickHouse, you can use the following streaming SQL to visualize the top 5 HTTP methods per your clickstream.

```sql
select raw:method, count() as cnt, bar(cnt, 0, 40,5) as bar from frontend_events
group by raw:method order by cnt desc limit 5 by emit_version()
```

```
┌─raw:method─┬─cnt─┬─bar───┐
│ DELETE     │  35 │ ████▍ │
│ POST       │  29 │ ███▋  │
│ GET        │  27 │ ███▍  │
│ HEAD       │  25 │ ███   │
│ PUT        │  22 │ ██▋   │
└────────────┴─────┴───────┘
```

备注：

* This is a global aggregation, emitting results every 2 seconds (configurable).
* [emit_version()](functions_for_streaming#emit_version) function to show an auto-increasing number for each emit of streaming query result
* `limit 5 by emit_version()` to get the first 5 rows with the same emit_version(). This is a special syntax in Proton. The regular `limit 5` will cancel the entire SQL once 5 results are returned. But in this streaming SQL, we'd like to show 5 rows for each emit interval. This is a special syntax in Proton. The regular `limit 5` will cancel the entire SQL once 5 results are returned. But in this streaming SQL, we'd like to show 5 rows for each emit interval.

### Create a materialized view to save notable events in Proton

With External Stream, you can query data in Kafka without saving the data in Proton. With External Stream, you can query data in Kafka without saving the data in Proton. You can create a materialized view to selectively save some events, so that even the data in Kafka is removed, they remain available in Timeplus.

For example, the following SQL will create a materialized view to save those broken links with parsed attributes from JSON, such as URL, method, referrer.

```sql
create materialized view mv_broken_links as
select raw:requestedUrl as url,raw:method as method, raw:ipAddress as ip, 
       raw:response.statusCode as statusCode, domain(raw:headers.referrer) as referrer
from frontend_events where raw:response.statusCode<>'200';
```

Later on you can directly query on the materialized view:

```sql
-- streaming query
select * from mv_broken_links;

-- historical query
select method, count() as cnt, bar(cnt,0,40,5) as bar from table(mv_broken_links) 
group by method order by cnt desc;
```

```
┌─method─┬─cnt─┬─bar─┐
│ GET    │  25 │ ███ │
│ DELETE │  20 │ ██▌ │
│ HEAD   │  17 │ ██  │
│ POST   │  17 │ ██  │
│ PUT    │  17 │ ██  │
│ PATCH  │  17 │ ██  │
└────────┴─────┴─────┘
```

### Streaming JOIN

In the `owlshop-customers` topic, there are a list of customers with the following metadata

* id
* firstName
* lastName
* 两性平等
* 电子邮件地址

In the `owlshop-addresses` topic, it contains the detailed address for each customer

* customer.id
* street, state, city, zip
* firstName, lastName

You can create a streaming JOIN to validate the data in these 2 topics matches to each other.

```sql
CREATE EXTERNAL STREAM customers(raw string)
SETTINGS type='kafka', 
         brokers='redpanda:9092',
         topic='owlshop-customers';

CREATE EXTERNAL STREAM addresses(raw string)
SETTINGS type='kafka', 
         brokers='redpanda:9092',
         topic='owlshop-addresses';   

WITH parsed_customer AS (SELECT raw:id as id, raw:firstName||' '||raw:lastName as name, 
raw:gender as gender FROM customers SETTINGS seek_to='earliest'),
parsed_addr AS (SELECT raw:customer.id as id, raw:street||' '||raw:city as addr, 
raw:firstName||' '||raw:lastName as name FROM addresses SETTINGS seek_to='earliest')
SELECT * FROM parsed_customer JOIN parsed_addr USING(id);
```

备注：

* Two CTE are defined to parse the JSON attribute as columns
* `SETTINGS seek_to='earliest'` is the special settings to fetch earliest data from the Kafka topic
* `USING(id)` is same as `ON left.id=right.id`
* Check [JOIN](joins) for more options to join dynamic and static data

:::info

By default, proton-client is started in single line and single query mode. To run multiple query statements together, start with the `-n` parameters, i.e. `docker exec -it proton-container-name proton-client -n`

:::



### Streaming ETL

If you don't want your data analysts to see the raw IP addresses for each requests, you can setup a streaming ETL process to mask the IP address, to protect such PII data (Personal Identifiable Information).

:::info

Require Proton 1.3.18 or above.

:::

```sql
-- read the topic via an external stream
CREATE EXTERNAL STREAM frontend_events(raw string)
                SETTINGS type='kafka',
                         brokers='redpanda:9092',
                         topic='owlshop-frontend-events';

-- create the other external stream to write data to the other topic
CREATE EXTERNAL STREAM target(
    _tp_time datetime64(3), 
    url string, 
    method string, 
    ip string) 
    SETTINGS type='kafka', 
             brokers='redpanda:9092', 
             topic='masked-fe-event', 
             data_format='JSONEachRow';

-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO target AS 
    SELECT now64() AS _tp_time, 
           raw:requestedUrl AS url, 
           raw:method AS method, 
           lower(hex(md5(raw:ipAddress))) AS ip 
    FROM frontend_events;
```

## Properties for Kafka client {#properties}

For more advanced use cases, you can specify customized properties while creating the external streams. For more advanced use cases, you can specify customized properties while creating the external streams. Those properties will be passed to the underlying Kafka client, which is [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).

例如：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events',
         properties='enable.ssl.certificate.verification=false;message.max.bytes=1000000;message.timeout.ms=6000'
```

Please note, not all properties in [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) are supported. The following ones are accepted in Proton today. Please check the configuration guide of [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) for details. The following ones are accepted in Proton today. Please check the configuration guide of [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) for details.

| key                                 | range                                  | 默认   | 描述                                                                                                                                                                               |
| ----------------------------------- | -------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enable.idempotence                  | true, false                            | true | When set to `true`, the producer will ensure that messages are successfully produced exactly once and in the original produce order.                                             |
| message.timeout.ms                  | 1 .. 1000000 2147483647                | 0    | Local message timeout.                                                                                                                                                           |
| queue.buffering.max.messages        | 0 .. 2147483647                        |      | Maximum number of messages allowed on the producer queue.                                                                                                                        |
| queue.buffering.max.kbytes          | 1 .. 2147483647                        |      | Maximum total message size sum allowed on the producer queue.                                                                                                                    |
| queue.buffering.max.ms              | 0 .. 0 .. 900000                       |      | Delay in milliseconds to wait for messages in the producer queue to accumulate before constructing message batches (MessageSets) to transmit to brokers.                         |
| message.max.bytes                   | 1000 .. 1000 .. 1000000000             |      | Maximum Kafka protocol request message size.                                                                                                                                     |
| message.send.max.retries            | 0 .. 2147483647                        |      | How many times to retry sending a failing Message.                                                                                                                               |
| retries                             | 0 .. 2147483647                        |      | Alias for `message.send.max.retries`: How many times to retry sending a failing Message.                                                                                         |
| retry.backoff.ms                    | 1 .. 1 .. 300000                       |      | The backoff time in milliseconds before retrying a protocol reques                                                                                                               |
| retry.backoff.max.ms                | 1 .. 1 .. 300000                       |      | The max backoff time in milliseconds before retrying a protocol request,                                                                                                         |
| batch.num.messages                  | 1 .. 1000000                           |      | Maximum number of messages batched in one MessageSet.                                                                                                                            |
| batch.size                          | 1 .. 1 .. 2147483647                   |      | Maximum size (in bytes) of all messages batched in one MessageSet, including protocol framing overhead.                                                                          |
| compression.codec                   | none, gzip, snappy, lz4, zstd, inherit |      | Compression codec to use for compressing message sets. Compression codec to use for compressing message sets. inherit = inherit global compression.codec configuration.          |
| compression.type                    | none, gzip, snappy, lz4, zstd          |      | Alias for `compression.codec`: compression codec to use for compressing message sets.                                                                                            |
| compression.level                   | -1 .. 12                               |      | Compression level parameter for algorithm selected by configuration property `compression.codec`.                                                                                |
| topic.metadata.refresh.interval.ms  | -1 .. 3600000                          |      | Period of time in milliseconds at which topic and broker metadata is refreshed in order to proactively discover any new brokers, topics, partitions or partition leader changes. |
| enable.ssl.certificate.verification | true,false                             | true | whether to verify the SSL certification                                                                                                                                          |
