# GA 版本

本页总结了 Timeplus 中每个主要更新的变化，包括新功能和重要的错误修复。

## Sep 18, 2023

**数据库**
  * New functions to generate random data – check them out [here](functions_for_random).

**数据摄取**
 * During the Preview step of adding a new source, we now show you the time remaining for previewing data. If no event comes in after 30 seconds, you can go back to previous steps, check your configuration, then try again.
 * For "Sample dataset", you can select an [event time column](eventtime) when you set up the stream. CSV file uploads will be enhanced soon.
 * All sources now have data retention options when you create a new stream.

**Sinks**
 * We've added a sink for Confluent Cloud. This is similar to the Apache Kafka sink, with mandatory authentication.

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
  * When you upload a CSV file, the historical store retention policy of the newly created stream will by default be set as "Don't remove older data" (previously 30 days). This can work better when you use the CSV for lookup table or quick tests with historical data.

**Workspace Settings**
  * Workspace owners can now opt in or out of anonymous page view tracking, in the new Privacy tab in Workspace Settings. Please see our [Privacy Policy](https://www.timeplus.com/privacy-policy) for more details on how your workspace data is tracked and used.

**Other Enhancement**
  * We've added a banner to inform you when a new version of Timeplus is deployed, and prompt you to refresh your browser to get the latest version. We also show a similar banner if we detect network issues.

## Aug 21, 2023

**Infrastructure as Code**
  * (Experimental) We published a developer preview of [Timeplus Provider for Terraform](https://github.com/timeplus-io/terraform-provider-timeplus). With a Timeplus workspace ID and API Key, you can use this tool to create, update, or delete resources in Timeplus, including sources, streams, views, materialized views, and sinks. More resources will be supported in the future, such as UDFs and dashboards. You can put the Terraform files in a version control system and apply branching, code review, and CICD. Comparing to SQL-based batch operation, this tool can easily manage dependencies among various resources and allow you to preview what will be changed before updating the deployment.

**Query and Results**
  * On the Query page, we've enhanced the SQL editor to better support multi-line SQL. The editor will now auto-expand as you type.
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
  * JavaScript UDF 现已对所有人开放。在[这里](js-udf)查看。

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
