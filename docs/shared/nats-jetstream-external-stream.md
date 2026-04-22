## Overview

[NATS](https://nats.io/) is a high-performance, lightweight messaging system. NATS JetStream is the built-in streaming layer for NATS that provides durable, replayable message streams with advanced features like message acknowledgment, persistence, and consumer management.

Timeplus provides first-class integration for NATS JetStream as a new type of [External Stream](/external-stream). You can read or write data in NATS JetStream using SQL queries, similar to how you work with Kafka or Pulsar external streams.

## Create NATS JetStream External Stream

Use the following SQL command to create a NATS JetStream external stream:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] <stream_name>
    (<col_name1> <col_type>)
SETTINGS
    type='nats_jetstream', -- required
    url='nats://host:port', -- required
    stream_name='..', -- required
    subject='..', -- required
    consumer_stall_timeout_ms=..,
    username='..',
    password='..',
    token='..',
    secure=<true|false>,
    ssl_ca_cert_file='..',
    skip_ssl_cert_check=<true|false>,
    ssl_cert_file='..',
    ssl_key_file='..',
    data_format='..',
    format_schema='..',
    one_message_per_row=..,
    config_file='..',
    named_collection='..';
```

### Settings

#### type

Must be set to `nats_jetstream`.

#### url

The NATS server URL.
Example: `nats://localhost:4222`

#### stream_name

The name of the JetStream stream to connect to. The stream must exist on the NATS server before creating the external stream. Timeplus validates the stream exists during creation.

#### subject

The NATS subject to subscribe or publish messages. Wild cards `*` and `>` are supported.

For inserts, messages are published to this subject unless overwritten by the `_nats_subject` column.

#### consumer_stall_timeout_ms

Stall detection timeout in milliseconds. If no progress is made for this duration, Timeplus will recreate the subscription to recover from potential stalls.

Default: 60000

### Authentication Settings

Timeplus supports multiple authentication mechanisms for NATS. Only one method can be used at a time.

#### username / password

Username and password authentication.

#### token

Token-based authentication.

### TLS Settings

#### secure

Set 'true' to use a secure (SSL/TLS) connection.

#### ssl_ca_cert_file

Path to the CA certificate file for TLS verification.

#### skip_ssl_cert_check

Set 'true' to skip server certificate verification.

:::warning
This is fine for tests but use with caution since this is not secure.
 :::

#### ssl_cert_file / ssl_key_file

For mTLS (mutual TLS), provide both the client certificate and private key files path. Both must be specified together.

The certificates must be in PEM format and must be sorted starting with the subject's certificate, followed by intermediate CA certificates if applicable, and ending at the highest level (root) CA.

The private key file format supported is also PEM.

### Data Format Settings

#### data_format

Defines how NATS messages are parsed and written.

Common formats include:

| Format | Description |
|--------|-------------|
| `RawBLOB` | Raw text, no parsing |
| `JSONEachRow` | One JSON document per line |
| `CSV` | Comma-separated values |
| `TSV` | Tab-separated values |
| `ProtobufSingle` | One Protobuf message per NATS message |
| `Protobuf` | Multiple Protobuf messages per NATS message |
| `Avro` | Avro-encoded messages |

#### format_schema

Required for `ProtobufSingle`, `Protobuf`, and `Avro` formats. Defines the schema for message serialization.

#### one_message_per_row

Set to `true` to ensure each NATS message maps to exactly **one JSON document**, especially when writing with `JSONEachRow`.

:::info
When `_tp_message_headers` column is defined, `one_message_per_row` must be `true` and will be automatically set.
:::

### Other Settings

#### config_file

Path to a configuration file containing key-value pairs. Useful for managing credentials securely, especially in Kubernetes environments with secrets managed via HashiCorp Vault.

Example config file:
```properties
username=my_username
password=my_password
data_format=JSONEachRow
one_message_per_row=true
```

#### named_collection

Named Collections allow you to group shared configuration settings into a reusable object. This simplifies DDL and enhances security by masking sensitive information.

Example:
```sql
CREATE NAMED COLLECTION nats_nc AS
    url='nats://localhost:4222',
    username='admin_user',
    password='admin';

CREATE EXTERNAL STREAM test_nats_es(raw string)
SETTINGS
    type='nats_jetstream',
    stream_name='my_stream',
    subject='my.subject',
    named_collection='nats_nc';
```

For more details, refer to [Named Collection](/named-collection) documentation.