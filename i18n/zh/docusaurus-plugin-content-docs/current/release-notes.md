# 更新日志

This page summarizes changes for each major update in Proton and Timeplus Cloud, including new features and important bug fixes. For previous release notes, please check [this page](changelog).

## Mar 4, 2024

*Proton：*
  * Proton can now natively integrate with ClickHouse, available for both ClickHouse Cloud or local/self-managed versions of ClickHouse. [Learn more](https://www.timeplus.com/post/proton-clickhouse-integration)
  * Bulk CSV import is enhanced, in Proton 1.5.2. You can load billions of rows in multiple CSV files via a single SQL. [Learn more](proton-howto#csv)
  * Kafka Schema Registry is supported with Protobuf and Avro format (Proton 1.5.2). [Learn more](proton-schema-registry)
  * Self-signed HTTPS certification for Schema Registry is supported (Proton 1.5.3).
  * Proton now can be compiled on SUSE Linux.

*Timeplus Cloud：*
  * In Data Lineage side panels, more details about the resoures are added. Click on a tile to view.
  * Data types such as `float` or `integer` are depreciated. The UI will show precise data types such as `int8`, `uinit16`, etc.
  * In dashboard charts, the legend is maintained when rendering. Click to show or hide series.

## During the Preview step of adding a new source, we now show you the time remaining for previewing data. If no event comes in after 30 seconds, you can go back to previous steps, check your configuration, then try again.

*Proton：*
  * 在 Proton v1.5.1 中，我们根据 ksqlDB 用户的反馈推出了更多的流式结果的发布政策。 最值得注意的是，当您运行 tumble/hop/session 窗口聚合时，在窗口关闭之前，中间聚合结果可以按一定的间隔或值发生变化时发出。 [在我们的文档中了解更多](query-syntax#emit)
  * 现在您可以通过 `curl https://install.timeplus.com | sh` 将 Proton 作为单个二进制文件安装。
  * 除了 GitHub Container Registry（GHCR）以外，您还可以通过 `docker pull public.ecr.aws/timeplus/proton`提取 Proton Docker。
  * 由Marvin Hansen (Emet-Labs的负责人) 贡献的Proton Rust客户端的初始版本现已在 https://crates.io/crates/proton_client 上公开发布。

*Timeplus 云服务:*
  * 对于 NATS 数据源，我们在用户界面中添加了选择 JWT 或 NKey 文件内容进行身份验证的选项。
  * 当你使用 Avro 架构注册表添加 Confluent Cloud 数据源时，用户界面会为新数据流建议一组列名，但您需要选择正确的数据类型。 未来，我们将对其进行增强，使其从架构注册表加载数据类型。
  * 在即将发布的版本中，您将能够在 Timeplus Cloud 中运行任何 SQL，包括 `CREATE EXTERNAL TABLE` 和其他数据定义语言 (DDL)。 联系我们，抢先体验这项新功能。

## On the Data Lineages page, if you move the tiles around, we will remember their positions and show them in the same positions the next time you visit this page. To return to default positions, click the Reset Layout button in the top right corner.

*Proton：*
  * 自 Proton v1.4.2 以来，我们增加了对读取或写入 ClickHouse 表格的支持。 为此，我们在 Proton 中引入了一个新概念：“外部表”。 与 [External Stream](external-stream)类似，Proton 中不保留任何数据。 将来，我们将通过引入其他类型的外部表来支持更多的集成。 [有关用例和更多详细信息，请参阅我们的文档](proton-clickhouse-external-table) 。
  * 根据用户反馈，我们简化了读取 Kafka 主题中 JSON 文档中键/值对的过程。 你不需要将所有键定义为列，也无需在 DDL 或 SQL 中设置 `input_format_skip_unknown_fields`。 [了解更多](proton-kafka#multi_col_read)
  * 对于随机流，您现在可以将 EPS（每秒事件数）定义为 0 到 1 之间的数字。 例如，eps=0.5 表示每 2 秒生成一个事件。
  * 添加了一个新的 [extract_key_value_pairs](functions_for_text#extract_key_value_pairs) 函数，用于将键值对从字符串提取到哈希字典。
  * 我们改进了若干关于产品用量匿名上报的配置。 无论是单一二进制部署还是 Docker 部署，你都可以设置一个 `TELEMETRY_ENABLED` 环境变量。 报告间隔从 2 分钟更改为 5 分钟。
  * 对我们文档的改进：重新组织了 Proton 文档，添加了 [“Proton How To” 页面](proton-howto)，并更新了有关为 [Kafka 外部流](proton-kafka#create-external-stream)使用认证的详细信息。

*Timeplus Cloud：*
  * 引入一个新的数据源：HTTP 流。 输入URL、方法以及可选标头和有效负载。
  * 现在已为 NATS 源添加了身份验证。
  * 对于外部流，我们在侧面板中查看详细信息时添加了更多信息，例如 Kafka 代理、主题和数据结构。
  * 在查询历史记录中，如果查询失败，您现在可以从工具提示中复制错误消息。

## 数据源和下游

*Proton：*
  * Proton v1.4.1 现已发布。 请注意：您不能使用旧版本的 Proton 客户端连接到新的 v1.4 Proton 服务器——请务必更新您的 Proton 客户端。 所有现有的 JDBC、ODBC、Go 和 Python 驱动程序仍将照常运行。
  * (v1.3.31) 我们添加了新的外部流设置 `message_key`，该表达式返回用作每行的消息密钥的字符串值。 `message_key`可以与 `sharding_expr`（它在 Kafka 主题中指定目标分区号）一起使用，而 “sharding_expr” 的优先级更高。 [了解更多](proton-kafka#messagekey)
  * You can now create an external stream with multiple columns while reading Kafka. [Learn more](proton-kafka#multi_col_read)
  * (v1.3.31) 默认情况下，我们禁用历史回填排序。 [在我们的查询指南中了解更多](query-syntax#query-settings) ，包括如何启用。
  * Proton与Upstash的集成：使用Upstash创建Kafka集群和主题，作为数据源或数据下游。 适用于 [Timeplus Cloud](https://upstash.com/docs/kafka/integrations/timeplus) 和 [Proton](https://upstash.com/docs/kafka/integrations/proton)。

*Timeplus Cloud：*
  * In Data Lineage, external streams are now shown in a different color for better distinction.
  * Also in Data Lineage, you can search by keyword.
  * In chart format settings, you can set the maximum numbers of characters to show for a label on the x- or y-axis.
  * We now auto-select a chart type based on your data. If you have a datetime column and numeric columns, we will default to a line chart. If you have only numeric columns: single value chart. And if no numeric columns: table chart.

## Jan 8, 2024

*Proton：*
  * We've added a new example in the [proton/examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder for [Coinbase](https://github.com/timeplus-io/proton/tree/develop/examples/coinbase).
  * (v1.3.30) New functions for aggregation: [stochastic_linear_regression_state](functions_for_agg#stochastic_linear_regression_state) and [stochastic_linear_regression](functions_for_agg#stochastic_linear_regression).
  * (v1.3.30) New functions for processing text: [base64_encode](functions_for_text#base64_encode), [base64_decode](functions_for_text#base64_decode), [base58_encode](functions_for_text#base58_encode), and [base58_decode](functions_for_text#base58_decode),
  * (v1.3.30) When creating an external stream, you can set sasl_mechanism to SCRAM-SHA-512, SCRAM-SHA-256, or PLAIN (default value). Learn more with [examples](proton-kafka#create-external-stream) in our docs. Learn more with [examples](proton-kafka#create-external-stream) in our docs.

*Timeplus Cloud：*
  * In dashboard charts, you can now switch the chart into a table view.
  * Also in dashboard charts: additional options in View and Edit modes, such as Go Fullscreen, are shown in a dropdown. The chart size selector in Edit mode show an example of the size. The chart size selector in Edit mode show an example of the size.

## Dec 27, 2023

*Proton：*
  * Check out new examples in the [proton/examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder: [CDC](https://github.com/timeplus-io/proton/tree/develop/examples/cdc), [awesome-sensor-logger](https://github.com/timeplus-io/proton/tree/develop/examples/awesome-sensor-logger), and [fraud detection](https://github.com/timeplus-io/proton/tree/develop/examples/fraud_detection)
  * (v1.3.29) Introduced new SQL commands for [managing format schemas](proton-format-schema) (for now, only Protobuf schemas are supported).
  * (v1.3.28) For `create random stream`, the default interval_time is now 5 milliseconds, instead of 100 milliseconds. This new default value will generate random data more evenly. This new default value will generate random data more evenly.
  * (v1.3.28) Function names are no longer case sensitive. You can use count(), COUNT(), or Count(). (v1.3.28) Function names are no longer case sensitive. You can use count(), COUNT(), or Count(). This improves the compatibility for Proton with 3rd party tools if they generate SQL statements in uppercase.
  * (v1.3.27) Random stream supports ipv4 and ipv6 data type.
  * [Proton Metabase Driver (v0.0.3)](https://github.com/timeplus-io/metabase-proton-driver) is released to improve compatibility for Proton with case insensitive SQL functions.
  * The [Grafana plugin for Proton](https://grafana.com/grafana/plugins/timeplus-proton-datasource) has been enhanced and published on Grafana Catalog. You can install it via admin pages without downloading the file manually. Please make sure both 8463 and 3218 ports from Proton are accessible from Grafana, since the new version will call Proton query analyzer API (on 3218) to determine whether it is a streaming query or not, then render results differently. With this plugin, you can build charts and dashboards with data in Proton, as well as other data sources configured in your Grafana. Give it a try and let us know what you think!

*Timeplus Cloud：*
  * New Core NATS/JetStream datasource is now available. We welcome any feedback! We welcome any feedback!
  * WebSocket source now supports multiple open messages.
  * The chart type selector is now a dropdown, with hints for required columns when a type is disabled.
  * In the Query page's Stream Catalog, you can search by either stream or column.
  * In chart format settings, single color palettes are expanded to include 10 shades of a color (previously 3).
  * Tooltips are available on mouseover for charts in fullscreen mode.

## Dec 11, 2023

*Our [Grafana data source plugin](https://github.com/timeplus-io/proton-grafana-source), to connect to Proton and visualize streaming or batch queries, is now open source. Stay tuned for our upcoming blog and demo!*
  * [Proton JDBC 驱动程序](https://github.com/timeplus-io/proton-java-driver) 的新版本 (v0.6.0) 已上线：能够列出 DBeaver 和 Metabase 中的表和列。
  * [Proton Metabase驱动](https://github.com/timeplus-io/metabase-proton-driver) 的新版本 (v0.0.2) 已推出：能够列出表和列。
  * 新增函数： [lag_behind](functions_for_streaming#lag_behind)，专为流 JOIN 而设计。 如果您未指定列名，则查询将使用左右流的处理时间来比较时间戳差异。

*Timeplus Cloud：*
  * 新的 WebSocket 数据源：通过输入 URL 和数据类型（JSON 或文本）将 Timeplus 与 WebSocket 连接。
  * 直接输入 SQL 创建外部流。
  * 将 CSV 数据上传到现有流。
  * 在查询页面的流目录中，您可以通过流、列或两者进行搜索。
  * 在仪表板图表中，我们现在在鼠标悬停时显示所有图表类型的 “上次更新” 时间。
  * （预览功能）推出新的数据源：NATS 和 NATS JetStream。 配置用户界面将很快在 Timeplus Cloud 中推出。 如果您想试用此功能，请联系我们。

## Nov 27, 2023

*Proton：*
  * [Metabase driver](https://github.com/timeplus-io/metabase-proton-driver) for Proton is now open source.
  * Proton JDBC driver is now available via [Maven](https://central.sonatype.com/artifact/com.timeplus/proton-jdbc).
  * You can now connect Proton to [Pulse](https://www.timestored.com/pulse/) for OHLC charts.
  * New functions added: [untuple](functions_for_comp#untuple), [tuple_element](functions_for_comp#tuple_element), [dict_get](functions_for_comp#dict_get), [dict_get_or_default](functions_for_comp#dict_get_or_default), [columns](functions_for_comp#columns), [apply](functions_for_comp#apply), [any](functions_for_agg#any), and [last_value](functions_for_agg#last_value).
  * You can now create an external stream with multiple columns while reading Kafka. [了解更多](proton-kafka#multi_col_read)

*Timeplus Cloud：*
  * An unlimited number of columns are now supported in the column chart (previously retricted to recent 30 results).
  * The Pulsar sink is enhanced to support batch, to improve writing performance.
  * "External Streams" is now shown in the left-side navigation menu, where you can see all external streams and create a new one.
  * (Preview) We've added the open-high-low-close ([OHLC](viz#ohlc-chart)) chart type common in the finance industry, to visualize the movement of prices over time. Additional format settings include choosing a time range. Please contact us if you'd like to try this new chart type. Additional format settings include choosing a time range. Please contact us if you'd like to try this new chart type.

## 2023年11月13日

*Timeplus is now open source! Introducing **Proton**, a unified, lightweight streaming and historical data processing engine in a single binary, powering the Timeplus Cloud streaming analytics platform. [Try Proton with Docker](https://github.com/timeplus-io/proton)*
  * Proton的[JDBC driver](https://github.com/timeplus-io/proton-java-driver)现已开源。 请查看我们有关如何链接DBeaver到Proton的[演示示例](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc)。 以及如何在[Pulse UI](https://github.com/timestored/pulseui/pull/139)中使用Proton。
  * 此外，我们还提供了一个实验性[ODBC driver](https://github.com/timeplus-io/proton-odbc)，用于从PowerBI等工具访问Proton
  * Proton中还新增了一个实验性的`shuffle by`子句。 Currently, it only works for historical queries, and it will support streaming queries soon. The key use case for `shuffle by` is to support high cardinality `group by` (such as 10 millions of unique keys). To learn more about this advanced feature, join the discussion in our [Slack community](https://timeplus.com/slack).
  * Since version 1.3.19, by default, the backfill from historical store for time travel/rewind is enabled. Since version 1.3.19, by default, the backfill from historical store for time travel/rewind is enabled. For example `select * from stream where _tp_time>now()-14d` will load data from historical store for last 14 days, even for data not available in streaming storage. If you prefer the previous behavior, you can add `settings enable_backfill_from_historical_store=false` to the streaming SQL. If you prefer the previous behavior, you can add `settings enable_backfill_from_historical_store=false` to the streaming SQL.

*Timeplus Cloud：*
  * In Data lineage, when you click on a resource tile, the path of related tiles is highlighted and the rest is grayed out.
  * For map charts, the size of the dot is now correlated to the width of the dot in pixels.
  * When creating a source, if you choose Protobuf as the Read As data type, the Protobuf message and definition are now mandatory to proceed.
  * You can copy your workspace ID by clicking on your workspace name in the top header and hovering on the ID. This is useful if you need to speak to us for support about your workspace. This is useful if you need to speak to us for support about your workspace.


*Timeplus Platform:*
  * For on-prem deployment of Timeplus Platform, we now provide two observability options: using Timeplus or using Grafana/Loki.

## Oct 30, 2023

*The [Grafana plugin for Proton](https://grafana.com/grafana/plugins/timeplus-proton-datasource) has been enhanced and published on Grafana Catalog. You can install it via admin pages without downloading the file manually. Please make sure both 8463 and 3218 ports from Proton are accessible from Grafana, since the new version will call Proton query analyzer API (on 3218) to determine whether it is a streaming query or not, then render results differently. With this plugin, you can build charts and dashboards with data in Proton, as well as other data sources configured in your Grafana. Give it a try and let us know what you think!*
  * You can now install single native binary for Mac or Linux - check out our installation guide [here](https://github.com/timeplus-io/proton/wiki/Install-single-binary-Proton).
  * External streams support writing. External streams support writing. [(Learn more)](proton-kafka#write-to-kafka-with-sql)
  * External streams also support reading from specific Kafka partition(s). [(Learn more)](proton-kafka#read-specified-partitions) [(Learn more)](proton-kafka#read-specified-partitions)

*Timeplus Cloud：*
  * Per customer feedback, we added a new capability to allow users to monitor the infra usages for their workspace, such as cpu/memory/disk/network. Check out an example dashboard [here](https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90), and please contact us if you want to enable this experimental feature in your workspace. Check out an example dashboard [here](https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90), and please contact us if you want to enable this experimental feature in your workspace.
  * When creating an Apache Kafka, Confluent Cloud, or Redpanda source, we now display available topics in a dropdown. You can also enter a topic manually. You can also enter a topic manually.
  * The CSV upload process is refined - we will auto-generate a column name if there is no header row available in your file.
  * Search by keyword in resource list pages is no longer case sensitive.
  * When formatting a single value chart, you can now add a blank space in the unit field (eg. if you want to have a space to separate the value and the unit).
  * Dashboard query variables dropdowns have a new UI: when searching, instead of highlighting matching items, we will now only show matching items in the dropdown.
  * When deleting a query bookmark, a confirmation dialog will be shown.

## Oct 16, 2023

*Proton：*
  * New data types now supported: ipv4 and ipv6, as well as related [functions](functions_for_url).
  * [Python Driver](https://github.com/timeplus-io/proton-python-driver) 0.2.10 now supports Python 3.11 and 3.12.
  * [Go Driver](https://github.com/timeplus-io/proton-go-driver) is now open source.
  * Our [Grafana data source plugin](https://github.com/timeplus-io/proton-grafana-source), to connect to Proton and visualize streaming or batch queries, is now open source. Stay tuned for our upcoming blog and demo!
  * We've added [User-Defined Functions](proton-create-udf) support in Proton v1.3.15 (create/delete), allowing you to leverage existing programming libraries, integrate with external systems, or make SQL easier to maintain.

*Timeplus Cloud：*
  * You can now search by keyword(s) in the Dashboards list.
  * In the Query page, we've removed Recent Queries from the SQL Helper side panel. In the Query page, we've removed Recent Queries from the SQL Helper side panel. You can still see your Recent Queries by opening a new query tab, or on your Homepage.

## Oct 2, 2023

Timeplus is now open source! Introducing **Proton**, a unified, lightweight streaming and historical data processing engine in a single binary, powering the Timeplus Cloud streaming analytics platform. [Try Proton with Docker](https://github.com/timeplus-io/proton)

*New in Proton:*
  * External stream now supports checkpoints. External stream now supports checkpoints. Whether you stop and rerun the query, or the server restarts, it will read from where it stopped.
  * [Python driver](https://github.com/timeplus-io/proton-python-driver) and [Go driver](https://github.com/timeplus-io/proton-go-driver) are published.

*New in Timeplus Cloud:*

**Sinks**
  * We've added a ClickHouse sink, as a preview feature. You can find this option when you expand "Show more outputs". You can find this option when you expand "Show more outputs".
  * We've also made it easier for you to create new sinks, by adding a "Create New Sink" button to the Sinks list page. On the Query page, while waiting for results to come in, you can now also create a sink. On the Query page, while waiting for results to come in, you can now also create a sink.

**控制台用户界面**
  * Our onboarding experience has a new look. Our onboarding experience has a new look. After [creating a new account](https://us.timeplus.cloud), answer a couple of quick questions so we can get to know you better, and then give your workspace a name. 

## Sep 18, 2023

**数据库**
  * New functions to generate random data – check them out [here](functions_for_random).

**数据摄取**
 * During the Preview step of adding a new source, we now show you the time remaining for previewing data. If no event comes in after 30 seconds, you can go back to previous steps, check your configuration, then try again.
 * For "Sample dataset", you can select an [event time column](eventtime) when you set up the stream. CSV file uploads will be enhanced soon. CSV file uploads will be enhanced soon.
 * All sources now have data retention options when you create a new stream.

**Sinks**
 * We've added a sink for Confluent Cloud. We've added a sink for Confluent Cloud. This is similar to the Apache Kafka sink, with mandatory authentication.

**控制台用户界面**
 * In resource lists such as Views, Materialized Views, Sinks, and Query History, the SQL is now shown in one line without breaks.

## Sep 5, 2023

The Terraform Provider for Timeplus is now published - [check it out](https://registry.terraform.io/providers/timeplus-io/timeplus/latest).

**查询**
  * You can now edit a query without canceling it, and then run the new query, or open it in a new tab.
  * When the SQL editor is empty, the `Format` button is now disabled.

**仪表板和图表**
  * We improved our color scheme selector in charts, letting you choose from a set of pre-made color schemes, in addition to using multiple shades of a single color.
  * While viewing a dashboard, you can view or edit JSON definitions.

**Data Ingestions**
  * When you upload a CSV file, the historical store retention policy of the newly created stream will by default be set as "Don't remove older data" (previously 30 days). This can work better when you use the CSV for lookup table or quick tests with historical data. This can work better when you use the CSV for lookup table or quick tests with historical data.

**Workspace Settings**
  * Workspace owners can now opt in or out of anonymous page view tracking, in the new Privacy tab in Workspace Settings. Please see our [Privacy Policy](https://www.timeplus.com/privacy-policy) for more details on how your workspace data is tracked and used. Please see our [Privacy Policy](https://www.timeplus.com/privacy-policy) for more details on how your workspace data is tracked and used.

**Other Enhancement**
  * We've added a banner to inform you when a new version of Timeplus is deployed, and prompt you to refresh your browser to get the latest version. We also show a similar banner if we detect network issues. We also show a similar banner if we detect network issues.

## Aug 21, 2023

**Infrastructure as Code**
  * (Experimental) We published a developer preview of [Timeplus Provider for Terraform](https://github.com/timeplus-io/terraform-provider-timeplus). With a Timeplus workspace ID and API Key, you can use this tool to create, update, or delete resources in Timeplus, including sources, streams, views, materialized views, and sinks. More resources will be supported in the future, such as UDFs and dashboards. You can put the Terraform files in a version control system and apply branching, code review, and CICD. Comparing to SQL-based batch operation, this tool can easily manage dependencies among various resources and allow you to preview what will be changed before updating the deployment. With a Timeplus workspace ID and API Key, you can use this tool to create, update, or delete resources in Timeplus, including sources, streams, views, materialized views, and sinks. More resources will be supported in the future, such as UDFs and dashboards. You can put the Terraform files in a version control system and apply branching, code review, and CICD. Comparing to SQL-based batch operation, this tool can easily manage dependencies among various resources and allow you to preview what will be changed before updating the deployment.

**Query and Results**
  * On the Query page, we've enhanced the SQL editor to better support multi-line SQL. The editor will now auto-expand as you type. The editor will now auto-expand as you type.
  * When viewing row details in the results table, press the `up` or `down` arrows on your keyboard to see details for the previous or next row.

**控制台用户界面**
  * On the Data Ingestion page, the Add Data pop-up now shows sources directly (such as Apache Kafka, Confluent Cloud, Redpanda etc.).
  * On the Data Lineages page, if you move the tiles around, we will remember their positions and show them in the same positions the next time you visit this page. To return to default positions, click the Reset Layout button in the top right corner.
  * When you delete an API key, we will now show a pop-up to confirm the deletion.

## 2023年8月8日

Cloud GA（版本 1.3.x）

**数据库**
  * (实验性）您可以把追加数据流或[版本流](versioned-stream)转换为[变更流](changelog-stream)，只需要使用新的[changelog](functions_for_streaming#changelog)函数。 它专为高级用例而设计，例如按主键处理迟到事件。
  * 添加了用于 URL 处理的新函数 — 在 [这里](functions_for_url)查看。
  * 对于非流式查询(也就是使用[table](functions_for_streaming#table)的流），禁止了[hop](functions_for_streaming#hop) 和 [session](functions_for_streaming#session) 函数。
  * JavaScript UDF 现已对所有人开放。 在[这里](js-udf)查看。

**数据源和下游**
  * Apache Kafka 或 Redpanda 主题中的空消息现在已经跳过。
  * 如果一个数据源发送数据到一个流，您不能直接删除这个数据流。 请先删除数据源。

**控制台用户界面**
  * 在查询页面中，对于流式查询，现在会显示扫描的行、字节和 EPS。
  * 在地图图表中，您现在可以将点的大小更改为固定值，也可以根据数字列设置最小和最大范围。 您也可以调整圆点的不透明度。

**文档**
  * 优化我们的 [UDF 文档](udf)
  * 对于函数，我们为不同类别添加了 [子页面](functions)。
  * 对于流式查询中支持的函数，我们现在指出历史查询中是否也支持这些函数。
  * 改进了文档的搜索组件显示形式。  
