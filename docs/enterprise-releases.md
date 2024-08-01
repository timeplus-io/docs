# Timeplus Enterprise 2.4
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server to provide web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connnector: The service to provide extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Key Highlights
Key highlights of this release:
* [Mutable Streams](mutable-stream) for fast UPSERT and high performance point or range queries
* [External Streams](timeplus-external-stream) to query or write to remote Timeplus, designed for data migration or hybird deployment
* Read/write Kafka message keys via [_tp_message_key column](proton-kafka#messagekey)
* [Kafka schema registry support for Avro output format](proton-schema-registry#write)
* [Timeplus Native JDBC](jdbc) with streaming SQL and fast insert

## Stable Releases {#stable}
Please use the stable releases for production deployment, while we also provide latest engineering builds for testing and evaluation.

### 2.4.15

Built on 07-31-2024. You can get it via:
* For Linux or Mac users: `curl https://install.timeplus.com | sh`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v2.4.15 ..`
* For Docker users (not for production): `docker run -p 8000:8000 timeplus/timeplus-enterprise:2.4.15`

#### Changelog {#changelog_2_4_15}

Comparing to the last `stable` release [2.3.5](enterprise-v2.3#235):
* timeplusd 2.2.8 -> 2.3.20
* timeplus_appserver 1.4.34 -> 1.4.43
* timeplus_web 1.4.18 -> 1.4.30
* timeplus_connnector 1.5.3 -> 1.5.5
* timeplus cli 1.0.9 -> 1.0.18

Components:
* timeplusd
  * feat: [new mutable stream](mutable-stream) for fast UPSERT and high performance point or range query.
  * perf: better asof join performance
  * feat: [external stream to read data from the remote timeplusd](timeplus-external-stream)
  * feat: [parallel key space scan](mutable-stream#key_space_full_scan_threads)
  * feat: force_full_scan for mutable stream
  * feat: user management on cluster
  * fix: [alter stream .. modify settings ..](sql-alter-stream#stream_ttl)
  * feat: support remote UDF on cluster
  * feat: primary key columns in secondary key
  * feat: _tp_message_key to [read/write message keys in Kafka](proton-kafka#messagekey)
  * feat: [Kafka schema registry support for Avro output format](proton-schema-registry#write)
  * feat: support idempotent keys processing
  * feat: collect node free memory usage. You can get it via `select cluster_id, node_id, os_memory_total_mb, os_memory_free_mb, memory_used_mb, disk_total_mb, disk_free_mb, timestamp from system.cluster`
  * fix: nullptr access in window function
  * feat: timeplusd listen for ipv4 and ipv6 port. No need to set `-h 127.0.0.1` for `timeplusd client`
  * feat: added `num_of_logical_cpu_cores` for telemetry (based on cgroup limit for Linux, otherwise get the hardware concurrency)
  * feat: changed the logging level for JavaScript UDF from DEBUG to INFO, also automatically convert data types to string
* timeplus_appserver
  * feat: added mutable stream support
  * feat: more metrics for mv stats
  * feat: stream and external stream metrics
  * feat: adapted timeplusd cluster metrics
  * fix(alert): kv has different host than timeplusd
  * feat: remove ably source
  * feat: improve stats on data lineage
  * fix: wrap column name for schema infer
* timeplus_web
  * feat: show more resources stats
  * feat: update license UI
  * feat: show detailed version and build time for components
  * feat: UI for mutable stream CRUD
  * feat: show throughput on data lineage
  * feat: show query pipeline(execution plan) on single node
  * feat: new AutoMQ external stream
  * feat: refined GetStarted UI on home page
  * feat: support multinode stats on data lineage
  * feat: use fixed font size for single value chart
* timeplus_connnector
  * fix: wrong build time
  * feat: remove ably source
* cli
  * feat: new command for backup/restore data and configuration
  * feat: new command for synchronizing resources to timeplusd
  * feat(container): removed kubectl, added curl
  * feat: single service status check
  * feat: when you start Timeplus Enterprise for the first time, auto-create a dashboard to show usage and stats. The template resides in `timeplus/bin/.dashboard`
  * feat: enable diag CLI on remote timeplusd
  * feat: for stop command, terminate the service if graceful stop times out

#### Known issues {#known_issue_2_4_15}
1. If you have deployed one of the [2.3.x releases](enterprise-v2.3), you cannot reuse the data and configuration directly. Please have a clean installation of 2.4.x release, then use tools like [timeplus sync](cli-sync) CLI or [Timeplus External Stream](timeplus-external-stream) for migeration.
2. In Timeplus Console, no result will be shown for SQL [SHOW FORMAT SCHEMAS](sql-show-format-schemas) or [SHOW FUNCTIONS](sql-show-functions). This only impacts the web interface. Running such SQL via `timeplusd client` CLI or JDBC/ODBC will get the expected results.
3. For [timeplus user](cli-user) CLI, you need to add `--verbose` to `timeplus user list` command, in order to list users.

## Latest Releases {#latest}

The stable build 2.4.15 is also the latest release.

## Other Releases {#other}
Older releaess of 2.4.x will be listed here.
