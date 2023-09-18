---
title: Introduction
---

<!-- export const styles = {
  GridClass: {
    backgroundColor: "rgb(184, 50, 128)",
    color: "white",
    gridColumn: "span 6",
    padding: "1.4rem 2rem",
    borderRadius: "var(--ifm-pagination-nav-border-radius)",
    textDecoration: "none",
    '&:hover': {
      backgroundColor: 'blue',
    },
    '& p': {
      marginBottom: '0',
    }
  }
}

export const Grid = ({children}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(12,1fr)",
      gap: "2rem",
  }}>
    {children}
  </div>
)

export const GridItem = ({children, href}) => (
  <a
    href={href}
    style={styles.GridClass}>
    {children}
  </a>
) -->

import Grid, { GridItem } from '@site/src/components/Grid'

Timeplus is a streaming-first data analytics platform. It provides powerful end-to-end capabilities to help teams process streaming and historical data quickly and intuitively, accessible for organizations of all sizes and industries. It enables data engineers and platform engineers to unlock streaming data value using SQL. 

The Timeplus console allows for easy connection to diverse data sources (such as Apache Kafka, Confluent Cloud, Redpanda, CSV file upload, and more), explore streaming patterns via SQL queries, send real-time insights and alerts to other systems or individuals, and create dashboards and visualizations.

![overview](/img/overview.png)

## Get started with Timeplus

<Grid>
  <GridItem href="/quickstart">
    <h3>Quickstart &rarr;</h3>
    <p>Follow along with step-by-step instructions on creating a Timeplus Cloud account and loading sample IoT or DevOps data.</p>
  </GridItem>
  <GridItem href="/proton">
    <h3>Try open source Proton &rarr;</h3>
    <p>Run the stream and historical data processing engine behind Timeplus Cloud in single database mode directly from your CLI using Docker.</p>
  </GridItem>
  <GridItem href="/ingestion">
    <h3>Ingest streaming data &rarr;</h3>
    <p>Connect Timeplus Cloud to Apache Kafka, Apache Pulsar, Kinesis, Confluent Cloud, or push with a REST API, SDKs, and beyond.</p>
  </GridItem>
  <GridItem href="/query-syntax">
    <h3>Write a query with SQL &rarr;</h3>
    <p>Create long-running queries using functions like transformations, joins, aggregation, windowed processing, substreams, and more.</p>
  </GridItem>
</Grid>

Still curious about [why to use Timeplus](why-timeplus)? Check out our [showcase](showcases) for use cases, sourced from
Timeplus customers, of our unified streaming and historical processing platform.
