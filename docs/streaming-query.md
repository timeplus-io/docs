# Streaming Query

## Query is unbounded by default

By default, Timeplus query behavior is different from traditional SQL which answers the question of what had happened. Instead, Timeplus query tries to answer the question of what is happening now in real-time and continuously updates the answer when new events enter the system.

Timeplus query is running on an unbounded stream. In most of the cases, the query won't stop unless the user cancels it.
For example, the following query will return all the events in the stream that enter the Timeplus system in real-time after the query is executed. Each new event will trigger a new query result. And this query won't stop unless the user cancels the query.

```sql
select * from my_stream
```

The unbounded query can be converted to a bounded query by applying the function [table()](/functions_for_streaming#table), when the user wants to ask the question about what has happened like the traditional SQL. The table() function could be used to decorate the stream. For example, the following query will return all the events that have already existed in the stream at the moment of the query execution. The query will terminate once all results have been returned to the user and it won't wait for a new event coming.

```sql
select * from table(my_stream)
```

## Backfill and continue streaming

A streaming query can process retained history before following live events. This is useful for initializing an aggregate or filling a new materialized view before it continues with live updates.

```sql
SELECT device, count()
FROM device_metrics
GROUP BY device
SETTINGS seek_to = 'earliest';
```

For an eligible native stream, Timeplus can read from historical storage first and continue with the streaming log from the corresponding sequence position. The query keeps running after the backfill. Data retention determines how far back it can read.

For window aggregations, Timeplus normally holds back event-time watermark emissions during historical backfill. Set `emit_during_backfill=1` to enable them. This requests sorting by the source's `_tp_time` before backfilled rows reach window processing. If the query uses a different timestamp expression, its order can differ from `_tp_time`. See [backfill settings](/query-settings#enable_backfill_from_historical_store).

## How streaming queries are triggered

There are three categories of Timeplus streaming queries, based on how the data is aggregated.

| Category           | Description                                                  | Trigger By                               |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------- |
| Non-aggregation    | per event processing, e.g. tail, filter, transformation/normalization | When events arrive                       |
| Window aggregation | group events in the same window                              | Window end and watermark                 |
| Global aggregation | aggregate across all rows read by the query                  | A fixed interval, default every 2 seconds |

If you see some new terms, no worries. Let's explore them more.

### Non-aggregation

Aggregation is the process to combine data from across events into one or more new data. Some queries don't involve any aggregations, such as:

#### Tail

List all incoming data, such as

```sql
select * from my_stream
```

#### Filter

Only show certain columns or data matches certain pattern, such as

```sql
select c1,c2 from weblogs where http_code>=400
```

#### Transform

For each event, transform the data to remove sensitive information, or convert type, such as

```sql
select
concat(first_name,' ', last_name) as full_name,
replace_regex(phone,'(\\d{3})-(\\d{3})-(\\d{4})','\\1-***-****') as phone
from user_activities
```


Non-aggregation is triggered per event arrival, which means every time there is a new event entering Timeplus, the query will use the new event to execute the related analysis and the analysis result will be then triggered and sent to the client.

### Window aggregation

Window based aggregation is a typical analytic method in stream analysis. Tumbling and hopping windows have fixed intervals, while session windows derive their boundaries from events. The aggregation result is based on the events assigned to each window.

When using the window function for aggregation, the event time is used to decide whether the event is in that window. In the case the user does not specify the timestamp, the default one will be used. The user can also use any field in that event which is a datetime type as timestamp or dynamically generate a datetime field as timestamp.

[Learn More](/streaming-windows).

### Global aggregation

Global aggregation maintains state for the input the query consumes, including any rows read during backfill. The streaming query continues as new rows arrive.

[Learn More](streaming-aggregations#global).
