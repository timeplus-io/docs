## Overview

Timeplus natively supports the [Apache Iceberg](https://iceberg.apache.org/) open table format — a high-performance, reliable storage format for large-scale analytics. This integration allows Timeplus users to **stream data directly to Iceberg** and **query Iceberg tables efficiently**, all implemented purely in **C++**, without any Java dependencies.

### Supported Catalogs and Storage

The Iceberg REST Catalog integration works with common cloud and open-source backends, including:

- **Amazon S3** for object storage  
- **AWS Glue Iceberg REST endpoint**  
- **[Apache Gravitino REST Server](https://gravitino.apache.org/docs/0.8.0-incubating/iceberg-rest-service)**  

### Key Features

| Feature | Description |
|----------|--------------|
| **Native C++ Integration** | Fully implemented in C++ — no Java runtime required. |
| **REST Catalog Support** | Works with any Iceberg REST Catalog implementation. |
| **Stream-to-Iceberg Writes** | Continuously write streaming data into Iceberg tables. |
| **Direct Reads from Iceberg** | Query Iceberg tables natively using Timeplus SQL. |
| **Cloud Ready** | Optimized for S3 and compatible object storage systems. |

:::info
Data compaction is **not yet supported** in the current Timeplus Iceberg integration.
:::

## Create an Iceberg Database

You can create an **Iceberg database** in Timeplus using the `CREATE DATABASE` statement with the `type='iceberg'` setting.

### Prerequisites

- The database name must match an existing **namespace** in the catalog. Timeplus does not create the namespace; otherwise `CREATE DATABASE` fails with `Namespace <database_name> does not exist in the catalog`.
- The user running `CREATE DATABASE` needs `access_management: 1` and must not be restricted by `allow_databases`. The `users.yaml` shipped with Timeplus Proton pins the `default` user to `allow_databases: [default]`, so every `CREATE DATABASE` fails with a misleading `ACCESS_DENIED` until that block is removed from `users.yaml` itself (a `users.d` override does not merge this key).

### Syntax

```sql
CREATE DATABASE <database_name>
SETTINGS
    type = 'iceberg',
    catalog_uri = '<catalog_uri>',
    catalog_type = 'rest',
    warehouse = '<warehouse_path>',
    storage_endpoint = '<s3_endpoint>',
    rest_catalog_sigv4_enabled = <true|false>,
    rest_catalog_signing_region = '<region>',
    rest_catalog_signing_name = '<service_name>',
    use_environment_credentials = <true|false>,
    credential = '<username:password>',
    catalog_credential = '<username:password>',
    storage_credential = '<username:password>';
```

### Settings

- `type` — Must be set to `'iceberg'` to indicate an Iceberg database.
- `catalog_uri` — The URI of the Iceberg catalog (e.g., AWS Glue, Gravitino, or another REST catalog endpoint).
- `catalog_type` — Specifies the catalog type. Currently, only `'rest'` is supported in Timeplus.
- `warehouse` — The path or identifier of the Iceberg warehouse where table data is stored (e.g., an S3 path).
- `storage_endpoint` — The S3-compatible endpoint where data files are stored. For AWS S3, use `https://<bucket>.s3.<region>.amazonaws.com`.
- `rest_catalog_sigv4_enabled` — Enables [AWS SigV4](https://docs.aws.amazon.com/general/latest/gr/signing_aws_api_requests.html) authentication for secure catalog communication.
- `rest_catalog_signing_region` — The AWS region used for SigV4 signing (e.g., `us-west-2`).
- `rest_catalog_signing_name` — The service name used in SigV4 signing (typically `glue` or `s3`).
- `use_environment_credentials` — Defaults to `true`. When enabled, Timeplus uses environment-based credentials such as IAM roles or environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`). Set this to `false` when using local MinIO or a public S3 bucket.
- `credential` — A unified credential in `username:password` format (for example, AWS access key and secret key). Used for both catalog and storage if they share the same authentication.
- `catalog_credential` — Optional. Use when the catalog requires credentials different from the storage layer.
- `storage_credential` — Optional. Use when the storage backend (e.g., S3 or MinIO) requires separate credentials.

### Example: AWS Glue REST Catalog

```sql
CREATE DATABASE demo
SETTINGS
    type='iceberg',
    catalog_type='rest',
    catalog_uri='https://glue.us-west-2.amazonaws.com/iceberg',
    warehouse='aws-12-id',
    storage_endpoint='https://the-bucket.s3.us-west-2.amazonaws.com',
    rest_catalog_sigv4_enabled=true,
    rest_catalog_signing_region='us-west-2',
    rest_catalog_signing_name='glue';
```

**Explanation**:
- This example connects Timeplus to an **AWS Glue REST-based Iceberg catalog**.
- `rest_catalog_sigv4_enabled=true` ensures secure communication using AWS SigV4 signing.
- The `warehouse` value identifies the Iceberg warehouse managed by Glue.
- The `storage_endpoint` points to the S3 bucket where the Iceberg table data resides.

### Example: AWS S3 Table REST Catalog

```sql
CREATE DATABASE demo
SETTINGS
    type='iceberg',
    catalog_type='rest',
    catalog_uri='https://glue.us-west-2.amazonaws.com/iceberg',
    warehouse='aws-12-id:s3tablescatalog/bucket-name',
    rest_catalog_sigv4_enabled=true,
    rest_catalog_signing_region='us-west-2',
    rest_catalog_signing_name='glue';
```

**Explanation**:
- This example configures an **AWS S3 Table REST Catalog** for Iceberg in Timeplus.
- The warehouse setting specifies the Glue catalog and S3 bucket location.
- `rest_catalog_sigv4_enabled=true` enables secure communication with AWS using SigV4 signing.
- To **create new Iceberg tables** directly from Timeplus, you can also set: `storage_credential='https://s3tables.us-west-2.amazonaws.com/bucket-name';`

### Example: Amazon S3 Tables REST Catalog

Instead of going through Glue, you can connect to the [Amazon S3 Tables](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables.html) Iceberg REST endpoint directly.

```sql
CREATE DATABASE lake
SETTINGS
    type='iceberg',
    catalog_type='rest',
    catalog_uri='https://s3tables.us-west-2.amazonaws.com/iceberg',
    warehouse='arn:aws:s3tables:us-west-2:123456789012:bucket/my-table-bucket',
    rest_catalog_sigv4_enabled=true,
    rest_catalog_signing_region='us-west-2',
    rest_catalog_signing_name='s3tables';
```

**Explanation**:
- `catalog_uri` is the regional S3 Tables Iceberg REST endpoint, `https://s3tables.<region>.amazonaws.com/iceberg`.
- `warehouse` is the ARN of the S3 table bucket. The database name (`lake`) must be an existing namespace in that table bucket.
- `rest_catalog_signing_name='s3tables'` signs catalog requests for the S3 Tables service.
- Credentials are read from the environment: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and, for temporary credentials, `AWS_SESSION_TOKEN`.

:::warning Known issues
Writing to S3 Tables does not work yet on Timeplus Proton 3.0.29; the fixes are tracked in [timeplus-io/proton#1221](https://github.com/timeplus-io/proton/issues/1221):
- S3 Tables rejects the `Keep-Alive` header Timeplus sends on data file uploads.
- The catalog commit request sends the `Host` header twice, which S3 Tables rejects with HTTP 400.
- Committed metadata paths contain `//`.
- Parquet files are written without Iceberg field IDs, so PyIceberg refuses the table and DuckDB reads every column as NULL.

Until the last fix ships, tables written by Timeplus can be made readable by setting the table property `schema.name-mapping.default` to a JSON list that maps each column name to its Iceberg field ID, for example with PyIceberg:

```python
import json

table = catalog.load_table("lake.my_table")  # a pyiceberg catalog for the same table bucket
mapping = [{"field-id": f.field_id, "names": [f.name]} for f in table.schema().fields]
table.transaction().set_properties({"schema.name-mapping.default": json.dumps(mapping)}).commit_transaction()
```
:::

### Example: Apache Gravitino REST Catalog

```sql
CREATE DATABASE demo
SETTINGS
    type='iceberg',
    catalog_type='rest',
    catalog_uri='http://127.0.0.1:9001/iceberg/',
    warehouse='s3://mybucket/demo/gravitino1',
    storage_endpoint='https://the-bucket.s3.us-west-2.amazonaws.com';
```

**Explanation**:
- This example connects Timeplus to an **Apache Gravitino Iceberg REST Catalog**.
- The `catalog_uri` points to the running Gravitino REST service.
- The `warehouse` specifies the S3 path where Iceberg tables are stored.
- The `storage_endpoint` defines the S3-compatible storage endpoint.

**Sample Gravitino Configuration**

Below is an example configuration file for Gravitino Iceberg REST Server 0.9.0:

```properties
# conf/gravitino-iceberg-rest-server.conf
gravitino.iceberg-rest.catalog-backend = memory

gravitino.iceberg-rest.warehouse = s3://mybucket/demo/gravitino1
gravitino.iceberg-rest.io-impl = org.apache.iceberg.aws.s3.S3FileIO

gravitino.iceberg-rest.s3-endpoint = https://s3.us-west-2.amazonaws.com
gravitino.iceberg-rest.s3-region = us-west-2
gravitino.iceberg-rest.credential-provider-type = s3-secret-key
gravitino.iceberg-rest.s3-access-key-id = theaccesskeyid
gravitino.iceberg-rest.s3-secret-access-key = thesecretaccesskey
```

**Explanation**:
- `catalog-backend=memory` stores catalog metadata in-memory (useful for testing).
- `warehouse` and `io-impl` specify where and how data is stored in S3.
- `s3-endpoint` and `s3-region` define the AWS region and endpoint.
- `credential-provider-type` and the access keys provide authentication for S3 access.

## Create Iceberg Stream 

```sql
-- Create a Iceberg stream under the Iceberg database
CREATE STREAM <iceberg_database>.<stream_name> (
  -- column definitions 
);
```

**Example**: 

```sql
CREATE STREAM demo.transformed (
  timestamp datetime64,
  org_id string,
  float_value float,
  array_length int,
  max_num int,
  min_num int
);
```

After creating an Iceberg database in Timeplus, you can list existing tables or create new ones directly via SQL.

## Writing to Iceberg

You can insert data directly via `INSERT INTO` SQL statement or continuously write to Iceberg streams using materialized views:

**Example**:

```sql
CREATE MATERIALIZED VIEW sink_to_iceberg_mv INTO demo.transformed AS
SELECT 
  now() AS timestamp,
  org_id,
  float_value,
  length(array_of_records.a_num) AS array_length,
  array_max(array_of_records.a_num) AS max_num,
  array_min(array_of_records.a_num) AS min_num
FROM msk_stream_read
SETTINGS s3_min_upload_file_size=1024;
```

This example continuously writes transformed data from a streaming source (`msk_stream_read`) into an Iceberg table.

## Reading from Iceberg

You can query Iceberg data in Timeplus using standard SQL syntax:
```sql
SELECT ... FROM <iceberg_database>.<iceberg_stream>;
```

:::info
Iceberg streams in Timeplus behave like static tables — queries return the full result set and then terminate.

For large tables, it’s recommended to include a LIMIT clause to avoid excessive data loading.

In future releases, **continuous streaming query support** for Iceberg streams will be added, allowing real-time incremental reads from Iceberg data.
:::

**Example**:
```sql
SELECT count() FROM iceberg_db.table_name;
```

You can also use **SparkSQL** to validate or analyze Iceberg data created by Timeplus.
Depending on your catalog setup, use one of the following configurations:

**For AWS Glue REST Catalog**:

```bash
spark-sql --packages org.apache.iceberg:iceberg-spark-runtime-3.4_2.12:1.7.1,org.apache.iceberg:iceberg-aws-bundle:1.7.1,software.amazon.awssdk:bundle:2.30.2,software.amazon.awssdk:url-connection-client:2.30.2 \
  --conf spark.sql.defaultCatalog=spark_catalog \
  --conf spark.sql.catalog.spark_catalog.type=rest \
  --conf spark.sql.catalog.spark_catalog.uri=https://glue.us-west-2.amazonaws.com/iceberg \
  --conf spark.sql.catalog.spark_catalog.warehouse=$AWS_12_ID \
  --conf spark.sql.catalog.spark_catalog.rest.sigv4-enabled=true \
  --conf spark.sql.catalog.spark_catalog.rest.signing-name=glue \
  --conf spark.sql.catalog.spark_catalog.rest.signing-region=us-west-2
```

**For Apache Gravitino REST Catalog**:

```bash
spark-sql -v --packages org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.8.1,org.apache.iceberg:iceberg-aws-bundle:1.8.1,software.amazon.awssdk:bundle:2.30.2,software.amazon.awssdk:url-connection-client:2.30.2 \
  --conf spark.sql.defaultCatalog=spark_catalog \
  --conf spark.sql.catalog.spark_catalog.type=rest \
  --conf spark.sql.catalog.spark_catalog.uri=http://127.0.0.1:9001/iceberg/ \
  --conf spark.sql.catalog.spark_catalog.warehouse=s3://mybucket/demo/gravitino1
```


## Dropping Iceberg Database

To remove an Iceberg database from Timeplus:

```sql
DROP DATABASE <iceberg_database> CASCADE;
```

:::info
This command deletes metadata within Timeplus, **but does not remove data** from the Iceberg catalog or the underlying S3 storage.
:::
