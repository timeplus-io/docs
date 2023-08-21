# GA 版本

本页总结了 Timeplus 中每个主要更新的变化，包括新功能和重要的错误修复。

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
