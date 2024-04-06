# Connect to Kafka, Confluent, Redpanda, Aiven, WarpStream, Upstash, etc.

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

Alternatively, you can put the full content of the CA pem file in the DDL SQL. This could help you to setup secure connections with Aiven Kafka without man-in-middle attack, but in the case you cannot set a local file path, such as using Docker or Kubernetes, or in Timeplus Cloud.

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
         brokers='serverless.prod-z.us-east-1.warpstream.com:9092',
         topic='topic',
         security_protocol='SASL_SSL', 
         username='..', 
         password='..'
```

### Connect to Upstash{#connect-upstash}

You can connect Proton with Upstash Serverless Kafka.

Example:

```sql
CREATE EXTERNAL STREAM ext_stream(raw string)
SETTINGS type='kafka', 
         brokers='grizzly-1234-us1-kafka.upstash.io:9092',
         topic='topic',
         security_protocol='SASL_SSL', 
         sasl_mechanism='SCRAM-SHA-256',
         username='..', 
         password='..'
```

More detailed instructions are available on [Upstash Docs](https://upstash.com/docs/kafka/integrations/proton).