## Overview 

Timeplus allows users to **read from** and **write to** Apache Kafka (and compatible platforms like **Confluent Cloud** and **Redpanda**) using **Kafka External Streams**.

By combining external streams with [Materialized Views](/materialized-view) and target streams, users can build robust **real-time streaming pipelines**.

## Create Kafka External Stream

Use the following SQL command to create a Kafka external stream:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] <stream_name>
    (<col_name1> <col_type>)
SETTINGS
    type='kafka', -- required
    brokers='ip:9092', -- required
    topic='..', -- required
    security_protocol='..',
    sasl_mechanism='..',
    username='..',
    password='..',
    config_file='..',
    data_format='..',
    format_schema='..',
    one_message_per_row=..,
    kafka_schema_registry_url='..',
    kafka_schema_registry_credentials='..',
    ssl_ca_cert_file='..',
    ssl_ca_pem='..',
    skip_ssl_cert_check=..,
    properties='..',
    named_collection='..',
    subject_name_strategy='..',
    schema_subject_name='..',
    consume_schema_strategy='..';
```

### Settings

#### type

Must be set to `kafka`. Compatible with:

* Apache Kafka
* Confluent Platform or Cloud
* Redpanda
* Other Kafka-compatible systems

#### brokers

Comma-separated list of broker addresses (host\:port), e.g.:

```
kafka1:9092,kafka2:9092,kafka3:9092
```

#### topic

Kafka topic name to connect to.

#### security_protocol

The supported values for `security_protocol` are:

- PLAINTEXT: when this option is omitted, this is the default value.
- SASL_SSL: when this value is set, username and password should be specified.
  - If users need to specify own SSL certification file, add another setting `ssl_ca_cert_file='/ssl/ca.pem'`. Users can also put the full content of the pem file as a string in the `ssl_ca_pem` setting.
  - To skip the SSL certification verification: `skip_ssl_cert_check=true`.

#### sasl_mechanism

The supported values for `sasl_mechanism` are:

- PLAIN: when setting security_protocol to SASL_SSL, this is the default value for sasl_mechanism.
- SCRAM-SHA-256
- SCRAM-SHA-512
- AWS_MSK_IAM (for AWS MSK IAM role-based access when EC2 or Kubernetes pod is configured with a proper IAM role)

#### username / password

Required when `sasl_mechanism` is set to SCRAM-SHA-256 or SCRAM-SHA-512. 

Alternatively, use [`config_file`](#config_file) to securely pass credentials.

#### config_file

Use this to point to a file containing key-value config lines for Kafka external stream, e.g.:

```properties
username=my_username
password=my_password
data_format='Avro'
one_message_per_row=true
```

This is especially useful in Kubernetes environments with secrets managed via [HashiCorp Vault](https://learn.hashicorp.com/tutorials/vault/kubernetes-sidecar).

**HarshiCorp Vault injection example:**

```yaml
annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/agent-inject-status: "update"
        vault.hashicorp.com/agent-inject-secret-kafka-secret: "secret/kafka-secret"
        vault.hashicorp.com/agent-inject-template-kafka-secret: |
          {{- with secret "secret/kafka-secret" -}}
          username={{ .Data.data.username }}
          password={{ .Data.data.password }}
          {{- end }}
        vault.hashicorp.com/role: "vault-role"
```

:::info

Please note values in settings in the DDL will override those in config_file and it will only merge the settings from the config_file which are not explicitly specified in the DDL. 

:::


#### data_format

Defines how Kafka messages are parsed and written. Supported formats are

| Format           | Description                              |
| ---------------- | ---------------------------------------- |
| `JSONEachRow`    | Parses one JSON document per line        |
| `CSV`            | Parses comma-separated values            |
| `TSV`            | Like CSV, but tab-delimited              |
| `ProtobufSingle` | One Protobuf message per Kafka message   |
| `Protobuf`       | Multiple Protobuf messages per Kafka msg |
| `Avro`           | Avro-encoded messages                    |
| `RawBLOB`        | Raw text, no parsing (default)           |

For detailed information on each format, including type mappings, examples, and usage with Protobuf and Avro, see the [Data Formats](/data-formats) page.

#### format_schema

Required for these data formats:

* `ProtobufSingle`
* `Protobuf`
* `Avro`

#### one_message_per_row

Set to `true` to ensure each Kafka message maps to exactly **one JSON document**, especially when writing with `JSONEachRow`.

#### kafka_schema_registry_url

URL of the [Kafka Schema Registry](/kafka-schema-registry), including the protocol is required (`http://` or `https://`).

