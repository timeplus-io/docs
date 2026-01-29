# Inputs

## Overview 

Compared to **Timeplus external streams and external tables**, **Timeplus Inputs** provide a different way to ingest data into the platform for real-time processing. An input is a long-running TCP, UDP, HTTP, or gRPC server that waits for external clients to connect and continuously push data.

Timeplus Inputs are designed to integrate seamlessly with the existing data ecosystem and collection tools. This allows users to reuse what they already have to send data into Timeplus. For example, the Splunk S2S input enables Splunk users to forward events directly to Timeplus by simply configuring their Splunk forwarders to point to the Splunk S2S input endpoint.

Once created, each input runs a specific protocol server and is bound to one or more target Timeplus streams. These streams store the incoming data after protocol-level parsing and effectively act as a high-performance, persistent, and streaming-queryable buffer for incoming events. Users can then apply further pipeline processing — such as streaming ETL, joins, and aggregations—on top of these target streams.

The following diagram illustrates the high-level components of a Timeplus Input.

![Input](/img/input.png)

## Supported Inputs

- [Splunk S2S Input](/splunk-s2s-input)
- [Splunk HEC Input](/splunk-hec-input)
- [Datadog Input](/datadog-input)
- [Elastic Input](/elastic-input)
- [OpenTelemetry Input](/otel-input)
- [Netflow / IPFIX Input](/netflow-input)
- [Syslog Input](/syslog-input)
