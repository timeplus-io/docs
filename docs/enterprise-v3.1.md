# Timeplus Enterprise 3.1

## Key Highlights

Key highlights of the Timeplus 3.1 release include:

- **Timeplus Inputs**

  Timeplus input is a new concept which allows users to push / stream data to the inputs by leveraging existing data ecosystem and tools.

  In this release, the following inputs are supported.

    - Splunk S2S 
    - Splunk HEC
    - Datadog
    - Elastic
    - OpenTelemetry
    - Netflow / IPFIX
    - Syslog

- **Microsoft Sentinel External Table (Output)**

  User can write security events to Microsoft Sentinel by using this external table now. 

- **Performance Enhancements**

    - Bidirectional direct join for Mutable streams
    - Historical data backfill concurrency control “backfill_max_threads” query setting
    - Big performance improvements on Protobuf Kafka record streaming parsing.
    - Better HTTP Connection Pooling
    - Better Materialized View Workload Rebalance

- **System Observability Enhancements**

    - Provide disk IO utilization of each node in the cluster
    - More lagging insights in historical store : v_stream_applied_lags
    - More metrics for Streaming Join

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

**Inputs**
* Splunk S2S 
* Splunk HEC
* Datadog
* Elastic
* OpenTelemetry
* Netflow / IPFIX
* Syslog

**Outputs**
* Microsoft Sentinel External Table

**Other Functionalities**
* Python table function for read, write and transform
* Immutable column `_tp_index_time` for mutable stream 

**Performance**
* Bidirectional direct join for Mutable streams
* Historical data backfill concurrency control “backfill_max_threads” query setting
* Big performance improvements on Protobuf Kafka record streaming parsing.
* Better HTTP Connection Pooling
* Better Materialized View Workload Rebalance

**System Observability Enhancements**

* Provide disk IO utilization of each node in the cluster
* More lagging insights in historical store : v_stream_applied_lags
* More internal observability metrics for streaming Join

**Bugfixes**
* Quite a few bugfixes for Mutable stream 
* Bugfixes for Materialized View checkpointing 
