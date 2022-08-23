# Release Notes

## Private Beta 2

We are thrilled to launch the second private beta of Timeplus cloud release. Comparing to the [Private Beta 1](private-beta-1), most of the backend and frontend changes are incremental enhancements, except the entry point is changed from [https://{tenant}.beta.timeplus.com](https://tenant.beta.timeplus.com) to [https://beta.timeplus.cloud/{tenant}](https://beta.timeplus.cloud/tenant)

We will update the beta version from time to time and list key enhancements in this page.

###  Week of 8/15

First product update in the Private Beta 2.

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
