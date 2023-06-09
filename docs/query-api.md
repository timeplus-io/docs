# Query API with Server-sent Events (SSE)

All Timeplus functions are available through REST API. To support real-time query result pushed from server to client side, there are two popular solutions, [websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). Timeplus is now leveraging sever-sent events to push real-time query result to the client.

## Event Stream Protocol

An SSE event stream is delivered as a streaming HTTP response: the client initiates a regular HTTP request, the server responds with a custom "text/event-stream" content-type, and then streams the UTF-8 encoded event data.

Here is a sample:

```
=> Request
GET /stream HTTP/1.1
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

There are three different types of events:

### Query Metadata

Query metadata is the first event returned through the query API, it has event type `query`, which is a json object, some often used fields are `id`, `sql` and `result.header`. for details information of query metadata, refer to [create query](https://docs.timeplus.com/rest.html#tag/Queries-v1beta2/paths/~1v1beta2~1queries/post)

### Query Message

in the following events, where there is no event type which is the defaut SSE messages, these messages contain the query result, each event is an array of array, represting mutliple rows of query result. The data in each row follows the same order defined in the `result.header`

### Query Metric

the last event type is metrics, which returns the current query statistics in a json object, which can be used to observe the health status of current query.

## SSE Client

There are different SSE libraris that provides SSE client functions, Timeplus also has a python SDK project which already included SSE event parsing to avoid handle those low-level details.
