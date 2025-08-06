# External Stream

You can create **External Streams** in Timeplus to query data in the external systems without loading the data into Timeplus. The main benefit for doing so is to keep a single source of truth in the external systems (e.g. Apache Kafka), without duplicating them. In many cases, this can also achieve even lower latency to process Kafka or Pulsar data, because the data is read directly by Timeplus core engine, without other components, such as Redpanda Connect or [Airbyte](https://airbyte.com/connectors/timeplus).

You can run streaming analytics with the external streams in the similar way as other streams.

Timeplus supports 4 types of external streams:
* [Kafka External Stream](/proton-kafka)
* [Pulsar External Stream](/pulsar-external-stream)
* [Timeplus External Stream](/timeplus-external-stream), only available in Timeplus Enterprise
* [Log External Stream](/log-stream) (experimental)

Besides external streams, Timeplus also provides external tables to query data in ClickHouse, MySQL, Postgres or S3/Iceberg. The difference of external tables and external streams is that external tables are not real-time, and they are not designed for streaming analytics. You can use external tables to query data in the external systems, but you cannot run streaming SQL on them. [Learn more about external tables](/proton-clickhouse-external-table).
