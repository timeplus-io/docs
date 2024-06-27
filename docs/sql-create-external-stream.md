# CREATE EXTERNAL STREAM

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

- PLAINTEXT: when this option is omitted, this is the default value.
- SASL_SSL: when this value is set, username and password should be specified.
  - If you need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'` New in Proton 1.5.5, you can also put the full content of the pem file as a string in the `ssl_ca_pem` setting if you don't want to, or cannot use a file path, such as on Timeplus Cloud or in Docker/Kubernetes environments.
  - Skipping the SSL certification verification can be done via `SETTINGS skip_ssl_cert_check=true`.

The supported values for `sasl_mechanism` are:

- PLAIN: when you set security_protocol to SASL_SSL, this is the default value for sasl_mechanism.
- SCRAM-SHA-256
- SCRAM-SHA-512

The supported values for `data_format` are:

- JSONEachRow: each Kafka message can be a single JSON document, or each row is a JSON document. [Learn More](#jsoneachrow).
- CSV: less commonly used. [Learn More](#csv).
- ProtobufSingle: for single Protobuf message per Kafka message
- Protobuf: there could be multiple Protobuf messages in a single Kafka message.
- Avro: added in Proton 1.5.2
- RawBLOB: the default value. Read/write Kafka message as plain text.

:::info

For examples to connect to various Kafka API compatitable message platforms, please check [this doc](tutorial-sql-connect-kafka).

:::
