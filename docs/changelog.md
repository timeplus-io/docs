# Release Notes

## Public Beta 1

We are thrilled to launch the public beta of Timeplus cloud release. 

We will update the beta version from time to time and list key enhancements in this page.



### Biweekly Update 10/31-11/11

* Streaming engine
  * A new `LIMIT <n> BY <column>` syntax is introduced. Combining with [emit_version()](functions#emit_version) function, you can show a limited number of results per emit. e.g.
    ```sql
    SELECT cid,avg(speed_kmh) AS avgspeed, emit_version() 
    FROM tumble(car_live_data,5s) GROUP BY window_start,cid 
    LIMIT 3 BY emit_version()
    ```
  * (Experimental) able to set retention policy for materialized views, to limit the number of rows or total storage for each materialized view. UI will be available soon.
  
* Source, sink, API and SDK
  * Enhanced Ingest REST API to support "Newline Delimited JSON" (ndjson).
  * Refined the [REST API doc](https://docs.timeplus.com/rest), to show APIs in the different versions.
  * New version of datapm CLI with the enhanced Timeplus sink. Set the workspace baseURL to push data to Timeplus, supporting both cloud and on-prem Timeplus.
  
* UI improvements
  * We added a guiding system for new users to quickly get started with Timeplus.
  * Data lineage page is enhanced with visual refresh.
  * (Experimental) when a Streaming SQL is running, the column headers show the value for the recent 10 rows. When the SQL is paused or canceled, the column headers show the infograph for all cached results, with a line for the average value.
  * (Experimental) localized user interface for China market.



### Biweekly Update 10/17-10/28

* Streaming engine
  * We simplified the [session](functions#session) time window: if you want to create sub-streams, you no longer need to set the `keyBy` column as one parameter of the session window. Just use `SELECT .. FROM session(..) PARTITION BY keyBy` . Other time window functions([tumble](functions#tumble) and [hop](functions#hop)) support the `PARTITION BY` in the same way.
  
  * The other enhancement of the [session](functions#session) time window: we introduced an intuitive way to express whether the events for startCondtion or endCondition should be included in the session window. Four combinations supported: `[startCondition, endCondition]`, `(startCondtion, endCondition)`, `[startCondition,endCondition)`,`(startCondition,endCondition]`
  
  * We added the support of `<agg> FILTER(WHERE ..)` as a shortcut to run aggregation for data with certain condition, e.g. 
    ```sql
    select count() filter(where action='add') as cnt_action_add,
           count() filter(where action='cancel') as cnt_action_cancel 
    from table(bookings)
    ```
  
  * Significantly reduced the memory consumption.
  
* Source, sink, API and SDK
  * For Kafka source, if the authentication method is set to "None", the "Disable TLS" is will be turned on automatically.
  * Enhanced the [go-client](https://github.com/timeplus-io/go-client) open-source repo to support low level ingestion API.
  * An experimental [JDBC driver](https://github.com/timeplus-io/java-demo/tree/main/src/main/java/com/timeplus/jdbc) is open-sourced. You can use this driver in some clients(e.g. DataGrip) to run read-only queries(support both streaming and historical queries)
  
* UI improvements
  * Introduced the brand-new "Query Side Panel". You can expand it to explore many features, such as query snippets, SQL functions, bookmarks and history.
  * Bar chart is back. You need to add `GROUP BY` in the query. Choose “Viewing latest data” and select the column for “Group by”.
  * More information is shown in the "Data Lineage" page when you move the mouse over the entities. For example you can see the data schema for the streams, and the query behind the views.
  * Greatly improved the user experience of query tabs and bookmarks. You can easily set meaningful name for each query tab. When the query editor is not empty, click the bookmark icon to save this SQL for future use. Rename or delete the bookmarks in the query side panel.
  * Column names and types are shown for views in the "Stream Catalog"

### Biweekly Update 10/3-10/14

* Streaming engine
  * Enhanced the sub-stream to support stream level `PARTITION BY`, e.g. `SELECT cid,speed_kmh,lag(longitude) as last_long,lag(latitude) as last_lat FROM car_live_data partition by cid` Previously you have to add `partition by cid` for each aggregation function.
* UI improvements
  * Single value visualization is enhanced, allowing you to turn on a sparkline to show the data change.
  * In sources and sinks pages, the throughput for each item is now shown in the list.
  * When you click the ? icon, we will show you the relevant help message for the current page, as well as the version information.
  * For new users, we also show a short description for what's the page about, as a closable information box.
