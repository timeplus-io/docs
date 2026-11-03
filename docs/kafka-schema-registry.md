# Kafka Schema Registry

This page covers using Kafka Schema Registry with Timeplus. For general information about Protobuf and Avro data formats (including custom schemas without Schema Registry), see the [Data Formats](/data-formats) page.

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
    consume_schema_strategy = '..',
    kafka_schema_registry_url = 'http://url.to/my/schema/registry',
    kafka_schema_registry_credentials = 'API_KEY:API_SECRET',
    kafka_schema_registry_skip_cert_check = [true|false],
    kafka_schema_registry_ca_location = '..';
```

### Key Configuration Details

**1. Authentication & URL**
`kafka_schema_registry_url`: Must include the protocol (`http://` or `https://`).
`kafka_schema_registry_credentials`: Optional. Omit if your registry does not require an API key or Basic Auth.

Pass the credentials in `kafka_schema_registry_credentials`, in `username:password` format. The value is split at the first `:`, so the password may contain further colons. Credentials written into the URL (`https://user:password@host/...`) are **not** used: no `Authorization` header is sent, and a registry that requires authentication answers `401 Unauthorized`.

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
The schema subject specified in external stream is used in the following cases:
1. Auto inference columns name and type from schema when no column definition in create DDL.
2. Encode Timeplus data and write to Kafka.
3. **Filter messages by schema during reads** — when `consume_schema_strategy='single'`, only messages matching the schema identified by `schema_subject_name` and `subject_name_strategy` are consumed. Non-matching messages are silently skipped. `single` is the default for `RecordNameStrategy`, `TopicRecordNameStrategy` and custom strategies when `consume_schema_strategy` is not set; for `TopicNameStrategy` the default is `all`. The default depends on the release, see [availability by release](/kafka-source#consume_schema_strategy_versions). For details, see [consume_schema_strategy](/kafka-source#consume_schema_strategy).

For `consume_schema_strategy='all'`, the schema subject is not used for filtering; the schema ID is read directly from each Kafka record's Confluent header, the corresponding schema is fetched from the registry (cached), and all messages are decoded and mapped to stream columns by name.
:::

### Schema IDs and registry changes {#schema_ids}

A Kafka message carries the **ID** of the schema it was written with in its Confluent header, and a stream matches messages by this ID, not by the schema text. If the subject is deleted and the same schema is registered again, or the stream is pointed at another registry (for example one restored from a backup), the same schema text can receive a new ID, while the messages that are already in the topic keep the old ID.

What a stream does with such messages depends on `consume_schema_strategy`:

| `consume_schema_strategy` | Messages whose schema ID is not a registered version of the stream's subject |
| :--- | :--- |
| `single` | Skipped silently: the stream returns no rows for them and raises no error. |
| `all` | The ID is looked up in the registry. A schema that is already cached keeps decoding. An ID that is not cached is fetched from the registry: if the registry still knows the ID, the messages decode; if the registry no longer knows it (for example after the subject was deleted permanently), the query fails with `404 Schema <id> not found`. |

While the subject itself does not exist in the registry (deleted and not registered again), a `single` stream fails with `404` on `/subjects/<subject>/versions` instead.

A subject that is only soft-deleted does not change this for `all`: the registry still answers for the ID, so an `all` stream keeps decoding even with a cold cache. Only a permanent delete makes the ID unknown.

If a `single` stream suddenly returns nothing after a registry rebuild or restore, compare the schema IDs in the topic with the IDs registered under the subject.

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

For the data type mappings between Avro and Timeplus data type, please check the [Data Formats page](/data-formats#avro_types).
