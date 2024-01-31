# How-to Guides

Follow the compact guides that help you work with common Proton functionality.

## How to install Proton {#install}

Proton can be installed as a single binary on Linux or Mac, via:

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

You can also install Proton in Docker, Docker Compose or Kubernetes.

```bash
docker run -d --pull always --name proton ghcr.io/timeplus-io/proton:latest
```

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

You can also try Proton in the fully-managed [Timeplus Cloud](https://us.timeplus.cloud/).

## How to read/write Kafka or Redpanda {#kafka}

You use [External Stream](proton-kafka) to read from Kafka topics or write data to the topics. We verified the integration with Apache Kafka, Confluent Cloud, Confluent Platform, Redpanda, WarpStream, Upstash and many more.

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..',username='..',password='..',sasl_mechanism='..'
```



<iframe width="560" height="315" src="https://www.youtube.com/embed/w_Tr62oKE4E?si=xkrLA60-SZUrrmWL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## How to load data from PostgreSQL/MySQL/ClickHouse {#cdc}

For PostgreSQL, MySQL or other OLTP databases, you can apply the CDC (Change Data Capture) technology to load realtime changes to Proton via Debezium and Kafka/Redpanda. Example configuration at the [cdc folder of proton repo](https://github.com/timeplus-io/proton/tree/develop/examples/cdc). [This blog](https://www.timeplus.com/post/cdc-in-action-with-debezium-and-timeplus) shows the Timeplus Cloud UI but could be applied to Proton too.

<iframe width="560" height="315" src="https://www.youtube.com/embed/j6FpXg5cfsA?si=Mo5UrviidxqkkXSb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

If you have data in local ClickHouse or ClickHouse Cloud, you can also use [External Table](proton-clickhouse-external-table) to read data.

## How to read/write ClickHouse {#clickhouse}

(coming soon) You use External Table to read from ClickHouse tables or write data to the tables. We verified the integration with self-hosted ClickHouse, ClickHouse Cloud, Aiven for ClickHouse and many more.

## How to work with JSON {#json}

Proton supports powerful, yet easy-to-use JSON processing. You can save the entire JSON document as a `raw` column in `string` type. Then use JSON path as the shortcut to access those values as string. For example `raw:a.b.c`. If your data is in int/float/bool or other type, you can also use `::` to convert them. For example `raw:a.b.c::int`. If you want to read JSON documents in Kafka topics, you can choose to read each JSON as a `raw` string, or read each top level key/value pairs as columns. Please check the [doc](proton-kafka#multi_col_read) for details.

<iframe width="560" height="315" src="https://www.youtube.com/embed/dTKr1-B5clg?si=eaeQ21SjY8JpUXID" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## How to visualize Proton query results with Grafana or Metabase {#bi}

The offical Grafana plugin for Proton is available on https://grafana.com/grafana/plugins/timeplus-proton-datasource/ The source code is at https://github.com/timeplus-io/proton-grafana-source. You can run streaming SQL with the plugin and build live charts in Grafana, without having to refresh the dashboard. Check out https://github.com/timeplus-io/proton/tree/develop/examples/grafana for sample setup.

<iframe width="560" height="315" src="https://www.youtube.com/embed/cBRl1k9qWZc?si=U30K93FUVMyjUA--" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

We also provide a plugin for Metabase: https://github.com/timeplus-io/metabase-proton-driver This is based on the Proton JDBC driver.

## How to access Proton programmatically {#sdk} 

SQL is the main interface to work with Proton. The [Ingest REST API](proton-ingest-api) allows you to push realtime data to Proton with any language. 

The following drivers are available:

* https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
* https://github.com/timeplus-io/proton-go-driver for Golang
* https://github.com/timeplus-io/proton-python-driver for Python
