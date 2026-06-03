---
title: Data Formats
---

# Data Formats

Timeplus supports multiple data formats for reading from and writing to external systems like Apache Kafka, Apache Pulsar, Apache Iceberg, S3, NATS JetStream, and others.

This page provides comprehensive guidance on all supported data formats.

## Supported Data Formats {#formats}

The following data formats are supported across various sources and sinks:

| Format           | Description                              | Use Case |
| ---------------- | ---------------------------------------- | -------- |
| `RawBLOB`        | Raw text, no parsing (default)           | Plain text or binary data |
| `JSONEachRow`    | Parses one JSON document per line        | Most common format for JSON data |
| `CSV`            | Parses comma-separated values            | Legacy systems, data exports |
| `TSV`            | Tab-separated values                     | Like CSV, but tab-delimited |
| `ProtobufSingle` | One Protobuf message per message         | Protobuf-encoded streaming data |
| `Protobuf`       | Multiple Protobuf messages per message   | Protobuf-encoded batches |
| `Avro`           | Avro-encoded messages                    | Schema-first data serialization |


## RawBLOB

Read / write row as raw text. Only one column could be defined in using `RawBLOB`.

**Example**

The external stream `raw` column value is same as Kafka message data.

```sql
CREATE EXTERNAL STREAM my_stream(
  raw string
)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='events',
         data_format='RawBLOB'
```

## JSONEachRow

Each line (or message) contains a single JSON string with key/value pairs mapping to columns.

**Example**

Each Kafka message is plain text with JSON line format. For example,
```json
{"user_id": 123, "action": "click", "timestamp": "2024-01-15T10:30:00Z"}
```

The Kafka external stream is defined with columns: `user_id`, `action` and `timestamp`.
```sql
CREATE EXTERNAL STREAM my_stream(
    user_id int,
    action string,
    timestamp datetime64(3)
)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='events',
         data_format='JSONEachRow',
         one_message_per_row=true
```

In reading the external stream, the fetched Kafka message is parsed by JSON. The resulting column value is got from corresponding JSON key. If a column name is not found in the parsed JSON object keys, it is filled with the default value.


**Related Settings**
- `one_message_per_row=true`: Ensures each message contains exactly one JSON document. When set to `false`, especially useful when writing data.

## CSV and TSV

Use CSV or TSV for processing comma-separated or tab-separated data.

**Example CSV:**
```csv
123,click,2024-01-15T10:30:00Z
124,view,2024-01-15T10:31:00Z
```

**Configuration:**
```sql
CREATE EXTERNAL STREAM csv_stream(
    user_id int,
    action string,
    timestamp datetime64(3)
)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='csv_events',
         data_format='CSV'
```

## Protobuf {#protobuf}

Timeplus supports reading and writing [Protobuf](https://protobuf.dev/) formatted messages. You can use Protobuf with or without a [Schema Registry](/kafka-schema-registry).

There are two data formats for Protobuf: `ProtobufSingle` and `Protobuf`. They are encoded differently and can not be used interchangeably.

**ProtobufSingle** Each message has only one protobuf message. This is mostly used.

**Protobuf** Each message may have one or multiple protobuf messages. The message length is prepended the protobuf payload for decoding.

### Create

When not using a Schema Registry, you need to define the Protobuf schema using SQL.

1. Create Protobuf Schema

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

2. Create External Stream

Then refer to this schema while creating an external stream:

```sql
CREATE EXTERNAL STREAM stream_name(
         query string,
         page_number int32,
         results_per_page int32)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='topic_name',
         data_format='ProtobufSingle',
         format_schema='schema_name:SearchRequest'
```

The `format_schema` setting contains two parts: the registered schema name (in this example: `schema_name`), and the message type (in this example: `SearchRequest`). Combine them with a colon.

### Column Inference

If columns definition is totally ignored in creating external stream with data_format Protobuf or Avro, the columns name and type will be auto inferenced from format schema and added to the stream.

For example, `query`, `page_number` and `results_per_page` columns will be auto-created in below SQL.

```sql
CREATE EXTERNAL STREAM stream_name
SETTINGS type='kafka',
         brokers='localhost:19092',
         topic='topic_name',
         data_format='ProtobufSingle',
         format_schema='schema_name:SearchRequest'
```

### Examples For Complex Protobuf Schema {#protobuf_complex}

#### Nested Schema

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
  skills map(string, int32),
  age int32
)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='people',
         data_format='ProtobufSingle',
         format_schema='simple_nested:Person'
