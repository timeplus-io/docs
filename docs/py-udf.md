# Local UDF in Python

In addition to [Remote UDF](/remote-udf) and [JavaScript UDF](/js-udf), Timeplus Enterprise also supports Python-based UDF running in the sql engine. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with your local Python runtime with required dependencies. No need to deploy extra server/service for the UDF. More languages will be supported in the future.

:::info

The Python-based UDF is only available in Timeplus Enterprise, not in Timeplus Proton. It's in technical preview and not enabled by default. Please contact us if you want to work with us to test it.
:::

## Why Python UDF
Python is recognized as one of the most popular languages in the field of data science. Its flexibility as a scripting language, ease of use, and extensive range of statistical libraries make it an indispensable tool for data scientists and analysts.

Python excels in writing complex parsing and data transformation logic, especially in scenarios where SQL capabilities are insufficient. Python User-Defined Functions (UDFs) offer the flexibility to implement intricate data processing mechanisms. These include:

* Custom Tokenization: Breaking down data into meaningful elements based on specific criteria.
* Data Masking: Concealing sensitive data elements to protect privacy.
* Data Editing: Modifying data values according to specific rules or requirements.
* Encryption Mechanisms: Applying encryption to data for security purposes.

## Data type mapping

This is the mapping for [Timeplus data type](/datatypes) and Python data type:
| Timeplus Data Type                      | Python Type   |
| ----------------------------- | ---------- |
| uint8, uint16, uint32, uint64               | int    |
|int8, int16, int32, int64|int|
|date, date32,datetime|int|
|float32, float64|float|
|ipv4|int|
|string, fixed_string|str|
|array|list|
|tuple|tuple|
|datetime64| N/A|
|map| N/A|
|uint128,uint256,int128,int256| N/A|
|decimal| N/A|
|ipv6| N/A|
|nullable| N/A|
|low_cardinality| N/A|

More data type support will be added.

## Register a Python UDF {#register}

You can create or replace a Python UDF with SQL. Web UI will be added.

### Scalar UDF
Scalar UDF is stateless UDF to convert columns in one row to other values.

Syntax:
```sql
CREATE OR REPLACE FUNCTION udf_name(col1 type1,..)
RETURNS type LANGUAGE PYTHON AS
$$
import …

def udf_name(col1..):
    …

$$
SETTINGS ...
```

### UDAF
UDAF or User Defined Aggregation Function is stateful. It takes one or more columns from a set of rows and return the aggregated result.

Syntax:
```sql
CREATE OR REPLACE AGGREGATION FUNCTION uda_name(col1 type1,...)
RETURNS type language PYTHON AS
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

### A simple UDF with numpy
[Numpy](https://numpy.org/) is a general-purpose array-processing package. It provides a high-performance multidimensional array object, and tools for working with these arrays. It is the fundamental package for scientific computing with Python.

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

## Configure Python Runtime

Timeplus Enterprise ships [CPython](https://github.com/python/cpython) 3.10 out-of-box. You can customize the `python_home` and `python_path` in the config.yaml. If you need to install new Python libraries, please install them in the specified `python_path`.
```yaml
python_home: /usr/bin/python
python_path: /usr/local/lib/python3.10/dist-packages:/usr/lib/python3.10:/usr/lib/python3/dist-packages
```

## Optimization for Numpy
Timeplus Enterprise adds additional support for numpy. When you create the Python UDF with `numpy_optimize_enable` setting enabled, the input/output data will be in numpy native format. This will greatly speed up the data processing.

Taking the example above to add 5 to the input value, the SQL to create the UDF with this optimization:
```sql
CREATE OR REPLACE FUNCTION add_five_numpy(value uint16)
RETURNS uint16 LANGUAGE PYTHON AS $$
def add_five_numpy(np_array):
    np_array += 5
    return np_array
$$ settings numpy_optimize_enable=true;
```
