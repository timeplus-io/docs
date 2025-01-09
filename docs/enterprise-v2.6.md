# Timeplus Enterprise 2.6
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server to provide web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connector: The service to provide extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Key Highlights
Key highlights of this release:
* Introduced hybrid hash table. For streaming SQL with JOINs or aggregations, by default a memory based hash table is used. This is helpful for preventing the memory limits from being exceeded for large data streams with hundreds of GB of data. You can adjust the query setting to apply the new hybrid hash table, which uses both the memory and the local disk to store the internal state as a hash table.
* Able to add secondary indexes for mutable streams.
* A stream's historical data can now be removed by running `TRUNCATE STREAM stream_name`.
* Improved the read/write performance for ClickHouse external tables.
* Added UI wizards for Coinbase data sources and Apache Pulsar external streams.
* Redesigned SQL Console and SQL Helper UI for better usability. Access the SQL Helper via the panel to the left of the SQL editor box.
* Random streams are now listed in the streams resource list and data lineage diagram.
* Enhanced data lineage view and dashboard visualization.
* Quick access to streams, dashboards, and common actions via Command+K keyboard shortcut for Mac, or Windows+K for PC.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
Please use the stable releases for production deployment, while we also provide latest engineering builds for testing and evaluation.

### 2.6.0 {#2_6_0}
Built on 01-08-2025. You can install via:
* For Linux or Mac users: `curl https://install.timeplus.com/2.6 | sh`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v4.0.10 ..`
* For Docker users (not for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.0`

Component versions:
* timeplusd 2.5.8
* timeplus_web 2.1.7
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_0}

Compared to the [2.5.11](/enterprise-v2.5#2_5_11) release:
* timeplusd 2.4.26 -> 2.5.8
  * Introduced hybrid hash table. For streaming SQL with JOINs or aggregations, by default a memory based hash table is used. For large data streams with hundreds of GB data, to avoid exceeding the memory limit, you can set the query setting to use the new hybrid hash table, which uses both the memory and the local disk to store the internal state as a hash table. You can add the following to the setting `SETTINGS default_hash_table='hybrid'`.
  * Historical data of a stream can be removed by `TRUNCATE STREAM stream_name`.
  * Added a new [EMIT policy](/query-syntax#emit) in streaming SQL with global aggregation. The new [EMIT PERIODIC .. REPEAT](/query-syntax#emit_periodic_repeat) syntax will show the last aggregation result even there is no new event.
  * Improved performance for [EMIT ON UPDATE](/query-syntax#emit_on_update) queries. In extreme scenarios, it may lead to a significant increase in memory usage. In that case, you can disable it via `SETTINGS optimize_aggregation_emit_on_updates=false`.
  * For streams and mutable streams with multiple shards, you can read specific shards by setting `shards`, e.g. `SELECT * FROM stream SETTINGS shards='0,2'`.
  * While reading CSV or TSV files, you can skip specific rows by setting `SETTINGS input_format_csv_skip_first_lines=N` or `SETTINGS input_format_tsv_skip_first_lines=N`. Default value is 0.
  * Improved performance for ClickHouse external tables' read and write. Make the maximum number of pooled connections configurable via `pooled_connections` setting, with default value 3000.
  * Able to add secondary indexes for mutable streams. [Learn more](/sql-alter-stream#add-index).
  * For a multi-node cluster, a `_tp_sn` column is added to each stream (except external streams or random streams), as the sequence number in the unified streaming and historical storages. This column is used for data replication among the cluster. By default, it is hidden in the query results. You can show it by setting `SETTINGS asterisk_include_tp_sn_column=true`. This setting is required when you use `INSERT..SELECT` SQL to copy data between streams: `INSERT INTO stream2 SELECT * FROM stream1 SETTINGS asterisk_include_tp_sn_column=true`.
  * For Kafka external streams, the latest offset(sequence number) is tracked in `system.stream_state_log` table. You can export the table as a CSV file via the [timeplus diag](/cli-diag) command.
  * [Well-known Protobuf types](https://protobuf.dev/reference/protobuf/google.protobuf/) are added to the Docker image.
* timeplus_web 2.0.6 -> 2.1.7
  * Quick access to streams, dashboards, and common actions via Command+K keyboard shortcut for Mac, or Windows+K for PC.
  * Added UI wizards for Coinbase data sources and Apache Pulsar external streams.
  * Create the demo data sources with random streams, instead of a Redpanda Connect source.
  * At the end of the creating data source wizard, show a few common steps to use the newly created sources or streams.
  * Redesigned SQL Console and SQL Helper UI for better usability. Access the SQL Helper via the panel to the left of the SQL editor box.
  * Enhanced data lineage visualization with throughput and memory metrics for materialized views.
  * Random streams are now listed in the streams resource list and data lineage diagram.
  * Universal side panel for all Timeplus resources to check the metadata and statistics, as well as common actions.
  * Enhanced visualizations: set fixed width for table panels, hide/show columns for map tooltips, and more.
  * Able to show the Timeplus Enterprise version in the "Get Support" tab of the help side panel.
  * Show the latest list of Redpanda Connect input and output connectors.
  * Able to show row numbers in the table view of dashboards.
* timeplus_appserver 2.0.9 -> 2.1.6
  * Added new data source for Coinbase.
  * Able to list random streams.
* timeplus_connector 2.0.3 -> 2.1.1
  * Upgraded to Redpanda Connect v4.44, Benthos framework 4.44 and Golang 1.23.
* timeplus cli 1.2.8 -> 1.2.11
  * Added an option to disable telemetry in the [timeplus start](/cli-start) command.
  * The [timeplus diag](/cli-diag) command now exports the `system.stream_state_log` table as a CSV file in the log directory.

You can upgrade a deployment of Timeplus Enterprise 2.5 to Timeplus Enterprise 2.6, by stopping the components and replacing the binary files, or reusing the Docker or Kubernetes volumes and update the image versions.

#### Known issues {#known_issue_2_6_0}
1. If you have deployed one of the 2.4.x or 2.5.x releases, you can reuse the data and configuration directly. However, if your current deployment is [2.3](/enterprise-v2.3) or earlier, you cannot upgrade directly. Please have a clean installation of 2.6.x release, then use tools like [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for migration.
2. Pulsar external streams are only available in Linux bare metal builds and Linux-based Docker images. This type of external stream is not available in macOS bare metal builds.
