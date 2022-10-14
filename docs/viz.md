# Data Visualization

Timeplus provides out-of-box streaming charts and dashboards to visualize the real-time data and understand the pattern/trend. You can also integrate Timeplus with your external BI systems, such as redash, metabase, Grafana, etc.



## Chart

After you run a query, you can switch to the **VISUALIZATION** tab to turn the results as a chart. The system will ask you whether you want to show the trend, or the latest data, or the detailed data. Timeplus will pickup the proper chart types for your use case.

* **Monitor trend**: a line chart is created. You need to set a column contains the numeric value. Three options for the time column: event time, index time, or arrive time. Optionally you can set a column as the category. Up to 5 unique values in this category column to show up to 5 lines in the chart.
* **View latest data**: a single value chart is created. You need to set a column contains the numeric value, and the previous value will be shown too.
* **List results**: a table view for the results.

Charts can be added to the dashboard by click the **Add to dashboard** button on the right.

## Dashboard

One or more dashboards can be created in each workspace to tell stories about the data.

You can set the name and description(optional) for each dashboard.

One or more panels can be added to the dashboard, with 3 options for the size:

* Small: take 1/4 of the page width
* Medium: take 1/2 of the page width
* Large: take entire page width



## Integration with External BI

You can call Timeplus SDK to load the data and render the chart with 3rd party charting libraries.  We also buit experimental plugins to work with redash, metabase, Grafana, etc.

:::info

The Timeplus datasource plugin for Grafana is in the early stage. Please contact us to arrange the integration. 

:::

