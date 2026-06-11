## Write Data to a Python External Stream

The write function is invoked once per chunk, not once per row. Its arguments are **column-oriented**: one Python list per output column, in declared order, all of equal length. Iterate with `zip` to recover row tuples.

Column values follow the same Python type mapping as [Python UDF](/py-udf#data-type-mapping). One detail worth highlighting for sinks: a `string` (or `fixed_string`) column arrives as Python `bytes`, not `str`. Decode with `.decode()` (UTF-8) before passing values into APIs that require text.

### Sink basics

```sql
CREATE EXTERNAL STREAM py_metric_sink (host string, value float32)
AS $$
def py_metric_sink(host, value):
    for h, v in zip(host, value):
        print(f"{h.decode()}={v}")
$$
SETTINGS type = 'python';
```

Insert a few rows:

```sql
INSERT INTO py_metric_sink (host, value) VALUES ('a', 1.0), ('b', 2.0);
```

Behind the scenes Timeplus calls `py_metric_sink([b'a', b'b'], [1.0, 2.0])` — one call carrying both rows, with the `string` column delivered as `bytes`. A larger INSERT or a downstream query that delivers many chunks results in one call per chunk.

If `write_function_name` is omitted Timeplus uses `read_function_name` (which itself defaults to the stream name), so the Python function above only needs to be named once.

### Materialized view → external stream

Routing a continuous query into a sink is the most common production pattern. Define the sink once, then point a materialized view at it:

```sql
CREATE EXTERNAL STREAM py_alert_sink (host string, value float32)
AS $$
def py_alert_sink(host, value):
    for h, v in zip(host, value):
        notify(h.decode(), v)   # your notifier
$$
SETTINGS type = 'python';

CREATE MATERIALIZED VIEW high_value_alerts INTO py_alert_sink AS
  SELECT host, value FROM metrics WHERE value > 100;
```

The materialized view feeds chunks into the sink as they are produced; each chunk becomes one call to `py_alert_sink`.

### Custom protocol example: webhook POST

Load the destination URL in init, reuse that configuration for every chunk, and clear it in deinit. Init parameters carry the URL so the Python body is reusable across environments. To pool an actual HTTP connection, swap `urllib` for a session-aware client (for example `requests.Session()`) and stash the session itself on `builtins`.

```sql
CREATE EXTERNAL STREAM py_webhook (event_id string, body string)
AS $$
import builtins, json, urllib.request

def open_client(config):
    builtins._tp_webhook = json.loads(config)["url"]

def close_client():
    if hasattr(builtins, "_tp_webhook"):
        del builtins._tp_webhook

def post_event(event_id, body):
    for eid, b in zip(event_id, body):
        payload = {"id": eid.decode(), "body": b.decode()}
        req = urllib.request.Request(
            builtins._tp_webhook,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req).read()
$$
SETTINGS
    type = 'python',
    init_function_name = 'open_client',
    init_function_parameters = '{"url":"https://hooks.example.com/notify"}',
    deinit_function_name = 'close_client',
    write_function_name = 'post_event';
```

Replace `urllib` with any HTTP, S3, queue, or proprietary client your environment ships with. Manage Python dependencies through the [Python UDF](/py-udf) library configuration — the same runtime backs both features.

### Failure behavior

If the write function raises, the INSERT fails and the Python traceback is included in the error response. Side effects already performed by your Python code (HTTP requests sent, files written, queue messages published) are **not** rolled back by Timeplus — design idempotent writes, or batch your side effect inside a single transactional call your downstream system controls.
