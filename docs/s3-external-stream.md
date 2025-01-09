# Amazon S3 External Stream

Amazon S3 is cloud object storage with industry-leading scalability, data availability, security, and performance.

In [Timeplus Enterprise v2.7](/) (unreleased yet), we added the first-class integration for S3-compatible object storage systems, as a new type of [External Stream](/external-stream). You can read or write data in Amazon S3 or S3-compatible cloud or local storage.

## CREATE EXTERNAL STREAM

To create an external stream for S3, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] stream_name
    (<col_name1> <col_type1>, <col_name2> <col_type2>, ...)
PARTITION BY .. -- optional
SETTINGS
    type='s3', -- required
    use_environment_credentials=true|false, -- optional, default false
    access_key_id='..', -- optional
    secret_access_key='..', -- optional
    region='..', -- required
    bucket='..', -- required
    read_from='..', -- optional
    write_to='..', -- optional
    data_format='..', -- optional
    ...
```
For the full list of settings, see the [DDL Settings](#ddl-settings) section.

### Examples

#### Read from a public S3 bucket

The following SQL creates an external stream to read data in parquet format, from a public S3 bucket.
```sql
CREATE EXTERNAL STREAM amazon_reviews_2015
(
  `review_date` uint16,
  `marketplace` string,
  `customer_id` uint64,
  `review_id` string,
  `product_id` string,
  `product_parent` uint64,
  `product_title` string,
  `product_category` string,
  `star_rating` uint8,
  `helpful_votes` uint32,
  `total_votes` uint32,
  `vine` bool,
  `verified_purchase` bool,
  `review_headline` string,
  `review_body` string
)
SETTINGS
  type = 's3',
  region = 'eu-west-3',
  bucket = 'datasets-documentation',
  read_from = 'amazon_reviews/amazon_reviews_2015.snappy.parquet';
```

No AWS credentials are required to read from the public S3 bucket. You can get the number of rows in the external stream by running `SELECT count(*) FROM amazon_reviews_2015`.

#### Read from a private S3 bucket with credentials from environment variables

It's recommended to avoid hardcoding the AWS credentials in the DDL. You can attach a proper IAM role if Timeplus is running inside AWS, or define environment variables to store the AWS credentials.

The following SQL creates an external stream to read the CloudTrail logs in a compressed JSON file, from a private S3 bucket.
```sql
CREATE EXTERNAL STREAM aws_cloudtrail(Records array(string))
SETTINGS type='s3',
  region = 'us-west-1',
  bucket = 'config-bucket-753502519061',
  use_environment_credentials=true,
  read_from='AWSLogs/123456789012/CloudTrail/us-west-2/2024/10/18/123456789012_CloudTrail_us-west-2_20241018T0355Z_dz3Y12g0AHTXnSZb.json.gz';
```

Since all CloudTrail events are put in the `Records` array, you can use [array_join](/functions_for_array#array_join) to flatten the array and query the data, e.g.:
```sql
SELECT array_join(Records) AS r, r:eventVersion, r:userIdentity.type, r:userIdentity.principalId, r:userIdentity.arn, r:userIdentity.accountId, r:userIdentity.accessKeyId, r:userIdentity.userName, r:userIdentity.sessionContext, to_time(r:eventTime) AS eventTime, r:eventSource, r:eventName, r:awsRegion, r:sourceIPAddress, r:userAgent, r:requestParameters, r:responseElements, r:requestID, r:eventID, to_bool(r:readOnly) AS readOnly, r:eventType, to_bool(r:managementEvent) AS managementEvent, r:recipientAccountId, r:eventCategory FROM aws_cloudtrail
```

#### Read from a private S3 bucket with static credentials
The following SQL creates an external stream to read the S3 access logs in raw format, from a private S3 bucket, with static credentials.
```sql
CREATE EXTERNAL STREAM s3_logs(raw string)
SETTINGS type='s3',
  region = 'us-west-1',
  bucket = 'mys3logs',
  access_key_id = '..',
  secret_access_key = '..',
  read_from = 's3accesslog/123456789012/us-west-1/mybucket/2024/10/17/2024-10-17-00-00-00-016816C0FF1220C0',
  data_format='RawBLOB';
