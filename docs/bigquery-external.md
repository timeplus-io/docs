# BigQuery 

Leveraging HTTP external stream, you can write / materialize data to BigQuery directly from Timeplus.

## Write to BigQuery {#example-write-to-bigquery}

Assume you have created a table in BigQuery with 2 columns:
```sql
create table `PROJECT.DATASET.http_sink_t1`(
    num int,
    str string);
```

Follow [the guide](https://cloud.google.com/bigquery/docs/authentication) to choose the proper authentication to Google Cloud, such as via the gcloud CLI `gcloud auth application-default print-access-token`.

Create the HTTP external stream in Timeplus:
```sql
CREATE EXTERNAL STREAM http_bigquery_t1 (num int,str string)
SETTINGS
type = 'http',
http_header_Authorization='Bearer $OAUTH_TOKEN',
url = 'https://bigquery.googleapis.com/bigquery/v2/projects/$PROJECT/datasets/$DATASET/tables/$TABLE/insertAll',
data_format = 'Template',
format_template_resultset_format='{"rows":[${data}]}',
format_template_row_format='{"json":{"num":${num:JSON},"str":${str:JSON}}}',
format_template_rows_between_delimiter=','
```

Replace the `OAUTH_TOKEN` with the output of `gcloud auth application-default print-access-token` or other secure way to obtain OAuth token. Replace `PROJECT`, `DATASET` and `TABLE` to match your BigQuery table path. Also change `format_template_row_format` to match the table schema.

Then you can insert data via a materialized view or just via `INSERT` command:
```sql
INSERT INTO http_bigquery_t1 VALUES(10,'A'),(11,'B');
```
