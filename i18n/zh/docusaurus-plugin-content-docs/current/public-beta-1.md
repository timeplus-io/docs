# Timeplus Cloud Public Beta 1

我们很高兴地启动Timeplus Cloud公开测试版。

我们将不时更新测试版，并在此页面列出关键的增强措施。

(2022年)

## 每两周更新 12/26-1/6

* 当本地磁盘已满 90% 时，Timeplus 将停止写入新数据。 此阈值是可配置的。
* 在 “数据谱系” 页面中，默认情况下会显示数据源。
* 进一步统一了界面风格。
* 发布 [Timeplus Python SDK 1.1.1](https://pypi.org/project/timeplus/1.1.1/) ，提供更友好的 API 用于创建/摄取/查询流。
* (实验性) 您现在可以用 [kafka-connect-timeplus](https://github.com/timeplus-io/kafka-connect-timeplus)从您的本地Kafka集群推送数据到 Timeplus， 或用 [pulsar-io-sink](https://github.com/timeplus-io/pulsar-io-sink)从您本地的 Pulsar 集群推送数据到Timeplus，或用 [destination-timeplus connector](https://github.com/jovezhong/airbyte/tree/feature/timeplus-destination/airbyte-integrations/connectors/destination-timeplus)使用AirByte来抓取数据再发送到Timeplus。 我们还 [记录了](https://www.timeplus.com/post/timeplus-cloud-with-ngrok) Timeplus Cloud如何能够通过 ngrok 从您的本地数据源拉取数据。

## 每两周更新 12/12-12/23

* With the recent enhancements of the [Ingest API](/ingest-api), in many cases, you can configure other systems to push data directly to Timeplus via webhook, without writing code.
* 现在您可以在创建/更新流或视图时设置描述。
* 您可以编辑视图来更改其 SQL 查询，而不必将其删除然后重新创建。
* 对于物化视图，您可以查看其行数和磁盘大小。 数据保留政策也可以更新。
* 在查询页面中，您可以使用关键字筛选结果，而无需更改 SQL。

* 在查询页面中，我们删除了分页。 最新的结果显示在底部。
* 对于具有长文本或 JSON 值的列，在以前的版本中，过长的内容可能看不见。 现在，您可以单击该行以在侧面板中显示全文。

## 每两周更新 11/14-11/25

* 我们添加了一项实验功能，用于通过 JavaScript 创建用户定义的聚合函数 (UDAF)。 您可以使用 JavaScript 创建高度自定义的逻辑，即使对于复杂事件处理 (CEP) 场景也是如此。 如果您想试用此功能，请联系我们。
* 完善了 Python SDK 的文档 https://pypi.org/project/timeplus/
* 数据源
  * 在数据源管理页面中，我们添加了一条迷你图来显示数据源的吞吐量。 每15秒自动刷新改吞吐图。
  * 当您创建新数据源并选择向现有流发送数据时，将仅显示数据结构匹配的流。 如果没有现有的流匹配，您必须创建一个新流。
  * 在预览阶段，将从数据源提取前 3 行。 如果 Timeplus 无法自动检测列数据类型，则列类型将设置为 `unknown`。 如果这 3 个事件中的值包含 `null`，则可能会发生这种情况。 请检查您的数据源。 如果您确定未来的事件将采用特定的数据类型，例如 `string`，则可以更改列类型并选择创建新流以接收来自数据源的数据。
* When you create a new [materialized view](/view#m_view), you can set a retention policy, specifying the max size or max age for the data in the materialized view.
* 在主页上单击最近的查询将打开查询页面，而不是显示查询历史记录。
* 我们删除了以前位于每个页面顶部的紫色页面描述横幅。 如果在某个页面中未定义任何对象，则会显示自定义的帮助页面。
* 您可以单击并拖动以调整流式表（查询页面）中的列宽。
* 实验性的警报管理器界面。 Please check our [user guide](/alert).

## 每两周更新 10/31-11/11

* 源、 汇、 API 和 SDK
  * 我们开发并开源了 [Pulsar Sink Connector for Timeplus](https://github.com/timeplus-io/pulsar-io-sink)。 你可以将这个连接器安装在你的 Pulsar 集群中，然后将实时数据推送到 Timeplus。
  * 我们发布了 Python SDK 的重大升级 https://pypi.org/project/timeplus/1.0.0/ 代码和文档由 [Swagger Codegen](https://github.com/swagger-api/swagger-codegen) 自动生成，因此它将始终与我们最新的 REST API 保持一致。 请注意，这与之前的 0.2.x 或 0.3.x SDK 不兼容。 如果您正在使用这些 SDK，请计划迁移。 新 API 仅在 1.x SDK 中可用。
  * 我们进一步增强了采集 REST API，以支持更多系统，例如 vector 和 auth0。 如果您想要利用第三方系统/工具将数据推送到Timeplus，但它不允许自定义内容类型， 然后您可以使用标准 `application/json` 内容类型，并将 POST 请求发送到 `/api/v1beta1/streams/$STREAM_NAME/ingest?format=streaming`. 这将确保 Timeplus API 服务器将 POST 数据视为 NDJSON。 对于 API 身份验证，除了自定义 HTTP 标头 `X-api-key: the_key`之外，我们现在还支持 `Authorization：apiKey THE_KEY` 了解更多 [Ingest API](ingest-api) For the API authentication, besides the custom HTTP Header `X-Api-Key:THE_KEY`, we now also support `Authorization: ApiKey THE_KEY` Learn more [Ingest API](/ingest-api)
* 界面改进
  * 在注册/登录页面中，我们添加了微信集成。 您可以用手机扫描二维码并注册或登录。
  * 当查询完成、取消或暂停时，您可以将当前结果下载为 CSV。 当结果超过 1 页时，这很有用。
  * 当您单击数据血缘页面上的实体（例如流或视图）时，摘要现在显示在侧面板中，而不是弹出窗口。 我们将在侧面板中添加更多详细信息。
  * 实验性的警报管理器界面。 想成为第一个尝试此功能的人吗？ 请与我们联系！

## 每两周更新10/17-10/28

* 流引擎

  * 引入了一种新的 `LIMIT <n> BY <column>` 语法。 Combining with `emit_version` function, you can show a limited number of results per emit. 例如

    ```sql
    SELECT cid,avg(speed_kmh) AS avgspeed, emit_version()
    FROM tumble(car_live_data,5s) GROUP BY window_start,cid
    LIMIT 3 BY emit_version()
    ```

  * （实验性）能够为物化视图设置保留策略，以限制每个物化视图的行数或总存储空间。 用户界面即将上线。

* 源、 汇、 API 和 SDK

  * 增强的 Ingest REST API 以支持 “换行符分隔的 JSON” (ndjson)。
  * 完善了 [REST API 文档](https://docs.timeplus.com/rest)，以显示不同版本的 API。
  * 新版本的 datapm CLI 带有更简单易用的Timeplus sink 只需要设置Timeplus工作空间 baseUr就可以将数据推送到 Timeplus，同时支持云端和本地 Timeplus。 只需要设置Timeplus工作空间 baseUr就可以将数据推送到 Timeplus，同时支持云端和本地 Timeplus。

* 界面改进

  * 我们添加了一个指导系统，让新用户可以快速开始使用 Timeplus。
  * 数据血缘页面做了美化。
  * (实验性) 当流的 SQL 正在运行时，列头显示最近的 10 行的值。 暂停或取消 SQL 时，列标题会显示所有缓存结果迷你图，并用一条横线表示平均值。
  * （实验性）中国市场的本地化用户界面。



## 每两周更新10/3-10/14

* 流引擎

  * We simplified the [session](/functions_for_streaming#session) time window: if you want to create sub-streams, you no longer need to set the `keyBy` column as one parameter of the session window. 只需使用 `SELECT... FROM session(..) PARTITION BY keyBy` . Other time window functions([tumble](/functions_for_streaming#tumble) and [hop](/functions_for_streaming#hop)) support the `PARTITION BY` in the same way.

  * The other enhancement of the [session](/functions_for_streaming#session) time window: we introduced an intuitive way to express whether the events for startCondtion or endCondition should be included in the session window. 支持四种组合： `[startCondition, endCondition]`, `(startCondtion, endCondition)`, `[startCondition,endCondition)`,`(startCondition,endCondition)`

  * 我们添加了 `<agg> FILTER(WHERE...)` 的支持作为一个快捷方式，为具有某些条件的数据运行聚合，例如：

    ```sql
    select count() filter(where action='add') as cnt_action_add,
           count() filter(where action='cancel') as cnt_action_cancel
    from table(bookings)
    ```

  * 大大降低内存消耗。

* 源、 汇、 API 和 SDK

  * 对于Kafka源，如果验证方法设置为“无”，将自动打开“禁用TLS”。
  * 优化 [go-client](https://github.com/timeplus-io/go-client) 开源项目以支持更底层的摄取API。
  * 实验性的 [JDBC 驱动程序](https://github.com/timeplus-io/java-demo/tree/main/src/main/java/com/timeplus/jdbc) 以开源。 您可以在某些客户端(如DataGrip)中使用此驱动程序来运行只读查询(支持流式和历史查询)

* 界面改进

  * 引入全新“查询侧面板”。 您可以扩展它来探索许多功能，例如查询片断、SQL函数、书签和历史记录。
  * 条形图是回来了。 您需要在查询中添加 `GROUP BY`。 选择“查看最新数据”，并选择“Group by”项。
  * 当您移动鼠标在实体上方时，会在“数据血缘图”页面显示更多信息。 例如，您可以看到流的数据架构以及视图背后的查询。
  * 大大提高用户对查询标签和书签的体验。 您可以轻松地为每个查询选项卡设置有意义的名称。 当查询编辑器不是空的，点击书签图标保存此 SQL 以供今后使用。 重命名或删除查询侧面板中的书签。
  * 列名和类型显示在“流目录”。

## 每两周更新10/3-10/14

* 流引擎
  * 强化子流支持流级别 `by`, 例如: `SELECT cid,speed_kmh,lag(longitude) as last_long,lag(latitude) as last_lat FROM car_live_data partition by cid` 之前你必须为每个聚合函数添加 `partition by cid`。
* 界面改进
  * 单个值可视化增强，允许您开启闪光线来显示数据变化。
  * 在源和汇页中，每个项目的输送量现在列在清单中。
  * 当您点击？ 图标，我们将向您展示当前页面的相关帮助信息以及版本信息。
  * 对于新用户，我们还将作为一个可关闭的信息框，对页面的内容作简短的描述。
