# Source

Timeplus integrates with a wide range of systems as data sources, such as Apache Kafka.

You can define one or more sources to set up the background jobs to load data into Timeplus. Please check the [Data Ingestion](ingestion) section for more details.


## Source API
If you need to call an API to create a source, here are the references.

### kafka

refer to [https://kafka.apache.org/](https://kafka.apache.org/)

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| brokers                   | yes  | Specifies the list of broker addresses. This is a comma-separated string. such as `kafka1:9092,kafka2:9092,kafka3:9092`| | |
| topic                     | yes  | Specifies the Kafka topic to connect             | |
| offset                    | yes  | Specifies the Kafka offset configuration.    support `latest,earliest`            ||
| data_type                 | yes| Specifies the data type to use for creating the stream.   support `json`,`text`,`avro`,`debezium-json`,`debezium-json-upsert`     | | |
| group                     | no  | Specifies the Kafka consumer group. use the source uuid with prefix `timeplus-source-` as the default value if user does not specify it                     | `timeplus-source-<uuid>`| 
| sasl                      | no  | Specifies the Simple Authentication and Security Layer (SASL) mechanism for authentication. support `none`,`plain`,`scram-sha-256`,`scram-sha-512` | `none` | |
| username                  | no  | Specifies the username for authentication               ||
| password                  | no  | Specifies the password for authentication               ||
| tls.disable               | no    | If set to `true`, disables TLS encryption               |`false`|
| tls.skip_verify_server    | no    | If set to `true`, skips server certificate verification when using TLS |`false`|
| schema_registry_address   | no  | Specifies the URL of the Schema Registry for Kafka, only applies when the data_type is `avro`      |
| schema_registry_api_key    | no  | Specifies the API key for Schema Registry authentication |
| schema_registry_api_secret | no  | Specifies the API secret for Schema Registry authentication |


### stream_generator

a source that generates randome data for test

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| template    | yes      | Specifies the template used to generate data, support `iot`,`user_logins`,`devops`            |
| interval    | no      | Specifies the event interval. for example `200ms`       | `200ms`|


### websocket

refer to [https://developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| url    | yes      | Specifies the URL of the websocket server url         |
| open_message    | no      |An optional message to send to the server upon connection.             |
| open_message_type     | no    | An optional flag to indicate the data type of open_message.  support `text` `binary`          | `text`
| data_type                 | yes| Specifies the data type to use for creating the stream.   support `json`,`text`,

### nats

refer to [https://docs.nats.io/nats-concepts/what-is-nats](https://docs.nats.io/nats-concepts/what-is-nats)

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| url    | yes      | A list of URLs to connect to. for example `[nats://127.0.0.1:4222]`          |
| subject    | yes      | A subject to consume from. Supports wildcards for consuming multiple subjects.           |
| queue     | no    | An optional queue group to consume as.          |
| nak_delay   | no | An optional delay duration on redelivering a message when negatively acknowledged.  |  |
| prefetch_count | no | The maximum number of messages to pull at a time.  | `524288` |
| data_type      | yes| Specifies the data type to use for creating the stream.   support `json`,`text`,
| tls.disable               | no    | If set to `true`, disables TLS encryption               |`false`|
| tls.skip_verify_server    | no    | If set to `true`, skips server certificate verification when using TLS |`false`|

### nats_jetstream

refer to [https://docs.nats.io/nats-concepts/jetstream](https://docs.nats.io/nats-concepts/jetstream)

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| url    | yes      | A list of URLs to connect to. for example `[nats://127.0.0.1:4222]`          |
| subject    | yes      | A subject to consume from. Supports wildcards for consuming multiple subjects.           |
| queue     | no    | An optional queue group to consume as.          |
| durable   | no | Preserve the state of your consumer under a durable name.  |  |
| stream | no | A stream to consume from. Either a subject or stream must be specified..  |  |
| deliver   | no | Determines which messages to deliver when consuming without a durable subscriber. support `all` `last`  | `all` |
| bind   | no | An bool indicates that the subscription should use an existing consumer.  |  |
| ack_wait   | no | The maximum amount of time NATS server should wait for an ack from consumer.  | `30s` |
| max_ack_pending   | no | The maximum number of outstanding acks to be allowed before consuming is halted.  | `1024` |
| data_type      | yes| Specifies the data type to use for creating the stream.   support `json`,`text`,
| tls.disable               | no    | If set to `true`, disables TLS encryption               |`false`|
| tls.skip_verify_server    | no    | If set to `true`, skips server certificate verification when using TLS |`false`|

### pulsar

refer to [https://pulsar.apache.org/](https://pulsar.apache.org/)

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| topic    | yes      | Specifies the topic of the pulsar to connect to           |
| broker_url    | yes      | Specifies the URL of the broker to connect to            |
| auth_type     | yes    | Specifies the authentication type to use.  support ` `,`oauth2`,`token`           |
| auth_params   | no | Specifies authentication parameters as key-value pairs  | `{}` |


### livepeer

refer to [https://livepeer.org/](https://livepeer.org/)

| Property                | Required    | Description                                               | Default |
|-------------------------|---------|-----------------------------------------------------------|---------|
| interval    | yes      | Specifies the pulling interval to livepeer api. for example `300s`            |
| api_key    | yes      | Specifies the API key of livepeer            |
| data_type    | yes      | Specifies the data type to use for creating the stream.   support `json`,`text`|



### ably

refer to [https://ably.com/](https://ably.com/)

| Property  | Required    | Description                                               | Default |
|-----------|--------|-----------------------------------------------------------|---------|
| api_key    | yes | The `api_key` property is a string used to authenticate and authorize access to the Ably service. It represents the API key associated with the Ably account, which is required for making authenticated requests to Ably's services |
| channel   | yes | The `channel` property specifies the name of the channel to which messages will be sent or from which messages will be received. Channels in Ably are used to group and categorize messages. This property allows you to select the target channel for your interactions |