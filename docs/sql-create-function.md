# CREATE FUNCTION
At Timeplus, we leverage SQL to make powerful streaming analytics more accessible to a broad range of users. Without SQL, you have to learn and call low-level programming API, then compile/package/deploy them to get analytics results. This is a repetitive and tedious process, even for small changes.

But some developers have concerns that complex logic or systems integration are hard to express using SQL.

That's why we add User-Defined Functions (UDF) support in Timeplus. This enables users to leverage existing programming libraries, integrate with external systems, or just make SQL easier to maintain.

Timeplus Proton and Timeplus Enterprise support [SQL UDF](/) and [Local UDF in JavaScript](/js-udf). You can develop User-defined scalar functions (UDFs) in SQL, or develop UDFs or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by V8). No need to deploy extra server/service for the UDF. More languages will be supported.

:::info
In Timeplus Enterprise, the Python UDF will be ready soon.
:::

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
In Timeplus Enterprise, you can add debug information via `console.log(..)` in the JavaScript UDF. The logs will be available in the server log files.
:::

### UDAF {#js-udaf}

Creating a user-defined-aggregation function (UDAF) requires a bit more effort. Please check [this documentation](/js-udf#udaf) for the 3 required and 3 optional functions.

```sql showLineNumbers
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
