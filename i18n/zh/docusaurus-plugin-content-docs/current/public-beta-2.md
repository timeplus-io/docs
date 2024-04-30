# 公开测试版 2

我们很高兴地启动Timeplus Cloud公开测试版的第二阶段。 相比 [公开测试版1](public-beta-1)，除了入口点从 https://beta.timeplus.cloud 更改为 https://us.timeplus.cloud 以外，大多数后端和前端更改都是递增式的。

我们将不定期地更新测试版，并在此页面列出关键的增强功能。

## 2023年7月24日

**仪表板和图表**
  * 当您对 SQL 进行更改时，我们将尝试保留图表格式化设置。 例如当修改 `WHERE` 条件或 `ORDER BY` 时。
  * 图表：点击并拖动以在编辑模式下调整列宽度的大小。
  * 单值图表：添加了更多格式选项——更改数字的颜色、或差值的颜色和迷你图颜色。
  * 增强了图表的颜色选择器，以显示不同颜色。

**其他用户界面的改进**
  * 在查询页面的结果表中，对于日期/时间列，我们现在显示原始时间戳（不再显示浏览器的本地时区）。 在 Timeplus 中，默认情况下 _tp_time 列是在 UTC 时区创建的。 详情请查看 [_tp_time（事件时间）](eventtime) 。
  * 改进了在个人设置中显示 API 密钥到期日期的方式。

**流数据库和流式SQL**
  * 极大地提高了源和下游的性能。
  * `JOIN`的改进：
    * 以前，如果你对带有 [多版本流](versioned-stream) 的普通流（仅附加）运行 `JOIN`，那么多版本流的所有主键列都需要在 `ON` 子句中。 现在，只要选择了所有主键列，就可以在 `ON` 子句中使用一个或多个主键列。
    * (实验性) 我们还添加了对 [变更日志流](changelog-stream) `JOIN` [变更日志流](changelog-stream) 或 [变更日志](changelog-stream) 的 `JOIN` [多版本流](versioned-stream) 的支持。

## 2023年7月10日

**资源列表**
  * 资源列表（例如数据源、流、下游 等等）现在显示 “创建者/时间” 列。
  * 这些表不再自动刷新。 单击右上角的箭头图标可手动刷新表格。
  * 对于多版本流和变更日志流，我们现在显示一个钥匙图标来表示它不是一个追加流。 行数和最早/最新事件列现在也已隐藏。

**查询页面**
  * 我们添加了键盘快捷键来添加或删除 SQL 编辑器中的注释： 在 Windows 电脑端：`Ctrl + /` 用来切换行注释，`Shift + Alt + A` 用来切换块注释。 在 Mac 端：`Cmd + /` 用来要切换行注释，`Shift + Option + A` 用来切换块注释。
  * 优化了 SQL 查询的错误消息，以显示更多详细信息。

**数据源**
  * 对于 Apache Kafka、Confluent Cloud 和 Redpanda 数据源，我们在提取数据步骤中删除了 “高级设置”，因此 “消费者组” 字段现在直接显示。


## 2023年6月27日

