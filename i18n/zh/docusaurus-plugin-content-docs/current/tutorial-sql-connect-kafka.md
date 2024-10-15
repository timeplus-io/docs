# Connect to Kafka, Confluent, Redpanda, Aiven, etc.

### 连接到本地 Kafka 或 Redpanda {#connect-kafka}

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

### 连接到 Confluent Cloud{#connect-confluent}

示例：

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka',
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='github_events',
         security_protocol='SASL_SSL',
         username='..',
         password='..'
```

### 连接到 Redpanda Cloud{#connect-rp-cloud}

示例：

```sql
CREATE EXTERNAL STREAM hello(raw string)
SETTINGS type='kafka',
         brokers='abc.any.us-east-1.mpx.prd.cloud.redpanda.com:9092',
         topic='hello-world',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='..',
         password='..'
```

### 连接到 Apache Kafka 版 Aiven{#connect-aiven}

你可以将 Proton 与 Aiven for Apache Kafka 服务连接起来。

示例：

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='..',
         ssl_ca_cert_file='/kafka.cert'
```

确保可以通过 Proton 访问 ssl_ca_cert_file。 你可以通过以下方式做到这一点：

```bash
chown timeplus: timeplus kafka.cert
chmod 400 kafka.cert
```

或者，您可以将 CA pem 文件的全部内容放入 DDL SQL 中。 这可以帮助你与Kafka经纪人建立安全连接，Kafka代理使用由Proton不知道的CA证书签名的证书。 当你无法设置本地文件路径或者不想挂载或修改文件（例如使用Docker或Kubernetes或在Timeplus Cloud中）时，你可能需要将CA内容内联。

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='..',
         ssl_ca_pem='-----BEGIN CERTIFICATE----\nMIIEQTCCAqmgAwIBAgIU..ph0szPew==\n-----END CERTIFICATE-----'
```

如果你想跳过验证 CA（不推荐），你可以通过以下方式创建外部流：

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='..',
         skip_ssl_cert_check=true
```

### 连接到 WarpStream{#connect-warp}

你可以将 Proton 与 WarpStream 或 WarpStream Serverless Cloud 的本地部署连接起来。

示例：

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='serverless.warpstream.com:9092',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='PLAIN',
         username='..',
         password='..'
```

sasl_mechanism 可以是 PLAIN 或 SCRAM-SHA-512，但不能是 SCRAM-SHA-256。
