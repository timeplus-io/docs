# Release Notes

## Public Beta 1

We are thrilled to launch the public beta of Timeplus cloud release. 

We will update the beta version from time to time and list key enhancements in this page.

### Biweekly Update 10/3-10/14

* Streaming engine
  * Enhanced the sub-stream to support stream level `PARTITION BY`, e.g. `SELECT cid,speed_kmh,lag(longitude) as last_long,lag(latitude) as last_lat FROM car_live_data partition by cid` Previously you have to add `partition by cid` for each aggregation function.
* UI improvements
  * Single value visualization is enhanced, allowing you to turn on a sparkline to show the data change.
  * In sources and sinks pages, the throughput for each item is now shown in the list.
  * When you click the ? icon, we will show you the relevant help message for the current page, as well as the version information.
  * For new users, we also show a short description for what's the page about, as a closable information box.
