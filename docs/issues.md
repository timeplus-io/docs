# Known Issues and Limitations

We continuously improve the product. Please be aware of the following known issues and limitations.

## UI

* You can use mobile browser to sign up for Timeplus Cloud. But only Google Chrome desktop browser is supported to use the Timeplus Console. 
* Users in the same workspace will see all activity history and definitions, such as views, sinks, dashboards.

## Backend

* When you define a stream or a materialized view, you should avoid using `window_start` and `window_end` as the column names. This will conflict with the dynamic column names `window_start` and `window_end` for `tumble`, `hop`, `session` windows. You can create alias while creating materialized views, e.g. `select window_start as windowStart, window_end as windowEnd, count(*) as cnt from tumble(stream,10s) group by window_start, window_end`
* You can save JSON documents either in `string` or `json` column types. `string` type accepts any JSON schema or even invalid JSON. It also works well with dynamic schema, e.g. `{"type":"a","payload":{"id":1,"attr1":0.1}}` and  `{"type":"b","payload":{"id":"2","attr2":true}}` While the `json` column type works best with fixed JSON schema, with better query performance and more efficient storage. For the above example, it will try to change the data type to support existing data. `payload.id` will be in `int` since the first event is `1`. Then it will change to `string`, to support both `1` and `"2"`. If you define the column as `json`, running non-streaming query for the dataset will get a `string` type for `payload.id` However data type cannot be changed during the execution of streaming queries. If you run `SELECT col.payload.id as id FROM json_stream` and insert `{.."payload":{"id":1..}` the first column in the streaming query result will be in `int`. Then if the future event is `{.."payload":{"id":"2"..}`, we cannot dynamically change this column from `int` to `string`, thus the streaming query will fail. In short, both `string` and `json` work great for non-streaming query. If the JSON documents with dynamic schema, it's recommended to define the column in `string ` type.