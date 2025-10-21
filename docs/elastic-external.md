# Elasticsearch 

Leveraging HTTP external stream, you can write data to Elastic Search or Open Search directly from Timeplus.

## Write to OpenSearch / Elasticsearch {#example-write-to-es}

Assuming you have created an index `students` in a deployment of OpenSearch or ElasticSearch, you can create the following external stream to write data to the index.

```sql
CREATE EXTERNAL STREAM opensearch_t1 (
  name string,
  gpa float32,
  grad_year int16
) SETTINGS
type = 'http',
data_format = 'OpenSearch', --can also use the alias "ElasticSearch"
url = 'https://opensearch.company.com:9200/students/_bulk',
username='admin',
password='..'
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO opensearch_t1(name,gpa,grad_year) VALUES('Jonathan Powers',3.85,2025);
```
