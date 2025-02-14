# Biweekly Updates

This page summarizes changes for Timeplus Enterprise and Timeplus Proton, on a biweekly basis, including new features and important bug fixes.

## Feb 17, 2025

### Timeplus Enterprise v2.6.2
We released a patch release for Timeplus Enterprise [v2.6](/enterprise-v2.6#2_6_2). The key changes are:
  * fix potential corruption for a stream when it's altered multiple times
  * better data recovery for file corruption due to power loss
  * set mutable streams' default logstore retention policy from keeping forever to automatic

If you are running Timeplus Enterprise v2.6, we recommend upgrading to this version.

### Timeplus Native JDBC v2.0.8
Support named tuples, such as `tuple(a int8, b string)`. This is useful when you want to return multiple columns in a function, such as `dict_get`.

### Timeplus Grafana plugin v2.1.2
Support more transformations in Grafana query panel, such as [Config from query results](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/transform-data/#config-from-query-results).

## Feb 3, 2025

### Timeplus Enterprise v2.4.25
We released a patch release for Timeplus Enterprise [v2.4](/enterprise-v2.4#2_4_25). The key changes are:
  * fix potential corruption for a stream when it's altered multiple times
  * better data recovery for file corruption due to power loss
  * set mutable streams' default logstore retention policy from keeping forever to automatic

If you are running Timeplus Enterprise v2.4, we recommend upgrading to this version.

### Timeplus Grafana plugin v2.1.1
The new version of Grafana plugin improved the batching strategy to render results from streaming queries. If there is any error in the SQL syntax, the error message will be shown in the Grafana query panel.

## Jan 20, 2025

### Timeplus Enterprise v2.6
[Timeplus Enterprise v2.6](/enterprise-v2.6) is now Generally Available! Key breakthroughs:
* **Revolutionary hybrid hash table technology.** For streaming SQL with JOINs or aggregations, by default a memory based hash table is used. This is helpful for preventing the memory limits from being exceeded for large data streams with hundreds of GB of data. You can adjust the query setting to apply the new hybrid hash table, which uses both the memory and the local disk to store the internal state as a hash table.
* **Enhanced operational visibility.** Gain complete transparency into your system's performance through comprehensive monitoring of materialized views and streams. Track state changes, errors, and throughput metrics via [system.stream_state_log](/system-stream-state-log) and [system.stream_metric_log](/system-stream-metric-log).
* **Advanced cross-deployment integration.** Seamlessly write data to remote Timeplus deployments by configuring [Timeplus external stream](/timeplus-external-stream) as targets in materialized views.
* **Improved data management capabilities.** Add new columns to an existing stream. Truncate historical data for streams. Create new databases to organize your streams and materialized views.
* **Optimized ClickHouse integration.** Significant performance improvements for read/write operations with ClickHouse external tables.
* **Enhanced user experience.** New UI wizards for Coinbase data sources and Apache Pulsar external streams, alongside a redesigned SQL Console and SQL Helper interface for improved usability. Quick access to streams, dashboards, and common actions via Command+K (Mac) or Windows+K (PC) keyboard shortcuts.

### Timeplus Proton v1.6.9
* Timeplus external stream is now available in Timeplus Proton. You can read or write data across Timeplus deployments. [Learn more](/timeplus-external-stream).

### Timeplus Grafana plugin v2.1.0
The new version of Grafana plugin supports query variables and annotations. The SQL editor is enlarged for better readability and editing experience.

## Jan 6, 2025

Happy New Year 🎉
### Timeplus Proton v1.6.8
* Pulsar external stream is now available in Timeplus Proton. You can use Pulsar external stream to query or process data in Pulsar with SQL. [Learn more](/pulsar-external-stream).

## Dec 23, 2024

Merry Christmas 🎄
### Timeplus Proton v1.6.7
* `console.log(..)` function is available in [JavaScript UDF](/js-udf#consolelog). The log messages will be available in the server logs, such as /var/log/proton-server/proton-server.log .
* New SQL functions: [largest_triangle_three_buckets](/functions_for_agg#largest_triangle_three_buckets), [avg_time_weighted](/functions_for_agg#avg_time_weighted) and [median_time_weighted](/functions_for_agg#median_time_weighted).
* Enhance the [dedup](/functions_for_streaming#dedup) function to support the edge case that multiple columns with the same name.
* Fixed the issue that Timeplus Proton binary cannot be ran in macOS v15.x with Apple chips.

### Timeplus as Flyway Community DB Support
* A Timeplus plugin is available for [Redgate Flyway](https://flywaydb.org/). You can use Flyway to manage your Timeplus database resources. [Learn More](/flyway).

## Dec 9, 2024

### Timeplus Enterprise v2.5
 * [Timeplus Enterprise v2.5](/enterprise-v2.5) is now Generally Available! This milestone marks a significant leap forward for our Timeplus Enterprise v2 which was released earlier this year. In this release, we pushed our unparalleled performance to a new level, natively integrated with Redpanda Connect and Apache Pulsar to access a rich ecosystem of enterprise and AI applications. Key breakthroughs:
    * [Materialized Views Auto-Rebalancing](/proton-create-view#auto-balancing)
    * Performance Improvements
    * Enterprise-Grade Real-Time Data Integration with [200+ Connectors from Redpanda Connect](/redpanda-connect)
    * [Pulsar External Stream](pulsar-external-stream) to query or process data in Pulsar with SQL

### Timeplus Proton v1.6.4
* Support more Linux distributions by lowering the required version for GLIBC. For AMD64 chips,the minimal version is 2.2.5, and for ARM64 chips, the minimal version is 2.17.

### Timeplus Python Driver v0.2.13
* [The new version](https://github.com/timeplus-io/proton-python-driver/releases) adds support for dataframe and idempotent query.

## Nov 25, 2024

### Timeplus Proton v1.6.3
* Enhanced the [unique](/functions_for_agg#unique) and [unique_exact](/functions_for_agg#unique_exact) functions to support [Changelog Streams](/changelog-stream).
* Updated a few [examples](https://github.com/timeplus-io/proton/tree/develop/examples)
  * [CDC(Change Data Capture)](https://github.com/timeplus-io/proton/tree/develop/examples/cdc) example with Debezium and MySQL.
  * Use latest [Grafana Plugin](https://github.com/timeplus-io/proton-grafana-source) in [IoT demo with awesome sensor app](https://github.com/timeplus-io/proton/tree/develop/examples/awesome-sensor-logger) and [Carsharing data generator](https://github.com/timeplus-io/proton/tree/develop/examples/grafana).
  * A new sample to [detect idle stream ingestion](https://github.com/timeplus-io/proton/tree/develop/examples/broken-stream-monitor) using the new [EMIT PERIODIC .. REPEAT](/query-syntax#emit_periodic_repeat) syntax.

### Timeplus Native JDBC v2.0.7
* Fixed the issue of getTables method in [TimeplusDatabaseMetadata](https://github.com/timeplus-io/timeplus-native-jdbc/blob/main/timeplus-native-jdbc/src/main/java/com/timeplus/jdbc/TimeplusDatabaseMetadata.java), so that Timeplus streams, views and materialized views can be listed in SQL tools.
* Better dependency management and minor bug fixes.

## Nov 11, 2024

### Timeplus Proton v1.6.2
* Added a new [EMIT policy](/query-syntax#emit) in streaming SQL with global aggregation. The new [EMIT PERIODIC .. REPEAT](/query-syntax#emit_periodic_repeat) syntax will show the last aggregation result even there is no new event.
* Fixed a bug that views with incorrect syntax could be created.

### Timeplus Grafana plugin v2.0.0
* The new release of Timeplus Grafana Plugin v2.0, available now on [our GitHub repository](https://github.com/timeplus-io/proton-grafana-source). This latest version introduces significant improvements in both performance and stability. Whether you’re using Timeplus Enterprise or the open-source Timeplus Proton, this plugin allows you to seamlessly monitor real-time data through Grafana, utilizing both simple and complex analytics to track live data trends.

### Documentation Updates
* Updated the guide of [Ingest REST API](/ingest-api) to add more instructions for self-hosting Timeplus Enterprise. API keys are only available in Timeplus Cloud. For self-hosting deployment, please encode the username and password with base64, and set it in the HTTP Authorization header.
* Updated the structure of [Kafka external stream](/proton-kafka). Mentioned `RawBLOB` as a supported data format.
* Added documentation for materialized view [load balancing](/proton-create-view#memory_weight).

## Oct 28, 2024

### Timeplus Proton v1.6.1
* Fixed the issue that [SHOW CREATE STREAM](/sql-show-create) doesn't work. Since this version, you can run either `SHOW CREATE stream_name` or `SHOW CREATE STREAM stream_name`.
* Refined the display of datetime value in `proton client`. Same behavior as before, if the timezone is not specified. For `datetime('UTC')`, "Z" will be shown at the end. For other timezones, such as `datetime('Europe/London')`, the full timezone offset will be shown, such as "2024-09-10 18:21:46+01:00".

### Timeplus Python Driver v0.2.11
* [The new version](https://github.com/timeplus-io/proton-python-driver/releases/tag/v0.2.11) adds support for Python 3.13.

### Sling v1.2.21 and v1.2.22
[Sling](/sling) is a CLI tool that extracts data from a source storage/database and loads it in a target storage/database. You can use sling to export data from one Timeplus deployment and import to the other Timeplus deployment. In these 2 releases, we contributed a few new features and enhancements:
* Added new `SLING_DIRECT_INSERT` environment variable to enable direct data inserts from source Timeplus to the target Timeplus, bypassing a temporary table.
* By default, the exported CSV files use " to quote the value. Now this can be customized to any value, such as `$a,b$`, instead of `"a,b"`.

### Documentation Updates
* The top navigation bar is updated to provide quick accesses to the major steps to use Timeplus.
* Refined [Insert Idempotency](/idempotent) page to highlight `x-timeplus-idempotent-id` is available in Ingest REST API. Also explained the `max_idempotent_ids` setting.
* Added documentations for function [format_readable_quantity](/functions_for_text#format_readable_quantity) and [format_readable_size](/functions_for_text#format_readable_size).

## Oct 14, 2024

### Timeplus Web Console v2.0.3
We upgraded the `timeplus_web` component in https://demo.timeplus.cloud. This will be rolled out to https://us-west-2.timeplus.cloud soon. Compared to the previous version (v2.0.1), the key enhancements are:
* Redesigned the "Data Collection" and "Sink" page to support hundreds of input/output connectors, powered by [Redpanda Connect](https://www.redpanda.com/connect). Timeplus Enterprise provides intuitive configuration wizards for NATS, WebSocket and HTTP Stream. For other data sources or destinations, you can also configure via a YAML file. Stay tuned for more product announcements and showcases.
* Reordered the items on resource side panel.
* Improved the error handling on SQL Console page and upload CSV page.

### Testcontainers for Java v1.20.2
The new version of Testcontainers for Java supports the Timeplus module. You can automate the stream processing with Timeplus and Kafka containers in your JUnit test code. Check [the tutorial](/tutorial-testcontainers-java) for details.

### Documentation Updates
* You can specify an [idempotent_id](/idempotent) in the `INSERT` command and safely retry the command if it fails. No duplicated data will be inserted.
* You can run [ALTER STREAM .. DROP PARTITION ..](/sql-alter-stream#drop-partition) to delete some data in the stream.
* You can run [SELECT .. FROM .. LIMIT n OFFSET m](/query-syntax#offset) to fetch results from an offset.
* You can run [timeplus migrate](/cli-migrate) CLI command to migrate data from one deployment to the other deployment.
* [Tutorial](/tutorial-testcontainers-java) for setup Kafka and Timeplus with Testcontainers.
* The navigation tree in the Documentation site is refined.

## Sep 30, 2024

Timeplus Cloud has a new home. Our previous domain, https://us.timeplus.cloud, has been redirected to https://us-west-2.timeplus.cloud. All workspaces have been migrated and no further action is needed. If you create a workspace via https://demo.timeplus.cloud, you will also be redirected to https://us-west-2.timeplus.cloud. The latest Timeplus Enterprise features are available in the new site. If you prefer using a different cloud region, please let us know.

### Timeplus Web Console v2.0.1
We upgraded the `timeplus_web` component in https://us-west-2.timeplus.cloud. Compared to v1.4.33 in Timeplus Enterprise self-hosted edition, the key enhancements are:
* You can now set a timezone in dashboards to display the datetime or timestamp in your preferred timezone.
* See additional metrics in the details side panel for streams, materialized views, external streams, or other resources: events per second, status, throughput, and more.
* Refinements to error and warning messages, including avoid showing two messages for the same resource.
* Moved the 'Send as Sink' button to the 'Save As' dropdown in the SQL Console.
* Able to render large numbers such as int256 or uint256.
* Wizard UI to create [Timeplus External Streams](/timeplus-external-stream).
* Wizard UI to create [Mutable Streams](/mutable-stream).
* Fix the issue where scrollbar is too thin.
* In SQL Console, you can write multiple SQL statements and select one to run the statement.


### Timeplus Rust Client v0.1.2
A maintenance release to include latest dependencies. No new features or bug fixes. Please get it via https://crates.io/crates/proton_client

## Sep 16, 2024

The new cloud service available at https://us-west-2.timeplus.cloud. The previous cloud (https://us.timeplus.cloud) will be sunset. The new cloud service ships the latest Timeplus features, such as [mutable streams](/mutable-stream).

### Timeplus Proton v1.5.17 and v1.5.18
 * New feature: drop large streams via `SETTINGS force_drop_big_stream=true`. [Learn more](/sql-drop-stream#force_drop_big_stream)
 * New feature: support `EXPLAIN SELECT ..` as a sub-query
 * Fix the problem of multi-shard incorrect result on distinct
 * Improvement for telemetry service to exclude system level queries and make interval configurable
 * New feature: allow to set timeout for [Remote UDF](/sql-create-remote-function)

### Timeplus Destination Connector for Airbyte v0.1.20
Support us-west-2.timeplus.cloud as the default endpoint. Dependencies are updated. This is available for both Airbyte Cloud and Airbyte OSS.

### Timeplus Native JDBC v2.0.5
Support JDK 8, per customer feedback.

## Sep 2, 2024

### Timeplus Enterprise v2.4.23
 * Timeplus Enterprise [v2.4.23](/enterprise-v2.4#2_4_23) is released as the latest stable build.
 * The key changes are:
    * (timeplusd) support for dropping partitions on cluster
    * (timeplusd) add additional query_type in sql analyzer
    * (timeplusd) enhanced historical asof joins, with a performance improvement of over 30%
    * (timeplus_web) use username:password for ingest API wizard

### Timeplus C++ SDK
https://github.com/timeplus-io/timeplus-cpp is a public repo for integrating Timeplus with your C++ code.

You can run DDL, streaming queries, or data ingestion with this C++ client. Both sync and async inserts are supported, with idempotent_id support.

### Metabase Driver v0.50.4
The [v0.50.4 Metabase Proton Driver](https://github.com/timeplus-io/metabase-proton-driver/releases/tag/v0.50.4) supports metabase 0.50.x.

However it is verified to work with Proton 1.5.6, not the latest version of Timeplus Proton (currently 1.5.16) or Timeplus Enterprise yet.

We are actively working on the refinement to support latest Timeplus core engine.

## Aug 19, 2024

### Timeplus Enterprise v2.4.18
 * Timeplus Enterprise [v2.4.17](/enterprise-v2.4#2_4_17) and [v2.4.19](/enterprise-v2.4#2_4_19) are released.
 * The key changes are:
    * support running [table function](/functions_for_streaming#table) on [Timeplus External Stream](/timeplus-external-stream)
    * better track memory usage in macOS and Docker container.
    * allow you to [drop streams](/sql-drop-stream#force_drop_big_stream) with `force_drop_big_stream=true`
    * use username:password for ingest API wizard

### Timeplus Proton v1.5.16
 * When you start with `proton server`, it will listen on 0.0.0.0 (instead of 127.0.0.1 in previous versions), so you can connect to Proton from any host. This is not recommended for production deployment but is useful when you start Proton in a container and what to access it from the host.
 * Fix an issue, you can run `SELECT * FROM information_schema.tables`
 * Support append-only LEFT ALL JOIN append-only.

## Aug 6, 2024

### Timeplus Enterprise v2.4.15
 * Timeplus Enterprise v2.4.15 is released. [See full changelog](/enterprise-v2.4)
 * Improved error handling in the SQL Console: if errors occur when executing the query, runtime errors and intermediate query results are shown.
 * With the new [mutable stream](/mutable-stream) in Timeplus Enterprise, versioned stream and changelog stream are now deprecated. We now have two types of streams: append-only and mutable.
 * Stream “mode” is renamed to stream “type” in the web console UI.

### Timeplus Proton v1.5.15
 * Timeplus Proton v1.5.15 is released, allowing Timeplus Enterprise v2.4 to read or write via external streams. [Learn more](/timeplus-external-stream)

### Timeplus Native JDBC v2.0.4
    * Bug fix: For low_cardinality(nullable), nullable(uuid), map(low_cardinality) and tuple(low_cardinality)
    * Bug fix: Fixed logging problem in some datatypes
    * Bug fix: For the map defaultValue()
## Jul 22, 2024

### Timeplus Enterprise
We are working on Timeplus Enterprise v2.4.x. The build is not ready to be published yet. Key changes:
  * When launching Timeplus Enterprise for the first time, a system dashboard will be created to show usage and workspace stats.
  * In the SQL Console, see a query's pipeline after running a query. Note: This is available for single-node on-prem deployments.
  * New external stream: AutoMQ. A configuration wizard is available in the console UI. [Learn more](/automq-kafka-source)
  * New stream mode: mutable streams, where values with the same primary key(s) will be overwritten. More advanced configuration options will be available soon.
  * In the Help side panel, see detailed version and build times for components.
  * A new "Get Started" section on the homepage for on-prem deployments, with links to a demo video, docs, and support.
  * Added additional metrics for materialized views.
  * Updated license UI for on-prem deployments.
  * Ably data source is now removed.

### Timeplus Proton v1.5.14
  * Remote user-defined functions (UDFs) can now be created via SQL.
    * Example: `CREATE REMOTE FUNCTION ip_lookup(ip string) RETURNS string URL 'https://abc.lambda-url.us-west-2.on.aws/'`
  * Mutable streams performance tuning: added [key_space_full_scan_threads](/mutable-stream#key_space_full_scan_threads) setting.
  * Improved asof join performance.
  * Added support for primary key columns in secondary key.
  * (v1.5.13) Bugfix: When the format schema is dropped, the format schema cache is now properly cleared
  * (v1.5.13) Bugfix: A null pointer access before type cast

### Timeplus Native JDBC v2.0.2
bigint and decimal types are now supported, and a bugfix for invalid version for low cardinality key.
## Jul 8, 2024

### Timeplus Enterprise v2.3.5
  * New SQL Commands: SYSTEM PAUSE and SYSTEM UNPAUSE. If you want to pause a materialized view, run `SYSTEM PAUSE MATERIALIZED VIEW mv`. To unpause it, run `SYSTEM UNPAUSE MATERIALIZED VIEW mv`. We added this feature based on user feedback and to improve troubleshooting efficiency. [Learn more](/sql-system-pause)

### Timeplus Proton v1.5.12
  * Updated the health check endpoint. Previously, http://localhost:8123/ping was used. Now, use either http://localhost:8123/timeplusd/ping or http://localhost:8123/proton/ping.
  * Bug fix: When querying an external stream, we've fixed an issue where `select .. from table(kafka_ext_stream)` may become stuck if there are unexpected data in the topic.

### Timeplus Native JDBC v2.0.1
A new [JDBC driver](https://github.com/timeplus-io/timeplus-native-jdbc) for Timeplus is now available, supporting both streaming and batch queries. Compared to the JDBC driver we released last year, this new driver talks to Timeplus via the TCP native protocol, with better performance. [Learn more](/jdbc)

## Jun 24, 2024

Timeplus Enterprise v2 is now available for cloud or self-hosted deployment. [See installation options](https://timeplus.com/product) for self-hosting.

### Timeplus Enterprise v2.3.0
*Self-Hosted:*
  * Account setup flow for self-hosted deployment: create account and login screens.
  * License management: In Workspace Settings, see your existing licenses and entitlements. [Contact us](mailto:support@timeplus.com) to purchase a new license, then enter the license key and upload the license file in Workspace Settings.
  * Usage monitoring: Also in Workspace Settings, see your daily usage for ingested data and scanned external stream data.
  * Preview: Python User-Defined Functions (UDF). Create UDFs by leveraging Python libraries, such as pandas. [Contact us](mailto:support@timeplus.com) to try this feature.

### Timeplus Proton v1.5.11
  * When creating an external stream for Apache Kafka and running `select count() from table(stream)`, Timeplus Proton will retrieve the number of messages in the Kafka topic. If you set `data_format = "RawBLOB", one_message_per_row=false`, Proton will use the Kafka offset to get the message count. But if `one_message_per_row=true`, then Proton will read each message to split the rows. It won’t retrieve the result as fast as calculating the offset, but it will be more accurate.
  * When using an external stream to write data to Kafka, a new setting `kafka_max_message_size` is now available. When the external stream is created with `data_format='JSONEachRow',one_message_per_row=false`, each message in Kafka may contain multiple rows, with each row being a JSON document. This new setting `kafka_max_message_size` will control how much data will be put in a Kafka message and when to create a new Kafka message, ensuring each message won't exceed the `kafka_max_message_size` limit.
  * New function: [array_fold](/functions_for_comp#array_fold), which is equivalent to the Array.reduce function in JavaScript, and is used to fold or reduce the elements in an array from left to right by applying a lambda-function to the array elements in a cumulative manner.
  * `array_max/min` functions now support datetime.
