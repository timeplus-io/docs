# Glossary

This page lists key terms and concepts in Timeplus.

## bookmark {#bookmark}

Query bookmarks, only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

You can save the common SQL statements as bookmarks. They can be run quickly in the web console by a single click. You can create, list, edit, remove bookmarks in the query page.

Both bookmarks and [views](#view) can help you easily re-run a query. However views are defined in the streaming database and you can query the view directly via `select .. from ..` But bookmarks are just UI shortcuts. When you click the bookmark, the original SQL statement will be pre-filled in the query console. You cannot run `select .. from my_bookmark`



## CTE {#cte}

A common table expression, or CTE, (in [SQL](https://en.wikipedia.org/wiki/SQL)) is a temporary named result set, derived from a simple query and defined within the execution scope of a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.

CTEs can be thought of as alternatives to derived tables ([subquery](https://en.wikipedia.org/wiki/Subquery)), [views](https://en.wikipedia.org/wiki/View_(database)), and inline user-defined functions.

## dashboard {#dashboard}

Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

You can create multiple dashboards in a workspace, and add multiple charts to a dashboard. You can also add [filters](viz#filter) or Markdown (experimental). 

## event time

Event time is used to identify when the event is generated, like a birthday to a human being. It can be the exact timestamp when the order is placed, when the user logins a system, when an error occurs, or when an IoT device reports its status. If no suitable timestamp attribute in the event, Timeplus will generate the event time based on the data ingestion time.

Learn more: [Event time](eventtime)

## generator {#generator}

Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

Learn more [Streaming Generator](stream-generator)

## materialized view {#mview}

A special view that is kept running in the background and persistent the query results in an internal stream.

## query {#query}

Timeplus provides powerful streaming analytics capabilities through the enhanced SQL. By default, queries are unbounded and keep pushing the latest results to the client. The unbounded query can be converted to a bounded query by applying the function [table()](functions_for_streaming#table), when the user wants to ask the question about what has happened like the traditional SQL.

Learn more: [Streaming Query](stream-query) and [Non-Streaming Query](history)

## sink {#sink}

a.k.a. destination. Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

Timeplus enables you to send real-time insights to other systems, either to notify individuals or power up downstream applications.

Learn more: [Destination](destination).

## source {#source}

A source is a background job in Timeplus Cloud or Timeplus Enterprise to load data into a [stream](#stream). For Kafka API compatible streaming data platform, you need to create external streams.

Learn more: [Data Ingestion](ingestion) 

## stream {#stream}

Timeplus is a streaming analytics platform and data lives in streams. Timeplus `streams` are similar to `tables` in the traditional SQL databases. Both of them are essentially datasets. The key difference is that Timeplus stream is an append-only, unbounded, constantly changing events group.

Learn more: [Stream](working-with-streams) 

## external stream {#external_stream}

You can create external streams to read data from Kafka API compatible streaming data platform.

Learn more: [External Stream](external-stream) 

## timestamp column

When you create a source and preview the data, you can choose a column as the timestamp column. Timeplus will use this column as the [event time](#event_time) and track the lifecycle of the event and process it for all time related computation/aggregation. 

## view {#view}

You can define reusable SQL statements as views, so that you can query them as if they are streams `select .. from view1 ..` By default, views don't take any extra computing or storage resources. They are expected to the SQL definition when they are queried. You can also create materialized views to 'materialize' them (keeping running them in the background and saving the results to the disk).

Learn more: [View](view) and [Materialized View](view#m_view)

## workspace {#workspace}

Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

A workspace is the isolated storage and computing unit for you to run streaming data collection and analysis. Every user can create up to 1 free workspace and join many workspaces. Usually a group of users in the same organization join the same workspace, to build one or more streaming analytics solutions.

By default, each workspace can save up to 20GB data and with a limit for concurrent queries. If you need more resources, please contact support@timeplus.com to increase the limit.
