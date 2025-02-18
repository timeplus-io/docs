# Timeplus Proton

## How to install Proton {#install}

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

You can also install Proton in Docker, Docker Compose or Kubernetes.

```bash
docker run -d --pull always -p 8123:8123 -p 8463:8463 --name proton d.timeplus.com/timeplus-io/proton:latest
```

Please check [Server Ports](/proton-ports) to determine which ports to expose, so that other tools can connect to Timeplus, such as DBeaver.

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

Running the single node Proton via Kubernetes is possible. We recommend you [contact us](mailto:support@timeplus.com) to deploy Timeplus Enterprise for on-prem deployment.

## How to read/write Kafka or Redpanda {#kafka}

You use [External Stream](/proton-kafka) to read from Kafka topics or write data to the topics. We verified the integration with Apache Kafka, Confluent Cloud, Confluent Platform, Redpanda, WarpStream and many more.

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
(<col_name1> <col_type>)
SETTINGS type='kafka', brokers='ip:9092',topic='..',security_protocol='..',
username='..',password='..',sasl_mechanism='..'
```

<iframe width="560" height="315" src="https://www.youtube.com/embed/w_Tr62oKE4E?si=xkrLA60-SZUrrmWL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## How to load data from PostgreSQL/MySQL/ClickHouse {#cdc}

For PostgreSQL, MySQL or other OLTP databases, you can apply the CDC (Change Data Capture) technology to load realtime changes to Proton via Debezium and Kafka/Redpanda. Example configuration at the [cdc folder of proton repo](https://github.com/timeplus-io/proton/tree/develop/examples/cdc). [This blog](https://www.timeplus.com/post/cdc-in-action-with-debezium-and-timeplus) shows the Timeplus Cloud UI but could be applied to Proton too.

<iframe width="560" height="315" src="https://www.youtube.com/embed/j6FpXg5cfsA?si=Mo5UrviidxqkkXSb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

If you have data in local ClickHouse or ClickHouse Cloud, you can also use [External Table](/proton-clickhouse-external-table) to read data.

## How to read/write ClickHouse {#clickhouse}

You use [External Table](/proton-clickhouse-external-table) to read from ClickHouse tables or write data to the ClickHouse tables. We verified the integration with self-hosted ClickHouse, ClickHouse Cloud, Aiven for ClickHouse and many more.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ga_DmCujEpw?si=ja2tmlcCbqa6HhwT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## How to handle UPSERT or DELETE {#upsert}

By default, streams in Timeplus are append-only. But you can create a stream with `versioned_kv` or `changelog_kv` mode to support data mutation or deletion. The [Versioned Stream](/versioned-stream) supports UPSERT (Update or Insert) and [Changelog Stream](/changelog-stream) supports UPSERT and DELETE.

You can use tools like Debezium to send CDC messages to Timeplus, or just use `INSERT` SQL to add data. Values with same primary key(s) will be overwritten. For more details, please check this video:

<iframe width="560" height="315" src="https://www.youtube.com/embed/6iplMdHJUMw?si=LGiBkw6QUjq0RGTL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## How to work with JSON {#json}

Proton supports powerful, yet easy-to-use JSON processing. You can save the entire JSON document as a `raw` column in `string` type. Then use JSON path as the shortcut to access those values as string. For example `raw:a.b.c`. If your data is in int/float/bool or other type, you can also use `::` to convert them. For example `raw:a.b.c::int`. If you want to read JSON documents in Kafka topics, you can choose to read each JSON as a `raw` string, or read each top level key/value pairs as columns. Please check the [doc](/proton-kafka#multi_col_read) for details.

<iframe width="560" height="315" src="https://www.youtube.com/embed/dTKr1-B5clg?si=eaeQ21SjY8JpUXID" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## How to load CSV files {#csv}

If you only need to load a single CSV file, you can create a stream then use the `INSERT INTO .. SELECT .. FROM file(..)` syntax. For example, if there are 3 fields in the CSV file: timestamp, price, volume, you can create the stream via

```sql
CREATE STREAM stream
(
  `timestamp` datetime64(3),
  `price` float64,
  `volume` float64
)
SETTINGS event_time_column = 'timestamp';
```

Please note there will be the 4th column in the stream, which is \_tp_time as the [Event Time](/eventtime).

To import CSV content, use the [file](https://clickhouse.com/docs/en/sql-reference/table-functions/file) table function to set the file path and header and data types.

```sql
INSERT INTO stream (timestamp,price,volume)
SELECT timestamp,price,volume
FROM file('data/my.csv', 'CSV', 'timestamp datetime64(3), price float64, volume float64')
SETTINGS max_insert_threads=8;
```

:::info

Please note:

1. You need to specify the column names. Otherwise `SELECT *` will get 3 columns while there are 4 columns in the data stream.
2. For security reasons, Proton only read files under `proton-data/user_files` folder. If you install proton via `proton install` command on Linux servers, the folder will be `/var/lib/proton/user_files`. If you don't install proton and run proton binary directly via `proton server start`, the folder will be `proton-data/user_files`
3. We recommend to use `max_insert_threads=8` to use multiple threads to maximize the ingestion performance. If your file system has high IOPS, you can create the stream with `SETTINGS shards=3` and set a higher `max_insert_threads` value in the `INSERT` statement.

:::

If you need to import multiple CSV files to a single stream, you can do something similar. You can even add one more column to track the file path.

```sql
CREATE STREAM kraken_all
(
 `path` string,
  `timestamp` datetime64(3),
  `price` float64,
  `volume` float64,
  `_tp_time` datetime64(3, 'UTC') DEFAULT timestamp CODEC(DoubleDelta, LZ4),
  INDEX _tp_time_index _tp_time TYPE minmax GRANULARITY 2
)
ENGINE = Stream(1, 1, rand())
PARTITION BY to_YYYYMM(_tp_time)
ORDER BY to_start_of_hour(_tp_time)
SETTINGS event_time_column = 'timestamp', index_granularity = 8192;

INSERT INTO kraken_all (path,timestamp,price,volume)
SELECT _path,timestamp,price,volume
FROM file('data/*.csv', 'CSV', 'timestamp datetime64(3), price float64, volume float64')
SETTINGS max_insert_threads=8;
```

## How to visualize Timeplus query results with Grafana or Metabase {#bi}

The official Grafana plugin for Timeplus is available [here](https://grafana.com/grafana/plugins/timeplus-proton-datasource/). The source code is at https://github.com/timeplus-io/proton-grafana-source. You can run streaming SQL with the plugin and build live charts in Grafana, without having to refresh the dashboard. Check out [here](https://github.com/timeplus-io/proton/tree/develop/examples/grafana) for sample setup.

<iframe width="560" height="315" src="https://www.youtube.com/embed/cBRl1k9qWZc?si=U30K93FUVMyjUA--" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

We also provide a plugin for Metabase: https://github.com/timeplus-io/metabase-proton-driver This is based on the Proton JDBC driver.

## How to access Timeplus Proton programmatically {#sdk}

SQL is the main interface to work with Proton. The [Ingest REST API](/proton-ingest-api) allows you to push realtime data to Proton with any language.

The following drivers are available:

- https://github.com/timeplus-io/proton-java-driver JDBC and other Java clients
- https://github.com/timeplus-io/proton-go-driver for Golang
- https://github.com/timeplus-io/proton-python-driver for Python
