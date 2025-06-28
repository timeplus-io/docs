# Streaming Windows
### Tumble Streaming Window Aggregation {#tumble}

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

### Hop Streaming Window Aggregation {#hop}

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

### Session Streaming Window Aggregation {#session}

This is similar to tumble and hop window. Please check the [session](/functions_for_streaming#session) function.
