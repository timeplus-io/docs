# 用户定义的函数

在 Timeplus 中，我们通过 SQL 让广大用户更容易获取强大的流式分析功能。 如果不用 SQL ，您必须学习并调用比较底层的编程API，然后编译/打包/部署它们以获得分析结果。 这是一个重复性和棘手的过程，即使对小的变化来说也是如此。

但一些开发者担心复杂的逻辑或系统集成很难使用 SQL 表达。

这就是为什么我们在 Timeplus 中添加用户定义函数 (UDF) 支持的原因。 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。

As of today, Timeplus supports two ways to develop/register UDF.

* [Remote UDF](remote-udf). Register a webhook as the UDF. You may use any programming language/framework to develop/deploy the webhook. A good starting point is using AWS Lambda.
* [Local UDF in JavaScript](js-udf). Recently we also added the support of JavaScript-based local UDF. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by V8). No need to deploy extra server/service for the UDF. More languages will be supported.

