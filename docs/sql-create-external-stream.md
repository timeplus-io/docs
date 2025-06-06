# CREATE EXTERNAL STREAM

External stream for Kafka is official supported. The external stream for local log files is at technical preview. In Timeplus Enterprise, it also supports [another type of External Stream](/timeplus-external-stream) to read/write data for a remote Timeplus Enterprise.

## Kafka External Stream
```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] [db.]stream_name (<col_name1> <col_type>)
SETTINGS type='kafka',
         brokers='ip:9092',
         topic='..',
         security_protocol='..',
         username='..',
         password='..',
         sasl_mechanism='..',
         data_format='..',
         format_schema='..',
         one_message_per_row=..,
         kafka_schema_registry_url='..',
         kafka_schema_registry_credentials='..',
         ssl_ca_cert_file='..',
         ss_ca_pem='..',
         skip_ssl_cert_check=..,
         properties='..',
         config_file='..'
```

Please check the [Kafka External Stream](/proton-kafka) for more details about the settings, and [this doc](/tutorial-sql-connect-kafka) for examples to connect to various Kafka API compatible message platforms.

## Pulsar External Stream
```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
    (<col_name1> <col_type>)
SETTINGS
    type='pulsar', -- required
    service_url='pulsar://host:port',-- required
    topic='..', -- required
    jwt='..',
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
    io_threads=..,
    config_file='..'
```

Please check the [Pulsar External Stream](/pulsar-external-stream#ddl-settings) for more details.

## Timeplus External Stream
```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
SETTINGS
    type = 'timeplus',
    hosts = '<ip_or_host_of_timeplusd>',
    db = 'default',
    user = '<user>',
    password = '<password>',
    secure = <bool>,
    stream = '<stream_name>',
    config_file='..'
```
Settings:
* **hosts**: the IP or host for the remote timeplusd. When you set a set of hosts with ports, e.g. 'host1:port1,host2:port2', this will treat each host as a shard. `hosts` is required and there is no default value.
* **db**: the database name in the remote Timeplusd. The default value is 'default'.
* **user**: the user name for the remote Timeplusd. The default value is 'default'.
* **password**: the password for the remote Timeplusd. The default value is an empty string.
* **secure**: a bool for whether to use secure connection to the remote Timeplusd. The default value is false. Use port 9440 when `secure` is set to true, otherwise use port 8463.
* **stream**: the stream name in the remote Timeplusd. It's required and there is no default value.

### Examples

#### Migrate data from Timeplus Proton to Timeplus Enterprise
If you have deployed [Timeplus Proton](https://github.com/timeplus-io/proton) and want to load those data to a Timeplus Enterprise deployment, you cannot upgrade in place. You can use the Timeplus External Stream to migrate data.
:::info
The Timeplus Proton need to be 1.5.15 or above.
:::

For example, there is a stream `streamA` in Timeplus Proton, running on host1.

In your Timeplus Enterprise, you can create the stream with the same name and same schema. Then use a materialized view to load all data from Timeplus Proton to Timeplus Enterprise.

```sql
CREATE STREAM streamA(..);

CREATE EXTERNAL STREAM streama_proton
SETTINGS type='timeplus',hosts='host1',stream='streamA';

CREATE MATERIALIZED VIEW proton_to_tp_enterprise INTO streamA
AS SELECT * FROM streama_proton WHERE _tp_time>earliest_ts();
```
When all data in Proton has been imported into Timeplus Enterprise, you can drop the materialized view.

#### Upload data from edge server to the cloud
If you deploy Timeplus Proton or Timeplus Enterprise at edge servers, it can collect and process live data with high performance and low footprint. The important data can be uploaded to the other Timeplus Enterprise in the cloud when the internet is available.

For example, on the edge server, you collect the real-time web access log and only want to upload error logs to the server.

```sql
CREATE EXTERNAL STREAM stream_in_cloud
SETTINGS type='timeplus',hosts='cloud1',stream='..';

CREATE MATERIALIZED VIEW edge_to_cloud INTO stream_in_cloud
AS SELECT * FROM local_stream WHERE http_code>=400;
```
When the network is not available, you can pause the materialized view by:
```sql
SYSTEM PAUSE MATERIALIZED VIEW edge_to_cloud;
```
When the network is restored, you can resume it:
```sql
SYSTEM UNPAUSE MATERIALIZED VIEW edge_to_cloud;
```

### Limitations
This is a relatively new feature. There are some known limitations which we plan to improve later on.

* [table function](/functions_for_streaming#table) is not supported. In order to query all or part of the historical data, you can start a streaming query with `WHERE _tp_time>earliest_ts()` or `WHERE _tp_time>now()-2d`.
* [window functions](/functions_for_streaming) like tumble/hop are not working yet.
* can't read virtual columns on remote streams.
