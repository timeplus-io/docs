# Data Visualization

Timeplus provides out-of-box streaming charts and dashboards to visualize the real-time data and understand the pattern/trend. You can also integrate Timeplus with your external BI systems, such as redash, metabase, Grafana, etc.



## Chart

After you run a query, you can switch to the **Visualization** tab to turn the results as a chart. You can pick up the proper chart types for your use case.

### Line chart

The chart type that works best with time series data.a line chart is created. 

* Data settings:
  * X-axis: Event Time (_tp_time), or Arrival Time(when the browser gets the data point), or a custom column.
  * Y-axis: a custom column in numeric data types (int/float/etc)
  * Color: by default `None` is selected. You can choose a categorical column and draw a line for each unique value of the column value in different color.

* Format settings:
  * X-axis title and the data range(last 1 minute, last 1 hour, all time, etc)
  * Y-axis title, min/max value, number of decimal, or prefix/suffix
  * Whether to show grid lines
  * Whether to show legend
  * Whether to show data label


### Area chart

Always show a stacked area chart. Same settings as **Line Chart**.



### Column chart

* Data settings:
  * X-axis: a categorical column
  * Y-axis: a numeric column
  * Color: whether to show grouped data in either stack mode or dodge mode.
  * Update mode: append only, or show data points from the last timestamp, or choose a key column as show latest data value for each key value.

* Format settings:
  * X-axis title, Y-axis title, prefix/suffix, whether to show grid lines, show legend, or show data label


### Bar chart

Similar to Column chart, the only difference is data points are shown as horizontal bars instead of vertical columns. Best fit for show top-N values.

### Single value chart

* Data settings:
  * choose a numeric column to show its value

* Format settings:
  * Suffix or prefix
  * Number of decimal
  * Font size
  * Whether to show sparkline
  * Whether to show delta for last value vs. the current value


### Table

Show the data as a list table.

* Data settings
  * Update mode: append only, or show data points from the last timestamp, or choose a key column as show latest row for each key value.
  * Maximum row count.

* Format settings
  * For each column, you can choose to set column width and decimal for numeric columns.


Charts can be added to the dashboard by click the **Add to dashboard** button on the right.

## Dashboard

One or more dashboards can be created in each workspace to tell stories about the data.

You can set the name and description(optional) for each dashboard.

One or more panels can be added to the dashboard, with 3 options for the size:

* Small: take 1/4 of the page width
* Medium: take 1/2 of the page width
* Large: take entire page width



## Dashboard filters and query variables

As a new feature, you can add filters in dashboards. Here is an example if you want to list speeding vehicles. 

First, in the query page, to run a SQL with a fixed condition, e.g.

```sql
select * from car_live_data where speed > 80
```

Run the query and make sure it meets your need.

Then you can change the fixed condition with a query variable, e.g.

```sql
select * from car_live_data where speed > {{speed_limit}}
```

The query editor will show a text input for the value of `speed_limit`. You can put a value and run the parameterized query and turn it to a visualization and add to a new dashboard or an existing dashboard.

In the dashboard, you need to add a filter, either as a text input or a drop down. Define the variable id as `speed_limit`, set a label and default value. For drop down list, you can choose to load the options from a SQL (you should run a bounded queries to get distinct value, such as `select distinct cid from table(dim_car_info)`)

After you save the dashboard, in the dashboard view mode, you can change the value of the filter. Those panels with SQL referring to the same variables will be re-ran.



## Integration with External BI

You can call Timeplus SDK to load the data and render the chart with 3rd party charting libraries.  We also built experimental plugins to work with redash, metabase, Grafana, etc.

:::info

The Timeplus datasource plugin for Grafana is in the early stage. Please contact us to arrange the integration. 

:::

