# Connect to Kafka, Confluent, Redpanda, Aiven, WarpStream, etc.

### Connect to local Kafka or Redpanda {#connect-kafka}

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka',
         brokers='localhost:9092',
         topic='github_events'
```

### Connect to Confluent Cloud{#connect-confluent}

Example:

```sql
CREATE EXTERNAL STREAM ext_github_events(raw string)
SETTINGS type='kafka',
         brokers='pkc-1234.us-west-2.aws.confluent.cloud:9092',
         topic='github_events',
         security_protocol='SASL_SSL',
         username='..',
         password='..'
```

### Connect to Redpanda Cloud{#connect-rp-cloud}

Example:

```sql
CREATE EXTERNAL STREAM hello(raw string)
SETTINGS type='kafka',
         brokers='abc.any.us-east-1.mpx.prd.cloud.redpanda.com:9092',
         topic='hello-world',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='..',
         password='..'
```

### Connect to Aiven for Apache Kafka{#connect-aiven}

You can connect Proton with an Aiven for Apache Kafka service.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='..',
         ssl_ca_cert_file='/kafka.cert'
```

Make sure the `ssl_ca_cert_file` can be accessed via Proton. You can do so via:

```bash
chown timeplus:timeplus kafka.cert
chmod 400 kafka.cert
```

Alternatively, you can put the full content of the CA pem file in the DDL SQL. This could help you to setup secure connections with Kafka brokers which use a certificate that is signed by a CA certificate that Proton does not know. You may want to put the CA content inline, when you cannot set a local file path or don't want to mount or modify files, such as using Docker or Kubernetes, or in Timeplus Cloud.

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='..',
         ssl_ca_pem='-----BEGIN CERTIFICATE----\nMIIEQTCCAqmgAwIBAgIU..ph0szPew==\n-----END CERTIFICATE-----'
```



If you want to skip verifying the CA (not recommended), you can create the external stream in the following way:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='name.a.aivencloud.com:28864',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='SCRAM-SHA-256',
         username='avnadmin',
         password='..',
         skip_ssl_cert_check=true
```

### Connect to WarpStream{#connect-warp}

You can connect Proton with local deployment of WarpStream or WarpStream Serverless Cloud.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka',
         brokers='serverless.warpstream.com:9092',
         topic='topic',
         security_protocol='SASL_SSL',
         sasl_mechanism='PLAIN',
         username='..',
         password='..'
```
`sasl_mechanism` can be either `PLAIN` or `SCRAM-SHA-512`, but cannot be `SCRAM-SHA-256`.
