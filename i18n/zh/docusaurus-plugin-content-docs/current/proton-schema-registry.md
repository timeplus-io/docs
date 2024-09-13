# Kafka 架构注册表

## 在 Protobuf 或 Avro 架构中读取消息 {#read}

要使用架构注册表读取 Protobuf 或 Avro 架构中的 Kafka 数据，你可以使用 kafka_schema_registry_url 设置创建外部流，例如

```sql
创建外部流 my_stream (
  --这里有列...
) 设置
    type = 'kafka'，
    brokers = '...'，
    话题 ='...',
    data_format ='..'，
    kafka_schema_registry_url =' http://url.to/my/schema/registry '，
    kafka_schema_registry_credentials =' API_KEY: API_SECRET '，
    kafka_schema_registry_registry_private_key_file ='
    ..'，
    kafka_schema_registry_cert_file ='..'，
    kafka_schema_registry_ca_location ='..';
```

请注意：

1. `kafka_schema_registry_credentials` 是可选的。 如果架构注册服务器不需要身份验证，请跳过此操作。

2. 确保在 `kafka_schema_registry_url`中添加 `http: //` 或 `https: //`。 在 Proton 1.5.3 或更高版本中，支持自签名的 HTTPS 认证。
   1. 一种解决方案是将 kafka_schema_registry_skip_cert_check 设置为 true。 这将完全跳过 TLS 认证验证。 在这种情况下，您无需指定认证文件。
   2. 更安全的解决方案是保留 kafka_schema_registry_skip_cert_check 的默认值，该值为 false。 省略此设置并指定以下 3 个设置：
      1. `kafka_schema_registry_private_key_file`：用于加密的私钥文件的文件路径。 请使用绝对文件路径并确保 Proton 可以访问此文件。 如果你使用的是 Kubernetes 或 Docker，请正确安装文件系统。
      2. `kafka_schema_registry_cert_file`：证书文件的文件路径（采用 PEM 格式）。 如果私钥和证书存储在同一个文件中，则如果指定了 kakfa_schema_registry_private_key_file，则该文件可以为空。
      3. `kafka_schema_registry_ca_location`：包含 CA/根证书的文件或目录的路径。

3. 确保定义的列与 Avro 架构中的字段相匹配。 您不必将 Avro 架构中的所有顶级字段定义为流中的列。 例如，如果 Avro 架构中有 4 个字段，则只能选择其中 2 个作为外部流中的列。 但是请确保数据类型匹配。

4. `data_format` 可以是 `Avro` 或 `ProtobufSingle`。

5. 尚不支持架构引用。

:::info

For examples to read Avro message in various Kafka API compatitable message platforms, please check [this doc](/tutorial-sql-read-avro).

:::

## Write Messages in Avro Schema{#write}

Writing Avro/Protobuf data with schema registry is not supported in Timeplus Proton.

Since Timeplus Enterprise 2.4.7 (with timeplusd 2.3.10), it can produce Kafka messages using the Avro schema registry output format.

You need to set `data_format='Avro'`, and also specify the schema registry related settings while creating the external stream. 例如：

```sql
CREATE EXTERNAL STREAM my_ex_stream (
    -- columns ...
) SETTINGS
    type = 'kafka',
    brokers = '...',
    topic = '...',
    data_format = 'Avro',
    kafka_schema_registry_url = '...',
    kafka_schema_registry_credentials = '...',
...;
```

When you run a INSERT query like `INSERT INTO my_ex_stream ...`, it will call the schema registry API to fetch the latest schema set on the topic ( currently, it does not support specifying the schema ID directly). And then, it will cache the schema in memory for that topic.

:::info About the caching

To force the query to refresh the schema (for example, the schema gets evolved ), you can use the force_refresh_schema setting:

```sql
INSERT INTO my_ex_stream SETTINGS force_refresh_schema=true ...
```

:::

For the data type mappings between Avro and Timeplus data type, please check [this doc](/proton-format-schema#avro_types).
