# Tumble Window Aggregation {#tumble_window}

## Overview
Tumble slices the unbounded data into different windows according to its parameters. Internally, Timeplus observes the data streaming and automatically decides when to close a sliced window and emit the final results for that window.

```sql
SELECT <column_name1>, <column_name2>, <aggr_function>
FROM tumble(<stream_name>, [<timestamp_column>], <tumble_window_size>, [<time_zone>])
[WHERE clause]
GROUP BY [window_start | window_end], ...
EMIT <window_emit_policy>
SETTINGS <key1>=<value1>, <key2>=<value2>, ...
```

Tumble window means a fixed non-overlapped time window. Here is one example for a 5 seconds tumble window:

```
["2020-01-01 00:00:00", "2020-01-01 00:00:05]
["2020-01-01 00:00:05", "2020-01-01 00:00:10]
["2020-01-01 00:00:10", "2020-01-01 00:00:15]
...
```

`tumble` window in Timeplus is left closed and right open `[)` meaning it includes all events which have timestamps **greater or equal** to the **lower bound** of the window, but **less** than the **upper bound** of the window.

`tumble` in the above SQL spec is a table function whose core responsibility is assigning tumble window to each event in a streaming way. The `tumble` table function will generate 2 new columns: `window_start, window_end` which correspond to the low and high bounds of a tumble window.

`tumble` table function accepts 4 parameters: `<timestamp_column>` and `<time-zone>` are optional, the others are mandatory.

When the `<timestamp_column>` parameter is omitted from the query, the stream's default event timestamp column which is `_tp_time` will be used.

When the `<time_zone>` parameter is omitted the system's default timezone will be used. `<time_zone>` is a string type parameter, for example `UTC`.

`<tumble_window_size>` is an interval parameter: `<n><UNIT>` where `<UNIT>` supports `s`, `m`, `h`, `d`, `w`.
It doesn't yet support `M`, `q`, `y`. For example, `tumble(my_stream, 5s)`.

More concrete examples:

```sql
SELECT device, max(cpu_usage)
FROM tumble(device_utils, 5s)
GROUP BY device, window_end
```

The above example SQL continuously aggregates max cpu usage per device per tumble window for the stream `devices_utils`. Every time a window is closed, Timeplus Proton emits the aggregation results.

Let's change `tumble(stream, 5s)` to `tumble(stream, timestmap, 5s)` :

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, timestamp, 5s)
GROUP BY device, window_end
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

Same as the above delayed tumble window aggregation, except in this query, user specifies a **specific time column** `timestamp` for tumble windowing.

The example below is so called processing time processing which uses wall clock time to assign windows. Timeplus internally processes `now/now64` in a streaming way.

```sql
SELECT device, max(cpu_usage)
FROM tumble(devices, now64(3, 'UTC'), 5s)
GROUP BY device, window_end
EMIT AFTER WINDOW CLOSE WITH DELAY 2s;
```

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
