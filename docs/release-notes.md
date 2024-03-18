# Release Notes

This page summarizes changes for each major update in Proton and Timeplus Cloud, including new features and important bug fixes. For previous release notes, please check [this page](changelog).

## Mar 18, 2024

Introducing three new demos with live data in our [Timeplus Demo workspace](https://demo.timeplus.cloud): Stream Processing, Market Data, and ksqlDB Alternative. Choose a demo via the dropdown in the top header. You can explore the demos in read-only mode, or take a quick guided tour. 

*Timeplus Cloud:*
  * Data Definition Language (DDL) is supported in the SQL Console (previously called the Query page). You can modify resources using commands such as `CREATE` and `DROP`.
  * In Data Lineage, after clicking a resource tile, you can make edits to it directly from the details side panel. Please note that only certain fields may be edited for a particular resource type.  
  * Also in Data Lineage, ClickHouse external tables are now included. Click the tile to see more details, such as the address and username.
  * In addition to streams, you can now set external streams and external tables as the target for materialized views. 

## Mar 4, 2024

*Proton:*
  * Proton can now natively integrate with ClickHouse, available for both ClickHouse Cloud or local/self-managed versions of ClickHouse. [Learn more](https://www.timeplus.com/post/proton-clickhouse-integration)
  * Bulk CSV import is enhanced, in Proton 1.5.2. You can load billions of rows in multiple CSV files via a single SQL. [Learn more](proton-howto#csv)
  * Kafka Schema Registry is supported with Protobuf and Avro format (Proton 1.5.2). [Learn more](proton-schema-registry)
  * Self-signed HTTPS certification for Schema Registry is supported (Proton 1.5.3).
  * Proton now can be compiled on SUSE Linux.

*Timeplus Cloud:*
  * In Data Lineage side panels, more details about the resources are added. Click on a tile to view.
  * Data types such as `float` or `integer` are depreciated. The UI will show precise data types such as `int8`, `uint16`, etc.
  * In dashboard charts, the legend is maintained when rendering. Click to show or hide series. 

## Feb 20, 2024

*Proton:*
  * In Proton v1.5.1, we introduced more streaming result emit polices, based on feedback from ksqlDB users. Most notably, when you run tumble/hop/session window aggregations, before the window closes, the intermediate aggregation results can be emitted at a certain interval or when the value changes. [Learn more in our docs](query-syntax#emit)
  * You can now install Proton as a single binary via `curl https://install.timeplus.com | sh`.
  * Besides GitHub Container Registry (GHCR), you can also pull Proton Docker via `docker pull public.ecr.aws/timeplus/proton`.
  * A first version of the Rust Client for Proton is now available at https://crates.io/crates/proton_client, contributed by Marvin Hansen (Director of Emet-Labs). 

*Timeplus Cloud:*
  * For NATS data source, we’ve added the option in the UI to choose either JWT or NKey file content for authentication.
  * When you add a Confluent Cloud data source with Avro Schema Registry, the UI will suggest a set of column names for the new stream, but you’ll need to choose the proper data types. In the future, we will enhance it to load the data types from the schema registry.
  * In an upcoming release, you will be able to run any SQL in Timeplus Cloud, including `CREATE EXTERNAL TABLE` and other Data Definition Language (DDL). Contact us for early access to this new feature.

## Feb 5, 2024

*Proton (Current version: v1.4.2):*
  * Since Proton v1.4.2, we’ve added support to read or write ClickHouse tables. To do this, we’ve introduced a new concept in Proton: "External Table". Similar to [External Stream](external-stream), no data is persisted in Proton. In the future, we will support more integrations by introducing other types of External Table. [See our docs](proton-clickhouse-external-table) for use cases and more details.
  * Based on user feedback, we’ve simplified the process of reading key/value pairs in the JSON document in a Kafka topic. You don’t need to define all keys as columns, and no need to set `input_format_skip_unknown_fields` in DDL or SQL. [Learn more](proton-kafka#multi_col_read)
  * For random streams, you can now define the EPS (event per second) as a number between 0 to 1. For example, eps=0.5 means generating an event every 2 seconds.
  * A new [extract_key_value_pairs](functions_for_text#extract_key_value_pairs) function is added to extract key value pairs from a string to a map.
  * We’ve refined the anonymous telemetry configuration. Regardless if it’s a single binary or Docker deployment, you can set a `TELEMETRY_ENABLED` environment variable. The reporting interval is adjusted from 2 minutes to 5 minutes.
  * Enhancements to our docs: re-organized Proton docs, added a [“Proton How To“ page](proton-howto), and updated details on using certifications for [Kafka external stream](proton-kafka#create-external-stream).

*Timeplus Cloud:*
  * Introducing a new data source: HTTP Stream. Enter your URL, method, and optional headers and payload.
  * Authentication is now added for NATS sources.
  * For External stream, we've added more information when viewing details in the side panel, such as Kafka brokers, topic, and stream schema.
  * In Query History, if a query failed, you can now copy the error message from the tooltip.

## Jan 22, 2024

*Proton:*
  * Proton v1.4.1 is now released. Please note: you cannot use an older version of Proton client to connect to the new v1.4 Proton server — be sure to update your Proton client. All existing JDBC, ODBC, Go, and Python drivers will still work as usual. 
  * (v1.3.31) We've added a new external stream setting `message_key`, an expression that returns a string value used as the message key for each row. `message_key` can be used together with `sharding_expr` (which specifies the target partition number in the Kafka topic), with `sharding_expr` taking higher priority. [Learn more](proton-kafka#messagekey)
  * (v1.3.31) Write to Kafka in plain text: you can now [produce raw format data](proton-kafka#single_col_write) to a Kafka external stream with a single column.
  * (v1.3.31) By default, we disable sort for historical backfill. [Learn more](query-syntax#query-settings) in our query guide, including how to enable. 
  * Introducing our integration with Upstash: create a Kafka cluster and topics using Upstash, then create a data source or sink in Timeplus. Available for both [Timeplus Cloud](https://upstash.com/docs/kafka/integrations/timeplus) and [Proton](https://upstash.com/docs/kafka/integrations/proton). 

*Timeplus Cloud:*
  * In Data Lineage, external streams are now shown in a different color for better distinction.
  * Also in Data Lineage, you can search by keyword.
  * In chart format settings, you can set the maximum numbers of characters to show for a label on the x- or y-axis.
  * We now auto-select a chart type based on your data. If you have a datetime column and numeric columns, we will default to a line chart. If you have only numeric columns: single value chart. And if no numeric columns: table chart. 

## Jan 8, 2024

*Proton:*
  * We've added a new example in the [proton/examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder for [Coinbase](https://github.com/timeplus-io/proton/tree/develop/examples/coinbase).
  * (v1.3.30) New functions for aggregation: [stochastic_linear_regression_state](functions_for_agg#stochastic_linear_regression_state) and [stochastic_linear_regression](functions_for_agg#stochastic_linear_regression).
  * (v1.3.30) New functions for processing text: [base64_encode](functions_for_text#base64_encode), [base64_decode](functions_for_text#base64_decode), [base58_encode](functions_for_text#base58_encode), and [base58_decode](functions_for_text#base58_decode),
  * (v1.3.30) When creating an external stream, you can set sasl_mechanism to SCRAM-SHA-512, SCRAM-SHA-256, or PLAIN (default value). Learn more with [examples](proton-kafka#create-external-stream) in our docs.

*Timeplus Cloud:*
  * In dashboard charts, you can now switch the chart into a table view.
  * Also in dashboard charts: additional options in View and Edit modes, such as Go Fullscreen, are shown in a dropdown. The chart size selector in Edit mode show an example of the size.

## Dec 27, 2023

*Proton:*
  * Check out new examples in the [proton/examples](https://github.com/timeplus-io/proton/tree/develop/examples) folder: [CDC](https://github.com/timeplus-io/proton/tree/develop/examples/cdc), [awesome-sensor-logger](https://github.com/timeplus-io/proton/tree/develop/examples/awesome-sensor-logger), and [fraud detection](https://github.com/timeplus-io/proton/tree/develop/examples/fraud_detection)
  * (v1.3.29) Introduced new SQL commands for [managing format schemas](proton-format-schema) (for now, only Protobuf schemas are supported).
  * (v1.3.28) For `create random stream`, the default interval_time is now 5 milliseconds, instead of 100 milliseconds. This new default value will generate random data more evenly.
  * (v1.3.28) Function names are no longer case sensitive. You can use count(), COUNT(), or Count(). This improves the compatibility for Proton with 3rd party tools if they generate SQL statements in uppercase.
  * (v1.3.27) Random stream supports ipv4 and ipv6 data type.
  * [Proton Metabase Driver (v0.0.3)](https://github.com/timeplus-io/metabase-proton-driver) is released to improve compatibility for Proton with case insensitive SQL functions.
  * The [Grafana plugin for Proton](https://grafana.com/grafana/plugins/timeplus-proton-datasource) has been enhanced and published on Grafana Catalog. You can install it via admin pages without downloading the file manually. Please make sure both 8463 and 3218 ports from Proton are accessible from Grafana, since the new version will call Proton query analyzer API (on 3218) to determine whether it is a streaming query or not, then render results differently. With this plugin, you can build charts and dashboards with data in Proton, as well as other data sources configured in your Grafana. Give it a try and let us know what you think!

*Timeplus Cloud:*
  * New Core NATS/JetStream datasource is now available. We welcome any feedback!
  * WebSocket source now supports multiple open messages. 
  * The chart type selector is now a dropdown, with hints for required columns when a type is disabled.
  * In the Query page's Stream Catalog, you can search by either stream or column.
  * In chart format settings, single color palettes are expanded to include 10 shades of a color (previously 3).
  * Tooltips are available on mouseover for charts in fullscreen mode. 

## Dec 11, 2023

*Proton:*
  * A new version (v0.6.0) of the [Proton JDBC driver](https://github.com/timeplus-io/proton-java-driver) is available: able to list tables and columns in DBeaver and Metabase.
  * A new version (v0.0.2) of the [Proton Metabase driver](https://github.com/timeplus-io/metabase-proton-driver) is available: able to list tables and columns.
  * New function: [lag_behind](functions_for_streaming#lag_behind), designed for streaming JOIN. If you don't specify the column names, the query will use the processing time on the left and right streams to compare the timestamp difference.

*Timeplus Cloud:*
  * New WebSocket datasource: Connect Timeplus with WebSocket by entering the URL and data type (JSON or text). 
  * Create external streams by directly entering SQL.
  * Upload CSV data to an existing stream.
  * In the Query page's Stream Catalog, you can search by stream, column, or both. 
  * In dashboard charts, we now show the "Last Updated" time for all chart types, on mouseover.
  * (Preview Feature) Introducing new datasources: NATS and NATS JetStream. The configuration UI will be available soon in Timeplus Cloud. Contact us if you'd like to try this feature.

## Nov 27, 2023

*Proton:*
  * [Metabase driver](https://github.com/timeplus-io/metabase-proton-driver) for Proton is now open source.
  * Proton JDBC driver is now available via [Maven](https://central.sonatype.com/artifact/com.timeplus/proton-jdbc).
  * You can now connect Proton to [Pulse](https://www.timestored.com/pulse/) for OHLC charts.
  * New functions added: [untuple](functions_for_comp#untuple), [tuple_element](functions_for_comp#tuple_element), [dict_get](functions_for_comp#dict_get), [dict_get_or_default](functions_for_comp#dict_get_or_default), [columns](functions_for_comp#columns), [apply](functions_for_comp#apply), [any](functions_for_agg#any), and [last_value](functions_for_agg#last_value).
  * You can now create an external stream with multiple columns while reading Kafka. [Learn more](proton-kafka#multi_col_read)

*Timeplus Cloud:*
  * An unlimited number of columns are now supported in the column chart (previously retricted to recent 30 results).
  * The Pulsar sink is enhanced to support batch, to improve writing performance.
  * "External Streams" is now shown in the left-side navigation menu, where you can see all external streams and create a new one. 
  * (Preview) We've added the open-high-low-close ([OHLC](viz#ohlc-chart)) chart type common in the finance industry, to visualize the movement of prices over time. Additional format settings include choosing a time range. Please contact us if you'd like to try this new chart type.

## Nov 13, 2023

*Proton:*
  * [JDBC driver](https://github.com/timeplus-io/proton-java-driver) for Proton is now available. Check out our [example](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc) for how to connect to Proton with DBeaver. We also submitted a PR to [Pulse UI](https://github.com/timestored/pulseui/pull/139).
  * An experimental [ODBC driver](https://github.com/timeplus-io/proton-odbc) for accessing Proton as a data source is also available.
  * An experimental `shuffle by` clause has been added. Currently, it only works for historical queries, and it will support streaming queries soon. The key use case for `shuffle by` is to support high cardinality `group by` (such as 10 millions of unique keys). To learn more about this advanced feature, join the discussion in our [Slack community](https://timeplus.com/slack).
  * Since version 1.3.19, by default, the backfill from historical store for time travel/rewind is enabled. For example `select * from stream where _tp_time>now()-14d` will load data from historical store for last 14 days, even for data not available in streaming storage. If you prefer the previous behavior, you can add `settings enable_backfill_from_historical_store=false` to the streaming SQL.

*Timeplus Cloud:*
  * In Data lineage, when you click on a resource tile, the path of related tiles is highlighted and the rest is grayed out.
  * For map charts, the size of the dot is now correlated to the width of the dot in pixels.
  * When creating a source, if you choose Protobuf as the Read As data type, the Protobuf message and definition are now mandatory to proceed.
  * You can copy your workspace ID by clicking on your workspace name in the top header and hovering on the ID. This is useful if you need to speak to us for support about your workspace. 
    

*Timeplus Platform:*
  * For on-prem deployment of Timeplus Platform, we now provide two observability options: using Timeplus or using Grafana/Loki.

## Oct 30, 2023

*Proton:*
  * You can now install single native binary for Mac or Linux - check out our installation guide [here](https://github.com/timeplus-io/proton/wiki/Install-single-binary-Proton).
  * External streams support writing. [(Learn more)](proton-kafka#write-to-kafka-with-sql)
  * External streams also support reading from specific Kafka partition(s). [(Learn more)](proton-kafka#read-specified-partitions) 

*Timeplus Cloud:*
  * Per customer feedback, we added a new capability to allow users to monitor the infra usages for their workspace, such as cpu/memory/disk/network. Check out an example dashboard [here](https://demo.timeplus.cloud/default/console/dashboard/eac7a4ab-5a55-45c2-bc66-98c39ebe0a90), and please contact us if you want to enable this experimental feature in your workspace. 
  * When creating an Apache Kafka, Confluent Cloud, or Redpanda source, we now display available topics in a dropdown. You can also enter a topic manually.
  * The CSV upload process is refined - we will auto-generate a column name if there is no header row available in your file.
  * Search by keyword in resource list pages is no longer case sensitive.
  * When formatting a single value chart, you can now add a blank space in the unit field (eg. if you want to have a space to separate the value and the unit).
  * Dashboard query variables dropdowns have a new UI: when searching, instead of highlighting matching items, we will now only show matching items in the dropdown.
  * When deleting a query bookmark, a confirmation dialog will be shown.

## Oct 16, 2023

*Proton:*
  * New data types now supported: ipv4 and ipv6, as well as related [functions](functions_for_url).
  * [Python Driver](https://github.com/timeplus-io/proton-python-driver) 0.2.10 now supports Python 3.11 and 3.12.
  * [Go Driver](https://github.com/timeplus-io/proton-go-driver) is now open source.
  * Our [Grafana data source plugin](https://github.com/timeplus-io/proton-grafana-source), to connect to Proton and visualize streaming or batch queries, is now open source. Stay tuned for our upcoming blog and demo!
  * We've added [User-Defined Functions](proton-create-udf) support in Proton v1.3.15 (create/delete), allowing you to leverage existing programming libraries, integrate with external systems, or make SQL easier to maintain.

*Timeplus Cloud:*
  * You can now search by keyword(s) in the Dashboards list.
  * In the Query page, we've removed Recent Queries from the SQL Helper side panel. You can still see your Recent Queries by opening a new query tab, or on your Homepage. 

## Oct 2, 2023

Timeplus is now open source! Introducing **Proton**, a unified, lightweight streaming and historical data processing engine in a single binary, powering the Timeplus Cloud streaming analytics platform. [Try Proton with Docker](https://github.com/timeplus-io/proton)

*New in Proton:*
  * External stream now supports checkpoints. Whether you stop and rerun the query, or the server restarts, it will read from where it stopped.
  * [Python driver](https://github.com/timeplus-io/proton-python-driver) and [Go driver](https://github.com/timeplus-io/proton-go-driver) are published.

*New in Timeplus Cloud:*

**Sinks**
  * We've added a ClickHouse sink, as a preview feature. You can find this option when you expand "Show more outputs".
  * We've also made it easier for you to create new sinks, by adding a "Create New Sink" button to the Sinks list page. On the Query page, while waiting for results to come in, you can now also create a sink.

**Console UI**
  * Our onboarding experience has a new look. After [creating a new account](https://us.timeplus.cloud), answer a couple of quick questions so we can get to know you better, and then give your workspace a name. 

## Sep 18, 2023

**Database**
  * New functions to generate random data – check them out [here](functions_for_random).

**Data Ingestion**
 * During the Preview step of adding a new source, we now show you the time remaining for previewing data. If no event comes in after 30 seconds, you can go back to previous steps, check your configuration, then try again.
 * For "Sample dataset", you can select an [event time column](eventtime) when you set up the stream. CSV file uploads will be enhanced soon.
 * All sources now have data retention options when you create a new stream.

**Sinks**
 * We've added a sink for Confluent Cloud. This is similar to the Apache Kafka sink, with mandatory authentication. 

**Console UI** 
 * In resource lists such as Views, Materialized Views, Sinks, and Query History, the SQL is now shown in one line without breaks. 

## Sep 5, 2023

The Terraform Provider for Timeplus is now published - [check it out](https://registry.terraform.io/providers/timeplus-io/timeplus/latest). 

**Query**
  * You can now edit a query without canceling it, and then run the new query, or open it in a new tab.
  * When the SQL editor is empty, the `Format` button is now disabled.

**Dashboards and Charts**
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
