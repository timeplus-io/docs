## Overview 

[Apache Iceberg](https://iceberg.apache.org/) is an open table format for large-scale analytic datasets, designed for high performance and reliability. It provides an open, vendor-neutral solution that supports multiple engines, making it ideal for various analytics workloads. Initially, the Iceberg ecosystem was primarily built around Java, but with the increasing adoption of the REST catalog specification, Timeplus is among the first vendors to integrate with Iceberg purely in C++. This allows Timeplus users to stream data to Iceberg with a high performance, low memory footprint, and easy installation without relying on Java dependencies.

Since Timeplus Proton 1.7(to be released soon) and [Timeplus Enterprise 2.8](/enterprise-v2.8), we provide native support for Apache Iceberg as a new database type. This allows you to read and write data using the Apache Iceberg open table format, with support for the Iceberg REST Catalog (IRC). In the initial release, we focused on writing data to Iceberg, with basic query optimization for reading data from Iceberg. The integration with Amazon S3, [AWS Glue's Iceberg REST endpoint](https://docs.aws.amazon.com/glue/latest/dg/connect-glu-iceberg-rest.html) and [the Apache Gravitino Iceberg REST Server](https://gravitino.apache.org/docs/0.8.0-incubating/iceberg-rest-service) are validated. More REST catalog implementations are planned.

## Key Benefits for Timeplus Iceberg Integration

- Using Timeplus materialized views, users can continuously process and transform streaming data (from Apache Kafka for example) and write to the cost-effective object storage in Apache Iceberg open table format.
- Apache Iceberg's open table format ensures you're never locked into a single vendor or query engine
- Query your Iceberg tables with multiple engines including Timeplus, Apache Spark, Apache Flink, ClickHouse, DuckDB, and AWS Athena
- Future-proof your data architecture with broad industry support and an active open-source community

## Create Iceberg Database {#syntax}

To create an Iceberg database in Timeplus, use the following syntax:

```sql
CREATE DATABASE <database_name>
SETTINGS
          type='iceberg',
          catalog_uri='<catalog_uri>',
          catalog_type='rest',
          warehouse='<warehouse_path>',
          storage_endpoint='<s3_endpoint>',
          rest_catalog_sigv4_enabled=<true|false>,
          rest_catalog_signing_region='<region>',
          rest_catalog_signing_name='<service_name>',
          use_environment_credentials=<true|false>,
          credential='<username:password>',
          catalog_credential='<username:password>',
          storage_credential='<username:password>';
```

### DDL Settings {#settings}

- `type` – Specifies the type of the database. Be sure to use `iceberg` for Iceberg tables.
- `catalog_uri` – Specifies the URI of the Iceberg catalog.
- `catalog_type` – Specifies the catalog type. Currently, only `rest` is supported in Timeplus.
- `warehouse` – The Iceberg warehouse identifier where the table data is stored.
- `storage_endpoint` – The S3-compatible endpoint where the data is stored. For AWS S3, use `https://bucketname.s3.region.amazonaws.com`.
- `rest_catalog_sigv4_enabled` – Enables AWS SigV4 authentication for secure catalog communication.
- `rest_catalog_signing_region` – AWS region used for signing the catalog requests.
- `rest_catalog_signing_name` – The service name used in AWS SigV4 signing.
- `use_environment_credentials` – Default to true, Timeplus will use environment-based credentials, useful for cases where Timeplus runs in an AWS EC2 instance with an assigned IAM role, or AWS credentials in environment variables as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Setting this to false if you are using local minio or public S3 bucket.
- `credential` – A unified credential (username:password format) that applies to both catalog and storage if they share the same authentication (e.g. AWS access key and secret key).
- `catalog_credential` – If the catalog requires a separate credential, specify it here.
- `storage_credential` – If the storage (e.g. S3) requires a different credential, specify it separately.

### Example: AWS Glue REST Catalog {#example_glue}

```sql
CREATE DATABASE demo
SETTINGS  type='iceberg',
          catalog_uri='https://glue.us-west-2.amazonaws.com/iceberg',
          catalog_type='rest',
          warehouse='(aws-12-id)',
          storage_endpoint='https://the-bucket.s3.us-west-2.amazonaws.com',
          rest_catalog_sigv4_enabled=true,
          rest_catalog_signing_region='us-west-2',
          rest_catalog_signing_name='glue';
```

### Example: AWS S3 Table REST Catalog {#example_s3table}

```sql
CREATE DATABASE demo
SETTINGS  type='iceberg',
          catalog_uri='https://glue.us-west-2.amazonaws.com/iceberg',
          catalog_type='rest',
          warehouse='(aws-12-id):s3tablescatalog/(bucket-name)',
          rest_catalog_sigv4_enabled=true,
          rest_catalog_signing_region='us-west-2',
          rest_catalog_signing_name='glue';
```

If you want to create new Iceberg tables from Timeplus, you can also set `storage_credential` to `'https://s3tables.us-west-2.amazonaws.com/(bucket-name)'`.

### Example: Apache Gravitino REST Catalog {#example_gravitino}

```sql
CREATE DATABASE demo
SETTINGS  type='iceberg',
          catalog_uri='http://127.0.0.1:9001/iceberg/',
          catalog_type='rest',
          warehouse='s3://mybucket/demo/gravitino1',
          storage_endpoint='https://the-bucket.s3.us-west-2.amazonaws.com';
```

#### Gravitino Configuration
Here is the sample configuration for Gravitino Iceberg REST Server 0.9.0:

```properties
# conf/gravitino-iceberg-rest-server.conf
gravitino.iceberg-rest.catalog-backend = memory

gravitino.iceberg-rest.warehouse = s3://mybucket/demo/gravitino1
gravitino.iceberg-rest.io-impl= org.apache.iceberg.aws.s3.S3FileIO

gravitino.iceberg-rest.s3-endpoint = https://s3.us-west-2.amazonaws.com
gravitino.iceberg-rest.s3-region = us-west-2
gravitino.iceberg-rest.credential-provider-type = s3-secret-key
gravitino.iceberg-rest.s3-access-key-id = theaccesskeyid
gravitino.iceberg-rest.s3-secret-access-key = thesecretaccesskey
```

## Creating and Writing to an Iceberg Table {#create_table}

Once the Iceberg database is created in Timeplus, you can list existing tables in the database or create new table via Timeplus SQL:

```sql
-- Make sure to create the table under the iceberg database
CREATE STREAM demo.transformed(
  timestamp datetime64,
  org_id string,
  float_value float,
  array_length int,
  max_num int,
  min_num int
);
```

## Writing to Iceberg via a Materialized View {#write_via_mv}
You can run `INSERT INTO` statements to write data to Iceberg tables, or set up a materialized view to continuously write data to Iceberg tables.

```sql
CREATE MATERIALIZED VIEW mv_write_iceberg INTO demo.transformed AS
SELECT now() AS timestamp, org_id, float_value,
       length(`array_of_records.a_num`) AS array_length,
       array_max(`array_of_records.a_num`) AS max_num,
       array_min(`array_of_records.a_num`) AS min_num
FROM msk_stream_read
SETTINGS s3_min_upload_file_size=1024;
```

## Querying Iceberg Data with SparkSQL {#query_iceberg}

### Using SQL in Timeplus {#query_timeplus}
You can query Iceberg data in Timeplus by:
```sql
SELECT * FROM demo.transformed
```
This will return all results and terminate the query. No streaming mode is supported for Iceberg tables yet. It's recommended to set `LIMIT` to a small value to avoid loading too much data from Iceberg to Timeplus.

```sql
SELECT count() FROM iceberg_db.table_name;
```
This query is optimized to return the count of rows in the specified Iceberg table with minimal scanning of metadata and data files.

### Using SparkSQL {#query_sparksql}

Depending on whether you setup the catalog via AWS Glue or Apache Gravitino, you can also start a SparkSQL session to query or insert data into Iceberg tables.

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

```bash
spark-sql -v --packages org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.8.1,org.apache.iceberg:iceberg-aws-bundle:1.8.1,software.amazon.awssdk:bundle:2.30.2,software.amazon.awssdk:url-connection-client:2.30.2 \
--conf spark.sql.defaultCatalog=spark_catalog \
--conf spark.sql.catalog.spark_catalog.type=rest \
--conf spark.sql.catalog.spark_catalog.uri=http://127.0.0.1:9001/iceberg/ \
--conf spark.sql.catalog.spark_catalog.warehouse=s3://mybucket/demo/gravitino1
```

## Drop Iceberg Database

```sql
DROP DATABASE demo CASCADE;
```

Please note this won't delete the data in catalog or S3 storage.

## Limitations
- As of March 2025, only the REST catalog is supported.
- Verified to work with AWS S3 for data storage. Other S3-compatible storages may work but are unverified.
