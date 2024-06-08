# 连接 Kafka、Confluent、Redpanda、Aiven、WarpStream、Upstash 等

### 连接到本地 Kafka 或 Redpanda {#connect-kafka}

示例：

```sql
创建外部流 ext_github_events（原始字符串）
设置类型='kafka'， 
         brokers='localhost: 9092'，
         topic='github_events'
```

### 连接到 Confluent Cloud{#connect-confluent}

示例：

```sql
创建外部直播 ext_github_events（原始字符串）
设置类型='kafka'， 
         brokers='pkc-1234.us-west-2.aws.confluent.cloud: 9092'，
         topic='github_events'，
         security_protocol='sasl_SSL'， 
         username='..'， 
         password='..'
```

### 连接到 Redpanda Cloud{#connect-rp-cloud}

示例：

```sql
创建外部直播你好（原始字符串）
设置类型='kafka'， 
         brokers='abc.any.us-east-1.mpx.prd.cloud.redpanda.com: 9092'，
         topic='hello-world'，
         security_protocol='sasl_SSL'， 
         sasl_Mechanism='scram-SHA-256'，
         username='..'， 
         password='..'
```

### 连接到 Apache Kafka 版 Aiven{#connect-aiven}

你可以将 Proton 与 Aiven for Apache Kafka 服务连接起来。

示例：

```sql
创建外部直播 ext_stream（原始字符串）
设置类型='kafka'， 
         brokers='name.aivencloud.com: 28864'，
         topic='topic'，
         security_protocol='sasl_SSL'， 
         sasl_mechanism='scram-SHA-256'，
         用户名='avnadmin'， 
         密码='..'，
         ssl_ca_cert_file='/kafka.cert'
```

确保可以通过 Proton 访问 ssl_ca_cert_file。 你可以通过以下方式做到这一点：

```bash
chown timeplus: timeplus kafka.cert
chmod 400 kafka.cert
```

或者，您可以将 CA pem 文件的全部内容放入 DDL SQL 中。 这可以帮助你与Kafka经纪人建立安全连接，Kafka代理使用由Proton不知道的CA证书签名的证书。 当你无法设置本地文件路径或者不想挂载或修改文件（例如使用Docker或Kubernetes或在Timeplus Cloud中）时，你可能需要将CA内容内联。

```sql
创建外部直播 ext_stream（原始字符串）
设置类型='kafka'， 
         brokers='name.aivencloud.com: 28864'，
         topic='topic'，
         security_protocol='sasl_SSL'， 
         sasl_mechanism='scram-SHA-256'，
         用户名='avnadmin'， 
         密码='..'，
         SSL_ca_pem='-----开始证书----\nmiieqtccaqmgawibagiu... ph0szpew==\n-----结束证书-----'
```

如果你想跳过验证 CA（不推荐），你可以通过以下方式创建外部流：

```sql
创建外部直播 ext_stream（原始字符串）
设置类型='kafka'， 
         brokers='name.aivencloud.com: 28864'，
         topic='topic'，
         security_protocol='sasl_SSL'， 
         sasl_mechanism='scram-SHA-256'，
         用户名='avnadmin'， 
         密码='..',
         skip_ssl_cert_check=true
```

### 连接到 WarpStream{#connect-warp}

你可以将 Proton 与 WarpStream 或 WarpStream Serverless Cloud 的本地部署连接起来。

示例：

```sql
创建外部直播 ext_stream（原始字符串）
设置类型='kafka'、 
         brokers='serverless.prod-z.us-east-1.warpstream.com: 9092'、
         topic='topic'、
         security_protocol='sasl_SSL'、 
         username='..'， 
         password='..'
```

### 连接到 Upstash{#connect-upstash}

您可以将 Proton 与 Upstash Serverless Kafka 连接起来。

示例：

```sql
创建外部直播 ext_stream（原始字符串）
设置类型='kafka'， 
         brokers='grizzly-1234-us1-kafka.upstash.io: 9092'，
         topic='topic'，
         security_protocol='sasl_SSL'， 
         sasl_Mechanism='scram-SHA-256'，
         username='..'， 
         password='..'
```

更多详细说明可在 [Upstash Docs] (https://upstash.com/docs/kafka/integrations/proton) 上找到。
