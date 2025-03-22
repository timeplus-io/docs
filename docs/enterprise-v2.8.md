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
* a

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 2.8.0 {#2_8_0}
Released on 03-27-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.8 | sh` [Downloads](/release-downloads#2_8_0)
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v6.0.3 ..`
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.8.0`

Component versions:
* timeplusd 2.8.11
* timeplus_web 2.8.5
* timeplus_appserver 2.8.4
* timeplus_connector 2.2.8
* timeplus cli 1.2.12

#### Changelog {#changelog_2_8_0}
Compared to the [2.7.2](/enterprise-v2.7#2_7_2) release:
* timeplusd 2.7.27 -> 2.8.11
  * Timeplus can read or write data in Apache Iceberg tables.
  * Timeplus can read or write PostgreSQL tables directly via [PostgreSQL External Table](/pg-external-table) or look up data via [dictionaries](/sql-create-dictionary#source_pg).
  * Use S3 as the [tiered storage](/tiered-storage) for streams.
  * New SQL command to [rename streams](/sql-rename-stream).
  * List all tables in a remote MySQL database via [CREATE DATABASE .. SETTINGS type='mysql'](/sql-create-database).
  * Improved the experience of installing Python libraries for [Python UDF](/py-udf#install_pip).
  * New SQL functions: [group_array_sorted](/functions_for_agg#group_array_sorted), [group_array_sample](/functions_for_agg#group_array_sample), [histogram](/functions_for_agg#histogram).
* timeplus_web 2.2.12 -> 2.8.5
  * Significant improvements of materialized view monitoring and troubleshooting UI.
  * Added UI for creating and managing dictionaries, S3/MySQL external tables and Python UDF.
  * Added a dropdown menu to switch to different database namespaces in the web console.
  * Added UI to manage dictionaries and S3 external tables.
* timeplus_appserver 2.2.13 -> 2.8.4
  * [REST API](/rest) support for non-default database namespaces.
  * When you define a source or sink powered by Redpanda Connect, you can now specify the optional `buffer` and `pipeline` components in the YAML configuration.
  * Added endpoints to list/get/delete [dictionaries](/sql-create-dictionary).
* timeplus_connector 2.2.8. No changes.
* timeplus cli 1.2.12. No changes.

Upgrade Instructions:

Users can upgrade from Timeplus Enterprise 2.7 to 2.8 by stopping components and replacing binary files, or by updating Docker/Kubernetes image versions while maintaining existing volumes.

#### Known issues {#known_issue_2_8_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.6.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
3. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
4. Python UDF support is limited to Linux x86_64 bare metal and Linux x86_64 Docker image, excluding macOS or ARM builds.
