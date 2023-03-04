# 数据可视化

Timeplus能够提供盒外流图表和仪表板以可视化实时数据和了解模式/趋势。 您也可以将Timeplus成您的外部BI系统，例如redash、metase、Grafana等。



## 图表

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


可以点击右边的 **添加到仪表板** 按钮将图表添加到仪表板中。

## 仪表板

每个工作区都可以创建一个或多个仪表板来讲述有关数据的故事。

您可以为每个仪表盘设置名称和描述(可选)。

一个或多个面板可以添加到控制面板，大小为3个选项：

* 小：占用1/4的页面宽度
* 中: 占用页面宽度的1/2
* 大：占用整个页面宽度



## Dashboard filters and query variables {#filter}

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

:::info

Please make sure the SQL syntax is correct with query variables. For example if you are filtering with a string value, you should add quote around the variable placeholder, e.g.

```sql
select * from car_live_data where cid='{{car_id}}'
```

:::

In the dashboard, you need to add a filter, either as a text input or a drop down. Define the variable id as `speed_limit`, set a label and default value. For drop down list, you can choose to load the options from a SQL (you should run a bounded queries to get distinct value, such as `select distinct cid from table(dim_car_info)`)

After you save the dashboard, in the dashboard view mode, you can change the value of the filter. Those panels with SQL referring to the same variables will be re-ran.



## 与外部BI集成

您可以调用 TimePlus SDK 来加载数据并通过第三方制图库渲染图表。  We also built experimental plugins to work with redash, metabase, Grafana, etc.

:::info

Grafana 的 Timeplus 数据源插件正处于初级阶段。 请联系我们来安排整合。

:::

