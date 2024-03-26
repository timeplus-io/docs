# Proton

<p align="center">
  <img alt="Proton – An open-source, fast and lightweight streaming SQL engine, 🚀 powered by ClickHouse" src="/img/proton-logo-white-bg.png"/> <br/>
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
  <a href="#-deployment"><strong>Deployment</strong></a> ·
  <a href="#-whats-next"><strong>What's Next</strong></a> ·
  <a href="#-integrations"><strong>Integrations</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="#need-help"><strong>Need help?</strong></a>
</p>

Proton, the core engine of Timeplus products, is fast and lightweight alternative to ksqlDB or Apache Flink, 🚀 powered by ClickHouse. It enables developers to solve streaming data processing, routing and analytics challenges from Apache Kafka, Redpanda and more sources, and send aggregated data to the downstream systems. Proton is under active development under Apache 2.0 license and powers both [Timeplus Cloud](timeplus-cloud) and [Timeplus Enterprise](timeplus-enterprise).

## Why use Proton?

1. **[Apache Flink](https://github.com/apache/flink) or [ksqlDB](https://github.com/confluentinc/ksql) alternative.** Proton provides powerful streaming SQL functionalities, such as streaming ETL, tumble/hop/session windows, watermarks, materialized views, CDC and data revision processing, etc.
2. **Fast.** Proton is written in C++, with optimized performance through SIMD. [For example](https://www.timeplus.com/post/scary-fast), on an Apple MacBookPro with M2 Max, Proton can deliver 90 million EPS, 4 millisecond end-to-end latency, and high cardinality aggregation with 1 million unique keys.
3. **Flexible deployments** with Proton's single binary and no external service dependencies. No JVM or any other dependencies. You can also run it with Docker, or on an AWS t2.nano instance (1 vCPU and 0.5 GiB memory).
4. Proton extends the historical data, storage, and computing functionality of the popular [ClickHouse project](https://github.com/clickhouse/clickhouse) with streaming data processing. Thousands of SQL functions are available in Proton. Billions of rows are queried in milliseconds.
5. Next, create an external stream in Proton with SQL to consume data from your Kafka or Redpanda. Follow this [tutorial](proton-kafka#tutorial) for SQL snippets.

![Proton Architecture](/img/proton-architecture.webp) See our [architecture](proton-architecture) doc for technical details and the [FAQ](proton-faq) for more information on the various editions of Proton, how it's related to ClickHouse, and why we chose Apache License 2.0.

## 🎬 Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## ⚡ Deployment

### Option 1: Single Binary

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

### Docker:

```bash
docker run -d --pull always --name proton ghcr.io/timeplus-io/proton:latest
```

In case you cannot access ghcr, you can pull the image from `public.ecr.aws/timeplus/proton`

### Docker Compose:

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

### Timeplus Cloud：

One step to try Proton in [Timeplus Cloud](https://us.timeplus.cloud/)

### 🔎 Usage

From `proton-client`, run the following SQL to create a stream of random data:

```sql
-- Create a stream with random data.
CREATE RANDOM STREAM devices(device string default 'device'||to_string(rand()%4), temperature float default rand()%1000/10);

-- Run the long-running stream query.
SELECT device, count(*), min(temperature), max(temperature) FROM devices GROUP BY device;
```
```sql
select count() from table(car_live_data)
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

### What's next?
To see more examples of using Proton, check out the [examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder.

To access more features, such as sources, sinks, dashboards, alerts, data lineage, create a workspace at [Timeplus Cloud](https://us.timeplus.cloud) or try the [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## 🧩 Integrations
The following drivers are available:

* https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
* https://github.com/timeplus-io/proton-go-driver
* https://github.com/timeplus-io/proton-python-driver

Integrations with other systems:

* ClickHouse https://docs.timeplus.com/proton-clickhouse-external-table
* Grafana https://github.com/timeplus-io/proton-grafana-source
* Metabase  https://github.com/timeplus-io/metabase-proton-driver
* Pulse UI https://github.com/timeplus-io/pulseui/tree/proton
* Homebrew https://github.com/timeplus-io/homebrew-timeplus
* dbt https://github.com/timeplus-io/dbt-proton

## Contributing

We welcome your contributions! We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see the [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details, and [BUILD.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) to compile Proton in different platforms.

We also encourage you to join the [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## Need help?

Join the [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Proton users.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).

