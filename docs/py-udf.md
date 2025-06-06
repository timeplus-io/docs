# Python UDF

In addition to [Remote UDF](/remote-udf) and [JavaScript UDF](/js-udf), starting from [v2.7](/enterprise-v2.7), Timeplus Enterprise also supports Python-based UDF, as a feature in technical preview. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with the embedded Python 3.10 runtime in Timeplus core engine. No need to deploy extra server/service for the UDF.

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
|string, fixed_string|str|
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
        return [self.max]
$$;
```

## Manage Python Libraries {#python_libs}
By default, Timeplus Enterprise ships a clean Python 3.10 environment, plus the following essential libraries:

```json
[
  { "name": "annotated-types", "version": "0.7.0" },
  { "name": "anyio", "version": "4.9.0" },
  { "name": "asyncer", "version": "0.0.8" },
  { "name": "autogen", "version": "0.7.3" },
  { "name": "certifi", "version": "2025.1.31" },
  { "name": "charset-normalizer", "version": "3.4.1" },
  { "name": "diskcache", "version": "5.6.3" },
  { "name": "distro", "version": "1.9.0" },
  { "name": "docker", "version": "7.1.0" },
  { "name": "exceptiongroup", "version": "1.2.2" },
  { "name": "fast-depends", "version": "2.4.12" },
  { "name": "h11", "version": "0.14.0" },
  { "name": "httpcore", "version": "1.0.7" },
  { "name": "httpx", "version": "0.28.1" },
  { "name": "idna", "version": "3.10" },
  { "name": "jiter", "version": "0.9.0" },
  { "name": "numpy", "version": "2.2.4" },
  { "name": "openai", "version": "1.68.2" },
  { "name": "packaging", "version": "24.2" },
  { "name": "pip", "version": "22.0.2" },
  { "name": "proton-driver", "version": "0.2.13" },
  { "name": "pyautogen", "version": "0.7.3" },
  { "name": "pydantic", "version": "2.10.6" },
  { "name": "pydantic_core", "version": "2.27.2" },
  { "name": "python-dotenv", "version": "1.0.1" },
  { "name": "pytz", "version": "2025.1" },
  { "name": "regex", "version": "2024.11.6" },
  { "name": "requests", "version": "2.32.3" },
  { "name": "setuptools", "version": "78.0.2" },
  { "name": "setuptools-scm", "version": "8.2.0" },
  { "name": "six", "version": "1.17.0" },
  { "name": "sniffio", "version": "1.3.1" },
  { "name": "sseclient-py", "version": "1.8.0" },
  { "name": "termcolor", "version": "2.5.0" },
  { "name": "tiktoken", "version": "0.9.0" },
  { "name": "timeplus-neutrino", "version": "0.0.6" },
  { "name": "tomli", "version": "2.2.1" },
  { "name": "tqdm", "version": "4.67.1" },
  { "name": "typing_extensions", "version": "4.12.2" },
  { "name": "tzlocal", "version": "5.3.1" },
  { "name": "urllib3", "version": "2.3.0" },
  { "name": "websockets", "version": "14.2" },
  { "name": "wheel", "version": "0.37.1" }
]
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

### Install Python Libraries {#install_lib}
To install new Python libraries, you can either call the REST API of timeplusd in Timeplus Enterprise v2.7, or use the new `timeplusd python pip install` command-line tool introduced in Timeplus Enterprise v2.8.

#### Install via `timeplusd python pip` {#install_pip}
Starting from Timeplus Enterprise v2.8, you can use the `timeplusd python pip install` command-line tool to install Python libraries. For example, to install the `numpy` library, you can use the following command:
```bash
timeplusd python --config-file config.yaml -m pip install --user numpy
```

For example, with the timeplusd docker image, you can use the following command:
```bash
docker exec -it container_name timeplusd python --config-file /etc/timeplusd-server/config.yaml -m pip install --user pandas
```

#### Install via REST API {#install_rest}

You can also call the REST API of timeplusd in Timeplus Enterprise v2.7 or above.

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

### List Python Libraries {#list_lib}
To list the extra Python libraries installed in Timeplus Enterprise, you can use the following command:
```bash
curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" http://localhost:8123/timeplusd/v1/python_packages
```

### Delete Python Libraries {#delete_lib}
To delete Python libraries, you can call the REST API of timeplusd in Timeplus Enterprise.

For example, if you want to delete the `numpy` library, you can use the following command:
```bash
curl -H "x-timeplus-user: theUser" -H "x-timeplus-key:thePwd" -X DELETE http://localhost:8123/timeplusd/v1/python_packages/numpy
```

### Update Python Libraries {#update_lib}
Currently we don't support updating Python libraries. You can delete the library and reinstall it with the desired version.

## Limitations
- For Linux bare metal deployments, Glibc version 2.35 or higher is required.
- Only Python 3.10 is supported. Contact us if you need to install a specific version.
- Not all Python libraries can be installed in Timeplus Enterprise. Contact us if you need to install a specific library.
