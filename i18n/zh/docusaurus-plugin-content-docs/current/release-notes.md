# 更新日志

本页总结了Proton和Timeplus Cloud中每个主要更新的更改，包括新功能和重要错误修复。 先前测试程序的发布说明：

- [公开测试版 2](public-beta-2) （2023 年 1 月 19 日至 2023 年 8 月 3 日）
- [公开测试版 1](public-beta-1) （2022 年 10 月 3 日至 2023 年 1 月 18 日）
- [私人测试版 2](private-beta-2) （2022 年 8 月 9 日至 10 月 2 日）
- [私人测试版 1](private-beta-1) （2022 年 3 月 8 日至 8 月 8 日）

## 2024 年 5 月 28 日

*Timeplus 核心引擎（Proton v1.5.9）：*
  * 您现在可以在 Kafka 外部流上运行 [table](functions_for_streaming#table) 函数。 这将读取 Kafka 主题中的所有现有数据，例如 `从表（主题）中选择 * 其中 condition=true`。
  * 要获取 Kafka 主题中的消息数量，你可以运行 `select count () from table（主题）`。 这将在不到 1 秒的时间内有效地返回邮件数量，而无需扫描每个邮件正文。
  * 新的高级设置可用于控制特定列的历史数据回填速度。 。 `从 test_stream 中选择 * 其中 _tp_time > earliest_timestamp () 设置 replay_speed=1，replay_time_column='time_column='time_column'`。
  * 新的 SQL 函数： [parse_datetime](functions_for_datetime#parse_datetime) 和 [parse_datetime_in_joda_syntax](functions_for_datetime#parse_datetime_in_joda_syntax)。 例如 `parse_datetime ('2021-01-04+ 23:00:00 ','%Y-%m-%d+%H:%i:%s')` 以 `datetime` 类型返回 '2021-01-04 23:00:00' 的值。

*Timeplus 游戏机：*
  * 外部表的数量现在显示在主页的 “工作空间一览” 部分中。
  * 完善了 SQL 编辑器的高度调整和锁定高度行为。
  * 工作空间所有者现在可以查看谁创建了 API 密钥。

## 2024 年 5 月 13 日

_Timeplus 核心引擎（Proton v1.5.8）：_

- `config.yaml`: `max_consumers_per_stream` 中的一项新设置定义了每个 Kafka 外部流可以创建多少消费者。 在 Kafka 外部流上执行 SELECT 查询时，将为该查询创建一个使用者。 这意味着在同一 Kafka 外部流上最多可以并行执行 `max_consumers_per_stream` SELECT 查询。
- Timeplus Proton 存储库/示例文件夹中的新示例： [分析 Nginx 访问日志](https://github.com/timeplus-io/proton/tree/develop/examples/nginx-access-logs-streaming)，由 Timeplus 社区成员 [赛义德·阿比奥拉](https://github.com/ayewo)提供

_Timeplus 游戏机：_

- 通过顶部标题中的新 “与我们交谈” 按钮向我们发送问题或评论。
- 现在可以在左侧导航菜单中找到 “外部表” 资源列表。
- 要在 SQL 编辑器中查看资源架构，请将鼠标悬停在带下划线的资源上，然后按 Ctrl + 单击打开详细信息侧面板。
- 对于新图表，默认颜色将为粉色（配色方案将为 `Dawn`）。
- 在图表中，当序列数超过 30 时，图例将被隐藏。

## 2024 年 4 月 29 日

_Timeplus 核心引擎（Proton v1.5.7）：_

- 您现在可以使用 `LEFT JOIN` 并分配主键来加入多个 [版本控制的直播](versioned-stream) 。 每当 JOIN 的任一端有更新时，就会发出结果。 [了解更多](joins#version-left-version)
- Timeplus Proton repo /examples 文件夹中的新示例：
  - [十亿行挑战赛 (1BRC)](https://github.com/timeplus-io/proton/tree/develop/examples/onebrc)，由 Timeplus 社区成员 [赛义德·阿比奥拉](https://github.com/ayewo)提供
  - [实时检索增强生成 (RAG)](https://github.com/timeplus-io/proton/tree/develop/examples/real-time-ai)

_Timeplus 游戏机：_

- 外部表格配置：新向导可与 ClickHouse 集成。
- 查询页面上新的 “另存为” 按钮：将 SQL 另存为视图、物化视图或书签。
- 在 SQL 编辑器中，单击流、视图或物化视图的名称以显示资源的架构。
- 创建新的源或外部流后，您现在将被重定向到 SQL Console 页面。
- 查看和编辑资源详细信息：从资源列表的高级操作中移除了 “编辑” ——单击 “查看” 图标后，它现在可以在侧面板中找到。

## 2024 年 4 月 15 日

_Timeplus 核心引擎（Proton v1.5.5 和 v1.5.6）：_

- 为 Kafka 经纪人认证添加了两个新的 Apache Kafka 外部流设置：
  - `skip_ssl_cert_check` 允许你跳过验证服务器的认证
  - `ssl_ca_pem` 允许您指定证书颁发机构 (CA) 内容，无需上传 CA 文件
- 为日期时间添加了函数：
  - `to_unix_timestamp64_milli` 返回以 datetime64 毫秒为单位的 UNIX 时间戳
  - `to_unix_timestamp64_micro` 以微秒返回
  - `to_unix_timestamp64_nano` 以纳秒返回
- 默认情况下，新创建的直播将流媒体数据保留时间设置为 1 天存储。
- 在 macOS 上， `sudo proton install` 会将质子安装到 /usr/local/bin 而不是 /usr/bin。

_Timeplus Cloud 和 Timeplus 企业版：_

- 添加了工作空间模板：您可以从头开始创建新的工作空间，也可以使用演示模板（市场数据或流处理）创建新的工作空间。
- 数据摄取页面的新布局，标签显示 `来源` 或 `外部流`。
- 在 Data Lineage 中，我们针对工作空间中有大量资源时对布局进行了优化。 此外，缩小将显示图标和颜色，并添加了一个用于缩小以显示全部的按钮。
- 为 Apache Kafka 外部流和接收器添加了 TLS 设置和证书颁发机构 (CA) 输入字段。

## 2024 年 4 月 1 日

_Timeplus Proton：_

- 添加了对通过 `SELECT _message_key、* FROM external_stream`从 Apache Kafka 外部流中选择消息密钥的支持。
- 流处理现在支持可为空的数据类型。
- [外部表](proton-clickhouse-external-table#create-external-table)：现在支持名称包含特殊字符（例如短划线）的 ClickHouse 外部表。 只需在 `CREATE EXTERNAL TABLE` DDL 中设置 `table='test-a-b'` 即可。
- [外部流](proton-kafka#create-external-stream)：Kafka 外部流的错误处理和连接池化/重试已得到极大改进。
- 物化视图：为 [跳过脏/意外数据](query-syntax#settings)添加了选项。 如果你设置 `SETTINGS recovery_policy='best_effort'`，Timeplus 最多会尝试 3 次，然后跳过脏数据，继续处理其余数据。

_Timeplus Cloud 和 Timeplus 企业版：_

- 增加了对 Redpanda 无服务器的内置支持。 [查看我们的操作指南](https://www.timeplus.com/post/redpanda-serverless)
- 摄取 Apache Kafka 数据：我们将 Kafka 集成的实现从基于 Benthos 的实现改为基于外部流的实现。 我们在 Web 控制台中的配置向导保持不变。
- “来源” 的新左侧菜单项。 “数据提取” 页面现在将仅显示提取数据的选项，而不列出添加的来源。
- 根据用户反馈，我们增强了内置的OHLC图表，即使OHLC的当前窗口未关闭，也能显示实时更新。
- 更新了主页布局，增加了有关现有资源的新统计数据，右上角显示了当前正在运行的查询数量。 如果你的工作空间中没有特定的资源，我们现在将隐藏统计框，而不是显示 0。
- 对我们 [Timeplus 演示工作区](https://demo.timeplus.cloud)中的 3 个演示进行了增强。 在 [流处理演示](https://demo.timeplus.cloud/sp-demo/console/dashboard/ff9a0be7-434f-4774-8412-e9289e144b0a)中，我们添加了一个仪表板，以展示如何使用实时数据和流 SQL 计算标准差，以及如何使用查询变量。

## 2024年3月18日

在我们的 [Timeplus 演示工作区](https://demo.timeplus.cloud)中推出三款包含实时数据的新演示：流处理、市场数据和 KSQLDB 替代方案。 通过顶部标题的下拉列表选择演示。 你可以在只读模式下浏览演示，也可以在导游的带领下快速浏览。

_Timeplus Cloud：_

- SQL 控制台（以前称为查询页面）支持数据定义语言 (DDL)。 你可以使用 `CREATE` 和 `DROP`等命令修改资源。
- 在 Data Lineage 中，单击资源图块后，您可以直接从详细信息侧面板对其进行编辑。 请注意，对于特定资源类型，只能编辑某些字段。
- 同样在 “数据世系” 中，ClickHouse外部表现在也包括在内。 单击该图块可查看更多详细信息，例如地址和用户名。
- 除了流，您现在还可以将外部流和外部表设置为实例化视图的目标。

## 2024 年 3 月 4 日

_Proton：_

- Proton 现在可以与ClickHouse进行原生集成，适用于ClickHouse Cloud或ClickHouse的本地/自我管理版本。 [了解更多](https://www.timeplus.com/post/proton-clickhouse-integration)
- 在 Proton 1.5.2 中，批量 CSV 导入得到了增强。 您可以通过单个 SQL 在多个 CSV 文件中加载数十亿行。 [了解更多](proton-howto#csv)
- Protobuf 和 Avro 格式（Proton 1.5.2）支持 Kafka 架构注册表。 [了解更多](proton-schema-registry)
- 支持架构注册表的自签名 HTTPS 认证（Proton 1.5.3）。
- Proton 现在可以在 SUSE Linux 上编译。

_Timeplus 云服务:_

- 在 “数据世系” 侧面板中，添加了有关资源的更多详细信息。 点击图块进行查看。
- 诸如 `浮点` 或 `整数` 之类的数据类型已被贬值。 用户界面将显示精确的数据类型，例如 `int8`、 `uint16`等。
- 在仪表板图表中，渲染时会保留图例。 点击显示或隐藏系列。

## During the Preview step of adding a new source, we now show you the time remaining for previewing data. If no event comes in after 30 seconds, you can go back to previous steps, check your configuration, then try again.

_Proton：_

- 在 Proton v1.5.1 中，我们根据 ksqlDB 用户的反馈推出了更多的流式结果的发布政策。 最值得注意的是，当您运行 tumble/hop/session 窗口聚合时，在窗口关闭之前，中间聚合结果可以按一定的间隔或值发生变化时发出。 [在我们的文档中了解更多](query-syntax#emit)
- 现在您可以通过 `curl https://install.timeplus.com | sh` 将 Proton 作为单个二进制文件安装。
- 除了 GitHub Container Registry（GHCR）以外，您还可以通过 `docker pull public.ecr.aws/timeplus/proton`提取 Proton Docker。
- 由Marvin Hansen (Emet-Labs的负责人) 贡献的Proton Rust客户端的初始版本现已在 https://crates.io/crates/proton_client 上公开发布。

_Timeplus Cloud：_

- 对于 NATS 数据源，我们在用户界面中添加了选择 JWT 或 NKey 文件内容进行身份验证的选项。
- 当你使用 Avro 架构注册表添加 Confluent Cloud 数据源时，用户界面会为新数据流建议一组列名，但您需要选择正确的数据类型。 未来，我们将对其进行增强，使其从架构注册表加载数据类型。
- 在即将发布的版本中，您将能够在 Timeplus Cloud 中运行任何 SQL，包括 `CREATE EXTERNAL TABLE` 和其他数据定义语言 (DDL)。 联系我们，抢先体验这项新功能。

## On the Data Lineages page, if you move the tiles around, we will remember their positions and show them in the same positions the next time you visit this page. To return to default positions, click the Reset Layout button in the top right corner.

_Proton：_

- 自 Proton v1.4.2 以来，我们增加了对读取或写入 ClickHouse 表格的支持。 为此，我们在 Proton 中引入了一个新概念：“外部表”。 与 [External Stream](external-stream)类似，Proton 中不保留任何数据。 将来，我们将通过引入其他类型的外部表来支持更多的集成。 [有关用例和更多详细信息，请参阅我们的文档](proton-clickhouse-external-table) 。
- 根据用户反馈，我们简化了读取 Kafka 主题中 JSON 文档中键/值对的过程。 你不需要将所有键定义为列，也无需在 DDL 或 SQL 中设置 `input_format_skip_unknown_fields`。 [了解更多](proton-kafka#multi_col_read)
- 对于随机流，您现在可以将 EPS（每秒事件数）定义为 0 到 1 之间的数字。 例如，eps=0.5 表示每 2 秒生成一个事件。
- 添加了一个新的 [extract_key_value_pairs](functions_for_text#extract_key_value_pairs) 函数，用于将键值对从字符串提取到哈希字典。
- 我们改进了若干关于产品用量匿名上报的配置。 无论是单一二进制部署还是 Docker 部署，你都可以设置一个 `TELEMETRY_ENABLED` 环境变量。 报告间隔从 2 分钟更改为 5 分钟。
- 对我们文档的改进：重新组织了 Proton 文档，添加了 [“Proton How To” 页面](proton-howto)，并更新了有关为 [Kafka 外部流](proton-kafka#create-external-stream)使用认证的详细信息。

_Timeplus Cloud：_

- 引入一个新的数据源：HTTP 流。 输入URL、方法以及可选标头和有效负载。
- 现在已为 NATS 源添加了身份验证。
- 对于外部流，我们在侧面板中查看详细信息时添加了更多信息，例如 Kafka 代理、主题和数据结构。
- 在查询历史记录中，如果查询失败，您现在可以从工具提示中复制错误消息。

## 数据源和下游

_Proton：_

- Proton v1.4.1 现已发布。 请注意：您不能使用旧版本的 Proton 客户端连接到新的 v1.4 Proton 服务器——请务必更新您的 Proton 客户端。 所有现有的 JDBC、ODBC、Go 和 Python 驱动程序仍将照常运行。
- (v1.3.31) 我们添加了新的外部流设置 `message_key`，该表达式返回用作每行的消息密钥的字符串值。 `message_key`可以与 `sharding_expr`（它在 Kafka 主题中指定目标分区号）一起使用，而 “sharding_expr” 的优先级更高。 [了解更多](proton-kafka#messagekey)
- You can now create an external stream with multiple columns while reading Kafka. [Learn more](proton-kafka#multi_col_read)
- (v1.3.31) 默认情况下，我们禁用历史回填排序。 [在我们的查询指南中了解更多](query-syntax#query-settings) ，包括如何启用。
- Proton与Upstash的集成：使用Upstash创建Kafka集群和主题，作为数据源或数据下游。 适用于 [Timeplus Cloud](https://upstash.com/docs/kafka/integrations/timeplus) 和 [Proton](https://upstash.com/docs/kafka/integrations/proton)。

_Timeplus Cloud：_

- 在 Data Lineage 中，外部流现在以不同的颜色显示，以便更好地区分。
- 此外，在 “数据世系” 中，您可以按关键字进行搜索。
- 在图表格式设置中，您可以设置在 x 或 y 轴上为标签显示的最大字符数。
- 现在，我们会根据您的数据自动选择图表类型。 如果您有日期时间列和数字列，我们将默认为折线图。 如果您只有数字列：单值图表。 如果没有数字列：表格图表。

## 2024 年 1 月 8 日

_Proton：_

- 我们在 [Coinbase](https://github.com/timeplus-io/proton/tree/develop/examples/coinbase)的 [proton/examples](https://github.com/timeplus-io/proton/tree/develop/examples) 文件夹中添加了一个新示例。
- (v1.3.30) 新的聚合函数： [stochastic_linear_regression_state](functions_for_agg#stochastic_linear_regression_state) 和 [stochastic_linear_regression](functions_for_agg#stochastic_linear_regression)。
- (v1.3.30) 处理文本的新函数： [base64_encode](functions_for_text#base64_encode)、 [base64_decode](functions_for_text#base64_decode)、 [base58_encode](functions_for_text#base58_encode)和 [base58_decode](functions_for_text#base58_decode)，
- (v1.3.30) When creating an external stream, you can set sasl_mechanism to SCRAM-SHA-512, SCRAM-SHA-256, or PLAIN (default value). Learn more with [examples](proton-kafka#create-external-stream) in our docs. 通过我们的文档中的 [示例](proton-kafka#create-external-stream) 了解更多信息。

_Timeplus Cloud：_

- 在仪表盘图表中，您现在可以将图表切换到表格视图。
- Also in dashboard charts: additional options in View and Edit modes, such as Go Fullscreen, are shown in a dropdown. The chart size selector in Edit mode show an example of the size. 编辑模式下的图表大小选择器显示了大小示例。

## 2023 年 12 月 27 日

_Proton：_

- 查看 [proton/examples](https://github.com/timeplus-io/proton/tree/develop/examples) 文件夹中的新示例： [CDC](https://github.com/timeplus-io/proton/tree/develop/examples/cdc)、 [awesome-sensor-Logger](https://github.com/timeplus-io/proton/tree/develop/examples/awesome-sensor-logger)和 [欺诈检测](https://github.com/timeplus-io/proton/tree/develop/examples/fraud_detection)
- (v1.3.29) 为 [管理格式架构](proton-format-schema) 引入了新的 SQL 命令（目前，仅支持 Protobuf 架构）。
- (v1.3.28) For `create random stream`, the default interval_time is now 5 milliseconds, instead of 100 milliseconds. This new default value will generate random data more evenly. 这个新的默认值将更均匀地生成随机数据。
- (v1.3.28) 函数名称不再区分大小写。 你可以使用计数 ()、计数 () 或计数 ()。 (v1.3.28) Function names are no longer case sensitive. You can use count(), COUNT(), or Count(). This improves the compatibility for Proton with 3rd party tools if they generate SQL statements in uppercase.
- (v1.3.27) 随机流支持 ipv4 和 ipv6 数据类型。
- [质子元数据库驱动程序 (v0.0.3)](https://github.com/timeplus-io/metabase-proton-driver) 的发布是为了提高 Proton 与不区分大小写的 SQL 函数的兼容性。
- Proton</a> 的
Grafana 插件已得到增强并发布在 Grafana Catalog 上。 您可以通过管理页面进行安装，而无需手动下载文件。 请确保可以从 Grafana 访问质子的 8463 和 3218 端口，因为新版本将调用 Proton 查询分析器 API（在 3218 上）来确定它是否是流式查询，然后以不同的方式呈现结果。 使用此插件，您可以使用 Proton 中的数据以及在 Grafana 中配置的其他数据源来构建图表和仪表板。 试一试，告诉我们你的想法！</li> </ul> 
  
  _Timeplus Cloud：_
  
  - New Core NATS/JetStream datasource is now available. We welcome any feedback! 我们欢迎任何反馈！
- WebSocket 源现在支持多条打开的消息。
- 图表类型选择器现在是一个下拉列表，其中包含禁用类型时所需列的提示。
- 在查询页面的直播目录中，您可以按直播或列进行搜索。
- 在图表格式设置中，单色调色板扩展为包含 10 种颜色阴影（之前为 3 种）。
- 对于全屏模式下的图表，鼠标悬停在工具提示上可用。



## 2023 年 12 月 11 日

_Proton：_

- [Proton JDBC 驱动程序](https://github.com/timeplus-io/proton-java-driver) 的新版本 (v0.6.0) 已上线：能够列出 DBeaver 和 Metabase 中的表和列。
- [Proton Metabase驱动](https://github.com/timeplus-io/metabase-proton-driver) 的新版本 (v0.0.2) 已推出：能够列出表和列。
- 新增函数： [lag_behind](functions_for_streaming#lag_behind)，专为流 JOIN 而设计。 如果您未指定列名，则查询将使用左右流的处理时间来比较时间戳差异。

_Timeplus Cloud：_

- 新的 WebSocket 数据源：通过输入 URL 和数据类型（JSON 或文本）将 Timeplus 与 WebSocket 连接。
- 直接输入 SQL 创建外部流。
- 将 CSV 数据上传到现有流。
- 在查询页面的流目录中，您可以通过流、列或两者进行搜索。
- 在仪表板图表中，我们现在在鼠标悬停时显示所有图表类型的 “上次更新” 时间。
- （预览功能）推出新的数据源：NATS 和 NATS JetStream。 配置用户界面将很快在 Timeplus Cloud 中推出。 如果您想试用此功能，请联系我们。



## 2023 年 11 月 27 日

_Our [Grafana data source plugin](https://github.com/timeplus-io/proton-grafana-source), to connect to Proton and visualize streaming or batch queries, is now open source. Stay tuned for our upcoming blog and demo!_

- Proton 的 [元数据库驱动程序](https://github.com/timeplus-io/metabase-proton-driver) 现在是开源的。
- Proton JDBC 驱动程序现在可通过 [Maven](https://central.sonatype.com/artifact/com.timeplus/proton-jdbc)获得。
- 您现在可以将 Proton 连接到 [Pulse](https://www.timestored.com/pulse/) 获取 OHLC 图表。
- 添加了新函数： [untuple](functions_for_comp#untuple), [tuple_element](functions_for_comp#tuple_element), [dict_get](functions_for_comp#dict_get), [dict_get_or_default](functions_for_comp#dict_get_or_default), [列](functions_for_comp#columns), [apply](functions_for_comp#apply) [任意](functions_for_agg#any)和 [last_value](functions_for_agg#last_value)。
- 现在，你可以在读取 Kafka 时创建包含多列的外部流。 [了解更多](proton-kafka#multi_col_read)

_Timeplus Cloud：_

- 柱形图现在支持无限数量的列（以前仅限于最近的 30 个结果）。
- Pulsar 数据旅游经过增强，支持批处理，提高写入性能。
- “外部流” 现在显示在左侧导航菜单中，您可以在其中查看所有外部直播并创建新流。
- (Preview) We've added the open-high-low-close ([OHLC](viz#ohlc-chart)) chart type common in the finance industry, to visualize the movement of prices over time. Additional format settings include choosing a time range. Please contact us if you'd like to try this new chart type. 其他格式设置包括选择时间范围。 如果您想尝试这种新的图表类型，请联系我们。



## 2023年11月13日

_Proton：_

- Proton的[JDBC driver](https://github.com/timeplus-io/proton-java-driver)现已开源。 请查看我们有关如何链接DBeaver到Proton的[演示示例](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc)。 以及如何在[Pulse UI](https://github.com/timestored/pulseui/pull/139)中使用Proton。
- 此外，我们还提供了一个实验性[ODBC driver](https://github.com/timeplus-io/proton-odbc)，用于从PowerBI等工具访问Proton
- Proton中还新增了一个实验性的`shuffle by`子句。 目前，它仅适用于历史查询，并将很快支持流式查询。 `shuffle by` 的关键用例是支持高基数 `按` 分组（例如 1000 万个唯一密钥）。 要了解有关此高级功能的更多信息，请加入我们的 [Slack 社区](https://timeplus.com/slack)中的讨论。
- 自版本 1.3.19 起，默认情况下，历史存储中用于时空旅行/倒带的回填功能处于启用状态。 Since version 1.3.19, by default, the backfill from historical store for time travel/rewind is enabled. For example `select * from stream where _tp_time>now()-14d` will load data from historical store for last 14 days, even for data not available in streaming storage. If you prefer the previous behavior, you can add `settings enable_backfill_from_historical_store=false` to the streaming SQL. 如果你更喜欢之前的行为，可以在直播 SQL 中添加 `设置 enable_backfill_from_historical_store=false` 。

_Timeplus Cloud：_

- 在数据世系中，当您单击资源图块时，相关图块的路径会突出显示，其余图块显示为灰色。
- 对于地图图表，点的大小现在与点的宽度（以像素为单位）相关。
- 创建源时，如果选择 Protobuf 作为 “读取” 数据类型，则现在必须使用 Protobuf 消息和定义才能继续。
- You can copy your workspace ID by clicking on your workspace name in the top header and hovering on the ID. This is useful if you need to speak to us for support about your workspace. 如果您需要联系我们寻求有关您的工作空间的支持，这将非常有用。

_Timeplus 平台：_

- 对于Timeplus平台的本地部署，我们现在提供两种可观察性选项：使用Timeplus或使用Grafana/Loki。



## 2023 年 10 月 30 日

_Proton：_

- 您现在可以安装适用于 Mac 或 Linux 的单一原生二进制文件——请在此处查看我们的安装指南 [](https://github.com/timeplus-io/proton/wiki/Install-single-binary-Proton)。
- 外部流支持写作。 External streams support writing. [(Learn more)](proton-kafka#write-to-kafka-with-sql)
- External streams also support reading from specific Kafka partition(s). [(Learn more)](proton-kafka#read-specified-partitions) [(了解更多)](proton-kafka#read-specified-partitions)

_Timeplus Cloud：_

- Per customer feedback, we added a new capability to allow users to monitor the infra usages for their workspace, such as cpu/memory/disk/network. Check out an example dashboard [here](https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90), and please contact us if you want to enable this experimental feature in your workspace. 请在此处查看仪表板示例 [](https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90)，如果您想在工作空间中启用此实验功能，请联系我们。
- When creating an Apache Kafka, Confluent Cloud, or Redpanda source, we now display available topics in a dropdown. You can also enter a topic manually. 您也可以手动输入主题。
- CSV 上传过程已完善-如果您的文件中没有标题行，我们将自动生成列名。
- 在资源列表页面中按关键字搜索不再区分大小写。
- 格式化单值图表时，你现在可以在单位字段中添加一个空格（例如，如果你想用一个空格来分隔值和单位）。
- 仪表板查询变量下拉菜单有了新的用户界面：搜索时，我们现在将仅在下拉列表中显示匹配的项目，而不是突出显示匹配的项目。
- 删除查询书签时，将显示一个确认对话框。



## 2023 年 10 月 16 日

_Timeplus is now open source! Introducing **Proton**, a unified, lightweight streaming and historical data processing engine in a single binary, powering the Timeplus Cloud streaming analytics platform. [Try Proton with Docker](https://github.com/timeplus-io/proton)_

- 现在支持新的数据类型：ipv4 和 ipv6，以及相关的 [函数](functions_for_url)。
- [Python 驱动程序](https://github.com/timeplus-io/proton-python-driver) 0.2.10 现在支持 Python 3.11 和 3.12。
- [Go Driver](https://github.com/timeplus-io/proton-go-driver) 现在是开源的。
- 我们的 [Grafana 数据源插件](https://github.com/timeplus-io/proton-grafana-source)现已开源，用于连接到 Proton 并可视化流式或批量查询。 请继续关注我们即将发布的博客和演示！
- 我们在 Proton v1.3.15（创建/删除）中添加了 [用户定义函数](proton-create-udf) 支持，允许您利用现有的编程库、与外部系统集成或使 SQL 更易于维护。

_Timeplus Cloud：_

- 现在，您可以在 “控制面板” 列表中按关键字进行搜索。
- 在 “查询” 页面中，我们从 SQL Helper 侧面板中删除了 “最近的查询”。 In the Query page, we've removed Recent Queries from the SQL Helper side panel. You can still see your Recent Queries by opening a new query tab, or on your Homepage.



## 2023 年 10 月 2 日

Timeplus 现在是开源的！ 推出 **Proton**，这是一款统一的轻量级直播和历史数据处理引擎，采用单一二进制格式，为 Timeplus Cloud 流媒体分析平台提供支持。 [使用 Docker 试用 Proton](https://github.com/timeplus-io/proton)

_Proton 的新功能：_

- 外部直播现在支持检查点。 External stream now supports checkpoints. Whether you stop and rerun the query, or the server restarts, it will read from where it stopped.
- [Python 驱动程序](https://github.com/timeplus-io/proton-python-driver) 和 [Go 驱动程序](https://github.com/timeplus-io/proton-go-driver) 已发布。

_Timeplus Cloud 的新功能：_

**水槽**

- We've added a ClickHouse sink, as a preview feature. You can find this option when you expand "Show more outputs". 展开 “显示更多输出” 时可以找到此选项。
- We've also made it easier for you to create new sinks, by adding a "Create New Sink" button to the Sinks list page. On the Query page, while waiting for results to come in, you can now also create a sink. 在查询页面上，在等待结果出来的同时，您现在还可以创建数据下游。

**控制台用户界面**

- 我们的入职体验焕然一新。 Our onboarding experience has a new look. After [creating a new account](https://us.timeplus.cloud), answer a couple of quick questions so we can get to know you better, and then give your workspace a name.



## 2023 年 9 月 18 日

**数据库**

- 生成随机数据的新函数 — 在这里查看 [](functions_for_random).

**数据摄取**

- 在添加新源的预览步骤中，我们现在向您显示预览数据的剩余时间。 如果 30 秒后没有事件出现，您可以返回到之前的步骤，检查您的配置，然后重试。
- For "Sample dataset", you can select an [event time column](eventtime) when you set up the stream. CSV file uploads will be enhanced soon. CSV 文件上传功能将很快得到增强。
- 现在，当您创建新数据流时，所有源都有数据保留选项。

**水槽**

- 我们为 Confluent Cloud 添加了一个数据旅游。 We've added a sink for Confluent Cloud. This is similar to the Apache Kafka sink, with mandatory authentication.

**控制台用户界面**

- 在视图、物化视图、接收器和查询历史记录等资源列表中，SQL 现在显示在一行中，没有中断。



## 2023 年 9 月 5 日

Timeplus 的 Terraform 提供商现已发布—— [看看吧](https://registry.terraform.io/providers/timeplus-io/timeplus/latest).

**查询**

- 现在，您可以在不取消查询的情况下编辑查询，然后运行新查询，或在新选项卡中将其打开。
- 当 SQL 编辑器为空时， `格式` 按钮现在处于禁用状态。

**仪表板和图表**

- 我们改进了图表中的配色方案选择器，除了使用单一颜色的多种色调外，还允许您从一组预制的配色方案中进行选择。
- 查看控制面板时，您可以查看或编辑 JSON 定义。

**数据摄取**

- When you upload a CSV file, the historical store retention policy of the newly created stream will by default be set as "Don't remove older data" (previously 30 days). This can work better when you use the CSV for lookup table or quick tests with historical data. 当您使用 CSV 进行查找表或使用历史数据进行快速测试时，效果会更好。

**工作空间设置**

- Workspace owners can now opt in or out of anonymous page view tracking, in the new Privacy tab in Workspace Settings. Please see our [Privacy Policy](https://www.timeplus.com/privacy-policy) for more details on how your workspace data is tracked and used. 有关如何跟踪和使用您的工作空间数据的更多详细信息，请参阅我们的 [隐私政策](https://www.timeplus.com/privacy-policy) 。

**其他增强功能**

- We've added a banner to inform you when a new version of Timeplus is deployed, and prompt you to refresh your browser to get the latest version. We also show a similar banner if we detect network issues. 如果我们检测到网络问题，我们还会显示类似的横幅。



## 2023 年 8 月 21 日

**基础设施即代码**

- (Experimental) We published a developer preview of [Timeplus Provider for Terraform](https://github.com/timeplus-io/terraform-provider-timeplus). With a Timeplus workspace ID and API Key, you can use this tool to create, update, or delete resources in Timeplus, including sources, streams, views, materialized views, and sinks. More resources will be supported in the future, such as UDFs and dashboards. You can put the Terraform files in a version control system and apply branching, code review, and CICD. Comparing to SQL-based batch operation, this tool can easily manage dependencies among various resources and allow you to preview what will be changed before updating the deployment. 使用Timeplus工作空间ID和API密钥，您可以使用此工具在Timeplus中创建、更新或删除资源，包括源、流、视图、物化视图和接收器。 将来将支持更多资源，例如 UDF 和仪表板。 您可以将 Terraform 文件放入版本控制系统并应用分支、代码审查和 CICD。 与基于 SQL 的批处理操作相比，该工具可以轻松管理各种资源之间的依赖关系，并允许您在更新部署之前预览将要更改的内容。

**查询和结果**

- On the Query page, we've enhanced the SQL editor to better support multi-line SQL. The editor will now auto-expand as you type. 现在，编辑器将在您键入时自动展开。
- 在结果表中查看行详细信息时，按键盘上的 `向上` 或 `向下` 箭头可查看上一行或下一行的详细信息。

**控制台用户界面**

- 在 “数据提取” 页面上，“添加数据” 弹出窗口现在可以直接显示数据源（例如 Apache Kafka、Confluent Cloud、Redpanda 等）。
- 在 Data Lineages 页面上，如果您四处移动图块，我们将记住它们的位置，并在您下次访问此页面时将其显示在相同的位置。 要返回默认位置，请单击右上角的重置布局按钮。
- 当您删除 API 密钥时，我们现在将显示一个弹出窗口以确认删除。



## 2023年8月8日

Cloud GA（版本 1.3.x）

**数据库**

- (实验性）您可以把追加数据流或[版本流](versioned-stream)转换为[变更流](changelog-stream)，只需要使用新的[changelog](functions_for_streaming#changelog)函数。 它专为高级用例而设计，例如按主键处理迟到事件。
- 添加了用于 URL 处理的新函数 — 在 [这里](functions_for_url)查看。
- 屏蔽 [hop](functions_for_streaming#hop)/[session](functions_for_streaming#session) 函数进行历史查询（即使用 [table](functions_for_streaming#table) 函数）。
- JavaScript UDF 现已对所有人开放。 在[这里](js-udf)查看。

**数据源和下游**

- Apache Kafka 或 Redpanda 主题中的空消息现在已经跳过。
- 如果一个数据源发送数据到一个流，您不能直接删除这个数据流。 请先删除数据源。

**控制台用户界面**

- 在查询页面中，对于流式查询，现在会显示扫描的行、字节和 EPS。
- 在地图图表中，您现在可以将点的大小更改为固定值，也可以根据数字列设置最小和最大范围。 您也可以调整圆点的不透明度。

**文档**

- 优化我们的 [UDF 文档](udf)
- 对于函数，我们为不同类别添加了 [子页面](functions)。
- 对于流式查询中支持的函数，我们现在指出历史查询中是否也支持这些函数。
- 改进了文档的搜索组件显示形式。
