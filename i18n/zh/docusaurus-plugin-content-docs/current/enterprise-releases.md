# Timeplus Enterprise 2.4

Each release of Timeplus Enterprise includes the following components:

- timeplusd: The core SQL engine
- timeplus_appserver: The application server to provide web console access and REST API
- timeplus_web: The web console static resources, managed by timeplus_appserver
- timeplus_connnector: The service to provide extra sources and sinks, managed by timeplus_appserver
- timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Key Highlights

Key highlights of this release:

- [Mutable Streams](mutable-stream) for fast UPSERT and high performance point or range queries
- [External Streams](timeplus-external-stream) to query or write to remote Timeplus, designed for data migration or hybird deployment
- Read/write Kafka message keys via [_tp_message_key column](proton-kafka#messagekey)
- [Kafka schema registry support for Avro output format](proton-schema-registry#write)
- [Timeplus Native JDBC](jdbc) with streaming SQL and fast insert

## Stable Releases {#stable}

Timeplus Enterprise 2.4 stable build is not released yet.

## Latest Releases {#latest}

### 2.4.11 (Unreleased)

Built on 07-25-2024.

- timeplusd 2.2.8 -> 2.3.14
- timeplus_appserver 1.4.34 -> 1.4.41
- timeplus_web 1.4.18 -> 1.4.28
- timeplus_connnector 1.5.3 -> 1.5.5
- timeplus cli 1.0.9 -> 1.0.17

Changelog:

- timeplusd
  - feat: [new mutable stream](mutable-stream) for fast UPSERT and high performance point or range query.
  - perf: better asof join performance
  - feat: [external stream to read data from the remote timeplusd](timeplus-external-stream)
  - feat: [parallel key space scan](mutable-stream#key_space_full_scan_threads)
  - feat: force_full_scan for mutable stream
  - feat: user management on cluster
  - fix: [alter stream .. modify settings ..](sql-alter-stream#stream_ttl)
  - feat: support remote UDF on cluster
  - feat: primary key columns in secondary key
  - feat: _tp_message_key to [read/write message keys in Kafka](proton-kafka#messagekey)
  - feat: [Kafka schema registry support for Avro output format](proton-schema-registry#write)
  - feat: support idempotent keys processing
  - feat: collect node free memory usage. You can get it via `select cluster_id, node_id, os_memory_total_mb, os_memory_free_mb, memory_used_mb, disk_total_mb, disk_free_mb, timestamp from system.cluster`
  - fix: nullptr access in window function
- timeplus_appserver
  - feat: added mutable stream support
  - feat: more metrics for mv stats
  - feat: stream and external stream metrics
  - feat: adapted timeplusd cluster metrics
  - fix(alert): kv has different host than timeplusd
  - feat: remove ably source
  - feat: improve stats on data lineage
- timeplus_web
  - feat: show more resources stats
  - feat: update license UI
  - feat: show detailed version and build time for components
  - feat: UI for mutable stream CRUD
  - feat: show throughput on data lineage
  - feat: show query pipeline(execution plan) on single node
  - feat: new AutoMQ external stream
  - feat: refined GetStarted UI on home page
  - feat: support multinode stats on data lineage
- timeplus_connnector
  - fix: wrong build time
  - feat: remove ably source
- cli
  - feat: new command for backup/restore data and configuration
  - feat: new command for synchronizing resources to timeplusd
  - feat(container): removed kubectl, added curl
  - feat: single service status check
  - feat: when you start Timeplus Enterprise for the first time, auto-create a dashboard to show usage and stats. The template resides in `timeplus/bin/.dashboard`
  - feat: enable diag CLI on remote timeplusd
