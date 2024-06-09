# 在 Kafka 中阅读 Avro 消息

### 示例：在 Confluent Cloud 中读取 Avro 编码的数据 {#read_avro_confluent_cloud}

假设你创建了这样的 Avro 架构定义：

```json
{
  “类型”：“记录”，
  “命名空间”：“com.mycorp.mynamespace”，
  “名称”：“SampleRecord”，
  “doc”：“可以帮助你入门的示例架构。“，
  “字段”：[
    {
      “名称”：“my_field1"，
      “类型”：“int”，
      “doc”：“int 类型是 32 位有符号整数。”
    }，
    {
      “名称”：“my_field2”，
      “类型”：“双精度”，
      “doc”：“双精度类型是双精度（64 位）IEEE 754 浮点数。”
    }，
    {
      “名称”：“my_field3”，
      “类型”：“字符串”，
      “doc”：“字符串是一个 Unicode 字符序列。”
    }，
    {
      “名称”：“my_field4"，
      “类型”：{
        “类型”：“长”，
        “LogicalType”：“timestamp-millis”
      }，
      “doc”：“用例”
    }
  ]
}
```

在 Confluent Cloud 中创建主题，您可以使用以下命令以 Avro 格式将数据推送到该主题：

```bash
confluent kafka 话题生成 $TOPIC --schema ~/Dev/schema.txt\
--schema-registry-endpoint https://psrc-ab123.us-east-2.aws.confluent.cloud\
--schema-registry-api-key $API_KEY \
--schema-registry-api-secret $API_SECRET \
--value-for
```

例如，您可以逐行添加消息

```json
{“my_field1": 1、“my_field2”: 3.4、“my_field3”: “你好”、“my_field4”: 1707954127790}
```

现在让我们在 Proton 中创建一个外部流来读取这样的消息：

```sql
创建外部流 avro_stream (
  my_field1 int8、
  my_field2 float32、
  my_field3 字符串、
  my_field4 int64
)
设置
  type = “kafka”，
  brokers = “pkc-ab123.us-east-2.confluent.cloud: 9092”，
  security_protocol='sasl_SSL'， 
  username='$KEY'， 
  password='$SECRET'，
  topic = '$TOPIC'，
  data_format = 'Avro'，
  kafka_schema_registry_url = 'https://psrc-ab123.us-east-2.aws.confluent.cloud'，
  kafka_schema_registry_credentials = '$API_KEY:$API_SECRET';
```

成功运行此 SQL 后，您可以通过以下方式获取现有数据

```sql
从 avro_stream 中选择 * 其中 _tp_time>earliest_ts ()
```

或者只通过以下方式获取收到的新消息

```sql
从 avro_stream 中选择 *
```

### 示例：在 Confluent 平台中读取 Avro 编码的数据 {#read_avro_confluent_platform}

你可以关注 [Confluent Docs](https://docs.confluent.io/platform/7.6/platform-quickstart.html#quickstart) 通过 Docker Compose 启动带有架构注册表的 Confluent 平台。

Avro 架构定义：

```json
{
 “命名空间”：“io.confluent.examples.clients.basicavro”，
 “类型”：“记录”，
 “名称”：“付款”，
 “字段”：[
     {“名称”：“id”，“类型”：“字符串”}，
     {“名称”：“金额”，“类型”：“双倍”}
 ]

```

按照 [架构注册表教程](https://docs.confluent.io/platform/7.6/schema-registry/schema_registry_onprem_tutorial.html) 创建新主题 “交易”。 使用以下内容创建一个$HOME/.confluent/java.config

```properties
bootstrap.servers=localhost: 9092
client.dns.lookup=use_all_dns_ips
session.timeout.ms=45000
acks=all
schema.registry.url = http://localhost:8081
```

然后使用 Maven 编译 [示例代码](https://github.com/confluentinc/examples/tree/7.5.0-post/clients/avro)，并使用架构注册表向本地 Kafka 服务器生成 AVRO 编码的消息：

```bash
mvn 干净编译包
mvn exec: java-dexec.mainclass=io.confluent.examples.clients.basicavro.producerExample\
  -dexec.args=”$HOME/.confluent/java.config”
```

然后在 Proton 中创建外部蒸汽：

```sql
创建外部流交易（
  id 字符串，
  金额翻倍
）
设置
  type = 'kafka'，
  经纪商 = 'localhost: 9092'，
  主题 = “交易”，
  data_format = 'Avro'，
  kafka_schema_registry_url = 'http://localhost:8081'；
```

成功运行此 SQL 后，您可以通过以下方式获取现有数据

```sql
从交易中选择 * 其中 _tp_time>earliest_ts ()
```

或者只通过以下方式获取收到的新消息

```sql
从交易中选择 *
```

### 示例：在 Aiven 上读取 Kafka 服务中的 Avro 编码数据{#read_avro_aiven}

Aiven 上的架构注册表端点是使用 CA 签名的，但你需要为代理提供 `ssl_ca_cert_file`。

```sql
创建外部流交易（
  id 字符串，
  金额翻倍
）
设置类型='kafka'， 
         brokers='name.aivencloud.com: 28864'，
         topic='transactions'，
         secury_protocol='sasl_SSL'， 
         sasl_mechanism='scram-SHA-256'，
         username='avnadmin'， 
         password='password'，
         ssl_ca_cert_file='/kafka.cert'，
         data_format =' Avro '，
         kafka_schema_registry_url =' https://name.a.aivencloud.com:28856 '，
         kafka_schema_registry_certencials =' avnadmin: Password '
```

### 示例：在 Upstash Kafka 中读取 Avro 编码的数据{#read_avro_upstash}

从 Proton 1.5.3 开始，支持带路径的架构注册表。 这使得 Proton 用户能够在启用架构注册表时从 Upstash Serverless Kafka 加载数据。

```sql
创建外部流交易（
  id 字符串，
  金额翻倍
）
设置类型='kafka'， 
         brokers='abc-us1-kafka.upstash.io: 9092'，
         topic='transactions'，
         secury_protocol='sl_SSL'， 
         sasl_Mechanism='scram-SHA-256'，
         Username='User'， 
         password='pwd'，
         data_format = 'Avro'，
         kafka_schema_registry_url = 'https://abc-us1-rest-kafka.upstash.io/schema-registry'，
         kafka_schema_registry_credentials = '用户:PWD'
```
