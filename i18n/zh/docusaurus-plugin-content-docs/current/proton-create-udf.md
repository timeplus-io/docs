# 用户定义函数

在 Timeplus 中，我们通过 SQL 让广大用户更容易获取强大的流式分析功能。 如果不用 SQL ，您必须学习并调用比较底层的编程API，然后编译/打包/部署它们以获得分析结果。 这是一个重复性和棘手的过程，即使对小的变化来说也是如此。

但一些开发者担心复杂的逻辑或系统集成很难使用 SQL 表达。

That's why we add User-Defined Functions (UDF) support in Proton. 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。

Proton 支持 JavaScript</a>中的本地 UDF。 您可以使用现代 JavaScript（由 V8提供支持）开发用户定义的标量函数 (UDF) 或用户定义的聚合函数 (UDAF)。 无需为 UDF 部署额外的服务器/服务。 将来将支持更多语言。 </p> 



## 创建或替换函数

You can create or replace a JavaScript UDF, by specifying the function name, input and output data types. Please check the mapping of data types for [input](js-udf#arguments) and [output](js-udf#returned-value). 请检查 [输入](js-udf#arguments) 和 [输出](js-udf#returned-value)的数据类型映射。

以下示例定义了一个新函数 `test_add_five_5`：



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

* 第 1 行：该函数将使用名为 `test_add_five_5`创建，采用一个 `float32` 参数。
* 第 2 行：该函数将返回 `float32`
* Line 4: the same function name is defined in the code block. To improve performance, multiple UDF calls will be batched. The `value` is actually an array of `float` 为了提高性能，将对多个 UDF 调用进行批处理。 `值` 是一个由 `浮点数组成的数组`
* 第 5 行和第 6 行：迭代输入数组并将每个值加 5
* Line 8: return an array of new values as return type
* 第 10 行：关闭代码块。



## 创建聚合函数

创建用户定义聚合函数 (UDAF) 需要更多的精力。 Creating a user-defined-aggregation function (UDAF) requires a bit more effort. Please check [this documentation](js-udf#udaf) for the 3 required and 3 optional functions.



```sql showLineNumbers

```






## 删除函数

无论是 UDF 还是 UDAF，你都可以通过 `DROP FUNCTION`删除该函数

示例：



```sql
DROP FUNCTION test_add_five_5;
```

