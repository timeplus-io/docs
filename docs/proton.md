# Proton

<p align="center">
  <img alt="Proton – open source, unified streaming and data processing engine for real-time analytics" src="/img/proton-logo-white-bg.png"/> <br/>
  <b> A streaming SQL engine, fast and lightweight </b> <br/><br/>
  📄 <a href="https://docs.timeplus.com/proton" target="_blank">Documentation</a>&nbsp;&nbsp;
  🚀 <a href="https://demo.timeplus.cloud/" target="_blank">Live Demo</a>&nbsp;&nbsp;
  🌎 <a href="https://timeplus.com/" target="_blank">Timeplus</a> <br/><br/>
  <a href="https://github.com/timeplus-io/proton/"><img src="https://img.shields.io/github/stars/timeplus-io/proton?logo=github" /></a>&nbsp;
  <a href="https://github.com/timeplus-io/proton/pkgs/container/proton"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fuwkp37dgeb6d2oc5fxu6oles2i0eevmm.lambda-url.us-west-2.on.aws%2F" /></a>&nbsp; 
  <a href="https://github.com/timeplus-io/proton/blob/develop/LICENSE"><img src="https://img.shields.io/github/v/release/timeplus-io/proton" alt="Release" /></a>&nbsp;
  <a href="https://www.youtube.com/@timeplusdata"><img src="https://img.shields.io/youtube/channel/views/UCRQCOw9wOiqHZkm7ftAMdTQ" alt="YouTube" /></a>&nbsp;
  <a href="https://timeplus.com/slack"><img src="https://img.shields.io/badge/Join%20Slack-blue?logo=slack" alt="Slack" /></a>&nbsp;
  <a href="https://linkedin.com/company/timeplusinc"><img src="https://img.shields.io/badge/timeplusinc-0077B5?style=social&logo=linkedin" alt="follow on LinkedIn"/></a>&nbsp;
  <a href="https://twitter.com/intent/follow?screen_name=timeplusdata"><img src="https://img.shields.io/twitter/follow/timeplusdata?label=" alt="Twitter(X)" /></a>&nbsp;
  <a href="https://github.com/timeplus-io/proton/blob/develop/LICENSE"><img src="https://img.shields.io/github/license/timeplus-io/proton?label=license&logo=github&color=blue" alt="License" /></a>&nbsp;  
</p>

<p align="center">
  <a href="#-why-use-proton"><strong>Why Use Proton</strong></a> ·
  <a href="#-demo-video"><strong>Demo Video</strong></a> ·
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-whats-next"><strong>What's Next</strong></a> ·
  <a href="#-integrations"><strong>Integrations</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="#need-help"><strong>Need help?</strong></a>
</p>
Proton is a streaming SQL engine, a fast and lightweight alternative to Apache Flink, 🚀 powered by ClickHouse. It helps data engineers and platform engineers build data pipelines and solve problems in real-time, for various stream processing use cases. Proton also powers the [Timeplus Cloud](https://timeplus.com) streaming analytics platform.

## 💪 Why use Proton?

1. **[Apache Flink](https://github.com/apache/flink) or [ksqlDB](https://github.com/confluentinc/ksql) alternative.** Proton provides powerful streaming SQL functionalities, such as streaming ETL, tumble/hop/session windows, watermarks, materialized views, CDC, data revision processing, and more.
2. **Fast.** Proton is written in C++, with optimized performance through SIMD. [For example](https://www.timeplus.com/post/scary-fast), on an Apple MacBookPro with M2 Max, Proton can deliver 90 million EPS, 4 millisecond end-to-end latency, and high cardinality aggregation with 1 million unique keys.
3. **Lightweight.** Proton is a single binary (\<500MB). No JVM or any other dependencies. You can also run it with Docker, or on an AWS t2.nano instance (1 vCPU and 0.5 GiB memory).
4. **Powered by [ClickHouse](https://github.com/clickhouse/clickhouse).** Proton extends the historical data, storage, and computing functionality of ClickHouse with stream processing. More than 1,200 [SQL functions](https://docs.timeplus.com/functions) are available. 
5. **Best SQL engine for [Apache Kafka](https://kafka.apache.org/)/[Redpanda](https://redpanda.com/)/[Confluent](https://www.confluent.io/).** Query live data in Apache Kafka or other compatiable streaming data platforms without duplicating data, using [external streams](https://docs.timeplus.com/proton-kafka).

![Proton Architecture](/img/proton-architecture.webp)
See our [architecture](https://docs.timeplus.com/proton-architecture) doc for technical details and our [FAQ](https://docs.timeplus.com/proton-faq) for more information.

## 🎬 Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## ⚡ Quick Start

### 🐙 Try Proton With Docker Compose:

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

### 🐳 Try Proton With Docker:

```bash
docker run -d --pull always --name proton ghcr.io/timeplus-io/proton:latest
```

### ⬇️ Install Proton Without Docker

You can install Proton as a single binary via:

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

Then you can start the server via `proton server start` and start a new terminal window with `proton client` to start the SQL shell.

### 🔎 Query a test stream

From `proton-client`, run the following SQL to create a stream of random data:

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

To access more features, such as sources, sinks, dashboards, alerts, and data lineage, create a workspace on [Timeplus Cloud](https://us.timeplus.cloud) or try our [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## 🧩 Integrations
The following drivers are available:

* https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
* https://github.com/timeplus-io/proton-go-driver
* https://github.com/timeplus-io/proton-python-driver

Integrations with other systems:

* Grafana https://github.com/timeplus-io/proton-grafana-source
* Metabase  https://github.com/timeplus-io/metabase-proton-driver
* Pulse UI https://github.com/timeplus-io/pulseui/tree/proton
* Homebrew https://github.com/timeplus-io/homebrew-timeplus
* dbt https://github.com/timeplus-io/dbt-proton

## Got something to share?

We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see the [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details, and [BUILD.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) to compile Proton in different platforms.

We also encourage you to join our [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## Need help?

Join our [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Proton users.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).

