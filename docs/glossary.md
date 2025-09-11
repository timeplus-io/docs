# Concepts

This page lists key terms and concepts in Timeplus, from A to Z.

## bookmark {#bookmark}

Query bookmarks or SQL scripts, only available in Timeplus Enterprise, not in Timeplus Proton.

You can save the common SQL statements as bookmarks. They can be run quickly in the web console by a single click. You can create, list, edit, remove bookmarks in the query page.

Both bookmarks and [views](/glossary#view) can help you easily re-run a query. However views are defined in the Timeplus SQL engine and you can query the view directly via `select .. from ..` But bookmarks are just UI shortcuts. When you click the bookmark, the original SQL statement will be pre-filled in the query console. You cannot run `select .. from my_bookmark`



## CTE {#cte}

A common table expression, or CTE, (in [SQL](https://en.wikipedia.org/wiki/SQL)) is a temporary named result set, derived from a simple query and defined within the execution scope of a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.

CTEs can be thought of as alternatives to derived tables ([subquery](https://en.wikipedia.org/wiki/Subquery)), [views](https://en.wikipedia.org/wiki/View_(database)), and inline user-defined functions.

## dashboard {#dashboard}

Only available in Timeplus Enterprise, not in Timeplus Proton.

You can create multiple dashboards, and add multiple charts to a dashboard. You can also add [filters](/viz#filter) or Markdown (experimental).

## event time {#event_time}

Each row in Timeplus streams contains a `_tp_time` column as the event time. Timeplus takes this attribute as one important identity of an event.

Event time is used to identify when the event is generated, like a birthday to a human being. It can be the exact timestamp when the order is placed, when the user logins a system, when an error occurs, or when an IoT device reports its status. If there is no suitable timestamp attribute in the event, Timeplus will generate the event time based on the data ingestion time.

By default, the `_tp_time` column is in `datetime64(3, 'UTC')` type with millisecond precision. You can also create it in `datetime` type with second precision.

When you are about to create a new stream, please choose the right column as the event time. If no column is specified, then Timeplus will use the current timestamp as the value of `_tp_time` It's not recommended to rename a column as \_tp_time at the query time, since it will lead to unexpected behaviour, specially for [Time Travel](/usecases#s-time-travel).

Event time is used almost everywhere in Timeplus data processing and analysis workflow:

- while doing time window based aggregations, such as [tumble](/functions_for_streaming#tumble) or [hop](/functions_for_streaming#hop) to get the downsampled data or outlier in each time window, Timeplus will use the event time to decide whether certain event belongs to a specific window
- in such time sensitive analytics, event time is also used to identify out of order events or late events, and drop them in order to get timely streaming insights.
- when one data stream is joined with the other, event time is the key to collate the data, without expecting two events to happen in exactly the same millisecond.
- event time also plays an important role to device how long the data will be kept in the stream

### how to specify the event time

#### Specify during data ingestion

When you [ingest data](/connect-data-in) into Timeplus, you can specify an attribute in the data which best represents the event time. Even if the attribute is in `String` type, Timeplus will automatically convert it to a timestamp for further processing.

If you don't choose an attribute in the wizard, then Timeplus will use the ingestion time to present the event time, i.e. when Timeplus receives the data. This may work well for most static or dimensional data, such as city names with zip codes.

#### Specify during query

The [tumble](/functions_for_streaming#tumble) or [hop](/functions_for_streaming#hop) window functions take an optional parameter as the event time column. By default, we will use the event time in each data. However you can also specify a different column as the event time.

Taking an example for taxi passengers. The data stream can be

| car_id | user_id | trip_start          | trip_end            | fee |
| ------ | ------- | ------------------- | ------------------- | --- |
| c001   | u001    | 2022-03-01 10:00:00 | 2022-03-01 10:30:00 | 45  |

The data may come from a Kafka topic. When it's configured, we may set `trip_end` as the (default) event time. So that if we want to figure out how many passengers in each hour, we can run query like this

```sql
select count(*) from tumble(taxi_data,1h) group by window_end
```

This query uses `trip_end` , the default event time, to run the aggregation. If the passenger ends the trip on 00:01 at midnight, it will be included in the 00:00-00:59 time window.

In some cases, you as the analyst, may want to focus on how many passengers get in the taxi, instead of leaving the taxi, in each hour, then you can set `trip_start` as the event time for the query via `tumble(taxi_data,trip_start,1h)`

Full query:

```sql
select count(*) from tumble(taxi_data,trip_start,1h) group by window_end
```


## external stream {#external_stream}

You can create external streams to read or write data from/to external systems in the streaming way. Timeplus supports external streams to Apache Kafka, Apache Pulsar, and other streaming data platforms.

Learn more: [External Stream](/external-stream)

## external table {#external_table}
You can create external tables to read or write data from/to external systems in the non-streaming way. Timeplus supports external tables to ClickHouse, PostgreSQL, MySQL, etc.


## materialized view {#mview}

Real-time data pipelines are built via materialized views in Timeplus.

The difference between a materialized view and a regular view is that the materialized view is running in background after creation and the resulting stream is physically written to internal storage (hence it's called materialized).

Once the materialized view is created, Timeplus will run the query in the background continuously and incrementally emit the calculated results according to the semantics of its underlying streaming select.

## query {#query}

Timeplus provides powerful streaming analytics capabilities through the enhanced SQL. By default, queries are unbounded and keep pushing the latest results to the client. The unbounded query can be converted to a bounded query by applying the function [table()](/functions_for_streaming#table), when the user wants to ask the question about what has happened like the traditional SQL.

Learn more: [Streaming Query](/streaming-query) and [Non-Streaming Query](/historical-query)

## sink {#sink}

a.k.a. destination. Only available in Timeplus Enterprise, not in Timeplus Proton.

Timeplus enables you to send real-time insights or transformed data to other systems, either to notify individuals or power up downstream applications.

Learn more: [Destination](/send-data-out).

## source {#source}

A source is a background job in Timeplus Enterprise to load data into a [stream](#stream). For Kafka API compatible streaming data platform, you need to create [Kafka external streams](/kafka-source).

Learn more: [Data Collection](/connect-data-in)

## stream {#stream}

Timeplus is a streaming analytics platform and data lives in streams. Timeplus `streams` are similar to `tables` in the traditional SQL databases. Both of them are essentially datasets. The key difference is that Timeplus stream is an append-only, unbounded, constantly changing events group.

Learn more: [Stream](/working-with-streams)

## timestamp column

When you create a source and preview the data, you can choose a column as the timestamp column. Timeplus will use this column as the [event time](/glossary#event_time) and track the lifecycle of the event and process it for all time related computation/aggregation.

## view {#view}

You can define reusable SQL statements as views, so that you can query them as if they are streams `select .. from view1 ..` By default, views don't take any extra computing or storage resources. They are expanded to the SQL definition when they are queried. You can also create materialized views to 'materialize' them (keeping running them in the background and saving the results to the disk).

Learn more: [View](/materialized-view) and [Materialized View](/materialized-view)
