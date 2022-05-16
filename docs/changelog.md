# Release Notes

## Private Beta 1

We are thrilled to launch the first private beta of Timeplus cloud release. A lot of cool features and unlimited possibilities. We will update the beta version from time to time and list key enhancements in this page.

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





