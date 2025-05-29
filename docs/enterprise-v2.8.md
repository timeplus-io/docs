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
* New Compute Node server role to [run materialized views elastically](/proton-create-view#autoscaling_mv) with checkpoints on S3 storage.
* Timeplus can read or write data in Apache Iceberg tables. [Learn more](/iceberg)
* Timeplus can read or write PostgreSQL tables directly via [PostgreSQL External Table](/pg-external-table) or look up data via [dictionaries](/sql-create-dictionary#source_pg).
* Use S3 as the [tiered storage](/tiered-storage) for streams.
* New SQL command to [rename streams](/sql-rename-stream).
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

### 2.8.1 (Public GA) {#2_8_1}
Released on 05-27-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh` [Downloads](/release-downloads#2_8_1)
* For Kubernetes users: helm install timeplus/timeplus-enterprise --version v7.0.4 ..
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.1`

Component versions:
* timeplusd 2.8.26
* timeplus_web 2.8.7
* timeplus_appserver 2.8.5
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_8_1}
Compared to the [2.8.1-rc7](#2_8_1-rc.7) release:
* timeplusd 2.8.25 -> 2.8.26
  * Support rename stream and column name.
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

### 2.8.1 (Preview) {#2_8_1-rc.7}
Released on 05-08-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.1-rc.7`
* We will provide new Helm Charts for Kubernetes deployment when v2.8 is GA.

Component versions:
* timeplusd 2.8.25
* timeplus_web 2.8.7
* timeplus_appserver 2.8.5
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_8_1-rc.7}
Compared to the [2.8.0](/enterprise-v2.8#2_8_0) release:
* timeplusd 2.8.14 -> 2.8.25
  * Support writing Kafka message timestamp via [_tp_time](/proton-kafka#_tp_time)
  * Enable IPv6 support for KeyValueService
  * Simplified the [EMIT syntax](/query-syntax#emit) to make it easier to read and use.
  * Support [EMIT ON UPDATE WITH DELAY](/query-syntax#emit_on_update_with_delay)
  * Support [EMIT ON UPDATE](/query-syntax#emit_on_update) for multiple shards
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
