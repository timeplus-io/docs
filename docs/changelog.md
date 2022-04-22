# Release Notes

## Private Beta 1 (3/8/2022)

We are thrilled to launch the first private beta of Timeplus cloud release. A lot of cool features and unlimited possibilities. We will update the beta version from time to time and list key enhancements in this page.

### Week of 3/21

* Refined the [data type](datatypes) to consistently use lower case type names. `bool` is officially supported.
* Added new UI for Redpanda data source and sink.
* Added new single-sign-on provider: Microsoft.

### Week of 3/28

* Enhanced the file source to improve stability while processing large static files.
* Enhanced the Kafka source to support AVRO format (with schema registry). You can also load the entire JSON document as a single string column to support dynamic JSON schema. Plain text is also supported for the Kafka source.
* Added two new chart types: Area and Single Value. You can try them in the Visualization tab of the query page.
* UI improvement to expand/collapse navigation menu.
* Experimental Python SDK for push and query data.

### Week of 4/4

* UI improvements: 
  * Besides lines, a few more chart types are available in the streaming visualization: area, bar, single value
  * Show the column list of streams in a popup dialog. 
  * Show REST API Bearer token in the help page
* Webhook sink improvement: if you don't set the body, we will wrap the entire row as a JSON and POST it to the webhook

### Week of 4/11

* Refined REST API HTTP code and error messages
* Also improved error handling in the web UI
* Open-sourced the performance test framework as part of [chameleon](https://github.com/timeplus-io/chameleon/tree/main/generator) It can generate streaming data and observe the query latency, with various combinations of batch size, concurrency, search hit ratio, etc. It supports Timeplus, Flink, Materialize, Splunk, etc.

### Week of 4/18

* Improved the API token UI
* Experimental [session](functions#session) window for streaming processing. Many new use cases will be unlocked.
* Enhanced the [top_k](functions#top_k) function to add an optional parameter to show event counts.

