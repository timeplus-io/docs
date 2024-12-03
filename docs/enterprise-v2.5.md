# Timeplus Enterprise 2.5
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server to provide web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connector: The service to provide extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Key Highlights
Key highlights of this release:
* Reading or writing data in Apache Pulsar or StreamNative via External Stream. [Learn more](/pulsar-external-stream).
* Connecting to various input or output systems via Redpanda Connect. [Learn more](/redpanda-connect).
* Creating and managing users in the Web Console. You can change the password and assign the user either Administrator or Read-only role.
* New [migrate](/cli-migrate) subcommand in [timeplus CLI](/cli-reference) for data migration and backup/restore.
* Materialized views auto-rebalancing in the cluster mode. [Learn more](/proton-create-view#auto-balancing).
* Approximately 30% faster data ingestion and replication in the cluster mode.
* Performance improvement for [ASOF JOIN](/joins) and [EMIT ON UPDATE](/query-syntax#emit_on_update).

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
Please use the stable releases for production deployment, while we also provide latest engineering builds for testing and evaluation.

### 2.5.11 (Public GA) {#2_5_11}
Built on 12-01-2024. You can install via:
* For Linux or Mac users: `curl https://install.timeplus.com/2.5 | sh`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v4.0.10 ..`
* For Docker users (not for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.5.11`

Component versions:
* timeplusd 2.4.26
* timeplus_web 2.0.6
* timeplus_appserver 2.0.9
* timeplus_connector 2.0.3
* timeplus cli 1.2.8

#### Changelog {#changelog_2_5_11}

Compared to the [2.5.10](#2_5_10) release:
* timeplusd 2.4.24 -> 2.4.26
  * enhancements for multi-raft clusters
  * bugfix for data ingestion in Timeplus external streams

You can upgrade a deployment of Timeplus Enterprise 2.4 to Timeplus Enterprise 2.5, by stopping the components and replacing the binary files, or reusing the Docker or Kubernetes volumes and update the image versions.

#### Known issues {#known_issue_2_5_11}
1. If you have deployed one of the [2.4.x releases](/enterprise-v2.4), you can reuse the data and configuration directly. However, if your current deployment is [2.3](/enterprise-v2.3) or earlier, you cannot upgrade directly. Please have a clean installation of 2.5.x release, then use tools like [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for migration.
2. Pulsar external streams are only available in Linux bare metal builds and Linux-based Docker images. This type of external stream is not available in macOS bare metal builds.

### 2.5.10 (Controlled Release) {#2_5_10}
Built on 11-21-2024. You can install via:
* For Docker users (not for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.5.10`

Component versions:
* timeplusd 2.4.24
* timeplus_web 2.0.6
* timeplus_appserver 2.0.9
* timeplus_connector 2.0.3
* timeplus cli 1.2.8


#### Changelog {#changelog_2_5_10}

Compared to the [2.5.9](#2_5_9) release:
* timeplusd 2.4.23 -> 2.4.24
  * refined the advanced settings for streaming SQL: `asterisk_include_reserved_columns` and `asterisk_include_tp_sn_column`.
  * introduced an advanced settings for NativeLog append data timeout: `insert_timeout_ms`.
* timeplus cli 1.2.7 -> 1.2.8
  * introduced an option for [timeplus start](/cli-start#timeplus-start---start-trial) CLI to start the free trial with a new admin account.

You can upgrade a deployment of Timeplus Enterprise 2.4 to Timeplus Enterprise 2.5, by stopping the components and replacing the binary files, or reusing the Docker or Kubernetes volumes and update the image versions.

#### Known issues {#known_issue_2_5_10}
1. If you have deployed one of the [2.4.x releases](/enterprise-v2.4), you can reuse the data and configuration directly. However, if your current deployment is [2.3](/enterprise-v2.3) or earlier, you cannot upgrade directly. Please have a clean installation of 2.5.x release, then use tools like [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for migration.
2. Pulsar external streams are only available in Linux bare metal builds and Linux-based Docker images. This type of external stream is not available in macOS bare metal builds.

### 2.5.9 (Controlled Release) {#2_5_9}
Built on 11-15-2024. You can install via:
* For Docker users (not for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.5.9`

Component versions:
* timeplusd 2.4.23
* timeplus_web 2.0.6
* timeplus_appserver 2.0.9
* timeplus_connector 2.0.3
* timeplus cli 1.2.7

#### Changelog {#changelog_2_5_9}

Compared to the [2.4.23](/enterprise-v2.4#2_4_23) release:
* timeplusd 2.3.30 -> 2.4.23
  * new type of [External Streams for Apache Pulsar](/pulsar-external-stream).
  * for bare metal installation, previously you can login with the username `default` with empty password. To improve the security, this user has been removed.
  * enhancement for nullable data types in streaming and historical queries.
  * Materialized views auto-rebalancing in the cluster mode.[Learn more](/proton-create-view#auto-balancing).
  * Approximately 30% faster data ingestion and replication in the cluster mode.
  * Performance improvement for [ASOF JOIN](/joins) and [EMIT ON UPDATE](/query-syntax#emit_on_update).
* timeplus_web 1.4.33 -> 2.0.6
  * UI to add/remove user or change role and password. This works for both single node and cluster.
  * UI for inputs/outputs from Redpanda Connect.
  * UI wizard to create Pulsar External Streams, Timeplus External Streams, and Mutable Streams.
  * New chart type: Markdown. You can add static content in Markdown syntax. You can also run a streaming SQL and refer to the latest value in a column with the syntax `{{columnName}}`.
  * Only show essential columns when you list the streams, materialized views and others. You can click the "Show more columns" to show extra information, such as number of rows and consumed storage. The preference is saved in the local browser and slightly add more time to load the object list. You can also click on the item and view the details in the side panel. A refresh button is available to reload the content in the side panel.
  * In the SQL Console, you can select part of the SQL statement and run them. You can write multiple statements in the editor and highlight one of them to run.
* timeplus_appserver 1.4.44 -> 2.0.9
  * Forwarded `x-timeplus-idempotent-id` header in the ingest REST API to timeplusd.
  * Communicate with timeplusd and timeplus_connector with the current user, not the default one.
  * Integration with Redpanda Connect.
* timeplus_connector 1.5.5 -> 2.0.3
  * Integration with latest version of Benthos framework and Redpanda Connect.
* timeplus cli 1.0.19 -> 1.2.7
  * New [migrate](/cli-migrate) subcommand in [timeplus CLI](/cli-reference) for data migration and backup/restore.
  * [Manage users](/cli-user) with role and password.

You can upgrade a deployment of Timeplus Enterprise 2.4 to Timeplus Enterprise 2.5, by stopping the components and replacing the binary files, or reusing the Docker or Kubernetes volumes and update the image versions.

#### Known issues {#known_issue_2_5_9}
1. If you have deployed one of the [2.4.x releases](/enterprise-v2.4), you can reuse the data and configuration directly. However, if your current deployment is [2.3](/enterprise-v2.3) or earlier, you cannot upgrade directly. Please have a clean installation of 2.5.x release, then use tools like [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for migration.
2. Pulsar external streams are only available in Linux bare metal builds and Linux-based Docker images. This type of external stream is not available in macOS bare metal builds.
