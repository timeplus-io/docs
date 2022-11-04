# 术语表

这个页面列出了Timeplus中的关键术语和概念。

## 书签 Bookmark {#bookmark}

查询书签。 您可以将常见的 SQL 语句保存为书签。 只需单击即可在 Web 控制台中快速运行。 您可以在查询页面创建、列出、编辑、删除书签。

书签和 [视图](#view) 可以帮助您轻松地重新运行一个查询。 但在流式数据库中定义了视图，您可以直接通过 `select .. from ..` 来查询这个视图。但书签仅仅是界面快捷方式。 当您点击书签时，最初的 SQL 语句将在查询控制台中预先填写。 您不能运行 `select... from my_bookmark`



## CTE {#cte}

通用表表达式或 CTE(在 [SQL](https://en.wikipedia.org/wiki/SQL)中) 是临时命名结果集。 来自一个简单查询并定义在 `SELECT`的执行范围内， `INSERT`, `UpdatE`, or `DELETE` 声明。

CTE可以被视为派生表格的替代品([ subquery ](https://en.wikipedia.org/wiki/Subquery)), [views](https://en.wikipedia.org/wiki/View_(database)), 以及内部用户定义的函数。

## 仪表板 Dashboard {#dashboard}

您可以在仪表盘中添加一个或多个面板。 您也可以在工作区中创建一个或多个仪表板。

## 事件时间 Event Time

事件时间用来确定事件发生的时间，例如一个人生日。 当下单时，当用户登录系统时，它可以是确切的时间戳。 当发生错误时，或当一个 IoT 设备报告其状态。 如果事件中没有合适的时间戳属性，Timeplus将根据数据摄取时间生成事件时间。

了解更多： [事件时间](eventtime)

## 数据生成器 Generator {#generator}

计时器传输流数据生成器，以帮助您快速加载样本数据到系统。 提供了三种类型的流数据类型：iot_data, user_logins, devlops。

了解更多 [流生成器](stream-generator)

## 物化视图 Materialized View {#mview}

一个在后台运行的特殊视图，并在内部流中保持查询结果。

## 查询 Query {#query}

Timeplus通过增强的 SQL 提供强大的流式分析能力。 默认情况下，查询不受约束，并不断向客户端推送最新结果。 无边界查询可以通过应用函数 [table()](functions#table), 转换为有边界的查询。 当用户想要询问像传统的 SQL 一样发生了什么情况。

了解更多： [流查询](stream-query) and [非流查询](history)

## 数据下游 Sink {#sink}

注 目的地。

Timeplus使您能够将实时的洞察力发送到其他系统，以通知个人或向下游应用程序供电。

了解更多： [目标](destination)。

## 数据源 Source {#source}

一个源是Timeplus中的后台作业，将数据加载到 [流](#stream) 中。 Timeplus与各种系统相结合，作为数据来源，例如Apache Kafka。

了解更多： [数据接收](http://localhost:3030/docs/ingestion)

## 流 Stream {#stream}

Timeplus是一个流式分析平台和数据流中的生命值。 Timeplus中的`stream`类似传统数据库中的`table` 两者基本上都是数据集。 关键的区别是，Timeplus stream是一个只增不减、没有边界、不断变化的事件组。

了解更多： [流](working-with-streams)

## 时间戳列 Timestamp Column

当您创建一个源并预览数据时，您可以选择一个列作为时间戳列。 Timeplus将使用此列作为 [事件时间](#event_time) 并跟踪事件的生命周期并处理所有时间相关的计算/聚合。

## 视图(View) {#view}

您可以将可重复使用的 SQL 语句定义为视图，以便您可以将它们作为数据流 `select... from view1...` 默认情况下，视图不需要任何额外的计算或存储资源。 当他们被查询时，他们需要使用 SQL 定义。 您也可以创建实际化的视图，让它们“变成物理的” (保持在后台运行并将结果保存到磁盘)

了解更多： [查看](view) and [物化视图](view#m_view)

## 工作区 Workspace {#workspace}

工作区是您运行流数据收集和分析的独立存储和计算单位。 在测试阶段，每个用户都可以创建一个免费的工作空间并加入许多工作空间。 通常，一个组织中的用户组加入了相同的工作区，以建立一个或多个流式分析解决方案。

默认情况下，每个工作区最多可以保存50GB 数据，并且限制并行查询。 如果您需要更多的资源，请联系 support@timeplus.com 以增加限制