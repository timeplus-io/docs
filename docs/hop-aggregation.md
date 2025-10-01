# Hop Window Aggregation {#hop_window}

## Overview

Like [Tumble](#tumble), Hop also slices the unbounded streaming data into smaller windows, and it has an additional sliding step.

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM hop(<stream_name>, [<timestamp_column>], <hop_slide_size>, [hop_windows_size], [<time_zone>])
[WHERE clause]
GROUP BY [<window_start | window_end>], ...
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
```

Hop window is a more generalized window compared to tumble window. Hop window has an additional
parameter called `<hop_slide_size>` which means window progresses this slide size every time. There are 3 cases:

1. `<hop_slide_size>` is less than `<hop_window_size>`. Hop windows have overlaps meaning an event can fall into several hop windows.
2. `<hop_slide_size>` is equal to `<hop_window_size>`. Degenerated to a tumble window.
3. `<hop_slide_size>` is greater than `<hop_window_size>`. Windows has a gap in between. Usually not useful, hence not supported so far.

Please note, at this point, you need to use the same time unit in `<hop_slide_size>` and `<hop_window_size>`, for example `hop(device_utils, 1s, 60s)` instead of `hop(device_utils, 1s, 1m)`.

Here is one hop window example which has 2 seconds slide and 5 seconds hop window.

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:02", "2020-01-01 00:00:07]
["2020-01-01 00:00:04", "2020-01-01 00:00:09]
["2020-01-01 00:00:06", "2020-01-01 00:00:11]
...
```

Except that the hop window can have overlaps, other semantics are identical to the tumble window.

```sql
SELECT device, max(cpu_usage)
FROM hop(device_utils, 2s, 5s)
GROUP BY device, window_end
EMIT AFTER WINDOW CLOSE;
```

The above example SQL continuously aggregates max cpu usage per device per hop window for stream `device_utils`. Every time a window is closed, Timeplus emits the aggregation results.
 
## Emit Policies

### EMIT AFTER WINDOW CLOSE {#emit_after}

You can omit `EMIT AFTER WINDOW CLOSE`, since this is the default behavior for time window aggregations. For example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results. How to determine the window should be closed? This is done by [Watermark](/understanding-watermark), which is an internal timestamp. It is guaranteed to be increased monotonically per stream query.

### EMIT AFTER WINDOW CLOSE WITH DELAY {#emit_after_with_delay}

Example:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, widnow_end
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `device_utils`. Every time a window is closed, Timeplus Proton waits for another 2 seconds and then emits the aggregation results.

### EMIT ON UPDATE {#emit_on_update}

You can apply `EMIT ON UPDATE` in time windows, such as tumble/hop/session, with `GROUP BY` keys. For example:

```sql
SELECT
  window_start, cid, count() AS cnt
FROM
  tumble(car_live_data, 5s)
WHERE
  cid IN ('c00033', 'c00022')
GROUP BY
  window_start, cid
EMIT ON UPDATE
```

During the 5 second tumble window, even the window is not closed, as long as the aggregation value(`cnt`) for the same `cid` is different , the results will be emitted.

### EMIT ON UPDATE WITH DELAY {#emit_on_update_with_delay}

Adding the `WITH DELAY` to `EMIT ON UPDATE` will allow late event for the window aggregation.

```sql
SELECT
  window_start, cid, count() AS cnt
FROM
  tumble(car_live_data, 5s)
WHERE
  cid IN ('c00033', 'c00022')
GROUP BY
  window_start, cid
EMIT ON UPDATE WITH DELAY 2s
```

### EMIT ON UPDATE WITH BATCH {#emit_on_update_with_batch}

You can combine `EMIT PERIODIC` and `EMIT ON UPDATE` together. In this case, even the window is not closed, Timeplus will check the intermediate aggregation result at the specified interval and emit rows if the result is changed.
```sql
SELECT
  window_start, cid, count() AS cnt
FROM
  tumble(car_live_data, 5s)
WHERE
  cid IN ('c00033', 'c00022')
GROUP BY
  window_start, cid
EMIT ON UPDATE WITH BATCH 2s
```
