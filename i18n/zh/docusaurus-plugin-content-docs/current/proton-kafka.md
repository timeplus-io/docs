# Read/Write Kafka

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). Combining with [Materialized View](proton-create-view#m_view) and [Target Stream](proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## CREATE EXTERNAL STREAM

Currently Timeplus external stream only supports Kafka API as the only type.

To create an external stream in Proton:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..',username='..',password='..'
```

The supported values for `security_protocol` are:

* PLAINTEXT: when this option is omitted, this is also the default value.
* SASL_SSL: when this value is set, username and password should be specified.

### Connect to local Kafka or Redpanda

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events',
         security_protocol='PLAINTEXT'
```



### Connect to Confluent Cloud

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='github_events',
         security_protocol='SASL_SSL', 
         username="..", 
         password=".."
```



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



## Write to Kafka with SQL

You can use materialized views to write data to Kafka as an external stream, e.g.

```sql
CREATE MATERIALIZED VIEW mv1 
INTO ext_stream 
AS SELECT _tp_time, car_id, speed FROM car_live_data WHERE car_type in (1,2,3)
```

## Tutorial with Docker Compose {#tutorial}

A docker-compose file is created to bundle proton image with Redpanda (as lightweight server with Kafka API), Redpanda Console, and [owl-shop](https://github.com/cloudhut/owl-shop) as sample live data.

1. Download the [docker-compose.yml](https://github.com/timeplus-io/proton/blob/develop/docker-compose.yml) and put into a new folder.
2. Open a terminal and run `docker compose up` in this folder.
3. Wait for few minutes to pull all required images and start the containers. Visit http://localhost:8080 to use Redpanda Console to explore the topics and live data.
4. Use `proton-client` to run SQL to query such Kafka data: `docker exec -it <folder>-proton-1 proton-client` You can get the container name via `docker ps`
5. Create an external stream to connect to a topic in the Kafka/Redpanda server and run SQL to filter or aggregate data.

### Create an external stream

```sql
CREATE EXTERNAL STREAM frontend_events(raw string)
SETTINGS type='kafka', 
         brokers='redpanda:9092',
         topic='owlshop-frontend-events'
```

### Explore the data in Kafka

Then you can scan incoming events via

```sql
select * from frontend_events
```

There are about 10 rows in each second. Only one column `raw` with sample data as following:

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

This query will show latest count every 2 seconds, without rescanning older data. This is a good example of incremental computation in Proton.

### Filter events by JSON attributes

```sql
select _tp_time, raw:ipAddress, raw:requestedUrl from frontend_events where raw:method='POST'
```

Once you start the query, any new event with method value as POST will be selected. `raw:key` is a shortcut to extract string value from the JSON document. It also supports nested structure, such as `raw:headers.accept`

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
* `limit 5 by emit_version()` to get the first 5 rows with the same emit_version(). This is a special syntax in Proton. The regular `limit 5` will cancel the entire SQL once 5 results are returned. But in this streaming SQL, we'd like to show 5 rows for each emit interval.

### Create a materialized view to save notable events in Proton

With External Stream, you can query data in Kafka without saving the data in Proton. You can create a materialized view to selectively save some events, so that even the data in Kafka is removed, they remain available in Timeplus.

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
