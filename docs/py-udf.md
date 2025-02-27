# Python UDF

In addition to [Remote UDF](/remote-udf) and [JavaScript UDF](/js-udf), starting from [v2.7](/enterprise-v2.7), Timeplus Enterprise also supports Python-based UDF, as a feature in technical preview. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with the embedded Python 3.10 runtime in Timeplus core engine. No need to deploy extra server/service for the UDF.

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

- `pip`
- `setuptools`
- `six`
- `wheel`

All the dependencies for those libraries are also pre-installed, such as `pickle`.

### Install Python Libraries {#install_lib}
To install new Python libraries, you can call the REST API of timeplusd in Timeplus Enterprise v2.7. In the future, we will provide a more user-friendly way to install Python libraries.

:::info
The following `curl` sample commands assume the timeplusd server is running on `localhost:8123`, with `default` as the user with an empty password. More commonly, you need to set the HTTP headers `x-timeplus-user` and `x-timeplus-key` with the user and password.
:::

For example, if you want to install the `numpy` library, you can use the following command:
```bash
curl -X POST http://localhost:8123/timeplusd/v1/python_packages -H "Content-Type: text/plain; charset=utf-8" -d '{"packages": [{"name": "numpy"}]}'
```

If you need to install a specific version of a library, you can specify it in the `version` field. For example, to install `numpy` version `2.2.3`, you can use the following command:
```bash
curl -X POST http://localhost:8123/timeplusd/v1/python_packages -H "Content-Type: text/plain; charset=utf-8" -d '{"packages": [{"name": "numpy", "version": "2.2.3"}]}'
```

### List Python Libraries {#list_lib}
To list the extra Python libraries installed in Timeplus Enterprise, you can use the following command:
```bash
curl http://localhost:8123/timeplusd/v1/python_packages
```

### Delete Python Libraries {#delete_lib}
To delete Python libraries, you can call the REST API of timeplusd in Timeplus Enterprise.

For example, if you want to delete the `numpy` library, you can use the following command:
```bash
curl -X DELETE http://localhost:8123/timeplusd/v1/python_packages/numpy
```

### Update Python Libraries {#update_lib}
Currently we don't support updating Python libraries. You can delete the library and reinstall it with the desired version.

## Limitations
Timeplus Enterprise v2.7 is the first version that supports Python UDFs. The following limitations apply:
- Python UDFs are only available in Linux x86_64 bare metal or containerized deployments.
- For Linux x86_64 bare metal deployments, Glibc version 2.35 or higher is required.
- Only Python 3.10 is supported. Contact us if you need to install a specific version.
- Not all Python libraries can be installed in Timeplus Enterprise. Contact us if you need to install a specific library.
