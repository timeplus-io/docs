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

