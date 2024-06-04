# Protobuf/Avro Schema

Timeplus supports reading or writing messages in [Protobuf](https://protobuf.dev/) or [Avro](https://avro.apache.org) format. This document covers how to process data without a Schema Registry. Check [this page](proton-schema-registry) if your Kafka topics are associated with a Schema Registry.

## Create A Schema {#create}

Without a Schema Registry, you need to define the Protobuf or Avro schema using SQL.

### Protobuf

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

请注意：

1. If you want to ensure there is only a single Protobuf message per Kafka message, please set `data_format` to `ProtobufSingle`. If you set it to `Protobuf`, then there could be multiple Protobuf messages in a single Kafka message.
2. The `format_schema` setting contains two parts: the registered schema name (in this example: schema_name), and the message type (in this example: SearchRequest). Combining them together with a semicolon.
3. You can use this external stream to read or write Protobuf messages in the target Kafka/Confluent topics.
4. For more advanced use cases, please check the [examples for complex schema](#complex).

### Avro

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

## List Schemas

List schemas in the current Proton deployment:

```sql
SHOW FORMAT SCHEMAS
```

## Show Details For A Schema

```sql
SHOW CREATE FORMAT SCHEMA schema_name
```

## Drop A Schema

```sql
DROP FORMAT SCHEMA <IF EXISTS> schema_name;
```

## Examples For Complex Protobuf Schema {#protobuf_complex}

### Nested Schema

```sql
CREATE FORMAT SCHEMA simple_nested AS '
syntax = "proto3";

message Name {
 string first = 1;
 string last = 2;
}

message Person {
 string email = 1;
 Name name = 2;
 int32 age = 3;
 map<string, int32> skills = 4;
}
' TYPE Protobuf
```

```sql
CREATE EXTERNAL STREAM people(
  email string,
  name_first string,
  name.last string,
  skills map(string,int32),
  age int32
)
SETTINGS type='kafka'.. data_format='ProtobufSingle',
         format_schema='simple_nested:Person'
```

请注意：

1. `Person` is the top level message type. It refers to the `Name` message type.
2. Use `name` as the prefix as the column names. Use either \_ or . to connect the prefix with the nested field names.
3. When you create an external stream to read the Protobuf messages, you don't have to define all possible columns. Only the columns you defined will be read. Other columns/fields are skipped.

### Enum

Say in your Protobuf definition, there is a enum type:

```protobuf
enum Level {
  LevelOne = 0;
  LevelTwo = 1;
}
```

You can use the enum type in Proton, e.g.

```sql
CREATE EXTERNAL STREAM ..(
  ..
  level enum8('LevelOne'=0,'LevelTwo'=1),
  ..
)
```

### Repeat

Say in your Protobuf definition, there is a repeated type:

```protobuf
repeated string Status
```

You can use the array type in Proton, e.g.

```sql
CREATE EXTERNAL STREAM ..(
  ..
  status array(string),
  ..
)
```

### Repeated and Nested {#repeat_nested}

Say in your Protobuf definition, there is a field in a custom type and also repeated:

```protobuf
syntax = "proto3";
message DataComponent {
  optional string message = 1;
  message Params {
    message KeyValue {
      optional string name = 1;
      optional string value = 2;
    }
    repeated KeyValue Param = 1;
  }
  optional Params params = 2;
}
```

You can use the tuple type in Proton, e.g.

```sql
CREATE EXTERNAL STREAM ..(
    message string,
    params tuple(Param nested( name string, value string ))
)
```

The streaming data will be shown as:

```sql
select * from stream_name;
```

| message               | params                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No. 0 | ([('key_1','value_1'),('key_2','value_2'),('key_3','value_3')]) |

### Package

Say in your Protobuf definition, there is a package:

```protobuf
package demo;
message StockRecord {
..
}
```

If there is only 1 package in the Protobuf definition type, you don't have to include the package name. 例如：

```sql
CREATE EXTERNAL STREAM ..(
  ..
)
SETTINGS .. format_schema="schema_name:StockRecord"
```

If there are multiple packages, you can use the fully qualified name with package, e.g.

```sql
CREATE EXTERNAL STREAM ..(
  ..
)
SETTINGS .. format_schema="schema_name:demo.StockRecord"
```

### Import Schemas

If you have used [CREATE FORMAT SCHEMA](#create) to register a format schema, say `schema_name`, you can create the other schema and import this:

```sql
CREATE FORMAT SCHEMA import_example AS '
import "schema_name.proto";
message Test{
 required string ID = 1;
 optional Level TheLevel = 2;
}
' TYPE Protobuf
```

Please make sure to add `.proto` as the suffix.

## Avro Data Types Mapping {#avro_types}

The table below shows supported Avro data types and how they match Timeplus data types in INSERT and SELECT queries.

| Avro data type                             | Timeplus data type                                      |
| ------------------------------------------ | ------------------------------------------------------- |
| 整数                                         | int8,int16,int32,uint8,uint16,uint32                    |
| long                                       | int64,uint64                                            |
| 浮点数                                        | float32                                                 |
| double                                     | float64                                                 |
| bytes,string                               | 字符串                                                     |
| fixed(N)                | fixed_string(N) |
| enum                                       | enum8,enum16                                            |
| array(T)                | array(T)                             |
| map(k,v)                | map(k,v)                             |
| union(null,T)           | nullable(T)                          |
| null                                       | nullable(nothing)                    |
| int(date)               | date,date32                                             |
| long (timestamp-millis) | datetime64(3)                        |
| long (timestamp-micros) | datetime64(6)                        |
| bytes (decimal)         | datetime64(N)                        |
| 整数                                         | ipv4                                                    |
| fixed(16)               | ipv6                                                    |
| bytes (decimal)         | decimal(P,S)                         |
| string (uuid)           | uuid                                                    |
| fixed(16)               | int128, uint128                                         |
| fixed(32)               | int256, uint256                                         |
| record                                     | 元组                                                      |