```

### DDL Settings

#### type
The type of the external stream. The value must be `s3`.

#### use_environment_credentials
Whether to use the AWS credentials from the environment variables, thus allowing access through IAM roles. Specifically, the following order of retrieval is performed:

* A lookup for the environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN`
* Check the `config` or `credentials` files in `$HOME/.aws`
* Temporary credentials obtained via the AWS Security Token Service - i.e. via AssumeRole API
* Checks for credentials in the ECS environment variables `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` or `AWS_CONTAINER_CREDENTIALS_FULL_URI` and `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`.
* Obtains the credentials via Amazon EC2 instance metadata provided `AWS_EC2_METADATA_DISABLED` is not set to true.

The default value is `false`.

#### access_key_id
The AWS access key ID. It's optional when `use_environment_credentials` is `true`.

#### secret_access_key
The AWS secret access key. It's optional when `use_environment_credentials` is `true`.

#### region
The region where the S3 bucket is located, such as `us-west-1`.

#### bucket
The name of the S3 bucket.

#### endpoint
The endpoint of the S3-compatible object storage system. It's optional. If it's missing, Timeplus will use the default endpoint for the region.

For example, if you have a minio running locally using the default ports. Then you should use `endpoint = 'http://localhost:9000'` to connect to the minio service.

#### data_format
The `data_format` is optional. When it's missing, Timeplus will try to infer the data format from the file extension in `read_from` or `write_to`.

The supported values for `data_format` are:

