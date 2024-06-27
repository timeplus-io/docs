# 创建外部流

External stream for Kafka is official supported. The external stream for local log files is at technical preview.

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS type='kafka',
         brokers='ip:9092',
         topic='..',
         security_protocol='..',
         username='..',
         password='..',
         sasl_mechanism='..',
         data_format='..',
         kafka_schema_registry_url='..',
         kafka_schema_registry_credentials='..',
         ssl_ca_cert_file='..',
         ss_ca_pem='..',
         skip_ssl_cert_check=..
```

The supported values for `security_protocol` are:

- 纯文本：省略此选项时，这是默认值。
- SASL_SSL：设置此值时，应指定用户名和密码。
  - If you need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'` New in Proton 1.5.5, you can also put the full content of the pem file as a string in the `ssl_ca_pem` setting if you don't want to, or cannot use a file path, such as on Timeplus Cloud or in Docker/Kubernetes environments.
  - Skipping the SSL certification verification can be done via `SETTINGS skip_ssl_cert_check=true`.

The supported values for `sasl_mechanism` are:

- PLAIN：当你将 security_protocol 设置为 SASL_SSL 时，这是 sasl_mechanmic 的默认值。
- SCRAM-SHA-256
- SCRAM-SHA-512

The supported values for `data_format` are:

- jsoneAchrow：每条 Kafka 消息可以是一个 JSON 文档，也可以每行都是一个 JSON 文档。 [Learn More](#jsoneachrow).
- CSV：不太常用。 [Learn More](#csv).
- protobufSingle：为每条 Kafka 消息提供一条 Protobuf 消息
- Protobuf：一条 Kafka 消息中可能有多条 Protobuf 消息。
- Avro：在 Proton 1.5.2 中添加
- rawBlob：默认值。 以纯文本形式读取/写入 Kafka 消息。

:::info

For examples to connect to various Kafka API compatitable message platforms, please check [this doc](tutorial-sql-connect-kafka).

:::
