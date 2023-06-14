# 从 Pulsar 加载流数据

Apache® PulsarTM 是一个云端、分发、开源消息和流式平台，用于实时工作量。 Recently Timeplus added the first-class integration for Apache Pulsar as both a data source and a data sink.

## 支持的 Pulsar 版本、部署和身份验证

支持 Pulsar 2.9.0 或以上版本。

支持 Apache Pulsar 和 StreamNative 云。

:::info Note 支持StreamNative Cloud

In order to connect to StreamNative Cloud, you will need to set up a service account.

1. Go to the select "Service Accounts" from the navigation panel on the left side (you need to select an instance on the homepage to see the navigation panel).
2. 创建服务帐户，您不需要“超级管理员”权限。 如果您已经有一个，就跳过了。
3. 将主题的读取和/或写入权限 (取决于是否要创建一个源或汇) 到服务帐户 (或您可以拥有两个服务帐户) 一个待阅读，一个待写）。 这可以先选择"主题"，选择一个主题(或创建一个新的主题)，然后点击它。 然后单击"POLICIES "选项卡，然后将服务帐户添加到主题的“授权”列表中。
4. 返回“服务帐户”页面。  选择 Token 或 OAuth2。

:::

有三种支持的身份验证：

* 无。 调用 REST API 时将 `auth_type`设置为空字符串。 This usually works with a local Pulsar for test purposes only.
* OAuth2.  OAuth2.  OAuth2.  调用 REST API 以创建 Pulsar 源时，将 `auth_type`设置为 `oauth2`。 它得到StreamNative Cloud的支持。 在 `auth_params` payload中需要以下参数：
  * 必需的 issuer_url
  * `必须有` 个对象
  * 需要私人密钥
  * 需要 client_id
  * `范围` 是可选的
* 令牌。  调用 REST API 以创建 Pulsar 源时，将 `auth_type`设置为 `token`。  Also need to set the `token` key/value in the  `auth_params` payload. StreamNative Cloud也支持它。

## 源配置

| 名称                             | 类型     | 需要吗？ | 默认      | 描述                                                                                           |
| ------------------------------ | ------ | ---- | ------- | -------------------------------------------------------------------------------------------- |
| 经纪网址                           | string | Y    |         | Pulsar 经纪人的 URL，例如 `pulsar://localhost:6650` 用于不安全的连接， `pulsar+ssl://localhost:6651` 用于安全连接。 |
| 主题                             | string | Y    |         | 主题名称，例如： `持久性主题/tenant/tope` 用于持久性主题， `非永久性主题/tope` 用于非持久性主题。                                |
| 连接超时                           | 持续时间   | N    | `“5”`   | 建立TCP连接超时。                                                                                   |
| tls_allow_pensure_connection | bool   | N    | `false` | 配置是否从 Pulsar 客户端接受不信任的 TLS 证书。                                                               |
| tls_validate_hostname        | bool   | N    | `false` | Configure whether the Pulsar client verifies the validity of the host name from broker.      |
| 开始位置                           | string | N    | `“最新”`  | 配置源来读取来自主题的 `"最早"` 消息或 `"最晚"`                                                                |
| 消息解码器                          | string | N    | `"文本"`  | 配置如何解码消息，要么 `"text"` 或 `"json"`。                                                             |
| 接收队列大小                         | 整数     | N    | `1000`  | 设置消费者接收队列的大小。 使用更高的价值就有可能增加消费量，而牺牲对内存的更大利用。                                                  |
