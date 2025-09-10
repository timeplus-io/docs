## Overview 

Timeplus allows users to **read from** and **write to** Apache Kafka (and compatible platforms like **Confluent Cloud** and **Redpanda**) using **Kafka External Streams**.

By combining external streams with [Materialized Views](/view#m_view) and [Target Streams](/view#target-stream), users can build robust **real-time streaming pipelines**.

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
    properties='..'
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

For more, see the [Advanced Settings](#advanced_settings) section.
