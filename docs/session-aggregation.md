# Session Window Aggregation

## Overview

A **Session Window** groups together events that arrive close in time, separated by periods of inactivity. Unlike [tumble](/tumble-aggregation) and [hop](/hop-aggregation) windows, which are defined by fixed durations, a session window dynamically starts when the first qualifying event arrives and closes when its event-time idle gap or maximum duration is reached, or when an end condition is met.

This type of window is ideal for modeling user sessions, bursty event streams, or workloads where data comes in uneven bursts rather than at constant intervals.

Use [`PARTITION BY`](/partition-data) for independent sessions per key. `GROUP BY` groups results within the sessions that have already been assigned.

## Syntax

```sql
SELECT <grouping_keys>, <aggregate_functions>
FROM session(<stream_name> [, <timestamp_column>], <idle_gap> [, <max_duration>] [, <session_boundaries>])
[PARTITION BY <session_keys>]
[WHERE <conditions>]
GROUP BY <window_grouping_keys> [, <other_grouping_keys>]
[EMIT <emit_policy>];
```

### Parameters

- `<stream_name>` : (**Required**) The source stream the session window applies to. 
- `<timestamp_column>` : (**Optional**) The `datetime` or `datetime64` column or expression used to calculate window starts / ends and timeout. Using wall clock `now()` or `now64(3)` usually doesn't make sense in session window. Default is `_tp_time` if absent.
- `<idle_gap>` : (**Required**) Defines the event-time gap used to split sessions (e.g., 5s, 1m).
- `<max_duration>` : (**Optional**) Maximum allowed session duration. Default is 5 times of `<idle_gap>` if absent. It must be at least as large as the idle gap and use compatible interval units.
- `<session_boundaries>` : (**Optional**) A pair of custom boolean expressions used to define the session’s start and end boundaries. The bare pair `<start_condition>, <end_condition>` includes both boundary rows. The **inclusion or exclusion** of each boundary row depends on the bracket type:
    - `[<start_condition>, <end_condition>]` includes the opening and closing rows.
    - `[<start_condition>, <end_condition>)` includes the opening row and excludes the closing row.
    - `(<start_condition>, <end_condition>]` excludes the opening row and includes the closing row.
    - `(<start_condition>, <end_condition>)` excludes both boundary rows.
- `<window_grouping_keys>` must include `window_start`, `window_end`, or both. If you select both boundary columns directly, include both in `GROUP BY`.

### Example

```sql
CREATE STREAM click_stream(
  user_id string,
  action string,
  timestamp datetime64(3)
);

SELECT
  user_id,
  count_if(action = 'click') AS click_count,
  window_start,
  window_end
FROM
  session(click_stream, timestamp, 15s, 30m, action = 'login', action = 'logout')
PARTITION BY
  user_id
GROUP BY
  user_id, window_start, window_end;
```

**Explanation**:
- The query defines a **session window** over the stream `click_stream`. The session window starts for each user when action is `login`. The query counts only `click` actions.
- The session window ends when:
  1. A `logout` action happens, or
  2. A later event reaches the 15-second idle deadline, or
  3. A later event reaches the 30-minute maximum duration.

Without `PARTITION BY`, the input to each aggregation processor shares session boundaries. A completely idle partition can keep its last session open until another event arrives or an explicit timeout fires.

### Limitations

- For multi-shard input without `PARTITION BY`, use `SHUFFLE BY` to colocate related rows, or set `allow_independent_shard_processing=true` if they are already colocated.
- `PARTITION BY` requires the memory aggregator.

## Emit Policies

By default, **EMIT AFTER WINDOW CLOSE** is applied.

The session window will emit results automatically once it is closed. Use `EMIT AFTER WINDOW CLOSE AND TIMEOUT 20s` to close pending sessions after a period of wall-clock inactivity.

**EMIT PERIODIC**, **EMIT ON UPDATE**, and **EMIT ON UPDATE WITH BATCH** are also supported to emit intermediate results before the session window is closed. Session windows do not support `WITH DELAY` or `EMIT PER EVENT`.

## Difference Between `EMIT AFTER SESSION CLOSE`

[EMIT AFTER SESSION CLOSE](/global-aggregation#emit-after-session-close) tracks one open aggregate per grouping key using a hybrid hash table. Use `session()` for event-time inactivity gaps and when the query needs `window_start` and `window_end`.
