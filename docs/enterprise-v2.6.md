# Timeplus Enterprise 2.6
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server providing web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connector: The service providing extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component maintains its own version numbers. The version number for each Timeplus Enterprise release represents a verified combination of these components.

## Key Highlights
Key highlights of this release:
* **Revolutionary hybrid hash table technology.** For streaming SQL with JOINs or aggregations, by default a memory based hash table is used. This is helpful for preventing the memory limits from being exceeded for large data streams with hundreds of GB of data. You can adjust the query setting to apply the new hybrid hash table, which uses both the memory and the local disk to store the internal state as a hash table.
* **Enhanced operational visibility.** Gain complete transparency into your system's performance through comprehensive monitoring of materialized views and streams. Track state changes, errors, and throughput metrics via [system.stream_state_log](/system-stream-state-log) and [system.stream_metric_log](/system-stream-metric-log).
* **Advanced cross-deployment integration.** Seamlessly write data to remote Timeplus deployments by configuring [Timeplus external stream](/timeplus-external-stream) as targets in materialized views.
* **Improved data management capabilities.** Add new columns to an existing stream. Truncate historical data for streams. Create new databases to organize your streams and materialized views.
* **Optimized ClickHouse integration.** Significant performance improvements for read/write operations with ClickHouse external tables.
* **Enhanced user experience.** New UI wizards for Coinbase data sources and Apache Pulsar external streams, alongside a redesigned SQL Console and SQL Helper interface for improved usability. Quick access to streams, dashboards, and common actions via Command+K (Mac) or Windows+K (PC) keyboard shortcuts.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases

### 2.6.7 {#2_6_7}
Released on 03-26-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.6 | sh` [Downloads](/release-downloads#2_6_7)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.12 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.7`

Component versions:
* timeplusd 2.5.19
* timeplus_web 2.1.8
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_7}

Compared to the [2.6.6](#2_6_6) release:
* timeplusd 2.5.17 -> 2.5.19
  * fixed aggregate calculation issues
  * re-applied blocks for non-replicated streams in cluster settings

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_7}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.

### 2.6.6 {#2_6_6}
Released on 03-24-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_6_6)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.11 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.6`

Component versions:
* timeplusd 2.5.17
* timeplus_web 2.1.8
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_6}

Compared to the [2.6.5](#2_6_5) release:
* timeplusd 2.5.13 -> 2.5.17
  * fixed the issue for Pulsar external stream with compressed message types and partitions

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_6}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.

### 2.6.5 {#2_6_5}
Released on 03-18-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_6_5)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.10 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.5`

Component versions:
* timeplusd 2.5.16
* timeplus_web 2.1.8
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_5}

Compared to the [2.6.4](#2_6_4) release:
* timeplusd 2.5.13 -> 2.5.16
  * fixed several problems causing aggregation function misbehavior

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_5}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.

### 2.6.4 {#2_6_4}
Released on 03-06-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_6_4)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.9 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.4`

Component versions:
* timeplusd 2.5.13
* timeplus_web 2.1.8
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_4}

Compared to the [2.6.3](#2_6_3) release:
* timeplusd 2.5.12 -> 2.5.13
  * fixed bugs related to materialized views stuck

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_4}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.

### 2.6.3 {#2_6_3}
Released on 02-20-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_6_3)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.8 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.3`

Component versions:
* timeplusd 2.5.12
* timeplus_web 2.1.8
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_3}

Compared to the [2.6.2](#2_6_2) release:
* timeplus_web 2.1.7 -> 2.1.8
  * improved performance when there are 500+ streams

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_3}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.

### 2.6.2 {#2_6_2}
Released on 02-14-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.6 | sh` [Downloads](/release-downloads#2_6_2)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.7 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.2`

Component versions:
* timeplusd 2.5.12
* timeplus_web 2.1.7
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_2}

Compared to the [2.6.0](#2_6_0) release:
* timeplusd 2.5.10 -> 2.5.12
  * fix potential corruption for a stream when it's altered multiple times
  * better data recovery for file corruption due to power loss
  * set mutable streams' default logstore retention policy from keeping forever to automatic
  * fix issue where failed Materialized View creation attempts could block subsequent DDL operations under specific conditions in cluster

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_2}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.

