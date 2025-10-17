# Session Window Aggregation

## Overview

A **Session Window** groups together events that arrive close in time, separated by periods of inactivity. Unlike [tumble](/tumble-aggregation) and [hop](/hop-aggregation) windows, which are defined by fixed durations, a session window dynamically starts when the first event arrives and closes when there’s a defined period of **inactivity** (known as the *idle* gap).

This type of window is ideal for modeling user sessions, bursty event streams, or workloads where data comes in uneven bursts rather than at constant intervals.

Each session is unique to a specific grouping key and does not overlap with other sessions for the same key.

## Syntax

```sql
SELECT <grouping_keys>, <aggregate_functions>
FROM session(<stream_name> [, <timestamp_column>], <idle_gap> [, <max_duration>] [, <start_condition>, <end_condition>])
[WHERE <conditions>]
GROUP BY [window_start | window_end], <other_grouping_keys>;
EMIT <emit_policy>;
```

### Parameters

- `<stream_name>` : (**Required**) The source stream the hop window applies to. 
- `<timestamp_column>` : (**Required**) The event timestamp column which is used to calculate window starts / ends and timeout. Using wall clock `now()` or `now64(3)` usually doesn't make sense in hop window. Default is `_tp_time` if absent. 
- `<idle_gap>` : (**Required**) Defines the inactivity timeout to close the session window (e.g., 5s, 1m).
- `<max_duration>` : (**Optional**) Maximum allowed session duration. Once exceeded, the session closes automatically. Default is 5 times of `<idle_gap>` if absent. 
- `[<start_condition>, <end_condition>]` — **(Optional)** A pair of custom boolean expressions used to define the session’s start and end boundaries. These conditions are useful for domain-specific triggers that go beyond time-based sessioning. The **inclusion or exclusion** of events relative to the boundary conditions depends on the bracket type:
    1. `[<start_condition>, <end_condition>]` — Include events that satisfy both the start and end conditions.
    2. `[<start_condition>, <end_condition>)` — Include events that satisfy only the start condition.
    3. `(<start_condition>, <end_condition>]` — Include events that satisfy only the end condition.
    4. `(<start_condition>, <end_condition>)` — Exclude events that meet either the start or end condition.

In summary, a session window can close under any of the following conditions:
1. **Idle timeout reached** — no new events arrive within the configured idle gap.
2. **Maximum session duration reached** — the window duration exceeds the specified maximum length.
3. **End condition met** — the user-defined end condition (e.g., a specific event or signal) is satisfied.

### Example

```sql
CREATE STREAM click_stream(
  user_id string,
  action string,
  timestamp datetime64(3)
);

SELECT
  user_id,
  count(*) AS click_count,
  window_start,
  window_end
FROM
  session(click_stream, timestamp, 15s, 30m, position(action, 'login') > 0, position(action, 'logout') > 0)
GROUP BY
  user_id, window_start, window_end
```

**Explanation**:
- The query defines a **session window** over the stream `click_stream`. The session window starts  when action is `login`. 
- Session window ends when  
  1. `logout` action happens or
  2. 15 seconds of inactivity are detected or
  3. Max window duration 30 minutes reaches  

## Emit Policies

Currently, only **EMIT AFTER WINDOW CLOSE** is supported.

The session window will emit results automatically once it is closed — that is, when any of the configured closing conditions are met.
