# 公开测试版 2

我们很高兴地启动Timeplus Cloud公开测试版的第二阶段。 相比 [公开测试版1](public-beta-1)，大多数后端和前端更改都是递增式的。

我们将不定期地更新测试版，并在此页面列出关键的增强功能。

(2023年)

## 4/17

**流数据库和流式SQL**

* For stateful time window aggregations ([tumble](functions#tumble)/[hop](functions#hop)/[session](functions#session)), Timeplus now supports sub-second intervals: `ms` for milliseconds, `us` for microseconds, and `ns` for nanoseconds. For example, you can run a streaming SQL to show results every 10 milliseconds for the past 1 second sliding window: `select window_start, stock, avg(price) from hop(stocks,10ms,1s) group by window_start, stock`. Two months ago, we also added the capability to run global aggregations with fixed interval at sub-second level, such as `select sum(price) from stocks emit periodic 50ms`
* Added new functions [md5](functions#md5), [md4](functions#md4), and [hex](functions#hex), which can help you generate hash keys.

**图表和仪表盘**

  * We refined the dashboard edit mode. Changes you make while in edit mode won't be saved automatically, to prevent accidental changes. Click the **Save Changes** button to confirm changes, or click the **Cancel** button to discard changes.
  * You can now customize the colors of lines, areas, and bars for charts.
  * **Migration notice:** since we updated the schema of dashboard&chart definition, your existing dashboards need to be re-configured manually to render properly. This would be a one-time effort.

**其他改进**

  * A new [timeplus-target](https://hub.meltano.com/loaders/target-timeplus) is added in [Meltano](https://meltano.com/) Hub. Meltano provides 500+ source connectors, all of which can be configured to send data to Timeplus. Check [our blog](https://www.timeplus.com/post/meltano-timeplus-target) for more details.
  * In the query history page, the column for SQL states is now wider, allowing you to see more.
  * We've made it easier to multi-task in Timeplus by letting you open new browser tabs. for example, when you are writing SQL in the **Query** page, and need to create a new view, you can right click **Views** in the left-side navigation menu and open a tab.
  * We refined the documentation of [Ingest API](ingest-api) and added code examples for Node/curl/Python/Java. [A new quickstart](quickstart-ingest-api) for the Ingest API is added too.

## 4/3

**流数据库和流式SQL**

* 添加了 2 个新函数： [arg_min](functions#arg_min) 和 [arg_max](functions#arg_max)。 使用它们，您可以快速找到关于某一列最小值或最大值的行，然后获取特定列的值。 要访问更多行或列，请使用 [min_k](functions#min_k) 和 [max_k](functions#max_k)。
* （实验性新功能）除了仅限追加的数据流外，现在您还可以创建包含变更和多版本的数据流。 如果您想试用此功能，请联系我们。

**图表和仪表盘**

  * 表格可视化支持条件格式化。 如果值符合您设定的特定条件，例如速度 > 80，或is_risky=true，您可以高亮单元格或整个一行。 该条件在浏览器中评估，而不是在通过SQL在服务器端执行。
  * 同样在表格可视化中，如果您将 “更新模式” 设置为 “按键”，则可以开启趋势颜色。 例如，当您显示一组股票的实时价格时，如果某个交易品种的价格上涨，则增量数字将显示为带有 🔼 图标的绿色。 您也可以配置数字变化的颜色。

**其他改进**

  * 更新了数据源列表页面：我们缩小了每个数据源方块的大小，这样方便我们在接下来的几个版本中添加更多源文件。
  * Apache Kafka 和 Confluent Cloud 向导已经过重新设计，以提供更直观的配置体验。
  * 更新了导航菜单。 一些功能现在处于顶层：外部流、物化视图和用户定义的函数。

## 3/18

请试用我们最新的演示工作区 [https://demo.timeplus.cloud](https://demo.timeplus.cloud/)，里面有内置的金融科技和 GitHub 实时数据和实时仪表板。 注册并获得此演示服务器的只读访问权限。

增强功能:

**查询**

  * 简化了 `LATEST JOIN` 语法。 无须写 `INNER LATEST JOIN`。 [点击此处，了解更多](query-syntax#latest-join).
  * 对于使用 tumble window 聚合的历史查询，如果窗口中没有事件，则该窗口将不会出现在结果中。 若要显示具有默认值的空窗口（数字类型为 0，字符串为空字符串），可以使用带 fill step 的order by window_start 来插入空窗口。 <window_size> .
  * 自动清理最近的查询日志：如果超过 500 个，则删除较旧的查询。

**仪表板**
  * 在主页上显示最近的仪表板及其图表数量。
  * 仪表板下拉过滤器支持静态选项。
  * 仪表板描述现在支持 Markdown（粗体、斜体等和超链接）。
  * 不断优化的图表选项和样式。 例如，条形图无须再旋转 y 轴上的标签，从而提高可读性。

**数据下游**
  * 调整了sink界面，区分生产级sink和预览行sink。
  * Slack sink 的 webhook 网址现在被视为密码并默认处于隐藏状态（单击 “显示” 可显示）

**其他**
  * 在删除或重命名直播/视图时添加了依赖关系检查。 如果在其他视图中引用了某个流或视图，则当您尝试删除/重命名该流或视图时，系统将显示错误。
  * 添加了后台检查以检测 UDF 可能的死锁，以提高系统稳定性。
  * 增强了 REST API：避免在列出流或视图时获取统计信息；提供新 API 来获取流或视图的统计信息；已在我们的 [REST API 文档](https://docs.timeplus.com/rest)中添加更多文档/示例。
  * 在我们的顶部标题菜单中添加了 Slack 按钮，邀请您加入我们的社区 Slack。


## 3/6

* 新功能

  * 您可以在仪表板中添加筛选器。 例如，查看最近 5 分钟或最近 1 小时的服务器状态。 [了解更多](viz#filter)
  * 之前当您打开面板时，您可以随时调整面板大小，删除面板。 设置会自动保存。 我们在不断增强仪表板添加更多功能，所以决定引入了显式的视图模式和编辑模式。
  * （实验性）你可以使用 [Markdown](https://en.wikipedia.org/wiki/Markdown)的面板进一步装饰仪表板，你可以添加样式化文本甚至图像。 可选配置，默认情况下关闭. 如果您想试用此功能，请联系我们。
* 增强功能
  * 增强并优化每种图表类型的各种功能。 [了解更多](viz#chart)
  * 能够为带有流 sql 的视图运行 [table ()](functions#table) 函数，例如  `with c as(select col1,col2 from a_stream where b>0) select * from table(c)` 请注意，视图中的流 SQL 不能包含任何聚合。 例如，您可以将原始 JSON 流的字段提取定义为视图，然后在流式传输模式或历史模式下查询视图。
  * 引入一个新函数 `earliest_timestamp()` 来返回 `1970-1-1 00:00:00`(UTC) 你也可以用 ` earliest_ts ()`来调用这个函数。 典型用法是从 stream 中 `select * from stream where _tp_time>earliest_ts()` 列出过去和将来的所有数据。 再说一遍，先前的语法 `settings seek_to='earliest'` 已被废弃，不久将被删除。
  * 你也可以在一个包括JOIN/UNION多个流的SQL中多次使用 `where _tp_time >..` 为不同的流穿越到不同的起点。
  * 为了提高可读性，你可以使用带下划线的数字文字，例如. `select * from iot where age_second > 86_400`。 数字文字中的下划线 `_` 会被忽略。
  * 为流式查询添加 [LATEST JOIN](query-syntax#latest-join) 。 对于两个仅限追加的流，您可以使用 `a LEFT INNER LATEST JOIN b on a.key=b.key`。无论何时任一流的数据发生变化，先前的JOIN结果都将被取消并添加新结果。

## 2/17

* 新功能

  * [全局聚合](query-syntax#global) 现在支持亚秒级的输出间隔。  比如. `select max(_tp_time),count(*),avg(speed_kmh) from car_live_data emit periodic 100ms`
  * 现在，您可以创建多个物化视图来将数据写入同一个流。 此功能的典型用法是在相同的原始数据上应用多个处理逻辑，然后发送到同一个数据流以获得聚合结果。 对于物化视图，Timeplus 会维护查询的状态，这将更适合长时间运行的查询和故障恢复。
  * (实验性) 在创建新流后，您可以选择直接在控制台界面中添加少量数据，而不用通过REST API或创建源。 如果您想试用此功能，请联系我们。
  * （实验性）Timeplus 后端添加了对CDC（[Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture)）的内置支持，用户界面将很快准备就绪。 您可以在不同的模式下创建数据流。 默认情况下，它是仅限追加的。 您也可以创建流来接受INSERT、UPDATE和DELETE从 [Debezium](https://debezium.io/) 的更改日志。 流式聚合结果将反映最新的数据变化。 如果您想试用此功能，请联系我们。

* 增强功能

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
* 添加了一种内置的针对`json`优化的数据类型，与将 JSON 另存为 `string` 并在查询时动态提取相比，查询性能更好。 适合于同一结构的 JSON 文档。 通过 `column.jsonpath` 访问该值（而不是用文本列的方式 `column:jsonpath` ）
* 我们开始弃用 `settings seek_to=..` 仍然支持时空旅行，你只需要在 WHERE 条件下使用 `_tp_time` 列，例如 `WHERE _tp_time>=now () -1h` 即可在 1 小时前进行时空旅行并显示此后的数据。 或者 `其中 _tp_time >= '2023-01-14'`  Timeplus 中的所有数据流都包含 `_tp_time` 作为事件时间。
* （实验性）除了 [Remote UDF](remote-udf)之外，现在你还可以使用 JavaScript 定义新函数。 支持标量函数和聚合函数。 请查看 [JS UDF](js-udf) 文档了解详细信息，如果您想尝试此操作，请联系我们。
