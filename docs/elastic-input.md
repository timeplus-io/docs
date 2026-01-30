# ElasticSearch HTTP Input

## Overview

The **ElasticSearch HTTP Input** emulates ElasticSearch `/_bulk` endpoint by listening on a HTTP port and receiving events posted by ElasticSearch clients / Elastic Beats. ElasticSearch users can simply configure their clients / Beats use ElasticSearch HTTP Input IP address and port in Timeplus, and the input will handle the rest.

## Create ElasticSearch HTTP Input

```sql
CREATE INPUT <elastic_input> 
SETTINGS
    type='elastic',
    target_stream=<target_stream_name>,
    tcp_port=<bind_tcp_port>,
    listen_host=<listen_host>
COMMENT '<comments>';
```

**Settings**
- `type`: Type to indicate the input protocol. `'elastic'`.
- `target_stream`: The name of the target stream that stores incoming data after ElasticSearch `/_bulk` endpoint protocol parsing.
- `tcp_port`: The TCP port on which the input server listens for incoming connections. Default is **9997**.
- `listen_host`: The network interface or host address on which the input server listens. Default is **'0.0.0.0'**.

:::note
The target stream for ElasticSearch HTTP Input requires a fixed schema, shown below.

```sql
CREATE STREAM elastic_target_stream
(
    _raw string, -- required
    _index string, -- required
    _id string -- required
);
```
:::

:::info
You probably like to fine tune the column [compression codec](/append-stream-codecs), [retention policies](/append-stream-ttl) and indexes [indexes](/append-stream-indexes) when provisioning the target stream if the target stream's historical store is enabled and is used to serve applications.
:::

**Example**:

```sql
-- Create target stream to hold the incoming data
CREATE STREAM elastic_target_stream
(
    _raw string, -- required
    _index string, -- required
    _id string -- required
);

-- Create ElasticSearch input and write the incoming data to target stream
CREATE INPUT splunk_hec_input
SETTINGS
    type = 'elastic',
    tcp_port = 9200,
    target_stream = 'elastic_target_stream'
COMMNET 'Elastic HTTP Input Test'
```

## ElasticSearch Clients / Beats Configuration

ElasticSearch users can simply update the `/_bulk` endpoint clients / beats to use the Elastic HTTP input IP:Port in Timeplus to post events. 

**Example**

The following curl emulates a Elastic client to post events to Elastic HTTP Input in Timeplus.

```
curl -X POST "4qfar3.timeplus:9200/_bulk" \
    -H "Content-Type: application/x-ndjson" \
    -d '{"index":{"_index":"test","_id":"1"}}\n{"field1":"value1"}\n
{"delete":{"_index":"test","_id":"2"}}\n
{"create":{"_index":"test","_id":"3"}}\n{"field1":"value3"}\n
{"update":{"_id":"1","_index":"test"}}\n{"doc":{"field2":"value2"}}\n'
```

The following illustrate filebeat configuration change to use Elastic Input in Timeplus.

```
% /etc/filebeat/filebeat.yml
...
output.elasticsearch:
  hosts: ["http://4qfar3.timeplus:9200"] # <<< Point to Elastic Input in Timeplus
  username: "timeplus"
  password: "timeplus_password"
```
