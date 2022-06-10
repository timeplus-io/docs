# Release Notes

## Private Beta 1

We are thrilled to launch the first private beta of Timeplus cloud release. A lot of cool features and unlimited possibilities. We will update the beta version from time to time and list key enhancements in this page.

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





