# Timeplus Proton FAQ

On September 21, 2023, Timeplus announced the open source project: [Timeplus Proton](https://github.com/timeplus-io/proton/). We're using this FAQ as the primary reference for learning about what Timeplus Proton is, how we licensed the code open source, how you can use Timeplus Proton today, and more.

## What is Timeplus Proton?

Timeplus Proton is the core engine powering [Timeplus Enterprise](https://www.timeplus.com), a unified streaming and historical data processing engine designed for efficiency and strong performance. Timeplus Proton has no external service dependencies, which allows you to deploy it on bare metal, edge devices, within containers, or as part of an orchestrated cloud environment.

Timeplus Proton builds on top of the popular open source [ClickHouse project](https://github.com/ClickHouse/ClickHouse) for its historical data, storage, computing functionality, and a portion of its query engine.

By leveraging the proven technologies of ClickHouse, Timeplus Proton brings more mature online analytical processing (OLAP) capabilities to the open source community with lots of new development to unify the streaming and processing engines. You can use Timeplus Proton alongside your existing ClickHouse deployment to enable additional functionality.

## How is Timeplus Proton licensed? {#license}

Timeplus Proton follows the ClickHouse licensing model with [Apache License 2.0](https://github.com/timeplus-io/proton/blob/develop/LICENSE), which is also used by popular open source projects like [Kubernetes](https://github.com/kubernetes/kubernetes) and [Apache Flink](https://github.com/apache/flink).

Apache License 2.0 is a [permissive license](https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/) that allows for most uses without restriction. We'll talk more about how you can use Timeplus Proton in the [following section](#use).

We chose this license for a few important reasons:

- **We're following the path ClickHouse first paved**. Because Timeplus Proton leverages many excellent ClickHouse technologies, we hope to see our communities grow together and the two open source projects become more deeply integrated over time.

- **We want to see Timeplus Proton push the limits of streaming and data processing in unique and exotic environments**. While Timeplus Proton already powers the enterprise-ready Timeplus Cloud, developers or other end users can download and deploy Timeplus Proton or modify the code locally for use in a private cloud infrastructure. Using Timeplus Proton does not require you adopt Timeplus Enterprise or meet with our sales team.

- **We're eager to see what value a _free_ streaming and historical data processing engine delivers**. By releasing the single-node edition of Timeplus Proton to the open source community, we're giving developers, hobbyists, enthusiasts, and anyone who wants to try new technologies a new path that's entirely free.

- **We're building a new community around unified streaming and data processing**. ClickHouse paved the way for processing, but we have much to experiment and discover together around streaming. We can't wait to get feedback from developers and users within organizations of all sizes and degrees of streaming maturity.

## What uses, commercial and beyond, are allowed with the Timeplus Proton project? {#use}

Under Apache License 2.0, you are allowed to modify, distribute, and sublicense Timeplus Proton as it's available on GitHub.

You can also include Timeplus Proton in proprietary software that you then sell to customers, but that does not grant you any rights to use Proton or Timeplus trademarks or imply a commercial relationship or partnership between your organization and Timeplus.

Apache License 2.0 also prevents any contributor to Timeplus Proton—a member of the Timeplus team or an outside contributor—from being held liable by end users, whether they are individual developers or commercial organizations.

## What features are available with Timeplus Proton versus Timeplus Enterprise? {#compare}

Please refer to our [comparison page](/proton-oss-vs-enterprise) for a detailed comparison of Timeplus Proton and Timeplus Enterprise.

## My organization already uses ClickHouse—are there plans to integrate Timeplus Proton with the open source ClickHouse project?

You can create an [External Table](/clickhouse-external-table) to read or write ClickHouse tables from Timeplus Proton. Check the tutorials for how to build streaming ETL [from Kafka to ClickHouse](/tutorial-sql-etl-kafka-to-ch), or [from MySQL to ClickHouse](/tutorial-sql-etl-mysql-to-ch), via Timeplus.

We are also in conversation with the folks at ClickHouse, Inc., and the ClickHouse open source project at large, to scope the possibility of deep integration between the projects.

## If I'm familiar with ClickHouse, how easy is it for me to use Timeplus Proton?

Short answer: very easy. We designed Timeplus Proton's usage to be similar to ClickHouse, with a few key differences:

- Timeplus' default SQL query mode is **streaming**, which means it is long-running and continuously tracks and evaluates changed data and pushes results to users or target systems. To create a [historical data query](/functions_for_streaming#table), wrap your SQL in `table(stream)`.
- The SQL keyword `AS` is required to create a temporary name for a table, stream, or a column.
- We renamed data types and functions to remove camelcase. For example, ClickHouse's `toInt8()` is renamed `to_int8()` in Timeplus Proton. Our [functions](/functions) docs have additional details.
- Not all ClickHouse functions are currently enabled in Timeplus Proton or work in a streaming query. If we should add or enhance the functions available in Timeplus Proton, let us know in the [GitHub issues](https://github.com/timeplus-io/proton/issues).
- Materialized Views in ClickHouse works for one source table, and data is processed at the index time. In Timeplus Proton, you can define a [Materialized View](/materialized-view) with a streaming SQL, for any number of streams, with JOIN, CTE, or subqueries. Timeplus Proton continuously runs the query and sends the results to the internal stream or the target stream.
- In Timeplus Proton, [JOINs](/streaming-joins) are a powerful and flexible means of combining data from multiple sources into a single stream.

See the documentation for full usage details.

## Is Timeplus Proton usage tracked?

Yes. We have enabled telemetry in the following areas to understand how the community is using Timeplus Proton and help us improve the project:

- **Via Docker image download statistics**, which are provided by GitHub _without_ any personally identifying information (PII), such as IP addresses.

- **On start**, Timeplus Proton reports the following data to a public endpoint:

  - Current Timeplus Proton version
  - CPU and memory availability

No user data, schemas, SQL statements, or personally identifiable information (PII) is ever sent by Timeplus Proton to this public endpoint.

You can disable telemetry in Timeplus Proton via the environment variable `TELEMETRY_ENABLED`, such as `docker run --env TELEMETRY_ENABLED=false --name proton ghcr.io/timeplus-io/proton:latest ` or update the configuration with the following steps:

1. Start the Timeplus Proton Docker image
2. Connect to the running container with `docker exec -it proton bin/sh`
3. Run the following command to edit the container's configuration:

```bash
sed -i 's/telemetry_enabled: true/telemetry_enabled: false/g' /etc/proton-server/config.yaml
```

4.  Stop and start the container again to run Timeplus Proton with all telemetry disabled.

If you use the single binary, the environment variable `TELEMETRY_ENABLED` also works. Alternatively, you can manually update config.yaml file to set `telemetry_enabled: false`.

See our [privacy policy](https://www.timeplus.com/privacy-policy) for complete details about the telemetry we collect and use.

## Does Timeplus Proton provide a JDBC/ODBC driver?

JDBC driver is available at https://github.com/timeplus-io/proton-java-driver, and the ODBC driver is available at https://github.com/timeplus-io/proton-odbc.

In the meanwhile, you can send the processed data to Kafka topics via External Stream, use the [proton-go-driver](https://github.com/timeplus-io/proton-go-driver), or [Redpanda Connect](https://github.com/redpanda-data/connect) to send the data to other systems.

If you are on Timeplus Enterprise, you can use the REST API or [SDK](https://github.com/timeplus-io/gluon) to run queries or manage resources in Timeplus, via the API server, which is not part of Timeplus Proton.

## Can I contribute to Timeplus Proton?

Yes!

The best way to get started is to check out the [existing issues](https://github.com/timeplus-io/proton/issues) in the Timeplus Proton repository on GitHub. We're also actively discussing future versions of Timeplus Proton in the `#proton` and `#contributing` channels in our [Timeplus Community Slack](https://timeplus.com/slack).

## Where can I learn more about Timeplus Proton?

We're currently building out resources where you can learn about Timeplus Proton's architecture, features, and future:

- [GitHub](https://github.com/timeplus-io/proton/)
- [Documentation](/proton)
- [High-level architecture](/architecture)
- [Videos](https://youtube.com/@timeplusdata)
- [Wiki](https://github.com/timeplus-io/proton/wiki)

We also discuss our journey to releasing Timeplus Proton in open source in our [announcement post](https://www.timeplus.com/post/timeplus-journey-to-open-source).

## How can I get started?

Learn how to pull and run the Timeplus Proton image and query a test stream in our [documentation](/proton#-deployment). To see a more complete use case in action, using Timeplus Proton, Redpanda, and sample live data, check out our tutorial that leverages Docker Compose.

If you need advanced deployment strategies or features, with Timeplus Proton running behind the scenes, please download the [Timeplus Enterprise](https://timeplus.com/install) package.
