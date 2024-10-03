# 数据源

Timeplus与各种系统相结合，作为数据来源，例如Apache Kafka。

您可以定义一个或多个源来设置后台任务将数据加载到Timeplus中。 Please check the [Data Ingestion](/ingestion) section for more details.


## API 数据源
如果您需要调用 API 来创建数据源，以下是参考资料。

### stream_generator

生成用于测试的随机数据的源

| 属性       | 必填项 | 描述                                         | 默认值     |
| -------- | --- | ------------------------------------------ | ------- |
| template | yes | 指定用于生成数据的模板，支持`iot`，`user_logins`，`devops` |         |
| 间隔       | no  | 指定事件间隔。 例如：`200ms`                         | `200ms` |


### 网络套接字

请参阅 [https://developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

| 属性                  | 必填项 | 描述                                    | 默认值    |
| ------------------- | --- | ------------------------------------- | ------ |
| url                 | yes | 指定 websocket 服务器网址的 URL               |        |
| 打开消息                | no  | 连接时发送给服务器的可选消息。                       |        |
| open_message_type | no  | 指定用于创建流的数据类型。  support `json`,`text`, | `text` |
| data_type           | yes | 指定用于创建流的数据类型。   支持 `json`,`文本`,       |        |

### nats

请参阅 [https://docs.nats.io/nats-concepts/what-is-nats](https://docs.nats.io/nats-concepts/what-is-nats)

| 属性                       | 必填项 | 描述                                                                                    | 默认值      |
| ------------------------ | --- | ------------------------------------------------------------------------------------- | -------- |
| url                      | yes | 要连接的 URL 列表。例如 `[nats: //127.0.0. 1:4222]`                                            |          |
| 主题                       | yes | 可从中食用。 A subject to consume from. Supports wildcards for consuming multiple subjects. |          |
| 排队                       | no  | 可选队列组，可用作使用。                                                                          |          |
| nak_delay                | no  | 在被否定确认后重新传送消息时可选的延迟时间。                                                                |          |
| prefetch_count           | no  | 一次提取的最大消息数。                                                                           | `524288` |
| data_type                | yes | 指定用于创建流的数据类型。   支持 `json`,`文本`,                                                       |          |
| tls.disable              | no  | 如果设置为`true`，则禁用 TLS 加密                                                                | `false`  |
| tls.skip_verify_server | no  | 如果设置为`true`，则在使用 TLS 时会跳过服务器证书验证                                                      | `false`  |

### nats_jetstream

请参阅 [https://docs.nats.io/nats-concepts/jetstream](https://docs.nats.io/nats-concepts/jetstream)

| 属性                       | 必填项 | 描述                                                                                                                  | 默认值     |
| ------------------------ | --- | ------------------------------------------------------------------------------------------------------------------- | ------- |
| url                      | yes | 要连接的 URL 列表。例如 `[nats: //127.0.0. 1:4222]`                                                                          |         |
| 主题                       | yes | 可从中食用。 A subject to consume from. Supports wildcards for consuming multiple subjects.                               |         |
| 排队                       | no  | 可选队列组，可用作使用。                                                                                                        |         |
| 耐用的                      | no  | 使用耐用的名称保留消费者的状态。                                                                                                    |         |
| 流 Stream                 | no  | 可供消费的流。 A stream to consume from. Either a subject or stream must be specified..                                    |         |
| 配送                       | no  | Determines which messages to deliver when consuming without a durable subscriber. support `all` `last` 支持 `全部` `最后` | `所有`    |
| 捆绑                       | no  | 布尔值表示订阅应使用现有消费者。                                                                                                    |         |
| ack_wait                 | no  | NATS 服务器等待消费者回复的最大时间。                                                                                               | `30 秒`  |
| max_ack_pending        | no  | 停止消耗之前允许的最大未完成 ack 数量。                                                                                              | `1024`  |
| data_type                | yes | 指定用于创建流的数据类型。   支持`json`，`text`                                                                                     |         |
| tls.disable              | no  | 如果设置为`true`，则禁用 TLS 加密                                                                                              | `false` |
| tls.skip_verify_server | no  | 如果设置为`true`，则在使用 TLS 时会跳过服务器证书验证                                                                                    | `false` |
