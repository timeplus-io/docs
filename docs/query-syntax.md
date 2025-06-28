# Query Syntax

Timeplus introduces several SQL extensions to support streaming processing. The overall syntax looks like this:

```sql
[WITH common_table_expression ..]
SELECT <expr, columns, aggr>
FROM <table_function>(<stream_name>, [<time_column>], [<window_size>], ...)
[JOIN clause]
[WHERE clause]
[GROUP BY clause]
[HAVING expression]
[PARTITION BY clause]
[LIMIT n]
[OFFSET n]
[EMIT emit_policy]
[SETTINGS <key1>=<value1>, <key2>=<value2>, ...]
```

Only `SELECT` and `FROM` clauses are required (you can even omit `FORM`, such as `SELECT now()`, but it's less practical). Other clauses in `[..]` are optional. We will talk about them one by one in the reverse order, i.e. [SETTINGS](/query-syntax#settings), then [EMIT](/streaming-aggregations#emit), [LIMIT](/query-syntax#limit), etc.

SQL keywords and function names are case-insensitive, while the column names and stream names are case-sensitive.

## Streaming First Query Behavior {#streaming_first}

Before we look into the details of the query syntax, we'd like to highlight the default query behavior in Timeplus Proton is in the streaming mode, i.e.

- `SELECT .. FROM stream` will query the future events. Once you run the query, it will process new events. For example, if there are 1,000 events in the stream already, running `SELECT count() FROM stream` could return 0, if there is more new events.
- `SELECT .. FROM table(stream)` will query the historical data, just like many of other databases. In the above sample stream, if you run `SELECT count() FROM table(stream)`, you will get 1000 as the result and the query completed.

## SETTINGS{#settings}

Timeplus supports some advanced `SETTINGS` to fine tune the streaming query processing behaviors. Check [Query Settings](/query-settings).


## PARTITION BY

`PARTITION BY` in Streaming SQL is to create [substreams](/substream).

## GROUP BY and HAVING {#group_having}

`GROUP BY` applies aggregations for 1 or more columns.

When `GROUP BY` is applied, `HAVING` is optional to filter the aggregation results. The difference between `WHERE` and`HAVING` is data will be filtered by `WHERE` clause first, then apply `GROUP BY`, and finally apply `HAVING`.

## LIMIT
`LIMIT n` When the nth result is emitted, the query will stop, even it's a streaming SQL.

### OFFSET
You can combine LIMIT and OFFSET, such as:
```sql
SELECT * FROM table(stream) ORDER BY a LIMIT 3 OFFSET 1
```
This will fetch the 3 rows from the 2nd smallest value of `a`.

## JOINs

Please check [Joins](/joins).

## WITH cte

CTE, or Common Table Expression, is a handy way to define [subqueries](#subquery) one by one, before the main SELECT clause.

## Subquery {#subquery}

### Vanilla Subquery

A vanilla subquery doesn't have any aggregation (this is a recursive definition), but can have arbitrary number of filter predicates, transformation functions. Some systems call this `flat map`.

Examples

```sql
SELECT device, max(cpu_usage)
FROM (
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
) GROUP BY device;
```

Vanilla subquery can be arbitrarily nested until Timeplus' system limit is hit. The outer parent query can be any normal vanilla query or windows aggregation or global aggregation.

Users can also write the query by using Common Table Expression (CTE) style.

```sql
WITH filtered AS(
    SELECT * FROM device_utils WHERE cpu_usage > 80 -- vanilla subquery
)
SELECT device, max(cpu_usage) FROM filtered GROUP BY device;
```

Multiple CTE can be defined in one query, such as

```sql
WITH cte1 AS (SELECT ..),
     cte2 AS (SELECT ..)
SELECT .. FROM cte1 UNION SELECT .. FROM cte2
```

CTE with column alias is not supported.

### Streaming Window Aggregated Subquery

A window aggregate subquery contains windowed aggregation. There are some limitations users can do with this type of subquery.

1. Timeplus supports window aggregation parent query over windowed aggregation subquery (hop over hop, tumble over tumble etc), but it only supports 2 levels. When laying window aggregation over window aggregation, please pay attention to the window size: the window
2. Timeplus supports multiple outer global aggregations over a windowed subquery. (Not working for now).
3. Timeplus allows arbitrary flat transformation (vanilla query) over a windows subquery until a system limit is hit.

Examples

```sql
-- tumble over tumble
WITH avg_5_second AS (
    SELECT device, avg(cpu_usage) AS avg_usage, any(window_start) AS start -- tumble subquery
    FROM
      tumble(device_utils, 5s)
    GROUP BY device, window_start
)
SELECT device, max(avg_usage), window_end -- outer tumble aggregation query
FROM tumble(avg_5_second, start, 10s)
GROUP BY device, window_end;
```

```sql
-- global over tumble
SELECT device, max(avg_usage) -- outer global aggregation query
FROM
(
    SELECT device, avg(cpu_usage) AS avg_usage -- tumble subquery
    FROM
        tumble(device_utils, 5s)
    GROUP BY device, window_start
) AS avg_5_second
GROUP BY device;
```

### Global Aggregated Subquery

A global aggregated subquery contains global aggregation. There are some limitations users can do with global aggregated subquery:

1. Timeplus supports global over global aggregation and there can be multiple levels until a system limit is hit.
2. Flat transformation over global aggregation can be multiple levels until a system limit is hit.
3. Window aggregation over global aggregation is not supported.

Examples

```sql
SELECT device, max_k(avg_usage,5) -- outer global aggregation query
FROM
(
    SELECT device, avg(cpu_usage) AS avg_usage -- global aggregation subquery
    FROM device_utils
    GROUP BY device
) AS avg_5_second;
```

## Common Types of Queries

### Streaming Tailing {#streaming-tailing}

```sql
SELECT <expr>, <columns>
FROM <stream_name>
[WHERE clause]
```

Examples

```sql
SELECT device, cpu_usage
FROM devices_utils
WHERE cpu_usage >= 99
```

The above example continuously evaluates the filter expression on the new events in the stream `device_utils` to filter out events which have `cpu_usage` less than 99. The final events will be streamed to clients.
