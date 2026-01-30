# OpenTelemetry Input 

## Overview

The **OpenTelemetry Input** emulates OpenTelemetry HTTP / gRPC endpoints `/v1/logs`, `/v1/metrics` and `/v1/traces` by listening on a HTTP port and receiving events posted OpenTelemetry clients / collectors. OpenTelemetry users can simply configure their clients / agents use OpenTelemetry Input IP address and port in Timeplus, and the input will handle the rest.

## Create OpenTelemetry Input

```sql
CREATE INPUT <otel_input>
SETTINGS 
    type = 'otel', 
    protocol=['grpc' | 'http'], 
    logs_target_stream='otel_logs', 
    traces_target_stream='otel_traces',
    metrics_gauge_target_stream='otel_metrics_gauge', 
    metrics_sum_target_stream='otel_metrics_sum', 
    metrics_histogram_target_stream='otel_metrics_histogram', metrics_exponential_histogram_target_stream='otel_metrics_exponential_histogram', metrics_summary_target_stream='otel_metrics_summary', 
    tcp_port = <bind_tcp_port>,
    listen_host=<listen_host>
COMMENT '<comments>';
```

**Settings**
- `type`: Type to indicate the input protocol. `'otel'`.
- `protocol`: Supported protocol is `grpc` and `http`.
- `logs_target_stream`: The name of the target stream that stores incoming log data. 
- `traces_target_stream`: The name of the target stream that stores incoming trace data.
- `metrics_gauge_target_stream`: The name of the target stream that stores incoming metric gauge.
- `metrics_sum_target_stream`: The name of the target stream that stores incoming metric sum.
- `metrics_histogram_target_stream`: The name of the target stream that stores incoming metric histogram.
- `metrics_exponential_histogram_target_stream`: The name of the target stream that stores incoming metric exponential histogram.
- `metrics_summary_target_stream`: The name of the target stream that stores incoming metric summary.
- `tcp_port`: The TCP port on which the input server listens for incoming connections. Default is **9997**.
- `listen_host`: The network interface or host address on which the input server listens. Default is **'0.0.0.0'**.

:::note
The target streams OpenTelemetry Input require fixed schemas, shown below.

