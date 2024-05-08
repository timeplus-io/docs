# Streaming ETL: Kafka to Kafka

You can quickly build streaming ETL pipelines with Timeplus. For example, the original web access logs in Kafka topics contain the raw IP address. To further protect user privacy, you can build a data pipeline to read new data from Kafka, masking the IP address and send to a different Kafka topic.

Follow the guide for [Timeplus Proton](#timeplus-proton) or [Timeplus Cloud](#timeplus-cloud).

## Timeplus Proton

You can follow [the previous tutorial](tutorial-sql-kafka) to setup the sample data and run the following SQL to build the pipeline.

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
             data_format='JSONEachRow',
             one_message_per_row=true;

-- setup the ETL pipeline via a materialized view
CREATE MATERIALIZED VIEW mv INTO target AS 
    SELECT now64() AS _tp_time, 
           raw:requestedUrl AS url, 
           raw:method AS method, 
           lower(hex(md5(raw:ipAddress))) AS ip 
    FROM frontend_events;
```

## Timeplus 云服务

[A blog](https://www.timeplus.com/post/redpanda-serverless) is published with the detailed steps to read data from Kafka/Redpanda, apply the transformation and send to Kafka/Redpanda.

A few key steps:

1. Connect to Redpanda:

![add data](https://static.wixstatic.com/media/3796d3_dd096c19d5014082940e1e0a4bbc9c98~mv2.png/v1/fill/w_1392,h_843,al_c,q_90,enc_auto/3796d3_dd096c19d5014082940e1e0a4bbc9c98~mv2.png)

2. Specify the Redpanda broker address and the authentication method.

![broker](https://static.wixstatic.com/media/3796d3_4fb74e122b1f48dfb101316104eb0f27~mv2.png/v1/fill/w_1399,h_677,al_c,q_90,enc_auto/3796d3_4fb74e122b1f48dfb101316104eb0f27~mv2.png)

3. Choose a topic and preview data.

![preview](https://static.wixstatic.com/media/3796d3_fee20aa87fc6446ca97d7947028bec03~mv2.png/v1/fill/w_1400,h_1012,al_c,q_90,enc_auto/3796d3_fee20aa87fc6446ca97d7947028bec03~mv2.png)

4. Set the name for the external stream, say `frontend_events`.

![set name](https://static.wixstatic.com/media/3796d3_530daa439da24dcb893901de33dfebc0~mv2.png/v1/fill/w_1399,h_533,al_c,q_90,enc_auto/3796d3_530daa439da24dcb893901de33dfebc0~mv2.png)

5. Explore the live data in the stream/topic.

![explore](https://static.wixstatic.com/media/3796d3_5703bf748d5a4c00bd9eefff534b63c0~mv2.png/v1/fill/w_1400,h_751,al_c,q_90,enc_auto/3796d3_5703bf748d5a4c00bd9eefff534b63c0~mv2.png)

6. Write a streaming SQL to transform data.

```sql
SELECT response:statusCode as code,hex(md5(ipAddress)) as hashed_ip,method,requestedUrl 
FROM frontend_events WHERE response:statusCode!='200'
```

![sql](https://static.wixstatic.com/media/3796d3_f3ed5cf7ab544cd494984399cdd905fe~mv2.png/v1/fill/w_1400,h_696,al_c,q_90,enc_auto/3796d3_f3ed5cf7ab544cd494984399cdd905fe~mv2.png)

7. Send the result to another topic. Timeplus will create a new external stream as the destination and a materialized view as pipeline.

![sink](https://static.wixstatic.com/media/3796d3_dbef875c0e5d43cc817a99aa9a8803dd~mv2.png/v1/fill/w_1399,h_1197,al_c,q_90,enc_auto/3796d3_dbef875c0e5d43cc817a99aa9a8803dd~mv2.png)

The data lineage visualizes the relationships.

![lineage](https://static.wixstatic.com/media/3796d3_cdeb96c8d3d94e48aee684043a931427~mv2.png/v1/fill/w_1400,h_980,al_c,q_90,enc_auto/3796d3_cdeb96c8d3d94e48aee684043a931427~mv2.png)

8. New data is available in Kafka/Redpanda topic.

![result](https://static.wixstatic.com/media/3796d3_cf065642afe14c189021a492499a6a22~mv2.png/v1/fill/w_1399,h_1017,al_c,q_90,enc_auto/3796d3_cf065642afe14c189021a492499a6a22~mv2.png)
