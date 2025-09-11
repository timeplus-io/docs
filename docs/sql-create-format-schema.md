# CREATE FORMAT

Timeplus supports reading or writing messages in [Protobuf](https://protobuf.dev/) or [Avro](https://avro.apache.org) format. This document covers how to process data without a Schema Registry. Check [this page](/kafka-schema-registry) if your Kafka topics are associated with a Schema Registry.

Without a Schema Registry, you need to define the Protobuf or Avro schema using SQL.

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

Then refer to this schema while creating an external stream for Kafka:

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

Please note:

1. If you want to ensure there is only a single Protobuf message per Kafka message, please set `data_format` to `ProtobufSingle`. If you set it to `Protobuf`, then there could be multiple Protobuf messages in a single Kafka message.
2. The `format_schema` setting contains two parts: the registered schema name (in this example: schema_name), and the message type (in this example: SearchRequest). Combining them together with a semicolon.
3. You can use this external stream to read or write Protobuf messages in the target Kafka/Confluent topics.
4. For more advanced use cases, please check the [examples for complex schema](/timeplus-format-schema#protobuf_complex).

## Avro
Available since Proton 1.5.10.
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

Then refer to this schema while creating an external stream for Kafka:

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

## See also
[SHOW FORMAT SCHEMA](/sql-show-format-schemas) - Show format schema
[DROP FORMAT SCHEMA](/sql-drop-format-schema) - Drop format schema
