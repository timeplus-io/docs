# 子流

子流不是物理流，仅在查询时可用。

You can create substreams for a stream, or together with [tumble](functions_for_streaming#tumble)/[hop](functions_for_streaming#hop)/[session](functions_for_streaming#session) windows for a particular primary key, to maintain separate watermarks and streaming windows.

例如：

```sql
SELECT window_start, window_end, cid, count(*), max(speed_kmh)
FROM session(car_live_data, 1m) PARTITION BY cid
GROUP BY window_start, window_end
```

它将为每辆车创建 session 窗口，空闲时间为1分钟。 表示汽车未在一分钟内移动， 窗口将被关闭，并将为未来事件创建一个新的会话窗口。 如果车辆持续行驶超过 5 分钟，则会创建不同的窗户（每 5 分钟）。