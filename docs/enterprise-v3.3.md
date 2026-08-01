# Timeplus Enterprise 3.3

## Key Highlights

Key highlights of the Timeplus 3.3 release include:

1. Major performance improvement in the data replication **network layer** — up to 30x faster in some scenarios — powered by request pooling, recyclable network buffers, sharded request/response channels, scatter/gather writes, and IPv6 support.
2. Major performance improvement (up to 40x) for Kafka consume / **parsing for Protobuf, CSV, and similar formats** via smart batching and a new parallel parsing strategy for Kafka source.
3. Major enhancements to **Python UDFs** and **external Python table functions** now enable secure, direct communication with the local timeplusd instance via automatically provisioned an ephemeral user and token. 
4. **NATS JetStream** source / sink support.
5. Broad stability and quality hardening across **mutable streams, checkpoints, materialized views, streaming joins, memory accounting, and replicated log recovery**.
6. Improved **Okta SSO** integration with a smoother login flow and support for mapping Okta users to read-only or admin roles.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 3.3.1 {#3_3_1}
Released on 08-01-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_3_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.3.1`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 13.0.6`

Component versions:
* timeplusd 3.3.1
* timeplus_appserver 3.3.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.1-rc.2

#### Changelog {#changelog_3_3_1}

This release consolidates all timeplusd changes from 3.2.11 through 3.3.1.

**Features and Enhancements**
* Add global tiered storage policy (#11811)
* Add feature flag to disable the workload rebalancer (#11815)

**Performance**
* Batch process Protobuf messages for Kafka (#11572)


**Bug Fixes**
* Disable checkpoints at runtime for random-source materialized views (#11827)

