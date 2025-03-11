# Iceberg Integration

Apache Iceberg is an open table format for large-scale analytics, designed for high performance and reliability. It provides an open, vendor-neutral solution that supports multiple query engines, making it ideal for various analytics workloads. Initially, the Iceberg ecosystem was primarily built around Java, but with the increasing adoption of the REST catalog specification, Timeplus is among the first vendors to integrate with Iceberg purely in C++. This allows Timeplus to achieve high performance, low memory footprint, and easy installation without relying on Java dependencies.

In Timeplus Proton and Timeplus Enterprise, we provide native support for Iceberg as an external database engine. This allows you to read and write data using the Iceberg format, with support for the REST catalog. In March 2025, we have verified compatibility with AWS Glue REST Catalog and anticipate support for other REST catalog implementations such as Apache Gravitino.

## Use Cases

### Data Lakehouse

Iceberg allows users to manage streaming and batch data together in a single lakehouse, supporting fast queries and schema evolution.

### Streaming ETL

Using Timeplus materialized views, users can continuously process and transform streaming data before writing to Iceberg.

### Cost Optimization

Since Iceberg allows for time travel and incremental data management, it reduces data duplication and storage costs in cloud environments.

## CREATE DATABASE Syntax

To create an Iceberg database in Timeplus, use the following general syntax:

```sql
CREATE DATABASE <database_name>
ENGINE = Iceberg('<catalog_url>')
SETTINGS  catalog_type='rest',
          warehouse='<warehouse_path>',
          storage_endpoint='<s3_endpoint>',
          rest_catalog_sigv4_enabled=<true|false>,
          rest_catalog_signing_region='<region>',
          rest_catalog_signing_name='<service_name>';
```

### Explanation of Settings

- `catalog_type` – Specifies the catalog type. Currently, only `rest` is supported in Timeplus.
- `warehouse` – The Iceberg warehouse identifier where the table data is stored.
- `storage_endpoint` – The S3-compatible endpoint where the data is stored.
- `rest_catalog_sigv4_enabled` – Enables AWS SigV4 authentication for secure catalog communication.
- `rest_catalog_signing_region` – AWS region used for signing the catalog requests.
- `rest_catalog_signing_name` – The service name used in AWS SigV4 signing.

## Example: AWS Glue REST Catalog

```sql
CREATE DATABASE demo
ENGINE = Iceberg('https://glue.us-west-2.amazonaws.com/iceberg')
SETTINGS  catalog_type='rest',
          warehouse='(aws-12-id)',
          storage_endpoint='https://the-bucket.s3.us-west-2.amazonaws.com',
          rest_catalog_sigv4_enabled=true,
          rest_catalog_signing_region='us-west-2',
          rest_catalog_signing_name='glue';
```

## Example: Apache Gravitino REST Catalog

```sql
CREATE DATABASE demo_gravitino
ENGINE = Iceberg('http://127.0.0.1:9001/iceberg/')
SETTINGS  catalog_type='rest',
          warehouse='s3://mybucket/demo/gravitino1',
          storage_endpoint='https://s3.us-west-2.amazonaws.com';
```

### Gravitino Configuration
```properties
gravitino.iceberg-rest.catalog-backend = jdbc
gravitino.iceberg-rest.catalog-backend-name = public
gravitino.iceberg-rest.jdbc-driver = org.postgresql.Driver
gravitino.iceberg-rest.uri = jdbc:postgresql://demo-timeplus.aivencloud.com:28851/defaultdb?ssl=require
gravitino.iceberg-rest.jdbc-user = avnadmin
gravitino.iceberg-rest.jdbc-password = thepassword
gravitino.iceberg-rest.jdbc-initialize = true

gravitino.iceberg-rest.warehouse = s3://mybucket/demo/gravitino1
gravitino.iceberg-rest.io-impl= org.apache.iceberg.aws.s3.S3FileIO

gravitino.iceberg-rest.s3-endpoint = https://s3.us-west-2.amazonaws.com
gravitino.iceberg-rest.s3-region = us-west-2
gravitino.iceberg-rest.credential-provider-type = s3-secret-key
gravitino.iceberg-rest.s3-access-key-id = theaccesskeyid
gravitino.iceberg-rest.s3-secret-access-key = thesecretaccesskey
```

## Creating and Writing to an Iceberg Table

```sql
CREATE STREAM transformed(
  timestamp datetime64,
  org_id string,
  float_value float,
  array_length int,
  max_num int,
  min_num int
);
```

## Writing to Iceberg via a Materialized View

```sql
CREATE MATERIALIZED VIEW mv_write_iceberg INTO iceberg.transformed AS
SELECT now() AS timestamp, org_id, float_value,
       length(`array_of_records.a_num`) AS array_length,
       array_max(`array_of_records.a_num`) AS max_num,
       array_min(`array_of_records.a_num`) AS min_num
FROM msk_stream_read
SETTINGS s3_min_upload_file_size=1024;
```

## Querying Iceberg Data with SparkSQL

### Using SparkSQL with AWS Glue REST Catalog
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

### Using SparkSQL with Apache Gravitino REST Catalog
```bash
spark-sql -v --packages org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.8.1,org.apache.iceberg:iceberg-aws-bundle:1.8.1,software.amazon.awssdk:bundle:2.30.2,software.amazon.awssdk:url-connection-client:2.30.2 \
--conf spark.sql.defaultCatalog=spark_catalog \
--conf spark.sql.catalog.spark_catalog.type=rest \
--conf spark.sql.catalog.spark_catalog.uri=http://127.0.0.1:9001/iceberg/ \
--conf spark.sql.catalog.spark_catalog.warehouse=s3://mybucket/demo/gravitino1
```
## DROP DATABASE

```sql
DROP DATABASE [IF EXISTS] demo;
```

## Limitations
- As of March 2025, only the REST catalog is supported.
- Verified to work with AWS Glue REST Catalog; other REST implementations (e.g., Apache Gravitino) may work but are unverified.
- Currently, only S3-compatible storage is supported for data storage.
