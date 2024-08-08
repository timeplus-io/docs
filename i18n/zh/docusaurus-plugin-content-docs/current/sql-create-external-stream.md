# 创建外部流

External stream for Kafka is official supported. The external stream for local log files is at technical preview. In Timeplus Enterprise, it also supports [another type of External Stream](timeplus-external-stream) to read/write data for a remote Timeplus Enterprise.

## Kafka 外部流

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

## Timeplus External Stream

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS
    type = 'timeplus',
    hosts = '<ip_or_host_of_timeplusd>',
    db = 'default',
    user = '<user>',
    password = '<password>',
    secure = <bool>,
    stream = '<stream_name>'
```

Settings:

- **hosts**: the IP or host for the remote timeplusd. When you set a set of hosts with ports, e.g. 'host1:port1,host2:port2', this will treat each host as a shard. `hosts` is required and there is no default value.
- **db**: the database name in the remote Timeplusd. The default value is 'default'.
- **user**: the user name for the remote Timeplusd. The default value is 'default'.
- **password**: the password for the remote Timeplusd. The default value is an empty string.
- **secure**: a bool for whether to use secure connection to the remote Timeplusd. The default value is false. Use port 9440 when `secure` is set to true, otherwise use port 8463.
- **stream**: the stream name in the remote Timeplusd. It's required and there is no default value.

### 子查询

#### Migrate data from Timeplus Proton to Timeplus Enterprise

If you have deployed [Timeplus Proton](https://github.com/timeplus-io/proton) and want to load those data to a Timeplus Enterprise deployment, you cannot upgrade in place. You can use the Timeplus External Stream to migrate data.
:::info
The Timeplus Proton need to be 1.5.15 or above.
:::

For example, there is a stream `streamA` in Timeplus Proton, running on host1.

In your Timeplus Enterprise, you can create the stream with the same name and same schema. Then use a materialized view to load all data from Timeplus Proton to Timeplus Enterprise.

```sql
CREATE STREAM streamA(..);

CREATE EXTERNAL STREAM streama_proton
SETTINGS type='timeplus',hosts='host1',stream='streamA';

CREATE MATERIALIZED VIEW proton_to_tp_enterprise INTO streamA
AS SELECT * FROM streama_proton WHERE _tp_time>earliest_ts();
```

When all data in Proton has been imported into Timeplus Enterprise, you can drop the materialized view.

#### Upload data from edge server to the cloud

If you deploy Timeplus Proton or Timeplus Enterprise at edge servers, it can collect and process live data with high performance and low footprint. The important data can be uploaded to the other Timeplus Enterprise in the cloud when the internet is available.

For example, on the edge server, you collect the real-time web access log and only want to upload error logs to the server.

```sql
CREATE EXTERNAL STREAM stream_in_cloud
SETTINGS type='timeplus',hosts='cloud1',stream='..';

CREATE MATERIALIZED VIEW edge_to_cloud INTO stream_in_cloud
AS SELECT * FROM local_stream WHERE http_code>=400;
```

When the network is not available, you can pause the materialized view by:

```sql
SYSTEM PAUSE MATERIALIZED VIEW edge_to_cloud;
```

When the network is restored, you can resume it:

```sql
SYSTEM UNPAUSE MATERIALIZED VIEW edge_to_cloud;
```

### 限制

This is a relatively new feature. There are some known limitations which we plan to improve later on.

- [table function](functions_for_streaming#table) is not supported. In order to query all or part of the historical data, you can start a streaming query with `WHERE _tp_time>earliest_ts()` or `WHERE _tp_time>now()-2d`.
- [window functions](functions_for_streaming) like tumble/hop are not working yet.
- can't read virtual columns on remote streams.
