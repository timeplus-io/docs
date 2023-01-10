# 已知问题和限制

We continuously improve the product. 请注意以下已知问题和限制。

## UI

* 您可以使用移动浏览器注册Timeplus云。 但只支持Microsoft Edge或Google Chrome 桌面浏览器才能使用 Timeplus 控制台。
* 同一工作区的用户将看到所有活动历史和定义，例如视图、 告警、 仪表盘。

## 后端

* 当您定义一个流或实际化视图时，您应该避免使用 `window_start` 和 `window end` 作为列名称。 这将与 `window start` and `window end` 的动态列名称 `tumble` `hop`, `session` 窗口 这将与 `window start` and `window end` 的动态列名称 `tumble` `hop`, `session` 窗口 您可以创建别名，同时创建物化视图，例如 `select window_start as windowStart, window_end as windowEnd, count(*) as cnt from tumble(stream,10s) group by window_start, window_end`
* You can save JSON documents either in `string` or `json` column types. `string` type accepts any JSON schema or even invalid JSON. It also works well with dynamic schema, e.g. `{"type":"a","payload":{"id":1,"attr1":0.1}}` and  `{"type":"b","payload":{"id":"2","attr2":true}}` While the `json` column type works best with fixed JSON schema, with better query performance and more efficient storage. For the above example, it will try to change the data type to support existing data. `payload.id` will be in `int` since the first event is `1`. Then it will change to `string`, to support both `1` and `"2"`. If you define the column as `json`, running non-streaming query for the dataset will get a `string` type for `payload.id` However data type cannot be changed during the execution of streaming queries. If you run `SELECT col.payload.id as id FROM json_stream` and insert `{.."payload":{"id":1..}` the first column in the streaming query result will be in `int`. Then if the future event is `{.."payload":{"id":"2"..}`, we cannot dynamically change this column from `int` to `string`, thus the streaming query will fail. In short, both `string` and `json` work great for non-streaming query. If the JSON documents with dynamic schema, it's recommended to define the column in `string` type.