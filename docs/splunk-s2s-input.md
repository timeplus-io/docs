# Splunk S2S Input

## Overview

The **Splunk S2S Input** emulates a Splunk indexer by listening on a TCP port and receiving data forwarded from Splunk forwarders. Splunk users can simply configure their forwarders in `outputs.conf` to point to the Splunk S2S Input IP address and port in Timeplus, and the input will handle the rest.

## Create Splunk S2S Input

```sql
CREATE INPUT splunk_s2s_input
SETTINGS
    type='splunk-s2s',
    version='v4',
    target_stream=<target_stream_name>,
    tcp_port=<bind_tcp_port>,
    listen_host=<listen_host>,
    event_breaker=<event_breaker_regex>,
    event_breaker_buffer_timeout_ms=<timeout_ms>,
    force_break_event_size=<event_size>,
    batch_size=<batch_size>,
    batch_timeout_ms=<batch_timeout_ms>,
    tokens=<tokens>,
    drop_control_fields=<true | false>,
    extract_metrics=<true | false>,
    max_channels=<max_channels>,
    channel_idle_timeout_ms=<channel_idle_timeout_ms>,
    max_tcp_connections=<max_tcp_connections>,
    send_timeout=<send_timeout>,
    receive_timeout=<receive_timeout>,
    idle_connection_timeout=<idle_connection_timeout>,
    receive_buffer_size=<receive_buffer_size>;
```

**Settings**
- `type`: Type to indicate the input protocol. `'splunk-s2s'`.
- `version`: Splunk S2S protocol version. Default `'v4'` and it is the only S2S version Timeplus supports for now. Default is **'v4'**.
- `target_stream`: The name of the target stream that stores incoming data after S2S protocol parsing.
- `tcp_port`: The TCP port on which the input server listens for incoming connections. Default is **9997**.
- `listen_host`: The network interface or host address on which the input server listens. Default is **'0.0.0.0'**.
- `event_breaker`: Event breaker regex which is used to break data chunk into events according to this regex. Used for data forwarded by Splunk Univeral Forwarder. Default is empty which will be defined by the system (usually the **carriage return** is the event breaker).
- `event_breaker_buffer_timeout_ms`: Max data buffering threshold before triggering the event breaking. Default is **2000**. 
- `force_break_event_size`: Event size threshold in bytes when reached will force event breaking. Default is **4096**.
- `batch_size`: Batch size when writing to the target stream. Default is **1000**.
- `batch_timeout_ms`: Batch timeout when writing to the target stream. Default is **500**.
- `tokens`: Whielist token separated by ';' Only when Splunk Forwarder's communicated token is in this whitelist, the TCP connection will be established. Default is **empty**. 
- `drop_control_fields`: tell if dropping Splunk Forwarder's control fields in the protocol. Default **true**. 
- extract_metrics; Tell if extracting metrics in the protocol. Default is **false**. 
- `max_channels`: Max outstanding channles in this input. Default is **1000**. 
- `channel_idle_timeout_ms`: If this threshold reaches, the channel is subject to be garbage collected. Default is **600000**. 
- `max_tcp_connections`: Max TCP connection for this input. Connection will be rejected when this threshold reaches. Default is **100**.
- `send_timeout`: Socket send timeout in seconds when writing response to Splunk Forwarder. Default is **300**.
- `receive_timeout`: Socket receive timeout in seconds when receiving data from Spunk Forwarder. Default is **300**.
- `idle_connection_timeout`: Idle TCP connection timeout threshold in seconds. When this threshold reaches, the TCP connection between Splunk Forwarder and the input will be closed / garbaged collected. Default is **3600**. 
- `receive_buffer_size`: Socket data receiving buffer size in bytes. Default is **67108864**. 

:::note
The target stream for Splunk S2S Input requires a fixed schema (without [retention policies](/append-stream-ttl)), shown below.

```sql
CREATE STREAM s2s_target_stream
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

**Example**:

```sql
-- Create target stream to hold the incoming data
CREATE STREAM s2s_target_stream
(
    _raw string, -- required
    _index string, -- required
    host string, -- required
    source string, -- required
    sourcetype string, -- required
    fields map(string, string) -- optional
);

-- Create S2S input and write the incoming data to target stream
CREATE INPUT splunk_s2s_input
SETTINGS
    type = 'splunk-s2s',
    tcp_port = 9997,
    target_stream = 's2s_target_stream'
COMMNET 'Splunk S2S Input Test'
```

## Splunk Forwarder Configuration

Splunk users can simply update `outputs.conf` to point to the Splunk S2S input in Timeplus. Note that compression is supported by the Splunk S2S input.

**Example**
```
% cat etc/system/local/outputs.conf
[tcpout]
disabled = false
defaultGroup = timeplus
enableOldS2SProtocol = false

[tcpout:timeplus]
server = 32q80q8.timeplus:9997 # <<< Point to Splunk S2S input IP:Port in Timeplus
sendCookedData = true
compressed = false

# As of Splunk 6.5, using forceTimebasedAutoLB is no longer recommended. Ensure this is left at default for UFs
# # forceTimebasedAutoLB = false
```
