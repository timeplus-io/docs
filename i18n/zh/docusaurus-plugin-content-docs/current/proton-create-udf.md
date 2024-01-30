# User-Defined Function

在 Timeplus 中，我们通过 SQL 让广大用户更容易获取强大的流式分析功能。 如果不用 SQL ，您必须学习并调用比较底层的编程API，然后编译/打包/部署它们以获得分析结果。 这是一个重复性和棘手的过程，即使对小的变化来说也是如此。

但一些开发者担心复杂的逻辑或系统集成很难使用 SQL 表达。

That's why we add User-Defined Functions (UDF) support in Proton. 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。

Proton supports [Local UDF in JavaScript](js-udf). 您可以使用现代 JavaScript（由 V8提供支持）开发用户定义的标量函数 (UDF) 或用户定义的聚合函数 (UDAF)。 无需为 UDF 部署额外的服务器/服务。 将来将支持更多语言。



:::info

Require Proton 1.3.15 or above to manage UDF.

:::

## CREATE OR REPLACE FUNCTION

You can create or replace a JavaScript UDF, by specifying the function name, input and output data types. Please check the mapping of data types for [input](js-udf#arguments) and [output](js-udf#returned-value).

The following example defines a new function `test_add_five_5`:

```sql showLineNumbers
CREATE OR REPLACE FUNCTION test_add_five_5(value float32) 
RETURNS float32 
LANGUAGE JAVASCRIPT AS $$
  function test_add_five_5(value) {
    for(let i=0;i<value.length;i++) {
      value[i]=value[i]+5;
    }
    return value;
  }
$$;
```

备注：

* Line 1: the function is to be created with name `test_add_five_5`, taking a single `float32` parameter.
* Line 2: the function is to return a `float32`
* Line 4: the same function name is defined in the code block. To improve performance, multiple UDF calls will be batched. The `value` is actually an array of `float`
* Line 5 and 6: iterating the input array and add 5 to each value
* Line 8: return an array of new values as return type
* Line 10: close the code block.

## CREATE AGGREGATE FUNCTION

Creating a user-defined-aggregation function (UDAF) requires a bit more effort. Please check [this documentation](js-udf#udaf) for the 3 required and 3 optional functions.

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



## DROP FUNCTION

No matter UDF or UDAF, you can remove the function via `DROP FUNCTION`

示例：

```sql
DROP FUNCTION test_add_five_5;
```

