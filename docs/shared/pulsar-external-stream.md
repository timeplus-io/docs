## Overview 

[Apache® Pulsar™](https://pulsar.apache.org/) is a multi-tenant, high-performance solution for server-to-server messaging.

In [Timeplus Enterprise v2.5](/enterprise-v2.5), we added the first-class integration for Apache Pulsar, as a new type of [External Stream](/external-stream). You can read or write data in Apache Pulsar or StreamNative Cloud. This is also available in Timeplus Proton, since v1.6.8.

## Create Pulsar External Stream

To create an external stream for Apache Pulsar, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
    (<col_name1> <col_type>)
SETTINGS
    type='pulsar', -- required
    service_url='pulsar://host:port',-- required
    topic='..', -- required
    jwt='..',
    config_file='..',
    data_format='..',
    format_schema='..',
    one_message_per_row=..,
    skip_server_cert_check=..,
    validate_hostname=..,
    ca_cert='..',
    client_cert='..',
    client_key='..',
    connections_per_broker=..,
    memory_limit=..,
    io_threads=..
```
### Connect to a local Apache Pulsar

If you have a local Apache Pulsar server running, you can run the following SQL DDL to create an external stream to connect to it.

```sql
CREATE EXTERNAL STREAM local_pulsar (raw string)
SETTINGS type='pulsar',
         service_url='pulsar://localhost:6650',
         topic='persistent://public/default/my-topic'
```

### Connect to StreamNative Cloud
If you have the access to [StreamNative Cloud](https://console.streamnative.cloud), you can run the following SQL DDL to create an external stream to connect to it, with a proper [API Key](https://docs.streamnative.io/docs/api-keys-overview) for a service account. Make sure you choose "Create API Key", instead of the "Get JWT Token (Depreciated)".

![screenshot](/img/pulsar_api_key.png)

```sql
CREATE EXTERNAL STREAM ext_stream (raw string)
SETTINGS type='pulsar',
         service_url='pulsar+ssl://pc-12345678.gcp-shared-usce1.g.snio.cloud:6651',
         topic='persistent://tenant/namespace/topic',
         jwt='eyJh..syFQ'
```

### DDL Settings

#### skip_server_cert_check
Default false. If set to true, it will accept untrusted TLS certificates from brokers.

#### validate_hostname

Default false. Configure whether it allows validating hostname verification when a client connects to a broker over TLS.
#### ca_cert
The CA certificate (PEM format), which will be used to verify the server's certificate.
#### client_cert
The certificate (PEM format) for the client to use mTLS authentication. [Learn more](https://pulsar.apache.org/docs/3.3.x/security-tls-authentication/).
#### client_key
The private key (PEM format) for the client to use mTLS authentication.
#### jwt
The JSON Web Tokens for the client to use JWT authentication. [Learn more](https://docs.streamnative.io/docs/api-keys-overview).
#### config_file
The `config_file` setting is available since Timeplus Enterprise 2.7. You can specify the path to a file that contains the configuration settings. The file should be in the format of `key=value` pairs, one pair per line. You can set the Pulsar credentials in the file.

Please follow the example in [Kafka External Stream](/kafka-source#config_file).
#### connections_per_broker
Default 1. Sets the max number of connection that this external stream will open to a single broker. By default, the connection pool will use a single connection for all the producers and consumers.
#### memory_limit
Default 0 (unlimited). Configure a limit on the amount of memory that will be allocated by this external stream.
#### io_threads
Default 1. Set the number of I/O threads to be used by the Pulsar client.

Like [Kafka External Stream](/kafka-source), Pulsar External Stream also supports all format related settings: `data_format`, `format_schema`, `one_message_per_row`, etc.

#### data_format
The supported values for `data_format` are:

- JSONEachRow: parse each row of the message as a single JSON document. The top level JSON key/value pairs will be parsed as the columns. [Learn More](#jsoneachrow).
- CSV: less commonly used. [Learn More](#csv).
- TSV: similar to CSV but tab as the separator
- ProtobufSingle: for single Protobuf message per message
- Protobuf: there could be multiple Protobuf messages in a single message.
- Avro
- RawBLOB: the default value. Read/write message as plain text.

For data formats which write multiple rows into one single message (such as `JSONEachRow` or `CSV`), two more advanced settings are available:

#### max_insert_block_size
`max_insert_block_size` to control the maximum number of rows can be written into one message.

#### max_insert_block_bytes
`max_insert_block_bytes` to control the maximum size (in bytes) that one message can be.
