# Substream

Substream is a not physical stream and only available at query time.

You can create substreams together with [tumble](functions_for_streaming#tumble)/[hop](functions_for_streaming#hop)/[session](functions_for_streaming#session) windows for a particular primary key, to maintain separate watermarks and streaming windows.

例如：

```sql
SELECT window_start, window_end, cid, count(*), max(speed_kmh)
FROM session(car_live_data, 1m) PARTITION BY cid
GROUP BY window_start, window_end
```

It will create session windows for each car with 1 minute idle time. 表示汽车未在一分钟内移动， 窗口将被关闭，并将为未来事件创建一个新的会话窗口。 If the car keeps moving for more than 5 minutes, different windows will be created (every 5 minutes).