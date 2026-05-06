## Overview

Python External Stream lets you read from and write to arbitrary sources by embedding a Python body directly in the DDL. It is available in **Timeplus Enterprise 3.2.2+**.

Unlike the Kafka, Pulsar, and NATS JetStream external streams — which speak a specific wire protocol — a Python External Stream is a generic escape hatch: you bring the protocol, the client library, and the logic. Timeplus calls your functions inside the embedded CPython runtime. When reading, return values become row batches; when writing, the sink function receives column batches. The same DDL object can serve as both a source (via `read_function_name`) and a sink (via `write_function_name`).

## Create a Python External Stream

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name (<col_name1> <col_type>)
AS $$
def read_fn():
    ...

def write_fn(col1, ...):
    ...

def init_fn(config):   # optional
    ...

def deinit_fn():       # optional
    ...
$$
SETTINGS
    type = 'python',                          -- required
    read_function_name = '..',                -- defaults to the stream name
    write_function_name = '..',               -- defaults to read_function_name
    init_function_name = '..',
    init_function_parameters = '..',          -- requires init_function_name
    deinit_function_name = '..',
    mode = 'auto'                             -- 'auto' (default), 'streaming', or 'batch'
```

### Settings

* **type**: must be `'python'`. Required.
* **read_function_name**: name of the Python function used when the stream is read from. Defaults to the stream name.
* **write_function_name**: name of the Python function used when the stream is written to (sink). Defaults to `read_function_name`.
* **init_function_name**: name of a Python function called once before read/write processing begins. Use it to open connections, warm caches, or prepare state for the entry function to consume.
* **init_function_parameters**: a single string passed as the only argument to the init function. Any format works (JSON, `key=value`, or a plain string) — parsing is up to your Python code. Requires `init_function_name`; otherwise the stream fails to create with `Setting 'init_function_parameters' requires 'init_function_name' to be configured`.
* **deinit_function_name**: name of a Python function called once after read/write processing completes, for cleanup.
* **mode**: Python execution mode — `'auto'` (default), `'streaming'`, or `'batch'`. See [Modes](#modes).

## Modes

The `mode` setting controls how Timeplus interprets your read function's return value:

* **`auto`** (default) — Timeplus inspects the return value at runtime. A generator drives a streaming read; a list is consumed as a single batch.
* **`streaming`** — the read function must return a generator. Timeplus pulls rows as they are yielded and the query stays alive until the generator stops. Returning a list from a streaming-mode function fails the query.
* **`batch`** — the read function must return a list. Timeplus consumes the list once and the query finishes. Returning a generator from a batch-mode function fails the query.

Set `mode` explicitly when you want the engine to enforce the expected shape. Leave it as `auto` when you want flexibility.

## Lifecycle

Each query that reads from or writes to a Python External Stream creates its own Python module. The lifecycle for one query is:

1. The DDL body is compiled into a fresh module.
2. Local API credential globals are injected into the module (see [Local API credentials](#local-api-credentials)).
3. If `init_function_name` is set, the init function is called once. When `init_function_parameters` is non-empty, it is passed as the only argument; otherwise init receives no arguments.
4. The read or write entry function is called as data flows.
5. When the query ends — normally or via cancellation — `deinit_function_name`, if set, is called.

Each query gets its own module, so ordinary module globals created by the DDL body are not reused across queries. If you stash state on Python's `builtins` module, use a stream-specific attribute name and remove it in deinit; `builtins` is shared by the embedded interpreter, so leftover attributes can be visible to later Python sessions in the same server process. Treat clients or caches opened in init as per-query resources and close them in deinit.

If the init function raises, the query fails before any read or write happens, and `deinit_function_name` is **not** called. If init opens more than one external resource, clean up already-opened resources before re-raising.

## Local API credentials {#local-api-credentials}

When the local API user is enabled on the server, Timeplus injects two module-level globals into every Python External Stream module so your code can authenticate back to the same `timeplusd` over the native TCP protocol or the REST HTTP interface without hard-coding credentials:

* `__timeplus_local_api_user` — the ephemeral local API username.
* `__timeplus_local_api_password` — the matching token. Treat this as a secret; do not log it.

Both globals are available as bare names inside the Python body — no `os.environ` lookup needed. They are regenerated on every server restart and never written to disk.
