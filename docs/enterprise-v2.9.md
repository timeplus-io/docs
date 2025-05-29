# Timeplus Enterprise 2.9
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server providing web console access and REST API
* timeplus_web: The web console static resources. Starting from Timeplus Enterprise 2.9, this component is packaged into timeplus_appserver. No longer as a seperate binary or container
* timeplus_connector: The service providing extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment

Each component maintains its own version numbers. The version number for each Timeplus Enterprise release represents a verified combination of these components.

## Key Highlights
Key highlights of this release:
* Online schema evolution for Mutable Stream
* Versioned Mutable Stream
* Coalesced Mutable Stream
* Native JSON field type
* [json_encode](/functions_for_json#json_encode) / [json_cast](/functions_for_json#json_cast) functions to convert row with multiple columns to json string or new json type
* Dead Letter Queue
* [Native HTTP External Stream](/http-external) to Splunk and Elastic Search
* JIT streaming processing for big perf / efficiency improvements
* Parameterized Views
* Mutable Stream Enhancements : TTL, Drop / Rebuild Secondary Indexes etc
* Large cardinality sessionization
* Distributed LogStream
* [Python UDF](/py-udf) now supports Arm CPU on Linux or MacOS
* The refined UI to visualize nodes in a cluster

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 2.9.0 (Preview 0) {#2_9_0-preview_0}
Released on 05-28-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.9 | sh` [Downloads](/release-downloads#2_9_0)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.9.0-preview.0`
* We will provide new Helm Charts for Kubernetes deployment when v2.9 is GA.

Component versions:
* timeplusd 2.9.7
* timeplus_web 2.9.27
* timeplus_appserver 2.9.24
* timeplus_connector 2.9.0
* timeplus cli 2.9.0

#### Changelog {#changelog_2_9_0-preview_0}
Compared to the [2.8.1](/enterprise-v2.8#2_8_1) release:
* timeplusd 2.8.26 -> 2.9.7
  *   New Features:
      *   **Parametrised Views:** You can now create parametrised views, allowing for more dynamic and reusable view definitions.
      *   **JIT Compilation for Queries:** Introduced Just-In-Time (JIT) compilation for queries, potentially improving execution performance for certain query types.
      *   **New JSON SQL Functions:** Added [json_encode](/functions_for_json#json_encode) / [json_cast](/functions_for_json#json_cast) SQL functions for easier JSON data manipulation and a new native JSON data type.
      *   **Mutable Stream TTL:** You can now define Time-To-Live (TTL) for data in mutable streams.
      *   **Materialized View DLQ:** Introduced Dead Letter Queue (DLQ) support for materialized views to handle data processing errors more robustly.
      *   **HTTP External Stream:** Added a new type of external stream to send streaming data to external HTTP endpoints, such as Splunk, Open Search and Slack.
      *   **Python UDFs on ARM:** Python User-Defined Functions (UDFs) are now supported on ARM-based architectures, expanding platform compatibility.
      *   **Improved JavaScript UDFs:** Enhanced JavaScript UDF execution with support for multiple V8 instances for better concurrency and isolation.
      *   **Log Stream Virtual Columns:** Log streams now include `_filepath` and `_filename` virtual columns for richer data source context.
      *   **UUID as Primary Key:** Mutable streams now support the `UUID` data type for primary key columns.
  *   SQL and Data Model Enhancements:
      *   **Advanced `EMIT` Clause:** The `EMIT` clause for changelog generation now supports `EMIT ON UPDATE WITH DELAY` and `EMIT AFTER KEY EXPIRE` options for more granular control over streaming results.
      *   **`ALTER STREAM` for Multiple Columns:** You can now add or modify multiple columns in a single `ALTER STREAM` command.
      *   **Modifying Comments:** Added `ALTER COMMENT` support for streams, views, materialized views, KVStreams, and RandomStreams.
      *   **Append-Only Stream Column Management:** Enabled renaming columns (including index columns) and adding new columns to append-only streams.
      *   **Mutable Stream Schema Evolution:** Support for adding new columns and dropping secondary indexes in mutable streams.
  *   Performance and Scalability:
      *   **Incremental Checkpointing:** Implemented and enabled incremental checkpointing by default for substreams, hybrid hash joins, and Materialized Views, significantly reducing recovery time and resource usage during stateful operations.
      *   **Optimized Connection Pooling:** Refactored internal connection pooling for improved performance and resource management.
      *   **Parallel Log Processing:** Log files from sources can now be processed in parallel for faster data ingestion.
      *   **Coalesced Mutable Streams:** Introduced coalesced mutable streams for optimized storage and querying of updatable data.
  *   Monitoring and Management:
      *   **New System Views:** Introduced additional built-in system views (e.g., for troubleshooting distributed queries, MVs, query memory, and checkpoint status) for enhanced system observability.
      *   **Versioned `SHOW CREATE`:** The `SHOW CREATE` command now displays multi-versioned definitions for streams, views, MVs, UDFs, format schemas, and databases, aiding in tracking changes.
      *   **Disk Metrics for Dictionaries:** Added metrics to monitor disk size usage by dictionaries.
      *   **MV Node Pinning & Placement:** Added functionality to pin materialized view execution to specific cluster nodes and manage node placements for better resource control.
      *   **Kafka External Stream Timeout:** Added `connection_timeout_ms` setting for Kafka external streams.
      *   **Dependency Checks for Storage Policies:** Added checks for dependencies before allowing a storage policy or disk to be dropped.
  *   External Data Integration:
      *   **Kafka Enhancements:** Added support for writing Kafka message timestamps and improved error handling for Kafka external streams with `_tp_time` and CSV format.
      *   **Iceberg Integration:** Provided various bug fixes and enhancements for interacting with Apache Iceberg tables.
      *   **Pulsar Client Upgrade:** Upgraded the Pulsar C++ client to version 3.7.0.
  *   Security Enhancements:
      *   Improved mechanisms for password propagation within clustered environments.
      *   Support for utilizing user information from HTTP URL parameters for authentication or context.
* timeplus_web 2.8.8 -> 2.9.27
  *   UI/UX Enhancements:
      *   **New Log Viewer:** Introduced a significantly improved log viewer with enhanced filtering capabilities, better timeline interactions, improved tooltip displays, and refined time range calculations.
      *   **Database Selector:** Improved the database selector in the UI, including dimming databases without resources and separating system databases for better clarity.
      *   **Data Lineage:** Enhanced data lineage visualization to display nodes from other databases.
      *   **Timezone Persistence:** User-selected timezone preferences are now persisted in local storage for a consistent experience.
      *   Improved layout for HTTP source creation and other external stream Guided Data Ingestion (GDI) UIs.
  *   Resource Management (Streams, MVs, Views, UDFs):
      *   **Materialized Views (MVs):**
          *   Added UI support for **pausing and resuming** materialized views.
          *   Introduced **Dead Letter Queue (DLQ)** support and UI for MVs.
          *   Improved MV details page, monitoring, and statistics display.
          *   Enabled **modifying comments** for MVs via DDL.
          *   Added ability to inspect MV status data by navigating to the query page.
      *   **Streams:**
          *   Improved Stream details page.
          *   Enabled **modifying comments** for streams via DDL.
          *   Added definition view to external streams and external tables in the side panel.
      *   **User-Defined Functions (UDFs):**
          *   Added UI for **creating JavaScript UDFs** using DDL.
          *   Provided **code templates for JavaScript and Python UDFs**.
      *   **External Streams:** Added UI support for creating **HTTP external streams**.
  *   Cluster Management:
      *   **Improved Cluster Details Page:** Enhanced the cluster details page with a top statistics bar, better data presentation, and improved node details view.
      *   Enhanced cluster data generation and retrieval for UI display.
* timeplus_appserver 2.8.6 -> 2.9.24
  * package with timeplus_web static files
  * support new database types, such as MySQL/Postgres/Iceberg external tables
  * updated proton-go-driver to support new json type
* timeplus_connector 2.2.8 -> 2.9.0
  * removed the support for internal k/v service, since metadata is saved in mutable streams in v2.9
* timeplus cli 2.8.0 -> 2.9.0
  * No longer need to start/stop the timeplus_web component.
  * Load `timeplus_connector.yaml` from the relative path or via `BENTHOS_CONFIG_PATH` environment variable.

Upgrade Instructions:

If you install Timeplus Enterprise 2.7 or earlier, the metadata for the Redpanada Connect sources and sinks are saved in a special key/value service. v2.8 switches to mutable streams for such metadata by default and provides a migration tool. In 2.9, all metadata are saved in mutable streams and the previous key/value service has been removed. Please upgrade to 2.8 first if you are on 2.7 or earlier. Then upgrade to 2.9.

#### Known issues {#known_issue_2_9_0-preview_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.9.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. For existing deployments with any version from 2.3 to 2.7, please upgrade to 2.8 first and migreate the metadata. .
3. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
4. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
