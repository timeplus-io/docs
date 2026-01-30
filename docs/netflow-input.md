# Netflow / IPFIX Input 

## Overview

The **Netflow / IPFIXput** emulates Netflow server by listening on a UDP port and receiving Netflow streaming by Netflow exporters. Netflow users can simply configure their exporters to point to the Netfolow input IP address and port in Timeplus, and the input will handle the rest.

## Create Netflow / IPFIX Input

```sql
CREATE INPUT <netflow_input>
SETTINGS
    type='netflow',
    enable_v5=[true | false],
    enable_v7=[true | false],
    enable_ipfix=[true | false],
    template_cache_minutes=<template_cache_duration>,
    emit_raw=[true | false],
    ip_allowlist_regex=<allow_regexi>
    ip_denylist_regex=<deny_regexi>,
    fields_to_keep=<keep_field_names>,
    fields_to_drop=<drop_field_names>,
    batch_size=<batch_size>,
    batch_timeout_ms=<batch_timeout_ms>,
    buffer_size_limit=<buffer_limit>,
    max_buffer_retries=<max_buffer_retries>,
    buffer_backoff_ms=<buffer_backoff_ms>,
    buffer_backoff_max_ms=<buffer_backoff_max_ms>,
    max_message_size=<max_message_size>,
    max_batch_pending=<max_batch_pending>,
    stats_interval_ms=<stats_interval_ms>,
    target_stream=<target_stream_name>,
    udp_port=<bind_udp_port>,
    listen_host=<listen_host>
COMMENT '<comments>';
```

**Settings**
- `type`: Type to indicate the input protocol. `'netflow'`.
- `enable_v5`: Enable Netflow v5 support. Default is **true**.
- `enable_v7`: Enable Netflow v7 support. Default is **true**.
- `enable_ipfix`: Enable IPFIX (v10) support. Default is **true**.
- `template_cache_minutes`: Template cache duration in minutes for v7/IPFIX. Default is **30**.
- `emit_raw`: Include raw packet bytes in `__netflowRaw` field for passthrough. Default is **false**.
- `ip_allowlist_regex`: Regex pattern for allowed source IP addresses. Default is **".*"**.
- `ip_denylist_regex`: Regex pattern for denied source IP addresses. Default is **empty**. 
- `fields_to_keep`: Comma-separated list of fields to keep (empty = all). Default is **empty**. 
- `fields_to_drop`: Comma-separated list of fields to drop. Default is **empty**. 
- `batch_size`: Batch size when writing to the target stream. Default is **1000**.
- `batch_timeout_ms`: Batch timeout when writing to the target stream. Default is **500**.
- `buffer_size_limit`: Max events to buffer when downstream is blocking. Default is **01000**.
- `ax_buffer_retries`: Max retry attempts per buffered message before drop. Default is **3**.
- `buffer_backoff_ms`: Initial backoff in milliseconds when downstream is blocked. Default is **10**.
- `buffer_backoff_max_ms`: Max backoff in milliseconds when downstream is blocked. Default is **1000**.
- `max_message_size`: Maximum syslog message size in bytes. Default is **16384**.
- `max_batch_pending`: Maximum pending messages in batch buffer before dropping (memory protection). Default is **10000**.
- `stats_interval_ms`: Interval in milliseconds for periodic syslog stats logging (0 = disabled). Default is **60000**.
- `target_stream`: The name of the target stream that stores incoming data after S2S protocol parsing.
- `udp_port`: The UDP port on which the input server listens for incoming connections. Default is **0**.
- `listen_host`: The network interface or host address on which the input server listens. Default is **'0.0.0.0'**.


:::note
The target stream for Netflow / IPFIX Input requires a fixed schema, shown below. 

```sql
CREATE STREAM netflow_target_stream
(
  `_time` datetime64(3),
  `start_time` datetime64(3),
  `end_time` datetime64(3),
  `duration_ms` uint64,
  `src_ip` string,
  `dst_ip` string,
  `src_port` uint16,
  `dst_port` uint16,
  `protocol` uint8,
  `ip_version` uint8,
  `bytes` uint64,
  `packets` uint64,
  `tcp_flags` uint8,
  `src_vlan` uint16,
  `dst_vlan` uint16,
  `tos` uint8,
  `src_as` uint32,
  `dst_as` uint32,
  `next_hop` string,
  `input_if_index` uint32,
  `output_if_index` uint32,
  `fields` map(string, string),
  `version` uint16,
  `__netflowFail` bool,
  `__srcIpPort` string,
  `__netflowRaw` string
);
```
:::

:::info
You probably like to fine tune the column [compression codec](/append-stream-codecs), [retention policies](/append-stream-ttl) and indexes [indexes](/append-stream-indexes) when provisioning the target stream if the target stream's historical store is enabled and is used to serve applications.
:::

**Example**:

```sql
-- Create Netflow input and write the incoming data to target stream
CREATE INPUT netflow_input 
SETTINGS
    type = 'netflow',
    udp_port = 10515,
    target_stream = 'netflow_target_stream'
COMMNET 'Netflow / IPFIX Input Test'
```

## Netflow Explorter Configuration

Netflow users can simply update Netflow exporters to use the Netflow input IP:Port in Timepllus to stream records.
