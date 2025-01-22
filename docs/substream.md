# Substream

Substream is a not physical stream and only available at query time.

You can create substreams for a stream, or together with [tumble](/functions_for_streaming#tumble)/[hop](/functions_for_streaming#hop)/[session](/functions_for_streaming#session) windows for a particular primary key, to maintain separate watermarks and streaming windows.

For example:

```sql
SELECT window_start, window_end, cid, count(*), max(speed_kmh)
FROM session(car_live_data, 1m) PARTITION BY cid
GROUP BY window_start, window_end
```

It will create session windows for each car with 1 minute idle time. Meaning if the car is not moved within one minute, the window will be closed and a new session window will be created for future events. If the car keeps moving for more than 5 minutes, different windows will be created (every 5 minutes).

You can also create substreams without windows. For example:

```sql
select _tp_time, cid, speed_kmh from(
select _tp_time, cid, speed_kmh,lag(speed_kmh) OVER (PARTITION BY cid) as last_spd
from car_live_data) where speed_kmh!=last_spd
```
This query will create substreams for each car ID in the car live data, only output the events when the speed for the same car is changed.
