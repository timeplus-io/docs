# Timeplus Enterprise 2.9
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server providing web console access and REST API
* timeplus_web: The web console static resources. Starting from Timeplus Enterprise 2.9, this component is packaged into timeplus_appserver. No longer as a separate binary or container
* timeplus_connector: The service providing extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment

Each component maintains its own version numbers. The version number for each Timeplus Enterprise release represents a verified combination of these components.

## Key Highlights
Key highlights of the Timeplus 2.9 release include:

*   **Enhanced Mutable Streams:** Introducing online schema evolution, versioning, coalesced storage, Time-To-Live (TTL), and secondary index management capabilities.
*   **Native JSON Support:** A new native JSON data type and powerful [json_encode](/functions_for_json#json_encode) / [json_cast](/functions_for_json#json_cast) functions simplify working with JSON.
*   **Improved Data Integrity:** Dead Letter Queue (DLQ) support for Materialized Views ensures robust data processing.
*   **Expanded Connectivity:** Native [HTTP External Stream](/http-external) for seamless integration with systems like Splunk, Elasticsearch, and more.
*   **Performance Boost:** [JIT (Just-In-Time) compilation](/jit) for streaming queries delivers significant performance and efficiency improvements. Large cardinality sessionization.
*   **Parameterized Views:** Create [Parameterized Views](/view#parameterized-views) for more flexible and reusable query patterns.
*   **Scalable Log Processing:** Distributed LogStream enables efficient handling of large volumes of log data.
*   **Broader UDF Support:** Python UDFs now run on ARM CPUs (Linux/macOS), and JavaScript UDFs benefit from multiple V8 instances.
*   **Refined Cluster UI:** The web console offers an improved experience for visualizing and managing cluster nodes.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 2.9.0 (Preview 1) {#2_9_0-preview_1}
Released on 06-03-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.9 | sh` [Downloads](/release-downloads#2_9_0-preview_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.9.0-preview.1`
* We will provide new Helm Charts for Kubernetes deployment when v2.9 is GA.

Component versions:
* timeplusd 2.9.9-rc.2
* timeplus_web 2.9.27
* timeplus_appserver 2.9.24
* timeplus_connector 2.9.0
* timeplus cli 2.9.0

#### Changelog {#changelog_2_9_0-preview_1}
Compared to the [2.8.1](/enterprise-v2.8#2_8_1) release:
* timeplusd 2.8.26 -> 2.9.9-rc.2
  *   New Features:
      *   **Parameterized Views:** You can now create [parameterized views](/view#parameterized-views), allowing for more dynamic and reusable view definitions.
      *   **JIT Compilation for Queries:** Introduced [Just-In-Time (JIT) compilation](/jit) for queries, potentially improving execution performance for certain query types.
      *   **New JSON Data Type & SQL Functions:** Added a native JSON data type and SQL functions [json_encode](/functions_for_json#json_encode) / [json_cast](/functions_for_json#json_cast) for powerful JSON manipulation.
      *   **Mutable Stream TTL:** You can now define Time-To-Live (TTL) for data in mutable streams, automatically managing data retention.
      *   **Materialized View DLQ:** Introduced Dead Letter Queue (DLQ) support for materialized views to handle data processing errors more robustly.
      *   **[HTTP External Stream](/http-external):** Added a new type of external stream to send streaming data to external HTTP endpoints, such as Splunk, Open Search and Slack.
      *   **Python UDFs on ARM:** Python User-Defined Functions (UDFs) are now supported on ARM-based architectures (Linux/macOS), expanding platform compatibility.
      *   **Improved JavaScript UDFs:** Enhanced JavaScript UDF execution with support for multiple V8 instances, improving concurrency and isolation (also available in 2.8.1 or above).
      *   **Log Stream Virtual Columns:** Log streams now include `_filepath` and `_filename` virtual columns, providing richer context about the data source.
      *   **UUID as Primary Key:** Mutable streams now support the `UUID` data type for primary key columns.
  *   SQL and Data Model Enhancements:
      *   **Advanced `EMIT` Clause:** The `EMIT` clause for changelog generation now supports `EMIT ON UPDATE WITH DELAY` and `EMIT AFTER KEY EXPIRE` options for more granular control over streaming results.
      *   **`ALTER STREAM` for Multiple Columns:** You can now add or modify multiple columns in a single `ALTER STREAM` command.
      *   **Modifying Comments:** Added `ALTER COMMENT` support for streams, views, materialized views, KVStreams, and RandomStreams.
      *   **Mutable Stream Schema Evolution:** Support for adding new columns and dropping secondary indexes in mutable streams.
  *   Performance and Scalability:
      *   **Incremental Checkpointing:** Implemented and enabled incremental checkpointing by default for substreams, hybrid hash joins, and Materialized Views, significantly reducing recovery time and resource usage during stateful operations.
      *   **Optimized Connection Pooling:** Refactored internal connection pooling for improved performance and resource management.
      *   **Parallel Log Processing:** Log files from sources can now be processed in parallel for faster data ingestion.
      *   **Coalesced Mutable Streams:** Introduced coalesced mutable streams for optimized storage and querying of updatable data.
      *   **Distributed LogStream:** Enhanced LogStream capabilities for distributed environments, improving scalability for log data processing.
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
  * Serves the updated Timeplus Web Console (v2.9.27) static files.
  * Added backend support for new external table types including MySQL, PostgreSQL, and Iceberg.
  * Updated internal drivers (e.g., proton-go-driver) to support the new native JSON data type.
* timeplus_connector 2.2.8 -> 2.9.0
  * removed the support for internal k/v service, since metadata is saved in mutable streams in v2.9
* timeplus cli 2.8.0 -> 2.9.0
  * No longer need to start/stop the timeplus_web component.
  * Load `timeplus_connector.yaml` from the relative path or via `BENTHOS_CONFIG_PATH` environment variable.

Upgrade Instructions:

If you install Timeplus Enterprise 2.7 or earlier, the metadata for the Redpanda Connect sources and sinks are saved in a special key/value service. v2.8 switches to mutable streams for such metadata by default and provides a migration tool. In 2.9, all metadata are saved in mutable streams and the previous key/value service has been removed. Please upgrade to 2.8 first if you are on 2.7 or earlier. Then upgrade to 2.9.

#### Known issues {#known_issue_2_9_0-preview_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.9.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. For existing deployments with any version from 2.3 to 2.7, please upgrade to 2.8 first and migrate the metadata. .
3. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
4. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
