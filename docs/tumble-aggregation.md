# Tumble Window Aggregation

## Overview

A **tumbling window** divides an unbounded data stream into **fixed-size, non-overlapping intervals** based on event time or processing time.  

Each event belongs to **exactly one** window. This is useful for periodic aggregations such as per-minute averages, hourly counts, or daily summaries.

Unlike **hopping** or **session** windows, tumbling windows do not overlap — once a window closes, a new one immediately starts.  
This makes them simple, deterministic, and ideal for producing periodic reports or metrics.

## Syntax

```sql
SELECT <grouping_keys>, <aggr_functions>
FROM tumble(<stream_name>, [<timestamp_column>], <window_size>])
[WHERE clause]
GROUP BY [window_start | window_end], <other_grouping_keys> ...
EMIT <emit_policy>
```

### Parameters

- `<stream_name>` : the source stream the tumble window applies to. **Required**
- `<timestamp_column>` : the event timestamp column which is used to calculate window starts / ends and internal watermark. You can use `now()` or `now64(3)` to enable processing time tumble window. Default is `_tp_time` if absent. **Optional**
- `<window_size>` : tumble window interval size. Supported interval units are listed below. **Required**
  - `s` (second)
  - `m` (miniute)
  - `h` (hour) 
  - `d` (day) 
  - `w` (week) 

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

Each event falls into exactly one window, ensuring deterministic aggregation and predictable output intervals.

## Emit Policies

Emit policies define **when** Timeplus should output results from **time-windowed** aggregations such as **tumble**, **hop**, **session** and **global-windowed** aggregation.

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
A watermark is an internal timestamp that advances monotonically per stream, determining when a window can be safely closed.
:::

### `EMIT AFTER WINDOW CLOSE WITH DELAY`

Adds a **delay period** before emitting window results, allowing **late events** to be included.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM tumble(device_metrics, 5s)
GROUP BY window_start, device
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

This query aggregates the **maximum CPU usage** for each device per 5-second tumble window, then waits 2 additional seconds after the window closes before emitting results. This helps capture any late-arriving events that fall within the window period.

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
- If **no new events** arrive for **3 seconds**, Timeplus will **force-close** the most recent window and emit the final results.
- Once the window is closed, the **internal watermark** (event time) advances as well.
- Any **late events** that belong to this now-closed window will be discarded.

### `EMIT ON UPDATE`

Emits **intermediate aggregation updates** whenever the results change within an open window.
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
Timeplus checks the intermediate aggregation results at regular intervals and emits them if they have changed which can significally improve the emit efficiency and throughput compared with `EMIT ON UPDATE`. 

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

Similar to **`EMIT ON UPDATE`**, but includes a delay to allow late events before emitting incremental updates.

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
