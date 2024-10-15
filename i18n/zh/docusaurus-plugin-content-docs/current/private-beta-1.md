# Timeplus Cloud Private Beta 1

我们很高兴启动第一个邀请制测试版的TimePlus Cloud。 很多很酷的功能和无限的可能性。 我们将不时更新测试版，并在此页面列出关键的增强措施。

(2022年)

### 8/1 周

最后一周发布在 Private Beta 1。 从8月8日开始，我们正在过渡到Private Beta 2。 客户将被批量迁移到新的环境批次。 访问测试版租户的网址已从 [https://TENANT.beta.timeplus.com 更改](https://tenant.beta.timeplus.com) 为 [https://beta.timeplus.cloud/TENANT](https://beta.timeplus.cloud/tenant)

- 流引擎

  - Added 2 geo related functions: point_in_polygon and geo_distance.

- 源、 汇、 API 和 SDK
  - 更新“源”页面的布局，以便为源定义留出更多空间。
- 界面改进
  - 如果查询正在运行，在查询选项卡上添加一个视觉指示器。
  - 更新错误或页面未找到的屏幕。

### 7/25周

- 流引擎
  - Enhanced json_extract_array function to return clean string values. `选择 '{"a":1,"tags":["x","y"]}' 为raw, json_extract_array(raw:tags)`现在返回 `[ "x", "y" ]` , 而不是 `[ "\"x\"", "\"y\"" ]` 在以前的版本中。
  - Added a new shortcut to access json arrays without having to use the json_extract_array function. 上面的查询可以简化为 `选择 '{"a":1, "tags":["x","y"]}" 为原生, raw:tags[*]`
  - 精炼打字系统和逻辑比较返回 `bool` 而不是 `uint8`
- 源、 汇、 API 和 SDK
  - 所有计时器汇现在都使用 `{{.columnName}}` 语法来访问汇主标题或正文中的列值。 支持数字和其他原始类型(以前只支持字符串列)。
  - 修复一个取消查询的问题可以标记为已完成。
  - 修复了一个问题，如果查询完成得太快，则EPS(每秒事件)不会显示。
- 界面改进
  - 在“发送数据到...”对话框中添加了一个新选项，以便将结果发送到Timeplus租户中的一个流中。
  - 当您创建一个新的查询选项卡时显示运行中查询的数量。
  - 增强字体颜色。
  - 增强图表颜色。

### 周为7/18

- 流引擎

  - 精炼 [实际化视图](/view#m_view)的行为，使其与其他Timeplus查询保持一致。 `SELECT * FROM table(a_possiblealized_view)` 将获得所有过去的结果，而不是最近的结果。
  - Added the count_if function and unique_exact_if function to count the number of rows or unique value matching certain conditions.
  - Added json_extract_keys function to get the keys for the JSON map object.
  - Added the to_bool function to convert other types to `bool`
  - Added is_nan, is_infinite, is_finite functions to detect the edge cases when a number column contains infinite numbers, etc.
  - Added to_type_name function to show the data type name, mainly for troubleshooting purposes.

- 源、 汇、 API 和 SDK
  - 更新 [Python SDK](https://pypi.org/project/timeplus/0.1.10/) 以显示指标
- 界面改进
  - 添加新的可视化类型：条形图和串流表
  - 增强汇的管理页面，以显示汇的状态、发送的消息数量、失败计数等。
  - 增强SQL编辑器以突出显示开始/结束(){},[]。 这对于嵌套函数调用的复杂SQL非常有用。

### 7/11周

- 流引擎

  - 修复了 `滞后` 函数的问题，以获得特定列过去结果的范围
  - Exposed the `coalesce` function to skip null value and return the first non-`NULL` value. 许多函数期望参数不能是 `NULL`

- 源、 汇、 API 和 SDK
  - 更新 [Python SDK](https://pypi.org/project/timeplus/0.1.10/) 以支持新源 API 并添加身份验证到 websocket
  - 添加可选的汇描述字段
- 界面改进
  - 显示新打开的查询标签，如“Tab 1”或“Tab 2”，而不是“无标题”
  - 能够删除第一个查询标签
  - 合并了各种流式演示至 [一个单一的 URL](https://timeplus.streamlitapp.com/)
  - 用sink API替换警报API。 操作-请求：请在升级后重新创建警报/汇。

### 周为7/4

- 流引擎

  - 加强《UDF》(User-Defined-Function)以允许空的身份验证头

- 源、 汇、 API 和 SDK

  - 更新 [Python SDK](https://pypi.org/project/timeplus/) 以启用流保留设置并创建/管理视图

- 界面改进

  - 对于流式查询结果，我们现在显示分类字段的百分比
  - 新的复杂数据类型的视觉编辑器可用于新流/源/函数向导
  - 我们改进了事件时间选择器的界面，并在Kafka源预览消息
  - 当您在 Kafka 源定义时创建一个流时，现在您可以定义保留政策 (如何自动清除旧数据)

### 6/27周

- 流引擎

  - At this point, [session window](/functions_for_streaming#session) aggregation only supports streaming queries. 正确拒绝查询 `session(...)` 与 `table(...)` 函数一起使用。

- 源、 sink 和 API

  - 在REST API 和UI中删除了租户/工作区级别访问令牌。 请每个用户创建 API 密钥。
  - 在 Kafka 源代码创建流时大幅改进推断类型。 原始类型更多的累积数据类型。 增加数组/地图支持。

- 界面改进

  - 现在您可以在工作区菜单中注册 UDF (User-Defined-Function) (仅适用于工作区管理员)
  - 大大改进流创建页面中的数据类型选择器
  - 改进布尔值和日期类型的列显示以及更好的空值
  - 精炼导航菜单的外观&感觉
  - 改进了错误消息的显示

### 6/20周

- 流引擎

  - [Session window](/functions_for_streaming#session) now supports millisecond for window_start/window_end.
  - Added a new `lags` function to get a range of past results. 这可以帮助基于纯 SQL 的 ML/预配。
  - 添加了一个新的 `grok` 函数来解析一行文本到键/值对等符号，而无需写正则表达式。

- 源和汇：

  - 更新 [datapm](https://datapm.io/docs/quick-start/) 以使用个人API密钥而不是 API 代币

- 界面改进

  - 精炼“创建新流”对话框。 现在您可以为流指定最大年龄或大小。
  - 您可以点击左下角的用户图标并打开“个人设置”。 我们将添加更多设置。 您可以在此设置页面中创建和管理个人API密钥。 租户级别访问令牌将很快被删除。

- API

  - 更新了 [REST API 文档](https://docs.timeplus.com/rest.html)，添加了实验性的流级别保留政策。

### 6/13周

- 流引擎
  - Added new function `moving_sum` to calculate the moving sum for a column. 这将解锁更多使用状态流处理的情况，例如 [流通过](https://share.streamlit.io/timeplus-io/github_liveview/develop/stream_over.py)。
  - Added other functions for array processing, such as `array_sum`, `array_avg`
- 源和汇：
  - Kafka 源支持无需认证的本地schema 注册表
- 界面改进
  - 在创建流时添加验证。 流名称应以字母开头，名称的其余部分仅包含数字、字母或\ _
  - 如果数据未预览，请在源向导中禁用下一个按钮

### 6/6周

- 流引擎
  - More math functions are exposed. 这可以帮助您运行基于 SQL 的简单ML/预测模型。
  - (实验性) [流到流加入](/joins#stream_stream_join) 不再需要 `date_diff_within (...)`，尽管仍然建议添加时间戳约束以提高性能。
  - (试验性的)能够为每一流制定保留政策， 基于时间的(说只保持最近的7天数据)，或基于大小(说只保持最近的1GB数据)
- 源和汇：
  - (实验性) 支持 REST API中的个人访问令牌(PAT)，该令牌为长寿(或设定过期日期)和每个用户。 租户级别的访问令牌将被弃用。
- 界面改进
  - 在源或汇创建后，您现在可以编辑它们，而不必删除和重新创建它们。
  - 实况表格/图表的业绩有很大改进。

### 5/30周

- 流引擎
  - （实验性）能够使用外部的 Kakfa/Confluent/Redpanda 作为 Timeplus 流存储。
  - (Experimental) the `table` function now works with [seek_to](/query-syntax) You can query historical data by combining `table(streamName)` and `settings seek_to='..'`
- 源和汇：
  - 使用 [datapm](https://datapm.io/docs/quick-start/) 发送实时Twitter 数据到 https://demo.timeplus.com
  - 更新 [REST API doc](https://docs.timeplus.com/rest.html), `/exec` 端点已被删除。 发送 `POST` 请求给 `/查询` 替代。
- 界面改进
  - 能够拖放以更改查询标签的顺序

### 5/23周

- 流引擎
  - (Experimental) new UI and API to create and query [external streams](/external-stream). 您可以立即在 Confluent Cloud, Apache Kafka 或 Redpanda 查询实时数据，而不需要将数据加载到 Timeplus 中。
  - (Experimental) [stream-to-stream join](/joins#stream_stream_join) is ready to test for beta customers, e.g. `SELECT .. id=stream2.id 和 date_diff_within(10s)`
  - New function `date_diff_within` to determine whether 2 datetime are within the specified range. 这是串流加入所必需的。 您也可以使用更灵活的表达式，如 `date_diff('second',left.time,right.time) 介于 -3 和 5` 之间。
- 源和汇：
  - 升级 [datapm](https://datapm.io/docs/quick-start/) Timeplus sink 以支持从 PostgreSQL 加载 JSON 数据。
  - 当您正在预览Kafka的数据时，如果时区未包括在原始数据中，您可以选择时区。
- 界面改进
  - 能够编辑仪表板上的面板标题。
  - 提高界面的一致性。

### 5/16周

- 流引擎
  - (实验性)大大简化了如何查询JSON文件的程序。 现在你可以使用 `json_doc:json_path` 作为在JSON 文档中提取值的快捷键。 例如， `选择 '{"c":"hello"}" 为 j, j:c`, 你会得到"hello" 作为值。 在过去，您必须调用 `json_extract_string(j, c')` 嵌套结构也是支持的，例如 `选择 '{"a":{"b":1}} 为 j, j:a。 ` 将获得 `1` 字符串值。 若要转换为 int，您可以使用 `:` 作为快捷方式，例如： `选择 '{"a":{"b":1}} 为 j, j:a.b:int`
  - 添加函数 `is_valid_json` 来检查特定字符串是否是一个有效的 JSON 文档，例如 `选择 j:a 哪里是有效的 json(j)`
  - 添加 `varchar` 作为 `字符串` 数据类型的别名。 这可以提高与其他SQL工具的兼容性。
- 源和汇：
  - 增强Kafka/Redpanda源的身份验证：添加新的 SASL 机制：打乱架-sha-256 和打乱架-sha-512，增加配置以禁用TLS。 在 TLS 启用时添加配置到跳过验证服务器，修复了当身份验证失败时源将挂断的错误。
  - 升级 [REST API](https://docs.timeplus.com/rest.html) 以指定事件时间戳在原始事件的时区。
- 界面改进
  - 创建流或视图后刷新流列表。
  - 在更好树视图中显示源配置 JSON。

### 5/9周

- 流引擎
  - 新 `array_join` 函数根据数组中的值生成一组行，并与其他列合并
  - (实验性) 添加一个新的 `dept` 表函数，这个函数可以从串流查询或历史查询中删除重复的事件。
- 源和汇：
  - 升级 [datapm](https://datapm.io/docs/quick-start/) Timeplus sink 来支持从 PostgreSQL 加载数据
  - (实验性) 一个能够从 [加载数据的新源](https://ably.com/hub)
- 界面改进
  - 您可以暂停流式查询，然后按列排序或使用分页按钮。 这可以帮助您查看流式查询结果。 点击恢复按钮继续获取最新流式结果。
  - (实验性) 更新了查询标签样式，并在标签上添加按钮以保存查询。

### 5/2 周

- 发布的 Python SDK 0.1.1 带令牌自动刷新
- 在 https://docs.timeplus.com/rest上发布了REST API Doc
- 流引擎
  - (实验性) 添加了一个新的 `xirr` 功能，以根据指定的一系列潜在不定期的现金流量计算投资的内部回报率。
- 界面改进
  - 服务器重启后在仪表板上恢复查询
  - 更好的 SQL 自动完成，包含函数描述、使用和示例
  - 在视图和汇的页面中显示语法高亮的 SQL
  - 保持每个查询标签的状态
  - (实验性)使汇可编辑

### 4/25周

- 将Python SDK发布到 https://pypi.org/project/timeplus/
- 流引擎
  - 能够重命名流
  - (实验性) 添加 `ORDER BY` 支持流式查询与聚合
  - (实验性) 添加 `EMIT TIMEOUT 5s` 用于串流查询，这样窗口将被关闭，即使没有更多的事件来推进水印。
  - (Experimental) Added `emit_verison()` to show a unique number for each emitted window (so that you can tell from the streaming results which rows are from the same window)
- 源和汇：
  - Kafka源的10倍通量提高
  - (实验性) a [datapm](https://datapm.io/) sink to ingest 批处理/流流数据到 Timeplus
- 界面改进
  - 添加一种暂停活动表并显示长文本或 JSON 文档作为弹出窗口的方式
  - 能够调整查询编辑器
  - 在本地时区显示事件时间
  - Web 界面中的 SQL 格式现在调用后端API，而不是纯前端SQL 格式
  - (实验性) 精炼流的仪表板布局和编辑
  - (实验性) 更好地在流式图表中显示延迟事件

### 每周4/18

- 改进了 API 令牌界面
- Experimental [session](/functions_for_streaming#session) window for streaming processing. 许多新的使用案例将解锁。
- Enhanced the `top_k` function to show event counts by default
- Added new functions for array and map: `map_cast` , `group_array`
- Added new streaming functions `earliest` and `latest` and to show the first or last event in the streaming window.

### 4/11周

- 精炼REST API HTTP 代码和错误消息
- 改进了 web 界面中的错误
- 开源性能测试框架，作为 [分组](https://github.com/timeplus-io/chameleon/tree/main/generator) 的一部分，它可以生成流流数据并观察查询延迟。 有各种组合的批量大小、同币、搜索比等。 它支持Timeplus、Flink、Materialize、Slusk等。

### 每周4/4

- 界面改进：
  - 除了线外，在流视觉化中还有几个图表类型：区域、 条形状、 单个值
  - 在弹出对话框中显示流的列表。
  - 在帮助页面中显示 REST API 持证人令牌
- Webhook sink 改进：如果您没有设置身体，我们将把整个行作为JSON 并将它包装到webhook

### 3/28周

- 在处理大型静态文件时增强文件源以提高稳定性。
- 强化Kafka源以支持AVRO格式（用图表登记）。 您也可以加载整个JSON文档作为单个字符串列来支持动态JSON方案。 Kafka消息来源也支持纯文本。
- 添加两个新的图表类型：面积和单一值。 您可以在查询页面的可视化选项卡中尝试它们。
- 界面改进以扩展/折叠导航菜单。
- 用于推送和查询数据的 Python SDK 实验。

### 3/21周

- 精炼 [数据类型](/datatypes) 以便始终使用小写类型名称。 `官方支持 bool`。
- 为Redpanda数据源和汇添加了新的 UI。
- 添加新的单点登录提供商：微软。

### 周为 3/8

- 我们很想启动第一个私有测试版的TimePlus 云释放。
