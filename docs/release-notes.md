# GA Releases

This page summarizes changes in each major update in Timeplus, including new features and important bug fixes.

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
