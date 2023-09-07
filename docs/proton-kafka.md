# Read/Write Kafka

You can read data from Apache Kafka (as well as Confluent Cloud, or Redpanda) in Proton with [External Stream](external-stream). Combining with [Materialized View](proton-create-view#m_view) and [Target Stream](proton-create-view#target-stream), you can also write data to Apache Kafka with External Stream.

## CREATE EXTERNAL STREAM

Currently Timeplus external stream only supports Kafka API as the only type.

To create an external stream in Proton:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..'',username='..',password='..'
```

The supported values for `security_protocol` are:

* PLAINTEXT: when this option is omitted, this is also the default value.
* SASL_SSL: when this value is set, username and password should be specified.

### Connect to local Kafka or Redpanda

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka', 
         brokers='localhost:9092',
         topic='github_events',
         security_protocol='PLAINTEXT'
```



### Connect to Confluent Cloud

Example:

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

Every second, it will show the aggregation result for number of events per HTTP method.
