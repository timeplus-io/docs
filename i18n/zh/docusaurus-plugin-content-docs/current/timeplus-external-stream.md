# Timeplus External Stream

In addition to [Kafka External Stream](proton-kafka), Timeplus Enterprise also supports the other type of external stream to read or write data for the other Timeplus Enterprise deployment.

## 用例

By introducing the external stream for Timeplus, you can implement many new use cases, such as:

- **Hybrid Deployment**: you can deploy Timeplus Enterprise in both public cloud and private cloud, even on the edge servers. Using the Timeplus External Stream, you can run federation search from one Timeplus deployment to query data from the other deployment, without replicating the data. Alternatively, you can continuously send data from one deployment to the other deployment; or accumulate data at the edge servers and forward high value data to the cloud deployment when the edge server can connect to the servers in the cloud.
- **Data Migration or Upgrade**: when you are ready to go production, you may use the Timeplus External Stream to transfer data from the staging cluster to the production cluster. Or if you need to upgrade Timeplus Enterprise across major releases, this type of external stream can help you to transfer data.

## 语法

```sql
CREATE EXTERNAL STREAM <stream_name>
SETTINGS
    type = 'timeplus',
    hosts = '<ip_or_host_of_timeplusd>',
    db = 'default',
    user = '<user>',
    password = '<password>',
    secure = <bool>,
    stream = '<stream_name>'
```

Settings:

- **hosts**: the IP or host for the remote timeplusd. When you set a set of hosts with ports, e.g. 'host1:port1,host2:port2', this will treat each host as a shard. `hosts` is required and there is no default value.
- **db**: the database name in the remote Timeplusd. The default value is 'default'.
- **user**: the user name for the remote Timeplusd. The dfault value is 'default'.
- **password**: the password for the remote Timeplusd. The default value is an empty string.
- **secure**: a bool for whether to use secure connection to the remote Timeplusd. The default value is false. Use port 9440 when `secure` is set to true, otherwise use port 8463.
- **stream**: the stream name in the remote Timeplusd. It's required and there is no default value.

## 子查询

### Migrate data from Timeplus Proton to Timeplus Enterprise

If you have deployed [Timeplus Proton](https://github.com/timeplus-io/proton) and want to load those data to a Timeplus Enterprise deployment, you cannot upgrade in place. You can use the Timeplus External Stream to migrate data.
:::info
The Timeplus Proton need to be 1.5.15 or above.
:::

For example, there is a stream `streamA` in Timeplus Proton, running on host1.

In your Timeplus Enterprise, you can create the stream with the same name and same schema. Then use a materiailzed view to load all data from Timeplus Proton to Timeplus Enterprise.

```sql
CREATE STREAM streamA(..);

CREATE EXTERNAL STREAM streama_proton
SETTINGS type='timeplus',hosts='host1',stream='streamA';

CREATE MATERIALIZED VIEW proton_to_tp_enterprise INTO streamA
AS SELECT * FROM streama_proton WHERE _tp_time>earliest_ts();
```

When all data in Proton has been imported into Timeplus Enterprise, you can drop the materialized view.

### Upload data from edge server to the cloud

If you deploy Timeplus Proton or Timeplus Enterprise at edge servers, it can collect and process live data with high performance and low footprint. The important data can be uploaded to the other Timeplus Enterprise in the cloud when the internet is available.

For example, on the edge server, you collect the real-time web access log and only want to uplaod error logs to the server.

```sql
CREATE EXTERNAL STREAM stream_in_cloud
SETTINGS type='timeplus',hosts='cloud1',stream='..';

CREATE MATERIALIZED VIEW edge_to_cloud INTO stream_in_cloud
AS SELECT * FROM local_stream WHERE http_code>=400;
```

When the network is not available, you can pause the materialized view by:

```sql
SYSTEM PAUSE MATERIALIZED VIEW edge_to_cloud;
```

When the network is restored, you can resume it:

```sql
SYSTEM UNPAUSE MATERIALIZED VIEW edge_to_cloud;
```

## 限制

This is a relatively new feature. There are some known limitations which we plan to improve later on.

- [table function](functions_for_streaming#table) is not supported. In order to query all or part of the historical data, you can start a streaming query with `WHERE _tp_time>earliest_ts()` or `WHERE _tp_time>now()-2d`.
- [window functions](functions_for_streaming) like tumble/hop are not working yet.
- can't read virtual columns on remote streams.
