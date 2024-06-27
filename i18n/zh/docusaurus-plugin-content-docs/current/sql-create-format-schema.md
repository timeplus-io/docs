# CREATE FORMAT

Timeplus 支持以 [Protobuf](https://protobuf.dev/) 或 [Avro](https://avro.apache.org) 格式读取或写入消息。 本文档介绍如何在没有架构注册表的情况下处理数据。 如果您的 Kafka 主题是否与架构注册表关联，请查看 [此页面]（Proton架构注册表）。

如果没有架构注册表，则需要使用 SQL 定义 Protobuf 或 Avro 架构。

## Protobuf

```sql
CREATE OR REPLACE FORMAT SCHEMA schema_name AS '
              syntax = "proto3";

              message SearchRequest {
                string query = 1;
                int32 page_number = 2;
                int32 results_per_page = 3;
              }
              ' TYPE Protobuf
```

然后在为 Kafka 创建外部流时参考这个架构：

```sql
CREATE EXTERNAL STREAM stream_name(
         query string,
         page_number int32,
         results_per_page int32)
SETTINGS type='kafka',
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='topic_name',
         security_protocol='SASL_SSL',
         username='..',
         password='..',
         data_format='ProtobufSingle',
         format_schema='schema_name:SearchRequest'
```

请注意：

1. 如果你想确保每条 Kafka 消息只有一条 Protobuf 消息，请将 data_format 设置为 protobufSingle。 如果你将其设置为 Protobuf，那么在一条 Kafka 消息中可能会有多条 Protobuf 消息。
2. `format_schema`设置包含两部分：注册的架构名称（在本示例中：架构名称）和消息类型（在本示例中：SearchRequest）。 用分号将它们组合在一起。
3. 你可以使用这个外部流在目标 Kafka/Confluent 主题中读取或写入 Protobuf 消息。
4. 有关更高级的用例，请查看 [复杂架构示例](#complex)。

## Avro

自 Proton 1.5.10 起可用。

```sql
CREATE OR REPLACE FORMAT SCHEMA schema_name AS '{
                "namespace": "example.avro",
                "type": "record",
                "name": "User",
                "fields": [
                  {"name": "name", "type": "string"},
                  {"name": "favorite_number",  "type": ["int", "null"]},
                  {"name": "favorite_color", "type": ["string", "null"]}
                ]
              }
              ' TYPE Avro;
```

然后在为 Kafka 创建外部流时参考这个架构：

```sql
CREATE EXTERNAL STREAM stream_name(
         name string,
         favorite_number nullable(int32),
         favorite_color nullable(string))
SETTINGS type='kafka',
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='topic_name',
         security_protocol='SASL_SSL',
         username='..',
         password='..',
         data_format='Avro',
         format_schema='schema_name'
```
