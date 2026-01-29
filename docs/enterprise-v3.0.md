# Timeplus Enterprise 3.0

## Key Highlights

Key highlights of the Timeplus 3.0 release include:

- **BYOC** Offering

  Users can easily start Timeplus BYOC stack now in AWS.

- **Zero Replication NativeLog**

  The Write-Ahead Log (`NativeLog`, a.k.a. Timeplus Streaming Store) now supports cloud object storage (e.g., S3) as its primary backend. This enables zero replication, multi-master writes, and very high throughput (several GB/s with batching). It also eliminates cross-AZ replication costs and reduces EBS-like IOPS/bandwidth expenses, making the cluster far more elastic and cost-efficient.

- **Zero Replication Query State Checkpoint**

  Materialized Views now support checkpointing query states directly to cloud object storage. Just like Zero Replication NativeLog, this dramatically improves elasticity and cost efficiency across the cluster.

- **Scheduled Task Enhancements**

  Scheduled tasks can now be distributed across all nodes based on resource utilization metrics, enabling more balanced and elastic scheduling.

- **Alert Enhancements**

  Similar to scheduled tasks, alerts can now run on any node, guided by resource utilization metrics, for improved elasticity and performance.

- **Streaming Processing Enhancements**

  Lots of performance and function upgrades including more performant data shuffling, way better performant sessionization, high cardinality aggregation without worring about late events, hybrid hash table for the right join table etc.

- **Cluster Elastic and Stability**

  Overall cluster elasticity and stability have been significantly enhanced in this release.

- **Timeplus Console**

  The Console has been upgraded with better system metrics, state monitoring, and the data lineage, Materialized View, internal execution DAG and cluster detailed status etc enhancements — delivering a much improved operational experience.

- **Deprecate timeplus_web**

  The `timeplus_web` component has been removed, simplifying installation and operations. The new web stack is more compact, efficient, and performant.

- **Deprecate kv_service**

  Metadata management in `timeplus_appserver` now leverages Timeplus Mutable Stream, making the internal `kv_service` obsolete. It has been deprecated and removed in this release.


## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 3.1.1 {#3_1_1}
Released on 01-29-2026. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/3.0 | sh` [Downloads](/release-downloads#3_1_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.1.1`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version TBD`

Component versions:
* timeplusd 3.1.1
* timeplus_appserver 3.0.47
* timeplus_connector 3.0.21
* timeplus cli 3.0.0
* timeplus byoc 1.0.0

#### Changelog {#changelog_3_1_1}

* Observerbility is now supported.
* Materialized View Enhancements
* TBD


### 3.0.1 {#3_0_1}
Released on 10-20-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/3.0 | sh` [Downloads](/release-downloads#3_0_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.0.1`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v10.0.7`

Component versions:
* timeplusd 3.0.1
* timeplus_appserver 3.0.21
* timeplus_connector 3.0.21
* timeplus cli 3.0.0
* timeplus byoc 1.0.0

#### Changelog {#changelog_3_0_1}

* [BYOC](/byoc) is now supported.
* Materialized View Enhancements
  * Materialized View now supports checkpointing states in [shared storage](/materialized-view-checkpoint#zero-replication-checkpoint) (e.g S3).
  * High performant [sessionization](/global-aggregation#emit-after-session-close) support.
  * High performant and high cardinality aggregation with [aggregated state TTL](/global-aggregation#ttl-of-aggregation-keys) support.
  * Hybrid hash table implementation for right-hand side table in stream-table enrichment join. Saving memory overhead.
  * Controlled data shuffle parallelism and efficiency via [`substreams`](/shuffle-data#control-the-fan-out) query settings.
  * [JIT](/jit) is now supported which greatly improves streaming query performance and efficiency.

* Task Enhancements.

  [Task](/task) can now be scheduled to any node in the cluster, providing significantly better scalability.

* Alert Enhancements.

  [Alert](/alert) can now be scheduled to any node in the cluster, improving scalability and fault tolerance.

* Cluster Enhancements.
  * [Zero Replication NativeLog](/cluster#zero-replication-nativelog) is now supported, eliminating cross AZ replication cost and greatly improving ingest scalability and efficiency.
  * Materialized View, Alert, and Task scheduling and failover mechanisms have been significantly improved.

* Stream Enhancements
  * Mutable stream has a more performant TTL implementation.
  * Mutable stream TTL now supports [user provided timestamp](/mutable-stream-ttl#retention-based-on-event-timestamp).
  * [Rack-aware](/rack-aware-placements) data placement is now availabe for all native streams.

* Python UDF Enhancements
  * User can now manage third-party Python libraries via [`system`](/py-udf#python_libs) command.

* Timeplus Console Enhancements
  * Console now supports both light and dark mode with a simplied, refined UI.
  * Data Lineage page includes more metrics and improved usability.
  * Cluster pages include additional metrics and improved layouts.
  * Materialized View page shows more metrics like CPU utilization and the internal execution DAG and node metrics in the DAG.

* DevEx
  * [dbt](https://github.com/timeplus-io/dbt-timeplus) integration is now updated and refined

### 3.0.1 (Preview 2) {#3_0_1-preview_2}
Released on 09-25-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/3.0 | sh` [Downloads](/release-downloads#3_0_1-preview_2)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.0.1-preview.2`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version v10.0.1`

Component versions:
* timeplusd 3.0.1-rc.16
* timeplus_appserver 3.0.3
* timeplus_connector 3.0.0
* timeplus cli 3.0.0

### 3.0.1 (Preview) {#3_0_1-preview_1}
Released on 09-06-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/3.0 | sh` [Downloads](/release-downloads#3_0_1-preview_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.0.1-preview.1`
* For Kubernetes users: helm install timeplus/timeplus-enterprise --version v8.0.8 .

Component versions:
* timeplusd 3.0.1-rc.8
* timeplus_appserver 3.0.2
* timeplus_connector 3.0.0
* timeplus cli 2.9.0
