# Architecture

## High Level Architecture 

The following diagram depicts the high level components of Timeplus core engine.

![Architecture](/img/proton-high-level-arch.gif)

### The Flow of Data

When data is ingested into Timeplus, it first lands in the NativeLog. As soon as the log commit completes, the data becomes immediately available for streaming queries.

In the background, dedicated threads continuously tail new entries from the NativeLog and flush them to the Historical Store in larger, optimized batches.

### NativeLog

The **Timeplus NativeLog** is the system’s write-ahead log (WAL) or journal: an append-only, high-throughput store optimized for low-latency, highly concurrent data ingestion. In a cluster deployment, it is replicated using **Multi-Raft** for fault tolerance. By enforcing a strict ordering of records, NativeLog forms the backbone of streaming processing in **Timeplus Core**.

NativeLog uses its own record format, consisting of two high-level types:

- **Control records** (a.k.a. meta records) – store metadata and operational information.
- **Data records** – columnar-encoded for fast serialization/deserialization and efficient vectorized streaming execution.

Each record is assigned a monotonically increasing sequence number—similar to a Kafka offset—which guarantees ordering.  

Lightweight indexes are maintained to support rapid rewind and replay operations by **timestamp** or **sequence number** in streaming queries.

### Historical Store

The **Historical Store** in Timeplus stores data **derived** from the **NativeLog**. It powers use cases such as:

- **Historical queries** (a.k.a. *table queries* in Timeplus)
- **Fast backfill** into streaming queries
- Acting as a **serving layer** for downstream applications

Timeplus supports two storage encodings for the Historical Store: **columnar** and **row**.

#### 1. Columnar Encoding (*Append Stream*)
Optimized for **append-most workloads** with minimal data mutation, such as telemetry or event logs. Benefits include:

- High data compression ratios  
- Blazing-fast scans for analytical workloads  
- Backed by the **ClickHouse MergeTree** engine  

This format is ideal when the dataset is largely immutable and query speed over large volumes is a priority.

#### 2. Row Encoding (*Mutable Stream*)
Designed for **frequently updated datasets** where `UPSERT` and `DELETE` operations are common. Features include:

- Per-row **primary indexes**
- **Secondary indexes** for flexible lookups
- Faster and more efficient **point queries** compared to columnar storage

Row encoding is the better choice when low-latency, high-frequency updates are required.

## Deployment Architectures

Timeplus supports multiple deployment architectures, allowing you to fine-tune the model **per Stream** or **per Materialized View**:

- **MPP Shared-Nothing**  
  Each node has its own compute and storage.  
  Ideal for **ultra-low-latency** workloads where performance is critical.

- **Shared-Storage**  
  Compute nodes share a common storage layer (e.g., S3).  
  Best for **large-scale ingestion**, **high concurrency**, and **high throughput** queries.

- **Hybrid**  
  Combine both models in the same cluster.  
  Use the right architecture for each workload to balance latency and scalability.

## References

[How Timeplus Unifies Streaming and Historical Data Processing](https://www.timeplus.com/post/unify-streaming-and-historical-data-processing)