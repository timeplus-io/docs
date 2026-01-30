# Syslog Input 

## Overview

The **Syslog Input** emulates Syslog TCP / UDP server to receive syslog records streamed by Syslog clients. Syslog users can simply configure their syslog clients to point to the Syslog input IP address and port in Timeplus, and the input will handle the rest.

## Create Syslog Input

```sql
CREATE INPUT <syslog_input>
SETTINGS
    type='syslog',
    default_timezone=<default_timezone>,
    ip_allowlist_regex=<allow_regexi>
    ip_denylist_regex=<deny_regexi>,
    max_tcp_connections=<max_tcp_connections>,
    max_connections_per_ip=<max_connections_per_ip>,
    idle_connection_timeout=<tcp_idle_timeout>,
    tcp_max_lifespan=<tcp_max_lifespan>,
    receive_buffer_size=<receive_buffer_size>,
    udp_buffer_size=<udp_buffer_size>
    single_msg_per_udp=[true | false],
    allow_nonstandard_appname=[true | false],
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
    target_stream=<target_stream_name>,
    tcp_port=<bind_tcp_port>,
    udp_port=<bind_udp_port>,
    listen_host=<listen_host>
COMMENT '<comments>';
```

**Settings**
- `type`: Type to indicate the input protocol. `'syslog'`.
- `default_timezone`: Default timezone for timestamps without timezone info. Default is **'Local'**.
- `ip_allowlist_regex`: Regex pattern for allowed source IP addresses. Default is **".*"**.
- `ip_denylist_regex`: Regex pattern for denied source IP addresses. Default is **empty**. 
- `max_tcp_connections`: Max TCP Connection. Default is **100**. 
- `max_connections_per_ip`: Max TCP Connection per source IP. Default is **100**. 
- `idle_connection_timeout`: Timeout in seconds for receiving packets from syslog clients. Default is **3600**. 
- `tcp_max_lifespan`: Maximum TCP connection lifespan in seconds regardless of activity (0 = disabled. Default is **0**.
- `receive_buffer_size`: TCP read buffer size in bytes to receive incoming syslog packets. Default is **67108864**.
- `udp_buffer_size`: UDP read buffer size in bytes to receive incoming syslog packets. Default is **4194304**.
- `single_msg_per_udp`, Treat each UDP packet as a single complete message (off = split newline-delimited events). Default is **false**.
- `allow_nonstandard_appname`: Allow non-standard app names (hyphens) in RFC3164 TAG. Default is **false**.
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
The target stream for Syslog Input requires a fixed schema, shown below. 

```sql
CREATE STREAM syslog_target_stream
(
  `_raw` string,
  `_time` datetime64(3),
  `host` string,
  `facility` uint8,
  `facilityName` string,
  `severity` uint8,
  `severityName` string,
  `appname` string,
  `procid` string,
  `msgid` string,
  `message` string,
  `structuredData` map(string, string),
  `__syslogFail` bool,
  `__srcIpPort` string
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
-- Create Syslog input and write the incoming data to target stream
CREATE INPUT syslog_input 
SETTINGS
    type = 'syslog',
    udp_port = 10514,
    tcp_port = 10514,
    target_stream = 'syslog_target_stream',
    default_timezone = 'UTC'
COMMNET 'Syslog Input Test'
```

## Syslog Clients Configuration

Syslog users can simply update Syslog clients to use the Syslog input IP:Port in Timepllus to stream records.
