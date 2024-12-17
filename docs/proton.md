# Timeplus Proton

Timeplus Proton is a stream processing engine and database. It is fast and lightweight alternative to ksqlDB or Apache Flink, powered by the libraries and engines in ClickHouse. It enables developers to solve streaming data processing, multi-stream JOINs, sophisticated incremental materialized views, routing and analytics challenges from Apache Kafka, Redpanda and more sources, and send aggregated data to the downstream systems. Timeplus Proton is the core engine of [Timeplus Enterprise](/timeplus-enterprise).

## 💪 Why use Timeplus Proton?

1. **[Apache Flink](https://github.com/apache/flink) or [ksqlDB](https://github.com/confluentinc/ksql) alternative.** Timeplus Proton provides powerful streaming SQL functionalities, such as streaming ETL, tumble/hop/session windows, watermarks, materialized views, CDC and data revision processing, etc. In contrast to pure stream processors, it also stores queryable analytical/row based materialized views within Proton itself for use in analytics dashboards and applications.
2. **Fast.** Timeplus Proton is written in C++, with optimized performance through SIMD. [For example](https://www.timeplus.com/post/scary-fast), on an Apple MacBookPro with M2 Max, Timeplus Proton can deliver 90 million EPS, 4 millisecond end-to-end latency, and high cardinality aggregation with 1 million unique keys.
3. **Lightweight.** Timeplus Proton is a single binary (\<500MB). No JVM or any other dependencies. You can also run it with Docker, or on an AWS t2.nano instance (1 vCPU and 0.5 GiB memory).
4. **Powered by the fast, resource efficient and mature [ClickHouse](https://github.com/clickhouse/clickhouse).** Timeplus Proton extends the historical data, storage, and computing functionality of ClickHouse with stream processing. Thousands of SQL functions are available in Timeplus Proton. Billions of rows are queried in milliseconds.
5. **Best streaming SQL engine for [Kafka](https://kafka.apache.org/) or [Redpanda](https://redpanda.com/).** Query the live data in Kafka or other compatible streaming data platforms, with [external streams](https://docs.timeplus.com/proton-kafka).

![Proton Architecture](/img/proton-arch.png)
See our [architecture](https://docs.timeplus.com/proton-architecture) doc for technical details and our [FAQ](https://docs.timeplus.com/proton-faq) for more information.

## How is it different from ClickHouse?
ClickHouse is an extremely performant Data Warehouse built for fast analytical queries on large amounts of data. While it does support ingesting data from streaming sources such as Apache Kafka, it is itself not a stream processing engine which can transform and join streaming event data based on time-based semantics to detect patterns that need to be acted upon as soon as it happens. ClickHouse also has incremental materialized view capability but is limited to creating materialized view off of ingestion of blocks to a single table.

Timeplus Proton uses ClickHouse as a table store engine inside of each stream (alongside a Write Ahead Log and other data structures) and uses to unify real-time and historical data together to detect signals in the data. In addition, Timeplus Proton can act as an advanced data pre-processor for ClickHouse (and similar systems) where the bulk of the data preparation and batching is done ahead of ingestion. See [Timeplus and ClickHouse](https://www.timeplus.com/timeplus-and-clickhouse) for more details on this.

## 🎬 Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## ⚡ Deployment

```shell
curl https://install.timeplus.com/oss | sh
```

For more guidelines, please check the [installation guide](/install#proton) for Docker or Homebrew.

### Timeplus Cloud

Don't want to setup by yourself? Try Timeplus in [Cloud](https://us-west-2.timeplus.cloud/).

### 🔎 Usage

SQL is the main interface. You can start a new terminal window with `proton client` to start the SQL shell.

:::info
You can also integrate Timeplus Proton with Python/Java/Go SDK, REST API, or BI plugins. Please check [Integration](#integration).
:::

In the `proton client`, you can write SQL to create [External Stream for Kafka](/proton-kafka) or [External Table for ClickHouse](/proton-clickhouse-external-table).

You can also run the following SQL to create a stream of random data:

```sql
-- Create a stream with random data
CREATE RANDOM STREAM devices(
  device string default 'device'||to_string(rand()%4),
  temperature float default rand()%1000/10);

-- Run the streaming SQL
SELECT device, count(*), min(temperature), max(temperature)
FROM devices GROUP BY device;
```

You should see data like the following:

```
┌─device──┬─count()─┬─min(temperature)─┬─max(temperature)─┐
│ device0 │    2256 │                0 │             99.6 │
│ device1 │    2260 │              0.1 │             99.7 │
│ device3 │    2259 │              0.3 │             99.9 │
│ device2 │    2225 │              0.2 │             99.8 │
└─────────┴─────────┴──────────────────┴──────────────────┘
```

### ⏩ What's next?

To see more examples of using Timeplus Proton, check out the [examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder.

To access more features, such as sources, sinks, dashboards, alerts, and data lineage, create a workspace on [Timeplus Cloud](https://us-west-2.timeplus.cloud) or try our [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## 🧩 Integration {#integration}

The following drivers are available:

- https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
- https://github.com/timeplus-io/proton-go-driver
- https://github.com/timeplus-io/proton-python-driver

Integration with other systems:

- ClickHouse https://docs.timeplus.com/proton-clickhouse-external-table
- [Docker and Testcontainers](/tutorial-testcontainers-java)
- [Sling](/sling)
- Grafana https://github.com/timeplus-io/proton-grafana-source
- Metabase https://github.com/timeplus-io/metabase-proton-driver
- Pulse UI https://github.com/timeplus-io/pulseui/tree/proton
- Homebrew https://github.com/timeplus-io/homebrew-timeplus
- dbt https://github.com/timeplus-io/dbt-proton

## Contributing

We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see the [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details, and [BUILD.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) to compile Proton in different platforms.

We also encourage you to join our [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## Need help?

Join our [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Timeplus Proton users.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).
