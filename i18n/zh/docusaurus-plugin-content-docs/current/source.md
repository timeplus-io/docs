# 数据源

Timeplus与各种系统相结合，作为数据来源，例如Apache Kafka。

您可以定义一个或多个源来设置后台任务将数据加载到Timeplus中。 更多详情请检查 [数据导入](ingestion) 部分。


## Source API
If you need to call an API to create a source, here are the references.

### kafka

请参考 [https://kafka.apache.org/](https://kafka.apache.org/)

| 属性                           | 必填项 | 描述                                                                                                                                                 | 默认值                            |
| ---------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| brokers                      | yes | 指定broker地址列表。 这是一个以逗号分隔的字符串。 例如`kafka1:9092,kafka2:9092,kafka3:9092`                                                                               | |                              |
| 主题                           | yes | Specifies the Kafka topic to connect                                                                                                               |                                |
| offset                       | yes | Specifies the Kafka offset configuration.    support `latest,earliest`                                                                             |                                |
| 数据类型                         | yes | 指定用于创建流的数据类型。   support `json`,`text`,`avro`,`debezium-json`,`debezium-json-upsert`                                                                | |                              |
| group                        | no  | Specifies the Kafka consumer group. use the source uuid with prefix `timeplus-source-` as the default value if user does not specify it            | `timeplus-source-<uuid>` |
| sasl                         | no  | Specifies the Simple Authentication and Security Layer (SASL) mechanism for authentication. support `none`,`plain`,`scram-sha-256`,`scram-sha-512` | `none` |                       |
| username                     | no  | Specifies the username for authentication                                                                                                          |                                |
| password                     | no  | Specifies the password for authentication                                                                                                          |                                |
| tls.disable                  | no  | If set to `true`, disables TLS encryption                                                                                                          | `false`                        |
| tls.skip_verify_server     | no  | If set to `true`, skips server certificate verification when using TLS                                                                             | `false`                        |
| schema_registry_address    | no  | Specifies the URL of the Schema Registry for Kafka, only applies when the data_type is `avro`                                                      |                                |
| schema_registry_api_key    | no  | Specifies the API key for Schema Registry authentication                                                                                           |                                |
| schema_registry_api_secret | no  | Specifies the API secret for Schema Registry authentication                                                                                        |                                |


### stream_generator

a source that generates randome data for test

| 属性       | 必填项 | 描述                                                                                 | 默认值     |
| -------- | --- | ---------------------------------------------------------------------------------- | ------- |
| template | yes | Specifies the template used to generate data, support `iot`,`user_logins`,`devops` |         |
| 间隔       | no  | Specifies the event interval. for example `200ms`                                  | `200ms` |


### pulsar

refer to [https://pulsar.apache.org/](https://pulsar.apache.org/)

| 属性          | 必填项 | 描述                                                                     | 默认值  |
| ----------- | --- | ---------------------------------------------------------------------- | ---- |
| 主题          | yes | Specifies the topic of the pulsar to connect to                        |      |
| 经纪网址        | yes | Specifies the URL of the broker to connect to                          |      |
| auth_type   | yes | Specifies the authentication type to use.  support ``,`oauth2`,`token` |      |
| auth_params | no  | Specifies authentication parameters as key-value pairs                 | `{}` |


### livepeer

refer to [https://livepeer.org/](https://livepeer.org/)

| 属性      | 必填项 | 描述                                                                 | 默认值 |
| ------- | --- | ------------------------------------------------------------------ | --- |
| 间隔      | yes | Specifies the pulling interval to livepeer api. for example `300s` |     |
| api_key | yes | Specifies the API key of livepeer                                  |     |
| 数据类型    | yes | 指定用于创建流的数据类型。   support `json`,`text`                              |     |



### ably

refer to [https://ably.com/](https://ably.com/)

| 属性      | 必填项 | 描述                                                                                                                                                                                                                                                                       | 默认值 |
| ------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| api_key | yes | The `api_key` property is a string used to authenticate and authorize access to the Ably service. It represents the API key associated with the Ably account, which is required for making authenticated requests to Ably's services                                     |     |
| channel | yes | The `channel` property specifies the name of the channel to which messages will be sent or from which messages will be received. Channels in Ably are used to group and categorize messages. This property allows you to select the target channel for your interactions |     |