# Load streaming data from  Pulsar 

Apache® Pulsar™ is a cloud-native, distributed, open source messaging and streaming platform for real-time workloads. Recently Timeplus added the first-class integration for Apache Pulsar as both a data source and a data sink.

## Supported Pulsar Version, Deployment and Authentication

Pulsar 2.9.0 or above is supported.

Both Apache Pulsar and StreamNative Cloud are supported.

:::info Note for StreamNative Cloud support

In order to connect to StreamNative Cloud, you will need to set up a service account. 

1. Go to the select "Service Accounts" from the navigation panel on the left side (you need to select an instance on the homepage to see the navigation panel).
2. Create a service account, you don't need "Super Admin" permission. Skip if you have one already.
3. Assign read and/or write permissions (depends on if you want to create a source or a sink) of a topic to the service account (or you can have two service accounts, one for read, one for write). This can be done by first, select "Topics", pick one topic (or create a new one) you want to use, click it. And then click the "POLICIES" tab, and add the service account to the topic's "Authorization" list.
4. Go back to the "Service Accounts" page.  Choose either Token or OAuth2.

:::

There are 3 types of supported authentications:

* None. Set the `auth_type`to an empty string while calling the REST API. This usually works with a local Pulsar for test purposes only.
* OAuth2.  Set the `auth_type`to `oauth2` while calling the REST API to create the Pulsar source. It is supported by StreamNative Cloud. The following parameters are expected in the `auth_params` payload:
  * `issuer_url` required
  * `audience` required
  * `private_key` required
  * `client_id` required
  * `scope` this is optional
* Token.  Set the `auth_type`to `token` while calling the REST API to create the Pulsar source.  Also need to set the `token` key/value in the  `auth_params` payload. It is also supported by StreamNative Cloud.

## Source configuration 

| name                          | type     | required? | default | description                                                  |
| ----------------------------- | -------- | --------- | ------- | ------------------------------------------------------------ |
| broker_url                    | string   | Y         |         | The URL of the Pulsar broker, e.g. `pulsar://localhost:6650` for insecure connection, `pulsar+ssl://localhost:6651` for secure connection. |
| topic                         | string   | Y         |         | The topic name, e.g. `persistent://ns/tenant/topic` for persistent topic, `non-perisistent://ns/tenant/topic` for non-persistent topic. |
| connection_timeout            | duration | N         | `"5s"`  | Timeout for the establishment of a TCP connection.           |
| tls_allow_insecure_connection | bool     | N         | `false` | Configure whether the Pulsar client accept untrusted TLS certificate from broker. |
| tls_validate_hostname         | bool     | N         | `false` | Configure whether the Pulsar client verifies the validity of the host name from broker. |
|start_position|string|N|`"latest"`|Configure the source to read from the `"earliest"` message from the topic or the `"latest"`.|
|message_decoder|string|N|`"text"`|Configure how the source should decode messages, either `"text"` or `"json"`.|
|ReceiverQueueSize|int|N|`1000`|Sets the size of the consumer receive queue. Using a higher value could potentially increase the consumer throughput at the expense of bigger memory utilization.|
