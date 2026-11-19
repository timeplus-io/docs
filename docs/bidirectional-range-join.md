# Bidirectional Range Join

**Bidirectional Range Join** is an enhancement of the regular bidirectional join designed to reduce memory consumption and improve performance when dealing with large or unbounded data streams.  

For append streams, while a standard bidirectional join buffers **all** records from both sides, a **range-based** approach **buckets data by time**, letting Timeplus evict old buckets as the watermark advances.

## Syntax

```sql
SELECT *
FROM left_append_stream
[LEFT | INNER] JOIN right_append_stream
ON left_append_stream.key = right_append_stream.key AND date_diff_within(<time_range>[, <left_timestamp_col>, <right_timestamp_col>]);
```

The `date_diff_within(...)` clause defines the time range condition for joining records across streams.
- `time_range` — The maximum time difference allowed between the two sides for them to be considered a match. Only second or minute intervals are supported (e.g., `2m`, `5s`).
- `left_timestamp_col / right_timestamp_col` — Columns in `datetime` or `datetime64` type used to compute the range difference. The columns must have matching types and precision.
If omitted, the system uses _tp_time for both streams by default.

**Example Variants**:
```sql
-- Use default timestamp columns (_tp_time)
ON left_append_stream.key = right_append_stream.key AND date_diff_within(2m);

-- Specify explicit timestamp columns
ON left_append_stream.key = right_append_stream.key 
   AND date_diff_within(10s, left_append_stream.event_time, right_append_stream.event_time);
```

For an asymmetric range, use a condition such as `date_diff('second', left_ts, right_ts) BETWEEN 0 AND 30` with the join keys. The lower bound must be less than the upper bound, and the range must include zero.

## Example

```sql
CREATE STREAM left_range(i int, k string);
CREATE STREAM right_range(ii int, kk string);

-- Run bidirectional range join in another console (console-1)
SELECT * FROM left_range JOIN right_range ON left_range.k = right_range.kk AND date_diff_within(30s);

INSERT INTO left_range(i, k, _tp_time) VALUES (1, 'a', '2023-07-01 00:01:00');
INSERT INTO right_range(ii, kk, _tp_time) VALUES (22, 'a', '2023-07-01 00:00:50');

-- We will observe the join these results in console-1
-- ┌─i─┬─k─┬────────────────_tp_time─┬─ii─┬─kk─┬────right_range._tp_time─┐
-- │ 1 │ a │ 2023-07-01 00:01:00.000 │ 22 │ a  │ 2023-07-01 00:00:50.000 │
-- └───┴───┴─────────────────────────┴────┴────┴─────────────────────────┘
```

At runtime, the engine performs the following:

1. **Buckets Source Data**
    - Each side’s records are grouped into **range buckets** based on the timestamp in the join condition.
    - For example, with `date_diff_within(30s)`, records are partitioned into 30-second intervals.
2. **Builds Range-Specific Hash Tables**
    - Each side maintains its own hash indexes for active time buckets.
3. **Performs Range-Aware Joins**
    When a new record arrives, the system:
    - Determines which **range bucket** it belongs to.
    - Probes corresponding hash tables in relevant ranges to find matching records.
    - Emits joined results immediately when matches are found.
4. **Evicts Old Ranges**
    - Timeplus evicts buckets when the join's combined watermark moves past the bounds for those buckets.

The following diagram depicts this join behavior.

![BidirectionalRangeJoin](/img/bidirectional-range-join.svg)

## Limits

- `max_join_range` limits the total interval width in seconds. The default is `300`. A symmetric `date_diff_within(2m)` has a width of 240 seconds.
- An idle or slow input can hold back watermark-based eviction. Set `keep_range_join_max_buckets` to cap the retained bucket count on each side. The default, `0`, leaves the cap disabled. A positive cap can evict a bucket before the watermark and miss a later match.
- The bucket count does not limit the number of rows in a bucket. For a large join state, see [hybrid hash joins](/query-settings#default_hash_join).
