# Source

Timeplus integrates with a wide range of systems as data sources, such as Apache Kafka.

You can define one or more sources to set up the background jobs to load data into Timeplus. Please check the [Data Ingestion](/ingestion) section for more details.


## Source API
If you need to call an API to create a source, here are the references.

### stream_generator

a source that generates random data for test

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
| bind   | no | A bool indicates that the subscription should use an existing consumer.  |  |
| ack_wait   | no | The maximum amount of time NATS server should wait for an ack from consumer.  | `30s` |
| max_ack_pending   | no | The maximum number of outstanding acks to be allowed before consuming is halted.  | `1024` |
| data_type      | yes| Specifies the data type to use for creating the stream.   support `json`,`text`,
| tls.disable               | no    | If set to `true`, disables TLS encryption               |`false`|
| tls.skip_verify_server    | no    | If set to `true`, skips server certificate verification when using TLS |`false`|
