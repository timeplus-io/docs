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
- SSL: SSL/TLS encrypted connection without SASL authentication.
- SASL_PLAINTEXT: SASL authentication (username and password) over a plain connection.
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
| `RawBLOB`        | Raw text, no parsing                     |

If `data_format` is omitted, it defaults to `RawBLOB` when the external stream has a single column in `string` type, otherwise it defaults to `JSONEachRow`.

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

#### schema_message_name

Protobuf only. Selects which top-level message of the registry schema the stream uses when that schema defines more than one message. Not available in 3.3.3 and earlier, or in 3.4.1; see [availability by release](#consume_schema_strategy_versions).

- Accepts the short message name (e.g. `Refund`) or its fully qualified name (e.g. `com.example.Refund`). The default is empty, which selects the **first** message defined in the schema.
- If the stream is created without a column list, the columns are inferred from the selected message.
- With [`consume_schema_strategy`](#consume_schema_strategy) `single`, only messages of the selected type are consumed. Frames that carry the same schema ID but belong to a sibling message type are skipped instead of failing the read. This applies to the releases that have `schema_message_name` (see [availability by release](#consume_schema_strategy_versions)). In 3.4.1, `single` does not skip sibling messages of the same schema ID.
- With `all`, every message is decoded by its own schema and mapped to the stream's columns by name, so `schema_message_name` only affects column inference.
- A name that does not exist in the schema is rejected with an error that lists the available messages.

For example, if the schema registered under `orders-value` defines both `Order` and `Refund`:

```sql
CREATE EXTERNAL STREAM refunds
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='orders',
         data_format='ProtobufSingle',
         kafka_schema_registry_url='http://localhost:8081',
         schema_message_name='Refund',
         consume_schema_strategy='single';
```

The columns are inferred from `Refund`, and `consume_schema_strategy='single'` limits the stream to `Refund` messages. Without that setting (and without a `subject_name_strategy`), the effective strategy is `all`: the columns are still inferred from `Refund`, but every message of the topic is returned, and the `Order` rows get the default value (0) for `amount`.

#### consume_schema_strategy

Controls how Kafka messages with different Confluent Schema Registry schema IDs are processed. This setting is useful when a Kafka topic contains messages encoded with multiple Avro or Protobuf schemas (e.g., via `RecordNameStrategy` or `TopicRecordNameStrategy`).

Supported values:

| Value | Default | Behavior |
| :--- | :--- | :--- |
| `single` | Default for `RecordNameStrategy`, `TopicRecordNameStrategy` and custom strategies in the releases that derive the default; in 3.4.1 it is the default for every strategy (see [availability by release](#consume_schema_strategy_versions)) | Only consume messages matching the schema identified by `schema_subject_name` and `subject_name_strategy`. Non-matching messages are silently skipped. |
| `all` | Default for `TopicNameStrategy` (or when `subject_name_strategy` is not set) in the releases that derive the default; not the default in 3.4.1 (see [availability by release](#consume_schema_strategy_versions)) | Decode **all** messages by their schema ID, mapping fields to stream columns by name. Missing fields get default/null values. |
| `raw` | No | Decode messages by their schema ID and stringy the result into JSON format text. No schema registry lookup or deserialization occurs. The external stream must have exactly one physical column of type `String`. |

##### Availability and default by release {#consume_schema_strategy_versions}

The default differs between release lines. Check the row for the version you run:

| Timeplus Enterprise | `consume_schema_strategy` | Default when not set | `schema_message_name` |
| :--- | :--- | :--- | :--- |
| 3.3.3 and earlier (including 2.8.x and 3.2.x) | Not available | – | Not available |
| 3.3.4 and later 3.3.x | Available | Derived from `subject_name_strategy` (see below) | Available |
| 3.4.1 | Available | Always `single`, even for `TopicNameStrategy` (see the note below the table) | Not available |
| 3.4.2 and later | Available | Derived from `subject_name_strategy` (see below) | Available |

In 3.4.1, `single` is also less selective than in the other releases:

- A Protobuf message of a sibling type that shares the stream's schema ID is **not** skipped. It is decoded and returned with the stream's columns, so a stream bound to one message type can return rows of its siblings.
- `single` accepts only the latest registered version of the subject. For an Avro subject that has been evolved, messages written with an earlier version are skipped, so they disappear from the results without an error.

Both are fixed in 3.4.2 and later: there `single` accepts every registered version of the subject, and skips sibling messages of the same schema ID.

Where the default is derived, the effective strategy depends on `subject_name_strategy`:

| `subject_name_strategy` | Effective `consume_schema_strategy` when not set |
| :--- | :--- |
| not set, or `TopicNameStrategy` | `all` |
| `RecordNameStrategy`, `TopicRecordNameStrategy`, or a custom strategy | `single` |

An explicitly configured value always takes precedence. The derived default is not stored in the stream definition, so it is not shown by `SHOW CREATE STREAM`.

:::info
- With `single`, `SELECT count()` on the stream decodes and filters the messages, so it returns the number of rows the stream yields rather than the raw number of Kafka messages. In 3.4.1, `count()` returns the raw number of Kafka messages.
- Changing `consume_schema_strategy` with `ALTER STREAM ... MODIFY SETTING` updates the stream definition immediately, but the running stream applies it only when it is reloaded (for example after a server restart).
- A stream that sets `consume_schema_strategy` or `schema_message_name` explicitly is rejected by a release that does not have the setting (see the table above): `CREATE` fails with an unknown-setting error (checked on 3.3.3 for both settings, and on 3.4.1 for `schema_message_name`), and after a downgrade the stream is not loaded (checked from 3.3.4 to 3.3.3 for a stream with an explicit `consume_schema_strategy`). In particular, 3.4.1 has `consume_schema_strategy` but not `schema_message_name`, so a Protobuf stream created on 3.3.4 or 3.4.2 with `schema_message_name` cannot be used on 3.4.1. Streams that rely on the default `consume_schema_strategy` can be loaded.
- Upgrading from 3.4.1 to 3.4.2 or later: streams that use `TopicNameStrategy` (or no `subject_name_strategy`) and do not set `consume_schema_strategy` change from `single` to `all`. Messages with a schema ID outside the stream's subject, which 3.4.1 skipped, are now decoded. Set `consume_schema_strategy='single'` to keep the 3.4.1 behavior. Streams that use `RecordNameStrategy`, `TopicRecordNameStrategy` or a custom strategy stay on `single`, but after the upgrade they skip sibling messages and read frames written with earlier schema versions, which 3.4.1 did not.
- Upgrading from 3.3.3: Avro streams keep their previous behavior. Protobuf streams that use `RecordNameStrategy` or `TopicRecordNameStrategy` consumed every message in 3.3.3 and now filter by default; set `consume_schema_strategy='all'` to keep consuming every message.
:::
