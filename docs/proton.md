# Proton

## Introduction

Proton is a single binary unified for streaming and historical data processing engine. It helps developers, engineers,
and data analysts solve complex real-time analytics use cases, and powers the [Timeplus](https://www.timeplus.com/) streaming analytics platform.

Proton builds on top of the popular open source [ClickHouse project](https://github.com/clickhouse/clickhouse) for its historical data, storage, computing functionality, and a portion of its query engine, delivering more mature online analytical processing (OLAP) capabilities and new development to unify the streaming and processing engines.

Why use Proton?

- **A unified, lightweight engine** to connect streaming and historical data processing tasks with efficiency and robust performance.
- **Smooth developer experience** with powerful streaming and analytical functionality.
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

With [Docker engine](https://docs.docker.com/engine/install/) installed on your local machine, pull and run the latest version of the Proton Docker image.

```bash
docker run -d --name proton ghcr.io/timeplus-io/proton:develop
```

Connect to your `proton` container and run the `proton-client` tool to connect to the local Proton server:

```bash
docker exec -it proton proton-client -n
```

If you stop the container and want to start it again, run `docker start proton`.

### Query a test stream

From `proton-client`, run the following SQL to create a stream of random data:

```sql
-- Create a stream with random data.
CREATE RANDOM STREAM devices(device string default 'device'||to_string(rand()%4), location string default 'city'||to_string(rand()%10), temperature float default rand()%1000/10);

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

Now that you're running Proton and have created your first stream, query, and view, you can explore [reading and writing
data from Apache Kafka](proton-kafka#tutorial) with External Streams, or view the the subpages to explore additional capabilities.

To see how such a deployment of Proton works as a demo, using `owl-shop` sample live data, check out our [tutorial with
Docker Compose](proton-kafka#tutorial).

## Get more with Timeplus Cloud

To access more features, such as sources, sinks, dashboards, alerts, data lineage, create a workspace at [Timeplus
Cloud](https://us.timeplus.cloud) or try the [live demo](https://demo.timeplus.cloud) with pre-built live data and
dashboards.

## Contributing

We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see the [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details, and [BUILD.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) to compile Proton in different platforms.

We also encourage you to join the `#contributing` channel in the [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## Need help?

Join the [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Proton
users.

- Use the `#proton` channel to ask questions about installing, using, or deploying Proton.
- Join the `#contributing` channel to connect with other contributors to Proton.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).

