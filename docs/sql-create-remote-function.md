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

Pleaes refer to [the example](/remote-udf) for how to build a IP lookup service via AWS Lambda and register it as a remote UDF in Timeplus.
