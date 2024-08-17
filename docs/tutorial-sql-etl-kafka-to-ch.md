# Streaming ETL: Kafka to ClickHouse

This video demonstrates how to read live data from Redpanda, apply stream processing and send results to ClickHouse. [Related blog](https://www.timeplus.com/post/proton-clickhouse-integration).

## Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/ga_DmCujEpw?si=ja2tmlcCbqa6HhwT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Examples

A Docker Compose stack is provided at https://github.com/timeplus-io/proton/tree/develop/examples/clickhouse together with the sample SQL statements. When you start the stack, the latest version of Proton and ClickHouse, as well as Redpanda and data generator will be automatically started.

### Example: ETL with masked data

First, create a table with ClickHouse MergeTree table engine by running `clickhouse client` in the ClickHouse container.

```sql
CREATE TABLE events
(
    _tp_time DateTime64(3),
    url String,
    method String,
    ip String
)
ENGINE=MergeTree()
PRIMARY KEY (_tp_time, url);
```

This will serve as the destination of Proton External Table for ClickHouse. Later on, you can also read the data in Timeplus.

In the demo docker compose stack, a Redpanda container is started, together with a data generator and Redpanda Console for you to easily explore live data. For example, go to [http://localhost:8080](http://localhost:8080/), you will see the live data in the **owlshop-frontend-events** topic.

![data](https://static.wixstatic.com/media/3796d3_2bb403497c0b48fab5710bec35793ae0~mv2.png/v1/fill/w_1480,h_642,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/3796d3_2bb403497c0b48fab5710bec35793ae0~mv2.png)

The goal of this tutorial is to read these access logs and turn the sensitive IP addresses into md5 and ingest them to ClickHouse for more business analysis.

To read data from Kafka or Redpanda, you just need to create an [Kafka External Stream](proton-kafka) with the following DDL SQL:

```sql
CREATE EXTERNAL STREAM frontend_events(raw string)
SETTINGS type='kafka',
         brokers='redpanda:9092',
         topic='owlshop-frontend-events';
```

Then run the following DDL SQL to setup the connection between Timeplus and ClickHouse. For local Clickhouse without security settings, it can be as simple as:

```sql
CREATE EXTERNAL TABLE ch_local
SETTINGS type='clickhouse',
         address='clickhouse:9000',
         table='events';
```

Then create a materialized view to read data from Redpanda, extract the values and turn the IP to masked md5, and send data to the external table. By doing so, the transformed data will be written to ClickHouse continuously.

```sql
CREATE MATERIALIZED VIEW mv INTO ch_local AS
    SELECT now64() AS _tp_time,
           raw:requestedUrl AS url,
           raw:method AS method,
           lower(hex(md5(raw:ipAddress))) AS ip
    FROM frontend_events;
```

Once the materialized view is created, it will work as a background ETL job in Proton, to continuously read data from Kafka/Redpanda, apply transformations or aggregations, then send results to ClickHouse. To learn more about Materialized View in Proton, please refer to [this documentation](view#m_view).

Now if you go back to ClickHouse and run `select * from events`, you will see new data coming at sub-second latency.

![clickhouse UI](https://static.wixstatic.com/media/3796d3_804a80321d1a4219836203b83c19ae35~mv2.png/v1/fill/w_1480,h_996,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/3796d3_804a80321d1a4219836203b83c19ae35~mv2.png)

You can do more with streaming SQL in Proton, such as late event processing, complex event processing, or leverage thousands of ClickHouse functions to customize the transformation/enrichment logics. Many of Proton’s functions are powered by ClickHouse. So if you are a ClickHouse user already, you can use Proton in a similar way.

As mentioned above, the External Table in Proton can be used to read data from ClickHouse, or even apply data lookup in streaming JOIN. Simply run `SELECT .. FROM external_table_name` in Proton. It will read data from ClickHouse for the selected columns and apply the transformation or JOIN in Proton.

### Example: tumble + join

A typical use case, if you have static or slowly changing dimensions (SCD) in ClickHouse, you don’t need to duplicate them in Proton. Just create an external table in Proton, and you can enrich your live data by JOIN the stream with such an external table, then send the high quality data to ClickHouse.

For example:

```sql
-- read the dimension table in ClickHouse without copying data to Proton
CREATE EXTERNAL TABLE dim_path_to_title
SETTINGS type='clickhouse',address='clickhouse:9000';

-- read Kafka data with subsecond latency
CREATE EXTERNAL STREAM clickstream(
  ts datetime64,
  product_id int,
  ip string
)
SETTINGS type='kafka',brokers='redpanda:9092',topic='clickstream';

-- continuously write to ClickHouse
CREATE EXTERNAL TABLE target_table
SETTINGS type='clickhouse',address='clickhouse:9000',table='pageviews';

-- downsample the click events per 5 seconds and enrich URL paths with page titles
CREATE MATERIALIZED VIEW mv INTO target_table AS
  WITH pv AS(
        SELECT window_start, path, count() AS views
        FROM tumble(clickstream,ts,5s) GROUP BY window_start,path)
  SELECT window_start AS ts,path,title,views
  FROM pv JOIN dim_path_to_title USING(path);
```
