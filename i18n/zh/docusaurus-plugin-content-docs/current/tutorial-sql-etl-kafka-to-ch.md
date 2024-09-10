# 流式ETL：Kafka 到 ClickHouse

该视频演示了如何读取来自Redpanda的实时数据、应用流处理以及如何将结果发送到ClickHouse。 [相关博客](https://www.timeplus.com/post/proton-clickhouse-integration)。

## 演示视频

<iframe width="560" height="315" src="https://www.youtube.com/embed/ga_DmCujEpw?si=ja2tmlcCbqa6HhwT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 子查询

https://github.com/timeplus-io/proton/tree/develop/examples/clickhouse 提供了 Docker Compose 堆栈以及示例 SQL 语句。 当你启动堆栈时，最新版本的Proton和ClickHouse以及Redpanda和数据生成器将自动启动。

### 示例：带有屏蔽数据的 ETL

First, create a table with ClickHouse MergeTree table engine by running `clickhouse client` in the ClickHouse container.

```sql
```

这将成为 ClickHouse 的 Proton 外部表的目的地。 Later on, you can also read the data in Timeplus.

在演示面板撰写堆栈中，启动了Redpanda容器，以及数据生成器和Redpanda控制台，供您轻松浏览实时数据。 例如，前往 [http://localhost:8080](http://localhost:8080/)，你将在**owlshop-frontend-events**主题中看到实时数据。

![数据](https://static.wixstatic.com/media/3796d3_2bb403497c0b48fab5710bec35793ae0~mv2.png/v1/fill/w_1480,h_642,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/3796d3_2bb403497c0b48fab5710bec35793ae0~mv2.png)

本教程的目标是阅读这些访问日志，将敏感的IP地址转换为md5，然后将其提取到ClickHouse进行更多业务分析。

To read data from Kafka or Redpanda, you just need to create an [Kafka External Stream](proton-kafka) with the following DDL SQL:

```sql
```

Then run the following DDL SQL to setup the connection between Timeplus and ClickHouse. 对于没有安全设置的本地 Clickhouse，可以这么简单：

```sql
CREATE EXTERNAL TABLE ch_local
SETTINGS type='clickhouse',
         address='clickhouse:9000',
         table='events';
```

然后创建一个物化视图来从 Redpanda 读取数据，提取值并将 IP 转换为屏蔽的 md5，然后将数据发送到外部表。 这样，转换后的数据将持续写入ClickHouse。

```sql
```

创建物化视图后，它将用作 Proton 中的后台 ETL 作业，持续从 Kafka/Redpanda 读取数据，应用转换或聚合，然后将结果发送到 ClickHouse。 要了解有关 Proton 中物化视图的更多信息，请参阅 [此文档]（查看 #m_view）。

现在，如果你回到ClickHouse并运行 “从事件中选择\*”，你会看到新的数据以亚秒级的延迟出现。

![clickhouse 用户界面](https://static.wixstatic.com/media/3796d3_804a80321d1a4219836203b83c19ae35~mv2.png/v1/fill/w_1480,h_996,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/3796d3_804a80321d1a4219836203b83c19ae35~mv2.png)

您可以在 Proton 中使用流式处理 SQL 来完成更多操作，例如后期事件处理、复杂事件处理，或者利用数千个 ClickHouse 函数自定义转换/丰富逻辑。 Proton 的许多功能都由 ClickHouse 提供支持。 因此，如果你已经是ClickHouse的用户，你可以用类似的方式使用Proton。

如上所述，Proton中的外部表可用于从ClickHouse读取数据，甚至可以在流JOIN中应用数据查询。 只需运行 `SELECT.. 来自 Proton 中的 external_table_name`。 它将从ClickHouse读取所选列的数据，然后在Proton中应用转换或加入。

### 示例：tumble + join

一个典型的用例是，如果您在ClickHouse中有静态或缓慢变化的维度（SCD），则无需在Proton中复制它们。 只需在 Proton 中创建一个外部表，您就可以通过使用这样的外部表加入流来丰富您的实时数据，然后将高质量的数据发送到 ClickHouse。

例如：

```sql
-- read the dimension table in ClickHouse without copying data to Proton
CREATE EXTERNAL TABLE dim_path_to_title
SETTINGS type='clickhouse',address='clickhouse:9000';

-- read Kafka data with subsecond latency
CREATE EXTERNAL STREAM clickstream(
  ts datetime64,
  product_id int,
  ip string
)
SETTINGS type='kafka',brokers='redpanda:9092',topic='clickstream';

-- continuously write to ClickHouse
CREATE EXTERNAL TABLE target_table
SETTINGS type='clickhouse',address='clickhouse:9000',table='pageviews';

-- downsample the click events per 5 seconds and enrich URL paths with page titles
CREATE MATERIALIZED VIEW mv INTO target_table AS
  WITH pv AS(
        SELECT window_start, path, count() AS views
        FROM tumble(clickstream,ts,5s) GROUP BY window_start,path)
  SELECT window_start AS ts,path,title,views
  FROM pv JOIN dim_path_to_title USING(path);
```
