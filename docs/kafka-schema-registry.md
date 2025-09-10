# Kafka Schema Registry

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
    kafka_schema_registry_credentials = 'API_KEY:API_SECRET',
    kafka_schema_registry_skip_cert_check = true|false,
    kafka_schema_registry_private_key_file = '..',
    kafka_schema_registry_cert_file = '..',
    kafka_schema_registry_ca_location = '..';
```

Please note:

1. `kafka_schema_registry_credentials` is optional. Skip this if the schema registry server doesn't require authentication.
2. Make sure to add `http://` or `https://` in the `kafka_schema_registry_url`. In Proton 1.5.3 or above, self-signed HTTPS certification is supported.
   1. One solution is to set `kafka_schema_registry_skip_cert_check` to `true`. This will completely skip the TLS certification verification. In this case, you don't need to specify the certification files.
   2. A more secure solution is to keep the default value of `kafka_schema_registry_skip_cert_check`, which is false. Omit this setting and specify the following 3 settings:
      1. `kafka_schema_registry_private_key_file`: the file path to the private key file used for encryption. Please use absolute file path and make sure Proton can access this file. If you are using Kubernetes or Docker, please mount the file systems properly.
      2. `kafka_schema_registry_cert_file`: the file path to the certificate file (in PEM format). If the private key and the certificate are stored in the same file, this can be empty if `kakfa_schema_registry_private_key_file` is specified.
      3. `kafka_schema_registry_ca_location`: the path to the file or directory containing the CA/root certificates.

3. Make sure you define the columns matching the fields in the Avro schema. You don't have to define all top level fields in Avro schema as columns in the stream. For example, if there are 4 fields in Avro schema, you can choose only 2 of them as columns in the external stream. But make sure the data types match.
4. `data_format` can be `Avro`, or `ProtobufSingle`.
5. Schema reference is not supported yet.

:::info

For examples to read Avro message in various Kafka API compatitable message platforms, please check [this doc](/tutorial-sql-read-avro).

:::
## Write Messages in Avro Schema{#write}

Writing Avro/Protobuf data with schema registry is not supported in Timeplus Proton.

Since Timeplus Enterprise 2.4.7 (with timeplusd 2.3.10), it can produce Kafka messages using the Avro schema registry output format.

You need to set `data_format='Avro'`, and also specify the schema registry related settings while creating the external stream. For example:
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
Since the schema fetched from schema registry is cached in the memory, next time when another INSERT query is executed, Timeplus won't fetch the schema from the registry again. Please note, the cache is for the topic, not just for the external stream. So if you create another external stream using the same topic, it will use the cached schema as well.

To force the query to refresh the schema (for example, the schema gets evolved ), you can use the force_refresh_schema setting:
```sql
INSERT INTO my_ex_stream SETTINGS force_refresh_schema=true ...
```
:::

For the data type mappings between Avro and Timeplus data type, please check [this doc](/timeplus-format-schema#avro_types).