```

**Notes**
1. `Person` is the top level message type. It refers to the `Name` message type.
2. Use `name` as the prefix for the column names. Use either `_` or `.` to connect the prefix with the nested field names.
3. You don't have to define all possible columns. Only the columns you defined will be read. Other columns/fields are skipped.

#### Enum

If your Protobuf definition includes an enum type:

```protobuf
enum Level {
  LevelOne = 0;
  LevelTwo = 1;
}
```

You can use the enum type in Timeplus:

```sql
CREATE EXTERNAL STREAM ..(
  ..
  level enum8('LevelOne'=0,'LevelTwo'=1),
  ..
)
```

#### Repeated (Arrays)

If your Protobuf definition has a repeated field:

```protobuf
repeated string Status
```

Use the array type in Timeplus:

```sql
CREATE EXTERNAL STREAM ..(
  ..
  status array(string),
  ..
)
```

#### Repeated and Nested {#repeat_nested}

For fields that are both custom types and repeated:

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

Use the tuple type in Timeplus:

```sql
CREATE EXTERNAL STREAM ..(
    message string,
    params tuple(Param nested( name string, value string ))
)
```

The streaming data will be shown as:

| message | params                                                          |
| ------- | --------------------------------------------------------------- |
| No. 0   | ([('key_1','value_1'),('key_2','value_2'),('key_3','value_3')]) |

#### Package

If your Protobuf definition includes a package:

```protobuf
package demo;
message StockRecord {
..
}
```

If there is only 1 package in the Protobuf definition, you don't have to include the package name:

```sql
CREATE EXTERNAL STREAM ..(
  ..
)
SETTINGS .. format_schema="schema_name:StockRecord"
```

If there are multiple packages, you can use the fully qualified name:

```sql
CREATE EXTERNAL STREAM ..(
  ..
)
SETTINGS .. format_schema="schema_name:demo.StockRecord"
```

#### Import Schemas

If you have created a format schema, you can create another schema and import it:

```sql
CREATE FORMAT SCHEMA import_example AS '
  import "schema_name.proto";
  message Test {
    required string ID = 1;
    optional Level TheLevel = 2;
  }
' TYPE Protobuf
```

Make sure to add `.proto` as the suffix.

## Avro {#avro}

Timeplus supports reading and writing [Avro](https://avro.apache.org) formatted messages. Available since Timeplus Proton 1.5.10. You can use Avro with or without a [Schema Registry](/kafka-schema-registry).

### Create

When not using a Schema Registry, you need to define the Avro schema using SQL.

1. Create Avro Schema

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

2. Create External Stream

Then refer to this schema while creating an external stream:

```sql
CREATE EXTERNAL STREAM stream_avro(
         name string,
         favorite_number nullable(int32),
         favorite_color nullable(string))
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='topic_name',
         data_format='Avro',
         format_schema='avro_schema'
