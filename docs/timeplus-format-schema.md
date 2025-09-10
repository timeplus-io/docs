# Protobuf / Avro Schema

Timeplus supports reading or writing messages in [Protobuf](https://protobuf.dev/) or [Avro](https://avro.apache.org) format for [Kafka External Stream](/kafka-source) or [Pulsar External Stream](/pulsar-source). This document covers how to process data without a Schema Registry. Check [this page](/proton-schema-registry) if your Kafka topics are associated with a Schema Registry.

## Create Schema {#create}

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

Then refer to this schema while creating an external stream for Kafka or Pulsar:

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

Then you can run `INSERT INTO` or use a materialized view to write data to the topic.
```sql
INSERT INTO stream_name(query,page_number,results_per_page) VALUES('test',1,100)
```

Please note:

1. If you want to ensure there is only a single Protobuf message per Kafka message, please set `data_format` to `ProtobufSingle`. If you set it to `Protobuf`, then there could be multiple Protobuf messages in a single Kafka message.
2. The `format_schema` setting contains two parts: the registered schema name (in this example: schema_name), and the message type (in this example: SearchRequest). Combining them together with a semicolon.
3. You can use this external stream to read or write Protobuf messages in the target Kafka/Confluent topics.
4. For more advanced use cases, please check the [examples for complex schema](/proton-format-schema#protobuf_complex).

### Avro
Available since Timeplus Proton 1.5.10.
```sql
CREATE OR REPLACE FORMAT SCHEMA avro_schema AS '{
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

Then refer to this schema while creating an external stream for Kafka or Pulsar:

```sql
CREATE EXTERNAL STREAM stream_avro(
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
         format_schema='avro_schema'
```
Then you can run `INSERT INTO` or use a materialized view to write data to the topic.
```sql
INSERT INTO stream_avro(name,favorite_number,favorite_color) VALUES('test',1,'red')
```

## List Schemas

List schemas in the current Timeplus deployment:

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

Please note:

1. `Person` is the top level message type. It refers to the `Name` message type.
2. Use `name` as the prefix as the column names. Use either \_ or . to connect the prefix with the nested field names.
3. When you create an external stream to read the Protobuf messages, you don't have to define all possible columns. Only the columns you defined will be read. Other columns/fields are skipped.

### Enum

Say in your Protobuf definition, there is an enum type:

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

| message | params                                                          |
| ------- | --------------------------------------------------------------- |
| No. 0   | ([('key_1','value_1'),('key_2','value_2'),('key_3','value_3')]) |

### Package

Say in your Protobuf definition, there is a package:

```protobuf
package demo;
message StockRecord {
..
}
```

If there is only 1 package in the Protobuf definition type, you don't have to include the package name. For example:

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

### Avro Primitive Types
The table below shows supported Avro primitive data types and how they match Timeplus data types in INSERT and SELECT queries.

|Avro data type|Timeplus data type|
|---|---|
|int|int8,int16,int32,uint8,uint16,uint32|
|long|int64,uint64|
|float|float32|
|double|float64|
|bytes,string|string|
|fixed(N)|fixed_string(N)|
|enum|enum8,enum16|
|array(T)|array(T)|
|map(k,v)|map(k,v)|
|union(null,T)|nullable(T)|
|null|nullable(nothing)|
|int(date)|date,date32|
|long (timestamp-millis)|datetime64(3)|
|long (timestamp-micros)|datetime64(6)|
|string (uuid) | uuid|
|record|tuple|

### Avro Logical Types

If you use `logicalType` in your Avro schema, Timeplus will automatically map it to the corresponding Timeplus data type:

- UUID: maps to `uuid`.
- Date: maps to `date`.
- Timestamp (millisecond precision): maps to `datetime64(3)`.
- Timestamp (microsecond precision): maps to `datetime64(6)`.

Other logical types are not implemented yet.

For example, given the following Avro schema:

```json
{
  "type": "record",
  "name": "schema",
  "fields": [
    {
      "name": "time",
      "type": { "type": "long", "logicalType": "timestamp-millis" }
    },
    { "name": "key", "type": "string" },
    { "name": "value", "type": "double" }
  ]
}
```

The external stream uses tuple will be like this:

```sql
CREATE EXTERNAL STREAM avro (
    time datetime64(3),
    key string,
    value float64
) SETTINGS ...;
```

### record
There are two ways to map a `record`. The simple one is using `tuple`. Here is an example:

First given a Avro schema like this:
```json
{
    "name": "Root",
    "type": "record",
    "fields": [{
        "name": "a_record_field",
        "type": {
            "name": "a_record_field",
            "type": "record",
            "fields": [
                {"name": "one", "type": "string"},
                {"name": "two", "type": "int"}
            ]
        }
    }]
}
```
The external stream uses tuple will be like this:

```sql
CREATE EXTERNAL STREAM avro (
    a_record_field tuple(one string, two int32)
) SETTINGS ...;
```
The other way is flatting the fields, i.e. we will create a column for each field. The external stream can be defined as:
```sql
CREATE EXTERNAL STREAM avro (
    `a_record_field.one` string,
    `a_record_field.two` int32
) SETTINGS ...;
```
The column name for each field will be the name of the record field itself (in this case a_record_field) followed by a dot (.), and followed by the field name. This is how "flatten" works.

### array of record

To map an array of record, you can use either `array(tuple(...))` or `nested()`, they are the same. By default, Timeplus will flatten the columns. For example:

Give an Avro schema:
```json
{
    "name": "Root",
    "type": "record",
    "fields": [{
        "name": "an_array_of_records",
        "type": {
            "type": "array",
            "items": {
                "name": "record_inside_an_array",
                "type": "record",
                "fields": [
                    {"name": "one", "type": "string"},
                    {"name": "two", "type": "int"}
                ]
            }
        }
    }]
}
```
We would create a stream like this:
```sql
CREATE EXTERNAL STREAM avro (
    an_array_of_records array(tuple(one string, two int32))
) SETTINGS ...;
```
will become:
```sql
CREATE EXTERNAL STREAM avro (
    `an_array_of_records.one` array(string),
    `an_array_of_records.two` array(int32)
) SETTINGS ...;
```
The Avro output format can handle this properly.

You can use `SET flatten_nested = 0` to disable the flatten behavior. The Avro output format can handle it well too.

### union
Since Timeplus does not support native union, there is no "perfect" way to handle Avro unions. One stream can only handle one of the union elements (except for `null`, more details later). If you need to generate values for different element types, you will need to create multiple streams.

For example. Given an Avro schema:
```json
{
    "name": "Root",
    "type": "record",
    "fields": [{
        "name": "int_or_string",
        "type": ["int", "string"]
    }]
}
```
When we create the stream, we can only map the `int_or_string` field to either int or string, for example:
```sql
CREATE EXTERNAL STREAM avro (
    int_or_string int32
) SETTINGS ...;
```
This stream can only write `int` values. If you want to write string values, you will need to create another stream like this:
```sql
CREATE EXTERNAL STREAM avro (
    int_or_string string
) SETTINGS ...;
```
We can also use the flatten naming convention to map the union field. For this example, the streams will be:
```sql
-- using the `int` element
CREATE EXTERNAL STREAM avro (
    `int_or_string.int` int32
) SETTINGS ...;

-- using the `string` element
CREATE EXTERNAL STREAM avro (
    `int_or_string.string` string
) SETTINGS ...;
```
For named types (record, fixed, and enum), use the name property instead of the type name. For example, given an Avro schema:
```json
{
    "name": "Root",
    "type": "record",
    "fields": [{
        "name": "int_or_record",
        "type": ["int", {
            "name": "details",
            "type": "record",
            "fields": [...]
        }]
    }]
}
```
In order to map to the record element of the union, we need to use the name details, so the stream definition will be:
```sql
CREATE EXTERNAL STREAM avro (
    `int_or_record.details` tuple(...) -- do not use `int_or_record.record`, this won't work
) SETTINGS ...;
```

The Avro input format only supports the flatten naming convention, so, if you create the stream using the first method:
```sql
CREATE EXTERNAL STREAM avro (
    int_or_string int32
) SETTINGS ...;
```
then, `SELECT * FROM avro` won't work.

### nullable

There is a special case for union, which is, when the union has two elements, and one of it is `null`, then this union field will be mapped to a nullable column. Example:

Avro schema:
```json
{
    "name": "Root",
    "type": "record",
    "fields": [{
        "name": "null_or_int",
        "type": ["null", "int"]
    }]
}
```
Stream:
```sql
CREATE EXTERNAL STREAM avro (
    null_or_int nullable(int32)
) SETTINGS ...;
```
However, in Timeplus, `nullable` cannot be applied on all the types. For instance, `nullable(tuple(...))` is invalid. If a field in the Avro schema is `"type": ["null", {"type": "record"}]`, you can only map it to a `tuple`, and it can't be `null`.
