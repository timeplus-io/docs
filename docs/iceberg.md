# Iceberg Integration

[Apache Iceberg](https://iceberg.apache.org/) is an open table format for large-scale analytic datasets, designed for high performance and reliability. It provides an open, vendor-neutral solution that supports multiple engines, making it ideal for various analytics workloads. Initially, the Iceberg ecosystem was primarily built around Java, but with the increasing adoption of the REST catalog specification, Timeplus is among the first vendors to integrate with Iceberg purely in C++. This allows Timeplus to achieve high performance, low memory footprint, and easy installation without relying on Java dependencies.

Since Timeplus Proton 1.7 and Timeplus Enterprise 2.8, we provide native support for Iceberg as an external database engine. This allows you to read and write data using the Iceberg format, with support for the REST catalog. In the initial release, we support [the AWS Glue's Iceberg REST endpoint](https://docs.aws.amazon.com/glue/latest/dg/connect-glu-iceberg-rest.html) and [the Apache Gravitino Iceberg REST Server](https://gravitino.apache.org/docs/0.8.0-incubating/iceberg-rest-service). More REST catalog implementations are planned.

## Use Cases

**Data Lakehouse**

Iceberg allows users to manage streaming and batch data together in a single lakehouse, supporting fast queries and schema evolution.

**Streaming ETL**

Using Timeplus materialized views, users can continuously process and transform streaming data before writing to Iceberg.

**Cost Optimization**

Since Iceberg allows for time travel and incremental data management, it reduces data duplication and storage costs in cloud environments.

## CREATE DATABASE {#syntax}

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

### DDL Settings {#settings}

- `catalog_type` – Specifies the catalog type. Currently, only `rest` is supported in Timeplus.
- `warehouse` – The Iceberg warehouse identifier where the table data is stored.
- `storage_endpoint` – The S3-compatible endpoint where the data is stored.
- `rest_catalog_sigv4_enabled` – Enables AWS SigV4 authentication for secure catalog communication.
- `rest_catalog_signing_region` – AWS region used for signing the catalog requests.
- `rest_catalog_signing_name` – The service name used in AWS SigV4 signing.

### Example: AWS Glue REST Catalog {#example_glue}

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

### Example: Apache Gravitino REST Catalog {#example_gravitino}

```sql
CREATE DATABASE demo
ENGINE = Iceberg('http://127.0.0.1:9001/iceberg/')
SETTINGS  catalog_type='rest',
          warehouse='s3://mybucket/demo/gravitino1',
          storage_endpoint='https://s3.us-west-2.amazonaws.com';
```

#### Gravitino Configuration
Here is the sample configuration for Gravitino Iceberg REST Server 0.7.0:

```properties
# conf/gravitino-iceberg-rest-server.conf
gravitino.iceberg-rest.catalog-backend = jdbc
gravitino.iceberg-rest.catalog-backend-name = public
gravitino.iceberg-rest.jdbc-driver = org.postgresql.Driver
gravitino.iceberg-rest.uri = jdbc:postgresql://abc.aivencloud.com:28851/defaultdb?ssl=require
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
This will return all results and terminate the query. No streaming mode is supported for Iceberg tables yet.

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

## DROP DATABASE

```sql
DROP DATABASE [IF EXISTS] demo;
```

Please note this won't delete the data in catalog or S3 storage.

## Limitations
- As of March 2025, only the REST catalog is supported.
- Verified to work with AWS S3 for data storage. Other S3-compatible storages may work but are unverified.
