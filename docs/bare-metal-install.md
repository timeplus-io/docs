# Deploy on Bare Metal

Timeplus Enterprise can be easily installed bare metal Linux or MacOS, as a single node or multi-node cluster.

## Single Node Install

### Install Script

If your server or computer is running Linux or MacOS, you can run the following command to download the package and start Timeplus Enterprise without any other dependencies.
:::info
For Windows users, please follow [our guide](#docker) for running Timeplus Enterprise with Docker.
:::

```shell
curl https://install.timeplus.com | sh
```

This script will download the latest release (based on your operating system and CPU architecture) to the current folder. Uncompress the package and start the Timeplus Enterprise server.

If you'd like to download the package for a certain feature release, you can run the following command:

```shell
curl https://install.timeplus.com/2.8 | sh
```
Replace `2.8` with the desired version number.

### Manual Install
You can also download packages manually with the following links:

* Linux ([Intel/AMD chip](https://install.timeplus.com/stable-linux-amd64.tar.gz), [ARM chip](https://install.timeplus.com/stable-linux-arm64.tar.gz))
* MacOS ([Intel chip](https://install.timeplus.com/stable-darwin-amd64.tar.gz), [Apple Silicon chip](https://install.timeplus.com/stable-darwin-arm64.tar.gz))
* Windows (Please [install via Docker](#docker))


After you download the package, put it in a desired folder, uncompress the file, and you can run Timeplus Enterprise with preconfigured settings:

```shell
tar xfv file.tar.gz
```
Then change directory to the `bin` folder and run
```shell
./timeplus start
```
### Timeplus Enterprise Processes
This will start Timeplus Enterprise with a few key processes:
* `timeplusd`: The core SQL engine, severing at port 8463 (TCP, for `timeplus client`) and 3218 (HTTP, for JDBC/ODBC drivers
* `timeplus_appserver`: The application server, severing at HTTP port 8000
* `timeplus_web`: The web UI, managed by `timeplus_appserver`
* `timeplus_connector`: The service to provide extra sources and sinks, managed by `timeplus_appserver`

Access the Timeplus Enterprise web console via http://localhost:8000. On your first login, please create an account with a password to start the 30-day free trial.

It is also possible to only start/stop single process by running `timeplus start -s service_name`. For example, when you only want to startup Timeplus Core (SQL Engine), run `timeplus start -s timeplusd`.

For more information, please check the [CLI Reference](/cli-reference).

### Upgrade {#upgrade}
To upgrade Timeplus Enterprise, run `timeplus stop` to stop all the services. Then replace all the binaries to the higher version of Timeplus Enterprise release and then run `timeplus start`.

### Uninstall {#uninstall}
Timeplus Enterprise has no external dependencies. Just run `timeplus stop` then delete the timeplus folder.

## Docker Install{#docker}

Alternatively, run the following command to start Timeplus Enterprise with [Docker](https://www.docker.com/get-started/):
```shell
docker run -p 8000:8000 timeplus/timeplus-enterprise
```

A few optional parameters:
* Add `--name timeplus` to set a name for the container
* Add `-d` to run the container in the background
* Add `-p 8463:8463 -p 3218:3218` if you want to run SQL with `timeplus client` or JDBC/ODBC drivers
* Add `-v "$(pwd)"/data:/timeplus/data -v "$(pwd)"/logs:/timeplus/logs` if you want to mount the data and log files to your host

## Quickstart with Docker Compose {#compose}
To try our demo kit, you can use Docker Compose to start Timeplus Enterprise, together with Redpanda (A Kafka API compatible message bus), ClickHouse and data generator.

For Linux or Mac users, please run the command:
```bash
curl https://install.timeplus.com/sp-demo | sh
```

For Windows users, you can download the package with Docker Compose file and bootstrap scripts [here](https://timeplus.io/dist/timeplus_enterprise/sp-demo-20240522.zip).

Access the Timeplus demo kit web console at https://localhost:8000.

This stack demonstrates how to run streaming ETL, getting data from Kafka API, applying filter or aggregation, then sending to another Kafka topic or ClickHouse tables. For more details, please see:
* [Tutorial – Streaming ETL: Kafka to Kafka](/tutorial-sql-etl)
* [Tutorial – Streaming ETL: Kafka to ClickHouse](/tutorial-sql-etl-kafka-to-ch)

## Cluster Install
Timeplus Enterprise can be installed in multi-node cluster mode for high availability and horizontal scalability. This page shares how to install Timeplus cluster on bare metal. Please refer to [this guide](/k8s-helm) to deploy Timeplus Enterprise on Kubernetes.

### Multi-Node Cluster

There are multiple ways to setup a cluster without Kubernetes. One easy solution is to run all components in one node, and the rest of nodes running the timeplusd only. For other deployment options, please contact [support](mailto:support@timeplus.com) or message us in our [Slack Community](https://timeplus.com/slack).

Choose one node as the lead node, say its hostname is `timeplus-server1`. Stop all services via `timeplus stop` command. Then configure environment variables.
```bash
export ADVERTISED_HOST=timeplus-server1
export METADATA_NODE_QUORUM=timeplus-server1:8464,timeplus-server2:8464,timeplus-server3:8464
export TIMEPLUSD_REPLICAS=3
```
Then run `timeplus start` to start all services, including timeplusd, timeplus_web, timeplus_appserver and timeplus_connector.

On the second node, first make sure all services are stopped via `timeplus stop`.
Then configure environment variables.
```bash
export ADVERTISED_HOST=timeplus-server2
export METADATA_NODE_QUORUM=timeplus-server1:8464,timeplus-server2:8464,timeplus-server3:8464
```
Then run `timeplus start -s timeplusd` to only start timeplusd services.

Similarly on the third node, set `export ADVERTISED_HOST=timeplus-server3` and the same `METADATA_NODE_QUORUM` and only start timeplusd.

### Single-Host Cluster {#single-host-cluster}

Starting from [Timeplus Enterprise v2.7](/enterprise-v2.7), you can also easily setup multiple timeplusd processes on the same host by running the `timeplusd server` with `node-index` option. This is useful for testing multi-node cluster.
```bash
./timeplusd server --node-index=1
./timeplusd server --node-index=2
./timeplusd server --node-index=3
```

Timeplusd will automatically bind to different ports for each node. You can run `timeplusd client` to connect to one node and check the status of the cluster via:
```sql
SELECT * FROM system.cluster
```

## License Management{#license}
When you start Timeplus Enterprise and access the web console for the first time, the 30-day free trial starts. When it ends, the software stops working.

Please check [the guide](/server_config#license) to update licenses.
