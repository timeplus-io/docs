# 数据可视化

Timeplus 能够提供盒外流图表和仪表板以可视化实时数据和了解模式/趋势。 您还可以将 Timeplus 与外部 BI 系统集成（如 Redash、Metabase、Grafana 等）。

## 图表

在您运行查询后，您可以切换到 **Visualization** 标签，将结果转换为图表。 我们为您的需要提供不同的图表类型：

### 折线图

折线图最适合处理时间序列数据。

* 数据设置：
  * X 轴：事件时间 (_tp_time)、到达时间（浏览器获取数据点时）或自定义列。
  * Y 轴：数字数据类型（int/float/etc）中的自定义列
  * 颜色：默认情况下， `无` 处于选中状态。 您可以选择一个分类列，然后用不同的颜色为该列值的每个唯一值画一条线。

* 格式设置
  * X 轴标题和数据范围（最近 1 分钟、最近 1 小时、所有时间等）。 默认情况下，选择 “最后1分钟”。 如果您正在运行历史查询，请将其更改为“所有时间”。
  * Y 轴标题、最小值/最大值、线条颜色、样式
  * 显示/隐藏折线图最后一个值的数据标签、十进制数以及是否以单位显示前缀/后缀。
  * 显示/隐藏网格线
  * 显示/隐藏图例
  * 显示/隐藏数据点

![折线图](/img/line-chart-single.png)

### 面积图

显示堆叠面积图，其格式设置与 **折线图** 相同。

![面积图](/img/area-chart.png)

### 柱状图

* 数据设置：
  * X 轴：分类列
  * Y 轴：数值列
  * 颜色：是在堆栈模式还是减淡模式下显示分组数据。
  * 更新模式：仅追加，或显示上次时间戳的数据点，或者选择一个键列作为显示每个键值的最新数据值。

* 格式设置
  * X 轴标题、Y 轴标题、列颜色、显示/隐藏数据标签（使用十进制和前缀/后缀单位）、显示/隐藏网格线、显示/隐藏图例

![柱状图](/img/column-chart.png)

### 条形图

与柱状图类似，数据点显示为水平条而不是垂直列。 最适合显示前 n 个值。

![条形图](/img/bar-chart.png)

### 单值图

* 数据设置：
  * 选择一个数字列来显示其值

* 格式设置
  * 小数位数
  * 字体大小
  * 作为后缀或前缀的单位
  * 显示/隐藏迷你图
  * 显示/隐藏最后一个值与当前值的差值

![单值图](/img/single-value-chart.png)

### 地图

目前可在 https://us.timeplus.cloud 上作为预览功能提供。

* 数据设置：
  * 设置经度和纬度列。
  * 颜色：在堆栈模式或减淡模式下显示分组数据。
  * 更新模式：仅追加，或显示上次时间戳的数据点，或者选择一个键列作为显示每个键值的最新数据值。

* 格式设置
  * 地图上的点：配色方案、不透明度和大小（固定大小，或设置最小和最大尺寸）

![地图](/img/map-chart.png)



### OHLC 图表

这是一种新的图表类型，目前处于技术预览阶段。 This is a new chart type, currently in technical preview. The open-high-low-close (OHLC) chart is common in the finance industry, to visualize the movement of prices over time. Please contact us if you'd like to try this preview feature. 如果您想尝试此预览功能，请联系我们。

请确保有 5 个列的名称：时间、开盘价、收盘价、最高价、最低价，例如

```sql
选择 window_start，最早（价格）为开盘价，最新（价格）为收盘价， 
       最高（价格）为最高，最低（价格）为低 
FROM TUMBLE（价格，1 秒）GROUP BY window_start
```



### 表格

将数据显示为列表表。

* 数据设置
  * 最大行数
  * 更新模式:
    * 全部显示：显示所有查询结果（受最大行数限制）
    * 按时间：显示上次时间戳中的数据点
    * 按键：选择一个键列以显示每个键值的最新行。

* 格式设置
  * 对于每列，您可以选择显示或隐藏它，或者为数值列设置列宽和十进制。
  * 条件格式：如果值满足您设置的特定条件，则突出显示单元格或整行

![表格图](/img/table-chart.png)

可以点击右边的 **添加到仪表板** 按钮将图表添加到仪表板中。

## 仪表板

每个工作区都可以创建一个或多个仪表板来讲述有关数据的故事。

您可以为每个仪表板设置名称和可选描述。

一个或多个图表可以添加到仪表板，有3个大小选项:

* 小：占用1/4的页面宽度
* 中: 占用页面宽度的1/2
* 大：占用整个页面宽度


## 仪表板筛选器和查询变量 {#filter}

作为一项新功能，您可以在仪表板中添加筛选器。 如果你想列出超速行驶的车辆，这里是一个例子。

首先，在查询页面中，使用固定条件运行 SQL，例如

```sql
select * from car_live_data where speed > 80
```

运行查询并确保它满足您的需求。

然后，您可以使用查询变量更改固定条件，例如

```sql
select * from car_live_data where speed > {{speed_limit}}
```

查询编辑器将显示 `speed_limit` 的文本输入。 您可以输入一个值并运行参数化查询，然后将其转换为可视化并添加到新的仪表板或现有仪表板中。

:::info

请确保查询变量的 SQL 语法正确。 例如，如果您使用字符串值进行过滤，则应在变量占位符周围添加引号，例如

```sql
select * from car_live_data where cid='{{car_id}}'
```

:::

在仪表板中，你需要添加一个过滤器，要么是文本输入，要么是下拉列表。 将变量 ID 定义为 `speed_limit`，设置标签和默认值。 对于下拉列表，你可以选择从 SQL 加载选项（你应该运行有界查询以获得不同的值，例如 `select distinct cid from table(dim_car_info)`）

保存仪表板后，在仪表板视图模式下，可以更改筛选器的值。 那些带有 SQL 引用相同变量的面板将重新运行。



## 与外部BI集成

你可以调用 Timeplus SDK 来加载数据并使用第三方图表库呈现图表。

对于Proton用户，你也可以试试 https://github.com/timeplus-io/proton-grafana-source 它已提交给Grafana Inc，正在等待批准在其市场上市。

<iframe width="560" height="315" src="https://www.youtube.com/embed/cBRl1k9qWZc?si=TzVpULg-B0b0T5GE" title="优酷视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