```

Then you can write data to the topic:

```sql
INSERT INTO stream_avro(name,favorite_number,favorite_color) VALUES('test',1,'red')
```

### Avro Data Types Mapping {#avro_types}

#### Avro Primitive Types

The table below shows supported Avro primitive data types and how they match Timeplus data types:

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

#### Avro Logical Types

If you use `logicalType` in your Avro schema, Timeplus will automatically map it to the corresponding Timeplus data type:

- UUID: maps to `uuid`.
- Date: maps to `date`.
- Timestamp (millisecond precision): maps to `datetime64(3)`.
- Timestamp (microsecond precision): maps to `datetime64(6)`.

Other logical types are not implemented yet.

**Example:**

Given the following Avro schema:

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

The external stream would be:

```sql
CREATE EXTERNAL STREAM avro (
    time datetime64(3),
    key string,
    value float64
) SETTINGS ...;
```

#### Record

There are two ways to map a `record`. The simple one is using `tuple`:

Given an Avro schema:
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

The external stream uses tuple:

```sql
CREATE EXTERNAL STREAM avro (
    a_record_field tuple(one string, two int32)
) SETTINGS ...;
```

The other way is flattening the fields:

```sql
CREATE EXTERNAL STREAM avro (
    `a_record_field.one` string,
    `a_record_field.two` int32
) SETTINGS ...;
```

The column name for each field will be the record field name followed by a dot (`.`), and the field name.

#### Array of Record

To map an array of records, you can use either `array(tuple(...))` or `nested()` (they are the same). By default, Timeplus will flatten the columns.

Given an Avro schema:
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

Create a stream like this:
```sql
CREATE EXTERNAL STREAM avro (
    an_array_of_records array(tuple(one string, two int32))
) SETTINGS ...;
```

This will become:
```sql
CREATE EXTERNAL STREAM avro (
    `an_array_of_records.one` array(string),
    `an_array_of_records.two` array(int32)
) SETTINGS ...;
```

The Avro output format handles this properly.

You can use `SET flatten_nested = 0` to disable the flatten behavior.

#### Union

Since Timeplus does not support native union types, there is no perfect way to handle Avro unions. One stream can only handle one of the union elements (except for `null`). If you need to generate values for different element types, you will need to create multiple streams.

**Example**

Given an Avro schema:
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

When creating the stream, you can only map the `int_or_string` field to either int or string:

```sql
CREATE EXTERNAL STREAM avro (
    int_or_string int32
) SETTINGS ...;
```

This stream can only write `int` values. For string values, create another stream:

```sql
CREATE EXTERNAL STREAM avro (
    int_or_string string
) SETTINGS ...;
```

You can also use the flatten naming convention:

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

For named types (record, fixed, and enum), use the name property instead of the type name. For example:

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

To map to the record element:

```sql
CREATE EXTERNAL STREAM avro (
    `int_or_record.details` tuple(...) -- use the name "details", not "record"
) SETTINGS ...;
```

**Note:** The Avro input format only supports the flatten naming convention. If you create a stream using:

```sql
CREATE EXTERNAL STREAM avro (
    int_or_string int32
) SETTINGS ...;
```

Then `SELECT * FROM avro` won't work.

#### Nullable

There is a special case for union: when the union has two elements and one of them is `null`, this union field will be mapped to a nullable column.

**Example:**

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

However, in Timeplus, `nullable` cannot be applied to all types. For instance, `nullable(tuple(...))` is invalid. If a field in the Avro schema is `"type": ["null", {"type": "record"}]`, you can only map it to a `tuple`, and it can't be `null`.

## Managing Format Schemas {#manage-schemas}

When working with custom Protobuf or Avro schemas (without Schema Registry), you can manage schemas using SQL commands.

### List Schemas

List all schemas in the current Timeplus deployment:

```sql
SHOW FORMAT SCHEMAS
```

### Show Details For A Schema

```sql
SHOW CREATE FORMAT SCHEMA schema_name
```

### Drop A Schema

```sql
DROP FORMAT SCHEMA <IF EXISTS> schema_name;
```

## Advanced Settings {#advanced}

### input_format_ignore_parsing_errors

In reading external stream, error may occur in parsing the raw data with specified data format. By default, exception will throw and terminate the query. Set it to true to ignore errors happen when parsing input data (errors will be logged).

### max_insert_block_size

For data formats that write multiple rows into a single message (such as `JSONEachRow` or `CSV`), this setting controls the maximum number of rows that can be written into one message.

### max_insert_block_bytes

For data formats that write multiple rows into a single message, this setting controls the maximum size (in bytes) that one message can be.
