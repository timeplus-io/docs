

# 外部流

You can also create **External Streams** in Timeplus to query data in the external systems without loading the data into Timeplus. 这样做的主要好处是在外部系统（例如：Apache Kafka）中保持一个单一的事实来源，而不是复制它们。 In many cases, this can also achieve even lower latency to process Kafka or Pulsar data, because the data is read directly by Timeplus core engine, without other components, such as Redpanda Connect or [Airbyte](https://airbyte.com/connectors/timeplus).

You can run streaming analytics with the external streams in the similar way as other streams, with [some limitations](/proton-kafka#limitations).

Timeplus supports 3 types of external streams:
* [Kafka 外部流](/proton-kafka)
* [Timeplus External Stream](/timeplus-external-stream), only available in Timeplus Enterprise
* Log External Stream (experimental)
