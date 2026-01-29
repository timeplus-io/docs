# Splunk S2S Input

## Overview

Splunk S2S input emulates Splunk indexer server listening on a TCP port and wait for Splunk forwarders to forwarder data to it. Splunk users can just point Splunk forwarders to Splunk S2S input in Timeplus, the input will take care of the rest. 

## Create S2S Input

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
    receive_buffer_size=<receive_buffer_size>
```

**Settings**
- `type`: Type to indicate the input protocol. `'splunk-s2s'`.
- `version`: Splunk S2S protocol version. Default `'v4'` and it is the only S2S version Timeplus supports for now.
- `target_stream`: The name of the target stream that stores incoming data after S2S protocol parsing.
- `tcp_port`: The TCP port on which the input server listens for incoming connections.
- `listen_host`: The network interface or host address on which the input server listens.
- `event_breaker`: Event breaker regex which is used to break data chunk into events according to this regex. Used for data forwarded by Splunk Univeral Forwarder. Default value is carriage return and it is defined by the system.
- `event_breaker_buffer_timeout_ms`: Max data buffering threshold before triggering the event breaking. Default is **2000**. 
- `force_break_event_size`: Event size threshold when reached will force event breaking. Default is **4096**
- `batch_size`: Batch size when writing to the target stream. Default is **1000**
- `batch_timeout_ms`: Batch timeout when writing to the target stream. Default is **500**.
- `tokens`: Whielist tokens. Only when Splunk Forwarder's communicated token is in this whitelist, the TCP connection will be established. Default is empty. 
- `drop_control_fields`: tell if dropping Splunk Forwarder's control fields in the protocol. Default **true**. 
- extract_metrics; Tell if extracting metrics in the protocol. Default is **false**. 
- `max_channels`: Max outstanding channles in this input. Default is **1000*. 
- `channel_idle_timeout_ms`: If this threshold reaches, the channel is subject to be garbage collected. 
- `max_tcp_connections`: Max TCP connection for this input. Connection will be rejected when this threshold reaches. Default is **100**.

- `send_timeout`: Socket send timeout when writing response to Splunk Forwarder.
- `receive_timeout`: Socket receive timeout when receiving data from Spunk Forwarder.
- `idle_connection_timeout`: When this threshold reaches, the TCP connection between Splunk Forwarder and the input will be closed / garbaged collected. 
- `receive_buffer_size`: Socket data receiving buffer size. 

