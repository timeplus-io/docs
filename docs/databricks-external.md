# Databricks 

Leveraging HTTP external stream, you can write / materialize data to Databricks directly from Timeplus.

## Write to Databricks {#example-write-to-databricks}

Follow [the guide](https://docs.databricks.com/aws/en/dev-tools/auth/pat) to create an access token for your Databricks workspace.

Assume you have created a table in Databricks SQL warehouse with 2 columns:
```sql
CREATE TABLE sales (
  product STRING,
  quantity INT
);
```

Create the HTTP external stream in Timeplus:
```sql
CREATE EXTERNAL STREAM http_databricks_t1 (product string, quantity int)
SETTINGS
type = 'http',
http_header_Authorization='Bearer $TOKEN',
url = 'https://$HOST.cloud.databricks.com/api/2.0/sql/statements/',
data_format = 'Template',
format_template_resultset_format='{"warehouse_id":"$WAREHOUSE_ID","statement": "INSERT INTO sales (product, quantity) VALUES (:product, :quantity)", "parameters": [${data}]}',
format_template_row_format='{ "name": "product", "value": ${product:JSON}, "type": "STRING" },{ "name": "quantity", "value": ${quantity:JSON}, "type": "INT" }',
format_template_rows_between_delimiter=''
```

Replace the `TOKEN`, `HOST`, and `WAREHOUSE_ID` to match your Databricks settings. Also change `format_template_row_format` and `format_template_row_format` to match the table schema.

Then you can insert data via a materialized view or just via `INSERT` command:
```sql
INSERT INTO http_databricks_t1(product, quantity) VALUES('test',95);
```

This will insert one row per request. We plan to support batch insert and Databricks specific format to support different table schemas in the future.


