# Time Ranges in Windows and Joins: Limits and Sizing

Streaming windows ([tumble](/tumble-aggregation), [hop](/hop-aggregation), [session](/session-aggregation)), `EMIT LAST`, and [range joins](/bidirectional-range-join) all bound their state by **event time**. The time range you pick decides how much data Timeplus keeps in memory, how late an event may arrive and still be counted, and whether the query is accepted at all.

This page covers:

1. [Limits and settings](#limits) — what the engine accepts, and which settings control it.
2. [Sizing and best practices](#best-practices) — how to estimate memory and keep queries healthy at high EPS (events per second).

## Limits and Settings {#limits}

### Window Functions

| Rule | Applies to | Example of a rejected query / error |
|---|---|---|
| The time column must be `datetime` or `datetime64`. Defaults to `_tp_time`. | all windows | |
| Interval must be a positive integer. Units: `ms`, `s`, `m`, `h`, `d`, `w`, `M`, `q`, `y`. | tumble, hop | |
| Sub-second sizes must divide one hour evenly. | tumble, hop | `tumble(s, t, 7ms)` → `one hour must have an integer number of windows` |
| The window cannot be finer than the time column precision. | tumble, hop | `tumble(s, dt, 500ms)` on a `datetime` column → `the window scale '1' cannot exceed the event time scale '0'` |
| Slide must be less than or equal to window size. | hop | `hop(s, 10s, 5s)` → `Slide size shall be less than or equal to window size` |
| Slide and window may use different units if one converts to the other (for example `hop(s, 1m, 1h)`). Units that cannot be converted to each other are rejected. | hop | `hop(s, 1d, 1M)` → `Scale conversion is not possible between 'Month' and 'Day'` |
| Timeout must be less than or equal to the max session size (default: 5 × timeout). | session | `session(s, 10s, 5s)` → `Session timeout size shall be less than or equal to max session size` |

### Emit Policies

| Rule | Error |
|---|---|
| `WITH DELAY` only works with tumble and hop windows. | `Watermark with delay is only supported with streaming window function` |
| Session windows do not support `WITH DELAY`. | `Watermark with delay is not supported for session window` |
| `PERIODIC`, `DELAY` and `TIMEOUT` intervals support units up to `d` (day). | `the max interval kind supported is DAY` |
| `EMIT LAST <range>` on a **global** aggregation keeps `range / 2s` sub-windows, which must not exceed `max_windows` (default 1000). With defaults the largest range is about 33 minutes; `EMIT LAST 1h` fails unless you raise `max_windows`. `EMIT LAST` on a tumble/hop query is only a time filter and is not limited. | `Too big range or too small emit interval. Make sure 'range / emit_interval' is less or equal to 1000` |

```sql
-- Global aggregation over the last hour: 3600s / 2s = 1800 sub-windows
SELECT sum(amount) FROM trips EMIT LAST 1h SETTINGS max_windows = 1800;
```

### Late Events in Windows

The watermark of a window query advances with the **largest event time seen**, minus `DELAY` if set, aligned to the window boundary. Any event older than the current watermark is **dropped**. It is not counted in any window, and Timeplus logs a warning at most every 5 seconds:

```
WatermarkTransform: Found 1 late events for data (total=2). Last projected watermark=...
```

Example with `tumble(stream, t, 10s)` and events arriving in the order `01, 05, 12, 03, 25, 15, 40` (seconds):

| Emit policy | Window `[0,10)` | Window `[10,20)` | Dropped |
|---|---|---|---|
| `EMIT AFTER WINDOW CLOSE` | 2 (`01`, `05`) | 1 (`12`) | `03`, `15` |
| `EMIT AFTER WINDOW CLOSE WITH DELAY 5s` | 3 (`01`, `05`, `03`) | 1 (`12`) | `15` |

`15` is still dropped with a 5s delay: by the time it arrives the max event time is `25`, so the watermark is `25 - 5 = 20`.

Session windows accept no delay. An event older than the latest event already seen is dropped. For example, with `session(stream, t, 5s)` and events `01, 03, 02, 04`, the session counts 3 events; `02` is dropped.

### Range Join (`date_diff_within`)

`date_diff_within(<interval>[, <left_time>, <right_time>])` turns an append-stream ⨝ append-stream join into a [range join](/bidirectional-range-join). It matches rows where `|left_time - right_time| <= interval`, so the join range is `[-interval, +interval]` and its **width is `2 × interval`**.

| Rule | Error |
|---|---|
| Range width (`2 × interval`) must not exceed `max_join_range` (seconds, default **300**). With defaults the largest value is `date_diff_within(150s)`; `date_diff_within(3m)` already fails. | `The join range (-180, 180) is too big ...` |
| Interval units: `s` or `m` only. Use `60m` instead of `1h`. Sub-second intervals are not supported. | `only supports second or minute time interval` |
| Interval must be positive. | `shall be positive second or minute time interval` |
| Only one range condition per `ON` clause. | `Multiple range joins are detected in ON section` |
| At least one equality key is required. | `ASOF or Range join requires at least one 'equal' join key` |
| Only `INNER` and `LEFT` joins of two append streams. | `'Append' FULL ALL JOIN 'Append' is not supported` |
| Streaming queries only, and only inside `ON`. | `Range join is not supported in table or stream to table join` |

Note the range is the **total width**. For `date_diff_within(60m, ...)` the range is `(-3600, 3600)`, so you need `max_join_range >= 7200`. `max_join_range = 3600` is not enough.

#### One-sided ranges: shift the timestamp

`date_diff_within` is symmetric. If you only need right rows that arrive **after** the left row (for example "within 60 minutes after the campaign ends"), shift one side by half the range instead of doubling the range:

```sql
-- right.ts in [left.ts, left.ts + 60m]; range width 3600 instead of 7200
ON l.key = r.key
AND date_diff_within(30m, date_add(l.ts, 30m), r.ts)
SETTINGS max_join_range = 3600
```

This halves both the required `max_join_range` and the amount of data the join buffers.

#### Late rows, idle streams and memory limits

- Each side is split into buckets of half the range width. The join's watermark is the **minimum** of the two sides' latest buckets. A row whose bucket ends before that watermark is **dropped** and logged:
  ```
  MemoryHashJoin: Discard 1 late events in range bucket ... since it is later than latest combined watermark ...
  ```
- If one side stops receiving data (or its event time stops advancing), the watermark stops too and the other side's buffer **grows without bound**.
- When the buffered data of both sides reaches `join_max_buffered_bytes` (default 500 MB) the query **fails**:
  ```
  Streaming join's memory reaches max size: 1048576, current total: 1356588, ... (SET_SIZE_LIMIT_EXCEEDED)
  ```
- `keep_range_join_max_buckets` caps the number of buckets kept per side and evicts the oldest even if the watermark has not moved. Evicted rows can no longer be matched.

### Settings Reference

All settings below can be set per query or per materialized view with `SETTINGS ...` at the end of the `SELECT`.

| Setting | Default | Effect |
|---|---|---|
| `max_join_range` | `300` | Max range join width in seconds (`upper - lower`). |
| `keep_range_join_max_buckets` | `0` (no limit) | Max buckets kept per side in a range join. Oldest buckets are evicted when exceeded. |
| `join_max_buffered_bytes` | `524288000` | Max buffered bytes for a stream-to-stream join. The query fails when reached. |
| `max_windows` | `1000` | Max `range / 2s` for global `EMIT LAST <range>`. |
| `default_hash_table` / `default_hash_join` | `memory` | Set to `hybrid` to spill aggregation / join state to disk. See [Query Settings](/query-settings#default_hash_table). |

## Sizing and Best Practices {#best-practices}

### Estimate state size first

Memory is driven by **(events kept) × (row size)** for joins and by **(group keys) × (states per key)** for windows. Rough rules:

| Query shape | State kept | Example |
|---|---|---|
| Range join, width `W` | Each side keeps about `W` of event time (one to one-and-a-half `W`), plus however far it runs ahead of the other side. Bytes ≈ `EPS × row_bytes × W` per side. | `date_diff_within(60m)`: W = 2h. At 2,000 EPS × 300 bytes ≈ 4.3 GB, far above the 500 MB default `join_max_buffered_bytes`. The shifted form (`W = 1h`) halves it. |
| Tumble window | One aggregation state per key per open window. Usually one open window, plus about `DELAY / window` more. | 1M keys × 1 window |
| Hop window | Per key, `window / gcd(slide, window)` sub-window states. | `hop(5m, 1h)` → 12 per key. `hop(1s, 1d)` → 86,400 per key. |
| Global `EMIT LAST <range>` | Per key, `range / 2s` sub-window states. | `EMIT LAST 1h` → 1,800 per key |
| Global aggregation | One state per key, kept forever. | Use `hybrid` for high-cardinality keys. |

### Range joins

- **Keep the range as narrow as the business rule allows.** Memory and CPU grow linearly with the range width.
- **Use the shifted form for one-sided ranges** instead of a symmetric range twice as wide.
- **Filter and project before joining.** Put filters in a subquery so rows that can never match are not buffered:
  ```sql
  FROM spray_campaign_candidates AS c
  INNER JOIN (
      SELECT src_asn, user_agent, user_id, idp, _tp_time
      FROM auth_events
      WHERE outcome = 'success'
  ) AS a
  ON c.src_asn = a.src_asn AND c.user_agent = a.user_agent
  AND date_diff_within(30m, date_add(c.campaign_end, 30m), a._tp_time)
  SETTINGS max_join_range = 3600
  ```
- **Use selective equality keys.** Every new row is matched against all buffered rows of the other side with the same key inside the range. A hot key with many rows per range produces `N × M` output rows and CPU.
- **Keep both streams' event times aligned.** The slower stream holds back the watermark for both sides. If a stream can be idle, set `keep_range_join_max_buckets` to bound memory, knowing that evicted rows will not match later.
- **Size `join_max_buffered_bytes` from the estimate above** rather than raising it blindly.

### Windows

- **Prefer a slide that divides the window** (`hop(5m, 1h)`), and keep `window / slide` small. `hop(1s, 1d)` is accepted but keeps 86,400 states per key.
- **Size `DELAY` from the observed out-of-order distribution**, not "as large as possible". Each extra second of delay adds latency and keeps more windows open.
- **Use `AND TIMEOUT`** for sources that can go quiet, so the last window is closed without waiting for new events.
- **Keep `EMIT LAST` ranges short** on global aggregations, or use a tumble/hop window with a time filter for long ranges.

### High EPS and monitoring

- **Watch for late-event log lines** (`Found N late events` for windows, `Discard N late events` for range joins). A steady stream of them means event time is out of order beyond your `DELAY` or range, or one source's clock is skewed.
- **Use `_tp_time` or a well-behaved event-time column.** A few events with timestamps far in the future advance the watermark and make all following normal events "late".
- **Use the `hybrid` hash table** (`default_hash_table='hybrid'`, `default_hash_join='hybrid'`) when the number of keys is too large for memory. See [Query Settings](/query-settings).
- **Checkpoints scale with state.** Bigger windows and ranges mean bigger [materialized view checkpoints](/materialized-view-checkpoint) and longer recovery.
