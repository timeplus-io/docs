# Public Beta 2

We are thrilled to launch the next phase of public beta of Timeplus cloud release. Compared to our [Public Beta 1](public-beta-1), most of the backend and frontend changes are incremental enhancements, except the entry point is changed from https://beta.timeplus.cloud to https://us.timeplus.cloud

We will update the beta version from time to time and list key enhancements in this page.

(in year 2023)

## 3/18

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


## 3/6

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
  * Added a new [LATEST JOIN](query-syntax#latest-join) for streaming SQL. For two append-only streams, if you use `a LEFT INNER LATEST JOIN b on a.key=b.key`, any time when the key changes on either streams, the previous join result will be cancelled and a new result will be added.

## 2/17

* New features

  * [Global aggregation](query-syntax#global) now supports sub-second emit interval.  e.g. `select max(_tp_time),count(*),avg(speed_kmh) from car_live_data emit periodic 100ms`
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

## 2/3

* Query page enhancements
  * Showing whether the query is a streaming query or historical query.
  * Showing basic query metrics, e.g. EPS and time elapsed. Click the link to open detailed metrics panel.
  * When the query is running, a green dot on the query tab as the indicator.
  * The query page is now URL-addressable. When you type SQL in the editor, it becomes part of the URL. Share the URL to others to open the query UI with the same SQL.
  * For columns with long text, you can open the Settings to turn on "Wrap Text" mode.
  * Better error handling for various edge cases of failed queries.
* Visualization enhancements
  * Refine the layout for various settings.
  * Better support for historical queries.



## 1/20

* UI update for the query result:
  * **Infinite scroll.** For both streaming queries and historical queries, newer results are shown in the bottom. You can scroll up to see earlier results, then click **Jump to latest data** button in the bottom to continue to view latest results.
  * **Row details**. For columns with long text or JSON, you can click the "eye" button to open a side panel with the details of the row.
  * **Updated column summaries.** For numeric columns, the minimum/maximum/average values are shown in the column header. The data range is since the query starts til now. For datetime columns, the from/to timestamp are shown. For boolean or string columns, the top 3 value are shown with the percentage. 
  * **Quick filter.** You can type some keywords to filter the results without rewriting the SQL. It will perform a simple `string#contains` match for all columns. Regular expression or logic condition are not supported.
  * **Show/hide columns.** You can hide some columns without rewriting SQL via the newly-introduced **settings** button for query results. You can also download results as CSV in this dialog.
  * **Resize columns**. Timeplus automatically set a proper initial column size based on column type. You can always resize the column by drag-n-drop.
* More chart types and options. You can choose from Line Chart, Area Chart, Column Chart, Bar Chart, Single Value Chart, and Chart as the visualization types. Each chart supports basic settings and advanced settings.
* A new data type `json` is added, with better query performance comparing saving the JSON as `string` and extracting value at query time. Suitable for JSON documents in consistent schema. Access the value via `column.jsonpath` (instead of `column:jsonpath` for query-time JSON extraction)
* We started to deprecate `SETTINGS seek_to=..` Time Travel is still supported, you just need to use the `_tp_time` column in the WHERE condition, such as `WHERE _tp_time>=now()-1h` to time travel to 1 hour ago and show data since then. Or `WHERE _tp_time >= '2023-01-14'`  All data streams in Timeplus contain such `_tp_time` as the event time.
* (Experimental) in addition to the [Remote UDF](remote-udf), now you can define new functions with JavaScript. Both scalar functions and aggregation functions are supported. Please check the [JS UDF](js-udf) documentation for details and contact us if you want to try this.
