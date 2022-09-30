

# Private Beta 2

We are thrilled to launch the second private beta of Timeplus cloud release. Comparing to the [Private Beta 1](private-beta-1), most of the backend and frontend changes are incremental enhancements, except the entry point is changed from [https://{tenant}.beta.timeplus.com](https://tenant.beta.timeplus.com) to [https://beta.timeplus.cloud/{tenant}](https://beta.timeplus.cloud/tenant)

We will update the beta version from time to time and list key enhancements in this page.

### Biweekly Update 9/19-9/30

* Streaming engine
  * Enhanced [dedup](functions#dedup) function to only cache the unique keys for a given time period. This is useful to suppress the same alerts in the short time period. 
  * Support sub-stream, e.g. `select cid,speed_kmh, lag(speed_kmh) OVER (PARTITION BY cid) as last_spd from car_live_data` 
* Source, sink, API and SDK
  * Updated Python SDK https://pypi.org/project/timeplus/ to auto-delete the query history, refine error handling, Please note there is a breaking change, `Env().tenant(id)` is changed to `Env().workspace(id)` to be align with our [terminology](glossary#workspace) 
  * Updated the [REST API](/rest) to show the optinal description for source/sink, and replace "tenant" with "workspace-id" in the documentation.
  * The Kafka source no longer auto-create the topics

* UI improvements
  * Show the total data size on the home page, as well as the averge data in and data out throughput.
  * Added a new 'SQL Templates' button in the query page to help you quickly add common snippets, such as `settings seek_to='-1h'`
  * Added a closable page description, as well as context aware help sidepanel.
  * Refined "Data Lineage" page to show stream schema, view SQL, and sink types.
  * Able to set units when you choose to view latest data.
  * Mobile friendly login/signup page.

### Biweekly Update 9/5-9/16

* Streaming engine
  * Added a [round](functions#round) function to round a value to a specified number of decimal places.
  * Improved cluser support.
* Source, sink, API and SDK
  * Added new CRUD API for dashboards. The previous charts on home page will be removed automatically during upgrade.
  * Simplifid the hostname for the streamlit demo to https://timeplus.streamlitapp.com

* UI improvements
  * Introduced full dashboard management. You can create multiple dashboards with name/description/charts.
  * Redesigned home page to show high level information for the workspace.
  * Introduced a new 'Data Lineage' page to visualize the relationship between sources/streams/views/sinks.
  * Enhanced the workflow for visualizing the query result. You need to choose whether to view latest data, or check data trend, or view detailed data.
  * Now you can visualize the query results from a historical query, e.g. `select .. from table(..)..`, and add the charts to dashboards.
  * Removed the browser side data aggregation to improve performance. If the rate of the data is greater than the render interval (200ms), only the last data point within the interval will be rendered.  If you run a streaming tail or filter, you no longer can visulize the data with bar chart. Please use `GROUP BY` in the SQL for such analysis.
  * Enhanced the SQL editor to show column names without using stream name.
  * Mobile friendly login/signup page.

###  Biweekly Update 8/22-9/2

We have migrated beta1 customers to the beta2. https://demo.timeplus.com is no longer accessible. Please visit https://beta.timeplus.cloud/demo if you have an account for the beta testing.

* Streaming engine
  * Revised logical functions to return `bool` instead of `uint8`
  * Added experimental support for ARM chips
* Source, sink, API and SDK
  * Updated [datapm](https://datapm.io/docs/quick-start/) Timeplus sink to support beta2 multi-tenant API
  * Enhanced the snowflake sink to specify the dataware
  * Published the sample Java code as [a public Github repo](https://github.com/timeplus-io/java-demo). You can easily get Timeplus query results and do other operations without directly handling the low level REST API 
* UI improvements
  * Separated the home page and dashboard page. In the future, you can create more than one dashboard
  * Charting enhancements: show data value as tooltips for bar charts on hover, view the chart with in full page mode 
  * Enhanced the SQL editor to support common query snippets, e.g. `group by window_start, window_end`
  * Enhanced the SQL editor to show auto-complete for User-Defined Function
  * Show the data size for the streams
  * Updated the navigation bar to show the user profile, workspace settings and help on the top-right corner

###  Week of 8/15

* Streaming engine
  * (Experimental) enhanced the [session window](functions#session) aggregation to create substreams based on customized logic for window start and window end
  * Added a new function [extract_all_groups](functions#extract_all_groups) to process text with regular expressions.
* Source, sink, API and SDK
  * Webhook sink is enhanced to support customized HTTP method, content type and headers.
* UI improvements
  * New UI for Apache Pulsar as a source or a sink.
  * The columns in the query results are now resizable with drag-and-drop.
  * Unattended streaming SQL will be cancelled automatically.

###  Week of 8/8

First product update in the Private Beta 2.

* Streaming engine
  * Introduced a new data type [uuid](datatypes) to identify records with a 16-byte number. A new function [uuid](functions#uuid) is added to generate such uuid.
  * Added a new function [extract_all_groups_horizontal](functions#extract_all_groups_horizontal) to process text with regular expressions.

* Source, sink, API and SDK
  * Released https://pypi.org/project/timeplus/0.2.0/ with optional tenant ID support.
  * Supported Apache Pulsar and StreamNative Cloud as a data source or a data sink. You can load real-time data from Pulsar into Timeplus with REST API (web UI will be ready soon). [Learn more](ingestion#pulsar)
  * Added an experimental sink for Snowflake. You can send Timeplus real-time query results to Snowflake.
* UI improvements
  * New login screen.
  * Experimental sink UI for Snowflake.
  * Improved multi-tenant support in varoius UI pages.