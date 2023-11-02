# 数据源

Timeplus与各种系统相结合，作为数据来源，例如Apache Kafka。

您可以定义一个或多个源来设置后台任务将数据加载到Timeplus中。 更多详情请检查 [数据导入](ingestion) 部分。


## API 数据源
如果您需要调用 API 来创建数据源，以下是参考资料。

### kafka

请参考 [https://kafka.apache.org/](https://kafka.apache.org/)

| 属性                           | 必填项 | 描述                                                                            | 默认值                            |
| ---------------------------- | --- | ----------------------------------------------------------------------------- | ------------------------------ |
| brokers                      | yes | 指定broker地址列表。 这是一个以逗号分隔的字符串。 例如`kafka1:9092,kafka2:9092,kafka3:9092`          | |                              |
| 主题                           | yes | 指定要连接的Kafka主题                                                                 |                                |
| offset                       | yes | 指定Kafka offset配置。    支持`latest,earliest`                                      |                                |
| data_type                    | yes | 指定用于创建流的数据类型。   支持`json`，`text`，`avro`，`debezium-json`，`debezium-json-upsert` | |                              |
| group                        | no  | 指定Kafka消费者组。 如果用户未指定，则使用带有`timeplus-source`前缀的源uuid作为默认值                      | `timeplus-source-<uuid>` |
| sasl                         | no  | 指定用于简单身份验证和安全层（SASL）的认证机制。 支持`none`，`plain`，`scram-sha-256`，`scram-sha-512`   | `none` |                       |
| 用户名                          | no  | 指定用于身份验证的用户名                                                                  |                                |
| 密码                           | no  | 指定用于身份验证的密码                                                                   |                                |
| tls.disable                  | no  | 如果设置为`true`，则禁用 TLS 加密                                                        | `false`                        |
| tls.skip_verify_server     | no  | 如果设置为`true`，则在使用 TLS 时会跳过服务器证书验证                                              | `false`                        |
| schema_registry_address    | no  | 为Kafka指定架构注册表的URL，仅在data_type为`avro`时适用                                       |                                |
| schema_registry_api_key    | no  | 为架构注册表身份验证指定API密钥                                                             |                                |
| schema_registry_api_secret | no  | 为架构注册表身份验证指定API密钥                                                             |                                |


### stream_generator

生成随机数据以供测试的数据源

| 属性       | 必填项 | 描述                                         | 默认值     |
| -------- | --- | ------------------------------------------ | ------- |
| template | yes | 指定用于生成数据的模板，支持`iot`，`user_logins`，`devops` |         |
| 间隔       | no  | 指定事件间隔。 例如：`200ms`                         | `200ms` |


### pulsar

请参考[https://pulsar.apache.org/](https://pulsar.apache.org/)

| 属性          | 必填项 | 描述                                   | 默认值  |
| ----------- | --- | ------------------------------------ | ---- |
| 主题          | yes | 指定要连接的pulsar的主题                      |      |
| 经纪网址        | yes | 指定要连接的broker URL                     |      |
| auth_type   | yes | 指定要使用的身份验证类型。  支持``，`oauth2`，`token` |      |
| auth_params | no  | 将身份验证参数指定为键值对                        | `{}` |


### livepeer

refer to [https://livepeer.org/](https://livepeer.org/)

| 属性        | 必填项 | 描述                                                                 | 默认值 |
| --------- | --- | ------------------------------------------------------------------ | --- |
| 间隔        | yes | Specifies the pulling interval to livepeer api. for example `300s` |     |
| api_key   | yes | Specifies the API key of livepeer                                  |     |
| data_type | yes | 指定用于创建流的数据类型。   support `json`,`text`                              |     |



### ably

refer to [https://ably.com/](https://ably.com/)

| 属性      | 必填项 | 描述                                                                                                                                                                                                                                                                       | 默认值 |
| ------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| api_key | yes | The `api_key` property is a string used to authenticate and authorize access to the Ably service. It represents the API key associated with the Ably account, which is required for making authenticated requests to Ably's services                                     |     |
| channel | yes | The `channel` property specifies the name of the channel to which messages will be sent or from which messages will be received. Channels in Ably are used to group and categorize messages. This property allows you to select the target channel for your interactions |     |