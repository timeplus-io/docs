# User-Defined Functions

At Timeplus, we leverage SQL to make powerful streaming analytics more accessible to a broad range of users. Without SQL, you have to learn and call low-level programming API, then compile/package/deploy them to get analytics results. This is a repetitive and tedious process, even for small changes.

But some developers have concerns that complex logic or systems integration are hard to express using SQL.

That's why we add User-Defined Functions (UDF) support in Timeplus. This enables users to leverage existing programming libraries, integrate with external systems, or just make SQL easier to maintain.

As of today, Timeplus supports four ways to develop/register UDF.

* [SQL UDF](/sql-udf). Register a UDF from a lambda SQL expression. You can create common SQL snippets as SQL UDFs and reuse them in your queries.
* [Remote UDF](/remote-udf). Register a webhook as the UDF. You may use any programming language/framework to develop/deploy the webhook. A good starting point is using AWS Lambda.
* [Local UDF in JavaScript](/js-udf). We also added the support of JavaScript-based local UDF. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by V8). No need to deploy extra server/service for the UDF.
* [Local UDF in Python](/py-udf). Since Timeplus Enterprise 2.7, the Python UDF is supported. You can build high performance Python UDFs with the embedded CPython interpreter in Timeplus core engine. Additional libraries can be installed.

Please choose the right UDF type based on your requirements.
|UDF Type| Programming Language | 3rd Party Libraries |Performance | User-Defined Scalar Functions | User-Defined Aggregate Functions | Custom Emit Policy |
|--|--|--|--|--|--|--|
|SQL UDF| SQL | ❌|Fastest | ✅|❌|❌|
|Python UDF| Python|✅|Fast|✅|✅|❌|
|JavaScript UDF| JavaScript|❌|Fast |✅|✅|✅|
|Remote UDF|Any| ✅|Slow| ✅|❌|❌|

:::info

Please note, there are many factors to determine the number of function calls. For example, when you run a query, Timeplus query analyzer will dry-run the query first. During the query execution, a batch of data will be sent to the UDF, depending on how the data is organized.

Long story short, developers should not make assumption for the number of function calls. For User-defined scalar functions (UDFs) it should be stateless, and for User-defined aggregate functions (UDAFs), data might be aggregated more than once, but the final result is correct.

:::
