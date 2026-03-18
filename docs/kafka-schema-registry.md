# Kafka Schema Registry

## Read Messages in Protobuf or Avro Schema {#read}

To consume Kafka data using **Avro** or **Protobuf** via a Schema Registry, create an external stream using the `kafka_schema_registry_url` and associated settings.

```sql
CREATE EXTERNAL STREAM my_stream (
    -- Define columns matching your schema (optional)
    column_name data_type,
    ...
) SETTINGS
    type = 'kafka',
    brokers = 'localhost:9092',
    topic = 'my_topic',
    data_format = 'Avro', -- or 'ProtobufSingle'
    subject_name_strategy = '..',
    schema_subject_name = '..',
    kafka_schema_registry_url = 'http://url.to/my/schema/registry',
    kafka_schema_registry_credentials = 'API_KEY:API_SECRET',
    kafka_schema_registry_skip_cert_check = [true|false],
    kafka_schema_registry_ca_location = '..';
```

### Key Configuration Details

**1. Authentication & URL**
`kafka_schema_registry_url`: Must include the protocol (`http://` or `https://`).
`kafka_schema_registry_credentials`: Optional. Omit if your registry does not require an API key or Basic Auth.

**2. TLS/SSL Security Options**
You can configure secure connections in two ways:
- **Basic (Insecure)**: Set `kafka_schema_registry_skip_cert_check = true`. This bypasses TLS verification and is recommended for local testing only.
- **Advanced (Secure)**: Set `kafka_schema_registry_skip_cert_check = false` (default) and provide:
    - `kafka_schema_registry_ca_location`: Path to the CA/root certificates.
    - `kafka_schema_registry_private_key_file`: Absolute path to your private key. Ensure Proton has read permissions (mount correctly if using Docker/K8s).
    - `kafka_schema_registry_cert_file`: Path to the PEM certificate. Can be empty if the certificate is bundled with the private key.

**Subject Name Strategies**

The `subject_name_strategy` determines how the stream looks up schemas in the registry.

| Strategy | Behavior | Derived Subject Name | Typical Use Case |
| :--- | :--- | :--- | :--- |
| **TopicNameStrategy** | **Default.** Assumes one schema per topic. | `<topic>-value` | Standard topics where every message follows the same structure. Note `schema_subject_name` will be ignored if configured. |
| **RecordNameStrategy** | Supports **mixed schemas** in one topic. | `schema_subject_name` | Consuming a specific record type from a stream containing multiple Avro types. `schema_subject_name` is usually full qualified record name like `com.x.y.z.RecordA` |
| **TopicRecordNameStrategy** | Scopes record names to a specific topic. | `<topic>-<schema_subject_name>` | Mixed topics where you need to distinguish between same-named records in different environments. Consuming a specific record type from a stream containing multiple Avro types. `schema_subject_name` is usually full qualified record name like `com.x.y.z.RecordA`|

:::info
Note on Selective Consumption: When using `RecordNameStrategy` or `TopicRecordNameStrategy`, the external stream specifically targets the Schema ID associated with your provided `schema_subject_name`.

1. Automatic Filtering: Any records in the topic that use a different Schema ID (i.e., different record types) are automatically discarded during decoding.
2. Multi-Type Processing: To consume multiple record types from the same topic, you must create a separate external stream for each unique `schema_subject_name`.

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
