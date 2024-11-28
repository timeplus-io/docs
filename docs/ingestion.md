# Getting Data In

Timeplus supports multiple ways to load data into the system, or access the external data without copying them in Timeplus:

- [External Stream for Apache Kafka](/external-stream), Confluent, Redpanda, and other Kafka API compatible data streaming platform. This feature is also available in Timeplus Proton.
- [External Stream for Apache Pulsar](/pulsar-external-stream) is available in Timeplus Enterprise 2.5 and above.
- Source for extra wide range of data sources. This is only available in Timeplus Enterprise. This integrates with [Redpanda Connect](https://redpanda.com/connect), supporting 200+ connectors.
- On Timeplus web console, you can also [upload CSV files](#csv) and import them into streams.
- For Timeplus Enterprise, [REST API](/ingest-api) and SDKs are provided to push data to Timeplus programmatically.
- On top of the REST API and SDKs, Timeplus Enterprise adds integrations with [Kafka Connect](/kafka-connect), [AirByte](https://airbyte.com/connectors/timeplus), [Sling](/sling), and seatunnel.
- Last but not the least, if you are not ready to load your real data into Timeplus, or just want to play with the system, you can use the web console to [create sample streaming data](#streamgen), or [use SQL to create random streams](/proton-create-stream#create-random-stream).

## Add new data via web console

Choose "Data Collection" from the navigation menu to setup data access to other systems. There are two categories:
* Timeplus Connect: directly supported by Timeplus Inc, with easy-to-use setup wizards.
  * Demo Stream: generate random data for various use cases
  * Timeplus: read data from another Timeplus deployment
  * Apache Kafka: setup external streams to read from Apache Kafka
  * Confluent Cloud: setup external streams to read from Confluent Cloud
  * Redpandan: setup external streams to read from Redpanda
  * Apache Pulsar: setup external streams to read from Apache Pulsar
  * ClickHouse: setup external tables to read from ClickHouse, without duplicating data in Timeplus
  * NATS: load data from NATS to Timeplus streams
  * WebSocket: load data from WebSocket to Timeplus streams
  * HTTP Stream: load data from HTTP stream to Timeplus streams
  * Coinbase Exchange: connect to the Coinbase Exchange via WebSocket and load data into Timeplus streams
  * CSV: choose a CSV file and send to Timeplus
  * Stream Ingestion: a wizard to guide you to push data to Timeplus via Ingest REST API
* Redpanda Connect: available since Timeplus Enterprise 2.5 or above. Set up data access to other systems by editing a YAML file. Powered by Redpanda Connect, supported by Redpanda Data Inc. or Redpanda Community.



### Load streaming data from Apache Kafka {#kafka}

As of today, Kafka is the primary data integration for Timeplus. With our strong partnership with Confluent, you can load your real-time data from Confluent Cloud, Confluent Platform, or Apache Kafka into the Timeplus streaming engine. You can also create [external streams](/external-stream) to analyze data in Confluent/Kafka/Redpanda without moving data.

[Learn more.](/kafka-source)

### Load streaming data from Apache Pulsar {#pulsar}

Apache® Pulsar™ is a cloud-native, distributed, open source messaging and streaming platform for real-time workloads. Timeplus added the integration for Apache Pulsar as both a data source and a data sink.

[Learn more.](/pulsar-source)

### Upload local files {#csv}

If you have some static dataset or lookup tables in the CSV format, you can upload the files directly to Timeplus.

1. Click the **Add Data** from the navigation menu. Then click **Import from CSV** button
2. Drag and drop a CSV file from your local file system to upload the file. (COMING SOON: if your file is downloadable from a URL or S3 bucket, you can create a source to have Timeplus server to load it. File formats other than CSV will be supported too.)
3. Choose whether the first row of the file is the column header.
4. Specify a name for the stream, and optionally provide a readable description.
5. Click the button to start uploading data and click the **View Imported Data** button to run a query to review imported data.

### Load sample streaming data {#streamgen}

If you are not ready to load your real data into Timeplus, or just want to play with the system, you can use this feature to load some sampling streaming data. We provide 3 typical streaming data.

1. `iot` will generate data for 3 devices(device_0, device_1 and device_2). The `number` value can be anything between 0 to 100. The `time` column is when the event is generated.
2. `user_logins` will generate data for 2 users(user1 and user2), from 2 possible `city` values: Shanghai or Beijing. The `time` column is when the event is generated.
3. `devops` will generate data for 3 `hostname`(host_0,host_1, and host_2), from 3 possible `region`(eu-central-1, us-west-1, and sa-east-1), 3 possible `rack`(1,2,3), a number `usage_user` from 0 to 100, `usage_system` from 0 to 100, and `time` column for the event time.

You can load such sample data via the **Add Data** button and the **Sample Dataset** option. You can create new streams or choose existing streams for the data.

## Push data to Timeplus via REST or SDK {#push}

Timeplus provides ingestion REST API, and related SDKs in different programming languages. Developers can leverage those REST API or SDK to push real-time data to Timeplus.

[Learn more.](/ingest-api)

## Load other data into Timeplus via 3rd party tools

Timeplus works with the data ecosystems and can leverage various tools to load data or even do data transformation at ingestion time.

### Airbyte

AirByte provides both OSS version and managed cloud to collect data, transform data and send to other destinations.

At the high level

1. AirByte can grab data from many different data sources, including database/CDC, or infrastructure log, application logs, or even business apps(such as Salesforce)
2. The data can be normalized via AirByte built-in capabilities. Or it can be saved to the destination database first, then relies on dbt or other tools to apply transformations/materialization.
3. Data collected by AirByte can be sent to many destinations, including Timeplus.

Just name a few data sources from Airbyte:

- App marketplace such as Apple App Store
- AWS Cloudtrail
- Google BigQuery
- Load file from S3/GCS/SFTP/local with Gzip/Zip/xz/Snappy compression, in CSV/JSON/XML/Excel/Parquet/etc
- Github, GitLab, or JIRA activities
- Google Ads
- Instagram social media
- Slack or Microsoft Teams
- PostgreSQL, RedShift, Snowflake, MongoDB, MySQL, Microsoft SQL Server, etc

### Kafka Connectors

You can use Kafka Connectors to load data from popular data sources into Confluent Cloud, Confluent Platform, or Apache Kafka, then use Timeplus to load them into streams via the built-in Kafka Source.

There are a few examples of data sources that can be ingested into Timeplus via Kafka Connectors. Please check https://www.confluent.io/product/confluent-connectors/ for more details.

- Apache ActiveMQ
- Amazon CloudWatch Logs
- [Amazon Kinesis](#kinesis)
- Amazon S3
- Amazon SQS
- Azure Blob Storage
- Azure Event Hubs
- CockroachDB CDC
- Databricks
- Github
- Google Cloud Pub/Sub
- IBM MQ
- InfluxDB
- JDBC
- Microsoft SQL Server
- MongoDB
- MQTT
- MySQL CDC
- Neo4j
- Oracle Database
- PostgreSQL CDC
- RabbitMQ
- Salesforce
- ServiceNow
- SFTP
- SNMP
- Splunk
- TiDB CDC
- Tigergraph
- Zendesk


### Sling {#sling}

Sling is an [open source](https://slingdata.io/) is a powerful data integration CLI tool. Whether ingesting CSV or JSON files, transferring data between databases, or exporting a custom SQL query to a Parquet file — Sling is the solution that empowers you to achieve it effortlessly.

Since from v1.2.14, Sling adds built-in support for Timeplus. You just need a single binary for your OS to load any data to Timeplus, with a simple command such as:

```bash
cat my_file.csv | sling run --tgt-conn TIMEPLUS --tgt-object default.my_stream
```

[Learn more.](/sling)
