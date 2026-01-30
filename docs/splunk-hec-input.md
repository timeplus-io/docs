# Splunk HEC Input

## Overview

The **Splunk HEC Input** emulates Splunk indexer's **HTTP Event Collector** `/services/collector/event` and `/services/collector/raw` endpoints by listening on a HTTP port and receiving events posted by Splunk HEC clients / agents / AddOns. Splunk users can simply configure their clients / agents / AddOns to use Splunk HEC Input IP address and port in Timeplus, and the input will handle the rest.

## Create Splunk HEC Input

```sql
CREATE INPUT <splunk_hec_input>
SETTINGS
    type='splunk-hec',
    target_stream=<target_stream_name>,
    tcp_port=<bind_tcp_port>,
    listen_host=<listen_host>
COMMENT '<comments>';
```

**Settings**
- `type`: Type to indicate the input protocol. `'splunk-hec'`.
- `target_stream`: The name of the target stream that stores incoming data after Splunk HEC protocol parsing.
- `tcp_port`: The TCP port on which the input server listens for incoming connections. Default is **9997**.
- `listen_host`: The network interface or host address on which the input server listens. Default is **'0.0.0.0'**.

:::note
The target stream for Splunk HEC Input requires a fixed schema, shown below.

```sql
CREATE STREAM hec_target_stream
(
    _raw string, -- required
    _index string, -- required
    host string, -- required
    source string, -- required
    sourcetype string, -- required
    fields map(string, string) -- optional
);
```
:::

:::info
You may want to fine-tune the target stream when provisioning it, especially if its historical store is enabled and it will serve applications. This includes settings such as:

- [Compression codec](/append-stream-codecs)
- [Retention policies](/append-stream-ttl)
- [Indexes](/append-stream-indexes)

Alternatively, you can disable the historical store entirely by using `SETTIGNS storage_type='streaming'` and use the target stream as a persistent, queryable queue. In this scenario, fine-tuning compression, retention, and indexes is not necessary.
:::

**Example**:

```sql
-- Create HEC input and write the incoming data to target stream
CREATE INPUT splunk_hec_input
SETTINGS
    type = 'splunk-hec',
    tcp_port = 8088,
    target_stream = 'hec_target_stream'
COMMNET 'Splunk HEC Input Test'
```

## Splunk HEC Client Configuration

Splunk users can simply update the HEC clients / AddOns use the Splunk HEC input IP:Port and the **UUID of the HEC input** as the authentication token in Timeplus to post events. 

To get the UUID of the Splunk HEC Input, do

```sql
SHOW CREATE <hec_input_name> SETTINGS show_uuid=1;
```

**Example**

The following curl emulates a HEC client to post events to Splunk HEC Input in Timeplus.

```
# JSON event
curl -X POST http://4qfar3.timeplus:8088/services/collector/event \
    -H "Authorization: Splunk 6ac6187d-acfe-4269-a9f7-d68a33a91ae2" \
    -H "Content-Type: application/json" \
    -d '{"sourcetype":"access", "source":"/var/log/access.log", "event": {"message":"Access log test message"}}'

# Raw blob
curl -X POST http://4qfar3.timeplus:8088/services/collector/raw \
    -H "Authorization: Splunk 6ac6187d-acfe-4269-a9f7-d68a33a91ae2" \
    -d 'This is a raw log line'
```
