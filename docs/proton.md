# Timeplus Open Core

Since September 2023, the core engine of Timeplus is open-sourced at [github.com/timeplus-io/proton](https://github.com/timeplus-io/proton), under Apache License 2.0.

Proton is a unified streaming and historical data processing engine, built on top of [ClickHouse](https://github.com/clickhouse/clickhouse) code base.

## What is Proton?

Proton is a single binary for unified streaming and historical data processing, which powers the Timeplus streaming analytic platform. It is built on top of a trimmed single instance [ClickHouse](https://github.com/clickhouse/clickhouse) code base, with major goals: 

* efficient with good performance in both streaming and historical query processing

* without any external service dependency, so it is easy for users to deploy it on bare metal, edge, container or in orchestrated cloud environment.

SQL is the main interface for Proton. Users can run streaming queries and historical queries or a combination of both in one SQL.  By default, a SQL query in Proton is a streaming query, which means it is long-running, never ends and continuously tracks and evaluates the delta changes and push the query results to users or target systems.



## Key streaming functionalities

1. [Streaming Transformation](usecases#data)
2. [Streaming Join (stream to stream, stream to table join)](joins)
3. [Streaming Aggregation](functions_for_agg)
4. Streaming Window Processing ([tumble](functions_for_streaming#tumble) / [hop](functions_for_streaming#hop) / [session](functions_for_streaming#session))
5. [Substream](substream)
6. [Data Revision Processing](changelog-stream)
7. [Federated Streaming Query with Materialized View](external-stream)
8. [JavaScript UDF / UDAF](js-udf)
9. [Materialize View](view#m_view)

## How it works

[Architecture](proton-architecture)

## Get started

### Launch with Docker

After [install Docker engine](https://docs.docker.com/engine/install/) in your OS, pull and run the latest Proton docker image by running:

```bash
docker run --name proton ghcr.io/timeplus-io/proton:develop
```


Run the `proton-client` tool in the docker container to connect to the local proton server:

```bash
docker exec -it proton proton-client -n
```

If you stop the container and want to start it again, you can run `docker start -a proton`

### Query on a test stream

In Proton client, run the following SQL to create test stream with random data,

```sql
-- Create a stream with random data
CREATE RANDOM STREAM devices(device string default 'device'||to_string(rand()%4), location string default 'city'||to_string(rand()%10), temperature float default rand()%1000/10);

-- Run the stream query and it is always long running
SELECT device, count(*), min(temperature), max(temperature) FROM devices GROUP BY device;
```

You will get streaming results like this:

| device  | count()  | min(temperature) | max(temperature) |
| ------- | -------- | ---------------- | ---------------- |
| device0 | 56694906 | 0                | 99.6             |
| device1 | 56697926 | 0.1              | 99.7             |
| device3 | 56680741 | 0.3              | 99.9             |
| Device2 | 56699430 | 0.2              | 99.8             |

### Kafka demo with Docker Compose

A [docker-compose file](https://github.com/timeplus-io/proton/blob/develop/docker-compose.yml) is created to bundle proton image with Redpanda (as a lightweight server with Kafka API), Redpanda Console, and [owl-shop](https://github.com/cloudhut/owl-shop) to generate sample live data.

1. Download the [docker-compose.yml](https://github.com/timeplus-io/proton/blob/develop/docker-compose.yml) and put into a new folder.
2. Open a terminal and run `docker compose up` in this folder.
3. Wait for few minutes to pull all required images and start the containers. Visit http://localhost:8080 to use Redpanda Console to explore the topics and live data.
4. Use `proton-client` to run SQL to query such Kafka data: `docker exec -it proton-demo-proton-1 proton-client -n` (You can get the container name via `docker ps`)
5. Create an external stream to connect to a topic in the Kafka/Redpanda server and run SQL to filter or aggregate data. Check the [tutorial](proton-kafka#tutorial) for details.

## Get more with Timeplus Cloud

To access more features, such as sources, sinks, dashboards, alerts, data lineage, you can create a workspace at [Timeplus Cloud](https://us.timeplus.cloud) or try the [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## License

Apache v2 license.

## Contributing

We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see [the wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details and see BUILD.md for how to compile Proton in different platforms.

We also encourage users to join [Timeplus Community Slack](https://timeplus.com/slack) and join the dedicated #contributing channel to ask questions.

## Need Help?

- [Timeplus Community Slack](https://timeplus.com/slack) - Join our community slack to connect with our engineers and other users
  - #proton channel for questions about how to use Proton
  - #contributing channel if you are considering contributing to Proton project

- For filing bugs, suggesting improvements or requesting new features, please [open issues](https://github.com/timeplus-io/proton/issues) on Github.

