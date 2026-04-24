---
id: python-external-stream
title: Python External Stream
---

# Python External Stream

Python External Stream lets you read from and write to arbitrary sources by embedding a Python body directly in the DDL. It is available in **Timeplus Enterprise 3.1.1+**.

Unlike the Kafka, Pulsar, and NATS JetStream external streams — which speak a specific wire protocol — a Python External Stream is a generic escape hatch: you bring the protocol, the client library, and the logic. Timeplus calls your functions inside the embedded CPython runtime and treats return values as row batches. The same DDL object can serve as both a source (via `read_function_name`) and a sink (via `write_function_name`).

## Minimum version matrix

| Feature | Minimum Timeplus Enterprise version |
|---|---|
| `type='python'` external stream (read + write) | 3.1.1 |
| `init_function_name`, `deinit_function_name`, `init_function_parameters` lifecycle hooks | 3.2.1 |
| `__timeplus_local_api_user` / `__timeplus_local_api_password` injected globals | 3.2.2 |

## Syntax

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
AS $$
def read_fn():
    ...

def write_fn(col1, ...):
    ...

def init_fn(config):   # optional, 3.2.1+
    ...

def deinit_fn():       # optional, 3.2.1+
    ...
$$
SETTINGS
    type = 'python',                          -- required
    read_function_name = '..',                -- defaults to the stream name
    write_function_name = '..',               -- defaults to read_function_name
    init_function_name = '..',                -- 3.2.1+
    init_function_parameters = '..',          -- 3.2.1+ (requires init_function_name)
    deinit_function_name = '..',              -- 3.2.1+
    mode = 'auto'                             -- 'auto' (default), 'streaming', or 'batch'
```

## Settings

* **type**: must be `'python'`. Required.
* **read_function_name**: name of the Python function used when the stream is read from. Defaults to the stream name.
* **write_function_name**: name of the Python function used when the stream is written to (sink). Defaults to `read_function_name`.
* **init_function_name** *(Timeplus Enterprise 3.2.1+)*: name of a Python function called once before read/write processing begins. Use it to open connections, warm caches, or stash state on `builtins` for the entry function to consume.
* **init_function_parameters** *(Timeplus Enterprise 3.2.1+)*: a single string passed as the only argument to the init function. Any format works (JSON, `key=value`, or a plain string) — parsing is up to your Python code. Requires `init_function_name`; otherwise the stream fails to create with `Setting 'init_function_parameters' requires 'init_function_name' to be configured`.
* **deinit_function_name** *(Timeplus Enterprise 3.2.1+)*: name of a Python function called once after read/write processing completes, for cleanup.
* **mode**: Python table execution mode — `'auto'` (default), `'streaming'`, or `'batch'`.

:::info
Attempting to use `init_function_name`, `deinit_function_name`, or `init_function_parameters` on versions earlier than 3.2.1 fails with:
```
Code: 115. DB::Exception: Unknown setting init_function_name: for storage ExternalStream.
```
Upgrade to 3.2.1 or later to use these hooks.
:::

## Local API credentials *(Timeplus Enterprise 3.2.2+)*

When the local API user is enabled on the server, Timeplus injects two module-level globals into every Python External Stream module so your code can authenticate back to the same timeplusd over the native TCP protocol or the REST HTTP interface without hard-coding credentials:

* `__timeplus_local_api_user` — the ephemeral local API username.
* `__timeplus_local_api_password` — the matching token. Treat this as a secret; do not log it.

Both globals are available as bare names inside the Python body — no `os.environ` lookup needed. They are regenerated on every server restart and never written to disk.

## Example: init / deinit hooks

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

## Related

- [Python UDF](/py-udf) — the embedded Python runtime, library management, and data-type mapping shared with Python External Stream.
- [CREATE EXTERNAL STREAM](/sql-create-external-stream) — SQL reference for all external stream types.
