# Biweekly Updates

This page summarizes changes for Timeplus Enterprise and Timeplus Proton, on a biweekly basis, including new features and important bug fixes.

## Aug 6, 2024

### Timeplus Enterprise v2.4

- Timeplus Enterprise v2.4.15 is released. [See full changelog](enterprise-releases)
- [timeplus-native-jdbc](jdbc) v2.0.3 and v2.0.4 now available.
  - Bug fix: For low_cardinality(nullable), nullable(uuid), map(low_cardinality) and tuple(low_cardinality)
  - Bug fix: Fixed logging problem in some datatypes
  - Bug fix: For the map defaultValue()
- Improved error handling in the SQL Console: if errors occur when executing the query, runtime errors and intermediate query results are shown.
- With the new [mutable stream](mutable-stream) in Timeplus Enterprise, versioned stream and changelog stream are now deprecated. We now have two types of streams: append-only and mutable.
- Stream “mode” is renamed to stream “type” in the web console UI.

### Timeplus Proton v1.5

- Timeplus Proton v1.5.15 is released, allowing Timeplus Enterprise v2.4 to read or write via external streams. [Learn more](timeplus-external-stream)

## Jul 22, 2024

[Timeplus-native-jdbc](https://github.com/timeplus-io/timeplus-native-jdbc) is updated (v2.0.2), with bigint and decimal types are now supported, and a bugfix for invalid version for low cardinality key.

### Timeplus Proton (v1.5.14 and v1.5.13)

- Remote user-defined functions (UDFs) can now be created via SQL.
  - Example: `CREATE REMOTE FUNCTION ip_lookup(ip string) RETURNS string URL 'https://abc.lambda-url.us-west-2.on.aws/'`
- Mutable streams performance tuning: added [key_space_full_scan_threads](mutable-stream#key_space_full_scan_threads) setting.
- Improved asof join performance.
- Added support for primary key columns in secondary key.
- (v1.5.13) Bugfix: When the format schema is dropped, the format schema cache is now properly cleared
- (v1.5.13) Bugfix: A null pointer access before type cast

### Timeplus 企业版

- When launching Timeplus Enterprise for the first time, a system dashboard will be created to show usage and workspace stats.
- In the SQL Console, see a query's pipeline after running a query. Note: This is available for single-node on-prem deployments.
- New external stream: AutoMQ. A configuration wizard is available in the console UI. [Learn more](automq-kafka-source)
- New stream mode: mutable streams, where values with the same primary key(s) will be overwritten. More advanced configuration options will be available soon.
- In the Help side panel, see detailed version and build times for components.
- A new "Get Started" section on the homepage for on-prem deployments, with links to a demo video, docs, and support.
- Added additional metrics for materialized views.
- Updated license UI for on-prem deployments.
- Ably data source is now removed.

## Jul 8, 2024

A new [JDBC driver](https://github.com/timeplus-io/timeplus-native-jdbc) for Timeplus is now available, supporting both streaming and batch queries. Compared to the JDBC driver we released last year, this new driver talks to Timeplus via the TCP native protocol, with better performance. [Learn more](jdbc)

### Timeplus Proton v1.5.12

- Updated the health check endpoint. Previously, http://localhost:8123/ping was used. Now, use either http://localhost:8123/timeplusd/ping or http://localhost:8123/proton/ping.
- Bug fix: When querying an external stream, we've fixed an issue where `select .. from table(kafka_ext_stream)` may become stuck if there are unexpected data in the topic.

### Timeplus 企业版

- Different channels for stable builds and latest builds:
  - `curl https://install.timeplus.com | sh` downloads and installs the stable build (currently v2.3.0).
  - `curl https://install.timeplus.com/latest | sh` downloads and installs the latest build for you to try newest features and bug fixes (currently v2.3.5).
  - See our [changelog](enterprise-releases) for each stable/latest version.
- New SQL Commands: SYSTEM PAUSE and SYSTEM UNPAUSE. If you want to pause a materialized view, run `SYSTEM PAUSE MATERIALIZED VIEW mv`. To unpause it, run `SYSTEM UNPAUSE MATERIALIZED VIEW mv`. We added this feature based on user feedback and to improve troubleshooting efficiency. [Learn more](sql-system-pause)

## Jun 24, 2024

Timeplus Enterprise v2 is now available for cloud or self-hosted deployment. [See installation options](timeplus.com/product#selfhosted) for self-hosting.

### Timeplus Proton v1.5.11

- When creating an external stream for Apache Kafka and running `select count() from table(stream)`, Timeplus Proton will retrieve the number of messages in the Kafka topic. If you set `data_format = "RawBLOB", one_message_per_row=false`, Proton will use the Kafka offset to get the message count. But if `one_message_per_row=true`, then Proton will read each message to split the rows. It won’t retrieve the result as fast as calculating the offset, but it will be more accurate.
- When using an external stream to write data to Kafka, a new setting `kafka_max_message_size` is now available. When the external stream is created with `data_format='JSONEachRow',one_message_per_row=false`, each message in Kafka may contain multiple rows, with each row being a JSON document. This new setting `kafka_max_message_size` will control how much data will be put in a Kafka message and when to create a new Kafka message, ensuring each message won't exceed the `kafka_max_message_size` limit.
- New function: [array_fold](functions_for_comp#array_fold), which is equivalent to the Array.reduce function in JavaScript, and is used to fold or reduce the elements in an array from left to right by applying a lambda-function to the array elements in a cumulative manner.
- `array_max/min` functions now support datetime.

### Timeplus Enterprise v2.3.0

_Self-Hosted:_

- Account setup flow for self-hosted deployment: create account and login screens.
- License management: In Workspace Settings, see your existing licenses and entitlements. [Contact us](mailto:support@timeplus.com) to purchase a new license, then enter the license key and upload the license file in Workspace Settings.
- Usage monitoring: Also in Workspace Settings, see your daily usage for ingested data and scanned external stream data.
- Preview: Python User-Defined Functions (UDF). Create UDFs by leveraging Python libraries, such as pandas. [Contact us](mailto:support@timeplus.com) to try this feature.