- JSONEachRow: parse each row of the message as a single JSON document. The top level JSON key/value pairs will be parsed as the columns. [Learn More](#jsoneachrow).
- CSV: less commonly used. [Learn More](#csv).
- TSV: similar to CSV but tab as the separator
- ProtobufSingle: for single Protobuf message per message
- Protobuf: there could be multiple Protobuf messages in a single message.
- Avro
- RawBLOB: the default value. Read/write message as plain text.

For data formats which write multiple rows into one single message (such as `JSONEachRow` or `CSV`), two more advanced settings are available:

#### read_from
The path(a.k.a. S3 key) to the file in the bucket to read from. It can be a single file or a path with a wildcard, such as `read_from='CostUsageReportsParquet/TpDevBilling/TpDevBilling/year=2024/month={6..12}/TpDevBilling-0000{1..9}.snappy.parquet'` is to read the parquet files from June to December in 2024.

Bash-like wildcards are supported. The list of files is determined during `SELECT` (not at `CREATE` moment).

* `*` — Substitutes any number of any characters except / including empty string.
* `**` — Substitutes any number of any character include / including empty string.
* `?` — Substitutes any single character.
* `{some_string,another_string,yet_another_one}` — Substitutes any of strings 'some_string', 'another_string', 'yet_another_one'.
* `{N..M}` — Substitutes any number in range from N to M including both borders. N and M can have leading zeroes e.g. 000..078.

If you only set `read_from`, not `write_to`, the S3 external stream becomes a read-only stream, i.e. you can't run `INSERT` queries on it.

#### write_to
As Timeplus is a streaming engine, when you write data into a S3 external stream, data will keep flowing into your S3 bucket. Thus, instead of creating one single S3 object, a S3 external stream will keep creating new S3 object continuously. So the object key specified in `write_to` actually is a template. S3 external stream will add an index ( a timestamp ) to that template as the actual object keys.

For example, with `write_to = 'example/data.json'`, the actual object keys will be something like `example/data.202410291101101530247.json`. `202410291101101530247` is the index added by the external stream ( it's a timestamp consist of the year, month, day, hour, minute, second, and millisecond ). The index is added before the extension name (if any), so that the object key will still have the correct extension name as expected.

If you only set `write_to`, not `read_from`, Timeplus will try to infer `read_from` from `write_to`, so that you can read the data that you write to the same S3 external stream. If this does not work for you, you can always specify read_from manually to get the correct results.

#### s3_min_upload_file_size
The minimum size (in bytes) of the file to write to S3. If the file size is less than this value, Timeplus will buffer the data in memory and upload it when the buffer is full. The default value is 16,777,216 (16MB).

#### s3_max_upload_idle_seconds
The maximum idle time in seconds to wait for the buffer to be full. If the buffer is not full after this time, Timeplus will upload the data to S3.

Both `s3_min_upload_file_size` and `s3_max_upload_idle_seconds` can be set in the DDL, but also can be set in the `INSERT` statement. The value in the `INSERT` statement will override the value in the DDL, e.g.:
```sql
INSERT INTO example_s3_stream SETTINGS s3_min_upload_file_size = 1048576 SELECT name, value FROM another_stream;
```

#### s3_upload_part_size_multiply_factor
Default 2. Multiply `s3_min_upload_part_size` by this factor each time `s3_multiply_parts_count_threshold` parts were uploaded from a single write to S3.

#### s3_upload_part_size_multiply_parts_count_threshold
Default 1000. Each time this number of parts was uploaded to S3 `s3_min_upload_part_size` multiplied by `s3_upload_part_size_multiply_factor`.

#### s3_max_single_part_upload_size
Default 32MB. The maximum size of a single part upload to S3. If the part size is larger than this value, Timeplus will split the part into multiple parts.

#### s3_check_objects_after_upload
Default false. After uploading a part to S3, Timeplus will check if the object exists in the bucket. If the object does not exist, Timeplus will retry the upload.

#### compression
The compression algorithm to use when writing data to S3. The supported values are `gzip`, `deflate`, `br`, `xz`, `zstd`, `lz4`, `bz2`, and `snappy`. By default, it will also be automatically inferred from the object key extension name (if any).

#### s3_max_connections
The maximum number of connections to use when uploading data to S3. The default value is 1024.

#### s3_max_get_rps
The maximum number of requests per second to use when reading data from S3. The default value is 0, which is unlimited.

#### s3_max_get_burst
The maximum burst requests that can be issued simultaneously before hitting request per second limit. By default (0) equals to `s3_max_get_rps`.

#### s3_max_put_rps
The maximum number of requests per second to use when writing data to S3. The default value is 0, which is unlimited.

#### s3_max_put_burst
The maximum burst requests that can be issued simultaneously before hitting request per second limit. By default (0) equals to `s3_max_put_rps`.

#### s3_max_redirects
The maximum number of redirects to follow when reading data from S3. The default value is 10.

#### s3_max_single_read_retries
The maximum number of retries when reading a single object from S3. The default value is 4.

#### s3_max_unexpected_write_error_retries
The maximum number of retries when an unexpected error occurs during writing to S3. The default value is 4.


### PARTITION BY
When you write data to S3, you can partition the data by one or more columns. You can define the partition logic in the `PARTITION BY` clause, and use `{_partition_id}` in the `write_to` setting.

For example, the following SQL creates an external stream to write Kubernetes logs to S3, partitioned by the year and month of the timestamp and the container name, such as `application_logs/202409/web.log.gzip`:
```sql
CREATE EXTERNAL STREAM s3_logs (
  ts datetime32,
  container_name string,
  log string
)
PARTITION BY concat(to_YYYMM(ts), '/', container_name)
SETTINGS
  type = 's3',
  region = 'us-west-2',
  bucket = 'mybucket',
  write_to = 'application_logs/{_partition_id}.log.gzip';
```

:::warning
In most cases, you probably don't need a partition key, and if it is needed you generally don't need a partition key more granular than by month. Partitioning does not speed up queries. You should never use too granular partitioning, which will likely lead to too many small S3 objects.
:::

## Virtual Columns
While reading from an S3 external stream, you can use the following virtual columns:
* `_path` — Path to the file. Type: `low_cardinalty(string)`. In case of archive, shows path in a format: `"{path_to_archive}::{path_to_file_inside_archive}"`
* `_file` — Name of the file. Type: `low_cardinalty(string)`. In case of archive shows name of the file inside the archive.

## DROP EXTERNAL STREAM

```sql
DROP STREAM [IF EXISTS] stream_name
```

## Limitations

There are some limitations for the Pulsar-based external streams, because Timeplus doesn’t control the storage or the data format for the external stream.

1. The UI wizard to setup S3 External Stream is coming soon. Before it's ready, you need the SQL DDL.
2. Assume role is not supported yet. You can use the environment credentials or static credentials.
