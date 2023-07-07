# 带有服务器发送事件（SSE）的查询API

所有 Timeplus 功能均可通过 REST API 获得。 为了支持从服务器端推送到客户端的实时查询结果，有两种流行的解决方案， [websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 和 [服务器发送的事件](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)。 Timeplus 现在利用服务器发送的事件将实时查询结果推送到客户端。

## 事件流协议

SSE 事件流作为流 HTTP 响应发送：客户端发起常规 HTTP 请求，服务器响应自定义的“文本/事件流”内容类型，然后流式传输 UTF-8 编码的事件数据。

以下是示例：

```
=> Request
POST /tenant/api/v1beta2/queries HTTP/1.1
Host: example.com
Accept: text/event-stream

<= Response
HTTP/1.1 200 OK
Connection: keep-alive
Content-Type: text/event-stream
Transfer-Encoding: chunked

event: query
data: {"id":"b3347493-92a2-4bde-bdc5-8ac119199e75","sql":"select * from iot","result":{"header":[{'name': 'in_use', 'type': 'bool'},{'name': 'speed', 'type': 'float32'}]}}

data: [[True,73.85],[False, 77.1],[True, 80.0]]

data: [[False,83.12],[True, 95.2],[False, 88.1]]

data: [[True,93.70],[False, 88.4],[True, 82.3]]

event: metric
data: {"count": 117,"eps": 75,"processing_time": 1560,"last_event_time": 1686237113265,"response_time": 861,"scanned_rows": 117,"scanned_bytes": 7605}

```

有三种不同类型的事件：

### 查询元数据（`event: query`）

查询元数据总是通过查询API返回的 **第一个 SSE 消息**，它有事件类型 `查询`，这是一个 json 对象，一些经常使用的字段是 `id`，`sql` 和 `result.header`。 元数据的内容与 [获取查询](https://docs.timeplus.com/rest.html#tag/Queries-v1beta2/paths/~1v1beta2~1queries~1%7Bid%7D/get) 的响应相同。

在 **历史查询（表格）** 的情况下，最后一个事件也会查询元数据。 我们在 SSE 会话结束时再次发送它的原因是为了通知客户查询的最终状态。 这里的一个典型案例是，客户端可以使用查询的最后 `持续时间` 和 `结束时间` 。

### 查询结果（无事件类型）

为了节省带宽，我们没有分配任何事件类型。 每个查询结果消息是一个数组的数组，代表多行的查询结果。 每行中的数据遵循 `result.header` 中定义的相同顺序。

### 查询计量（`event: metric`）

最后一种事件类型是计量，它以 json 对象返回当前查询统计信息，可用于观察当前查询的运行状态。

以上面的例子为例：

```
data: [[True,73.85],[False, 77.1],[True, 80.0]]

// There are three events in this batch, you can interpret them as:
// Header:  [in_use, speed]
// Event 1: [True,   73.85]
// Event 2: [False,   77.1]
// Event 3: [True,    80.0]
```

### 查询计量（`event: metrics`）

查询计量消息表示当前查询统计，可用于观察当前查询的状态，如扫描行数。

## SSE 客户端

有不同的 SSE 库提供 SSE 客户端功能，Timeplus 还有一个 python SDK 项目，它已经包含了 SSE 事件解析，以避免处理那些低级细节。
