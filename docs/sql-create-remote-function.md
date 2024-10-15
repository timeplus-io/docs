# CREATE REMOTE FUNCTION
At Timeplus, we leverage SQL to make powerful streaming analytics more accessible to a broad range of users. Without SQL, you have to learn and call low-level programming API, then compile/package/deploy them to get analytics results. This is a repetitive and tedious process, even for small changes.

But some developers have concerns that complex logic or systems integration are hard to express using SQL.

That's why we add User-Defined Functions (UDF) support in Timeplus. This enables users to leverage existing programming libraries, integrate with external systems, or just make SQL easier to maintain.

Timeplus Proton supports [Local UDF in JavaScript](/js-udf). You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by V8). No need to deploy extra server/service for the UDF. More languages will be supported.

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
