# GA Releases

This page summarizes changes in each major update in Timeplus, including new features and important bug fixes.

## Sep 5, 2023

  * **Chart color schemes:** We improved our color scheme selector in charts, letting you choose from a set of pre-made color schemes, in addition to using multiple shades of a single color.
  * **Queries:** You can now edit a query without cancelling it, and then run the new query, or open it in a new tab. 

## Aug 21, 2023

**Infrastructure as Code**
  * (Experimental) We published a developer preview of [Timeplus Provider for Terraform](https://github.com/timeplus-io/terraform-provider-timeplus). With a Timeplus workspace ID and API Key, you can use this tool to create, update, or delete resources in Timeplus, including sources, streams, views, materialized views, and sinks. More resources will be supported in the future, such as UDFs and dashboards. You can put the Terraform files in a version control system and apply branching, code review, and CICD. Comparing to SQL-based batch operation, this tool can easily manage dependencies among various resources and allow you to preview what will be changed before updating the deployment.

**Query and Results**
  * On the Query page, we've enhanced the SQL editor to better support multi-line SQL. The editor will now auto-expand as you type.
  * When viewing row details in the results table, press the `up` or `down` arrows on your keyboard to see details for the previous or next row.

**Console UI**
  * On the Data Ingestion page, the Add Data pop-up now shows sources directly (such as Apache Kafka, Confluent Cloud, Redpanda etc.).
  * On the Data Lineages page, if you move the tiles around, we will remember their positions and show them in the same positions the next time you visit this page. To return to default positions, click the Reset Layout button in the top right corner.
  * When you delete an API key, we will now show a pop-up to confirm the deletion. 

## Aug 8, 2023

Soft launch for the Cloud GA (version 1.3.x).

**Database**
  * (Experimental) You can now convert append-only or [versioned streams](versioned-stream) to [changelog streams](changelog-stream) with the new [changelog](functions_for_streaming#changelog) function. This is designed for advanced use cases, such as per-key late event processing.
  * Added new functions for URL handling – check them out [here](functions_for_url).
  * Block [hop](functions_for_streaming#hop)/[session](functions_for_streaming#session) functions for historical queries (ie. with the [table](functions_for_streaming#table) function).
  * JavaScript user-defined functions (UDFs) are now publicly available – learn more [here](js-udf).

**Sources/Sinks**
  * Empty messages in an Apache Kafka or Redpanda topic are now skipped.
  * We now restrict you from deleting a stream if a source is sending data to it. Please delete the source first.

**Console UI**
  * In the Query page, for a streaming query, the scanned rows, bytes, and EPS are now shown.
  * In the map chart, you can now change the dot size, either as a fixed value, or set a minimum and maximum range based on a numeric column. You can also adjust the opacity of the dot.

**Docs**
  * Refined our [UDF docs](udf).
  * For functions, we added [sub-pages](functions) for the different categories.
  * For functions that are supported in streaming queries, we now indicate whether they are also supported in historical queries or not. 
  * Refined the search widget in Docs.  