[新的Timeplus Python SDK](https://pypi.org/project/timeplus/1.3.0b2/) 的测试版本可供下载。 它支持 SQL Academy，以便我们可以将Timeplus与丰富的Python生态系统整合起来。 例如 [Superset](https://superset.apache.org/), [QueryBook](https://www.querybook.org)和 [LangChain](https://python.langchain.com/docs/get_started/introduction.html)。 如果您想试用此功能，请联系我们。 Timeplus的 [Meltano 插件](https://github.com/timeplus-io/target-timeplus) 已更新，使用最新的 Python SDK，支持更灵活的数据结构。

**控制台用户界面**
  * 对于变更日志或版本控制流，您可以创建包含多列的复杂主键。
  * “查询” 页面中的帮助面板焕然一新：SQL Helper 面板不再与 SQL 编辑器和结果表重叠，行详细信息面板现在显示在结果表中。
  * 对于数据源与下游，点击状态旁边的 “i”，查看最后一条错误消息。
  * 改进了 SQL 查询的错误消息，以显示更多详细信息。
  * 对于 API 密钥，我们现在显示前四个和最后四个字符，以前的名称现在是描述。

**REST API**
  * 我们在 [REST API 文档](https://docs.timeplus.com/rest) 中标记了必需的参数，并完成了验证，以避免在没有必要信息的情况下创建资源。
  * 更新了我们的 REST API 文档，加入了更多描述。


## 2023年6月12日

**新功能**
  * 向您介绍Timeplus中的协作功能：您可以邀请团队成员加入您的 Timeplus 工作空间（在我们的公开测试期间，您可以邀请无限的团队成员）。 同一工作空间中的成员可以访问和编辑所有流、数据源、数据下游、仪表板等。 只有工作空间所有者可以邀请或移除成员。

**数据摄取和接收**
  * 您现在可以通过 [Timeplus的插件Kafka Connect](https://www.confluent.io/hub/timeplus/kafka-timeplus-connector-sink) 把数据从本地或云端的 Kafka 推送到 Timeplus。 它在 Confluent Hub 上发布，您可以将其安装在 Confluent Cloud 或本地的Confluent Platform 和 Apache Kafka 上。
  * 我们为 Apache Kafka 和 Redpanda 数据下游添加了 Protobuf 编码，您现在可通过 REST API 获得。

**其他改进**
  * 对于流，您现在可以为流媒体和历史数据设置单独的保留策略。 例如，对于包含 IoT 数据的流，您可以为流数据设置 1 天的保留时间，为历史数据设置 90 天的保留时限。
  * 请注意：REST API v1beta1 现已废弃，将在几个月后被删除。 请查看我们的v1beta2的[API文档](https://docs.timeplus.com/rest). 请查看我们的v1beta2的[API文档](https://docs.timeplus.com/rest). [Python SDK](https://pypi.org/project/timeplus/)、 [Java 示例代码](https://github.com/timeplus-io/java-demo) 和 [Streamlit 演示应用程序](https://github.com/timeplus-io/streamlit_apps) 已更新。


## 2023年5月29日

**数据摄取**
  * 我们现在有一个全新页面，列出了各种将数据添加到 Timeplus的方式。 新的“数据添加”页面允许您添加数据源（例如Apache Kafka、Confluent Cloud、Redpanda等），通过Ingest Rest API推动数据，导入CSV文件并连接外部流（使用Kafka数据） 。 您添加的数据源和外部流也将在此页面的单独选项卡中列出。
  * 在 Apache Kafka 和 Redpanda 数据源中，您现在可以对 Protobuf 进行编码或解码。 在 “提取数据” 步骤中，输入您的 Protobuf 消息名称和定义。
  * 我们现在还支持 Debezium JSON 作为读取数据格式，包括 Upsert 和 CRUD（CRUD 目前处于预览阶段）。

**流数据库和流式SQL**
  * 我们对滑动窗口进行了显著的性能增强，从 10 倍提高到 100 倍。 这对于较大的窗口特别有用，例如窗口的总大小为 24 小时，但却可以每秒显示一次更新。
  * 用户定义的函数 (UDF) 和用户定义的聚合 (UDA) 现在能够将数组作为数据类型返回。

**其他改进**
  * （实验性）我们添加了协作功能，允许您邀请团队成员加入您的工作空间。
  * 我们重新组织了导航菜单，以提供更清晰的工作流程：“数据添加” 现在位于顶部，其次是 “运行 SQL”。 我们还在菜单中添加了 “工作空间设置”，以便更快地访问您的 UDF 和团队成员。


## 2023年5月16日

**增强功能：数据提取**
  * 我们使您可以更轻松地通过 Ingest REST API 推送数据。 我们在控制台中添加了一个向导页面，用于指导您对目标流、请求模板和API密钥的选择，然后为您的推送请求生成示例代码。 [了解更多](ingest-api)
  * 我们的CSV文件上传向导外观焕然一新，它全新的用户界面风格变得与其他向导相同了。

**增强功能：仪表板和图表**
  * 当您对图表进行格式更改时，所有的更改效果都将是即时呈现出来的，不需要重新加载图表。
  * 我们在将鼠标悬停在仪表板图表上添加了一个图标。 在 “仅查看” 模式下，它将在查询编辑器页面中打开图表的 SQL。

## 2023年5月1日

**流数据库和流式SQL**

* （实验性新功能）除了仅限追加的数据流外，现在您还可以创建包含变更和多版本的数据流。 你可以利用 [Debezium](https://debezium.io/)等工具加载来自不同来源的 CDC（更改数据捕获）数据，并在 Timeplus 中跟踪您的插入、更新、删除操作。 您可以随时获得任意主键的最新数据。 [了解更多](working-with-streams)

**图表和仪表盘**

  * （实验性）添加了新的地图可视化类型，可以在实时地图视图中显示最新位置。
  * 对于表可视化，如果更新模式是按键更新，则可以启用 sparkline 来跟踪某些列的值变化。

**其他改进**

  * 如果运行 `SELECT * FROM my_stream` 并且当时没有新数据流入，Timeplus将向您建议使用一个新的 SQL以查询历史数据。
  * 在可视化配置表单中添加了更好的颜色选择器。
  * 我们的示例数据集的用户界面已简化。 现在，相对于其他来源的常规配置流程，您只需点击几下即可快速生成示例数据。



## 2023年4月17日

**流数据库和流式SQL**

* 对于状态时间窗口聚合([tumble](functions_for_streaming#tumble)/[hop](functions_for_streaming#hop)/[session](functions_for_streaming#session)), Timeplus现在支持亚秒间隔： `ms` 表示毫秒。 `us` 表示微秒 `ns` 表示纳秒。 例如，您可以通过运行流式SQL，在过去1秒的滑动窗口中每10毫秒显示结果： `select window_start, stock, avg(price) from hop(stocks,10ms,1s) group by window_start, stock`. 两个月前，我们还增加了亚秒级间隔运行全局聚合的能力。 例如 `select sum(price) from stocks emit periodic 50m`
* 添加了新功能来 [md5](functions#md5), [md4](functions#md4), and [hex](functions#hex)，可以帮助您生成哈希键。

**图表和仪表盘**

  * 我们完善了仪表板编辑模式。 您在编辑模式下所做的更改不会自动保存，以防止意外更改。 单击 **保存更改** 按钮确认更改，或单击 **取消** 按钮放弃更改。
  * 现在，您可以自定义图表的折线、区域和条形的颜色。
  * **迁移通知：** 由于我们更新了仪表盘和图表定义的数据格式，因此需要手动重新配置现有仪表板才能正确呈现。 这将是一次性的工作。

**其他改进**

  * 在 [Meltano](https://meltano.com/) Hub中添加了新的 [Timeplus Target](https://hub.meltano.com/loaders/target-timeplus)。 Meltano 提供 500 多个数据源连接器，所有这些连接器都可以配置为向 Timeplus 发送数据。 查看 [博客](https://www.timeplus.com/post/meltano-timeplus-target) 了解更多详情。
  * 在查询历史记录页面中，SQL 列变得更宽了，方便您查看更多内容。
  * 在查询编辑器页面中，函数描述被添加到自动提示框中。
  * 我们通过允许您打开新的浏览器选项卡，使您在 Timeplus 中进行多任务处理变得更加容易。 例如，当您在 **Query** 页面中编写 SQL 并需要创建新视图时，可以在左侧导航菜单中右键单击 **Views** 并打开一个浏览器窗口。
  * 我们完善了 [Ingest API](ingest-api) 的文档，并添加了 Node/curl/Python/Java 的代码示例。 Ingest API的也添加了[新快速入门](quickstart-ingest-api) 。

## 2023年4月3日

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

## 2023年3月18日

请试用我们最新的演示工作区 [https://demo.timeplus.cloud](https://demo.timeplus.cloud/)，里面有内置的金融科技和 GitHub 实时数据和实时仪表板。 注册并获得此演示服务器的只读访问权限。

增强功能:

**查询**

  * 简化了 `LATEST JOIN` 语法。 无须写 `INNER LATEST JOIN`。 [点击此处，了解更多](query-syntax#latest-join).
  * 对于使用 tumble window 聚合的历史查询，如果窗口中没有事件，则该窗口将不会出现在结果中。 显示一个缺省值的窗口(0表示数字类型，空字符串表示), 您可以通过 window_start 添加排序，填充步骤 \<window _size\>。
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


## 2023年3月6日

* 新功能

  * 您可以在仪表板中添加筛选器。 例如，查看最近 5 分钟或最近 1 小时的服务器状态。 [了解更多](viz#filter)
  * 之前当您打开面板时，您可以随时调整面板大小，删除面板。 设置会自动保存。 我们在不断增强仪表板添加更多功能，所以决定引入了显式的视图模式和编辑模式。
  * （实验性）你可以使用 [Markdown](https://en.wikipedia.org/wiki/Markdown)的面板进一步装饰仪表板，你可以添加样式化文本甚至图像。 可选配置，默认情况下关闭. 如果您想试用此功能，请联系我们。
* 增强功能
  * 增强并优化每种图表类型的各种功能。 [了解更多](viz#chart)
  * 能够为带有流 sql 的视图运行 [table ()](functions#table) 函数，例如  `with c as(select col1,col2 from a_stream where b>0) select * from table(c)` 请注意，视图中的流 SQL 不能包含任何聚合。 例如，您可以将原始 JSON 流的字段提取定义为视图，然后在流式传输模式或历史模式下查询视图。
  * 引入一个新函数 `earliest_timestamp()` 来返回 `1970-1-1 00:00:00`(UTC) 你也可以用 `earliest_ts ()`来调用这个函数。 典型用法是从 stream 中 `select * from stream where _tp_time>earliest_ts()` 列出过去和将来的所有数据。 再说一遍，先前的语法 `settings seek_to='earliest'` 已被废弃，不久将被删除。
  * 你也可以在一个包括JOIN/UNION多个流的SQL中多次使用 `where _tp_time >..` 为不同的流穿越到不同的起点。
  * 为了提高可读性，你可以使用带下划线的数字文字，例如. `select * from iot where age_second > 86_400`。 数字文字中的下划线 `_` 会被忽略。
  * 为流式查询添加 [LATEST JOIN](query-syntax#latest-join) 。 对于两个仅限追加的流，您可以使用 `a LEFT INNER LATEST JOIN b on a.key=b.key`。 无论何时任一流的数据发生变化，先前的JOIN结果都将被取消并添加新结果。

## 2023年2月17日

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

## 2023年2月3日

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



## 2023年1月20日

* 查询结果的界面更新：
  * **无限滚动。** 对于流式查询和历史查询，较新的结果显示在底部。 您可以向上滚动查看之前的结果，然后单击底部的 **跳转到最新数据** 按钮继续查看最新结果。
  * **行详情**。 对于包含长文本或 JSON 的列，您可以单击 “眼睛” 按钮打开包含该行详细信息的侧面板。
  * **更新列摘要** 对于数字列，列头中显示最小/最大/平均值。 数据范围是从查询开始到现在。 对于日期时间列，将显示起始/终止时间戳。 对于布尔列或字符串列，前 3 个值会与百分比一起显示。
  * **快速筛选。 ** 您可以键入一些关键字来筛选结果，而无需重写 SQL。 它将对所有列执行简单的 `string#contains` 匹配。 暂不支持正则表达式或逻辑条件。
  * **显示/隐藏列**  您可以通过新引入的设置按钮来隐藏某些列，而无需重写 SQL。 您也可以在此对话框中以 CSV 格式下载结果。
  * **调整列大小**. **调整列大小**. Timeplus会根据列的类型自动设置适当的初始列大小。 您可以随时通过拖放来调整列的大小。
* 更多图表类型和选项。 您可以选择折线图、面积图、柱形图、条形图、单值图和图表作为可视化类型。 每个图表都支持基本设置和高级设置。
* 添加了一种内置的针对`json`优化的数据类型，与将 JSON 另存为 `string` 并在查询时动态提取相比，查询性能更好。 适合于同一结构的 JSON 文档。 通过 `column.jsonpath` 访问该值（而不是用文本列的方式 `column:jsonpath` ）
* 我们开始弃用 `settings seek_to=..` 仍然支持时空旅行，你只需要在 WHERE 条件下使用 `_tp_time` 列，例如 `WHERE _tp_time>=now () -1h` 即可在 1 小时前进行时空旅行并显示此后的数据。 或者 `其中 _tp_time >= '2023-01-14'`  Timeplus 中的所有数据流都包含 `_tp_time` 作为事件时间。
* （实验性）除了 [Remote UDF](remote-udf)之外，现在你还可以使用 JavaScript 来定义新函数。 支持标量函数和聚合函数。 请查看 [JS UDF](js-udf) 文档了解详细信息，如果您想尝试此操作，请联系我们。
