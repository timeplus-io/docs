# 关键概念

本页列出了Timeplus中的关键术语和概念。 请查看子页面了解更多详情。

## 书签 Bookmark {#bookmark}

查询书签，仅在 Timeplus Cloud 和 Timeplus Enterprise 中可用，不适用于 Timeplus Proton。

您可以将常用 SQL 语句另存为书签。 只需单击一下即可在 Web 控制台中快速运行它们。 您可以在查询页面中创建、列出、编辑、删除书签。

书签和 [视图](#view) 都可以帮助您轻松地重新运行查询。 但是，视图是在流式数据库中定义的，你可以通过 `select 直接查询视图... 来自。。` 但是书签只是用户界面的快捷方式。 当您单击书签时，将在查询控制台中预先填充原始 SQL 语句。 你无法运行 `select... 来自 my_bookmark`



## CTE {#cte}

公用表表达式或 CTE（在 [SQL](https://en.wikipedia.org/wiki/SQL)中）是一个临时命名的结果集，源自一个简单查询，在 `SELECT`、 `INSERT`、 `UPDATE`或 `DELETE` 的执行范围内定义声明。

可以将 CTE 视为派生表 ([子查询](https://en.wikipedia.org/wiki/Subquery))、 [视图](https://en.wikipedia.org/wiki/View_(database))和内联用户定义函数的替代方案。

## 仪表板 Dashboard {#dashboard}

仅在 Timeplus Cloud 和 Timeplus Enterprise 中可用，不适用于 Timeplus Proton。

您可以在工作区创建多个仪表板，并将多个图表添加到仪表板。 You can also add [filters](/viz#filter) or Markdown (experimental).

## 事件时间 Event Time

事件时间用来确定事件发生的时间，例如一个人生日。 它可以是下单时的确切时间戳，用户登录系统时的确切时间戳，发生错误时的确切时间戳，或者 IoT 设备报告其状态时的确切时间戳。 如果事件中没有合适的时间戳属性，Timeplus将根据数据摄取时间生成事件时间。

Learn more: [Event time](/eventtime)

## 数据生成器 Generator {#generator}

仅在 Timeplus Cloud 和 Timeplus Enterprise 中可用，不适用于 Timeplus Proton。

Learn more [Streaming Generator](/stream-generator)

## 物化视图 Materialized View {#mview}

一个在后台运行的特殊视图，并在内部流中保持查询结果。

## 查询 Query {#query}

Timeplus 通过增强的 SQL 提供强大的流式分析能力。 默认情况下，查询不受约束，并不断向客户端推送最新结果。 The unbounded query can be converted to a bounded query by applying the function [table()](/functions_for_streaming#table), when the user wants to ask the question about what has happened like the traditional SQL.

Learn more: [Streaming Query](/stream-query) and [Non-Streaming Query](/history)

## 数据下游 Sink {#sink}

又名 目的地 仅在 Timeplus Cloud 和 Timeplus Enterprise 中可用，不适用于 Timeplus Proton。

Timeplus使您能够将实时的洞察力发送到其他系统，以通知个人或向下游应用程序供电。

Learn more: [Destination](/destination).

## 数据源 Source {#source}

源是 Timeplus Cloud 或 Timeplus Enterprise 中的后台作业，用于将数据加载到 [流](#stream)中。 对于兼容 Kafka API 的流数据平台，你需要创建外部流。

Learn more: [Data Collection](/ingestion)

## 流 Stream {#stream}

Timeplus是一个流式分析平台和数据流中的生命值。 Timeplus中的`stream`类似传统数据库中的`table` 两者基本上都是数据集。 两者基本上都是数据集。 关键的区别是，Timeplus stream是一个只增不减、没有边界、不断变化的事件组。

Learn more: [Stream](/working-with-streams)

## 外部流 {#external_stream}

您可以创建外部流，从与 Kafka API 兼容的流数据平台读取数据。

Learn more: [External Stream](/external-stream)

## 时间戳列 Timestamp Column

当您创建一个源并预览数据时，您可以选择一个列作为时间戳列。 Timeplus将使用此列作为 [事件时间](#event_time) 并跟踪事件的生命周期并处理所有时间相关的计算/聚合。

## 视图(View) {#view}

您可以将可重复使用的 SQL 语句定义为视图，以便您可以将它们作为数据流一样查询 `select.. from view1...` 默认情况下，视图不需要任何额外的计算或存储资源。 They are expanded to the SQL definition when they are queried. 您也可以创建实际化的视图，让它们“变成物理的” （保持在后台运行并将结果保存到磁盘）。

Learn more: [View](/view) and [Materialized View](/view#m_view)

## 工作区 Workspace {#workspace}

仅在 Timeplus Cloud 和 Timeplus Enterprise 中可用，不适用于 Timeplus Proton。

工作区是您运行流数据收集和分析的独立存储和计算单位。 通常，一个组织中的用户组加入了相同的工作区，以建立一个或多个流式分析解决方案。 每个用户最多可以创建 1 个免费工作空间并加入多个工作区。

默认情况下，每个工作区最多可以保存20GB 数据，并且限制并行查询。 如果您需要更多的资源，请联系 support@timeplus.com 以增加限制。
