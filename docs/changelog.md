# Release Notes

## Private Beta 1

We are thrilled to launch the first private beta of Timeplus cloud release. A lot of cool features and unlimited possibilities. We will update the beta version from time to time and list key enhancements in this page.

### Week of 7/25

* Streaming engine
  * Enhanced [json_extract_array](functions#json_extract_array) function to return clean string values. `select '{"a":1,"tags":["x","y"]}' as raw, json_extract_array(raw:tags)`now returns ` [ "x", "y" ]` , instead of ` [ "\"x\"", "\"y\"" ]` in the previous releases.
  * Added a new shortcut to access json arrays without having to use the [json_extract_array](functions#json_extract_array) function. The above query can be simplified as `select '{"a":1,"tags":["x","y"]}' as raw, raw:tags[*]`
  * Refined typing system and logical comparisons return `bool` instead of `uint8`

* Source, sink, API and SDK
  * All Timeplus sinks now use the `{{.columnName}}` syntax to access the column value in the sink title or body. Numbers and other primitive types are supported (previously only string columns are supported).
  * Fixed an issue that cancelled queries could be marked as finished.
  * Fixed an issue that EPS(event per second) won't be shown if the query finishes too fast.
* UI improvements
  * Added a new option in the 'Send data to..' dialog to send the results to a stream in the Timeplus tenant.
  * Show the number of running queries when you create a new query tab.
  * Added an icon on the query tab if the query is running.
  * Enhanced the font colors.
  * Enhanced the chart colors.

### Week of 7/18

* Streaming engine
  * Refined the behavior of [materialized views](view#m_view), to keep it consistent with the other Timeplus queries. `SELECT * FROM table(a_materialized_view)` will get all past results, instead of the recent one. 
  * Added the [count_if](functions#count_if) function and [unique_exact_if](functions#unique_exact_if) function to count the number of rows or unique value matching certain conditions.
  * Added [json_extract_keys](functions#json_extract_keys) function to get the keys for the JSON map object.
  * Added the [to_bool](functions#to_bool) function to convert other types to `bool`
  * Added [is_nan](functions#is_nan), [is_infinite](functions#is_infinite), [is_finite](functions#is_finite) functions to detect the edge cases when a number column contains infinite number etc.
  * Added [to_type_name](functions#to_type_name) function to show the data type name, mainly for troubleshooting purpose.
  
* Source, sink, API and SDK
  * Updated the [Python SDK](https://pypi.org/project/timeplus/0.1.10/) to show the metrics
* UI improvements
  * Added new visualization types: bar chart and streaming table
  * Enhanced the management page of sinks, to show the sink status, number of message sent, failure count, etc.
  * Enhanced the SQL editor to highlight the beginning/ending (),{},[]. This could be very helpful for complex SQLs with nested function calls.

### Week of 7/11

* Streaming engine
  * Fixed an issue of [lags](functions#lags) function to get a range of past results for the specific column
  * Exposed the [coalesce](functions#coalesce) function to skip null value and return the first non-`NULL` value. Many functions expect the arguments cannot be `NULL`

* Source, sink, API and SDK
  * Updated the [Python SDK](https://pypi.org/project/timeplus/0.1.10/) to support the new source API and add authentication to websockets
  * Added the optional description field for sinks
* UI improvements
  * Show the newly-opened query tab such as 'Tab 1', or 'Tab 2', instead of 'Untitled'
  * Able to delete the first query tab
  * Consolidated various streamlit demos to [a single URL](https://timeplus-io-streamlit-apps-demo-wjt6x1.streamlitapp.com/) 
  * Replaced alert API with sink API. ACTION-REQUIRED: please recreate the alert/sink after the upgrade 

### Week of 7/4

* Streaming engine

  * Enhanced the UDF(User-Defined-Function) to allow empty authentication headers

* Source, sink, API and SDK

  * Updated the [Python SDK](https://pypi.org/project/timeplus/) to enable the stream retention settings and to create/manage the views

* UI improvements

  * For streaming query results, we now show the percentages for categorical fields 
  * A new visual editor for complex data type is available for new stream/source/function wizards
  * We improved the UI for event time selector while previewing messages in Kafka source
  * When you create a stream while defining a Kafka source, now you can define the retention policy (how the old data will be purged automatically)

### Week of 6/27

* Streaming engine

  * At this point, [session window](functions#session) aggregation only supports streaming queries. Properly reject the query if the `session(..)` is used together with `table(..)` function.

* Source, sink and API

  * The tenant/workspace level access token has been removed in REST API and UI. Please create API keys per user.
  * Greatly improved the type inference when you create a stream with the Kafka source. More accruate data type for primitive types. Added array/map support.

* UI improvements

  * Now you can register UDF(User-Defined-Function) in the Workspace menu (only available for workspace admin)
  * Greatly improved the data type selector in the stream creation page
  * Improved the display for columns in boolean and date types, and better display for null value
  * Refined the look&feel for the navigation menu
  * Improved the display of error messages


### Week of 6/20

* Streaming engine

  * [Session window](functions#session) now supports millisecond for window_start/window_end.
  * Added a new [lags](functions#lags) function to get a range of past results. This could help the pure-SQL based ML/predition.
  * Added a new [grok](functions#grok) function to parse a line of text into key/value pairs, without having to write regular expression. 

* Source and sink

  * Updated [datapm](https://datapm.io/docs/quick-start/) to use personal API key instead of API token

* UI improvements

  * Refined the 'Create New Stream' dialog. Now you can specify the max age or size for the stream.
  * You can click the user icon on the bottom-left corner and open the 'Personal Settings'. We will add more settings. You can create and manage personal API keys in this setting page. Tenant level access token UI will be removed soon.

* API

  * Updated the [REST API doc](https://docs.timeplus.com/rest.html), adding the experimental stream-level rentetion policies.

  

### Week of 6/13

* Streaming engine
  * Added new function [moving_sum](functions#moving_sum) to calculate the moving sum for a column. This unlocks more use cases stateful streaming processing, such as [streaming over](https://share.streamlit.io/timeplus-io/github_liveview/develop/stream_over.py).
  * Added other functions for [array processing](functions#arrays), such as [array_sum](functions#array_sum), [array_avg](functions#array_avg)
* Source and sink
  * Kafka source supports local schema registry without authentication 
* UI improvements
  * Added validation while creating streams. The stream name should start with a letter and the rest of the name only include number, letter or _
  * Disable the Next button in the source wizard if the data is not previewed

### Week of 6/6

* Streaming engine
  * More [math functions](functions#math) are exposed. This can help you to run SQL-based simple ML/prediction models.
  * (Experimental) [stream-to-stream join](query-syntax#stream_stream_join) no longer requires a ` date_diff_within(..)`, although it's still recommended to add timestamp constrains to improve performance. 
  * (Experimental) able to set a retention policy for each stream, either time-based (say only keep recent 7 days' data), or size based(say only keep recent 1GB data)
* Source and sink
  * (Experimental) support Personal Access Token (PAT) in the REST API, which is long-living (or set an expiration date) and per-user. Tenant-level access token will be deprecated. 
* UI improvements
  * After the sources or sinks are created, now you can edit them without having to delete and recreate them.
  * Great performance improvement for live tables/charts.

### Week of 5/30

* Streaming engine
  * (Experimental) able to use the external Kakfa/Confluent/Redpanda as Timeplus stream storage.
  * (Experimental) the [table](functions#table) function now works with [seek_to](query-syntax) You can query historical data by combining `table(streamName)` and `settings seek_to='..'`
* Source and sink
  * Worked with [datapm](https://datapm.io/docs/quick-start/) to send live Twitter data to https://demo.timeplus.com 
  * Updated the [REST API doc](https://docs.timeplus.com/rest.html), the `/exec` endpoint has been removed. Send `POST` requests to `/queries` instead.
* UI improvements
  * Able to drag-n-drop to change the order of query tabs

### Week of 5/23

* Streaming engine
  * (Experimental) new UI and API to create and query [external streams](working-with-streams#external_stream). You can query real-time data in Confluent Cloud, Apache Kafka or Redpanda immediately, without loading the data into Timeplus.
  * (Experimental) [stream-to-stream join](query-syntax#stream_stream_join) is ready to test for beta customers, e.g. `SELECT .. FROM stream1 INNER JOIN stream2 ON stream1.id=stream2.id AND date_diff_within(10s)`
  * New function [date_diff_within](functions#date_diff_within) to determine whether 2 datetime are within the specified range. This is necessary for stream to stream join. You can also use more flexible expressions like `date_diff('second',left.time,right.time) between -3 and 5`
* Source and sink
  * Enhanced the [datapm](https://datapm.io/docs/quick-start/) Timeplus sink to support loading JSON data from PostgreSQL.
  * When you are previewing data from Kafka, you can choose the timezone if the timezone is not included in the raw data.
* UI improvements
  * Able to edit the panel titles on dashboards.
  * Improve UI consistency.

### Week of 5/16

* Streaming engine
  * (Experimental) greatly simplified how to query JSON documents. Now you can use `json_doc:json_path` as a shortcut to extract value in the JSON document. For example `select '{"c":"hello"}' as j, j:c`, you will get "hello" as the value. In the past, you have to call `json_extract_string(j,'c')` Nested structures are support too, such as `select '{"a":{"b":1}}' as j, j:a.b` will get `1` as a string value. To convert to int, you can use `::` as the shortcut, e.g. `select '{"a":{"b":1}}' as j, j:a.b::int`
  * Added a function [is_valid_json](functions#is_valid_json) to check whether the specific string is a valid JSON document, e.g. `select j:a where is_valid_json(j)`
  * Added `varchar` as an alias for `string` data type. This could improve the compatibility with other SQL tools.
* Source and sink
  * Enhanced the authentication for Kafka/Redpanda source: added new SASL mechanisms: scram-sha-256 and scram-sha-512, added config to disable TLS, added config to skip verifying server when TLS is enabled, fixed a bug that the source will hang if authentication fails.
  * Enhanced the [REST API](https://docs.timeplus.com/rest.html) to specify the timezone for event timestamps in the raw event.
* UI improvements
  * Refresh stream list after creating streams or views.
  * Show the source configuration JSON in a better tree view.

### Week of 5/9

* Streaming engine
  * New [array_join](functions#array_join) function to generate a set of rows based on the value in the array, joining with other columns
  * (Experimental) add a new [dedup](functions#dedup) table function, which can remove duplicated events from streaming queries or historical queries.
* Source and sink
  * enhanced the [datapm](https://datapm.io/docs/quick-start/) Timeplus sink to support loading data from PostgreSQL
  * (Experimental) a new source to load data from [ably](https://ably.com/hub)
* UI improvements
  * You can pause a streaming query, then sort by columns or use the pagination buttons. This can help you to review the streaming query results. Clicking on the resume button to continue to get latest streaming results.
  * (Experimental) updated the query tab style, with buttons on the tabs to save the queries.

### Week of 5/2

* Published Python SDK 0.1.1 with token auto-refresh
* Published the REST API Doc at https://docs.timeplus.com/rest 
* Streaming engine
  * (Experimental) added a new [xirr](functions#xirr) function to calculate the internal rate of return of an investment based on a specified series of potentially irregularly spaced cash flows.
* UI improvements
  * Resume the queries on dashboards after server restart
  * Better SQL auto-complete, with function description, usage and examples
  * Show the SQL with syntax highlighting in the views and sinks pages
  * Persist the state for each query tab
  * (Experimental) make sinks editable

### Week of 4/25

* Published the Python SDK to https://pypi.org/project/timeplus/
* Streaming engine
  * Able to rename streams
  * (Experimental) Added `ORDER BY` support for streaming queries with aggregations
  * (Experimental) Added `EMIT TIMEOUT 5s` for streaming queries so that the window will be closed even there is no more event to progress the watermark
  * (Experimental) Added  [emit_verison()](functions#emit_version) to show an unique number for each emitted window (so that you can tell from the streaming results which rows are from the same window)
* Source and sink
  * 10x throughput enhancement for the Kafka source
  * (Experimental) a [datapm](https://datapm.io/) sink to ingest batch/streaming data to Timeplus
* UI improvements
  * Add a way to pause the live table and show the long text or JSON document as a popover
  * Able to resize the query editor
  * Show the event time in the local timezone
  * The Format SQL in web UI now calls the backend API, instead of pure frontend SQL format
  * (Experimental) Refined the streaming dashboard layout and editing
  * (Experimental) Better show late events in the streaming charts

### Week of 4/18

* Improved the API token UI
* Experimental [session](functions#session) window for streaming processing. Many new use cases will be unlocked.
* Enhanced the [top_k](functions#top_k) function to show event counts by default
* Added new functions for array and map: [map_cast](functions#map_cast) , [group_array](functions#group_array)
* Added new streaming functions [earliest](functions#earliest) and [latest](functions#latest) and to show the first or last event in the streaming window.

### Week of 4/11

* Refined REST API HTTP code and error messages
* Also improved error handling in the web UI
* Open-sourced the performance test framework as part of [chameleon](https://github.com/timeplus-io/chameleon/tree/main/generator) It can generate streaming data and observe the query latency, with various combinations of batch size, concurrency, search hit ratio, etc. It supports Timeplus, Flink, Materialize, Splunk, etc.

### Week of 4/4

* UI improvements: 
  * Besides lines, a few more chart types are available in the streaming visualization: area, bar, single value
  * Show the column list of streams in a popup dialog. 
  * Show REST API Bearer token in the help page
* Webhook sink improvement: if you don't set the body, we will wrap the entire row as a JSON and POST it to the webhook

### Week of 3/28

* Enhanced the file source to improve stability while processing large static files.
* Enhanced the Kafka source to support AVRO format (with schema registry). You can also load the entire JSON document as a single string column to support dynamic JSON schema. Plain text is also supported for the Kafka source.
* Added two new chart types: Area and Single Value. You can try them in the Visualization tab of the query page.
* UI improvement to expand/collapse navigation menu.
* Experimental Python SDK for push and query data.

### Week of 3/21

* Refined the [data type](datatypes) to consistently use lower case type names. `bool` is officially supported.
* Added new UI for Redpanda data source and sink.
* Added new single-sign-on provider: Microsoft.

### Week of 3/8

* We are thrilled to launch the first private beta of Timeplus cloud release. 





