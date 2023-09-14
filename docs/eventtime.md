# _tp_time (Event time)

## All data with an event time

Streams are where data live and each data contains a `_tp_time` column as the event time. Timeplus takes this attribute as one important identity of an event.

Event time is used to identify when the event is generated, like a birthday to a human being.  It can be the exact timestamp when the order is placed, when the user logins a system, when an error occurs, or when an IoT device reports its status. If there is no suitable timestamp attribute in the event, Timeplus will generate the event time based on the data ingestion time.

By default, the `_tp_time` column is in `datetime64(3, 'UTC')` type with millisecond precision. You can also create it it in `datetime` type with second precision. 

When you are about to create a new stream, please choose the right column as the event time. If no column is specified, then Timeplus will use the current timestamp as the value of `_tp_time` It's not recommended to rename a column as _tp_time at the query time, since it will lead to unexpected behaviour, specially for [Time Travel](usecases#s-time-travel).

## Why event time is treated differently

Event time is used almost everywhere in Timeplus data processing and analysis workflow:

* while doing time window based aggregations, such as [tumble](functions_for_streaming#tumble) or [hop](functions_for_streaming#hop) to get the downsampled data or outlier in each time window, Timeplus will use the event time to decide whether certain event belongs to a specific window
* in such time sensitive analytics, event time is also used to identify out of order events or late events, and drop them in order to get timely streaming insights.
* when one data stream is joined with the other, event time is the key to collate the data, without expecting two events to happen in  exactly the same millisecond.
* event time also plays an important role to device how long the data will be kept in the stream

## How to specify the event time

### Specify during data ingestion

When you [ingest data](ingestion) into Timeplus, you can specify an attribute in the data which best represents the event time. Even if the attribute is in `String` type, Timeplus will automatically convert it to a timestamp for further processing.

If you don't choose an attribute in the wizard, then Timeplus will use the ingestion time to present the event time, i.e. when Timeplus receives the data. This may work well for most static or dimensional data, such as city names with zip codes.

### Specify during query

The [tumble](functions_for_streaming#tumble) or [hop](functions_for_streaming#hop) window functions take an optional parameter as the event time column. By default, we will use the event time in each data. However you can also specify a different column as the event time.

Taking an example for taxi passengers. The data stream can be

| car_id | user_id | trip_start          | trip_end            | fee  |
| ------ | ------- | ------------------- | ------------------- | ---- |
| c001   | u001    | 2022-03-01 10:00:00 | 2022-03-01 10:30:00 | 45   |

The data may come from a Kafka topic. When it's configured, we may set `trip_end` as the (default) event time. So that if we want to figure out how many passengers in each hour, we can run query like this

```sql
select count(*) from tumble(taxi_data,1h) group by window_end
```

This query uses `trip_start` , the default event time, to run the aggregation. If the passenger ends the trip on 00:01 at midnight, it will be included in the 00:00-00:59 time window.

In some cases, you as the analyst, may want to focus on how many passengers get in the taxi, instead of leaving the taxi, in each hour, then you can set `trip_end` as the event time for the query via `tumble(taxi_data,trip_end,1h)` 

Full query:

```sql
select count(*) from tumble(taxi_data,trip_end,1h) group by window_end
```

