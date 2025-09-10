# Timeplus Enterprise 2.8
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server providing web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connector: The service providing extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component maintains its own version numbers. The version number for each Timeplus Enterprise release represents a verified combination of these components.

## Key Highlights
Key highlights of this release:
* New Compute Node server role to [run materialized views elastically](/view#autoscaling_mv) with checkpoints on S3 storage.
* Timeplus can read or write data in Apache Iceberg tables. [Learn more](/iceberg)
* Timeplus can read or write PostgreSQL tables directly via [PostgreSQL External Table](/pg-external-table) or look up data via [dictionaries](/sql-create-dictionary#source_pg).
* Use S3 as the [tiered storage](/tiered-storage) for streams.
* New SQL command to [rename streams](/sql-rename-stream) or [columns](/sql-alter-stream#rename-column).
* JavaScript UDFs benefit from multiple V8 instances, improving concurrency and isolation.
* A new page to visualize nodes in a cluster.
* New page to view the details of streams or materialized views.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 2.8.3 (Public GA) {#2_8_3}
Released on 09-01-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh` [Downloads](/release-downloads#2_8_3)
* For Kubernetes users: helm install timeplus/timeplus-enterprise --version v7.0.22 ..
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.3`

Component versions:
* timeplusd 2.8.28
* timeplus_web 2.8.18
* timeplus_appserver 2.8.12
* timeplus_connector 2.8.1
* timeplus cli 2.8.0

#### Changelog {#changelog_2_8_3}
Compared to the [2.8.2](#2_8_2) release:
* timeplusd 2.8.27 -> 2.8.28
  * New features, enhancements:
    *   Introduced DLQ support for Materialized View.
    *   Introduced rack-aware placement for distributed storage.
    *   Supported auto-increment columns and auto-increment primary keys for Mutable stream.
    *   Supported nullable key columns in Mutable streams.
    *   Supported secondary index on coalesced Mutable streams.
    *   Refined JSON encoding/casting with better null handling.
    *   Added SSL configuration support for ClickHouse connections.
    *   Refined connection timeouts and improved ClickHouse connection pooling for Materialiazed View.
    *   Added two-phase commit for local checkpoints for Materialized View.
    *   Supported minimum auto checkpoint interval setting for Materialized View.
    *   Refined recovery from failed checkpoint epochs for Materialized View.
    *   Improved hop/tumble window aggregations in hybrid execution for Materialized View.
    *   Refined pure memory mode for hybrid hash tables for Materialized View.
    *   Added retries in stream sinks for reliability for Materialized View.
    *   Enforced explicit INTO targets for scheduled Materialized Views.
    *   Improved error reporting for abnormal finishes and refined consistency for Materialized View.
    *   Improved schema subject naming.
    *   Upgraded librdkafka and improved Kafka logging.
    *   Enhanced float parsing precision in VALUES format.
    *   Storage commit pool enhancement.
    *   Performance enhancements for batch Kafka ingestion.
    *   Workload balance and backpressure handling for ReplicatedLog to improve the overall cluster stablity.
    *   timeplusd log deduplication to save 3rd party's log aggregator's data volume
  * Bugfixes:
    *   Fixed hybrid changelog conversions and nullable key handling.
    *   Fixed sparse column handling.
    *   Fixed big-endian encoding for Kafka message keys.
    *   Fixed backfill from historical store.
    *   Fixed checkpoint log handling (skip compacted logs, applied sequence numbers, fix unknown epoch dirs).
    *   Fixed dynamic changing log level propagation issues.
    *   Fixed reverse index consistency by truncating garbage data.
* timeplus_web 2.8.12 -> 2.8.18
  * New UI features and enhancements:
      *   **Cluster Management:**
          *   Enhanced cluster node generation, layout, and visualization.
          *   Improved cluster table, warnings, and drilldown navigation.
          *   Updated cluster page design and improved node stats/details.
          *   Added percentage metrics in node stats and improved stats table layout.
          *   Various UI/UX fixes (offline node opacity, layout adjustments).
      *   **Materialized Views (MVs):**
          *   Added pause, recover, and transfer actions to MV status page.
          *   Improved MV action buttons and tables.
          *   Fixed MV deletion issues in non-default DBs.
          *   Enhanced MV/stream side panel and display of large diffs, memory, and source names.
      *   **Data Lineage:**
          *   Improved styles, filters, and node visualization.
          *   Added metrics display on streams.
          *   Enhanced handling of unselected nodes and error edges.
          *   Fixed background colors, badges, and refresh issues.
      *   **Schema & UDFs:**
          *   Added SchemaEvolutionModal to UDF, Schema, and Stream pages.
          *   Improved SchemaEvolution component (last modified info, copy, evolution handling).
          *   Fixed schema evolution for non-default DBs.
      *   **General Improvements:**
          *   Unified workspace and user settings.
          *   Added ButtonWithLoading component for better UX.
          *   Fixed various UI issues.
* timeplus_appserver 2.8.11 -> 2.8.12
  * URL Encoding: Properly support spaces in resource names.
  * Query: Correctly marshal nullable NaN values.
* timeplus_connector 2.8.1. No changes
* timeplus cli 2.8.0. No changes.

### 2.8.2 (Public GA) {#2_8_2}
Released on 07-22-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh` [Downloads](/release-downloads#2_8_2)
* For Kubernetes users: helm install timeplus/timeplus-enterprise --version v7.0.13 ..
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.2`

Component versions:
* timeplusd 2.8.27
* timeplus_web 2.8.12
* timeplus_appserver 2.8.11
* timeplus_connector 2.8.1
* timeplus cli 2.8.0

#### Changelog {#changelog_2_8_2}
Compared to the [2.8.1](#2_8_1) release:
* timeplusd 2.8.26 -> 2.8.27
  * Some new features and enhancements in 2.9 are ported to 2.8.2:
    *   **New JSON Data Type & SQL Functions:** Added a native JSON data type and SQL functions [json_encode](/functions_for_json#json_encode), [json_cast](/functions_for_json#json_cast), [json_array_length](/functions_for_json#json_array_length), [json_merge_patch](/functions_for_json#json_merge_patch) for powerful JSON manipulation.
    * Mutable Stream Enhancements
      * Introduced coalesced mutable streams for optimized storage and querying of updatable data.
      * You can now define Time-To-Live (TTL) for data in mutable streams, automatically managing data retention.
      * Able to [add new columns](/sql-alter-stream#add-column) for an existing mutable stream.
      * Able to add or drop secondary index for mutable streams.
      * Able to set `version_column` to make sure only rows with higher value of the `version_column` will override the rows with same primary key. This setting can work with or without `coalesced`.
      * Support the `UUID` data type for primary key columns.
    *   **[HTTP External Stream](/http-external):** Added a new type of external stream to send streaming data to external HTTP endpoints, such as Splunk, Open Search and Slack.
    *   **[MongoDB External Table](/mongo-external):** Added a new type of external table to send streaming data to MongoDB.
    * Enhanced [MySQL External Table](/mysql-external-table) to support `replace_query` and `on_duplicate_clause` settings.
    * Enhanced [Kafka External Stream](/kafka-source) allows to customize the `partitioner` property, e.g. `settings properties='partitioner=murmur2'`.
    * Enhanced [Kafka External Stream](/kafka-source) and [Pulsar External Stream](/pulsar-external-stream) to support write message headers via `_tp_message_headers`.
    * Support [map_from_arrays](/functions_for_comp#map_from_arrays) and [map_cast](/functions_for_comp#map_cast) with 4 or more parameters.
    * [SHOW CREATE](/sql-show-create#show_multi_versions) command supports `show_multi_versions=true` to get the history of the object.
    * New query setting [precise_float_parsing](/query-settings#precise_float_parsing) to precisely handle float numbers.
    * JavaScript User Defined Aggregation Function supports null value as input.
    * Support [UUIDv7 functions](/functions_for_text#uuid7).
    * Support [ULID functions](/functions_for_text#generate_ulid).
    * [A set of views](/system-views) are provided in the `system` namespace that enable effective troubleshooting and monitoring of your streaming data operations.
    * Improved the support for gRPC protocol.
    * Support [EMIT TIMEOUT](/streaming-aggregations#emit-timeout) for both global aggregations and window aggregations.
    * Able to change log level during runtime via [SYSTEM SET LOG LEVEL](/sql-system-set-log-level) or REST API.
    * Support new JOIN type [FULL LATEST JOIN](/joins#full-latest-join).
* timeplus_web 2.8.8 -> 2.8.12
  * Some new UI features and enhancements in 2.9 are ported to 2.8.2:
      *   **Materialized Views (MVs):**
          *   Added UI support for **pausing and resuming** materialized views.
          *   Introduced **Dead Letter Queue (DLQ)** support and UI for MVs.
          *   Improved MV details page, monitoring, and statistics display.
          *   Enabled **modifying comments** for MVs via DDL.
          *   Added ability to inspect MV status data by navigating to the query page.
      *   **Improved Cluster Details Page:** Enhanced the cluster details page with a top statistics bar, better data presentation, and improved node details view.
      *   Enhanced cluster data generation and retrieval for UI display.
      * In stream and materialized view list page, the earliest and latest columns have been removed to improve performance.
      * In the SQL Query page, side panel is simplified by removing the snippets and functions accordion.
      * In database selector, the empty database is shown as dimmed.
      * In the materialized listing page, the "Pause" button is moved to the detailed page.
* timeplus_appserver 2.8.6 -> 2.8.11
  * Upgraded the `proton-go-driver` from [v2.0.19](https://github.com/timeplus-io/proton-go-driver/releases/tag/v2.0.19) to [v2.1.2](https://github.com/timeplus-io/proton-go-driver/releases/tag/v2.1.2) to support new json data type and various bug fixes.
  * Supported new database types: MySQL, PostgreSQL, and Iceberg. Skip stream statistics if the database is external.
  * Improved the performance of checking statistics for materialized views and streams.
  * Able to pause and resume materialized views asynchronously.
  * Able to transfer leadership of a materialized view to another node.
* timeplus_connector 2.2.8 --> 2.8.1
  * Upgraded the `proton-go-driver` from [v2.0.19](https://github.com/timeplus-io/proton-go-driver/releases/tag/v2.0.19) to [v2.1.2](https://github.com/timeplus-io/proton-go-driver/releases/tag/v2.1.2) to support new json data type and various bug fixes.
* timeplus cli 2.8.0. No changes.

### 2.8.1 (Public GA) {#2_8_1}
Released on 05-27-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh` [Downloads](/release-downloads#2_8_1)
* For Kubernetes users: helm install timeplus/timeplus-enterprise --version v7.0.4 ..
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.1`

Component versions:
* timeplusd 2.8.26
* timeplus_web 2.8.8
* timeplus_appserver 2.8.6
* timeplus_connector 2.2.8
* timeplus cli 2.8.0

#### Changelog {#changelog_2_8_1}
Compared to the [2.8.0 (Preview)](#2_8_0) release:
* timeplusd 2.8.14 -> 2.8.26
  * Support [rename stream](/sql-rename-stream) and [column name](/sql-alter-stream#rename-column).
  * Support setting of connection_timeout_ms for Kafka external stream.
  * Improve distributed queries and external stream nodes.
  * Improve secondary index column validation.
  * Fix ingest timeout issue during data ingestion.
  * Improve checkpoint cleanup.
  * Improve normal function behavior and emit on updates.
  * Fix issues with 2-level aggregation and changelog emit.
  * Improve edge cases when TCP connections aren't ready.
  * Improve distributed query for historical query on mutable/append streams.
  * Improve left range join under certain conditions.
  * Fix Kafka external stream parsing issue.
  * Improve mutable stream creation flow when defined via engine.
  * When using `CREATE OR REPLACE FORMAT SCHEMA` to update an existing schema, and using `DROP FORMAT SCHEMA` to delete a schema, Timeplus will clean up the Protobuf schema cache to avoid misleading errors.
  * Support writing Kafka message timestamp via [_tp_time](/kafka-source)
  * Enable IPv6 support for KeyValueService
  * Simplified the [EMIT syntax](/streaming-aggregations#emit) to make it easier to read and use.
  * Support [EMIT ON UPDATE WITH DELAY](/streaming-aggregations#emit_on_update_with_delay)
  * Support [EMIT ON UPDATE](/streaming-aggregations#emit_on_update) for multiple shards
  * Transfer leadership to preferred node after election
  * Pin materialized view execution node [Learn more](/sql-create-materialized-view#mv_preferred_exec_node)
  * Improve async checkpointing
  * Avoid loading Python scripts during analysis
  * Incremental checkpoint for hybrid hash join
  * Add support for external ClickHouse table metrics
  * Multiple JavaScript VMs support
  * Upgraded Pulsar CPP client to v3.7.0
  * Support for nullable JS UDFs and inference of numbers as strings in REST API
  * Enable incremental checkpointing by default
  * Support sqlanalysis show disks and other small SQL enhancements
* timeplus_web 2.8.7 -> 2.8.8
  * For data lineage, listing pages for streams, materialized views and other SQL resources, show a drop-down list for database namespaces from A to Z.
* timeplus_appserver 2.8.5 -> 2.8.6
  * Enhanced [REST API](/rest) to support database namespaces.
* timeplus_connector 2.2.8. No changes.
* timeplus cli 1.2.12 -> 2.8.0
  * Added a new [timeplus migrate kv](/cli-migrate#kv) command to migrate metadata from kv system to mutable streams.
  * Added extra wait while starting the components and activate the free trial.


### 2.8.0 (Preview) {#2_8_0}
Released on 03-25-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh` [Downloads](/release-downloads#2_8_0)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.0`
* We will provide new Helm Charts for Kubernetes deployment when v2.8 is GA.

Component versions:
* timeplusd 2.8.14
* timeplus_web 2.8.7
* timeplus_appserver 2.8.5
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_8_0}
Compared to the [2.7.2](/enterprise-v2.7#2_7_2) release:
* timeplusd 2.7.27 -> 2.8.14
  * Timeplus can read or write data in Apache Iceberg tables.
  * Timeplus can read or write PostgreSQL tables directly via [PostgreSQL External Table](/pg-external-table) or look up data via [dictionaries](/sql-create-dictionary#source_pg).
  * Use S3 as the [tiered storage](/tiered-storage) for streams.
  * New SQL command to [rename streams](/sql-rename-stream).
  * List all tables in a remote MySQL database via [CREATE DATABASE .. SETTINGS type='mysql'](/sql-create-database).
  * Improved the experience of installing Python libraries for [Python UDF](/py-udf#install_pip).
  * New SQL functions: [group_array_sorted](/functions_for_agg#group_array_sorted), [group_array_sample](/functions_for_agg#group_array_sample), [histogram](/functions_for_agg#histogram).
* timeplus_web 2.2.12 -> 2.8.7
  * A new page to visualize nodes in a cluster.
  * New page to view the details of streams or materialized views.
  * Able to select a database while viewing the data lineage page.
* timeplus_appserver 2.2.13 -> 2.8.5
  * Enhanced [REST API](/rest) to update column comments, get Python UDF status and cluster information.
* timeplus_connector 2.2.8. No changes.
* timeplus cli 1.2.12. No changes.

#### Upgrade Instructions

Prior to Timeplus Enterprise 2.8, we use an internal KV store to persist the metadata for Timeplus appserver and connector. To simplify the architecture, starting from Timeplus Enterprise 2.8, we are deprecating the KV store and use a mutable stream (`neutron._timeplus_appserver_metastore`) to store those data. The KV store will be completely removed in the next 2.9 release.

The core functionality of the Timeplus Enterprise will still work even if you don't migrate the metadata. If you match all the conditions below, you can safely skip the migration:

1. All the resources are created via SQL or through timeplusd directly. No resources are created via Timeplus web console or Timeplus appserver REST API.
2. You don't use sources, sinks, dashboards, or alerts.

If you are still not sure, here are the things that would be broken without migration:
1. Sources, sinks, dashboards, alerts will be lost.
2. Some metadata such as descriptions, owner of the resource will be lost. It won't impact the functionality of the resource though.
3. Workspace setting will be lost.
4. Query history will be lost.

For Kubernetes users, please follow [the guide](/k8s-helm#v6-to-v7) to do the migration.

#### Known issues {#known_issue_2_8_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.7.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
4. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.
