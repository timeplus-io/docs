# Real-time Insights for GitHub

In this tutorial, you will process real-time data from GitHub. We have setup a public accessible Kafka cluster for you to consume data from Kafka topic. If you are on Timeplus Cloud, you can also build real-time dashboards and alerts.

## Read Live GitHub Events

We all love GitHub. But do you know what’s trending on Github right now? Do you know which repos have received the most pushes or PR reviews over the past 10 minutes? There are daily/weekly leaderboards at https://github.com/trending, but no real-time feeds.

You can write a script to call [GitHub Events API](https://docs.github.com/en/rest/reference/activity) with a dedicated [Personal Access Token](https://github.com/settings/tokens) Please note, the public events from the GitHub API has a 5-minute delay ([source](https://docs.github.com/en/rest/reference/activity#list-public-events)).

Here is a [sample Python script](https://github.com/timeplus-io/github_liveview/blob/develop/github_demo.py) for your reference. But we have made the live data accessible via Kafka API.

In Timeplus, you read data from Kafka via an [External Stream](/external-stream). Here is the SQL to create such an external stream to read from our Kafka clusters on Aiven:

```sql
CREATE EXTERNAL STREAM github_events
(
  actor string,
  created_at string,
  id string,
  payload string,
  repo string,
  type string
)
SETTINGS type = 'kafka', 
         brokers = 'kafka-public-read-timeplus.a.aivencloud.com:28864', 
         topic = 'github_events', 
         data_format='JSONEachRow',
         sasl_mechanism = 'SCRAM-SHA-256', 
         username = 'readonly', 
         password = 'AVNS_MUaDRshCpeePa93AQy_', 
         security_protocol = 'SASL_SSL', 
         skip_ssl_cert_check=true
COMMENT 'an external stream to read GitHub events in JSON format from Aiven for Apache Kafka'
```

Just run this SQL via `proton client` or the **SQL Console** in Timeplus web UI. This Kafka user is configured with read-only access to the topic/cluster. We may change the password. Please come back if the password doesn't work.

## Sample Streaming SQL

### Streaming Tail

You can explore the live data via

```sql
SELECT * FROM github_events
```

This is a streaming SQL and keeps reading new events in the Kafka topic. You need to manually cancel the query to terminate it.

### Streaming Filter

Add some condition in the WHERE clause to apply streaming filters, e.g.

```sql
SELECT * FROM github_events WHERE type='WatchEvent'
```

### Aggregation 

#### Global Aggregation

```sql
SELECT count(*) FROM github_events
```

This will show how many new events received, since the query is started. So you may see a number like 158, then a couple seconds later, 334.

This is so-called [Global Aggregation](/query-syntax#global).

#### Tumble Aggregation

```sql
SELECT window_start, repo, count(*) 
FROM tumble(github_events,30s) 
GROUP BY window_start, repo
```

This query counts events by repo every 30 seconds. Tumble windows are fixed windows, without overlaps. `30s` is the shortcut for SQL expression `INTERVAL 30 SECOND`. You can also use `2m` for 2 minutes and `3h` for 3 hours.

Please note, this query will wait for up to 30s to show the first results. Because by default, streaming SQL in Timeplus will look for future events, not existing events. We will talk about how to get past data shortly.

#### Hopping Aggregation

```sql
SELECT window_start, repo, count(*) 
FROM hop(github_events,1s,30s) 
GROUP BY window_start, repo
```

This query counts events by repo every 30 seconds and update results every second. Hop window is also called as sliding windows.

## Time Rewind

By default, streaming SQL in Timeplus will look for future events, not existing events. For externals streams, you can use `SETTINGS seek_to='..'` to go back to a past timestamp or offset in the Kafka topic. For example, if you want to get total number of events since April 1, you can run:

```sql
SELECT count(*) FROM github_events 
SETTINGS seek_to='2024-04-01'
```

If you want to get data 6 hours ago:

```sql
SELECT count(*) FROM github_events 
SETTINGS seek_to='-6h'
```

## Save Kafka data in Timeplus

Using external streams to query data in Kafka won't consume any storage in Timeplus. In some cases, you may want to save the data in Timeplus, so that you can apply more sophisticated data processing, or avoid too many query load on Kafka, or want to set a small retention policy on Kafka but would keep more data in Timeplus.

You can create a materialized view to save data in Timeplus, e.g.

```sql
CREATE MATERIALIZED VIEW mv AS
SELECT * FROM github_events
```

The materialized view is a long-running query to turn the streaming SQL results in its internal storage. You can also have the materialized view to write data to other streams, external streams, or external tables. This can build streaming pipelines.

You can query data in the materialized view just like other streams, e.g.

```sql
SELECT * FROM mv WHERE type='WatchEvent'
```

## Learn More

You can check [this blog](https://www.timeplus.com/post/github-real-time-app) for more details.
