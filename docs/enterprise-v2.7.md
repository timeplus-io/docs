# Timeplus Enterprise 2.7
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server providing web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connector: The service providing extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component maintains its own version numbers. The version number for each Timeplus Enterprise release represents a verified combination of these components.

## Key Highlights
Key highlights of this release:
* **Stream processing for files in S3 buckets:** With the new [S3 external table](/s3-external), Timeplus Enterprise now supports writing stream processing results to S3 buckets, or reading files in S3.
* **Join the latest data from MySQL or ClickHouse via dictionary:** You can now create a [dictionary](/sql-create-dictionary) to store key-value pairs in memory or a mutable stream, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.
* **PostgreSQL and MySQL CDC via Redpanda Connect:** Timeplus Enterprise now supports CDC (Change Data Capture) for PostgreSQL and MySQL databases via Redpanda Connect. This feature enables real-time data ingestion from these databases into Timeplus.
* **Support IAM authentication for accessing Amazon MSK:** Avoid storing static credentials in Kafka external streams by setting `sasl_mechanism` to `AWS_MSK_IAM`.
* **Load the credentials from HashiCorp Vault or local file system** for all external streams or external tables.
* **Mutable stream delete:** You can now delete data from mutable streams with the [DELETE](/sql-delete) SQL command.
* **Cluster monitoring and materialized view troubleshooting:** Significant improvements in web console for multi-node cluster monitoring and troubleshooting.
* **Python UDF:** You can now create user-defined functions (UDFs) in Python to extend the functionality of Timeplus with rich ecosystem of Python. It's currently in technical preview for Linux x86_64 only.


## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Upgrade Guide
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.7.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. For bare metal users, you can upgrade from Timeplus Enterprise 2.6 to 2.7 by stopping components and replacing binary files.
3. For Kubernetes users, please follow [the guide](/k8s-helm#v5-to-v6) carefully since a few timeplusd built-in users are removed in the new helm chart, and you can configure ingress for Appserver and Timeplusd independently.

## Releases
### 2.7.8 {#2_7_8}
Released on 05-27-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.7 | sh` [Downloads](/release-downloads#2_7_8)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.16 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.8`

Component versions:
* timeplusd 2.7.47
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_8}

Compared to the [2.7.7](#2_7_7) release:
* timeplusd 2.7.46 -> 2.7.47
  * support renaming stream column name
  * fixed known stabilization issues
#### Known issues {#known_issue_2_7_7}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.7 {#2_7_7}
Released on 05-06-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.7 | sh` [Downloads](/release-downloads#2_7_7)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.12 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.7`

Component versions:
* timeplusd 2.7.46
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_7}

Compared to the [2.7.6](#2_7_6) release:
* timeplusd 2.7.45 -> 2.7.46
  * fixed Python UDF known stabilization issues
#### Known issues {#known_issue_2_7_7}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.
### 2.7.6 {#2_7_6}
Released on 04-29-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.7 | sh` [Downloads](/release-downloads#2_7_6)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.11 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.6`

Component versions:
* timeplusd 2.7.45
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_6}

Compared to the [2.7.5](#2_7_5) release:
* timeplusd 2.7.37 -> 2.7.45
  * added new setting [mv_preferred_exec_node](/sql-create-materialized-view#mv_preferred_exec_node) while creating materialized view
  * added new EMIT policy `EMIT ON UPDATE WITH DELAY`. The SQL syntax for EMIT has been refactored. [Learn more](/query-syntax#emit)
  * fixed global aggregation with `EMIT ON UPDATE` in multi-shard environments
  * fixed concurrency issues in hybrid aggregation
  * support incremental checkpoints for hybrid hash join
  * fixed grouping key issues in hybrid aggregation

#### Known issues {#known_issue_2_7_6}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.5 {#2_7_5}
Released on 04-14-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_7_4)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.9 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.5`

Component versions:
* timeplusd 2.7.37
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_5}

Compared to the [2.7.4](#2_7_4) release:
* timeplusd 2.7.35 -> 2.7.37
  * cleanup Protobuf format schema cache
  * fixed the issue for `where 1=2`
  * fixed outdated recover sns for materialized views
  * enabled incremental checkpoint by default
  * improved robustness of checkpoints in edge cases
  * fixed unknown source column

#### Known issues {#known_issue_2_7_5}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.4 {#2_7_4}
Released on 04-03-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_7_4)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.8 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.4`

Component versions:
* timeplusd 2.7.35
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_4}

Compared to the [2.7.3](#2_7_3) release:
* timeplusd 2.7.29 -> 2.7.35
  * enhanced logging level handling and crash prevention.
  * added configurable timeout for stream DDL operations and ignore `tp_sn` when ingesting data.
  * added support for multiple JavaScript VMs and ClickHouse data types on HTTP server port 8123.
  * improved handling of shared state across modules.
  * fixed invalid storage settings access, optimized hash map destruction, and improved stream semantic calculation.

#### Known issues {#known_issue_2_7_4}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.3 {#2_7_3}
Released on 03-24-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_7_3)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.7 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.3`

Component versions:
* timeplusd 2.7.29
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_3}

Compared to the [2.7.2](#2_7_2) release:
* timeplusd 2.7.27 -> 2.7.29
  * fixed the issue for Pulsar external stream with compressed message types and partitions
  * improved JOIN between mutable streams

#### Known issues {#known_issue_2_7_3}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.2 {#2_7_2}
Released on 03-18-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_7_2)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.6 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.2`

Component versions:
* timeplusd 2.7.27
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_2}

