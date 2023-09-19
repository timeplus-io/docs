# Proton FAQ

On September 21, 2023, Timeplus announced the open-source project: [Proton](https://github.com/timeplus-io/proton/). We're using this FAQ as the primary reference for learning about what Proton is, how we licensed the code open source, how you can use Proton today, and more.

## What is Proton?

Proton is the core engine powering the [Timeplus](https://www.timeplus.com), a unified streaming and historical data processing engine designed for efficiency and strong performance. Proton has no external service dependencies, which allows you to deploy it on bare metal, edge devices, within containers, or as part of an orchestrated cloud environment.

Proton builds on top of the popular open source [ClickHouse project](https://github.com/ClickHouse/ClickHouse) for its historical data, storage, computing functionality, and a portion of its query engine.

By leveraging the proven technologies of ClickHouse, Proton brings more mature online analytical processing (OLAP) capabilities to the open source community with lots of new development to unify the streaming and processing engines. You can use Proton alongside your existing ClickHouse deployment to enable additional functionality or replace your existing deployment with Proton or Timeplus.

## How is Proton licensed? {#license}

Proton follows the ClickHouse licensing model with [Apache License 2.0](https://github.com/timeplus-io/proton/blob/develop/LICENSE), which is also used by popular open source projects like [Kubernetes](https://github.com/kubernetes/kubernetes) and [Apache Flink](https://github.com/apache/flink).

Apache License 2.0 is a [permissive license](https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/) that allows for most uses without restriction. We'll talk more about how you can use Proton in the [following section](#use).

We chose this license for a few important reasons:

- **We're following the path ClickHouse first paved**. Because Proton leverages many excellent ClickHouse technologies, we hope to see our communities grow together and the two open source projects become more deeply integrated over time.

- **We want to see Proton push the limits of streaming and data processing in unique and exotic environments**. While Proton already powers the enterprise-ready Timeplus Cloud, developers or other end users can download and deploy Proton or modify the code locally for use in a private cloud infrastructure. Using Proton does not require you adopt Timeplus Cloud or talk with our sales team.

- **We're eager to see what value a _free_ streaming and historical data processing engine delivers**. By releasing the single-node edition of Proton to the open source community, we're giving developers, hobbyists, enthusiasts, and anyone who wants to try new technologies a new path that's entirely free.

- **We're building a new community around unified streaming and data processing**. ClickHouse paved the way for processing, but we have much to experiment and discover together around streaming. We can't wait to get feedback from developers and users within organizations of all sizes and degrees of streaming maturity.

## What uses, commercial and beyond, are allowed with the Proton project? {#use}

Under Apache License 2.0, you are allowed to modify, distribute, and sublicense Proton as it's available on GitHub.

You can also include Proton in proprietary software that you then sell to customers, but that does not grant you any rights to use Proton or Timeplus trademarks or imply a commercial relationship or partnership between your organization and Proton or Timeplus.

Apache License 2.0 also prevents any contributor to Proton—a member of the Timeplus team or an outside contributor—from being held liable by end users, whether they are individual developers or commercial organizations.

## What features are available with Proton versus Timeplus? {#compare}

Proton powers unified streaming and data processing on a single database node. Its commercial counterpart supports advanced deployment strategy and includes enterprise-ready features. There are some other differences we would like to clarify.

|                               | **Proton**                | **Timeplus**              |
| ----------------------------- | ------------------------- | ------------------------- |
| **Deployment**                | <ul><li>Single-node Docker image</li></ul> | <ul><li>Single node</li><li>Cluster</li><li>Kubernetes-based “bring your own cloud” (BYOC)</li><li>Fully-managed cloud service with SOC2</li></ul> |
| **Data sources**              | <ul><li>Random streams</li><li>External streams to Apache Kafka, Confluent Cloud, Redpanda</li></ul> | <ul><li>Everything in Proton</li><li>Apache Pulsar</li><li>Ably</li><li>CSV upload</li><li>streaming ingestion via REST API</li></ul> |
| **Data destinations (sinks)** | <ul><li>External streams to Apache Kafka, Confluent Cloud, Redpand (coming soon)</li></ul> | <ul><li>Everything in Proton</li><li>Apache Pulsar</li><li>Slack</li><li>Webhook</li><li>Timeplus stream</li></ul> |
| **Support**                   | <ul><li>Community support from GitHub and Slack</li></ul> | <ul><li>Enterprise support via email, Slack, and Zoom, with a SLA</li></ul> |

These details are subject to change, but we'll do our best to make sure they accurately represent the latest roadmaps for Proton and Timeplus.

## My organization already uses ClickHouse—are there plans to integrate Proton with the open source ClickHouse project?

We would love to!

We are in conversation with the folks at ClickHouse, Inc., and the ClickHouse open source project at large, to scope the possibility of deep integration between the projects. We are working closely with the ClickHouse team to explore various options for integrating or re-using your existing ClickHouse deployment alongside Proton.

We publish a biweekly newsletter on [LinkedIn](https://www.linkedin.com/company/timeplusinc)—subscribe there to be the first to know of updates to this developing partnership.

## If I'm familiar with ClickHouse, how easy is it for me to use Proton?

We designed Proton's usage to be similar to ClickHouse, with a few key differences:

- Timeplus' default SQL query mode is **streaming**, which means it is long-running and continuously tracks and evaluates changed data and pushes results to users or target systems. To create a [historical data query](functions_for_streaming#table), wrap your SQL in `table(stream)`.
- We renamed data types and functions to remove camelcase. For example, ClickHouse's `toInt8()` is renamed `to_int8()` in Proton. Our [functions](functions) docs have additional details.
- Not all ClickHouse functions are currently enabled in Proton or work in a streaming query. If we should add or enhance the functions available in Proton, let us know in the [GitHub issues](https://github.com/timeplus-io/proton/issues) for Proton.
- Materialized Views in ClickHouse works for one source table, and data is processed at the index time. In Proton, you can define a [Materialized View](proton-create-view#m_view) with a streaming SQL, for any number of streams, with JOIN, CTE, or subqueries. Proton continuously runs the query and sends the results to the internal stream or the target stream.
- In Proton, [JOINs](joins) are a powerful and flexible means of combining data from multiple sources into a single stream.

See the documentation for full usage details.

## Is Proton usage tracked?

Yes. We have enabled telemetry in the following areas to understand how the community is using Proton and help us improve the project:

- **Via Docker image download statistics**, which are provided by GitHub _without_ any personally identifying information (PII), such as IP addresses.

- **On start**, Proton reports the following data to a public endpoint:

   - Current Proton version
   - CPU and memory availability

  No user data, schemas, SQL statements, or personally identifiable information (PII) is ever sent by Proton to this public endpoint.

  You can disable telemetry in Proton via the environment variable `TELEMETRY_ENABLED`, such as `docker run --name proton ghcr.io/timeplus-io/proton:develop --env TELEMETRY_ENABLED=false` or update the configuration with the following steps:

  1. Start the Proton Docker image
  2. Connect to the running container with `docker exec -it proton bin/sh`
  3. Run the following command to edit the container's configuration:
    ```
    sed -i 's/telemetry_enabled: true/telemetry_enabled: false/g' /etc/proton-server/config.yaml  
    ```
   4. Stop and start the container again to run Proton with all telemetry disabled.

See our [privacy policy](https://www.timeplus.com/privacy-policy) for complete details about the telemetry we collect and use.

## Does Proton provide a JDBC/ODBC driver?

Not yet. You can send the processed data to Kafka topics via External Stream, use the proton-go-driver, or benthos to send the data to other systems. Currently no JDBC or ODBC driver is supported, but we have this in our roadmap.

If you are on Timeplus Cloud, you can use the REST API or SDK to run queries or manage resources in Timeplus, via the API server, which is not part of Proton.

Create a [GitHub issue](https://github.com/timeplus-io/proton/issues) or contact us on [Slack](https://timeplus.com/slack) if your use case requires a JDBC/ODBC driver.

## Can I contribute to Proton?

Yes!

The best way to get started is to check out the [existing issues](https://github.com/timeplus-io/proton/issues) in the Proton repository on GitHub. We're also actively discussing future versions of Proton in the `#proton` and `#contributing` channels on the [Timeplus Community Slack](https://timeplus.com/slack).

## Where can I learn more about Proton?

We're currently building out resources where you can learn about Proton's architecture, features, and future:

- [GitHub](https://github.com/timeplus-io/proton/)
- [Documentation](https://docs.timeplus.com/proton)
- [High-level architecture](https://docs.timeplus.com/proton-architecture)
- [Wiki](https://github.com/timeplus-io/proton/wiki/Contributing)

We also discuss our journey to releasing Proton in open source in our ***[announcement post](#)***. (TBD)

## How can I get started?

Learn how to pull and run the Proton image and query a test stream in our [documentation](proton#get-started). To see a more complete use case in action, using Proton, Redpanda, and sample live data, check out our [tutorial](proton-kafka#tutorial) that leverages Docker Compose.

If you need advanced deployment strategies or features, with Proton running behind the scenes, create your first workspace with [Timeplus Cloud](https://us.timeplus.cloud/).
