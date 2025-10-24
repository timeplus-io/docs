# Timeplus Proton

Timeplus Proton is a stream processing engine and database. It is fast and lightweight alternative to ksqlDB or Apache Flink, powered by the libraries and engines in ClickHouse. It enables developers to solve streaming data processing, multi-stream JOINs, sophisticated incremental materialized views, routing and analytics challenges from Apache Kafka, Redpanda and more sources, and send aggregated data to the downstream systems. Timeplus Proton is the core engine of Timeplus Enterprise.

## 💪 Why use Timeplus Proton?

1. **[Apache Flink](https://github.com/apache/flink) or [ksqlDB](https://github.com/confluentinc/ksql) alternative.** Timeplus Proton provides powerful streaming SQL functionalities, such as streaming ETL, tumble/hop/session windows, watermarks, materialized views, CDC and data revision processing, etc. In contrast to pure stream processors, it also stores queryable analytical/row based materialized views within Proton itself for use in analytics dashboards and applications.
2. **Fast.** Timeplus Proton is written in C++, with optimized performance through SIMD. [For example](https://www.timeplus.com/post/scary-fast), on an Apple MacBookPro with M2 Max, Timeplus Proton can deliver 90 million EPS, 4 millisecond end-to-end latency, and high cardinality aggregation with 1 million unique keys.
3. **Lightweight.** Timeplus Proton is a single binary (\<500MB). No JVM or any other dependencies. You can also run it with Docker, or on an AWS t2.nano instance (1 vCPU and 0.5 GiB memory).
4. **Powered by the fast, resource efficient and mature [ClickHouse](https://github.com/clickhouse/clickhouse).** Timeplus Proton extends the historical data, storage, and computing functionality of ClickHouse with stream processing. Thousands of SQL functions are available in Timeplus Proton. Billions of rows are queried in milliseconds.
5. **Best streaming SQL engine for [Kafka](https://kafka.apache.org/), [Redpanda](https://redpanda.com/), or [Pulsar](https://pulsar.apache.org/).** Query the live data in Kafka or other compatible streaming data platforms, with [external streams](/kafka-source).

![Proton Architecture](/img/proton-arch.png)
See our [architecture](/architecture) doc for technical details and our [FAQ](/proton-faq) for more information.

## How is it different from ClickHouse?

ClickHouse is an extremely performant Data Warehouse built for fast analytical queries on large amounts of data. While it does support ingesting data from streaming sources such as Apache Kafka, it is itself not a stream processing engine which can transform and join streaming event data based on time-based semantics to detect patterns that need to be acted upon as soon as it happens. ClickHouse also has incremental materialized view capability but is limited to creating materialized view off of ingestion of blocks to a single table.

Timeplus Proton uses ClickHouse as a table store engine inside of each stream (alongside a Write Ahead Log and other data structures) and uses to unify real-time and historical data together to detect signals in the data. In addition, Timeplus Proton can act as an advanced data pre-processor for ClickHouse (and similar systems) where the bulk of the data preparation and batching is done ahead of ingestion. See [Timeplus and ClickHouse](https://www.timeplus.com/timeplus-and-clickhouse) for more details on this.

## 🎬 Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/vi4Yl6L4_Dw?si=1Ina4LHf9CP6PqO3&amp;start=283" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## ⚡ Deployment

There are multiple ways to install Proton.

### Linux or Mac

Proton can be installed as a single binary on Linux or Mac, via:

```shell
curl https://install.timeplus.com/oss | sh
```

Once the `proton` binary is available, you can run Timeplus Proton in different modes:

- **Local Mode.** You run `proton local` to start it for fast processing on local and remote files using SQL without having to install a full server
- **Config-less Mode.** You run `proton server` to start the server and put the config/logs/data in the current folder `proton-data`. Then use `proton client` in the other terminal to start the SQL client.
- **Server Mode.** You run `sudo proton install` to install the server in predefined path and a default configuration file. Then you can run `sudo proton server -C /etc/proton-server/config.yaml` to start the server and use `proton client` in the other terminal to start the SQL client.

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

### Docker and Docker Compose

```bash
docker run -d --pull always -p 8123:8123 -p 8463:8463 --name proton d.timeplus.com/timeplus-io/proton:latest
```

Please check [Server Ports](/proton-ports) to determine which ports to expose, so that other tools can connect to Timeplus, such as DBeaver.

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

### Kubernetes

The easiest way to deploy Proton on Kubernetes is via Helm package manager.

1. Add the Helm repository

Run the following commands to add the Timeplus Helm repo and list the available charts:

```bash
helm repo add timeplus https://install.timeplus.com/charts
helm repo update
helm search repo timeplus -l
```

You should see the `timeplus/timeplus-proton` chart in the list:

```bash
NAME                        	CHART VERSION	APP VERSION
timeplus/timeplus-enterprise	v10.0.7      	3.0.1
...
timeplus/timeplus-proton    	v1.0.0       	3.0.3
```

2. Prepare your `values.yaml`
   Below is a minimal configuration example you can use to get started. For a full list of available options, see the [Helm chart repo](https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton).

```yaml
resources:
  limits:
    cpu: '4'
    memory: '8Gi'
  requests:
    cpu: '2'
    memory: 4Gi

storage:
  className: <Your storage class name>
  size: 100Gi
  selector: null
```

3. Install Proton using Helm

```bash
export NS=timeplus
export RELEASE=proton
export VERSION=v1.0.0 # or the latest version you want to install

kubectl create ns $NS
helm -n $NS install -f values.yaml $RELEASE timeplus/timeplus-proton --version $VERSION
```

4. Verify the deployment

```bash
# Wait for the Proton pod to start up (this may take a few minutes depending on your cluster):
kubectl -n $NS get pods -w

# Once the pod is running, you can port-forward the service to access Proton locally:
kubectl -n $NS port-forward service/proton-svc 3218

# In another terminal, verify that Proton is responding:
>curl localhost:3218/proton/info
```

If the command returns build information, Proton has been successfully deployed 🎉.

## 🔎 Usage

SQL is the main interface. You can start a new terminal window with `proton client` to start the SQL shell.

:::info
You can also integrate Timeplus Proton with Python/Java/Go SDK, REST API, or BI plugins. Please check [Integration](#integration).
:::

In the `proton client`, you can write SQL to create [External Stream for Kafka](/kafka-source) or [External Table for ClickHouse](/clickhouse-external-table).

You can also run the following SQL to create a stream of random data:

```sql
-- Create a stream with random data
CREATE RANDOM STREAM devices(
  device string default 'device'||to_string(rand()%4),
  temperature float default rand()%1000/10
)
SETTINGS eps=10000 -- 10,000 events per second. Default to 1000
;

-- Run the streaming SQL
SELECT device, count(*), min(temperature), max(temperature)
FROM devices GROUP BY device;
```

You should see data like the following:

```
┌─device──┬─count()─┬─min(temperature)─┬─max(temperature)─┐
│ device0 │    2256 │                0 │             99.6 │
│ device1 │    2260 │              0.1 │             99.7 │
│ device3 │    2259 │              0.3 │             99.9 │
│ device2 │    2225 │              0.2 │             99.8 │
└─────────┴─────────┴──────────────────┴──────────────────┘
```

## ⏩ What's next?

To see more examples of using Timeplus Proton, check out the [examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder.

To access more features, such as sources, sinks, dashboards, alerts, and data lineage, try our [live demo](https://demo.timeplus.cloud) with pre-built live data and dashboards.

## 🧩 Integration {#integration}

The following drivers are available:

- https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
- https://github.com/timeplus-io/proton-go-driver
- https://github.com/timeplus-io/proton-python-driver

Integration with other systems:

- ClickHouse https://docs.timeplus.com/clickhouse-external-table
- [Docker and Testcontainers](/tutorial-testcontainers-java)
- [Sling](/sling)
- Grafana https://github.com/timeplus-io/proton-grafana-source
- Metabase https://github.com/timeplus-io/metabase-proton-driver
- Pulse UI https://github.com/timeplus-io/pulseui/tree/proton
- Homebrew https://github.com/timeplus-io/homebrew-timeplus
- dbt https://github.com/timeplus-io/dbt-proton

## Contributing

We welcome your contributions! If you are looking for issues to work on, try looking at [the issue list](https://github.com/timeplus-io/proton/issues).

Please see the [wiki](https://github.com/timeplus-io/proton/wiki/Contributing) for more details, and [BUILD.md](https://github.com/timeplus-io/proton/blob/develop/BUILD.md) to compile Proton in different platforms.

We also encourage you to join our [Timeplus Community Slack](https://timeplus.com/slack) to ask questions and meet other active contributors from Timeplus and beyond.

## Need help?

Join our [Timeplus Community Slack](https://timeplus.com/slack) to connect with Timeplus engineers and other Timeplus Proton users.

For filing bugs, suggesting improvements, or requesting new features, see the [open issues](https://github.com/timeplus-io/proton/issues) here on GitHub.

## Licensing

Proton uses Apache License 2.0. See details in the [LICENSE](https://github.com/timeplus-io/proton/blob/master/LICENSE).
