# User-Defined Functions

At Timeplus, we leverage SQL to make powerful streaming analytics more accessible to a broad range of users. Without SQL, you have to learn and call low-level programming API, then compile/package/deploy them to get analytics results. This is a repetitive and tedious process, even for small changes. 

But some developers have concerns that complex logic or systems integrations are hard to express using SQL.

That's why we add User-Defined Functions (UDF) support in Timeplus. This enables users to leverage existing programming libraries, integrate with external systems, or just make SQL easier to maintain.

As of today, Timeplus supports two ways to develop/register UDF.

* [Remote UDF](remote-udf). Register a webhook as the UDF. You may use any programming language/framework to develop/deploy the webhook. A good starting point is using AWS Lambda. 
* [Local UDF in JavaScript](js-udf). Recently we also added the support of JavaScript-based local UDF. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by V8). No need to deploy extra server/service for the UDF. More languages will be supported. Please contact us if you want to try this feature, since it's disabled by default.



:::info

Please note, there are many factors to determine the number of function calls. For example, when you run a query, Timeplus query analzyer will dry-run the query first. During the query execution, a batch of data will be sent to the UDF, depending on how the data is organzied. 

Long story short, developers should not make assumption for the number of function calls. For User-defined scalar functions (UDFs) it should be stateless, and for User-defined aggregate functions (UDAFs), data might be aggregated more than once, but the final result is correct.

:::

