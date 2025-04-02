# CREATE FUNCTION
Timeplus supports four ways to develop/register UDF. Please check [UDF](/udf) page for the overview.

## SQL UDF
You can create or replace a SQL UDF, by specifying the function name, parameters and the expression.

Syntax:
```sql
CREATE [OR REPLACE] FUNCTION name AS (parameter0, ...) -> expression
```
For example:
```sql
CREATE OR REPLACE FUNCTION color_hex AS (r, g, b) -> '#'||hex(r)||hex(g)||hex(b);

-- SELECT color_hex(12,120,200) returns #0C78C8
```

[Learn More](/sql-udf)

## Remote UDF
Register a webhook as the UDF. You may use any programming language/framework to develop/deploy the webhook. A good starting point is using AWS Lambda.

Syntax:
```sql
CREATE REMOTE FUNCTION udf_name(ip string) RETURNS string
 URL 'https://the_url'
 AUTH_METHOD 'none'
```
If you need to protect the end point and only accept requests with a certain HTTP header, you can use the AUTH_HEADER and AUTH_KEY setting, e,g.
```sql
CREATE REMOTE FUNCTION udf_name(ip string) RETURNS string
 URL 'https://the_url'
 AUTH_METHOD 'auth_header'
 AUTH_HEADER 'header_name'
 AUTH_KEY 'value';
```

[Learn More](/remote-udf)

## JavaScript UDF

### UDF {#js-udf}
You can create or replace a JavaScript UDF, by specifying the function name, input and output data types. Please check the mapping of data types for [input](/js-udf#arguments) and [output](/js-udf#returned-value).

The following example defines a new function `test_add_five_5`:

```sql showLineNumbers
CREATE OR REPLACE FUNCTION test_add_five_5(value float32)
RETURNS float32
LANGUAGE JAVASCRIPT AS $$
  function test_add_five_5(values) {
    for(let i=0;i<values.length;i++) {
      values[i]=values[i]+5;
    }
    return values;
  }
$$;
```

Note:

* Line 1: the function is to be created with name `test_add_five_5`, taking a single `float32` parameter.
* Line 2: the function is to return a `float32`
* Line 4: the same function name is defined in the code block. To improve performance, multiple UDF calls will be batched. The `values` is an array of `float`
* Line 5 and 6: iterating the input array and add 5 to each value
* Line 8: return an array of new values
* Line 10: close the code block.

You can also add `EXECUTION_TIMEOUT <num>` to the end of the `CREATE FUNCTION` to customize the timeout for calling remote endpoints. By default the timeout is 10000 milliseconds (i.e. 10 seconds).

:::info
You can add debug information via `console.log(..)` in the JavaScript UDF. The logs will be available in the server log files.
:::

Check [more examples](js-udf#udf) for scalar function with 2 or more arguments or 0 argument.

### UDAF {#js-udaf}

Creating a user-defined-aggregation function (UDAF) requires a bit more effort. Please check [this documentation](/js-udf#udaf) for the 3 required and 3 optional functions.

```sql
CREATE AGGREGATE FUNCTION test_sec_large(value float32)
RETURNS float32
LANGUAGE JAVASCRIPT AS $$
    {
      initialize: function() {
         this.max = -1.0;
         this.sec = -1.0
      },
      process: function(values) {
        for (let i = 0; i < values.length; i++) {
          if (values[i] > this.max) {
            this.sec = this.max;
            this.max = values[i]
          }
          if (values[i] < this.max && values[i] > this.sec)
            this.sec = values[i];
        }
      },
            finalize: function() {
            return this.sec
            },
            serialize: function() {
            let s = {
            'max': this.max,
            'sec': this.sec
            };
        return JSON.stringify(s)
      },
        deserialize: function(state_str) {
                                           let s = JSON.parse(state_str);
                                           this.max = s['max'];
                                           this.sec = s['sec']
        },
        merge: function(state_str) {
                                     let s = JSON.parse(state_str);
                                     if (s['sec'] >= this.max) {
                                     this.max = s['max'];
                                     this.sec = s['sec']
                                     } else if (s['max'] >= this.max) {
                                     this.sec = this.max;
                                     this.max = s['max']
                                     } else if (s['max'] > this.sec) {
                                     this.sec = s['max']
                                     }
                                     }
        }
$$;
```

[Learn More](/js-udf)

## Python UDF
starting from v2.7, Timeplus Enterprise also supports Python-based UDF. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with the embedded Python 3.10 runtime in Timeplus core engine. No need to deploy extra server/service for the UDF.

[Learn more](/py-udf) why Python UDF, and how to map the data types in Timeplus and Python, as well as how to manage dependencies.

### UDF {#py-udf}
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

### UDAF {#py-udaf}
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

[Learn More](/py-udf)
