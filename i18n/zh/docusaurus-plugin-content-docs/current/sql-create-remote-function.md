# CREATE REMOTE FUNCTION

在 Timeplus 中，我们通过 SQL 让广大用户更容易获取强大的流式分析功能。 如果不用 SQL ，您必须学习并调用比较底层的编程API，然后编译/打包/部署它们以获得分析结果。 这是一个重复性和棘手的过程，即使对小的变化来说也是如此。

But some developers have concerns that complex logic or systems integration are hard to express using SQL.

这就是为什么我们在 Timeplus 中添加用户定义函数 (UDF) 支持的原因。 这将使用户能够利用现有的编程库，与外部系统集成，或者只是让SQL更容易维护。

Timeplus Proton supports [Local UDF in JavaScript](/js-udf). 您可以使用现代 JavaScript（由 V8提供支持）开发用户定义的标量函数 (UDF) 或用户定义的聚合函数 (UDAF)。 无需为 UDF 部署额外的服务器/服务。 将来将支持更多语言。

:::info
In Timeplus Enterprise, the Python UDF will be ready soon.
:::

## CREATE REMOTE FUNCTION

```sql
CREATE REMOTE FUNCTION udf_name(arg_name data_type) RETURNS data_type
 URL 'https://the_url'
 AUTH_METHOD 'none'
```

Please refer to [the example](/remote-udf) for how to build a IP lookup service via AWS Lambda and register it as a remote UDF in Timeplus.

## Authentication with HTTP Header

If you need to protect the end point and only accept requests with a certain HTTP header, you can use the AUTH_HEADER and AUTH_KEY setting, e,g.

```
CREATE REMOTE FUNCTION udf_name(ip string) RETURNS string
 URL 'https://the_url'
 AUTH_METHOD 'auth_header'
 AUTH_HEADER 'header_name'
 AUTH_KEY 'value';
```

## Customize the timeout

By default, Timeplus sets 10 seconds as the timeout for the remote UDF call. You can customize this via `EXECUTION_TIMEOUT`. The unit is millisecond.

```sql
CREATE REMOTE FUNCTION udf_name(arg_name data_type) RETURNS data_type
 URL 'https://the_url'
 AUTH_METHOD 'none'
 EXECUTION_TIMEOUT 60000
```

:::info
This feature is added in Timeplus Proton 1.5.18.
:::
