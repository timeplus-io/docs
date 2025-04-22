# HTTP External Stream

Since [Timeplus Enterprise v2.9](/enterprise-v2.9), Timeplus can send data to HTTP endpoints via the HTTP External Stream. You can use this feature to trigger Slack notifications or send streaming data to downstream systems, such as Splunk, Elasticsearch, or any other HTTP-based service.

Currently, it only supports writing data to HTTP endpoints, but reading data from HTTP endpoints is not supported yet.

## CREATE EXTERNAL STREAM

To create an external stream for HTTP endpoints, you can run the following DDL SQL:

```sql
CREATE EXTERNAL STREAM [IF NOT EXISTS] name
    (<col_name1> <col_type1>, <col_name2> <col_type2>, ...)
SETTINGS
    type = 'http',
    url = '', -- the HTTP URL the external stream read/write data from/to
    write_method = 'POST', -- optional, the HTTP method for write, default to POST
    compression_method = 'none', -- optional, method for handle request/response body
    use_chunked_encoding = true, -- optional, use Chunked Transfer Encoding for sending data
    http_header_..= '..', -- optional, HTTP header key-value pairs
    -- optional batch settings
    max_insert_block_size = 65409, -- how many rows at most ( this is a threshold value, not a precise value ) can be written into one single request
    max_insert_block_bytes = 1024 * 1024, -- how big one request body can be ( this is a threshold value, not a precise value )
    insert_block_timeout_ms = 500, -- how long it should wait for data for a request, i.e. how frequently it sends data
    -- optional auth settings
    username = '', -- usename for HTTP basic authentication ( conflicts with http_header_Authorization )
    password = '', -- password for HTTP basic authentication
    -- optiona SSL related settings
    ssl_ca_cert_file = '', -- the path of the CA certificate file
    ssl_ca_pem = '', -- the content of the CA certificate file (in PEM format), conflicts with ssl_ca_cert_file
    skip_ssl_cert_check = false, -- set to true to skip verifying server's certificate
    client_key = '', -- the private key for client
    -- timeout settings
    http_keep_alive_timeout = 10, -- timeout (in seconds) for HTTP keep-alive connection
    send_timeout = 300, -- seconds
    receive_timeout = 300 -- seconds
```
For the full list of settings, see the [DDL Settings](#ddl-settings) section.

### Examples

#### Write to OpenSearch/ElasticSearch {#example-write-to-es}
Assuming you have created an index `students` in a deployment of OpenSearch or ElasticSearch, you can create the following external stream to write data to the index.

```sql
CREATE EXTERNAL STREAM opensearch_t1 (
  name string,
  gpa float32,
  grad_year int16
) SETTINGS
type = 'http',
data_format = 'OpenSearch', --can also use the alias "ElasticSearch"
url = 'https://opensearch.g.aivencloud.com:28851/students/_bulk',
username='avnadmin',
password='..'
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO opensearch_t1(name,gpa,grad_year) VALUES('Jonathan Powers',3.85,2025);
```

### DDL Settings

#### type
The type of the external table. The value must be `s3`.

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

#### config_file
The `config_file` setting is available since Timeplus Enterprise 2.7. You can specify the path to a file that contains the configuration settings. The file should be in the format of `key=value` pairs, one pair per line. You can set the AWS access key ID and secret access key in the file.

Please follow the example in [Kafka External Stream](/proton-kafka#config_file).

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

- JSONEachRow: parse each row of the message as a single JSON document. The top level JSON key/value pairs will be parsed as the columns.
- CSV: less commonly used.
- TSV: similar to CSV but tab as the separator
- ProtobufSingle: for single Protobuf message per message
- Protobuf: there could be multiple Protobuf messages in a single message.
- Avro
- RawBLOB: the default value. Read/write message as plain text.

For data formats which write multiple rows into one single message (such as `JSONEachRow` or `CSV`), two more advanced settings are available:

#### read_from
The path(a.k.a. S3 key) to the file in the bucket to read from. It can be a single file or a path with a wildcard, such as `read_from='CostUsageReportsParquet/TpDevBilling/TpDevBilling/year=2024/month={6..12}/TpDevBilling-0000{1..9}.snappy.parquet'` is to read the parquet files from June to December in 2024.

Bash-like wildcards are supported. The list of files is determined during `SELECT` (not at `CREATE` moment).

* `*` — Substitutes any number of any characters except `/`, including empty string.
* `**` — Substitutes any number of any character include `/`, including empty string.
* `?` — Substitutes any single character.
* `{some_string,another_string,yet_another_one}` — Substitutes any of strings 'some_string', 'another_string', 'yet_another_one'.
* `{N..M}` — Substitutes any number in range from N to M including both borders. N and M can have leading zeroes e.g. 000..078.

If you only set `read_from`, not `write_to`, the S3 external table becomes a read-only table, i.e. you can't run `INSERT` queries on it.

#### write_to
As Timeplus is a streaming engine, when you write data into a S3 external table, data will keep flowing into your S3 bucket. Thus, instead of creating one single S3 object, a S3 external table will keep creating new S3 object continuously. So the object key specified in `write_to` actually is a template. S3 external table will add an index ( a timestamp ) to that template as the actual object keys.

For example, with `write_to = 'example/data.json'`, the actual object keys will be something like `example/data.202410291101101530247.json`. `202410291101101530247` is the index added by the external table ( it's a timestamp consist of the year, month, day, hour, minute, second, and millisecond ). The index is added before the extension name (if any), so that the object key will still have the correct extension name as expected.

If you only set `write_to`, not `read_from`, Timeplus will try to infer `read_from` from `write_to`, so that you can read the data that you write to the same S3 external table. If this does not work for you, you can always specify read_from manually to get the correct results.

## Virtual Columns
While reading from an S3 external table, you can use the following virtual columns:
* `_path` — Path to the file. Type: `low_cardinalty(string)`. In case of archive, shows path in a format: `"{path_to_archive}::{path_to_file_inside_archive}"`
* `_file` — Name of the file. Type: `low_cardinalty(string)`. In case of archive shows name of the file inside the archive.

## DROP EXTERNAL STREAM

```sql
DROP STREAM [IF EXISTS] name
```

## Limitations

1. The UI wizard to setup S3 External Table is coming soon. Before it's ready, you need the SQL DDL.
2. Assume role is not supported yet. You can use the environment credentials or static credentials.
