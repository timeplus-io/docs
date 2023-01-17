# 已知问题和限制

我们不断改进产品。 请注意以下已知问题和限制。

## UI

* 您可以使用移动浏览器注册Timeplus云。 但只支持Microsoft Edge或Google Chrome 桌面浏览器才能使用 Timeplus 控制台。
* 同一工作区的用户将看到所有活动历史和定义，例如视图、 告警、 仪表盘。

## 后端

* 当您定义一个流或实际化视图时，您应该避免使用 `window_start` 和 `window end` 作为列名称。 这将与 `window start` and `window end` 的动态列名称 `tumble` `hop`, `session` 窗口 这将与 `window start` and `window end` 的动态列名称 `tumble` `hop`, `session` 窗口 您可以创建别名，同时创建物化视图，例如 `select window_start as windowStart, window_end as windowEnd, count(*) as cnt from tumble(stream,10s) group by window_start, window_end`
* 你可以以 `string` 或 `json` 列类型保存 JSON 文档。 `string` 类型接受任何 JSON 甚至无效的 JSON文档。 它也很适合动态模式，如 `{"type":"a","payload":{"id":1,"totel1":0. }}` 和  `{"type":"b","payload":{"id":"2", tot2":true}}` 而 `json` 列类型最适合固定的 JSON 模式， 具有更好的查询性能和更有效的存储。 对于上面的示例，它将尝试动态调整数据类型以支持更新的数据。 `payload.id` 将会是 `int` ，因为第一粉数据是 `1`。 然后它会更改为 `string`, 以同时支持 `1` 和 `"2"`。 如果您将列定义为 `json`，则对数据集运行非流式处理查询将获得 `payload.id` 的 `string` 类型。但是，在执行流式查询期间无法更改数据类型。 如果您运行 `SELECT col.payload.id as id FROM json_stream` 并插入 `{.. "payload":{"id":1...}` 流查询结果中的第一列将是 `int` 类型。 然后如果未来事件是 `{.."payload":{"id":"2"..}`, 我们无法动态地将此列从 `int` 更改为 `string`因此流查询会失败。 简而言之， `string` 和 `json` 都非常适合非流式查询。 如果 JSON 文档使用动态数据结构，建议把改列定义为 `string` 类型。