- - -
title: Overview
- - -

import Quickstart from '@site/src/components/Quickstart'
import Grid, { GridItem } from '@site/src/components/Grid'

Timeplus is a streaming-first data analytics platform. It provides powerful end-to-end capabilities, leveraging the open source streaming database [Proton](proton), to help teams process streaming and historical data quickly and intuitively, accessible for organizations of all sizes and industries. It enables data engineers and platform engineers to unlock streaming data value using SQL.

The Timeplus console allows for easy connection to diverse data sources (such as Apache Kafka, Confluent Cloud, Redpanda, CSV file upload, and more), explore streaming patterns via SQL queries, send real-time insights and alerts to other systems or individuals, and create dashboards and visualizations.

Still curious about [why to use Timeplus](why-timeplus)? Check out the [showcases](showcases) to see how Timeplus customers use our unified streaming and historical processing platform.

## Get started with Timeplus

<Quickstart href="/quickstart">
  <h3>快速入门</h3>
  <p>Follow along with step-by-step instructions for creating a Timeplus Cloud account and loading sample IoT, user login, or DevOps data.</p>
</Quickstart>

## Jump into stream processing and analytics

<Grid>
  <GridItem href="/ingestion">
    <h3>Ingest data &rarr;</h3>
    <p>Connect Timeplus Cloud to Apache Kafka, Apache Pulsar, Kinesis, Confluent Cloud, or push with a REST API, SDKs, and beyond.</p>
  </GridItem>
  <GridItem href="/query-syntax">
    <h3>Write SQL queries &rarr;</h3>
    <p>Create long-running queries using functions like transformations, joins, aggregation, windowed processing, substreams, and more.</p>
  </GridItem>
  <GridItem href="/viz">
    <h3>Visualize data &rarr;</h3>
    <p>View real-time results for any query, create custom dashboards to tell stories about your data, or integrate with external BI systems.</p>
  </GridItem>
</Grid>

## Core concepts and functions

<Grid>
  <GridItem href="/working-with-streams">
    <h3>Streams &rarr;</h3>
    <p>An append-only (by default), unbounded, constantly changing events group with changelog, versioned, and external options.</p>
  </GridItem>
  <GridItem href="/destination">
    <h3>Sinks &rarr;</h3>
    <p>Send real-time insights to other systems, either to notify individuals or power downstream applications.</p>
  </GridItem>
  <GridItem href="/proton">
    <h3>Proton &rarr;</h3>
    <p>The open source, unified streaming and historical data processing engine powering the Timeplus streaming analytics platform.</p>
  </GridItem>
</Grid>