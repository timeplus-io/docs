

# External Stream

You can also create **external streams** in Timeplus to query data in the external systems without loading the data into Timeplus. The main benefit for doing so is to keep a single source of truth in the external systems (e.g. Apache Kafka), without duplicating them. In many cases, this can also achieve even lower latency to process Kafka data, because the data is read by Timeplus, without other components.

You can run streaming analytics with the external streams in the similar way as other streams, with some limitations.

Timeplus supports 3 types of external streams:
* [Kafka External Stream](/proton-kafka)
* [Timeplus External Stream](/timeplus-external-stream), only available in Timeplus Enterprise
* Log External Stream (experimental)
