# Kafka Schema Registry

Since Proton 1.5.2, Kafka schema registry is supported.

## Read Messages in Protobuf or Avro Schema {#read}

To read Kafka data in Protobuf or Avro schema with a schema registry, you can create an external stream with `kafka_schema_registry_url` settings, e.g.

```sql
CREATE EXTERNAL STREAM my_stream (
  -- columns goes here ...
) SETTINGS
    type = 'kafka',
    brokers = '...',
    topic = '...',
    data_format = '..',
    kafka_schema_registry_url = 'http://url.to/my/schema/registry',
    kafka_schema_registry_credentials = 'API_KEY:API_SECRET';
```

Please note:

1. `kafka_schema_registry_credentials` is optional. Skip this if the schema registry server doesn't require authencation. 
2. Make sure to add `http://` or `https://` in the `kafka_schema_registry_url`. Self-signed HTTPS certification is not supported yet.
3. Make sure you define the columns matching the fields in the Avro schema.
4. `data_format` can be `Avro`, or `ProtobufSingle`. 
5. Schema reference is not supported yet.

### Example: Read Avro Encoded Data in Confluent Cloud {#read_avro_confluent_cloud}

Say you create such a Avro schema definition:

```json
{
  "type": "record",
  "namespace": "com.mycorp.mynamespace",
  "name": "sampleRecord",
  "doc": "Sample schema to help you get started.",
  "fields": [
    {
      "name": "my_field1",
      "type": "int",
      "doc": "The int type is a 32-bit signed integer."
    },
    {
      "name": "my_field2",
      "type": "double",
      "doc": "The double type is a double precision (64-bit) IEEE 754 floating-point number."
    },
    {
      "name": "my_field3",
      "type": "string",
      "doc": "The string is a unicode character sequence."
    },
    {
      "name": "my_field4",
      "type": {
        "type": "long",
        "logicalType": "timestamp-millis"
      },
      "doc": "use case"
    }
  ]
}
```

Create a topic in Confluent Cloud and you can push data to the topic in Avro format with the following command:

```bash
confluent kafka topic produce $TOPIC --schema ~/Dev/schema.txt \
--schema-registry-endpoint https://psrc-ab123.us-east-2.aws.confluent.cloud \
--schema-registry-api-key $API_KEY \
--schema-registry-api-secret $API_SECRET \
--value-format avro
```

You can add messages line by line, for example

```json
{"my_field1":1,"my_field2":3.4,"my_field3":"hello","my_field4":1707954127790}
```

Now let's create an external stream in Proton to read such messages:

```sql
CREATE EXTERNAL STREAM avro_stream(
  my_field1 int8,
  my_field2 float32,
  my_field3 string,
  my_field4 int64
)
SETTINGS
  type = 'kafka',
  brokers = 'pkc-ab123.us-east-2.aws.confluent.cloud:9092',
  security_protocol='SASL_SSL', 
  username='$KEY', 
  password='$SECRET',
  topic = '$TOPIC',
  data_format = 'Avro',
  kafka_schema_registry_url = 'https://psrc-ab123.us-east-2.aws.confluent.cloud',
  kafka_schema_registry_credentials = '$API_KEY:$API_SECRET';
```

After running this SQL successfully, you can fetch existin data via

```sql
SELECT * FROM avro_stream WHERE _tp_time>earliest_ts()
```

Or only fetch the incoming new messages via

```sql
SELECT * FROM avro_stream
```

## Write Messages{#write}

Writing Avro/Protobuf data with schema registry is not supported yet (coming soon).

