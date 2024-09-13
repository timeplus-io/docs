# Timeplus Cloud Private Beta 2

我们很高兴地启动第二个邀请制测试版的TimePlus Cloud。 Comparing to the [Private Beta 1](/private-beta-1), most of the backend and frontend changes are incremental enhancements, except the entry point is changed from [https://TENANT.beta.timeplus.com](https://tenant.beta.timeplus.com) to [https://beta.timeplus.cloud/TENANT](https://beta.timeplus.cloud/tenant)

我们将不时更新测试版，并在此页面列出关键的增强措施。

(2022年)

### 每两周更新 9/19-9/30

* 流引擎
  * Enhanced [dedup](/functions#dedup) function to only cache the unique keys for a given time period. 这有助于在短时间内消除同样的警报。
  * 支持子串流，例如 `选择 cid,speed_kmh, lag(speed_kmh) OVER (PARTITION BY cid) 作为从car_live_data 的 last_spd`
* 源、 汇、 API 和 SDK
  * Updated Python SDK https://pypi.org/project/timeplus/ to auto-delete the query history, refine error handling, Please note there is a breaking change, `Env().tenant(id)` is changed to `Env().workspace(id)` to be align with our [terminology](/glossary#workspace)
  * 更新了 [REST API](/rest) 来显示源/汇的optinal 描述，并在文档中将“租户”改为“workspaceid”。
  * Kafka sink 不再自动创建主题

* 界面改进
  * 在主页上显示总数据大小，以及平均数据和输出数据。
  * 在查询页面中添加一个新的 'SQL 模板' 按钮来帮助您快速添加常见的代码片段, 例如 `setting_to='-1h'`
  * 添加了一个可关闭的页面描述以及上下文意识到帮助侧面板.
  * 精炼“数据行线”页面以显示流模式、查看 SQL 和汇类型。
  * 当您选择查看最新数据时能够设置单位。
  * 移动友好登录/注册页面。

### 每两周更新 9/5-9/16

* 流引擎
  * Added a [round](/functions#round) function to round a value to a specified number of decimal places.
  * 改进了对集群的支持。
* 源、 汇、 API 和 SDK
  * 为仪表板添加新的 CRUD API。 升级期间将自动删除主页上的上一个图表。
  * 简化串流演示的主机名到 https://timeplus.streamlitapp.com

* 界面改进
  * 启用完整的仪表板管理。 您可以创建多个带有名称/描述/图表的仪表板。
  * 重新设计主页以显示工作区的高层信息。
  * 开启了一个新的“数据行”页面以直观化源/流/视图/汇之间的关系。
  * 增强可视化查询结果的工作流。 您需要选择是查看最新数据，还是检查数据趋势，还是查看详细数据。
  * 现在您可以可视化历史查询的查询结果，例如 `select.. from table(...)...`, 并将图表添加到仪表板。
  * 删除浏览器侧边数据集合以提高性能。 如果数据速度大于渲染时间间隔（200毫秒），则只会在间隔内提供最后一个数据点。  如果您运行串流尾或过滤器，您不再能够用条形图对数据进行视觉。 请使用 `GROUP BY` 来进行这种分析。
  * 增强SQL编辑器以显示列名而不使用流名。
  * 移动友好登录/注册页面。

### 双周更新 8/22-9/2

我们已将 beta1 客户迁移到 beta2。 https://demo.timeplus.com不再可用。 如果您有测试测试帐户，请访问 https://beta.timeplus.cloud/demo。

* 流引擎
  * 修改逻辑函数返回 `布尔` 而不是 `uint8`
  * 为ARM芯片添加实验支持
* 源、 汇、 API 和 SDK
  * 更新 [datapm](https://datapm.io/docs/quick-start/) Timeplus sink 以支持测试2 多租户API
  * Enhanced the snowflake sink to specify the data warehouse
  * 将示例Java 代码发布为 [是一个公开的 Github Repo](https://github.com/timeplus-io/java-demo)。 您可以轻松地获得Timeplus查询结果和执行其他操作，而不直接处理低级REST API
* 界面改进
  * 分离主页和仪表板页面。 今后，您可以创建多个仪表板
  * 绘制增强功能: 显示数据值作为悬停时条形图的工具提示, 在全页模式下查看图表
  * 增强SQL 编辑器以支持常见查询片断，例如 `group by window_start, window_end`
  * 增强SQL编辑器以显示用户定义函数的自动完成
  * 显示流的数据大小
  * 更新导航栏以显示用户简档、工作区设置和在右上角的帮助

### 8/15周

* 流引擎
  * (Experimental) enhanced the [session window](/functions_for_streaming#session) aggregation to create substreams based on customized logic for window start and window end
  * Added a new function [extract_all_groups](/functions#extract_all_groups) to process text with regular expressions.
* 源、 汇、 API 和 SDK
  * Webhook sink 得到增强，以支持自定义的 HTTP 方法、内容类型和头部。
* 界面改进
  * Apache Pulsar作为源或汇的新界面。
  * 查询结果中的列现在可以用拖动来调整大小。
  * 未使用的流 SQL 将被自动取消。

### 8/8周

私人测试版2中的第一个产品更新。

* 流引擎
  * Introduced a new data type [uuid](/datatypes) to identify records with a 16-byte number. A new function [uuid](/functions#uuid) is added to generate such uuid.
  * Added a new function [extract_all_groups_horizontal](/functions#extract_all_groups_horizontal) to process text with regular expressions.

* 源、 汇、 API 和 SDK
  * 已发布的 https://pypi.org/project/timeplus/0.2.0/ 可选的租户ID支持。
  * 支持 Apache Pulsar 和 StreamNative Cloud 作为数据源或数据汇。 您可以通过 REST API 从 Pulsar 加载实时数据到 Timeplus (web UI 即将准备就绪)。 [Learn more](/ingestion#pulsar)
  * 为雪花添加实验吸收汇。 您可以向 Snowflake 发送Timeplus实时查询结果。
* 界面改进
  * 新的登录屏幕。
  * 雪花实验吸收汇界面。
  * 改进了各种 UI 页面中的多租户支持。
