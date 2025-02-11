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
* **Support IAM authentication for accessing Amazon MSK:** Avoid storing static credentials in Kafka external streams by setting `sasl_mechanism` to `AWS_MSK_IAM`.
* **Stream processing for files in S3 buckets:** With the new [S3 external table](/s3-external-stream), Timeplus Enterprise now supports writing stream processing results to S3 buckets, or read files in S3.
* **Join the latest data from MySQL or ClickHouse via dictionary:** You can now create a [dictionary](/sql-create-dictionary) to store key-value pairs in memory, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.
* **Mutable stream delete:** You can now delete data from mutable streams with the [DELETE](/sql-delete) SQL command.
* **PostgreSQL and MySQL CDC via Redpanda Connect:** Timeplus Enterprise now supports CDC (Change Data Capture) for PostgreSQL and MySQL databases via Redpanda Connect. This feature enables real-time data ingestion from these databases into Timeplus.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 2.7.0 {#2_7_0}
Released on 02-14-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.7 | sh` [Downloads](/release-downloads#2_7_0)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v5.0.5 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.7.0`

Component versions:
* timeplusd 2.7.14
* timeplus_web 2.2.7
* timeplus_appserver 2.2.6
* timeplus_connector 2.2.1
* timeplus cli 1.2.11

#### Changelog {#changelog_2_7_0}

Compared to the [2.6.0](/enterprise-v2.6#2_6_0) release:
* timeplusd 2.5.10 -> 2.7.14
  * Performance Enhancements:
    * a
  * Monitoring and Management:
    * b
  * New Features:
    * **Support IAM authentication for accessing Amazon MSK:** Avoid storing static credentials in Kafka external streams by setting `sasl_mechanism` to `AWS_MSK_IAM`.
    * **Stream processing for files in S3 buckets:** With the new [S3 external table](/s3-external-stream), Timeplus Enterprise now supports writing stream processing results to S3 buckets, or read files in S3.
    * **Join the latest data from MySQL or ClickHouse via dictionary:** You can now create a [dictionary](/sql-create-dictionary) to store key-value pairs in memory, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.
    * **Delete data:** You can now delete data from streams with the [DELETE](/sql-delete) SQL command. This is optimized for mutable streams with primary keys in the condition.
    * Able to configure `license_key_path` and `license_file_path` in the `server/config.yaml` file to specify the license key without web console interaction.

* timeplus_web 2.1.7 -> 2.2.7
  * a
* timeplus_appserver 2.1.6 -> 2.2.6
  * Added new data source for Coinbase.
  * Able to list random streams.
* timeplus_connector 2.1.1 -> 2.2.1
  * Upgraded to Redpanda Connect v4.46 and Benthos framework 4.44, which now supports `mysql_cdc`, [postgres_cdc](https://docs.redpanda.com/redpanda-connect/components/inputs/postgres_cdc/) and [snowflake_streaming](https://docs.redpanda.com/redpanda-connect/components/outputs/snowflake_streaming/) connectors. Please note those connectors require an enterprise license from Redpanda, which you need to set the `REDPANDA_CONNECT_LICENSE` environment variable.
* timeplus cli 1.2.11 -> 1.2.11
  * Added an option to disable telemetry in the [timeplus start](/cli-start) command.
  * The [timeplus diag](/cli-diag) command now exports the [system.stream_state_log](/system-stream-state-log) as a CSV file in the log directory.

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.6 to 2.7 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_7_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