Compared to the [2.7.1](#2_7_1) release:
* timeplusd 2.7.26 -> 2.7.27
  * fixed several problems causing aggregation function misbehavior

#### Known issues {#known_issue_2_7_2}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.1 {#2_7_1}
Released on 03-07-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_7_1)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.4 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.1`

Component versions:
* timeplusd 2.7.26
* timeplus_web 2.2.12
* timeplus_appserver 2.2.13
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_1}

Compared to the [2.7.0](#2_7_0) release:
* timeplusd 2.7.22 -> 2.7.26
  * fixed the issue that materialized views cannot send data to MySQL external tables
  * fixed the incorrect replicated checkpoint format
  * fixed the issue caused by DNS IP address changes
  * improved error handling and error messages
  * improved materialized view auto-recovery
* timeplus_web 2.2.10 -> 2.2.12
  * improved the materialized view side panel to always show node id and hide checkpoint status if it's a single node deployment
  * fixed the issue that query result with null value is not displayed correctly
  * fixed other minor issues for labels
* timeplus_appserver 2.2.10 -> 2.2.13
  * included the shard information for stats API, as well as the timestamps
  * improved error messages when it fails to connect to timeplusd
  * updated the Go driver to fix code panic for nullable data in map
* timeplus_connector 2.2.6 -> 2.2.8
  * updated the Go driver to fix code panic for nullable data in map

#### Known issues {#known_issue_2_7_1}
1. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
1. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
1. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.

### 2.7.0 {#2_7_0}
Released on 02-27-2025. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#2_7_0)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.3 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.0`

Component versions:
* timeplusd 2.7.22
* timeplus_web 2.2.10
* timeplus_appserver 2.2.10
* timeplus_connector 2.2.6
* timeplus cli 1.2.12

#### Changelog {#changelog_2_7_0}

Compared to the [2.6.0](/enterprise-v2.6#2_6_0) release:
* timeplusd 2.5.10 -> 2.7.22
  * Monitoring and Management:
    * **Delete data:** You can now delete data from streams with the [DELETE](/sql-delete) SQL command. This is optimized for mutable streams with primary keys in the condition.
    * `SYSTEM UNPAUSE MATERIALIZED VIEW` command is renamed to [SYSTEM RESUME MATERIALIZED VIEW](/sql-system-resume).
    * Able to configure `license_key_path` and `license_file_path` in the `server/config.yaml` file to specify the license key without web console interaction.
    * Introduced a simple way to setup multiple timeplusd processes on the same host by running the `timeplusd server --node-index=1` command. [Learn more](/cluster_install#single-host-cluster)
    * To improve performance, we have optimized the schema for [system.stream_metric_log](/system-stream-metric-log) and [system.stream_state_log](/system-stream-state-log).
  * Security Enhancements:
    * **Support IAM authentication for accessing Amazon MSK:** Avoid storing static credentials in Kafka external streams by setting `sasl_mechanism` to `AWS_MSK_IAM`.
    * **Integration with HashiCorp Vault:** You can now use HashiCorp Vault to store sensitive data, such as password for all types of external streams or external tables, and reference them in [config_file](/proton-kafka#config_file) setting.
    * Specify the non-root user in the Docker image to improve security.
  * New Features:
    * **Stream processing for files in S3 buckets:** With the new [S3 external table](/s3-external), Timeplus Enterprise now supports writing stream processing results to S3 buckets, or read files in S3.
    * **Join the latest data from MySQL or ClickHouse via dictionary:** You can now create a [dictionary](/sql-create-dictionary) to store key-value pairs in memory or a mutable stream, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.
    * Replay historical data in local streams or Kafka external streams with the [replay_speed](/query-settings#replay_speed) setting.
    * Read the header key-value pairs in the kafka external stream. [Learn more](/proton-kafka#_tp_message_headers)
    * [Python UDF](/py-udf): You can now create user-defined functions (UDFs) in Python to extend the functionality of Timeplus with rich ecosystem of Python. It's currently in technical preview for Linux x86_64 only.
* timeplus_web 2.1.7 -> 2.2.10
  * Significant improvements of materialized view monitoring and troubleshooting UI.
  * Added UI for creating and managing dictionaries, S3/MySQL external tables and Python UDF.
  * Added a dropdown menu to switch to different database namespaces in the web console.
  * Added UI to manage dictionaries and S3 external tables.
* timeplus_appserver 2.1.6 -> 2.2.10
  * [REST API](/rest) support for non-default database namespaces.
  * When you define a source or sink powered by Redpanda Connect, you can now specify the optional `buffer` and `pipeline` components in the YAML configuration.
  * Added endpoints to list/get/delete [dictionaries](/sql-create-dictionary).
* timeplus_connector 2.1.1 -> 2.2.6
  * Upgraded to Redpanda Connect v4.46 and Benthos framework 4.44, which now supports [mysql_cdc](https://docs.redpanda.com/redpanda-connect/components/inputs/mysql_cdc/), [postgres_cdc](https://docs.redpanda.com/redpanda-connect/components/inputs/postgres_cdc/) and [snowflake_streaming](https://docs.redpanda.com/redpanda-connect/components/outputs/snowflake_streaming/) connectors. Please note those connectors require an enterprise license from Redpanda, which you need to set the `REDPANDA_CONNECT_LICENSE` environment variable.
  * Added endpoints for logs and lint.
* timeplus cli 1.2.11 -> 1.2.12
  * Removed the subcommand to manage users and groups. Please use the web console to manage them or setup with Helm charts.

#### Known issues {#known_issue_2_7_0}
1. It's highly recommended to upgrade to Timeplus Enterprise [2.7.1](#2_7_1)
