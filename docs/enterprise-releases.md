# Enterprise Releases
This page lists the release history of Timeplus Enterprise.

Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server to provide web console access and REST API
* timeplus_web: The web console static resouces, managed by timeplus_appserver
* timeplus_connnector: The service to provide extra sources and sinks, managed by timeplus_appserver
* timepuls: The CLI (Command Line Interface) to start/stop/manage the deployment.

Each component tracks their changes with own version numbers. The version number for each Timeplus Enterprise release is a verfied combination of Timeplus components.

## 2.3.2
Built on 06-25-2024.
* timeplusd 2.2.7 -> 2.2.8
* timeplus_appserver 1.4.33
* timeplus_web 1.4.18
* timeplus_connnector 1.5.3
* timepuls cli 1.0.4

Changelog:
* [timeplusd] feat: new setting `allow_independent_shard_processing`, default false. When data is already sharded correctly on file system and if the aggregation is on the sharding key, set it to true to avoid re-shuffle the data
* [timeplusd] feat: support modify materialized view query settings, e.g. `alter stream mv_with_inner_stream modify query setting checkpoint_interval=600`

## 2.3.1
Built on 06-25-2024.
* timeplusd 2.2.7
* timeplus_appserver 1.4.32 -> 1.4.33
* timeplus_web 1.4.17 -> 1.4.18
* timeplus_connnector 1.5.3
* timepuls cli 1.0.4

Changelog:
* [timeplus_appserver] feat: disabled user provision on timeplusd cluster
* [timeplus_appserver] feat: global metrics and dependencies
* [timeplus_appserver] feat: improved mv stats
* [timeplus_appserver] chore: updated onprem image name to timeplus-appserver
* [timeplus_web] fix(query): timeplusd resouces do not refresh after DDL
* [timeplus_web] feat(datalineage): show resouces stats on datalienage
* [timeplus_web] feat: do not provision user on timeplusd cluster

## 2.3.0
Built on 06-20-2024.
* timeplusd 2.2.7
* timeplus_appserver 1.4.32
* timeplus_web 1.4.17
* timeplus_connnector 1.5.3
* timepuls cli 1.0.4
