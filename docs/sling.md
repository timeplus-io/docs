# Load MySQL/Postgres/CSV/S3 to Timeplus via Sling CLI

[Sling](https://slingdata.io/) is a powerful data integration CLI tool. Whether ingesting CSV or JSON files, transferring data between databases, or exporting a custom SQL query to a Parquet file — Sling is the solution that empowers you to achieve it effortlessly.

Since from [v1.2.14](https://github.com/slingdata-io/sling-cli/releases/tag/v1.2.14), Sling adds built-in support for Timeplus. You just need a single binary for your OS to load any data to Timeplus, with a simple command such as:
```bash
cat my_file.csv | sling run --tgt-conn TIMEPLUS --tgt-object default.my_stream
```

## Supported Sources

Sling supports many databases and storage systems. Data in those systems can be imported to Timeplus.

### Databases
[ClickHouse](https://docs.slingdata.io/connections/database-connections/clickhouse)
, [DuckDB](https://docs.slingdata.io/connections/database-connections/duckdb)
, [Google BigQuery](https://docs.slingdata.io/connections/database-connections/bigquery)
, [Google BigTable](https://docs.slingdata.io/connections/database-connections/bigtable)
, [MariaDB](https://docs.slingdata.io/connections/database-connections/mariadb)
, [MongoDB](https://docs.slingdata.io/connections/database-connections/mongodb)
, [MotherDuck](https://docs.slingdata.io/connections/database-connections/motherduck)
, [MySQL](https://docs.slingdata.io/connections/database-connections/mysql)
, [Oracle](https://docs.slingdata.io/connections/database-connections/oracle)
, [PostgreSQL](https://docs.slingdata.io/connections/database-connections/postgres)
, [Prometheus](https://docs.slingdata.io/connections/database-connections/prometheus)
, [Redshift](https://docs.slingdata.io/connections/database-connections/redshift)
, [Snowflake](https://docs.slingdata.io/connections/database-connections/snowflake)
, [SQL Server](https://docs.slingdata.io/connections/database-connections/sqlserver)
, [SQLite](https://docs.slingdata.io/connections/database-connections/sqlite)
, [StarRocks](https://docs.slingdata.io/connections/database-connections/starrocks)
, [Trino](https://docs.slingdata.io/connections/database-connections/trino)

### Storage Systems

[Amazon S3](https://docs.slingdata.io/connections/file-connections/s3)
, [Azure Storage](https://docs.slingdata.io/connections/file-connections/azure)
, [Cloudflare R2](https://docs.slingdata.io/connections/file-connections/r2)
, [DigitalOcean Spaces](https://docs.slingdata.io/connections/file-connections/dospaces)
, [FTP](https://docs.slingdata.io/connections/file-connections/ftp)
, [Google Storage](https://docs.slingdata.io/connections/file-connections/gs)
, [Local File System](https://docs.slingdata.io/connections/file-connections/local)
, [Mini IO](https://docs.slingdata.io/connections/file-connections/minio)
, [SFTP](https://docs.slingdata.io/connections/file-connections/sftp)
, [Wasabi](https://docs.slingdata.io/connections/file-connections/wasabi)

## Install Sling
Similar to Timeplus, Sling is a single binary, running natively on the OS without Java/Docker. Installing it is easy:

Mac:
```bash
brew install slingdata-io/sling/sling
```

Windows:
```bash
scoop bucket add sling https://github.com/slingdata-io/scoop-sling.git
scoop install sling
```

Linux:
```bash
curl -LO 'https://github.com/slingdata-io/sling-cli/releases/latest/download/sling_linux_amd64.tar.gz' \
  && tar xf sling_linux_amd64.tar.gz \
  && rm -f sling_linux_amd64.tar.gz \
  && chmod +x sling
```

You can also run it via Docker:
```bash
docker pull slingdata/sling

docker run --rm -i slingdata/sling --help
```

## Configure Sling to connect to Timeplus

Sling looks for connections and credentials in several places:
* Environment variables
* Sling env file (located at ~/.sling/env.yaml)
* [dbt](https://www.getdbt.com/) profiles files (located at ~/.dbt/profiles.yml)

For example, to setup a connection to your local Timeplus, as well as a connection to a local postgres, you can set `~/.sling/env.yaml`:
```yaml
connections:
  PG_EXAMPLE:
    type: postgres
    host: localhost
    port: 5432
    user: postgres
  TIMEPLUS:
    type: proton
    host: localhost
    port: 8463
    user: default
    database: default
```

## Sync tables from Postgres to Timeplus
Sling allows to load all tables or specific tables from a database to Timeplus. Please create a yaml file, say `pg2tp.yml`:
```yaml
source: PG_EXAMPLE
target: TIMEPLUS

defaults:
  object: default.{stream_schema}_{stream_table}
  mode: full-refresh
streams:
  inventory.*:
```

Then run `sling run -r pg2tp.yml`. This will load all tables from the inventory schema, create the streams in Timeplus if they don't exist and load all records.

You can also specify the table names, or set a SQL with filter condition, e.g.
```yaml
source: PG_EXAMPLE
target: TIMEPLUS

defaults:
  object: default.{stream_schema}_{stream_table}
  mode: full-refresh
streams:
  inventory.customers:
  inventory.spatial_ref_sys:
     sql: |
       select * from inventory.spatial_ref_sys limit 3500
```

Please check [Sling docs](https://docs.slingdata.io/sling-cli/run/configuration/replication) for more details.
