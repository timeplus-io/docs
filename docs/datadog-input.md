# Datadog Input 

## Overview

The **Datadog Input** emulates Datadog Intake endpoints for **metrics, logs and processes** by listening on a HTTP port and receiving events posted by Datadog clients / Agents. Datadog users can simply configure their clients / agents to use Datadog Input IP address and port in Timeplus, and the input will handle the rest.

## Create Datadog Input

```sql
CREATE INPUT datadog_input
SETTINGS
    type='datadog',
    metrics_target_stream=<metrics_target_stream_name>,
    process_target_stream=<process_target_stream_name>,
    logs_target_stream=<logs_target_stream_name>,
    tcp_port=<bind_tcp_port>,
    listen_host=<listen_host>;
```

**Settings**
- `type`: Type to indicate the input protocol. `'datadog'`.
- `metrics_target_stream`: The name of the target stream that stores incoming metric data. Optional. If it is empty, the incoming metrics data will be discarded.
- `processes_target_stream`: The name of the target stream that stores incoming process data. Optional. If it is empty, the incoming process data will be discarded.
- `logs_target_stream`: The name of the target stream that stores incoming log data. Optional. If it is empty, the incoming logs data will be discarded.
- `tcp_port`: The TCP port on which the input server listens for incoming connections. Default is **9997**.
- `listen_host`: The network interface or host address on which the input server listens. Default is **'0.0.0.0'**.

:::note
The target streams for Datadog Input requires fixed schema (without [retention policies](/append-stream-ttl)), shown below.

