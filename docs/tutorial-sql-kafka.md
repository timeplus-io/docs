# Query Kafka with SQL (mock data)

:::info

This tutorial is mainly for SQL users. For Timeplus Enterprise users, you can also use [the UI wizard](/confluent-cloud-source). SQL in this guide can be ran both in Timeplus Proton and Timeplus Cloud/Enterprise.

:::

A docker-compose file is created to bundle proton image with Redpanda (as lightweight server with Kafka API), Redpanda Console, and [owl-shop](https://github.com/cloudhut/owl-shop) as sample live data.

1. Download the [docker-compose.yml](https://github.com/timeplus-io/proton/blob/develop/examples/ecommerce/docker-compose.yml) and put into a new folder.
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

Note:

* This is a global aggregation, emitting results every 2 seconds (configurable).
* [emit_version()](/functions_for_streaming#emit_version) function to show an auto-increasing number for each emit of streaming query result
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
