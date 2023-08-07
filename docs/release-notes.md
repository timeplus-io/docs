# GA Releases

This page summarizes changes in each major update in Timeplus, including new features and important bug fixes.

## Aug 8, 2023

**Database**
  * Added new functions for URL handling – check them out [here](functions_for_url).
  * Hop/session functions are no longer supported in historical queries (ie. table).
  * JavaScript user-defined functions (UDFs) are now available – learn more [here](js-udf).

**Sources/Sinkse**
  * Empty messages in an Apache Kafka or Redpanda topic are now skipped.
  * We now restrict you from deleting a stream if a source is sending data to it.

**Console UI**
  * In the Query page, for a streaming query, the scanned rows, bytes, and EPS are now shown.
  * In the map chart, you can now change the dot size, either as a fixed value, or set a minimum and maximum range based on a numeric column. You can also adjust the opacity of the dot.

**Docs**
  * Refined our [UDF docs](udf).
  * For functions, we added [sub-pages](functions) for the different categories.
  * For functions that are supported in streaming queries, we now indicate whether they are also supported in historical queries or not. 
  * Refined the search widget in Docs.  
