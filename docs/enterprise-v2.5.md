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
* Reading or writing data in Apache Pulsar or StreamNative via [External Stream](/pulsar-external-stream).
* Building User-Defined Function (UDF) or Aggregation Function (UDAF) via [Python](/py-udf).
* Connecting to various systems via Redpanda Connect
* New subcommand in [timeplus CLI](/cli-reference) for data migration and backup/restore.

## Releases
Please use the stable releases for production deployment, while we also provide latest engineering builds for testing and evaluation.

### 2.5.2 {#2_5_2}
Built on 10-??-2024. You can install via:
* For Linux or Mac users: `curl https://install.timeplus.com/?? | sh`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v3.?? ..`
* For Docker users (not for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.??`

Component versions:
* timeplusd 2.4.17
* timeplus_web 2.0.6
* timeplus_appserver 2.0.8
* timeplus_connector 2.0.3
* timeplus cli 1.2.7

#### Changelog {#changelog_2_5_8}

Compared to the [2.4.23](/enterprise-v2.4#2_4_23) release:
* timeplusd 2.3.30 -> 2.4.17
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
* timeplus_appserver 1.4.44 -> 2.0.8
  * Forwarded `x-timeplus-idempotent-id` header in the ingest REST API to timeplusd.
  * Communicate with timeplusd and timeplus_connector with the current user, not the default one.
  * Integration with Redpanda Connect.
* timeplus_connector 1.5.5 -> 2.0.3
  * Integration with latest version of Benthos framework and Redpanda Connect.
* timeplus cli 1.0.19 -> 1.2.7
  * New [migrate](/cli-migrate) subcommand in [timeplus CLI](/cli-reference) for data migration and backup/restore.
  * [Manage users](/cli-user) with role and password.

You can upgrade a deployment of Timeplus Enterprise 2.4 to Timeplus Enterprise 2.5, by stopping the components and replacing the binary files, or reusing the Docker or Kubernetes volumes and update the image versions.

#### Known issues {#known_issue_2_5_8}
1. If you have deployed one of the [2.4.x releases](/enterprise-v2.4), you can reuse the data and configuration directly. However, if your current deployment is [2.3](/enterprise-v2.3) or earlier, you cannot upgrade directly. Please have a clean installation of 2.5.x release, then use tools like [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for migration.
2. During timeplusd startup, you will see some logs such as `<Error> ServerErrorHandler: Poco::Exception. Code: 1000, e.code() = 107, Net Exception: Socket is not connected`. This can be ignored and won't impact the functionalities. We will refine the logs.
3. The bare metal installation on macOS v15 (Sequoia) does not function. `timeplusd` server fails to start. As a workaround, you can run Timeplus Enterprise v2.5 via Docker on macOS v15. This is caused by the new "Local Network" feature in macOS v15. Bare metal deployment on macOS v14 works.
4. The bare metal installation on macOS with Intel chip works. However if you shutdown the Timeplus Enterprise server, you need to delete the data folder to start it again.
