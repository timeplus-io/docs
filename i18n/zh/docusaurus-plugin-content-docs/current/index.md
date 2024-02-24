# 概览

import Quickstart from '@site/src/components/Quickstart'
import Grid, { GridItem } from '@site/src/components/Grid'

Timeplus is a stream processor. It provides powerful end-to-end capabilities, leveraging the open source streaming engine [Proton](proton), to help data teams process streaming and historical data quickly and intuitively, accessible for organizations of all sizes and industries. 它使数据工程师和平台工程师能够使用SQL解锁流式数据的价值。

The Timeplus console allows for easy connection to diverse data sources (such as Apache Kafka, Confluent Cloud, Redpanda, NATS, Web Socket/SSE, CSV file upload, and more), explore streaming patterns via SQL queries, send real-time insights and alerts to other systems or individuals, and create dashboards and visualizations.

仍然对[为什么要使用Timeplus](why-timeplus)有疑惑？ 查看[示例](showcases)了解Timeplus的用户们是如何使用Timeplus这个流式数据和历史数据统一的处理平台的。

## 开始使用Timeplus

<Quickstart href="/quickstart">

  <h3>快速入门</h3>

  <p>按照步骤说明创建Timeplus Cloud账户并加载示例IoT、用户登录或DevOps数据。</p>

</Quickstart>

## 进入流式处理和分析

<Grid>
<GridItem href="/ingestion">
### 摄取数据&rarr;

将Timeplus Cloud连接到Apache Kafka、Apache Pulsar、Kinesis、Confluent Cloud，或者使用REST API、SDK等进行推送。 </GridItem> <GridItem href="/query-syntax">
### 编写SQL查询&rarr;

使用transformations、joins、aggregation、windowed processing、substreams等函数创建长时间运行的查询。 </GridItem> <GridItem href="/viz">
### 可视化数据&rarr;

查看任何查询的实时结果；创建自定义仪表板来讲述有关您的数据的故事；或者与外部BI系统集成。 </GridItem> </Grid>

## 核心概念和函数

<Grid> <GridItem href="/working-with-streams">
### 数据流&rarr;

一个仅限追加（默认情况下）、无界限、不断变化的事件组，包含变更日志、版本控制和外部选项。 </GridItem> <GridItem href="/destination">
### 数据下游&rarr;

您可以向其他系统发送实时分析的洞察报告或警报，或通知个人，又或者启动后续自动化处理程序。 </GridItem> <GridItem href="/proton">
### Proton&rarr;

（已开源）为Timeplus的流式分析平台提供统一的流式和历史数据处理的引擎。 </GridItem> </Grid>
