# Proton

Proton, the core engine of Timeplus Enterprise, is fast and lightweight alternative to ksqlDB or Apache Flink. It enables developers to solve streaming data processing, routing and analytics challenges from Apache Kafka, Redpanda and more sources, and send aggregated data to the downstream systems. Proton is under active development under Apache 2.0 license and powers [Timeplus Enterprise](timeplus-enterprise).

## 💪 Why use Proton?

1. **[Apache Flink](https://github.com/apache/flink) or [ksqlDB](https://github.com/confluentinc/ksql) alternative.** Proton provides powerful streaming SQL functionalities, such as streaming ETL, tumble/hop/session windows, watermarks, materialized views, CDC and data revision processing, etc.
2. **Fast.** Proton is written in C++, with optimized performance through SIMD. [For example](https://www.timeplus.com/post/scary-fast), on an Apple MacBookPro with M2 Max, Proton can deliver 90 million EPS, 4 millisecond end-to-end latency, and high cardinality aggregation with 1 million unique keys.
3. **Lightweight.** Proton is a single binary (\<500MB). No JVM or any other dependencies. You can also run it with Docker, or on an AWS t2.nano instance (1 vCPU and 0.5 GiB memory).
4. **Powered by the fast, resource efficient and mature [ClickHouse](https://github.com/clickhouse/clickhouse).** Proton extends the historical data, storage, and computing functionality of ClickHouse with stream processing. Thousands of SQL functions are available in Proton. Billions of rows are queried in milliseconds.
5. **Best streaming SQL engine for [Kafka](https://kafka.apache.org/) or [Redpanda](https://redpanda.com/).** Query the live data in Kafka or other compatible streaming data platforms, with [external streams](https://docs.timeplus.com/proton-kafka).

![Proton Architecture](/img/proton-arch.png)
See our [architecture](https://docs.timeplus.com/proton-architecture) doc for technical details and our [FAQ](https://docs.timeplus.com/proton-faq) for more information.

## 🎬 Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## ⚡ Deployment

```shell
curl https://install.timeplus.com/oss | sh
```

For more guidelines, please check the [installation guide](install#proton).

### Timeplus Cloud

One step to try Proton in [Timeplus Cloud](https://us.timeplus.cloud/)

### 🔎 Usage

From `proton client`, run the following SQL to create a stream of random data:

```sql
-- Create a stream with random data
CREATE RANDOM STREAM devices(
  device string default 'device'||to_string(rand()%4),
  temperature float default rand()%1000/10)
```

```sql
-- Run the streaming SQL
SELECT device, count(*), min(temperature), max(temperature)
FROM devices GROUP BY device
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

To see more examples of using Proton, check out the [examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder.

To access more features, such as sources, sinks, dashboards, alerts, data lineage, create a workspace on [Timeplus Cloud](https://us.timeplus.cloud) or try the [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## 🧩 Integrations

The following drivers are available:

- https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
- https://github.com/timeplus-io/proton-go-driver
- https://github.com/timeplus-io/proton-python-driver

Integrations with other systems:

- ClickHouse https://docs.timeplus.com/proton-clickhouse-external-table
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

Join our [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Proton users.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).
