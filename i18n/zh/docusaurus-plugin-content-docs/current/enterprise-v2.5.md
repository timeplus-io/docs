# Timeplus Enterprise 2.5

Each release of Timeplus Enterprise includes the following components:

- timeplusd: The core SQL engine
- timeplus_appserver: The application server to provide web console access and REST API
- timeplus_web: The web console static resources, managed by timeplus_appserver
- timeplus_connector: The service to provide extra sources and sinks, managed by timeplus_appserver
- timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Key Highlights

Key highlights of this release:

- Reading or writing data in Apache Pulsar or StreamNative via [External Stream](/pulsar-external-stream).
- Building User-Defined Function (UDF) or Aggregation Function (UDAF) via [Python](/py-udf).
- Connecting to various systems via Redpanda Connect
- New subcommand in [timeplus CLI](/cli-reference) for data migration and backup/restore.

## Releases

Please use the stable releases for production deployment, while we also provide latest engineering builds for testing and evaluation.

### 2.5.2 {#2_5_2}

Built on 10-??-2024. You can install via:

- For Linux or Mac users: `curl https://install.timeplus.com/?? | sh`
- For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v3.?? ..`
- For Docker users (not for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.??`

Component versions:

- timeplusd 2.3.30
- timeplus_appserver 1.4.44
- timeplus_web 1.4.33
- timeplus_connector 1.5.5
- timeplus cli 1.0.19

#### Changelog {#changelog_2_4_23}

Compared to the [2.4.19](#2419) release:

- timeplusd 2.3.25 -> 2.3.30
  - support dropping partitions on cluster
  - add additional query_type in sql analyzer, fixing the known issue
  - enhanced historical asof joins with a performance improvement of over 30%
  - bugfixes and performance enhancements

#### Known issues {#known_issue_2_4_23}

1. If you have deployed one of the [2.3.x releases](/enterprise-v2.3), you cannot reuse the data and configuration directly. Please have a clean installation of 2.4.x release, then use tools like [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for migration.
