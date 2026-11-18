# Tumble Window Aggregation

## Overview

A **tumbling window** divides an unbounded data stream into **fixed-size, non-overlapping intervals** based on event time or processing time.  

Each event belongs to **exactly one** window. This is useful for periodic aggregations such as per-minute averages, hourly counts, or daily summaries.

Tumbling windows do not overlap. Their boundaries are adjacent, and the watermark determines when each window closes.
This makes them simple, deterministic, and ideal for producing periodic reports or metrics.

## Syntax

```sql
SELECT <grouping_keys>, <aggr_functions>
FROM tumble(<stream_name> [, <timestamp_column>], <window_size> [, <timezone>])
[WHERE clause]
GROUP BY <window_grouping_keys> [, <other_grouping_keys>]
[EMIT <emit_policy>];
```

### Parameters

- `<stream_name>` : the source stream the tumble window applies to. **Required**
- `<timestamp_column>` : the event timestamp column or expression (`datetime` or `datetime64`) used to calculate window starts / ends and internal watermark. You can use `now()` or `now64(3)` to enable processing time tumble window. Default is `_tp_time` if absent. **Optional**
- `<window_size>` : tumble window interval size. Supported interval units are listed below. **Required**
  - `ns`, `us`, `ms` (nanosecond, microsecond, millisecond)
  - `s` (second)
  - `m` (minute)
  - `h` (hour)
  - `d` (day)
  - `w` (week)
  - `M`, `q`, `y` (month, quarter, year)
- `<timezone>` is an optional time zone string such as `'UTC'` that controls window alignment. It defaults to the time zone of the timestamp expression.
- `<window_grouping_keys>` must include `window_start`, `window_end`, or both. If you select both boundary columns directly, include both in `GROUP BY`.

For sub-second interval units, use a timestamp with sufficient precision and an interval that divides evenly into one hour. For example, `50ms` works with `datetime64(3)`.

### Example

```
CREATE STREAM device_metrics (
    device string,
    cpu_usage float,
    event_time datetime64(3) 
);

SELECT
    window_start,
    window_end,
    device,
    avg(cpu_usage) AS avg_cpu
FROM tumble(device_metrics, event_time, 5s)
GROUP BY
    window_start,
    window_end,
    device
EMIT AFTER WINDOW CLOSE;
```

**Explanation**:
- Events are grouped into **5-second, non-overlapping windows** based on their `event_time`.
- Each `device`’s events are aggregated independently within each window.
- When a window closes, the system emits one aggregated result per device with the computed `avg_cpu`.

**Example timeline**:

| Window | Time Range          | Events Included                |
| :----: | :------------------ | :----------------------------- |
|   W1   | 00:00:00 → 00:00:05 | Events in [00:00:00, 00:00:05) |
|   W2   | 00:00:05 → 00:00:10 | Events in [00:00:05, 00:00:10) |
|   W3   | 00:00:10 → 00:00:15 | Events in [00:00:10, 00:00:15) |

![TumbleWindow](/img/tumble-window.png)

Each event falls into exactly one window, which includes its start and excludes its end. Once the watermark reaches the end, the query can emit the final result and release the window's state.

## Emit Policies

Emit policies define **when** Timeplus should output results from **time-windowed** aggregations such as **tumble**, **hop**, and **session**.

These policies control whether results are emitted **only after the window closes**, **after a delay** to honor late events, or **incrementally during the window**.

### `EMIT AFTER WINDOW CLOSE`

This is the **default behavior** for all time window aggregations. Timeplus emits the aggregated results once the window closes.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM tumble(device_metrics, 5s)
GROUP BY window_start, device;
```

This query continuously computes the **maximum CPU usage** per device in every 5-second tumble window from the stream `device_metrics`.
Each time a window closes (as determined by the internal watermark), Timeplus emits the results once.

:::info
A watermark is an internal timestamp that determines when a window can be safely closed. With multiple inputs, the slowest input watermark can hold back window close. With [`PARTITION BY`](/partition-data), each partition has its own watermark.
:::

### `EMIT AFTER WINDOW CLOSE WITH DELAY`

Subtracts the specified interval from the maximum observed event timestamp before aligning the watermark to a window boundary. Rows older than the current watermark are dropped.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM tumble(device_metrics, 5s)
GROUP BY window_start, device
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

This query aggregates the **maximum CPU usage** for each device per 5-second tumble window. With `WITH DELAY 2s`, a window ending at `00:00:05` can close when event time reaches `00:00:07`.

### `EMIT TIMEOUT`

In some streaming scenarios, the **last tumble window** might remain open because no new events arrive to advance the watermark (i.e., the event time progress).
The **`EMIT TIMEOUT`** clause helps forcefully close such idle windows after a specified period of inactivity.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM tumble(device_metrics, 5s)
GROUP BY window_start, device
EMIT TIMEOUT 3s;
```

In this example:

- The query continuously aggregates the maximum CPU usage per device in **5-second tumble windows**.
- If **no new events** arrive for at least **3 seconds**, Timeplus can **force-close** pending windows and emit their final results.
- Later events cannot revise those finalized results. Empty windows produce no result.

### `EMIT ON UPDATE`

Emits **intermediate aggregation updates** for groups updated by an input batch while the window is open. An updated group can be emitted with the same aggregate value.
This is useful for near real-time visibility into evolving metrics.

**Example**:

```sql
SELECT
  window_start, device, max(cpu_usage)
FROM
  tumble(device_metrics, 5s)
GROUP BY
  window_start, device
EMIT ON UPDATE;
```

Here, during each 5-second window, the system emits updates whenever there are new events flowing into the open window, even before the window closes.

### `EMIT ON UPDATE WITH BATCH`

Combines **periodic emission** with **update-based** triggers.
Timeplus emits results for groups updated since the previous emission at the configured interval, which can improve throughput compared with `EMIT ON UPDATE`.

**Example**:

```sql
SELECT
  window_start, device, max(cpu_usage)
FROM
  tumble(device_metrics, 5s)
GROUP BY
  window_start, device
EMIT ON UPDATE WITH BATCH 1s;
```

### `EMIT ON UPDATE WITH DELAY`

Similar to **`EMIT ON UPDATE`**, but applies a delay to the event-time watermark used for window close and late-event filtering. Intermediate updates can still be emitted before the watermark advances.

**Example**:

```sql
SELECT
  window_start, device, max(cpu_usage)
FROM
  tumble(device_metrics, 5s)
GROUP BY
  window_start, device
EMIT ON UPDATE WITH DELAY 2s;
```
