# 公开测试版 2

我们很高兴地启动Timeplus Cloud公开测试版的第二阶段。 与 [邀请制测试版1](public-beta-1)相比，大多数后端和前端更改都是递增增强。

我们将不时更新测试版，并在此页面列出关键的增强措施。

(2023年)

## 3/18

* Try out our new demo workspace, [https://demo.timeplus.cloud](https://demo.timeplus.cloud/), with built-in FinTech and GitHub live data and real-time dashboards. Sign up and get read-only access to this demo server.

* 增强
  * Simplified the `LATEST JOIN` syntax. No need to write `INNER LATEST JOIN`. [Learn more](query-syntax#latest-join).
  * For historical query with `tumble` window aggregation , if there is no event in a window, such window won't be in the results. To show empty window with default value(0 for numeric types and empty string for string), you can add `order by window_start with fill step <window_size>` .
  * Added the dependency check while deleting or renaming streams/views. If a stream or view is referred in other views, the system will show an error if you are about to delete the stream/view.
  * Added a background check to detect the possible dead-lock of UDF, to improve system stability.
  * Treat the webhook URL of Slack sink as credential.
  * Auto-cleanup recent query logs if there are too many (500+).
  * Enhanced the REST API: avoid getting statistics while listing streams or views; provide new API to get statistics for a stream or view; add more documentation/examples in the [REST API doc](https://docs.timeplus.com/rest).
  * Show the list of dashboards on home page.
  * Dashboard drop-down filter supports static options.
  * Support using Markdown in the dashboard descriptions.
  * Continuously enhanced the charting options and styles. For example, for bar charts, the labels on y-axis are no longer rotated to improve readability.
  * Refined the sink UI and separated the productional sinks and preview-stage sinks.
  * Added a Slack button on top-right corner to invite you to join our community slack.

## 3/6

* 新功能

  * You can add filters in dashboards. For example, view server status for the recent 5 minutes or recent 1 hour. [Learn more.](viz#filter)
  * Previously when you open a dashboard, you can resize panels, delete panels any time. Changes are saved automatically. While we are adding more features to the dashboard, we introduced the explicit view mode and edit mode.
  * (Experimental) You can further decorate your dashboard with panels with [Markdown](https://en.wikipedia.org/wiki/Markdown), which you can add styled text or even images. It is disabled by default. 如果您想试用此功能，请联系我们。
* 增强
  * Various enhancements for each chart type. [Learn more.](viz#chart)
  * Able to run [table()](functions#table) function for a view with streaming sql, e.g. `with c as(select col1,col2 from a_stream where b>0) select * from table(c)`  Please note the streaming SQL in the view cannot contain any aggregation. For example, you can define the field extract from a raw JSON stream as a view, then query the view either in streaming mode or in historical mode.
  * Introduce a new function `earliest_timestamp()` to return `1970-1-1 00:00:00`(UTC) You can also call this with `earliest_ts()`. A typical usage is `select * from stream where _tp_time>earliest_ts()` to list all data in the past and future. Again, the previous syntax `settings seek_to='earliest'` has been deprecated and will be removed soon.
  * You can also use `where _tp_time >..` multiple times in a query with JOIN/UNION, to time travel to different starting points for different streams.
  * To improve readability, you can use numeric literals with underscores, e.g. `select * from iot where age_second > 86_400`. Underscores `_` inside numeric literals are ignored.
  * Added a new [LATEST JOIN](query-syntax#latest-join) for streaming SQL. For two append-only streams, if you use `a LEFT INNER LATEST JOIN b on a.key=b.key`, any time when the key changes on either streams, the previous join result will be cancelled and a new result will be added.

## 2/17

* 新功能

  * [全局聚合](query-syntax#global) 现在支持亚秒级的输出间隔。  e.g. `select max(_tp_time),count(*),avg(speed_kmh) from car_live_data emit periodic 100ms`
  * 现在，您可以创建多个物化视图来将数据写入同一个流。 此功能的典型用法是在相同的原始数据上应用多个处理逻辑，然后发送到同一个数据流以获得聚合结果。 对于物化视图，Timeplus 会维护查询的状态，这将更适合长时间运行的查询和故障恢复。
  * (实验性) 在创建新流后，您可以选择直接在控制台界面中添加少量数据，而不用通过REST API或创建源。 如果您想试用此功能，请联系我们。
  * （实验性）Timeplus 后端添加了对CDC（[Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture)）的内置支持，用户界面将很快准备就绪。 您可以在不同的模式下创建数据流。 默认情况下，它是仅限追加的。 您也可以创建流来接受INSERT、UPDATE和DELETE从 [Debezium](https://debezium.io/) 的更改日志。 流式聚合结果将反映最新的数据变化。 如果您想试用此功能，请联系我们。

* 增强

  * 对于时间序列数据的可视化，您现在可以选择在格式选项卡中设置时间范围。
  * 条形图和柱状图类型组合在一起——只需在 “格式” 选项卡中设置水平或垂直图表样式即可。
  * 流列表页面显示最早和最新的事件时间，帮助您更好地了解每个数据流有多新鲜。
  * 如果你开始运行流式传输 SQL 然后转到 Timeplus 控制台中的另一个页面，查询将自动停止。 这将减少不必要的服务器工作量和并发查询的数量。
  * 提高了列表模式下查询结果的性能。
  * [外部流](working-with-streams#external_stream) 和 [物化视图](view#m_view)的性能调整。

## 2/3

* 查询页面增强功能
  * 显示查询是流式查询还是历史查询。
  * 显示基本查询指标，例如 EPS 和所用时间。 点击链接打开详细指标面板。
  * 查询运行时，查询选项卡上的绿点作为标识。
  * 查询页面现在可通过 URL 分享状态。 当您在编辑器中键入 SQL 时，它会成为 URL 的一部分。 将 URL 共享给其他人，可以在查询界面打开同一 SQL。
  * 对于包含长文本的列，您可以打开 “设置” 以打开 “自动换行文本” 模式。
  * 更清晰的显示各种查询失败情况下的错误信息。
* 可视化增强功能
  * 优化按钮和文本的布局。
  * 更好地支持历史查询。



## 1/20

* 查询结果的界面更新：
  * **无限滚动。 ** 对于流式查询和历史查询，较新的结果显示在底部。 您可以向上滚动查看之前的结果，然后单击底部的 **跳转到最新数据** 按钮继续查看最新结果。
  * **行详情**。 对于包含长文本或 JSON 的列，您可以单击 “眼睛” 按钮打开包含该行详细信息的侧面板。
  * **更新列摘要。 ** 对于数字列，列头中显示最小/最大/平均值。 数据范围是从查询开始到现在。 对于日期时间列，将显示起始/终止时间戳。 对于布尔列或字符串列，前 3 个值与百分比一起显示。
  * **快速筛选。 ** 您可以键入一些关键字来筛选结果，而无需重写 SQL。 它将对所有列执行简单的 `string#contains` 匹配。 暂不支持正则表达式或逻辑条件。
  * **显示/隐藏列。 ** 您可以通过新引入的 **设置** 按钮来隐藏某些列，而无需重写 SQL。 您也可以在此对话框中以 CSV 格式下载结果。
  * **调整列大小**. **调整列大小**. Timeplus 会根据列类型自动设置适当的初始列大小。 您可以随时通过拖放来调整列的大小。
* 更多图表类型和选项。 您可以选择折线图、面积图、柱形图、条形图、单值图和图表作为可视化类型。 每个图表都支持基本设置和高级设置。
* 一种内置 的针对JSON优化的数据类型，与将 JSON 另存为 `string` 并在查询时动态提取相比，查询性能更好。 适合于同一结构的 JSON 文档。 通过 `column.jsonpath` 访问该值（而不是用文本列的方式 `column:jsonpath` ）
* 我们开始弃用 `settings seek_to=..` 仍然支持时空旅行，你只需要在 WHERE 条件下使用 `_tp_time` 列，例如 `WHERE _tp_time>=now () -1h` 即可在 1 小时前进行时空旅行并显示此后的数据。 或者 `其中 _tp_time >= '2023-01-14'`  Timeplus 中的所有数据流都包含 `_tp_time` 作为事件时间。
* （实验性）除了 [Remote UDF](remote-udf)之外，现在你还可以使用 JavaScript 定义新函数。 支持标量函数和聚合函数。 请查看 [JS UDF](js-udf) 文档了解详细信息，如果您想尝试此操作，请联系我们。
