# CREATE FUNCTION

在 Timeplus 中，我们通过 SQL 让广大用户更容易获取强大的流式分析功能。 如果不用 SQL ，您必须学习并调用比较底层的编程API，然后编译/打包/部署它们以获得分析结果。 这是一个重复性和棘手的过程，即使对小的变化来说也是如此。

But some developers have concerns that complex logic or systems integration are hard to express using SQL.

这就是为什么我们在 Timeplus 中添加用户定义函数 (UDF) 支持的原因。 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。

Timeplus Proton supports [Local UDF in JavaScript](/js-udf). 您可以使用现代 JavaScript（由 V8提供支持）开发用户定义的标量函数 (UDF) 或用户定义的聚合函数 (UDAF)。 无需为 UDF 部署额外的服务器/服务。 将来将支持更多语言。

:::info
In Timeplus Enterprise, the Python UDF will be ready soon.
:::

## CREATE OR REPLACE FUNCTION

您可以通过指定函数名称、输入和输出数据类型来创建或替换 JavaScript UDF。 Please check the mapping of data types for [input](/js-udf#arguments) and [output](/js-udf#returned-value).

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

备注：

- Line 1: the function is to be created with name `test_add_five_5`, taking a single `float32` parameter.
- Line 2: the function is to return a `float32`
- Line 4: the same function name is defined in the code block. To improve performance, multiple UDF calls will be batched. The <code>value</code> is actually an array of <code>float</code> 为了提高性能，将对多个 UDF 调用进行批处理。 The `values` is an array of `float`
- 第 5 行和第 6 行：迭代输入数组并将每个值加 5
- Line 8: return an array of new values as return type
- 第 10 行：关闭代码块。

:::info
In Timeplus Enterprise, you can add debug information via `console.log(..)` in the JavaScript UDF. The logs will be available in the server log files.
:::

## 创建聚合函数

创建用户定义聚合函数 (UDAF) 需要更多的精力。 Please check [this documentation](/js-udf#udaf) for the 3 required and 3 optional functions.

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
