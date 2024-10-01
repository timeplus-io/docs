# Read Avro Message in Kafka


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

After running this SQL successfully, you can fetch existing data via

```sql
SELECT * FROM avro_stream WHERE _tp_time>earliest_ts()
```

Or only fetch the incoming new messages via

```sql
SELECT * FROM avro_stream
```

### Example: Read Avro Encoded Data in Confluent Platform {#read_avro_confluent_platform}

You can follow [Confluent Docs](https://docs.confluent.io/platform/7.6/platform-quickstart.html#quickstart) to start Confluent Platform with Schema Registry via Docker Compose.

The Avro schema definition:

```json
{
 "namespace": "io.confluent.examples.clients.basicavro",
 "type": "record",
 "name": "Payment",
 "fields": [
     {"name": "id", "type": "string"},
     {"name": "amount", "type": "double"}
 ]
}
```

Follow the [Schema Registry tutorial](https://docs.confluent.io/platform/7.6/schema-registry/schema_registry_onprem_tutorial.html) to create a new topic `transactions`. Create a `$HOME/.confluent/java.config` with content:

```properties
bootstrap.servers=localhost:9092
client.dns.lookup=use_all_dns_ips
session.timeout.ms=45000
acks=all
schema.registry.url=http://localhost:8081
```

Then use Maven to compile the [sample code](https://github.com/confluentinc/examples/tree/7.5.0-post/clients/avro) and produce Avro-encoded message to the local Kafka server with schema registry:

```bash
mvn clean compile package
mvn exec:java -Dexec.mainClass=io.confluent.examples.clients.basicavro.ProducerExample \
  -Dexec.args="$HOME/.confluent/java.config"
```

Then create an external steam in Proton:

```sql
CREATE EXTERNAL STREAM transactions(
  id string,
  amount double
)
SETTINGS
  type = 'kafka',
  brokers = 'localhost:9092',
  topic = 'transactions',
  data_format = 'Avro',
  kafka_schema_registry_url = 'http://localhost:8081';
```

After running this SQL successfully, you can fetch existing data via

```sql
SELECT * FROM transactions WHERE _tp_time>earliest_ts()
```

Or only fetch the incoming new messages via

```sql
SELECT * FROM transactions
```

### Example: Read Avro Encoded Data in Kafka service on Aiven{#read_avro_aiven}

The schema registry endpoint on Aiven is signed with CA, but you need to provide `ssl_ca_cert_file` for the broker.

```sql
CREATE EXTERNAL STREAM transactions(
  id string,
  amount double
)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='transactions',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='PASSWORD',
         ssl_ca_cert_file='/kafka.cert',
         data_format = 'Avro',
         kafka_schema_registry_url = 'https://name.a.aivencloud.com:28856',
         kafka_schema_registry_credentials = 'avnadmin:PASSWORD'
```
