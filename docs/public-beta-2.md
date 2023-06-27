# Public Beta 2

We are thrilled to launch the next phase of the public beta of Timeplus cloud release. Compared to our [Public Beta 1](public-beta-1), most of the backend and frontend changes are incremental enhancements, except the entry point is changed from https://beta.timeplus.cloud to https://us.timeplus.cloud

We will update the beta version from time to time and list key enhancements in this page.

## Jun 27, 2023 

A beta version of the [new Timeplus Python SDK](https://pypi.org/project/timeplus/1.3.0b2/) is available. It supports SQL Academy so we can integrate Timeplus with rich ecosystems in Python, such as [Superset](https://superset.apache.org/), [QueryBook](https://www.querybook.org), and [LangChain](https://python.langchain.com/docs/get_started/introduction.html). Contact us if you want to try this new feature.
The [Meltano plugin for Timeplus](https://github.com/timeplus-io/target-timeplus) is updated to use the latest Python SDK and support more flexible data schema.

**Console UI**
  * For changelog or versioned streams, you can create complex primary keys which include multiple columns.
  * Side panels in the Query page have a new look: the SQL Helper panel no longer overlaps the SQL editor and results table, and the row details panel is now shown inside the results table.
  * For Sources and Sinks, click on the "i" next to the status, to see the last error message.
  * Improved error messages for SQL queries, to show more details.
  * For API keys, we now show the first four and last four characters, and the previous name is now the description. 

**REST API**
  * We marked the required parameters in our [REST API documentation](https://docs.timeplus.com/rest) and completed validation to avoid creating resources without required information.
  * Updated our REST API docs to include more descriptions. 


## Jun 12, 2023 

**New Feature**
  * Introducing collaboration in Timeplus: you can invite team members to your Timeplus workspace (during our Public Beta, you may invite unlimited team members). Members in the same workspace can access and edit all streams, sources, sinks, dashboards, etc. Only the workspace owner can invite or remove members.

**Data Ingestion and Sinks**
  * You can now ingest data to Timeplus via [Kafka Connect plugin for Timeplus](https://www.confluent.io/hub/timeplus/kafka-timeplus-connector-sink). It is published on Confluent Hub, and you can install it on Confluent Cloud or on-prem Confluent Platform and Apache Kafka.
  * We've added Protobuf encoding for Apache Kafka and Redpanda sinks, currently available via REST API. Contact us to try it out!  

**Other Enhancements**
  * For streams, you can now set separate retention policies for streaming and historical data. For example, for a stream with IoT data, you can set 1 day for the streaming data and 90 days for the historical data.
  * Please note: REST API v1beta1 is now deprecated, and it will be removed in a couple of months. Please check the v1beta2 [API Docs](https://docs.timeplus.com/rest). [Python SDK](https://pypi.org/project/timeplus/), [Java Sample Code](https://github.com/timeplus-io/java-demo) and [Streamlit Demo App](https://github.com/timeplus-io/streamlit_apps) are updated.


## May 29, 2023 

**Data Ingestion**
  * We now have a consolidated page for adding your data to Timeplus. The new "Add Data" page allows you to add a source (such as Apache Kafka, Confluent Cloud, Redpanda, etc.), push data via Ingest REST API, import a CSV file, and connect an external stream (with Kafka data). Your added sources and external streams are also listed on this page, in separate tabs. 
  * In the Apache Kafka and Redpanda sources, you can now encode/decode Protobuf. During the "Pull Data" step, enter your Protobuf message name and definition. 
  * We also now support Debezium JSON as a read data format, with Upsert and CRUD (with CRUD currently being in preview). 

**Streaming Database and SQL**
  * We've made a significant performance enhancement for the hop window, from 10x to 100x. This is especially helpful for large window sizes, such as 24 hours as a total window size, but showing updates every second. 
  * User-defined functions (UDFs) and user-defined aggregates (UDAs) are now able to return an array as a data type. 

**Other Enhancements**
  * (Experimental) We've added a collaboration feature, allowing you to invite team members to your workspace. Contact us to try it out!  
  * We've reorganized our navigation menu to provide a clearer workflow: "Add Data" is now at the top, followed by "Run SQL". We've also added "Workspace Settings" to the menu, for quicker access to your UDFs and team members. 
  

## May 16, 2023

**Enhancements: Data Ingestion **
  * We've made it easier for you to push data via Ingest REST API. We've added a wizard page in our console to guide you through the steps of selecting a target stream, a request template, an API key, and then generating a sample code for the push request. [Learn more.](ingest-api)
  * Our CSV file upload wizard has a new look, in the same UI style as our other wizards.

**Enhancements: Dashboards and Charts**
  * When you make formatting changes to a chart, your changes will be instant, instead of needing to reload the chart.
  * We added an icon on mouseover to Dashboard charts, while in View-Only mode, that will open the chart's SQL in the Query editor page. 

## May 1, 2023

**Streaming Database and SQL**

* (Experimental) In addition to the default append-only data streams, you can now create streams with mutations and versions. You can leverage tooIs, such as [Debezium](https://debezium.io/), to load CDC (Change Data Capture) data from different sources and track the INSERT, UPDATE, DELETE operations in Timeplus. You can always get the latest event for any primary key. [Learn more.](working-with-streams)

**Dashboards**

  * (Experimental) A new map visualization type is added, showing the latest locations in a live map view.
  * For table visualization, if the update mode is per-key, you can enable a sparkline to track value changes for certain columns.

**Other Enhancements**

  * If you run `SELECT * FROM my_stream` and there is no data coming in for the first while, Timeplus will show you a hint message with SQL to query historical data.
  * A better color picker is added in visualization configuration forms.
  * The UI for our sample dataset is simplified. Instead of the regular configuration flow for other sources, you can now quickly generate sample data with a couple of clicks. 



## April 17, 2023

**Streaming Database and SQL**

* For stateful time window aggregations ([tumble](functions#tumble)/[hop](functions#hop)/[session](functions#session)), Timeplus now supports sub-second intervals: `ms` for milliseconds, `us` for microseconds, and `ns` for nanoseconds. For example, you can run a streaming SQL to show results every 10 milliseconds for the past 1 second sliding window: `select window_start, stock, avg(price) from hop(stocks,10ms,1s) group by window_start, stock`. Two months ago, we also added the capability to run global aggregations with fixed interval at sub-second level, such as `select sum(price) from stocks emit periodic 50ms`
* Added new functions [md5](functions#md5), [md4](functions#md4), and [hex](functions#hex), which can help you generate hash keys.

**Dashboards**

  * We refined the dashboard edit mode. Changes you make while in edit mode won't be saved automatically, to prevent accidental changes. Click the **Save Changes** button to confirm changes, or click the **Cancel** button to discard changes. 
  * You can now customize the colors of lines, areas, and bars for charts. 
  * **Migration notice:** since we updated the schema of dashboard & chart definition, your existing dashboards need to be re-configured manually to render properly. This would be a one-time effort.

**Other Enhancements**

  * A new [timeplus-target](https://hub.meltano.com/loaders/target-timeplus) is added in [Meltano](https://meltano.com/) Hub. Meltano provides 500+ source connectors, all of which can be configured to send data to Timeplus. Check [our blog](https://www.timeplus.com/post/meltano-timeplus-target) for more details.
  * In the query history page, the column for SQL statements is now wider, allowing you to see more.
  * In the query editor page, function descriptions are added to the auto-complete tooltip box.
  * We've made it easier to multi-task in Timeplus by letting you open new browser tabs. for example, when you are writing SQL in the **Query** page, and need to create a new view, you can right click **Views** in the left-side navigation menu and open a tab.
  * We refined the documentation of [Ingest API](ingest-api) and added code examples for Node/curl/Python/Java. [A new quickstart](quickstart-ingest-api) for the Ingest API is added too.

## April 3, 2023

**Streaming Database and SQL**

* Added 2 new functions: [arg_min](functions#arg_min) and [arg_max](functions#arg_max). With them, you can quickly locate the row with the minimum or maximum value for one column, and get the value for the specific column. To access more rows or columns, please use [min_k](functions#min_k) and [max_k](functions#max_k).
* (Experimental) In addition to the default append-only data streams, you can now create streams with mutations and versions. Contact us if you want to try this feature.

**Dashboards**

  * Conditional formatting is now supported in table visualizations. You can highlight a cell or an entire row if the value meets a certain condition you've set, such as speed > 80, or is_risky=true. The condition is evaluated in the browser, not on the server side (not via SQL). 
  * Also in table visualizations, if you set the "Update Mode" as "By Key", then you can turn on trend colors. For example, when you show the live prices for a set of stocks, if the price for a symbol increases, the delta number will be shown in green with an 🔼 icon. You can also configure the color of the delta number.

**Other Enhancements**

  * Updated the Source list page: source tiles are now smaller as we prepare to add more in the next few releases.
  * "Apache Kafka" and "Confluent Cloud" wizards have been redesigned to provide a more intuitive configuration experience. 
  * Updated the navigation menu. A few features are now at top levels: External Streams, Materialized Views, and User-Defined Functions.

## March 18, 2023

Try out our new demo workspace, [https://demo.timeplus.cloud](https://demo.timeplus.cloud/), with built-in FinTech and GitHub live data and real-time dashboards. Sign up and get read-only access to this demo server.

Enhancements:

**Query**

  * Simplified the `LATEST JOIN` syntax. No need to write `INNER LATEST JOIN`. [Learn more](query-syntax#latest-join).
  * For historical queries with tumble window aggregation, if there is no event in a window, such window won't be in the results. To show an empty window with default value(0 for numeric types and empty string for string), you can add order by window_start with fill step <window_size> .
  * Auto-cleanup recent query logs: if there are more than 500, older queries are removed. 

**Dashboard**
  * Show recent dashboards and their number of charts on the Homepage.
  * Dashboard drop-down filter supports static options.
  * Dashboard descriptions now support Markdown (bold, italics, etc., and hyperlinks). 
  * Continuously enhanced the charting options and styles. For example, for bar charts, the labels on y-axis are no longer rotated to improve readability.

**Sink**
  * Refined the sink dialog when sending query results to sink, separating the productional sinks and preview-stage sinks.
  * The webhook URL of the Slack sink is now treated as a credential and hidden by default (click “Show” to reveal) 

**Other**
  * Added a dependency check when you delete or rename a stream/view. If a stream or view is referred to in other views, the system will show an error when you try to delete/rename it.
  * Added a background check to detect the possible dead-lock of UDF, to improve system stability.
  * Enhanced the REST API: avoid getting statistics while listing streams or views; provide new API to get statistics for a stream or view; add more documentation/examples in our [REST API doc](https://docs.timeplus.com/rest).
  * Added a Slack button to our top header menu, inviting you to join our community Slack.


## March 6, 2023

* New features

  * You can add filters in dashboards. For example, view server status for the recent 5 minutes or recent 1 hour. [Learn more.](viz#filter)
  * Previously when you open a dashboard, you can resize panels, delete panels any time. Changes are saved automatically. While we are adding more features to the dashboard, we introduced the explicit view mode and edit mode.
  * (Experimental) You can further decorate your dashboard with panels with [Markdown](https://en.wikipedia.org/wiki/Markdown), which you can add styled text or even images. It is disabled by default. Contact us if you want to try this feature.
* Enhancements
  * Various enhancements for each chart type. [Learn more.](viz#chart)
  * Able to run [table()](functions#table) function for a view with streaming sql, e.g. `with c as(select col1,col2 from a_stream where b>0) select * from table(c)`  Please note the streaming SQL in the view cannot contain any aggregation. For example, you can define the field extract from a raw JSON stream as a view, then query the view either in streaming mode or in historical mode.
  * Introduce a new function `earliest_timestamp()` to return `1970-1-1 00:00:00`(UTC) You can also call this with `earliest_ts()`. A typical usage is `select * from stream where _tp_time>earliest_ts()` to list all data in the past and future. Again, the previous syntax `settings seek_to='earliest'` has been deprecated and will be removed soon.
  * You can also use `where _tp_time >..` multiple times in a query with JOIN/UNION, to time travel to different starting points for different streams.
  * To improve readability, you can use numeric literals with underscores, e.g. `select * from iot where age_second > 86_400 `. Underscores `_` inside numeric literals are ignored.
  * Added a new [LATEST JOIN](query-syntax#latest-join) for streaming SQL. For two append-only streams, if you use `a LEFT INNER LATEST JOIN b on a.key=b.key`, any time when the key changes on either stream, the previous join result will be canceled and a new result will be added.

## February 17, 2023

* New features

  * [Global aggregation](query-syntax#global) now supports sub-second emit intervals.  e.g. `select max(_tp_time),count(*),avg(speed_kmh) from car_live_data emit periodic 100ms`
  * You can now create multiple materialized views to write data to the same stream. A typical usage of this feature is to apply multiple processing logics on the same raw data and send to the same stream for aggregated results. For materialized views, Timeplus maintains the state of the query, which will work better for long running queries and failover.
  * (Experimental) After creating a new stream, you can choose to add a few rows directly in the Console UI, without creating a Source or posting via REST API. Contact us if you want to try this feature.
  * (Experimental) Built-in support for CDC ([Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture)) has been added in Timeplus backend and the console UI will be ready soon. You can create data streams in different modes. By default, it's append-only. You can also create the streams to accept change logs from [Debezium](https://debezium.io/) for INSERT, UPDATE, and DELETE. The streaming aggregation results will reflect the latest data change. Contact us if you want to try this feature.

* Enhancements

  * For time-series data visualization, you now have the option to set the time range in the Format tab.
  * The bar chart and column chart types are combined – simply set either horizontal or vertical chart style in the Format tab.
  * Stream list page shows the earliest and latest event time, helping you better understand the freshness for each data stream.
  * If you start running a streaming SQL then go to another page in Timeplus console, the query will be stopped automatically. This will reduce unnecessary server workload and the number of concurrent queries.
  * Improved the performance of query results in list mode.
  * Performance tuning for [external streams](working-with-streams#external_stream) and [materialized views](view#m_view).

## February 3, 2023

* Query page enhancements
  * Showing whether the query is a streaming query or historical query.
  * Showing basic query metrics, e.g. EPS and time elapsed. Click the link to open a detailed metrics panel.
  * When the query is running, a green dot on the query tab as the indicator.
  * The query page is now URL-addressable. When you type SQL in the editor, it becomes part of the URL. Share the URL to others to open the query UI with the same SQL.
  * For columns with long text, you can open the Settings to turn on "Wrap Text" mode.
  * Better error handling for various edge cases of failed queries.
* Visualization enhancements
  * Refine the layout for various settings.
  * Better support for historical queries.



## January 20, 2023

* UI update for the query result:
  * **Infinite scroll.** For both streaming queries and historical queries, newer results are shown in the bottom. You can scroll up to see earlier results, then click **Jump to latest data** button in the bottom to continue to view the latest results.
  * **Row details**. For columns with long text or JSON, you can click the "eye" button to open a side panel with the details of the row.
  * **Updated column summaries.** For numeric columns, the minimum/maximum/average values are shown in the column header. The data range is since the query starts till now. For datetime columns, the from/to timestamp are shown. For boolean or string columns, the top 3 values are shown with the percentage. 
  * **Quick filter.** You can type some keywords to filter the results without rewriting the SQL. It will perform a simple `string#contains` match for all columns. Regular expression or logic conditions are not supported.
  * **Show/hide columns.** You can hide some columns without rewriting SQL via the newly-introduced **settings** button for query results. You can also download results as CSV in this dialog.
  * **Resize columns**. Timeplus automatically sets a proper initial column size based on column type. You can always resize the column by drag-n-drop.
* More chart types and options. You can choose from Line Chart, Area Chart, Column Chart, Bar Chart, Single Value Chart, and Chart as the visualization types. Each chart supports basic settings and advanced settings.
* A new data type `json` is added, with better query performance comparing saving the JSON as `string` and extracting value at query time. Suitable for JSON documents in consistent schema. Access the value via `column.jsonpath` (instead of `column:jsonpath` for query-time JSON extraction)
* We started to deprecate `SETTINGS seek_to=..` Time Travel is still supported, you just need to use the `_tp_time` column in the WHERE condition, such as `WHERE _tp_time>=now()-1h` to time travel to 1 hour ago and show data since then. Or `WHERE _tp_time >= '2023-01-14'`  All data streams in Timeplus contain such `_tp_time` as the event time.
* (Experimental) In addition to the [Remote UDF](remote-udf), now you can define new functions with JavaScript. Both scalar functions and aggregation functions are supported. Please check the [JS UDF](js-udf) documentation for details and contact us if you want to try this.
