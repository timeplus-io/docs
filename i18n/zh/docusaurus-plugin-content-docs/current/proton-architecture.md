# Architecture

## High Level Architecture

The following diagram depicts the high level architecture of Proton.

![Proton Architecture](/img/proton-high-level-arch.svg)

All of the components / functionalities are built into one single binary.

## Data Storage

Users can create a stream by using `CREATE STREAM ...` [DDL SQL](proton-create-stream). Every stream has 2 parts at storage layer by default:

1. the real-time streaming data part, backed by Timeplus NativeLog
2. the historical data part, backed by ClickHouse historical data store.

Fundamentally, a stream in Proton is a regular database table with a replicated Write-Ahead-Log (WAL) in front but is streaming queryable.

## 数据摄取

When users `INSERT INTO ...` data to Proton, the data always first lands in NativeLog which is immediately queryable. Since NativeLog is in essence a replicated Write-Ahead-Log (WAL) and is append-only, it can support high frequent, low latency and large concurrent data ingestion work loads.

In background, there is a separate thread tailing the delta data from NativeLog and commits the data in bigger batch to the historical data store. Since Proton leverages ClickHouse for the historical part, its historical query processing is blazing fast as well.

## 外部流

In quite lots of scenarios, data is already in Kafka / Redpanda or other streaming data hubs, users can create [external streams](external-stream) to point to the streaming data hub and do streaming query processing directly and then either materialize them in Proton or send the query results to external systems.



## Learn More

Interested users can refer [How Timeplus Unifies Streaming and Historical Data Processing](https://www.timeplus.com/post/unify-streaming-and-historical-data-processing) blog for more details regarding its academic foundation and latest industry developments.

