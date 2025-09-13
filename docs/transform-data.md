# Overview

Timeplus is a unified system for processing and transforming data via SQL, enabled by its unique [architecture](/architecture). At a high level, queries can run in three modes:

1. **Streaming query processing**  
2. **Historical query processing**  
3. **Unified streaming + historical query processing**

Transformations can be simple filters or complex joins and aggregations. Streaming and historical queries often complement each other, enabling a wide range of use cases.

## Streaming Query Processing

Streaming query processing runs **continuous queries** on unbounded data streams that arrive incrementally and delivers / pushes the (intermediate) results to clients or target streams or external streams to clients, target streams, or external systems as soon as they are ready. 

When running a Timeplus SQL query against Timeplus native streams or external sources such as Apache Kafka, Apache Pulsar, or Redpanda, streaming mode is used by default.  

You can execute a streaming query in two ways in Timeplus:

1. **Ad-Hoc (foreground) Streaming Queries**  
   - Run interactively and continuously, ideal for quick experimentation.  
   - Example:

     ```sql
     SELECT * FROM kafka_external_stream;
     ```

2. **Materialized Views (background streaming queries)**  
   - A [Materialized View](/materialized-view) runs continuously in the background.  
   - It incrementally transforms the data and persists the results into Timeplus streams or external systems (e.g., ClickHouse).  

The typical workflow is like

- Start with an ad-hoc streaming query to explore and validate logic against live data.  
- Once the query is stable, convert it into a Materialized View so it runs automatically in the background.  

## Historical Query Processing

**Historical query processing** operates on a fixed dataset, much like a traditional database. When you run a Timeplus SQL query against external tables like **ClickHouse, MySQL, PostgreSQL, or MongoDB** etc, this is the default mode. The query processes a snapshot of the data, returns the results and then terminates.

You can execute a historical query in two ways in Timeplus:

1. **Ad-Hoc (foreground) Histoical Queries**: You can run a simple, one-time query, such as `SELECT * FROM clickhouse_external_table`.

2. **Scheduled Tasks**: You can create a Timeplus **scheduled [task](/task)** that periodically runs a historical query and saves the results to Timeplus streams or other external systems.

To run a historical query against a streaming data source like a **Timeplus native stream, Apache Kafka, Apache Pulsar, or Redpanda** etc extrenal streams, you can use the `table(...)` wrapper. For example, `SELECT * FROM table(kafka_external_stream)` will process the data up to the current `offsets` and then end. This differs from a **streaming query**, which continuously waits for and processes new data.

## Unified Streaming and Historical Query Processing

In some scenarios, you may want to combine historical and streaming queries to create a holistic view or complete computation.  

Timeplus supports this in two main forms:

1. **Backfill historical data, then continue with real-time streaming events**  
2. **Union historical data with streaming events**

### Backfill + Real-time Continuation

For Timeplus streams, historical backfill typically happens automatically.  

For example:

```sql
SELECT * FROM timeplus_stream 
WHERE _tp_time > '2020-01-01 00:00:00';
```

The query first scans historical data from the underlying store. Once backfill is complete, it uses `_tp_sn` (Timeplus internal sequence number) to continue with new streaming events in real time.

###  Union of Historical and Streaming Data

You can also explicitly combine historical and streaming sources using `UNION`:

```sql
SELECT * FROM clickhouse_external_table -- historical data
UNION
SELECT * FROM kafka_external_stream; -- real-time stream events
```

This approach lets you merge past data with ongoing events into a single query result.
