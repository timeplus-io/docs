# 用户定义的函数

在 Timeplus 中，我们通过 SQL 让广大用户更容易获取强大的流式分析功能。 如果不用 SQL ，您必须学习并调用比较底层的编程API，然后编译/打包/部署它们以获得分析结果。 这是一个重复性和棘手的过程，即使对小的变化来说也是如此。

But some developers have concerns that complex logic or systems integration are hard to express using SQL.

这就是为什么我们在 Timeplus 中添加用户定义函数 (UDF) 支持的原因。 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。

截至今天，Timeplus 支持两种开发/注册 UDF 的方法。

* [Remote UDF](/remote-udf). 将 webhook 注册为 UDF。 你可以使用任何编程语言/框架来开发/部署 webhook。 一个不错的起点是使用 AWS Lambda。
* [Local UDF in JavaScript](/js-udf). 我们还增加了对基于 JavaScript 的本地 UDF 的支持。 您可以使用现代 JavaScript（由 V8提供支持）开发用户定义的标量函数 (UDF) 或用户定义的聚合函数 (UDAF)。 无需为 UDF 部署额外的服务器/服务。 将来将支持更多语言。



:::info

请注意，决定函数调用次数的因素有很多。 例如，当你运行查询时，Timeplus 查询分析器将首先试运行查询。 在执行查询期间，将向 UDF 发送一批数据，具体取决于数据的组织方式。

长话短说，开发者不应该假设函数调用的次数。 对于用户定义的标量函数 (UDF)，它应该是无状态的；对于用户定义的聚合函数 (UDAF)，数据可能会被多次聚合，但最终结果是正确的。

:::
