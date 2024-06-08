# 流式ETL：Kafka 到 ClickHouse

该视频演示了如何读取来自Redpanda的实时数据、应用流处理以及如何将结果发送到ClickHouse。 [相关博客] (https://www.timeplus.com/post/proton-clickhouse-integration)。

## 演示视频

<iframe width="560" height="315" src="https://www.youtube.com/embed/ga_DmCujEpw?si=ja2tmlcCbqa6HhwT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 子查询

https://github.com/timeplus-io/proton/tree/develop/examples/clickhouse 提供了 Docker Compose 堆栈以及示例 SQL 语句。 当你启动堆栈时，最新版本的质子和ClickHouse以及Redpanda和数据生成器将自动启动。

### 示例：带有屏蔽数据的 ETL

首先，在 ClickHouse 中使用常规 MergeTree 表格引擎创建一个表格。

```sql
```

这将成为 ClickHouse 的 Proton 外部表的目的地。 稍后，你还可以读取 Proton 中的数据。

在演示面板撰写堆栈中，启动了Redpanda容器，以及数据生成器和Redpanda控制台，供您轻松浏览实时数据。 例如，前往 [http://localhost:8080](http://localhost:8080/)，你将在**owlshop-frontend-events**主题中看到实时数据。

![数据] (https://static.wixstatic.com/media/3796d3_2bb403497c0b48fab5710bec35793ae0~mv2.png/v1/fill/w_1480,h_642,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/3796d3_2bb403497c0b48fab5710bec35793ae0~mv2.png)

本教程的目标是阅读这些访问日志，将敏感的IP地址转换为md5，然后将其提取到ClickHouse进行更多业务分析。

要从 Kafka 或 Redpanda 读取数据，你只需要使用以下 DDL SQL 创建 [外部流]（质子-kafka）：

```sql
```

然后运行以下 DDL SQL 来设置 Proton 和 ClickHouse 之间的连接。 对于没有安全设置的本地 Clickhouse，可以这么简单：

```sql
```

然后创建一个物化视图来从 Redpanda 读取数据，提取值并将 IP 转换为屏蔽的 md5，然后将数据发送到外部表。 这样，转换后的数据将持续写入ClickHouse。

```sql
```

创建物化视图后，它将用作 Proton 中的后台 ETL 作业，持续从 Kafka/Redpanda 读取数据，应用转换或聚合，然后将结果发送到 ClickHouse。 要了解有关 Proton 中物化视图的更多信息，请参阅 [此文档]（查看 #m_view）。

现在，如果你回到ClickHouse并运行 “从事件中选择\*”，你会看到新的数据以亚秒级的延迟出现。

![clickhouse 用户界面] (https://static.wixstatic.com/media/3796d3_804a80321d1a4219836203b83c19ae35~mv2.png/v1/fill/w_1480,h_996,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/3796d3_804a80321d1a4219836203b83c19ae35~mv2.png)

您可以在 Proton 中使用流式处理 SQL 来完成更多操作，例如后期事件处理、复杂事件处理，或者利用数千个 ClickHouse 函数自定义转换/丰富逻辑。 Proton 的许多功能都由 ClickHouse 提供支持。 因此，如果你已经是ClickHouse的用户，你可以用类似的方式使用Proton。

如上所述，质子中的外部表可用于从ClickHouse读取数据，甚至可以在流媒体JOIN中应用数据查询。 只需运行 `SELECT.. 来自 Proton 中的 external_table_name`。 它将从ClickHouse读取所选列的数据，然后在质子中应用转换或加入。

### 示例：tumble + join

一个典型的用例是，如果您在ClickHouse中有静态或缓慢变化的维度（SCD），则无需在Proton中复制它们。 只需在 Proton 中创建一个外部表，您就可以通过使用这样的外部表加入直播来丰富您的实时数据，然后将高质量的数据发送到 ClickHouse。

例如：

```sql
```
