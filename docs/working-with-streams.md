# Streams

Timeplus `streams` are conceptually similar to `tables` in traditional SQL databases — they both hold data. However, there are key differences:

* A **Timeplus stream** tracks changes and updates through its underlying **Write-Ahead Log (WAL)**, which powers incremental processing.
* Timeplus supports **both incremental stream processing and historical queries** over stream data.

## Types of Streams

To support a variety of use cases efficiently, Timeplus offers multiple types of streams:

1. **Append Stream**
   The default stream type in Timeplus. It uses columnar encoding and is optimized for **range scans** via a **sorting key**. It suits workloads with infrequent data mutations (e.g., `UPDATE` or `DELETE`).

2. **Mutable Stream**
   Row-encoded and similar in behavior to a **MySQL table**, where each primary key corresponds to a single row. It is optimized for **frequent data mutations** (`UPDATE`, `UPSERT`, `DELETE`) and supports **point and range queries** via **primary or secondary indexes**.

3. **Versioned Key-Value Stream**
   Similar to the mutable stream but uses **columnar encoding**. It offers better **compression** but lower performance for updates and point queries, especially when cardinality is high. Best suited for scenarios where **data mutations are less frequent**.

4. **Changelog Stream**
   Designed to model **change data capture (CDC) events**, with **columnar encoding** for efficient downstream processing.

5. **External Stream**
   As the name implies, the data resides outside of Timeplus. Timeplus can reference external sources (e.g., a **Kafka topic**) and execute **streaming SQL** queries against them in real time.

> Note: Timeplus also supports [External Tables](/sql-create-external-table), which allow **historical queries and inserts** only (e.g., against ClickHouse, MySQL, PostgreSQL, MongoDB, etc.).


## Stream Internals

When users [create a stream](/sql-create-stream) in Timeplus, they can specify the number of **shards** for the stream. Each shard consists of two core components at the storage layer:

1. **Streaming Store**
2. **Historical Store**

The **streaming store** is essentially the **Write-Ahead Log** (internally called `NativeLog`). It supports:

* High-concurrency [data ingestion](/ingestion)
* [Incremental stream processing](/stream-query)
* Real-time data replication

For more information, refer to the [high-level architecture](/architecture) page.

The **historical store** asynchronously derives its data from the WAL through a dedicated background thread. It performs periodic **compaction**, **merge**, and **compression**, making it highly efficient for [historical analytic queries](/history) and **streaming backfills**.

To learn more about stream lifecycle operations (Create, Read, Delete, Update) and advanced configurations like **TTL**, **key versioning**, and other stream settings, refer to the SQL Reference documentation. To learning more about external streams, refer to [external stream](/external-stream) pages for more details.
