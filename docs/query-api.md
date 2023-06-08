# Query API with Server-sent Events (SSE)

All Timeplus functions is available through RESTful API. To support real-time query result pushed from server to client side, there are two popular solutions, [websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). Timeplus is now leveraging sever-sent events to push real-time query result to the client.

## Event Stream Protocol

An SSE event stream is delivered as a streaming HTTP response: the client initiates a regular HTTP request, the server responds with a custom "text/event-stream" content-type, and then streams the UTF-8 encoded event data.

Here is a sample:

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
data: {
    "id":"b3347493-92a2-4bde-bdc5-8ac119199e75",
    "sql":"select * from iot",
    "result":{
        "header":[
            {'name': 'in_use', 'type': 'bool'},
            {'name': 'speed', 'type': 'float32'}
            ]
        }
    }

data: [[True,73.85],[False, 77.1],[True, 80.0]]

data: [[False,83.12],[True, 95.2],[False, 88.1]]

data: [[True,93.70],[False, 88.4],[True, 82.3]]

event: metric
data: {
    "count": 117,
    "eps": 75,
    "processing_time": 1560,
    "last_event_time": 1686237113265,
    "response_time": 861,
    "scanned_rows": 117,
    "scanned_bytes": 7605
    }

```

There are three different types of events

### Query Metadata (`event: query`)

Query metadata is always **the first SSE message** returned through the query API, it has event type `query`, which is a json object, some often used fields are `id`, `sql` and `result.header`. The content of the metadata is the same as the response of [get query](https://docs.timeplus.com/rest.html#tag/Queries-v1beta2/paths/~1v1beta2~1queries~1%7Bid%7D/get).

In case of **historical (table) query**, the last event will be query metadata as well. The reason we send it again as the end of SSE session is to notify the client about the final status of the query. A typical use case here is that the client can make use of the final `duration` and `end_time` of the query.

### Query Results (no event type)

We don't assign any event type in order to save bandwidth here. Each query result message is an array of array, representing multiple rows of query results. The data in each row follows the same order defined in the `result.header`.

Take the example above:

```
data: [[True,73.85],[False, 77.1],[True, 80.0]]

// There are three events in this batch, you can interpret them as:
// Header:  [in_use, speed]
// Event 1: [True,   73.85]
// Event 2: [False,   77.1]
// Event 3: [True,    80.0]
```

### Query Metric (`event: metrics`)

Query metric message represents the current query statistics, which can be used to observe the status of current query such as number of scanned rows.

## SSE Client

There are different SSE libraris that provides SSE client functions, here are some you can use.

- Python
  [sseclient](https://github.com/mpetazzoni/sseclient)
- Golang
  [go-sse](https://github.com/subchord/go-sse)
- Java
  [okhttp-eventsource](https://github.com/launchdarkly/okhttp-eventsource)
