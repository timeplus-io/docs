# Key Concepts

This page lists key terms and concepts in Timeplus. Please check the sub-pages for more details.

## 书签 Bookmark {#bookmark}

Query bookmarks, only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

You can save the common SQL statements as bookmarks. They can be run quickly in the web console by a single click. You can create, list, edit, remove bookmarks in the query page.

Both bookmarks and [views](#view) can help you easily re-run a query. However views are defined in the streaming database and you can query the view directly via `select .. from ..` But bookmarks are just UI shortcuts. When you click the bookmark, the original SQL statement will be pre-filled in the query console. You cannot run `select .. from my_bookmark`



## CTE {#cte}

A common table expression, or CTE, (in [SQL](https://en.wikipedia.org/wiki/SQL)) is a temporary named result set, derived from a simple query and defined within the execution scope of a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.

CTEs can be thought of as alternatives to derived tables ([subquery](https://en.wikipedia.org/wiki/Subquery)), [views](https://en.wikipedia.org/wiki/View_(database)), and inline user-defined functions.

## 仪表板 Dashboard {#dashboard}

Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

您可以在工作区创建多个仪表板，并将多个图表添加到仪表板。 您也可以添加 [筛选器](viz#filter) 或Markdown (实验性)。

## 事件时间 Event Time

事件时间用来确定事件发生的时间，例如一个人生日。 它可以是下单时的确切时间戳，用户登录系统时的确切时间戳，发生错误时的确切时间戳，或者 IoT 设备报告其状态时的确切时间戳。 如果事件中没有合适的时间戳属性，Timeplus将根据数据摄取时间生成事件时间。

了解更多： [事件时间](eventtime)

## 数据生成器 Generator {#generator}

Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

了解更多 [流生成器](stream-generator)

## 物化视图 Materialized View {#mview}

一个在后台运行的特殊视图，并在内部流中保持查询结果。

## 查询 Query {#query}

Timeplus 通过增强的 SQL 提供强大的流式分析能力。 默认情况下，查询不受约束，并不断向客户端推送最新结果。 无边界查询可以通过使用函数 [table()](functions_for_streaming#table)，转换为有边界的查询，当用户想询问发生了什么事情时，就像传统的 SQL 一样。

了解更多： [流查询](stream-query) and [非流查询](history)

## 数据下游 Sink {#sink}

又名 目的地 Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

Timeplus使您能够将实时的洞察力发送到其他系统，以通知个人或向下游应用程序供电。

了解更多： [目标](destination)。

## 数据源 Source {#source}

A source is a background job in Timeplus Cloud or Timeplus Enterprise to load data into a [stream](#stream). For Kafka API compatible streaming data platform, you need to create external streams.

了解更多： [数据接收](http://localhost:3030/docs/ingestion)

## 流 Stream {#stream}

Timeplus是一个流式分析平台和数据流中的生命值。 Timeplus中的`stream`类似传统数据库中的`table` 两者基本上都是数据集。 两者基本上都是数据集。 关键的区别是，Timeplus stream是一个只增不减、没有边界、不断变化的事件组。

了解更多： [流](working-with-streams)

## external stream {#external_stream}

You can create external streams to read data from Kafka API compatible streaming data platform.

Learn more: [External Stream](external-stream)

## 时间戳列 Timestamp Column

当您创建一个源并预览数据时，您可以选择一个列作为时间戳列。 Timeplus将使用此列作为 [事件时间](#event_time) 并跟踪事件的生命周期并处理所有时间相关的计算/聚合。

## 视图(View) {#view}

您可以将可重复使用的 SQL 语句定义为视图，以便您可以将它们作为数据流一样查询 `select.. from view1...` 默认情况下，视图不需要任何额外的计算或存储资源。 当他们被查询时，他们需要使用 SQL 定义。 您也可以创建实际化的视图，让它们“变成物理的” （保持在后台运行并将结果保存到磁盘）。

了解更多： [查看](view) 和 [物化视图](view#m_view)

## 工作区 Workspace {#workspace}

Only available in Timeplus Cloud and Timeplus Enterprise, not in Timeplus Proton.

工作区是您运行流数据收集和分析的独立存储和计算单位。 通常，一个组织中的用户组加入了相同的工作区，以建立一个或多个流式分析解决方案。 每个用户最多可以创建 1 个免费工作空间并加入多个工作区。

默认情况下，每个工作区最多可以保存20GB 数据，并且限制并行查询。 如果您需要更多的资源，请联系 support@timeplus.com 以增加限制。