```sql
-- Metrics
CREATE STREAM datadog_metrics_target_stream
(
  metric string,            -- required
  `points.value` float64,   -- required
  `points.timestamp` int64,
  type enum8(               -- required
    'UNSPECIFIED'=0,
    'COUNT' = 1,
    'RATE'  = 2,
    'GAUGE' = 3,
  ),
  `resources.type` array(low_cardinality(string)),
  `resources.name` array(low_cardinality(string)),
  tags array(low_cardinality(string)),
  unit string,
  source_type_name string,
  interval int64,
  `metadata.origin.origin_product` uint32,
  `metadata.origin.origin_category` uint32,
  `metadata.origin.origin_service` uint32
);

-- Logs
CREATE STREAM datadog_logs_target_stream (
  message string, -- required
  status float64, -- required
  timestamp int64,
  hostname low_cardinality(string), -- required
  service low_cardinality(string),
  ddtags array(low_cardinality(string))
)

-- Processes. 
-- It is a very sparse stream. User can remove the optional columns
-- according to the real Datadog agent configuration / deployment 
CREATE STREAM datadog_processes_target_stream (
  hostname string,
  `processes.key` uint32,
  `processes.pid` int32,        -- required
  `processes.host.id` int64,
  `processes.host.org_id` int32,
  `processes.host.name` string,
  `processes.host.all_tags` array(string),
  `processes.host.num_cpus` int32,
  `processes.host.total_memory` int64,
  `processes.host.tag_index` int32,
  `processes.host.tags_modified` int64,
  `processes.command.args` array(string),
  `processes.command.cwd` string,
  `processes.command.root` string,
  `processes.command.on_disk` bool,
  `processes.command.ppid` int32,
  `processes.command.pgroup` int32,
  `processes.command.exe` string,
  `processes.command.comm` string,
  `processes.user.name` string,
  `processes.user.uid` int32,
  `processes.user.gid` int32,
  `processes.user.euid` int32,
  `processes.user.egid` int32,
  `processes.user.suid` int32,
  `processes.user.sgid` int32,
  `processes.memory.rss` uint64,
  `processes.memory.vms` uint64,
  `processes.memory.swap` uint64,
  `processes.memory.shared` uint64,
  `processes.memory.text` uint64,
  `processes.memory.lib` uint64,
  `processes.memory.data` uint64,
  `processes.memory.dirty` uint64,
  `processes.cpu.last_cpu` string,
  `processes.cpu.total_pct` float64,
  `processes.cpu.user_pct` float64,
  `processes.cpu.system_pct` float64,
  `processes.cpu.num_threads` int32,
  `processes.cpu.nice` int32,
  `processes.cpu.user_time` int64,
  `processes.cpu.system_time` int64,
  `processes.create_time` int64,
  `processes.open_fd_count` int32,
  `processes.state` enum8('U' = 0, 'D' = 1, 'R' = 2, 'S' = 3, 'T' = 4, 'W' = 5, 'X' = 6, 'Z' = 7),
  `processes.io_stat.read_rate` float64,
  `processes.io_stat.write_rate` float64,
  `processes.io_stat.read_bytes_rate` float64,
  `processes.io_stat.write_bytes_rate` float64,
  `processes.container_id` string,
  `processes.container_key` uint32,
  `processes.voluntary_ctx_switches` uint64,
  `processes.involuntary_ctx_switches` uint64,
  `processes.byte_key` bytes,
  `processes.container_byte_key` bytes,
  `processes.ns_pid` int32,
  `processes.networks.connection_rate` float64,
  `processes.networks.bytes_rate` float64,
  `processes.process_context` array(string),
  `processes.tags` array(string),
  `processes.language` enum8(
    'LANGUAGE_UNKNOWN' = 0,
    'LANGUAGE_JAVA' = 1,
    'LANGUAGE_NODE' = 2,
    'LANGUAGE_PYTHON' = 3,
    'LANGUAGE_RUBY' = 4,
    'LANGUAGE_DOTNET' = 5,
    'LANGUAGE_GO' = 6,
    'LANGUAGE_CPP' = 7,
    'LANGUAGE_PHP' = 8
  ),
  `processes.port_info.tcp` array(int32),
  `processes.port_info.udp` array(int32),
  `processes.service_discovery.generated_service_name.name` string,
  `processes.service_discovery.generated_service_name.source` int32,
  `processes.service_discovery.dd_service_name.name` string,
  `processes.service_discovery.dd_service_name.source` int32,
  `processes.service_discovery.additional_generated_names.name` array(string),
  `processes.service_discovery.additional_generated_names.source` array(uint8),
  `processes.service_discovery.tracer_metadata.runtime_id` array(string),
  `processes.service_discovery.tracer_metadata.service_name` array(string),
  `processes.service_discovery.apm_instrumentation` bool,
  `processes.injection_state` uint8,
  `host.id` int64,
  `host.org_id` int32,
  `host.name` string,
  `host.all_tags` array(string),
  `host.num_cpus` int32,
  `host.total_memory` int64,
  `host.tag_index` int32,
  `host.tags_modified` int64,
  `info.uuid` string,
  `info.os.name` string,
  `info.os.platform` string,
  `info.os.family` string,
  `info.os.version` string,
  `info.os.kernel_version` string,
  `info.cpus.number` array(int32),
  `info.cpus.vendor` array(low_cardinality(string)),
  `info.cpus.family` array(low_cardinality(string)),
  `info.cpus.model` array(low_cardinality(string)),
  `info.cpus.physical_id` array(string),
  `info.cpus.core_id` array(low_cardinality(string)),
  `info.cpus.cores` array(int32),
  `info.cpus.mhz` array(int64),
  `info.cpus.cache_size` array(int32),
  `info.total_memory` int64,
  group_id int32,
  group_size int32,
  containers.type string,
  containers.id string,
  containers.cpu_limit float64,
  containers.memory_limit uint64,
  containers.state enum8('unknown' = 0, 'created' = 1, 'restarting' = 2, 'running' = 3, 'paused' = 4, 'exited' = 5, 'dead' = 6),
  containers.health enum8('unknownHealth' = 0, 'starting' = 1, 'healthy' = 2, 'unhealthy' = 3),
  containers.created int64,
  containers.rbps float64,
  containers.wbps float64,
  containers.key uint32,
  containers.net_rcvd_ps float64,
  containers.net_sent_ps float64,
  containers.net_rcvd_bps float64,
  containers.net_sent_bps float64,
  containers.user_pct float64,
  containers.system_pct float64,
  containers.total_pct float64,
  containers.mem_rss uint64,
  containers.mem_cache uint64,
  `containers.host.id` int64,
  `containers.host.org_id` int32,
  `containers.host.name` string,
  `containers.host.all_tags` array(string),
  `containers.host.num_cpus` int32,
  `containers.host.total_memory` int64,
  `containers.host.tag_index` int32,
  `containers.host.tags_modified` int64,
  containers.started int64,
  containers.byte_key bytes,
  containers.tags array(string),
  containers.addresses.ip array(string),
  containers.addresses.port array(int32),
  containers.addresses.protocol array(uint8),
  containers.thread_count uint64,
  containers.thread_limit uint64,
  containers.mem_usage uint64,
  containers.cpu_usage_ns float64,
  containers.mem_accounted uint64,
  containers.cpu_request float64,
  containers.memory_request uint64,
  containers.repo_digest string,
  network_id string,
  container_host_type int32,
  hint_mask int32
);
```
:::

**Example**:

```sql
-- Create Datadog input and write the incoming data to target streams
CREATE INPUT datadog_input
SETTINGS
    type = 'datadog',
    tcp_port = 9090,
    metrics_target_stream = 'datadog_metrics_target_stream',
    logs_target_stream = 'datadog_logs_target_stream',
    process_target_stream = 'datadog_processes_target_stream'
COMMNET 'Datadog Input Test'
```

## DatadogAgent Configuration

DatadogAgent users can simply update `datadog.yaml` to point to the Datadog input in Timeplus.

**Example**
```
% cat /etc/datadog-agent/datadog.yaml
…
dd_url: http://32q80q8.timeplus:9090
logs_enabled: true
logs_config:
  container_collect_all: true
  logs_dd_url: http://32q80q8.timeplus:9090 
process_config:  enabled: "true"
  process_dd_url: http://32q80q8.timeplus:9090 
```
