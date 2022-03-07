# Streaming query

## Query is unbounded by default

By default, Timeplus’s query behavior is different from traditional SQL which answers the question of what had happened. Instead, Timeplus’ query tries to answer the question of what is happening now in real-time and continuously updates the answer when new events enter the system.

Timeplus query is running on an unbounded stream. In the most of the cases, the query won't stop unless the user cancels it. 
For example, the following query will return all the events in the stream that enter the Timeplus system in real-time after the query is executed. Each new event will trigger a new query result. And this query won't stop unless the user cancels the query.

```sql
select * from my_stream
```

The unbounded query can be converted to a bounded query by applying the function [table()](functions#table), when the user wants to ask the question about what has happened like the traditional SQL. The table() function could be used to decorate the stream. For example, the following query will return all the events that have already existed in the stream at the moment of the query execution. The query will terminate once all results have been returned to the user and it won't wait for new event coming.

```sql
select * from table(my_stream)
```

## How streaming queries are triggered

There are three categories of Timeplus streaming queries, based on how the data is aggregated.

| Category           | Description                                                  | Trigger By                               |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------- |
| Non-aggregation    | per event processing, e.g. tail, filter, transformation/normalization | When events arrive                       |
| Window aggregation | group events in the same window                              | Window end and watermark                 |
| Global aggregation | from now on till forever                                     | A fixed interval, default every 2 second |

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

Window based aggregation is a typical analytic method in stream analysis. Each window has a fixed range with a specific start time and an end time. The window might move during analysis by a fixed step. The analysis result will be based on an aggregation function of all the events lived in that window range.

When using the window function for aggregation, the event time is used to decide whether the event is in that window. In the case the user does not specify the timestamp, the default one will be used. The user can also use any field in that event which is a datetime type as timestamp or dynamically generate a datetime field as timestamp.

Two typical window functions are [tumble](functions#tumble) and [hop](functions#hop).

Fox example:

```sql
select window_start, window_end, count(*) as count, max(c1) as max_c1
from tumble(my_stream,order_time, 5s) group by window_start, window_end
```

#### Window watermark

Window aggregation is triggered per-window. There is an internal watermark mechanism in Timeplus to check if all the events in the specific window has arrived or not. Once the watermark has shown that all events in that window are available, the aggregated analysis result will be triggered and send to the client. 

#### Watermark and delay

For more advanced scenario, you can add delay to the trigger policy, such as adding 2 more seconds delay to allow more late events to be considered in each time window.

```sql
select window_start, window_end, count(*) as count, max(c1) as max_c1
from tumble(my_stream,order_time, 5s) group by window_start, window_end
emit after watermark delay 2s
```

### Global aggregation

Global aggregation will start the aggregation for all incoming events since the query is submitted, and never ends.

For example, if the user want to know what is the total number event in real time:

```sql
select count(*) from my_stream
```

#### Set trigger interval

Global aggregation is triggered periodically with an interval (by default, every 2 seconds). The user can specify the interval in the query statement. 

A more complex example is:

```sql
select count(*) from my_stream where type='order'
emit periodic 5s
```