```sql
-- Logs
CREATE STREAM otel_logs_target_stream 
(  
    `trace_id` string CODEC(ZSTD(1)),  
	`span_id` string CODEC(ZSTD(1)),  
	`trace_flags` uint32 CODEC(ZSTD(1)),  
	`severity_text` low_cardinality(string) CODEC(ZSTD(1)),  
	`severity_number` int32 CODEC(ZSTD(1)),  
	`service_name` low_cardinality(string) CODEC(ZSTD(1)),  
	`body` string CODEC(ZSTD(1)),  
	`resource_schema_url` string CODEC(ZSTD(1)),  
	`resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),  
	`scope_schema_url` string CODEC(ZSTD(1)),  
	`scope_name` string CODEC(ZSTD(1)),  
	`scope_version` string CODEC(ZSTD(1)),  
	`scope_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),  
	`log_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),  
	INDEX idx_trace_id trace_id TYPE bloom_filter(0.001) GRANULARITY 1,  
	INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_scope_attr_key map_keys(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_scope_attr_value map_values(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_log_attr_key map_keys(log_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_log_attr_value map_values(log_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_body body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1  
);

-- Traces
CREATE STREAM otel_traces_target_stream  
(  
	`trace_id` string CODEC(ZSTD(1)),  
	`span_id` string CODEC(ZSTD(1)),  
	`parent_span_id` string CODEC(ZSTD(1)),  
	`trace_state` string CODEC(ZSTD(1)),  
	`span_name` low_cardinality(string) CODEC(ZSTD(1)),  
	`span_kind` low_cardinality(string) CODEC(ZSTD(1)),  
	`service_name` low_cardinality(string) CODEC(ZSTD(1)),  
	`resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),  
	`scope_name` string CODEC(ZSTD(1)),  
	`scope_version` string CODEC(ZSTD(1)),  
	`span_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),  
	`duration` uint64 CODEC(ZSTD(1)),  
	`start_time_ns` uint64 CODEC(ZSTD(1)),  
	`end_time_ns` uint64 CODEC(ZSTD(1)),  
	`status_code` low_cardinality(string) CODEC(ZSTD(1)),  
	`status_message` string CODEC(ZSTD(1)),  
	`events.timestamp` array(datetime64(9)) CODEC(ZSTD(1)),  
	`events.name` array(low_cardinality(string)) CODEC(ZSTD(1)),  
	`events.attributes` array(map(low_cardinality(string), string)) CODEC(ZSTD(1)),  
	`links.trace_id` array(string) CODEC(ZSTD(1)),  
	`links.span_id` array(string) CODEC(ZSTD(1)),  
	`links.trace_state` array(string) CODEC(ZSTD(1)),  
	`links.attributes` array(map(low_cardinality(string), string)) CODEC(ZSTD(1)),
	INDEX idx_trace_id trace_id TYPE bloom_filter(0.001) GRANULARITY 1,
	INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX idx_span_attr_key map_keys(span_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_span_attr_value map_values(span_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,  
	INDEX idx_duration duration TYPE minmax GRANULARITY 1
);

-- Sum metrics
CREATE STREAM otel_metrics_sum_target_stream
(
    `resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `resource_schema_url` string CODEC(ZSTD(1)),
    `scope_name` string CODEC(ZSTD(1)),
    `scope_version` string CODEC(ZSTD(1)),
    `scope_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `scope_dropped_attr_count` uint32 CODEC(ZSTD(1)),
    `scope_schema_url` string CODEC(ZSTD(1)),
    `service_name` low_cardinality(string) CODEC(ZSTD(1)),
    `metric_name` string CODEC(ZSTD(1)),
    `metric_description` string CODEC(ZSTD(1)),
    `metric_unit` string CODEC(ZSTD(1)),
    `attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `start_time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `value` float64 CODEC(ZSTD(1)),
    `flags` uint32 CODEC(ZSTD(1)),
    `exemplars.filtered_attributes` array(map(low_cardinality(string), string)) CODEC(ZSTD(1)),
    `exemplars.time_unix` array(DateTime64(9)) CODEC(ZSTD(1)),
    `exemplars.value` array(float64) CODEC(ZSTD(1)),
    `exemplars.span_id` array(string) CODEC(ZSTD(1)),
    `exemplars.trace_id` array(string) CODEC(ZSTD(1)),
    `aggregation_temporality` int32 CODEC(ZSTD(1)),
    `is_monotonic` bool CODEC(Delta(1), ZSTD(1)),
    INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key map_keys(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value map_values(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_key map_keys(attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_value map_values(attributes) TYPE bloom_filter(0.01) GRANULARITY 1
);

-- Gauge metrics
CREATE STREAM otel_metrics_gauge_target_stream
(
  `resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
  `resource_schema_url` string CODEC(ZSTD(1)),
  `scope_name` string CODEC(ZSTD(1)),
  `scope_version` string CODEC(ZSTD(1)),
  `scope_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
  `scope_dropped_attr_count` uint32 CODEC(ZSTD(1)),
  `scope_schema_url` string CODEC(ZSTD(1)),
  `service_name` low_cardinality(string) CODEC(ZSTD(1)),
  `metric_name` string CODEC(ZSTD(1)),
  `metric_description` string CODEC(ZSTD(1)),
  `metric_unit` string CODEC(ZSTD(1)),
  `attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
  `start_time_unix` datetime64(9) CODEC(Delta(8), ZSTD(1)),
  `time_unix` datetime64(9) CODEC(Delta(8), ZSTD(1)),
  `value` float64 CODEC(ZSTD(1)),
  `flags` uint32 CODEC(ZSTD(1)),
  `exemplars.filtered_attributes` array(map(low_cardinality(string), string)) CODEC(ZSTD(1)),
  `exemplars.time_unix` array(datetime64(9)) CODEC(ZSTD(1)),
  `exemplars.value` array(float64) CODEC(ZSTD(1)),
  `exemplars.span_id` array(string) CODEC(ZSTD(1)),
  `exemplars.trace_id` array(string) CODEC(ZSTD(1)),
  `_tp_time` datetime64(3, 'UTC') DEFAULT now64(3, 'UTC') CODEC(DoubleDelta, ZSTD(1)),
  `_tp_sn` int64 CODEC(Delta(8), ZSTD(1)),
  INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
  INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
  INDEX idx_scope_attr_key map_keys(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
  INDEX idx_scope_attr_value map_values(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
  INDEX idx_attr_key map_keys(attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
  INDEX idx_attr_value map_values(attributes) TYPE bloom_filter(0.01) GRANULARITY 1
);

-- Histogram
CREATE STREAM otel_metrics_histogram_target_stream
(
    `resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `resource_schema_url` string CODEC(ZSTD(1)),
    `scope_name` string CODEC(ZSTD(1)),
    `scope_version` string CODEC(ZSTD(1)),
    `scope_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `scope_dropped_attr_count` uint32 CODEC(ZSTD(1)),
    `scope_schema_url` string CODEC(ZSTD(1)),
    `service_name` low_cardinality(string) CODEC(ZSTD(1)),
    `metric_name` string CODEC(ZSTD(1)),
    `metric_description` string CODEC(ZSTD(1)),
    `metric_unit` string CODEC(ZSTD(1)),
    `attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `start_time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `count` uint64 CODEC(Delta(8), ZSTD(1)),
    `sum` float64 CODEC(ZSTD(1)),
    `bucket_counts` array(uint64) CODEC(ZSTD(1)),
    `explicit_bounds` array(float64) CODEC(ZSTD(1)),
    `exemplars.filtered_attributes` array(map(low_cardinality(string), string)) CODEC(ZSTD(1)),
    `exemplars.time_unix` array(DateTime64(9)) CODEC(ZSTD(1)),
    `exemplars.value` array(float64) CODEC(ZSTD(1)),
    `exemplars.span_id` array(string) CODEC(ZSTD(1)),
    `exemplars.trace_id` array(string) CODEC(ZSTD(1)),
    `flags` uint32 CODEC(ZSTD(1)),
    `min` float64 CODEC(ZSTD(1)),
    `max` float64 CODEC(ZSTD(1)),
    `aggregation_temporality` int32 CODEC(ZSTD(1)),
    INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key map_keys(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value map_values(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_key map_keys(attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_value map_values(attributes) TYPE bloom_filter(0.01) GRANULARITY 1
);

-- Exponential histogram
CREATE STREAM otel_metrics_exponential_histogram_target_stream
(
    `resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `resource_schema_url` string CODEC(ZSTD(1)),
    `scope_name` string CODEC(ZSTD(1)),
    `scope_version` string CODEC(ZSTD(1)),
    `scope_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `scope_dropped_attr_count` uint32 CODEC(ZSTD(1)),
    `scope_schema_url` string CODEC(ZSTD(1)),
    `service_name` low_cardinality(string) CODEC(ZSTD(1)),
    `metric_name` string CODEC(ZSTD(1)),
    `metric_description` string CODEC(ZSTD(1)),
    `metric_unit` string CODEC(ZSTD(1)),
    `attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `start_time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `count` uint64 CODEC(Delta(8), ZSTD(1)),
    `sum` float64 CODEC(ZSTD(1)),
    `scale` int32 CODEC(ZSTD(1)),
    `zero_count` uint64 CODEC(ZSTD(1)),
    `positive_offset` int32 CODEC(ZSTD(1)),
    `positive_bucket_counts` array(uint64) CODEC(ZSTD(1)),
    `negative_offset` int32 CODEC(ZSTD(1)),
    `negative_bucket_counts` array(uint64) CODEC(ZSTD(1)),
    `exemplars.filtered_attributes` array(map(low_cardinality(string), string)) CODEC(ZSTD(1)),
    `exemplars.time_unit` array(DateTime64(9)) CODEC(ZSTD(1)),
    `exemplars.value` array(float64) CODEC(ZSTD(1)),
    `exemplars.span_id` array(string) CODEC(ZSTD(1)),
    `exemplars.trace_id` array(string) CODEC(ZSTD(1)),
    `flags` uint32 CODEC(ZSTD(1)),
    `min` float64 CODEC(ZSTD(1)),
    `max` float64 CODEC(ZSTD(1)),
    `aggregation_temporality` int32 CODEC(ZSTD(1)),
    INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key map_keys(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value map_values(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_key map_keys(attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_value map_values(attributes) TYPE bloom_filter(0.01) GRANULARITY 1
);

-- Summary
CREATE STREAM otel_metrics_summary_target_stream
(
    `resource_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `resource_schema_url` string CODEC(ZSTD(1)),
    `scope_name` string CODEC(ZSTD(1)),
    `scope_version` string CODEC(ZSTD(1)),
    `scope_attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `scope_dropped_attr_count` uint32 CODEC(ZSTD(1)),
    `scope_schema_url` string CODEC(ZSTD(1)),
    `service_name` low_cardinality(string) CODEC(ZSTD(1)),
    `metric_name` string CODEC(ZSTD(1)),
    `metric_description` string CODEC(ZSTD(1)),
    `metric_unit` string CODEC(ZSTD(1)),
    `attributes` map(low_cardinality(string), string) CODEC(ZSTD(1)),
    `start_time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `time_unix` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `count` uint64 CODEC(Delta(8), ZSTD(1)),
    `sum` float64 CODEC(ZSTD(1)),
    `value_at_quantiles.quantile` array(float64) CODEC(ZSTD(1)),
    `value_at_quantiles.value` array(float64) CODEC(ZSTD(1)),
    `flags` uint32 CODEC(ZSTD(1)),
    INDEX idx_res_attr_key map_keys(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value map_values(resource_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key map_keys(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value map_values(scope_attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_key map_keys(attributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_attr_value map_values(attributes) TYPE bloom_filter(0.01) GRANULARITY 1
);
```
:::

:::info
You probably like to fine tune the column [compression codec](/append-stream-codecs), [retention policies](/append-stream-ttl) and indexes [indexes](/append-stream-indexes) when provisioning the target stream if the target stream's historical store is enabled and is used to serve applications.
:::

**Example**:

```sql
-- Create OTel input and write the incoming data to target streams
CREATE INPUT otel_input 
SETTINGS
    type = 'otel',
    tcp_port = 4317,
    logs_target_stream='otel_logs_target_stream', 
    traces_target_stream='otel_traces',
    metrics_gauge_target_stream='otel_metrics_gauge_target_stream',
    metrics_sum_target_stream='otel_metrics_sum_target_stream',
    metrics_histogram_target_stream='otel_metrics_histogram_target_stream',
    metrics_exponential_histogram_target_stream='otel_metrics_exponential_histogram_target_stream',
    metrics_summary_target_stream='otel_metrics_summary',
COMMNET 'OTel Input Test'
```

## OpenTelemetry Clients / Collectors Configuration

OpenTelemetry users can simply update the OTel clients / agents / collectors to use the OpenTelemtry input IP:Port to post events. 