#### kafka_schema_registry_credentials

Credentials for the registry, in `username:password` format.

#### ssl_ca_cert_file / ssl_ca_pem

Use either:

* `ssl_ca_cert_file='/path/to/cert.pem'`
* `ssl_ca_pem='-----BEGIN CERTIFICATE-----\n...'`

#### skip_ssl_cert_check

* Default: `false`
* Set to `true` to **bypass SSL verification**.

#### properties

Used for advanced configurations. These settings are passed directly to the Kafka client ([librdkafka config options](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)) to fine tune the Kafka producer, consumer or topic behaviors.

For more, see the `Properties for Kafka client` section.

#### named_collection

**Named Collections** allow you to group shared configuration settings (such as credentials and connection details) into a single reusable object. This simplifies your DDL statements and enhances security by masking sensitive information when users execute `SHOW CREATE STREAM`.

**Key Benefits**

- **Reusability**: Define connection parameters once and apply them to multiple streams.

- **Security**: Credentials stored within a Named Collection are hidden from standard `SHOW CREATE` outputs.

- **Maintainability**: Update credentials in one place rather than modifying every individual stream DDL.

**Example Usage**

The following example demonstrates how to define a Named Collection and reference it within an external stream.

**1. Create a Named Collection**

Define the common connection and security settings for your Kafka cluster.

```sql
CREATE NAMED COLLECTION kafka_nc AS
    brokers='127.0.0.1:9092',
    skip_ssl_cert_check='true',
    security_protocol='SASL_PLAINTEXT',
    sasl_mechanism='SCRAM-SHA-256',
    username='admin_user',
    password='admin';
```

**2. Create an External Stream**

Reference the collection using the `named_collection` property within the `SETTINGS` clause.

```sql
CREATE EXTERNAL STREAM test_kafka_es_nc(raw string)
SETTINGS
    type='kafka',
    topic='mytopic',
    named_collection='kafka_nc';
```

For more detailed syntax of named collection, please refer to the [Named Collection](/named-collection) documentation.

#### subject_name_strategy

Determines how the stream looks up schemas in the Kafka Schema Registry. Supported values:

| Strategy | Behavior | Derived Subject Name |
| :--- | :--- | :--- |
| `TopicNameStrategy` | **Default.** Assumes one schema per topic. `schema_subject_name` is ignored. | `<topic>-value` |
| `RecordNameStrategy` | Supports mixed schemas in one topic. `schema_subject_name` is required. | `schema_subject_name` (fully qualified record name) |
| `TopicRecordNameStrategy` | Scopes record names to a specific topic. `schema_subject_name` is required. | `<topic>-<schema_subject_name>` |

For more details, see [Kafka Schema Registry](/kafka-schema-registry).

#### schema_subject_name

Specifies the subject name for schema lookups in the Schema Registry. Required when `subject_name_strategy` is set to `RecordNameStrategy` or `TopicRecordNameStrategy`. Typically the fully qualified record name, e.g. `com.example.avro.UserRecord`.

#### consume_schema_strategy

Controls how Kafka messages with different Confluent Schema Registry schema IDs are processed. This setting is useful when a Kafka topic contains messages encoded with multiple Avro or Protobuf schemas (e.g., via `RecordNameStrategy` or `TopicRecordNameStrategy`).

Supported values:

| Value | Default | Behavior |
| :--- | :--- | :--- |
| `single` | **Yes** | Only consume messages matching the schema identified by `schema_subject_name` and `subject_name_strategy`. Non-matching messages are silently skipped. |
| `all` | No | Decode **all** messages by their schema ID, mapping fields to stream columns by name. Missing fields get default/null values. |
| `raw` | No | Decode messages by their schema ID and stringy the result into JSON format text. No schema registry lookup or deserialization occurs. The external stream must have exactly one physical column of type `String`. |
