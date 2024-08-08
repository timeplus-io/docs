# Timeplus Enterprise 2.3

This page lists the release history of Timeplus Enterprise.

Each release of Timeplus Enterprise includes the following components:

- timeplusd: The core SQL engine
- timeplus_appserver: The application server to provide web console access and REST API
- timeplus_web: The web console static resources, managed by timeplus_appserver
- timeplus_connector: The service to provide extra sources and sinks, managed by timeplus_appserver
- timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verified combination of Timeplus components.

## Key Highlights

Key highlights of this release:

- KV Stream, later on renamed to [Mutable Streams](mutable-stream)
- Able to [modify materialized view settings](sql-alter-stream)
- New `timeplus` CLI commands to manage [users](cli-user)

## Stable Releases {#stable}

### 2.3.5

Built on 07-02-2024. You can get it via:

- For Docker users (not for production): `docker run -p 8000:8000 timeplus/timeplus-enterprise:2.3.5`

Component versions:

- timeplusd 2.2.8
- timeplus_appserver 1.4.34
- timeplus_web 1.4.18
- timeplus_connector 1.5.3
- timeplus cli 1.0.9

Changelog (comparing to [2.3.0](#230)):

- timeplusd
  - feat: new setting `allow_independent_shard_processing`, default false. When data is already sharded correctly on file system and if the aggregation is on the sharding key, set it to true to avoid re-shuffle the data.
  - feat: support modify materialized view query settings, e.g. `alter stream mv_with_inner_stream modify query setting checkpoint_interval=600`
- timeplus_appserver
  - feat: configuration items renaming, avoid using codenames
  - feat: disabled user provision on timeplusd cluster
  - feat: global metrics and dependencies
  - feat: improved mv stats
  - chore: updated onprem image name to timeplus-appserver
- timeplus_web
  - fix(query): timeplusd resources do not refresh after DDL
  - feat(datalineage): show resources stats on datalineage
  - feat: do not provision user on timeplusd cluster
- cli
  - feat: use more formal product name in command line messages
  - feat: use more formal product name in command line messages
  - feat: commands for user management
  - feat: commands for cluster management

## Other Releases {#other}

### 2.3.0

Built on 06-20-2024. You can get it via:

- For Docker users (not for production): `docker run -p 8000:8000 timeplus/timeplus-enterprise:2.3.0`

Components:

- timeplusd 2.2.7
- timeplus_appserver 1.4.32
- timeplus_web 1.4.17
- timeplus_connector 1.5.3
- timeplus cli 1.0.4
