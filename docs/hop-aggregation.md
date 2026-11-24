# Hop Window Aggregation

## Overview

A **hop window** (also known as a **sliding window**) is a type of time-based window that allows data to be grouped into **overlapping segments**.

Each hop window is defined by two parameters:
- **Window size** – the total duration of each window.
- **Hop interval** – how often a new window starts.

Because hop windows can overlap, a single event can belong to multiple windows. This is useful when you want to generate **smoother, more continuous aggregations** (e.g., moving averages or rolling counts).

For example, with a 10-minute window size and a 5-minute hop interval, a new window starts every 5 minutes and spans 10 minutes of data — meaning there are always **two overlapping windows** active at any given time.


## Syntax

```sql
SELECT <grouping_keys>, <aggr_functions>
FROM hop(<stream_name> [, <timestamp_column>], <hop_interval>, <window_size> [, <timezone>])
[WHERE clause]
GROUP BY <window_grouping_keys> [, <other_grouping_keys>]
[EMIT <emit_policy>];
```

### Parameters

- `<stream_name>` : the source stream the hop window applies to. **Required**
- `<timestamp_column>` : the event timestamp column or expression (`datetime` or `datetime64`) used to calculate window starts / ends and internal watermark. You can use `now()` or `now64(3)` to enable processing time hop window. Default is `_tp_time` if absent. **Optional**
- `<hop_interval>` : how frequently new windows start (must be less than or equal to the window size). Supported interval units are listed below. **Required**
  - `s` (second)
  - `m` (minute)
  - `h` (hour) 
  - `d` (day) 
  - `w` (week) 
- `<window_size>` : hop window interval size. Supported interval units are listed below. **Required**
  - `s` (second)
  - `m` (minute)
  - `h` (hour) 
  - `d` (day)
  - `w` (week)
- `<timezone>` is an optional time zone string such as `'UTC'` that controls window alignment. It defaults to the time zone of the timestamp expression.
- `<window_grouping_keys>` must include `window_start`, `window_end`, or both. If you select both boundary columns directly, include both in `GROUP BY`.

Both intervals also support sub-second and calendar units. See the [tumble interval units](/tumble-aggregation#parameters) for the full list. Use units that Timeplus can convert to a common scale. For example, `4s` and `1m` work together, while `1d` and `1M` cannot be combined. For sub-second interval units, the timestamp must have sufficient precision and the hop interval must divide evenly into one hour.

### Example

The following query calculates the maximum CPU usage of each device in **10-second hop windows** that start every **4 seconds**.

```sql
CREATE STREAM device_metrics (
    device string,
    cpu_usage float,
    event_time datetime64(3) 
);

SELECT 
  window_start, 
  window_end, 
  device, 
  max(cpu_usage)
FROM hop(device_metrics, event_time, 4s, 10s)
GROUP BY window_start, window_end, device;
```

This allows you to track metrics like CPU usage in a rolling fashion, providing near-real-time insight into recent activity rather than discrete, non-overlapping periods.

Timeplus aggregates rows into buckets sized by the greatest common divisor of the hop interval and window size. For `hop(..., 4s, 10s)`, each bucket is 2 seconds wide and each window merges the state of five buckets.

## Emit Policies

Emit policies define **when** Timeplus should output results from **time-windowed** aggregations such as **tumble**, **hop**, and **session**.

These policies control whether results are emitted **only after the window closes**, **after a delay** to honor late events, or **incrementally during the window**.

Use a window-based policy for hopping-window results. In the current implementation, `EMIT PER EVENT` emits the internal bucket for each input row without merging buckets into hopping windows.

### `EMIT AFTER WINDOW CLOSE`

This is the **default behavior** for all time window aggregations. Timeplus emits the aggregated results once the window closes.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM hop(device_metrics, 4s, 10s)
GROUP BY window_start, device;
```

This query continuously computes the **maximum CPU usage** per device in every 10-second hop window from the stream `device_metrics` and every 4 seconds, it starts a new hop window.
Each time a window closes (as determined by the internal watermark), Timeplus emits the results once.

:::info
A watermark is an internal timestamp that advances monotonically per stream, determining when a window can be safely closed.
:::

### `EMIT AFTER WINDOW CLOSE WITH DELAY`

Adds a **delay period** before emitting window results, allowing **late events** to be included.

The delay is subtracted from the maximum observed event timestamp when calculating the watermark. A row older than the current watermark is dropped, even if it also falls in a newer overlapping window.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM hop(device_metrics, 4s, 10s)
GROUP BY window_start, device
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

This query aggregates the **maximum CPU usage** for each device per 10-second hop window. With `WITH DELAY 2s`, a window ending at `00:00:10` can close when event time reaches `00:00:12`.

### `EMIT TIMEOUT`

In some streaming scenarios, the **last hop windows** might remain open because no new events arrive to advance the watermark (i.e., the event time progress).
The **`EMIT TIMEOUT`** clause helps forcefully close such idle windows after a specified period of inactivity.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM hop(device_metrics, 4s, 10s)
GROUP BY window_start, device
EMIT TIMEOUT 3s;
```

In this example:

- The query continuously aggregates the maximum CPU usage per device in **10-second hop windows**.
- If **no new events** arrive for at least **3 seconds**, Timeplus can **force-close** pending windows and emit their final results.
- Once the window is closed, the **internal watermark** (event time) advances as well.
- Any **late events** that belong to those closed windows cannot revise the final results.

### `EMIT ON UPDATE`

Emits **intermediate aggregation updates** whenever there are new events flowing in an open window.
This is useful for near real-time visibility into evolving metrics.

**Example**:

```sql
SELECT
  window_start, device, max(cpu_usage)
FROM
  hop(device_metrics, 4s, 10s)
GROUP BY
  window_start, device
EMIT ON UPDATE;
```

Here, during each 10-second window, the system emits updates whenever there are new events flowing into the open window, even before the window closes.

### `EMIT ON UPDATE WITH BATCH`

Combines **periodic emission** with **update-based** triggers.
Timeplus checks for updated groups at regular intervals and emits their results. This can improve throughput compared with `EMIT ON UPDATE`.

**Example**:

```sql
SELECT
  window_start, device, max(cpu_usage)
FROM
  hop(device_metrics, 4s, 10s)
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
  hop(device_metrics, 4s, 10s)
GROUP BY
  window_start, device
EMIT ON UPDATE WITH DELAY 2s;
```
