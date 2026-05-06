## Read Data from a Python External Stream

The read function is the entry point Timeplus calls to pull rows from your Python code. It is **synchronous** (no `async`/`await`) and receives **no implicit arguments** — any configuration must arrive through the init function. Each value it produces is a row whose columns match the stream's schema in declared order; for a single-column stream you may yield bare scalars.

### Streaming source (generator)

Yield a row or a batch of rows at a time. The query stays alive as long as the generator does, which makes generators the right shape for clocks, polling loops, websocket feeds, message-bus consumers, and other long-lived sources.

```sql
CREATE EXTERNAL STREAM py_clock (tick uint32, label string)
AS $$
import time

def py_clock():
    n = 0
    while True:
        yield (n, "tick")
        n += 1
        time.sleep(1)
$$
SETTINGS
    type = 'python',
    mode = 'streaming';
```

`read_function_name` is omitted, so it defaults to the stream name `py_clock`. Setting `mode = 'streaming'` makes the engine reject a non-generator return value, which catches mistakes like returning a list early.

### Batch source (list)

Return a list of rows once. Use this shape for one-shot pulls — REST snapshots, file scans, or any source where a single call yields the full result.

```sql
CREATE EXTERNAL STREAM py_users (id int32, name string)
AS $$
import json
import urllib.request

def py_users():
    with urllib.request.urlopen("https://api.example.com/users") as r:
        payload = json.load(r)
    return [(u["id"], u["name"]) for u in payload]
$$
SETTINGS
    type = 'python',
    mode = 'batch';
```

### Long-lived setup with init / deinit

Open a client once, stash it on `builtins`, and tear it down at the end of the query. Init parameters arrive as a single string, so JSON is convenient when you have more than one value to pass.

```sql
CREATE EXTERNAL STREAM py_cookie_counter
(
  previous_cleanup_count int32,
  secret_flavor string
)
AS $$
import builtins, json

def open_bakery(config):
    builtins._tp_cookie_secret_flavor = json.loads(config)["flavor"]

def close_bakery():
    if hasattr(builtins, "_tp_cookie_secret_flavor"):
        del builtins._tp_cookie_secret_flavor

def serve_cookie_report():
    return [(0, getattr(builtins, "_tp_cookie_secret_flavor", ""))]
$$
SETTINGS
    type = 'python',
    read_function_name = 'serve_cookie_report',
    init_function_name = 'open_bakery',
    init_function_parameters = '{"flavor":"double-chocolate"}',
    deinit_function_name = 'close_bakery';
```

Remember that init and deinit run **per query**, not once per stream creation — the `builtins` state above is set up and torn down each time a query reads from `py_cookie_counter`. Use stream-specific `builtins` attribute names and delete them in deinit so later Python sessions do not see stale state.

### Calling back to `timeplusd`

The injected `__timeplus_local_api_user` and `__timeplus_local_api_password` globals let the read function authenticate to the same server without hard-coded credentials. The example below queries an internal stream over the REST interface and turns the result into a row.

```sql
CREATE EXTERNAL STREAM py_user_count (total int64)
AS $$
import base64, urllib.request

def py_user_count():
    creds = base64.b64encode(
        f"{__timeplus_local_api_user}:{__timeplus_local_api_password}".encode()
    ).decode()
    req = urllib.request.Request(
        "http://localhost:8123/?query=SELECT+count()+FROM+table(users)",
        headers={"Authorization": f"Basic {creds}"},
    )
    with urllib.request.urlopen(req) as r:
        return [(int(r.read().strip()),)]
$$
SETTINGS
    type = 'python',
    mode = 'batch';
```

Treat `__timeplus_local_api_password` as a secret — do not log it, do not echo it back into output rows, and do not pass it into subprocesses.

### Cancellation and errors

When a query is cancelled (for example by `KILL QUERY` or by closing the client), the running Python code receives a `KeyboardInterrupt`. Streaming generators stop at the next yield point; long-blocking calls inside C extensions may delay the interrupt until they return.

If the read function raises, the query fails and the Python traceback is included in the error response — wrap recoverable errors inside the function and decide explicitly whether to re-raise or continue.
