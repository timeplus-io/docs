# Timeplus External Stream

In addition to [Kafka External Stream](proton-kafka), Timeplus Enterprise also supports the other type of external stream to read or write data for the other Timeplus Enterprise deployment.

## Use Cases

By introducing the external stream for Timeplus, you can implement many new use cases, such as:
* **Hybrid Deployment**: you can deploy Timeplus Enterprise in both public cloud and private cloud, even on the edge servers. Using the Timeplus External Stream, you can run federation search from one Timeplus deployment to query data from the other deployment, without replicating the data. Alternatively, you can continuously send data from one deployment to the other deployment.
* **Data Migration or Upgrade**: when you are ready to go production, you may use the Timeplus External Stream to transfer data from the staging cluster to the production cluster. Or if you need to upgrade Timeplus Enterprise across major releases, this type of external stream can help you to transfer data.

## Syntax
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
* **hosts**: a single host or a set of hosts with ports, e.g. 'host1', or 'host1:port1,host2:port2'.
* **db**: the database name in the remote Timeplusd, default value is 'default'.
* **user**: the user name for the remote Timeplusd, default value is 'default'.
* **password**: the password for the remote Timeplusd, default value is an empty string.
* **secure**: a bool for whether to use secure connection to the remote Timeplusd, default value is false.
* **stream**: the stream name in the remote Timeplusd. If it's omitted, then use the external stream name.

## Limitations
This is a relatively new feature. There are some known limitations which we plan to improve later on.

* [table function](functions_for_streaming#table) is not supported
* [window functions](functions_for_streaming) are not working
* can't read virtual columns on remote streams
