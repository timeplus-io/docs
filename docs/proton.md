# Proton

Proton is a unified streaming and historical data analytics database in a single binary. It helps data engineers and platform engineers solve complex real-time analytics use cases, and powers the [Timeplus](https://timeplus.com) streaming analytics platform.

Proton extends the historical data, storage, and computing functionality of the popular [ClickHouse project](https://github.com/clickhouse/clickhouse) with streaming and OLAP data processing.

Why use Proton?

- **A unified, lightweight engine** to connect streaming and historical data processing tasks with efficiency and robust performance.
- **A smooth developer experience** with powerful streaming and analytical functionality.
- **Flexible deployments** with Proton's single binary and no external service dependencies.
- **Low total cost of ownership** compared to other analytical frameworks.

Plus built-in support for powerful streaming and analytical functionality:

| Functionality | Description |
| --- | --- |
| <b>[Data transformation](usecases#data)</b> | Scrub sensitive fields, derive new columns from raw data, or convert identifiers to human-readable information. |
| <b>[Joining streams](joins)</b> | Combine data from different sources to add freshness to the resulting stream. |
| <b>[Aggregating streams](functions_for_agg)</b> | Developer-friendly functions to derive insights from streaming and historical data. |
| <b>Windowed stream processing ([tumble](functions_for_streaming#tumble) / [hop](functions_for_streaming#hop) / [session](functions_for_streaming#session))</b> | Collect insightful snapshots of streaming data. |
| <b>[Substreams](substream)</b> | Maintain separate watermarks and streaming windows. |
| <b>[Data revision processing (changelog)](changelog-stream)</b> | Create and manage non-append streams with primary keys and change data capture (CDC) semantics. |
| <b>[Federated streaming queries](external-stream)</b> | Query streaming data in external systems (e.g. Kafka) without duplicating them. |
| <b>[Materialized views](view#m_view)</b> | Create long-running and internally-stored queries. |

See our [architecture](proton-architecture) doc for technical details and the [FAQ](proton-faq) for more information on the various editions of Proton, how it's related to ClickHouse, and why we chose Apache License 2.0.

## Get started
### Single Binary

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

### Docker Compose

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

### Docker

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

