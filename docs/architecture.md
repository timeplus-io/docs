# Architecture

## Overview 

The diagram below illustrates the high-level components of the Timeplus core engine. The following sections explain how these components work together as a unified system.

![Architecture](/img/proton-high-level-arch.gif)

## Data Flow

### Ingest

When data is ingested into Timeplus, it first lands in the **NativeLog**. As soon as the log commit completes, the data becomes instantly available for streaming queries.

In the background, dedicated threads continuously tail new entries from the NativeLog and flush them into the **Historical Store** in optimized, larger batches.

### Query

Timeplus supports three query models: **historical**, **streaming**, and **hybrid (streaming + historical)**.

- **Historical Query (Table Query)**  
  Works like a traditional database query. Data is read directly from the **Historical Store**, leveraging standard database optimizations for efficient lookups and scans:  
  - Primary index  
  - Skipping index  
  - Secondary index  
  - Bloom filter  
  - Partition pruning  

- **Streaming Query**  
  Operates on the **NativeLog**, where records are strictly ordered. Queries run incrementally, enabling real-time workloads such as **incremental ETL**, **joins**, and **aggregations**.  

- **Hybrid Query**  
  Combines the best of both worlds. A streaming query can automatically **backfill** from the Historical Store when:  
  1. Data has expired from the NativeLog (due to retention).  
  2. Reading from the Historical Store is faster than rewinding and replaying from the NativeLog.  

  This eliminates the need for an external batch system, avoiding the extra **latency, inconsistency, and cost** usually associated with maintaining separate batch and streaming pipelines.

## Dural Storage

### NativeLog

The **Timeplus NativeLog** is the system’s write-ahead log (WAL) or journal: an append-only, high-throughput store optimized for low-latency, highly concurrent data ingestion. In a cluster deployment, it is replicated using **Multi-Raft** for fault tolerance. By enforcing a strict ordering of records, NativeLog forms the backbone of streaming processing in **Timeplus Core**, it is also the building block of other internal components like the repliated meta store in Timeplus.

NativeLog uses its own record format, consisting of two high-level types:

- **Control records** (a.k.a. meta records) – store metadata and operational information.
- **Data records** – columnar-encoded for fast serialization/deserialization and efficient vectorized streaming execution.

Each record is assigned a monotonically increasing sequence number — similar to a Kafka offset — which guarantees ordering.

Lightweight indexes are maintained to support rapid rewind and replay operations by **timestamp** or **sequence number** for streaming queries.

### Historical Store

The **Historical Store** in Timeplus stores data **derived** from the **NativeLog**. It powers use cases such as:

- **Historical queries** (a.k.a. *table queries* in Timeplus)
- **Fast backfill** into streaming queries
- Acting as a **serving layer** for applications

Timeplus supports two storage encodings for the Historical Store: **columnar** and **row**.

#### Columnar Encoding (*Append Stream*)
Optimized for **append-most workloads** with minimal data mutation, such as telemetry or events, logs, metrics etc. Benefits include:

- High data compression ratios
- Blazing-fast scans for analytical workloads
- Backed by the **ClickHouse MergeTree** engine

This format is ideal when the dataset is largely immutable and query speed over large volumes is a priority.

#### Row Encoding (*Mutable Stream*)
Designed for **frequently updated datasets** where `UPSERT` and `DELETE` operations are common. Features include:

- Per-row **primary indexes**
- **Secondary indexes** for flexible lookups
- Faster and more efficient **point queries** compared to columnar storage
- Backed by **RocksDB** engine

Row encoding is the better choice when low-latency, high-frequency updates are required.

## External Storage

Timeplus natively connects to external storage systems through **External Streams** and **External Tables**, giving you flexibility in how data flows in and out of the platform.

- **Ingest from External Systems**  
  Stream data directly from Kafka, Redpanda, or Pulsar into Timeplus. Use **Materialized Views** for incremental processing (e.g., ETL, filtering, joins, aggregations).

- **Send Data to External Systems**  
  Push processed results downstream to systems like ClickHouse, S3, Splunk etc for analytics or long-term storage.

- **Keep Data Inside Timeplus**  
  Store **Materialized View outputs** in Timeplus itself to serve client queries with low latency.  

- **End-to-End Data Pipelines**  
  Ingest and persist raw data in Timeplus, then build end-to-end pipelines for **filtering, transforming, and shaping** the data—serving both **real-time** and **historical** queries from a single platform.

This flexible integration model lets you decide whether Timeplus acts as a **processing engine**, a **serving layer**, or the **primary data hub** in your stack.

## References

[How Timeplus Unifies Streaming and Historical Data Processing](https://www.timeplus.com/post/unify-streaming-and-historical-data-processing)
