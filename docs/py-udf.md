# Python UDF

In addition to [Remote UDF](/remote-udf) and [JavaScript UDF](/js-udf), starting from [v2.7](/enterprise-v2.7), Timeplus Enterprise also supports Python-based UDF, as a feature in technical preview. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with the embedded Python runtime in Timeplus core engine. No need to deploy extra server/service for the UDF.

:::info Python 3.14 since Timeplus Enterprise 3.3.1
Timeplus Enterprise 3.3.1 upgrades the embedded interpreter from **Python 3.10 to Python 3.14 (free-threaded, a.k.a. `cp314t`)**, and stops bundling any third-party Python packages. If you are upgrading from 3.2.x or earlier, read [Upgrading to the Python 3.14 runtime](#upgrade_314) before you upgrade — packages you relied on must be reinstalled, and code that mutates module-level state now needs explicit locking.
:::

For visual learners, please watch the following video:
<iframe width="560" height="315" src="https://www.youtube.com/embed/dizrvby2j_A?si=gZfJvv3IxRcYeMgp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Why Python UDF
Python is recognized as one of the most popular languages in the field of data science. Its flexibility as a scripting language, ease of use, and extensive range of statistical libraries make it an indispensable tool for data scientists and analysts.

Python excels in writing complex parsing and data transformation logic, especially in scenarios where SQL capabilities are insufficient. Python User-Defined Functions (UDFs) offer the flexibility to implement intricate data processing mechanisms. These include:

* **Custom Tokenization**: Breaking down data into meaningful elements based on specific criteria.
* **Data Masking**: Concealing sensitive data elements to protect privacy.
* **Data Editing**: Modifying data values according to specific rules or requirements.
* **Encryption Mechanisms**: Applying encryption to data for security purposes.

## Data type mapping

This is the mapping for [Timeplus data type](/datatypes) and Python data type:
| Timeplus Data Type                      | Python Type   |
| ----------------------------- | ---------- |
|bool|bool|
|uint8, uint16, uint32, uint64| int    |
|int8, int16, int32, int64|int|
|date, date32,datetime|int|
|float32, float64|float|
|date, date32|datetime.date|
|datetime, datetime64|datetime.datetime|
|string, fixed_string|bytes|
|array|list|
|tuple|tuple|
|map| dict|
|ipv4|int|
|uint128,uint256,int128,int256| N/A|
|decimal| N/A|
|ipv6| N/A|
|nullable| N/A|
|low_cardinality| N/A|

If your use cases require more data type support, please contact us at support@timeplus.com.

## Register a Python UDF {#register}

You can create or replace a Python UDF with SQL. Web UI will be added.

### Scalar UDF
Scalar UDF is stateless UDF to convert columns in one row to other values.

Syntax:
```sql
CREATE OR REPLACE FUNCTION udf_name(param1 type1,..)
RETURNS type2 LANGUAGE PYTHON AS
$$
import …

def udf_name(col1..):
    …

$$
SETTINGS ...
```

You need to make sure the SQL function name is identical to the function name in the Python code.

### UDAF
UDAF or User Defined Aggregation Function is stateful. It takes one or more columns from a set of rows and return the aggregated result.

Syntax:
```sql
CREATE OR REPLACE AGGREGATION FUNCTION uda_name(param1 type1,...)
RETURNS type2 language PYTHON AS
$$
import ...
class uda_name:
   def __init__(self):
	...

   def serialize(self):
	...

   def deserialize(self, data):
	...

   def merge(self, data):
	...

   def process(self, values):
	...
   def finalize(self):
	...
$$
SETTINGS ...
```
The function list:
* `process` the core logic of the aggregation function, required.
* `finalize` return the aggregation result, required.
* `serialize` save the state as a string or [pickle](https://docs.python.org/3/library/pickle.html) binary and put in checkpoint, optional.
* `deserialize` load the state from checkpoint to the internal state, optional.
* `merge` for multi-shard processing, merge the states from each shard, optional.

**Emit strategy and return shape**

- By default, Proton calls `finalize()` once and expects a *single* value of the declared return type (not a list). Any value returned from `process()` is ignored in this mode.
- If you need to emit multiple results per group, set `self.has_customized_emit = True` in `__init__`, return either an integer count or `True`/`False` from `process()` to indicate how many results to emit, and return a list from `finalize()` whose length matches that count.
- Only one UDA with `has_customized_emit = True` is supported per streaming query.

## Examples

### A simple UDF without dependency
Timeplus Python UDF supports the standard Python library and the built-in functions. This example takes the number as input, add 5.
```sql
CREATE OR REPLACE FUNCTION add_five(value uint16) RETURNS int LANGUAGE PYTHON AS $$
def add_five(value):
    for i in range(len(value)):
        value[i] = value[i] + 5
    return value
$$;
```

Please note:
* To improve the performance, Timeplus calls the UDF with a batch of inputs. The input of the Python function `add_five` is `list(int)`.
* The function name `add_five` in the SQL statement should match the function name in the Python code block.
* Python code block should be enclosed in `$$`. Alternatively, you can use `'` to enclose the code block, but this may cause issues with the Python code block if it contains `'`.
* Python code is indented with spaces or tabs. It's recommended to put `def` at the beginning of the line without indentation.

### A simple UDF with numpy
[Numpy](https://numpy.org/) is a general-purpose array-processing package. It provides a high-performance multidimensional array object, and tools for working with these arrays. It is the fundamental package for scientific computing with Python.

This library is not installed by default. You need to install it manually by following [the guide](#python_libs).

This example takes the number as input, add 5 via numpy.
```sql
CREATE OR REPLACE FUNCTION add_five(value uint16)
RETURNS uint16 LANGUAGE PYTHON AS $$
import numpy as np
def add_five(value):
    np_arr = np.array(value)
    np_arr += 5
    return np_arr.tolist()
$$
```

Please note, to improve the performance, Timeplus calls the UDF with a batch of inputs. The input of the Python function `add_five` is list(int). We use `numpy.array(list)` to convert it to a numpy array.

### A simple UDAF with pickle
[Pickle](https://docs.python.org/3/library/pickle.html) implements binary protocols for serializing and de-serializing a Python object structure.

This example gets the maximum number and use pickle to save/load the state.
```sql
CREATE OR REPLACE AGGREGATE FUNCTION getMax(value uint16) RETURNS uint16 LANGUAGE PYTHON AS $$
import pickle
class getMax:
    def __init__(self):
        self.max = 0

    def serialize(self):
        data = {}
        data['max'] = self.max
        return pickle.dumps(data)

    def deserialize(self, data):
        data = pickle.loads(data)
        self.max = data['max']

    def merge(self, other):
        if (other.max > self.max):
            self.max = other.max

    def process(self, values):
        for item in values:
            if item > self.max:
                self.max = item
    def finalize(self):
        return self.max
$$;
```

## Initialization hook {#init_hook}

Available since Timeplus Enterprise 3.3.1.

Some UDFs need one-time setup before the first row is processed — loading a model, compiling a regex, opening a connection, or reading a credential. A Python UDF can declare an **init hook**: a function in the same code block that Timeplus calls once, when the module is loaded, before any UDF invocation (and, for a UDAF, before the class is instantiated).

Declare it with `SETTINGS init_function_name`:

```sql
CREATE OR REPLACE FUNCTION tag_value(x string) RETURNS string LANGUAGE PYTHON AS $$
TAG = ''

def _tp_init():
    global TAG
    TAG = 'ready'

def tag_value(xs):
    return [TAG + ':' + x.decode('utf-8') for x in xs]
$$ SETTINGS init_function_name = '_tp_init';
```

The hook name is validated at `CREATE` time: if the function is not defined in the UDF source, the statement is rejected with `is not defined in the UDF source`. These settings are Python-only — using them on a JavaScript UDF fails with `only supported for Python UDFs`.

### Passing parameters to the hook {#init_params}

`init_function_parameters` passes a **single string** as the hook's only argument. Encode structured configuration as JSON and parse it in the hook:

```sql
CREATE OR REPLACE FUNCTION greet(x string) RETURNS string LANGUAGE PYTHON AS $$
import json
PREFIX = ''

def _tp_init(params):
    global PREFIX
    PREFIX = json.loads(params).get('prefix', '')

def greet(xs):
    return [PREFIX + ':' + x.decode('utf-8') for x in xs]
$$ SETTINGS init_function_name = '_tp_init',
            init_function_parameters = '{"prefix":"hello"}';
```

When no parameter source is configured, the hook is called **with no arguments** — so write `def _tp_init():` in that case and `def _tp_init(params):` when you pass parameters.

### Reading parameters from a named collection {#init_named_collection}

`init_function_parameters` is stored verbatim in the UDF definition and is echoed back by `SHOW CREATE FUNCTION`, which makes it a poor place for a secret. Use a [named collection](/named-collection) instead: point the UDF at a collection and Timeplus reads the collection's `init_function_parameters` key at module-load time.

```sql
CREATE NAMED COLLECTION nc_udf_init AS
  init_function_parameters = '{"api_key":"s3cr3t"}' NOT OVERRIDABLE;

CREATE OR REPLACE FUNCTION call_api(x string) RETURNS string LANGUAGE PYTHON AS $$
import json
API_KEY = ''

def _tp_init(params):
    global API_KEY
    API_KEY = json.loads(params)['api_key']

def call_api(xs):
    return [API_KEY + ':' + x.decode('utf-8') for x in xs]
$$ SETTINGS init_function_name = '_tp_init',
            named_collection = 'nc_udf_init';
```

`SHOW CREATE FUNCTION call_api` shows the `init_function_name` and `named_collection` settings but **not** the secret — only the collection name is stored in the UDF.

The same settings work on `CREATE AGGREGATE FUNCTION`, where the hook runs before the aggregation class is constructed, so `__init__` can rely on whatever the hook set up.

Rules and behavior:

* `init_function_parameters` and `named_collection` both require `init_function_name`; without it the statement is rejected.
* They are **mutually exclusive** — configure only one parameter source.
* Creating the UDF requires the `NAMED COLLECTION` privilege on the referenced collection. An ungranted user gets `ACCESS_DENIED`, and gets it whether or not the collection exists, so the error does not leak which collections are defined.
* The collection must exist at `CREATE` time.
* If the collection has no `init_function_parameters` key, that is not an error — the hook is simply called with no arguments.
* Values are resolved when the module loads, **not** on every call. Editing or rotating a named collection does not propagate to already-running queries or materialized views; drop and recreate the materialized view to pick up a new value.
* If the collection is dropped after the UDF is created, the next module load fails cleanly with `Named collection '…' required by UDF '…' does not exist`.
* If the hook itself raises, the query fails with the Python exception and the partially initialized module is discarded, so a later call re-runs the hook from scratch.

## Manage Python Libraries {#python_libs}

Starting from Proton/Timeplus Enterprise 3.0, manage Python UDF packages directly via SQL `SYSTEM` commands. This is the only supported flow on 3.0+. The 2.x methods below are not supported on 3.0.

### Install/List/Uninstall via SQL (3.0+) {#install_sql}
Examples:
```sql
-- Install latest
SYSTEM INSTALL PYTHON PACKAGE 'requests';

-- Install with version specifier (PEP 440)
SYSTEM INSTALL PYTHON PACKAGE 'requests>2.0';
SYSTEM INSTALL PYTHON PACKAGE 'requests==2.32.3';

-- Alternative form with separate version literal
SYSTEM INSTALL PYTHON PACKAGE 'requests' '2.32.3';

-- List installed packages
SYSTEM LIST PYTHON PACKAGES;

-- Uninstall
SYSTEM UNINSTALL PYTHON PACKAGE 'requests';
```

Notes:
- Applies to Proton/Enterprise 3.0+ with Python UDF enabled (Python 3.14 since 3.3.1, Python 3.10 before that).
- Cluster-wide operation; requires `SYSTEM RELOAD CONFIG` privilege.
- `SYSTEM LIST PYTHON PACKAGES` returns columns `package_name`, `version`.
- Install/uninstall runs asynchronously. Check status via `system.python_package_tasks`:
  ```sql
  SELECT status, error_code, error_message
  FROM system.python_package_tasks
  WHERE package_name='requests' AND operation='install'
  ORDER BY created_at DESC LIMIT 1;
  ```

Permissions:
- Built-in users in official Docker images (e.g., `default`, `proton`) typically have this privilege.
- For a new user, grant it explicitly:
  ```sql
  GRANT SYSTEM RELOAD CONFIG ON *.* TO gen;
  ```

See more: /sql-system-python-packages

### Declarative package management with `python_requirements` {#python_requirements}

Available since Timeplus Enterprise 3.3.1. `SYSTEM INSTALL PYTHON PACKAGE` installs into the local user site-packages of each node, which does not survive a reschedule on a node without a persistent volume. For clusters — and especially for ephemeral compute nodes — declare your packages in a `requirements.txt` on S3 instead and let every node reconcile against it.

Add a `python_requirements` section to `timeplusd.yaml`:

```yaml
python_requirements:
    url: https://my-bucket.s3.us-west-2.amazonaws.com/proton/requirements.txt
    # How often (seconds) to re-check the file for changes after a successful reconcile.
    # 0 disables polling (reconcile on startup only). Default: 300.
    poll_interval_sec: 300
    # Credentials are optional; without them the environment chain
    # (IRSA / instance profile, AWS_* environment variables) is used.
    # access_key_id: ACCESS_KEY_ID
    # secret_access_key: SECRET_ACCESS_KEY
    # region: us-west-2
    # Optional pip index overrides, e.g. an internal mirror.
    # index_url: https://pypi.org/simple
    # extra_index_url: https://my-mirror.example.com/simple
```

How it behaves:
* Every node fetches the file on startup, and again every `poll_interval_sec`, so edits to the file roll out without a restart.
* The file is the durable source of truth: it restores packages on ephemeral compute nodes after a reschedule, and keeps data nodes with persistent volumes in sync.
* **Reconcile only installs.** Packages removed from the file are *not* uninstalled — do that manually with `SYSTEM UNINSTALL PYTHON PACKAGE`.
* `SYSTEM INSTALL`/`UNINSTALL PYTHON PACKAGE` still works as a manual escape hatch, but packages installed that way are not recorded in the file and do not survive a reschedule on nodes without persistent volumes.
* Pin exact versions (`package==x.y.z`) so all nodes converge on identical environments.

### Built-in Libraries
Timeplus ships a **clean Python 3.14 environment**: the Python standard library, plus `pip` and `truststore` so that package installation works out of the box. **No third-party libraries are bundled.**

:::warning Changed in 3.3.1
Timeplus Enterprise 3.2.x and earlier bundled ~40 packages, including `numpy`, `requests`, `openai`, `pydantic`, `proton-driver` and `timeplus-neutrino`. **None of them ship in 3.3.1 or later.** Any UDF that imports one of them fails with `ModuleNotFoundError` until you install it explicitly — see [Upgrading to the Python 3.14 runtime](#upgrade_314).

Bundling was dropped so that the runtime no longer pins you to versions Timeplus happened to choose, and so that the shipped artifact carries no third-party CVE surface you did not ask for. Install exactly what your UDFs need with [`SYSTEM INSTALL PYTHON PACKAGE`](#install_sql) or [`python_requirements`](#python_requirements).
:::

To see what is currently installed on a node:

```sql
SYSTEM LIST PYTHON PACKAGES;
```

### Verified Libraries {#verified_libs}
Follow the guide below to install extra Python libraries. The following libraries are verified by Timeplus team.
* Numpy
* Pandas
* Arrow
* Scipy
* Sklearn
* River
* Statsmodels

Some Python libraries may require additional dependencies or OS specific packages. Contact us if you need help.

### Install Python Libraries (Legacy 2.x) {#install_lib}
For Enterprise 2.x, you can either call the REST API (2.7+) or use `timeplusd python -m pip` (2.8+).

Important: These legacy methods are not supported on Proton/Enterprise 3.0. Use the SQL `SYSTEM` commands instead.

#### Install via `timeplusd python pip` (2.8) {#install_pip}
Only for Enterprise v2.8. Not available on 3.0+.

In Enterprise v2.8, you can use the `timeplusd python -m pip` command-line tool to install Python libraries. For example, to install the `numpy` library:
```bash
timeplusd python --config-file ../conf/timeplusd.yaml -m pip install --user numpy
```

For example, with the timeplusd docker image, you can use the following command:
```bash
docker exec -it container_name timeplusd python --config-file /etc/timeplusd-server/config.yaml -m pip install --user pandas
```

#### Install via REST API (2.7+) {#install_rest}

Only for Enterprise v2.7–v2.8. Not available on 3.0+.

You can call the REST API of timeplusd in Timeplus Enterprise v2.7+.

:::info
To access the REST API, you need to create an administrator account and set the HTTP headers `x-timeplus-user` and `x-timeplus-key` with the user and password, such as `curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" ..`.
:::

For example, if you want to install the `numpy` library, you can use the following command:
```bash
curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" -X POST http://localhost:8123/timeplusd/v1/python_packages -d '{"packages": [{"name": "numpy"}]}'
```

If you need to install a specific version of a library, you can specify it in the `version` field. For example, to install `numpy` version `2.2.3`, you can use the following command:
```bash
curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" -X POST http://localhost:8123/timeplusd/v1/python_packages -d '{"packages": [{"name": "numpy", "version": "2.2.3"}]}'
```

### List Python Libraries (2.x) {#list_lib}
Only for Enterprise v2.7–v2.8. On 3.0+, use `SYSTEM LIST PYTHON PACKAGES`.

To list the extra Python libraries installed in Enterprise 2.x, use the REST API:
```bash
curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" http://localhost:8123/timeplusd/v1/python_packages
```

### Delete Python Libraries (2.x) {#delete_lib}
Only for Enterprise v2.7–v2.8. On 3.0+, use `SYSTEM UNINSTALL PYTHON PACKAGE`.

To delete Python libraries in Enterprise 2.x, call the REST API:

For example, if you want to delete the `numpy` library, you can use the following command:
```bash
curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" -X DELETE http://localhost:8123/timeplusd/v1/python_packages/numpy
```

### Update Python Libraries {#update_lib}
There is no in-place update. Uninstall then install the desired version.

## Concurrency and the free-threaded runtime {#free_threading}

Since Timeplus Enterprise 3.3.1 the embedded interpreter is a **free-threaded** build of Python 3.14 ([PEP 703](https://peps.python.org/pep-0703/)): it is compiled with `Py_GIL_DISABLED`, so the Global Interpreter Lock is gone and UDFs from concurrent queries genuinely run in parallel on multiple threads. This is what removes the single-interpreter bottleneck that Python UDFs had on 3.10 — but it also means **the GIL no longer accidentally protects your Python state**.

At startup the server logs which build is in use, for example:

```
Embedded Python 3.14.6 interpreter is initializing: embedded_free_threaded=true, ...
```

What is safe and what is not:

* **Module-level state inside the UDF body is per query.** Each query gets its own module object for the `$$ ... $$` code, so a global defined there is not shared with other queries. This is safe.
* **Module-level state inside an *imported* helper module is shared.** Imports go through `sys.modules`, which is interpreter-global, so every concurrent query on every thread sees the *same* module object and the same globals. Read-modify-write on such a global is a data race, and updates are silently lost.

The failure is silent — no exception, just wrong numbers. In a measured run of 8 concurrent queries each doing 5000 increments of a counter in an imported module, an unprotected counter finished at roughly 18,000 instead of 40,000; the same code with a `threading.Lock` finished at exactly 40,000.

So if a helper module holds mutable state, guard it:

```python
# my_helpers.py, installed as a package or placed on the interpreter path
import threading

_lock = threading.Lock()
_counter = 0

def bump():
    global _counter
    with _lock:          # required on the free-threaded runtime
        _counter += 1
        return _counter
```

Read-only module state (lookup tables, compiled regexes, loaded models) needs no lock. The place to audit is any shared, *mutated* global — counters, caches, accumulators, and connection pools that are not themselves thread-safe.

## Upgrading to the Python 3.14 runtime {#upgrade_314}

When upgrading from Timeplus Enterprise 3.2.x or earlier to 3.3.1+:

1. **Replace the whole runtime, not just `timeplusd`.** The embedded interpreter loads `libpython3.14t` from the Python bundle that ships with the release, and the server refuses to start if the runtime is a GIL-enabled build. Follow the standard [bare metal upgrade](/bare-metal-install) procedure — stop the service, replace both `bin/` and `lib/`, then start it again. The data folder needs no migration; UDF definitions, streams and checkpoints all survive.
2. **Reinstall the packages your UDFs import.** Nothing third-party is bundled anymore. Inventory your UDF `import` statements first, then install them, ideally by declaring them in [`python_requirements`](#python_requirements) so all nodes converge:
   ```sql
   SYSTEM INSTALL PYTHON PACKAGE 'proton-driver==0.3.0';
   SYSTEM INSTALL PYTHON PACKAGE 'numpy';
   ```
   No server restart is needed after installing.
3. **Check that the packages have free-threaded wheels.** The interpreter is `cp314t`, so a package needs a `cp314t` (or pure-Python) wheel; otherwise pip has to build it from source, which requires a toolchain on the node. `proton-driver` 0.3.0 publishes a `cp314t` wheel and works on the free-threaded runtime.
4. **Audit shared mutable state in imported helper modules** and add locking — see [Concurrency and the free-threaded runtime](#free_threading).
5. **Rolling back** is a data-folder copy: with the service stopped, copy the data folder aside before you upgrade. Restoring that copy and reinstalling the old release brings 3.2.x back up intact.

:::tip
Right after `SYSTEM INSTALL PYTHON PACKAGE`, the very first UDF call can still fail with `ModuleNotFoundError` because the interpreter cached the (previously missing) site-packages directory at startup. Simply retry the query — no restart is needed.
:::

## Limitations
- Linux deployments require Glibc 2.35+.
- The embedded runtime is Python 3.14 free-threaded (`cp314t`) since Timeplus Enterprise 3.3.1, and Python 3.10 in earlier versions. The version is not configurable, and packages must be compatible with it.
- No third-party packages are bundled since 3.3.1; install what you need via SQL or `python_requirements`.
- Shared state in imported modules is not protected by a GIL — see [Concurrency and the free-threaded runtime](#free_threading).
- Some libraries may require OS/system dependencies.
- On 3.0+, use SQL `SYSTEM` commands; on 2.x, use REST or `timeplusd python -m pip`.
