# Timeplus Enterprise 2.9
Each release of Timeplus Enterprise includes the following components:

* timeplusd: The core SQL engine
* timeplus_appserver: The application server providing web console access and REST API
* timeplus_web: The web console static resources. Starting from Timeplus Enterprise 2.9, this component is packaged into timeplus_appserver. No longer as a seperate binary or container
* timeplus_connector: The service providing extra sources and sinks, managed by timeplus_appserver
* timeplus: The CLI (Command Line Interface) to start/stop/manage the deployment

Each component maintains its own version numbers. The version number for each Timeplus Enterprise release represents a verified combination of these components.

## Key Highlights
Key highlights of this release:
* Online schema evolution for Mutable Stream
* Versioned Mutable Stream
* Coalesced Mutable Stream
* Native JSON field type
* [json_encode](/functions_for_json#json_encode) / [json_cast](/functions_for_json#json_cast) functions to convert row with multiple columns to json string or new json type
* Dead Letter Queue
* [Native HTTP External Stream](/http-external) to Splunk and Elastic Search
* JIT streaming processing for big perf / efficiency improvements
* Parameterized Views
* Mutable Stream Enhancements : TTL, Drop / Rebuild Secondary Indexes etc
* Large cardinality sessionization
* Distributed LogStream
* [Python UDF](/py-udf) now supports Arm CPU on Linux or MacOS
* The refined UI to visualize nodes in a cluster

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 2.9.0 (Preview 0) {#2_9_0-preview_0}
Released on 05-28-2025. Installation options:
* For Linux or Mac users: `curl https://install.timeplus.com/2.9 | sh` [Downloads](/release-downloads#2_9_0)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:2.9.0-preview.0`
* We will provide new Helm Charts for Kubernetes deployment when v2.9 is GA.

Component versions:
* timeplusd 2.9.7
* timeplus_web 2.9.27
* timeplus_appserver 2.9.24
* timeplus_connector 2.9.0
* timeplus cli 2.9.0

#### Changelog {#changelog_2_9_0-preview_0}
Compared to the [2.8.1](/enterprise-v2.8#2_8_0) release:
* timeplusd 2.8.14 -> 2.9.7
  * TODO
* timeplus_web 2.8.7 -> 2.9.27
  * TODO
* timeplus_appserver 2.8.5 -> 2.9.24
  * package with timeplus_web static files
  * support new database types, such as MySQL/Postgres/Iceberg external tables
  * updated proton-go-driver to support new json type
* timeplus_connector 2.2.8 -> 2.9.0
  * removed the support for internal k/v service, since metadata is saved in mutable streams in v2.9
* timeplus cli 2.8.0 -> 2.9.0
  * No longer need to start/stop the timeplus_web component.
  * Load `timeplus_connector.yaml` from the relative path or via `BENTHOS_CONFIG_PATH` environment variable.

Upgrade Instructions:

If you install Timeplus Enterprise 2.7 or earlier, the metadata for the Redpanada Connect sources and sinks are saved in a special key/value service. v2.8 switches to mutable streams for such metadata by default and provides a migration tool. In 2.9, all metadata are saved in mutable streams and the previous key/value service has been removed. Please upgrade to 2.8 first if you are on 2.7 or earlier. Then upgrade to 2.9.

#### Known issues {#known_issue_2_9_0-preview_0}
1. Direct upgrades from version 2.3 or earlier are not supported. Please perform a clean installation of 2.9.x and utilize [timeplus sync](/cli-sync) CLI or [Timeplus External Stream](/timeplus-external-stream) for data migration.
2. For existing deployments with any version from 2.3 to 2.7, please upgrade to 2.8 first and migreate the metadata. .
3. Pulsar external stream functionality is limited to Linux bare metal builds and Linux-based Docker images, excluding macOS bare metal builds.
4. The `timeplus_connector` component may experience health issues on Ubuntu Linux with x86_64 chips, affecting Redpanda Connect functionality. This issue is specific to Ubuntu and does not affect other Linux distributions.
