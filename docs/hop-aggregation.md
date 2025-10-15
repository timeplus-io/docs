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
SELECT <grouping-keys>, <aggr-functions>
FROM hop(<stream-name>, [<timestamp-column>], <hop-interval>, <window-size>)
[WHERE clause]
GROUP BY [<window_start | window_end>], <other-group-keys> ...
EMIT <emit-policy>
```

### Parameters

- `<stream-name>` : the source stream the hop window applies to. **Required**
- `<timestamp-column>` : the event timestamp column which is used to calculate window starts / ends and internal watermark. You can use `now()` or `now64(3)` to enable processing time hop window. Default is `_tp_time` if absent. **Optional**
- `<hop-interval>` : how frequently new windows start (must be less than or equal to the window size). Supported interval units are listed below. **Required**
  - `s` : second
  - `m` : miniute
  - `h` : hour 
  - `d` : day 
  - `w` : week 
- `<window-size>` : hop window interval size. Supported interval units are listed below. **Required**
  - `s` : second
  - `m` : miniute
  - `h` : hour 
  - `d` : day 
  - `w` : week 

### Example

The following query calculates the average CPU usage of each device in **10-second hop windows** that start every **4 second**.

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

## Emit Policies

Emit policies define **when** Timeplus should output results from **time-windowed** aggregations such as **tumble**, **hop**, **session** and **global-windowed** aggregation.

These policies control whether results are emitted **only after the window closes**, **after a delay** to honor late events, or **incrementally during the window**.

### `EMIT AFTER WINDOW CLOSE`

This is the **default behavior** for all time window aggregations. Timeplus emits the aggregated results once the window closes.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM hop(device_metrics, 4s, 10s)
GROUP BY window_start, device;
```

This query continuously computes the **maximum CPU usage** per device in every 10-second hop window from the stream `device_metrics` and every 4 second, it starts a new hop window.
Each time a window closes (as determined by the internal watermark), Timeplus emits the results once.

:::info
A watermark is an internal timestamp that advances monotonically per stream, determining when a window can be safely closed.
:::

### `EMIT AFTER WINDOW CLOSE WITH DELAY`

Adds a **delay period** before emitting window results, allowing **late events** to be included.

**Example**:

```sql
SELECT window_start, device, max(cpu_usage)
FROM hop(device_utils, 4s, 10s)
GROUP BY window_start, device
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

This query aggregates the **maximum CPU usage** for each device per 10-second hop window, then waits 2 additional seconds after the window closes before emitting results. This helps capture any late-arriving events that fall within the window period.

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
- If **no new events** arrive for **3 seconds**, Timeplus will **force-close** the most recent windows and emit the final results.
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
  hop(device_devices, 4s, 10s)
GROUP BY
  window_start, device
EMIT ON UPDATE;
```

Here, during each 10-second window, the system emits updates whenever there are new events flowing into the open window, even before the window closes.

### `EMIT ON UPDATE WITH BATCH`

Combines **periodic emission** with **update-based** triggers.
Timeplus checks the intermediate aggregation results at regular intervals and emits them if they have changed which can significally improve the emit efficiency and throughput compared with `EMIT ON UPDATE`. 

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

Similar to **`EMIT ON UPDATE`**, but includes a delay to allow late events before emitting incremental updates.

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
