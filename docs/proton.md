# Proton

<p align="center">
  <img alt="Proton – open source, unified streaming and data processing engine for real-time analytics" src="/img/proton-logo-white-bg.png"/> <br/>
  <b> A streaming SQL engine, fast and lightweight </b> <br/><br/>
  📄 <a href="https://docs.timeplus.com/proton" target="_blank">Documentation</a>&nbsp;
  🚀 <a href="https://demo.timeplus.cloud/" target="_blank">Live Demo</a>
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
  <a href="#why-use-proton"><strong>Why Use Proton</strong></a> ·
  <a href="#demo-video"><strong>Demo Video</strong></a> ·
  <a href="#get-started"><strong>Get Started</strong></a> ·
  <a href="#whats-next"><strong>What's Next</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="#need-help"><strong>Need help?</strong></a>
</p>

Proton is a streaming SQL engine, a fast and lightweight alternative to Apache Flink, 🚀 powered by ClickHouse. It helps data engineers and platform engineers solve real-time data pipelines and stream processing use cases, also powers the [Timeplus Cloud](https://timeplus.com) streaming analytics platform.

## Why use Proton? {#why-use-proton}

1. **[Apache Flink](https://github.com/apache/flink) or [ksqlDB](https://github.com/confluentinc/ksql) alternative.** Proton provides powerful streaming SQL functionality, such as streaming ETL, tumble/hop/session windows, watermarks, materialized views, CDC and data revision processing, etc.
2. **Fast.** Proton is written in C++, with optimized performance through SIMD. [For example](https://www.timeplus.com/post/scary-fast), on an Apple MacBookPro with M2 Max, Proton can deliver 90 million EPS, 4 millisecond end-to-end latency, and high cardinality aggregation with 1 million unique keys.
3. **Lightweight.** Proton is a single binary (\<500MB). No JVM or any other dependencies. You can also run it with Docker, or on AWS t2.nano instance (1 vCPU and 0.5 GiB memory).
4. **Powered by [ClickHouse](https://github.com/clickhouse/clickhouse).** Proton extends the historical data, storage, and computing functionality of ClickHouse with stream processing. More than 1200 [SQL functions](https://docs.timeplus.com/functions) are available. Query billions of historical data in milliseconds.
5. **Best SQL engine for [Kafka](https://kafka.apache.org/)/[Redpanda](https://redpanda.com/)/[Confluent](https://www.confluent.io/).** Query the live data in Kafka or other compatiable streaming data platforms, with [external streams](https://docs.timeplus.com/proton-kafka).

See our [architecture](proton-architecture) doc for technical details and the [FAQ](proton-faq) for more information.

## 🎬 Demo Video
<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
## Get started
### Option 1: Single Binary

If you’re an Apache Kafka or Redpanda user, you can install Proton as a single binary via:

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

This will install the Proton binary in the current folder, then you can start the server via `proton server start` and start a new terminal window with `proton client` to start the SQL shell.

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

Next, create an external stream in Proton with SQL to consume data from your Kafka or Redpanda. Follow this [tutorial](proton-kafka#tutorial) for SQL snippets.

### Option 2: Docker Compose

If you don’t want to setup Kafka or Redpanda, you can use [the docker-compose.yml file](https://github.com/timeplus-io/proton/blob/develop/examples/carsharing/docker-compose.yml). Download the file to a local folder. Make sure you have Docker Engine and Desktop installed. Use `docker compose up` to start the demonstration stack.

Next, you can open the shell of the Proton container and run your first streaming SQL. To print out the new data being generated, you can run the following sample SQL:

```sql
select * from car_live_data
```

To get the total number of events in the historical store, you can run the following SQL:

```sql
select count() from table(car_live_data)
```

To show the number of event events, at certain intervals (2 seconds, by default), you can run: 

```sql
select count() from car_live_data
```

Congratulations! You have successfully installed Proton and run queries for both historical and streaming analytics.

### Option 3: Docker Container

With [Docker engine](https://docs.docker.com/engine/install/) installed on your local machine, pull and run the latest version of the Proton Docker image.

```bash
docker run -d --pull always --name proton ghcr.io/timeplus-io/proton:latest
```

Connect to your `proton` container and run the `proton-client` tool to connect to the local Proton server:

```bash
docker exec -it proton proton-client -n
```

If you stop the container and want to start it again, run `docker start proton`.

If you are using Mac and [homebrew](https://brew.sh/), you can also check [homebrew-timeplus](https://github.com/timeplus-io/homebrew-timeplus) to easily install/upgrade proton.

### Query a test stream

From `proton-client`, run the following SQL to create a stream of random data:

```sql
-- Create a stream with random data.
CREATE RANDOM STREAM devices(device string default 'device'||to_string(rand()%4), temperature float default rand()%1000/10);

-- Run the long-running stream query.
SELECT device, count(*), min(temperature), max(temperature) FROM devices GROUP BY device;
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

Now that you're running Proton and have created your first stream, query, and view, you can explore [reading and writing data from Apache Kafka](proton-kafka#tutorial) with External Streams, or view the the subpages to explore additional capabilities.

To see how such a deployment of Proton works as a demo, using `owl-shop` sample live data, check out our [tutorial with Docker Compose](proton-kafka#tutorial).

To see more examples of using Proton, check out the [examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder.

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

## Get more with Timeplus

To access more features, such as sources, sinks, dashboards, alerts, data lineage, create a workspace at [Timeplus Cloud](https://us.timeplus.cloud) or try the [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## Contributing

We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see the [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details, and [BUILD.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) to compile Proton in different platforms.

We also encourage you to join the [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## Need help?

Join the [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Proton users.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).

