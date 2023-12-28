# Schema Management

## Create A Schema {#create}

Currently Proton supports reading or writing messages in [Protobuf](https://protobuf.dev/) format. For example:

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

Then refer to this schema while creating an external stream for Confluent Cloud or Apache Kafka:

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

1. If  you want to ensure there is only a single Protobuf message per Kafka message, please set `data_format` to `ProtobufSingle`. If you set it to `Protobuf`, then there could be multiple Protobuf messages in a single Kafka message.
2. The `format_schema` setting contains two parts: the registered schema name (in this example: schema_name), and the message type (in this example: SearchRequest). Combining them together with a semicolon.
3. You can use this external stream to read or write Protobuf messages in the target Kafka/Confluent topics.
4. For more advanced use cases, please check the [examples for complex schema](#complex).

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

## Examples For Complex Schema {#complex}

### Nested Schema

```sql
CREATE FORMAT SCHEMA simple_nested AS '
syntax = "proto3"

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
2. Use `name` as the prefix as the column names. Use either _ or . to connect the prefix with the nested field names.
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

### Package

Say in your Protobuf definition, there is a package:

```protobuf
package demo;
message StockRecord {
..
}
```

You can use the array type in Proton, e.g.

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
