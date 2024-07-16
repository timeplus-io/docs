# Enterprise Releases
This page lists the release history of Timeplus Enterprise.

Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server to provide web console access and REST API
* timeplus_web: The web console static resources, managed by timeplus_appserver
* timeplus_connnector: The service to provide extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Stable Releases {#stable}

### 2.3.0
Built on 06-20-2024.
* timeplusd 2.2.7
* timeplus_appserver 1.4.32
* timeplus_web 1.4.17
* timeplus_connnector 1.5.3
* timeplus cli 1.0.4

## Latest Releases {#latest}

### 2.4.6 (Unreleased)
Built on 07-1?-2024.
* timeplusd 2.2.8 -> 2.3.9
* timeplus_appserver 1.4.34 -> 1.4.38
* timeplus_web 1.4.18 -> 1.4.23
* timeplus_connnector 1.5.3 -> 1.5.4
* timeplus cli 1.0.9 -> 1.0.13

Changelog:

* timeplusd
  * feat: [new mutable stream](mutable-stream) for fast UPSERT and high performance point or range query.
  * improve: better asof join performance
  * feat: integrate system stream metrics with local stream
  * feat: [parallel key space scan](mutable-stream#key_space_full_scan_threads)
  * feat: force_full_scan for mutable stream
  * feat: user management on cluster
  * fix: [alter stream .. modify settings ..](sql-alter-stream#stream_ttl)
* timeplus_appserver
  * feat: added mutable stream support
  * feat: more metrics for mv stats
  * feat: stream and external stream metrics
  * feat: adapted timeplusd cluster metrics
  * fix(alert): kv has different host than timeplusd
* timeplus_web
  * feat: show more resources stats
  * feat: update license UI
  * feat: show detailed version and build time for components
  * feat: UI for mutable stream CRUD
  * feat: show throughput on data lineage
  * feat: show query pipeline(execution plan) on single node
* timeplus_connnector
  * fix: wrong build time
* cli
  * feat: new command for backup/restore data and configuration
  * feat: new command for synchronizing resources to timeplusd
  * feat(container): removed kubectl, added curl

### 2.3.5
Built on 07-02-2024.
* timeplusd 2.2.7 -> 2.2.8
* timeplus_appserver 1.4.32 -> 1.4.34
* timeplus_web 1.4.17 -> 1.4.18
* timeplus_connnector 1.5.3
* timeplus cli 1.0.4 -> 1.0.9

Changelog:

* timeplusd
  * feat: new setting `allow_independent_shard_processing`, default false. When data is already sharded correctly on file system and if the aggregation is on the sharding key, set it to true to avoid re-shuffle the data.
  * feat: support modify materialized view query settings, e.g. `alter stream mv_with_inner_stream modify query setting checkpoint_interval=600`
* timeplus_appserver
  * feat: configuration items renaming, avoid using codenames
  * feat: disabled user provision on timeplusd cluster
  * feat: global metrics and dependencies
  * feat: improved mv stats
  * chore: updated onprem image name to timeplus-appserver
* timeplus_web
  * fix(query): timeplusd resources do not refresh after DDL
  * feat(datalineage): show resources stats on datalineage
  * feat: do not provision user on timeplusd cluster
* cli
  * feat: use more formal product name in command line messages
  * feat: use more formal product name in command line messages
  * feat: commands for user management
  * feat: commands for cluster management
