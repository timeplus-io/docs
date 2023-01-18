# Public Beta 2

We are thrilled to launch the next phase of public beta of Timeplus cloud release. Comparing to the [Public Beta 1](public-beta-1), most of the backend and frontend changes are incremental enhancements, except the entry point is changed from https://beta.timeplus.cloud to https://us.timeplus.cloud

We will update the beta version from time to time and list key enhancements in this page.

(in year 2023)

## 1/20

* UI update for the query result:
  * **Infinite scroll.** For both streaming queries and historical queries, newer results are shown in the bottom. You can scroll up to see earlier results, then click **Jump to latest data** button in the bottom to continue to view latest results.
  * **Row details**. For columns with long text or JSON, you can click the "eye" button to open a side panel with the details of the row.
  * **Updated column summaries.** For numeric columns, the minimum/maxiumum/average values are shown in the column header. The data range is since the query starts til now. For datetime columns, the from/to timestamp are shown. For boolean or string columns, the top 3 value are shown with the percentage. 
  * **Quick filter.** You can type some keywords to filter the results without rewriting the SQL. It will perform a simple `string#contains` match for all columns. Regular expression or logic condition are not supported.
  * **Show/hide columns.** You can hide some columns without rewriting SQL via the newly-introduced **settings** button for query results. You can also download results as CSV in this dialog.
  * **Resize columns**. Timeplus automatically set a proper initial column size based on column type. You can always resize the column by drag-n-drop.
* More chart types and options. You can choose from Line Chart, Area Chart, Column Chart, Bar Chart, Single Value Chart, and Chart as the visualization types. Each chart supports basic settings and advanced settings.
* A new data type `json` is added, with better query performance comparing saving the JSON as `string` and extracting value at query time. Suitable for JSON documents in consistent schema. Access the value via `column.jsonpath` (instead of `column:jsonpath` for query-time JSON extraction)
* We started to deprecate `SETTINGS seek_to=..` Time Travel is still supported, you just need to use the `_tp_time` column in the WHERE condition, such as `WHERE _tp_time>=now()-1h` to time travel to 1 hour ago and show data since then. Or `WHERE _tp_time >= '2023-01-14'`  All data streams in Timeplus contain such `_tp_time` as the event time.
* (Experimental) in addition to the [Remote UDF](remote-udf), now you can define new functions with JavaScript. Both scalar functions and aggregation functions are supported. Please check the [JS UDF](js-udf) documentation for details. 