### 2.6.0 {#2_6_0}
Released on 01-14-2025. Installation options:
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.5 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.6.0`

Component versions:
* timeplusd 2.5.10
* timeplus_web 2.1.7
* timeplus_appserver 2.1.6
* timeplus_connector 2.1.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_6_0}

Compared to the [2.5.12](/enterprise-v2.5#2_5_12) release:
* timeplusd 2.4.27 -> 2.5.10
  * Performance Enhancements:
    * Introduced hybrid hash table technology for streaming SQL with JOINs or aggregations. Configure via `SETTINGS default_hash_table='hybrid'` to optimize memory usage for large data streams.
    * Improved performance for [EMIT ON UPDATE](/query-syntax#emit_on_update) queries. Memory optimization available through `SETTINGS optimize_aggregation_emit_on_updates=false`.
    * Enhanced read/write performance for ClickHouse external tables with configurable `pooled_connections` setting (default: 3000).
  * Monitoring and Management:
    * Added [system.stream_state_log](/system-stream-state-log) and [system.stream_metric_log](/system-stream-metric-log) system streams for comprehensive resource monitoring.
    * Implemented Kafka offset tracking in [system.stream_state_log](/system-stream-state-log), exportable via [timeplus diag](/cli-diag) command.
    * A `_tp_sn` column is added to each stream (except external streams or random streams), as the sequence number in the unified streaming and historical storage. This column is used for data replication among the cluster. By default, it is hidden in the query results. You can show it by setting `SETTINGS asterisk_include_tp_sn_column=true`. This setting is required when you use `INSERT..SELECT` SQL to copy data between streams: `INSERT INTO stream2 SELECT * FROM stream1 SETTINGS asterisk_include_tp_sn_column=true`.
  * New Features:
    * Support for continuous data writing to remote Timeplus deployments via setting a [Timeplus external stream](/timeplus-external-stream) as the target in a materialized view.
    * New [EMIT PERIODIC .. REPEAT](/query-syntax#emit_periodic_repeat) syntax for emitting the last aggregation result even when there is no new event.
    * Able to create or drop databases via SQL in a cluster. The web console will be enhanced to support different databases in the next release.
    * Historical data of a stream can be removed by `TRUNCATE STREAM stream_name`.
    * Able to add new columns to a stream via `ALTER STREAM stream_name ADD COLUMN column_name data_type`, in both a single node or multi-node cluster.
    * For streams and mutable streams with multiple shards, you can read specific shards by setting `shards`, e.g. `SELECT * FROM stream SETTINGS shards='0,2'`.
    * While reading CSV or TSV files, you can skip specific rows by setting `SETTINGS input_format_csv_skip_first_lines=N` or `SETTINGS input_format_tsv_skip_first_lines=N`. Default value is 0.
    * Able to add secondary indexes for mutable streams. [Learn more](/sql-alter-stream#add-index).
    * [Well-known Protobuf types](https://protobuf.dev/reference/protobuf/google.protobuf/) are added to the Docker image.
* timeplus_web 2.0.6 -> 2.1.7
  * Implemented Command+K (Mac) or Windows+K (PC) shortcuts for quick resource access.
  * Added streamlined UI wizards for Coinbase and Apache Pulsar integration.
  * Enhanced demo data source creation with random streams.
  * At the end of the creating data source wizard, show a few common steps to use the newly created sources or streams.
  * Redesigned SQL Console and SQL Helper UI for better usability. Access the SQL Helper via the panel to the left of the SQL editor box.
  * Enhanced data lineage visualization with throughput and memory metrics for materialized views.
  * Random streams are now listed in the streams resource list and data lineage diagram.
  * Universal side panel for all Timeplus resources to check the metadata and statistics, as well as common actions.
  * Enhanced visualizations: set fixed width for table panels, hide/show columns for map tooltips, and more.
  * Able to show the Timeplus Enterprise version in the "Get Support" tab of the help side panel.
  * Show the latest list of Redpanda Connect input and output connectors.
  * Added row number display functionality in dashboard tables.
* timeplus_appserver 2.0.9 -> 2.1.6
  * Added new data source for Coinbase.
  * Able to list random streams.
* timeplus_connector 2.0.3 -> 2.1.1
  * Upgraded to Redpanda Connect v4.44, Benthos framework 4.44 and Golang 1.23.
* timeplus cli 1.2.8 -> 1.2.11
  * Added an option to disable telemetry in the [timeplus start](/cli-start) command.
  * The [timeplus diag](/cli-diag) command now exports the [system.stream_state_log](/system-stream-state-log) as a CSV file in the log directory.

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.5 to 2.6 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_6_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
