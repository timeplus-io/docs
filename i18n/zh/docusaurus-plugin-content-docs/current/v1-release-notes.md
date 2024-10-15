# Timeplus Cloud v1 and Proton

本页总结了Timeplus中每个重要更新内容，包括新功能和重要的错误修复。

## 2024年6月24日

\*Timeplus核心引擎（Proton v1.5.10）：

- Avro-Encoded Messages: Previously, Schema Registry must be enabled to read Avro-encoded messages. Now, SQL can be used to define the Avro schema and read these messages. [Learn more](/proton-format-schema)
- Improved Proton Client: `-h 127.0.0.1` is no longer used when launching the proton-client. Proton v1.5.10 listens on both IPv4 and IPv6 ports.

## 2024年5月28日

\*Timeplus核心引擎（Proton v1.5.9）：

- You can now run [table](/functions_for_streaming#table) function on Kafka External Streams. 您现在可以在Kafka外部流上运行`table`函数。 这将读取Kafka主题中的所有现有数据，例如`select * from table(topic) where condition=true`。
- 要获取 Kafka 主题中的消息数量，您可以运行 `select count() from table(topic)`。 这将在不到1秒的时间内有效地返回消息计数，而不会扫描每个消息正体。 这将在不到1秒的时间内有效地返回消息计数，而不会扫描每个消息正体。
- 新的高级设置可用于控制历史数据回填速度，具有特定列。 。 `select * from test_stream where _tp_time > earliest_timestamp() settings replay_speed=1, replay_time_column='time_col'`.
- New SQL functions: [parse_datetime](/functions_for_datetime#parse_datetime) and [parse_datetime_in_joda_syntax](/functions_for_datetime#parse_datetime_in_joda_syntax). 例如 `parse_datetime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')` 返回一个值为 `datetime` 类型的值，对于 '2021-01-04 23:00:00'。

_Timeplus 控制台：_

- 现在在主页的“工作区一览”部分显示了外部表的数量。
- 优化了SQL编辑器的高度调整和锁定高度行为。
- 工作区所有者现在可以看到谁创建了API密钥。

## 2024年5月13日

_Timeplus Core Engine (Proton v1.5.8):_

- `config.yaml`中的新设置: `max_consumers_per_stream` 定义了每个Kafka外部流可以创建多少个消费者。 当执行对Kafka外部流的SELECT查询时，将为该查询创建一个消费者。 这意味着同一Kafka外部流上不能并行执行超过 `max_consumers_per_stream` 个SELECT查询。 当执行对Kafka外部流的SELECT查询时，将为该查询创建一个消费者。 这意味着同一Kafka外部流上不能并行执行超过 `max_consumers_per_stream` 个SELECT查询。
- New example in the Timeplus Proton repo /examples folder: [Analyzing Nginx Access Logs](https://github.com/timeplus-io/proton/tree/develop/examples/nginx-access-logs-streaming), contributed by Timeplus Community member [Saïd Abiola](https://github.com/ayewo)

_Timeplus Console:_

- 通过顶部标题栏中的新“与我们交谈”按钮向我们发送问题或评论。
- "外部表格" 资源列表现在可在左侧导航菜单中找到。
- 要在SQL编辑器中查看资源模式，请将鼠标悬停在下划线资源上，按Ctrl +单击以打开详细侧边栏。
- 对于新图表，默认颜色将为粉色（颜色方案将为“黎明”）。
- 在图表中，当系列数量超过30时，图例将被隐藏。

## Apr 29, 2024

_Timeplus Core Engine (Proton v1.5.7):_

- You can now join multiple [versioned streams](/versioned-stream) using `LEFT JOIN` and by assigning primary key(s). 每当 JOIN 的任一端有更新时，就会发出结果。 [Learn more](/joins#version-left-version)
- Timeplus Proton 代码库 /examples 文件夹中的新示例:
  - [十亿行挑战 (1BRC)](https://github.com/timeplus-io/proton/tree/develop/examples/onebrc)，由Timeplus社区成员[Saïd Abiola](https://github.com/ayewo)
  - [实时检索增强生成(RAG)](https://github.com/timeplus-io/proton/tree/develop/examples/real-time-ai)

_Timeplus Console:_

- 外部表配置:有一个新的向导可用于与ClickHouse集成。
- 查询页面上新增了“另存为”按钮：将 SQL 保存为视图、实体视图或书签。
- 在SQL编辑器中，单击流、视图或物化视图的名称，以显示该 SQL资源的数据模式。
- 创建新数据源或外部流后，您现在将被重定向到 SQL 控制台页面。
- 查看和编辑资源详细信息：在资源列表的高级操作中删除了"编辑"选项-现在在单击"查看"图标后的侧面面板中可用。

## Apr 15, 2024

_Timeplus Core Engine (Proton v1.5.5 and v1.5.6):_

- 增加了两个新的Apache Kafka外部流设置，用于Kafka服务器认证：
  - `skip_ssl_cert_check`允许您跳过验证服务器的证书
  - `ssl_ca_pem`允许您指定证书颁发机构（CA）内容，而无需上传CA文件
- 为日期时间添加了函数：
  - `to_unix_timestamp64_milli`返回datetime64的毫秒UNIX时间戳
  - `to_unix_timestamp64_micro` 返回微秒
  - `to_unix_timestamp64_nano` 返回带有纳秒
- 新创建的流将默认将流数据保留设置为1天存储。
- 在 MacOS 上，`sudo proton install` 会将 proton 安装到 /usr/local/bin 而不是 /usr/bin。

_Timeplus Cloud and Timeplus Enterprise:_

- Added workspace templates: you can create a new workspace from scratch, or with a demo template (Market Data or Stream Processing).
- 数据采集页面的新布局，标签显示 “来源” 或 “外部流”。
- 在 Data Lineage 中，我们针对工作空间中有大量资源时对布局进行了优化。 此外，缩小将显示图标和颜色，并添加了一个用于缩小以显示全部的按钮。 此外，缩小将显示图标和颜色，并添加了一个用于缩小以显示全部的按钮。
- 为Apache Kafka外部流和接收端添加了TLS设置和证书颁发机构（CA）输入字段。

## Apr 1, 2024

_Timeplus Proton:_

- 新增支持从Apache Kafka外部流中选择消息键，通过 `SELECT _message_key, * FROM external_stream`。
- 流处理现在支持可空数据类型。
- [External Table](/proton-clickhouse-external-table#create-external-table): ClickHouse external tables with names containing special characters (such as dashes) are now supported. 只需在`CREATE EXTERNAL TABLE` DDL中设置`table='test-a-b'`。
- [External Stream](/proton-kafka#create-external-stream): Error handling and connection pooling/retry for Kafka external streams have been greatly improved.
- Materialized View: Added option to [skip dirty/unexpected data](/query-syntax#settings). 物化视图：添加了[跳过脏/意外数据](https://docs.timeplus.com/query-syntax#settings)的选项。 如果您设置`SETTINGS recovery_policy='best_effort'`，Timeplus 将尝试最多 3 次，然后跳过脏数据并继续处理其余数据。

_Timeplus Cloud and Timeplus Enterprise:_

- 为 Redpanda 无服务器添加了内置支持。 为 Redpanda 无服务器添加了内置支持。 [查看我们的操作指南](https://www.timeplus.com/post/redpanda-serverless) 物化视图：添加了[跳过脏/意外数据](https://docs.timeplus.com/query-syntax#settings)的选项。 物化视图：添加了[跳过脏/意外数据](https://docs.timeplus.com/query-syntax#settings)的选项。 如果您设置`SETTINGS recovery_policy='best_effort'`，Timeplus 将尝试最多 3 次，然后跳过脏数据并继续处理其余数据。
- 摄取 Apache Kafka 数据：我们将 Kafka 集成的实现从基于 Benthos 的实现改为基于外部流的实现。 我们的配置向导在Web控制台中保持不变。 我们的配置向导在Web控制台中保持不变。 我们的配置向导在Web控制台中保持不变。
- “来源”新左侧菜单项。 “来源”新左侧菜单项。 “来源”新左侧菜单项。 “数据接入”页面现在将仅显示用于接入数据的选项，而不列出已添加的数据源。
- 根据用户反馈，我们增强了内置的OHLC图表，即使OHLC当前窗口没有关闭，也可以显示实时更新。
- 更新了主页布局，添加了现有资源的新统计数据，并在右上角显示当前运行查询的数量。 更新了主页布局，添加了现有资源的新统计数据，并在右上角显示当前运行查询的数量。 如果您的工作空间中没有某种资源，我们现在将隐藏统计框，而不是显示 0。 更新了主页布局，添加了现有资源的新统计数据，并在右上角显示当前运行查询的数量。 如果您的工作空间中没有某种资源，我们现在将隐藏统计框，而不是显示 0。
- 在我们的[Timeplus演示工作区](https://demo.timeplus.cloud)中对3个演示进行了增强。 在我们的[Timeplus演示工作区](https://demo.timeplus.cloud)中对3个演示进行了增强。 在我们的[Timeplus演示工作区](https://demo.timeplus.cloud)中对3个演示进行了增强。 在[流处理演示](https://demo.timeplus.cloud/sp-demo/console/dashboard/ff9a0be7-434f-4774-8412-e9289e144b0a)中，我们添加了一个仪表板，展示如何使用实时数据和流式SQL计算标准偏差，并使用查询变量。

## Mar 18, 2024

Introducing three new demos with live data in our [Timeplus Demo workspace](https://demo.timeplus.cloud): Stream Processing, Market Data, and ksqlDB Alternative. Choose a demo via the dropdown in the top header. You can explore the demos in read-only mode, or take a quick guided tour.

_Timeplus 云服务:_

- 数据定义语言（DDL）在SQL控制台（以前称为查询页面）中得到支持。 您可以使用诸如 `CREATE` 和 `DROP` 等命令来修改资源。 您可以使用诸如 `CREATE` 和 `DROP` 等命令来修改资源。
- 在 Data Lineage 中，单击资源图块后，您可以直接从详细信息侧面板对其进行编辑。 请注意，只有特定字段可以编辑特定资源类型。 请注意，只有特定字段可以编辑特定资源类型。 请注意，只有特定字段可以编辑特定资源类型。
- 在数据血统中，现在包括了ClickHouse外部表。 单击该图块可查看更多详细信息，例如地址和用户名。
- 除了流之外，您现在可以将外部流和外部表设置为物化视图的目标。

## Mar 4, 2024

_Proton:_

- Proton can now natively integrate with ClickHouse, available for both ClickHouse Cloud or local/self-managed versions of ClickHouse. [了解更多](https://www.timeplus.com/post/proton-clickhouse-integration)
- 在Proton 1.5.2中，批量CSV导入得到了增强。 在Proton 1.5.2中，批量CSV导入得到了增强。 您可以通过单个SQL从多个CSV文件中加载数十亿行。 [了解更多](https://docs.timeplus.com/zh/proton-howto#csv) [Learn more](/proton-howto#csv)
- Kafka Schema Registry支持Protobuf和Avro格式（Proton 1.5.2）。 [了解更多](https://docs.timeplus.com/zh/proton-schema-registry) [了解更多](https://docs.timeplus.com/zh/proton-schema-registry) [Learn more](/proton-schema-registry)
- 支持Schema Registry的自签名HTTPS认证（Proton 1.5.3）。
- Proton现在可以在SUSE Linux上编译。

_Timeplus 云服务:_

- In Data Lineage side panels, more details about the resources are added. 点击图块进行查看。
- 数据类型，如 `float` 或 `integer` 已弃用。 数据类型，如 `float` 或 `integer` 已弃用。 数据类型，如 `float` 或 `integer` 已弃用。 UI将显示精确的数据类型，如`int8`，`uint16`等。
- In dashboard charts, the legend is maintained when rendering. Click to show or hide series.

## During the Preview step of adding a new source, we now show you the time remaining for previewing data. If no event comes in after 30 seconds, you can go back to previous steps, check your configuration, then try again.

_Proton:_

- 在 Proton v1.5.1 中，我们根据 ksqlDB 用户的反馈推出了更多的流式结果的发布政策。 最值得注意的是，当您运行 tumble/hop/session 窗口聚合时，在窗口关闭之前，中间聚合结果可以按一定的间隔或值发生变化时发出。 [Learn more in our docs](/query-syntax#emit)
- You can now install Proton as a single binary via `curl https://install.timeplus.com | sh`.
- Besides GitHub Container Registry (GHCR), you can also pull Proton Docker via `docker pull public.ecr.aws/timeplus/proton`.
- 由Marvin Hansen (Emet-Labs的负责人) 贡献的Proton Rust客户端的初始版本现已在 https://crates.io/crates/proton_client 上公开发布。

_Timeplus 云服务:_

- 对于 NATS 数据源，我们在用户界面中添加了选择 JWT 或 NKey 文件内容进行身份验证的选项。
- 当你使用 Avro 架构注册表添加 Confluent Cloud 数据源时，用户界面会为新数据流建议一组列名，但您需要选择正确的数据类型。 未来，我们将对其进行增强，使其从架构注册表加载数据类型。
- In an upcoming release, you will be able to run any SQL in Timeplus Cloud, including `CREATE EXTERNAL TABLE` and other Data Definition Language (DDL). 联系我们，抢先体验这项新功能。

## On the Data Lineages page, if you move the tiles around, we will remember their positions and show them in the same positions the next time you visit this page. To return to default positions, click the Reset Layout button in the top right corner.

_Proton (Current version: v1.4.2):_

- 自 Proton v1.4.2 以来，我们增加了对读取或写入 ClickHouse 表格的支持。 为此，我们在 Proton 中引入了一个新概念：“外部表”。 Similar to [External Stream](/external-stream), no data is persisted in Proton. In the future, we will support more integration by introducing other types of External Table. [See our docs](/proton-clickhouse-external-table) for use cases and more details.
- 根据用户反馈，我们简化了读取 Kafka 主题中 JSON 文档中键/值对的过程。 You don’t need to define all keys as columns, and no need to set `input_format_skip_unknown_fields` in DDL or SQL. [Learn more](/proton-kafka#multi_col_read)
- 对于随机流，您现在可以将 EPS（每秒事件数）定义为 0 到 1 之间的数字。 例如，eps=0.5 表示每 2 秒生成一个事件。 例如，eps=0.5 表示每 2 秒生成一个事件。 我们改进了若干关于产品用量匿名上报的配置。 我们改进了若干关于产品用量匿名上报的配置。 无论是单一二进制部署还是 Docker 部署，你都可以设置一个 `TELEMETRY_ENABLED` 环境变量。 报告间隔从 2 分钟更改为 5 分钟。 报告间隔从 2 分钟更改为 5 分钟。
- A new [extract_key_value_pairs](/functions_for_text#extract_key_value_pairs) function is added to extract key value pairs from a string to a map.
- 我们改进了若干关于产品用量匿名上报的配置。 Regardless if it’s a single binary or Docker deployment, you can set a `TELEMETRY_ENABLED` environment variable. 报告间隔从 2 分钟更改为 5 分钟。
- Enhancements to our docs: re-organized Proton docs, added a [“Proton How To“ page](/proton-howto), and updated details on using certifications for [Kafka external stream](/proton-kafka#create-external-stream).

_Timeplus 云服务:_

- 自 Proton v1.4.2 以来，我们增加了对读取或写入 ClickHouse 表格的支持。 为此，我们在 Proton 中引入了一个新概念：“外部表”。 与 [外部流] (https://docs.timeplus.com/zh/external-stream) 类似，Proton 中不保留任何数据。 将来，我们将通过引入其他类型的外部表来支持更多的集成。 [请参阅我们的文档] (https://docs.timeplus.com/zh/proton-clickhouse-external-table) 以获取用例和更多详细信息。 引入一个新的数据源：HTTP 流。 输入URL、方法以及可选标头和有效负载。
- 现在已为 NATS 源添加了身份验证。
- 对于外部流，我们在侧面板中查看详细信息时添加了更多信息，例如 Kafka 代理、主题和数据结构。
- 在查询历史记录中，如果查询失败，您现在可以从工具提示中复制错误消息。

## 数据源和下游

_Proton:_

- Proton v1.4.1 现已发布。 请注意：您不能使用旧版本的 Proton 客户端连接到新的 v1.4 Proton 服务器——请务必更新您的 Proton 客户端。 所有现有的 JDBC、ODBC、Go 和 Python 驱动程序仍将照常运行。 请注意：您不能使用旧版本的 Proton 客户端连接到新的 v1.4 Proton 服务器——请务必更新您的 Proton 客户端。 所有现有的 JDBC、ODBC、Go 和 Python 驱动程序仍将照常运行。 请注意：您不能使用旧版本的 Proton 客户端连接到新的 v1.4 Proton 服务器——请务必更新您的 Proton 客户端。 所有现有的 JDBC、ODBC、Go 和 Python 驱动程序仍将照常运行。
- (v1.3.31) 我们添加了新的外部流设置 `message_key`，该表达式返回用作每行的消息密钥的字符串值。 (v1.3.31) 我们添加了新的外部流设置 `message_key`，该表达式返回用作每行的消息密钥的字符串值。 `message_key`可以与 `sharding_expr`（它在 Kafka 主题中指定目标分区号）一起使用，而 “sharding_expr” 的优先级更高。 [了解更多] (https://docs.timeplus.com/zh/proton-kafka#messagekey) [Learn more](/proton-kafka#messagekey)
- (v1.3.31) Write to Kafka in plain text: you can now [produce raw format data](/proton-kafka#single_col_write) to a Kafka external stream with a single column.
- (v1.3.31) 默认情况下，我们禁用历史回填排序。 [Learn more](/query-settings) in our query guide, including how to enable.

_Timeplus 云服务:_

- 在 Data Lineage 中，外部流现在以不同的颜色显示，以便更好地区分。
- 此外，在 “数据血缘” 中，您可以按关键字进行搜索。
- 在图表格式设置中，您可以设置在 x 或 y 轴上为标签显示的最大字符数。
- 现在，我们会根据您的数据自动选择图表类型。 现在，我们会根据您的数据自动选择图表类型。 现在，我们会根据您的数据自动选择图表类型。 如果您有日期时间列和数字列，我们将默认为折线图。 如果您只有数字列：单值图表。 如果没有数字列：表格图表。 如果您只有数字列：单值图表。 如果没有数字列：表格图表。 如果您只有数字列：单值图表。 如果没有数字列：表格图表。

## 2024 年 1 月 8 日

_Proton:_

- 我们在 [proton/examples] (https://github.com/timeplus-io/proton/tree/develop/examples) 目录添加了一个 [Coinbase] (https://github.com/timeplus-io/proton/tree/develop/examples/coinbase) 的新示例。
- (v1.3.30) New functions for aggregation: [stochastic_linear_regression_state](/functions_for_agg#stochastic_linear_regression_state) and [stochastic_logistic_regression](/functions_for_agg#stochastic_logistic_regression).
- (v1.3.30) New functions for processing text: [base64_encode](/functions_for_text#base64_encode), [base64_decode](/functions_for_text#base64_decode), [base58_encode](/functions_for_text#base58_encode), and [base58_decode](/functions_for_text#base58_decode),
- (v1.3.30) 创建外部流时，可以将 sasl_mechanics 设置为 SCRAM-SHA-512、SCRAM-SHA-256 或 PLAIN（默认值）。 通过我们的文档中的 [示例] (https://docs.timeplus.com/zh/proton-kafka#create-external-stream) 了解更多信息。 Learn more with [examples](/proton-kafka#create-external-stream) in our docs.

_Timeplus 云服务:_

- 在仪表盘图表中，您现在可以将图表切换到表格视图。
- 在仪表板图表中：在下拉列表中提供全屏显示等选项。 在仪表板图表中：在下拉列表中提供全屏显示等选项。 编辑模式下的图表大小选择器显示了大小示例。 在仪表板图表中：在下拉列表中提供全屏显示等选项。 编辑模式下的图表大小选择器显示了大小示例。

## Dec 27, 2023

_Proton:_

- 查看 [proton/examples] (https://github.com/timeplus-io/proton/tree/develop/examples) 文件夹中的新示例：[CDC] (https://github.com/timeplus-io/proton/tree/develop/examples/cdc)、[awesome-sensor-Logger] (https://github.com/timeplus-io/proton/tree/develop/examples/awesome-sensor-logger) 和 [欺诈检测] (https://github.com/timeplus-io/proton/tree/develop/examples/fraud_detection)
- (v1.3.29) Introduced new SQL commands for [managing format schemas](/proton-format-schema) (for now, only Protobuf schemas are supported).
- (v1.3.28) 对于 `create random stream`，默认 interval_time 现在是 5 毫秒，而不是 100 毫秒。 这个新的默认值将更连续地生成随机数据。 这个新的默认值将更连续地生成随机数据。 这个新的默认值将更连续地生成随机数据。
- (v1.3.28) 函数名称不再区分大小写。 (v1.3.28) 函数名称不再区分大小写。 您可以使用count(), COUNT(), 或 Count(). 在 Proton 与其他工具整合时，忽略大小写将进一步提高兼容性。
- (v1.3.27) 随机流支持 ipv4 和 ipv6 数据类型。
- [Proton Metabase Driver (v0.0.3)](https://github.com/timeplus-io/metase-proton-driver)已发布，利用新版 Proton 的 SQL 函数大小写不敏感以提高兼容性。
- [Proton 的 Grafana 插件] (https://grafana.com/grafana/plugins/timeplus-proton-datasource) 已得到增强并发布在 Grafana Catalog 上。 您可以通过管理页面进行安装，而无需手动下载文件。 请确保可以从 Grafana 访问 Proton的 8463 和 3218 端口，因为新版本将调用 Proton 查询分析器 API（在 3218 上）来确定它是否是流式查询，然后以不同的方式呈现结果。 使用此插件，您可以使用 Proton 中的数据以及在 Grafana 中配置的其他数据源来构建图表和仪表板。 试一试，告诉我们你的想法！ 您可以通过管理页面进行安装，而无需手动下载文件。 请确保可以从 Grafana 访问 Proton的 8463 和 3218 端口，因为新版本将调用 Proton 查询分析器 API（在 3218 上）来确定它是否是流式查询，然后以不同的方式呈现结果。 使用此插件，您可以使用 Proton 中的数据以及在 Grafana 中配置的其他数据源来构建图表和仪表板。 试一试，告诉我们你的想法！ 您可以通过管理页面进行安装，而无需手动下载文件。 请确保可以从 Grafana 访问 Proton的 8463 和 3218 端口，因为新版本将调用 Proton 查询分析器 API（在 3218 上）来确定它是否是流式查询，然后以不同的方式呈现结果。 使用此插件，您可以使用 Proton 中的数据以及在 Grafana 中配置的其他数据源来构建图表和仪表板。 试一试，告诉我们你的想法！

_Timeplus 云服务:_

- 新的 Core NATS/JetStream 数据源现已推出。 我们欢迎任何反馈！ 我们欢迎任何反馈！ 我们欢迎任何反馈！
- WebSocket 源现在支持多条打开的消息。
- 图表类型选择器现在是一个下拉列表，其中包含禁用类型时所需列的提示。
- 在查询页面的流目录中，您可以通过流、列或两者进行搜索。
- 在图表格式设置中，单色板扩展到包括10种颜色(之前为三种)。
- 对于全屏模式下的图表，鼠标悬停在工具提示上可用。

## Dec 11, 2023

_Proton:_

- [Proton JDBC 驱动程序] (https\://github.com/timeplus-io/proton-java-driver) 的新版本 (v0.6.0) 已上线：能够列出 dBeaver 和 Metabase 中的表和列。
- [Proton Metabase 驱动程序] (https\://github.com/timeplus-io/metabase-proton-driver) 的新版本 (v0.0.2) 已上线：能够列出表和列。
- New function: [lag_behind](/functions_for_streaming#lag_behind), designed for streaming JOIN. 如果您未指定列名，则查询将使用左右流的处理时间来比较时间戳差异。

_Timeplus 云服务:_

- 新的 WebSocket 数据源：通过输入 URL 和数据类型（JSON 或文本）将 Timeplus 与 WebSocket 连接。
- 直接输入 SQL 创建外部流。
- 将 CSV 数据上传到现有流。
- 在查询页面的流目录中，您可以通过流、列或两者进行搜索。
- 在仪表板图表中，我们现在在鼠标悬停时显示所有图表类型的 “上次更新” 时间。
- （预览功能）推出新的数据源：NATS 和 NATS JetStream。 配置用户界面将很快在 Timeplus Cloud 中推出。 如果您想试用此功能，请联系我们。

## 2023年11月27日

_Proton:_

- Proton 的 [Metabase驱动程序] (https\://github.com/timeplus-io/metabase-proton-driver) 现已开源。
- Proton JDBC 驱动程序可以通过 [Maven](https://central.sonatype.com/artifact/com.timeplus/proton-jdbc) 下载。
- 你现在可以将 Proton 连接到 [Pulse](https://www.timestored.com/pulse/) 展示 OHLC 股票图表。
- New functions added: [untuple](/functions_for_comp#untuple), [tuple_element](/functions_for_comp#tuple_element), [columns](/functions_for_comp#columns), [apply](/functions_for_comp#apply), [any](/functions_for_agg#any), and [last_value](/functions_for_agg#last_value).
- 现在，你可以在读取 Kafka 时创建包含多列的外部流。 [了解更多] (https://docs.timeplus.com/zh/proton-kafka#multi_col_read) [Learn more](/proton-kafka#multi_col_read)

_Timeplus 云服务:_

- An unlimited number of columns are now supported in the column chart (previously restricted to recent 30 results).
- Pulsar 数据下游经过增强，可以支持批处理，从而提高写入性能。
- “外部流”现在显示在左侧导航菜单中，您可以看到所有外部流并创建一个新流.
- (Preview) We've added the open-high-low-close ([OHLC](/viz#ohlc-chart)) chart type common in the finance industry, to visualize the movement of prices over time. 其他格式设置包括选择时间范围。 如果您想尝试这种新的图表类型，请联系我们。

## 2023年11月13日

_Proton:_

- 适用于 Proton 的 [JDBC 驱动程序] (https://github.com/timeplus-io/proton-java-driver) 现已开源。 请查看我们的 [文档](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc)，了解如何使用 DBeaver 连接到 Proton。 我们还向 [Pulse UI] (https://github.com/timestored/pulseui/pull/139) 提交了 PR。
- 我们还提供了一个实验性的 [ODBC 驱动程序] (https\://github.com/timeplus-io/proton-odbc)， 供 PowerBI 等工具连接Proton作为数据源。
- 添加了实验性的 “SHUFFLE BY”字句。 目前，它仅适用于历史查询，并且很快将支持流式查询。 “shuffle by” 的关键场景是支持高基数 “group by”（例如 1000 万个独立值）。 要了解有关此高级功能的更多信息，请加入我们的 [Slack 社区] (https://timeplus.com/slack) 的讨论。
- 自版本 1.3.19 起，默认情况下，我们将使用历史存储来回填数据。 例如，`select * from stream where _tp_time>now()-14d` 将从历史存储中加载过去 14 天的数据，即使数据在流存储中不可用。 如果你更喜欢之前的行为，可以在流式SQL 中添加 `settings enable_backfill_from_historical_store=false`

_Timeplus 云服务:_

- 在数据谱系中，当您单击资源图块时，相关图块的路径将突出显示，其余图块显示为灰色。
- 对于地图，点的大小现在与点的宽度（以像素为单位）相关联。
- 创建数据源时，如果选择 Protobuf 作为 “读取” 数据类型，则现在必须使用 Protobuf 消息和定义才能继续。
- 您可以通过单击顶部标题中的工作区名称并将鼠标悬停在 ID 上来复制您的工作空间 ID。 如果您需要向我们寻求有关工作空间的支持，这会很有用。

_Timeplus Platform:_

- For on-prem deployment of Timeplus Platform, we now provide two observability options: using Timeplus or using Grafana/Loki.

## Oct 30, 2023

_Proton:_

- You can now install single native binary for Mac or Linux - check out our installation guide [here](https://github.com/timeplus-io/proton/wiki/Install-single-binary-Proton).
- 外部流支持写入。 [(Learn more)](/proton-kafka#write-to-kafka-with-sql)
- External streams also support reading from specific Kafka partition(s). <a href="proton-kafka#read-specified-partitions">(Learn more)</a> [(Learn more)](/proton-kafka#read-specified-partitions)

_Timeplus 云服务:_

- Per customer feedback, we added a new capability to allow users to monitor the infra usages for their workspace, such as cpu/memory/disk/network. Check out an example dashboard <a href="https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90">here</a>, and please contact us if you want to enable this experimental feature in your workspace. Check out an example dashboard [here](https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90), and please contact us if you want to enable this experimental feature in your workspace.
- When creating an Apache Kafka, Confluent Cloud, or Redpanda source, we now display available topics in a dropdown. You can also enter a topic manually. 您也可以手动输入主题。
- CSV 上传流程已完善-如果您的文件中没有可用的标题行，我们将自动生成列名。
- 在资源列表页面中按关键字搜索不再区分大小写。
- When formatting a single value chart, you can now add a blank space in the unit field (e.g. if you want to have a space to separate the value and the unit).
- 仪表板查询变量下拉列表有了新的用户界面：搜索时，我们现在将仅在下拉列表中显示匹配的项目，而不是突出显示匹配的项目。
- 删除查询书签时，将显示一个确认对话框。

## Oct 16, 2023

_Proton:_

- New data types now supported: ipv4 and ipv6, as well as related [functions](/functions_for_url).
- [Python Driver](https://github.com/timeplus-io/proton-python-driver) 0.2.10 now supports Python 3.11 and 3.12.
- [Go Driver](https://github.com/timeplus-io/proton-go-driver) is now open source.
- Our [Grafana data source plugin](https://github.com/timeplus-io/proton-grafana-source), to connect to Proton and visualize streaming or batch queries, is now open source. 敬请关注我们即将发布的博客和演示！
- We've added User-Defined Functions support in Proton v1.3.15 (create/delete), allowing you to leverage existing programming libraries, integrate with external systems, or make SQL easier to maintain.

_Timeplus 云服务:_

- 现在，您可以在 “仪表盘” 列表中按关键字进行搜索。
- 在 “查询” 页面中，我们已从 SQL Helper 侧面板中删除了 “最近查询”。 In the Query page, we've removed Recent Queries from the SQL Helper side panel. You can still see your Recent Queries by opening a new query tab, or on your Homepage.

## Oct 2, 2023

Timeplus 现已开源！ Introducing **Proton**, a unified, lightweight streaming and historical data processing engine in a single binary, powering the Timeplus Cloud streaming analytics platform. [Try Proton with Docker](https://github.com/timeplus-io/proton)

_New in Proton:_

- 外部流现在支持检查点。 External stream now supports checkpoints. Whether you stop and rerun the query, or the server restarts, it will read from where it stopped.
- [Python driver](https://github.com/timeplus-io/proton-python-driver) and [Go driver](https://github.com/timeplus-io/proton-go-driver) are published.

_New in Timeplus Cloud:_

**Sinks**

- We've added a ClickHouse sink, as a preview feature. You can find this option when you expand "Show more outputs". 当您展开 “显示更多输出” 时，可以找到此选项。
- We've also made it easier for you to create new sinks, by adding a "Create New Sink" button to the Sinks list page. On the Query page, while waiting for results to come in, you can now also create a sink.在查询页面上，在等待结果出来的同时，你现在还可以创建数据下游。

**Console UI**

- 我们的新用户体验焕然一新。 After [creating a new account](https://us.timeplus.cloud), answer a couple of quick questions so we can get to know you better, and then give your workspace a name.

## Sep 18, 2023

**Database**

- New functions to generate random data – check them out [here](/functions_for_random).

**数据摄取**

- 在预览添加新源的步骤中，我们现在向您展示预览数据的剩余时间。 如果在 30 秒后没有事件发生，您可以返回到以前的步骤，请检查您的配置，然后重试。
- For "Sample dataset", you can select an [event time column](/eventtime) when you set up the stream. CSV file uploads will be enhanced soon.
- 现在，当您创建新数据流时，所有来源都有数据保留选项。

**Sinks**

- 我们为 Confluent Cloud 添加了一个数据下游。 We've added a sink for Confluent Cloud. This is similar to the Apache Kafka sink, with mandatory authentication.

**Console UI**

- 现在，在视图、实例化视图、汇和查询历史记录等资源列表中，SQL 以一行显示，没有换行。

## Sep 5, 2023

The Terraform Provider for Timeplus is now published - [check it out](https://registry.terraform.io/providers/timeplus-io/timeplus/latest).

**Query**

- 现在，您可以在不取消查询的情况下对其进行编辑，然后运行新查询，或者在新Tab中将其打开。
- When the SQL editor is empty, the `Format` button is now disabled.

**仪表板和图表**

- 我们改进了图表中的配色方案选择器，除了使用单一颜色的多种色调外，您还可以从一组预制的配色方案中进行选择。
- 当查看仪表板时，您可以查看或编辑 JSON 定义。

**数据摄取**

- When you upload a CSV file, the historical store retention policy of the newly created stream will by default be set as "Don't remove older data" (previously 30 days). This can work better when you use the CSV for lookup table or quick tests with historical data. 这样做，可以方便你使用 CSV 进行查找表或对历史数据进行快速测试。

**工作区设置**

- Workspace owners can now opt in or out of anonymous page view tracking, in the new Privacy tab in Workspace Settings. Please see our <a href="https://www.timeplus.com/privacy-policy">Privacy Policy</a> for more details on how your workspace data is tracked and used. Please see our [Privacy Policy](https://www.timeplus.com/privacy-policy) for more details on how your workspace data is tracked and used.

**其他增强功能**

- We've added a banner to inform you when a new version of Timeplus is deployed, and prompt you to refresh your browser to get the latest version. We also show a similar banner if we detect network issues. 如果我们检测到网络问题，我们还会显示类似的横幅。

## 2023年21月8日

**配置代码化**

- (Experimental) We published a developer preview of [Timeplus Provider for Terraform](https://github.com/timeplus-io/terraform-provider-timeplus). 只要有 Timeplus 工作区 ID 和 API 密钥，您可以使用此工具在 Timeplus 中创建、更新或删除资源，包括源、流、视图、物化视图和数据下游。 将来将支持更多资源，例如 UDF 和仪表板。 您可以将 Terraform 文件放在版本控制系统中，然后使用代码分支、代码审查和 CICD。 与基于 SQL 的批处理操作相比，此工具可以轻松管理各种资源之间的依赖关系，并允许您在更新部署之前预览将要更改的内容。

**查询和结果**

- On the Query page, we've enhanced the SQL editor to better support multi-line SQL. The editor will now auto-expand as you type. 现在，编辑器将在您键入时自动展开。
- When viewing row details in the results table, press the `up` or `down` arrows on your keyboard to see details for the previous or next row.

**Console UI**

- 在 “数据摄取” 页面上，“添加数据” 弹出窗口现在可以直接显示数据源（例如 Apache Kafka、Confluent Cloud、Redpanda 等）。
- 在数据血缘页面上，如果您四处移动图块，我们将记住它们的位置，并在您下次访问此页面时将其显示在相同的位置。 要恢复到默认位置，请单击右上角的 “重置布局” 按钮。
- 当您删除 API 密钥时，我们现在将显示一个弹出窗口以确认删除。

## 2023年8月8日

Cloud GA（版本 1.3.x）

**Database**

- (Experimental) You can now convert append-only or [versioned streams](/versioned-stream) to [changelog streams](/changelog-stream) with the new [changelog](/functions_for_streaming#changelog) function. 它专为高级用例而设计，例如按主键处理迟到事件。
- Added new functions for URL handling – check them out [here](/functions_for_url).
- Block [hop](/functions_for_streaming#hop)/[session](/functions_for_streaming#session) functions for historical queries (i.e. with the [table](/functions_for_streaming#table) function).
- JavaScript user-defined functions (UDFs) are now publicly available – learn more [here](/js-udf).

**数据源和下游**

- Apache Kafka 或 Redpanda 主题中的空消息现在已经跳过。
- 如果一个数据源发送数据到一个流，您不能直接删除这个数据流。 请先删除数据源。

**Console UI**

- 在查询页面中，对于流式查询，现在会显示扫描的行、字节和 EPS。
- 在地图图表中，您现在可以将点的大小更改为固定值，也可以根据数字列设置最小和最大范围。 您也可以调整圆点的不透明度。

**Docs**

- Refined our [UDF docs](/udf).
- For functions, we added [sub-pages](/functions) for the different categories.
- 对于流式查询中支持的函数，我们现在指出历史查询中是否也支持这些函数。
- 改进了文档的搜索组件显示形式。
