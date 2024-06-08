# 使用 Timeplus Proton 快速入门

按照简要指南进行操作，这些指南可帮助您使用Timeplus Proton的常见功能。

## 如何安装 Timeplus Proton {#install}

Proton 可以通过以下方式作为单个二进制文件安装在 Linux 或 Mac 上：

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

对于 Mac 用户，你还可以使用 [Homebrew] (https://brew.sh/) 来管理安装/升级/卸载：

```shell
brew tap tap timeplus-io/timeplus
brew inst
```

你也可以在 Docker、Docker Compose 或 Kubernetes 中安装 Proton。

```bash
docker run-d--pull always--name proton ghcr.io/timeplus-io/proton: latest
```

[Docker Compose 堆栈] (https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) 演示了如何使用外部流在 Kafka/Redpanda 中读取/写入数据。

你也可以在完全托管的 [Timeplus Cloud] (https://us.timeplus.cloud/) 中试用 Proton。

## 如何读/写 Kafka 或 Redpanda {#kafka}

您可以使用 [外部流]（质子-kafka）从 Kafka 主题中读取数据或向主题写入数据。 我们验证了与 Apache Kafka、Confluent Cloud、Confluent Platform、Redpanda、WarpStream、Upstash 等的集成。

```sql
```

<iframe width="560" height="315" src="https://www.youtube.com/embed/w_Tr62oKE4E?si=xkrLA60-SZUrrmWL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 如何从 PostgreSQL/MySQL/ClickHouse 加载数据 {#cdc}

对于 PostgreSQL、MySQL 或其他 OLTP 数据库，您可以应用 CDC（变更数据捕获）技术，通过 Debezium 和 Kafka/Redpanda 将实时更改加载到 Proton 中。 [质子仓库的 cdc 文件夹] (https://github.com/timeplus-io/proton/tree/develop/examples/cdc) 中的示例配置。 [这篇博客] (https://www.timeplus.com/post/cdc-in-action-with-debezium-and-timeplus) 展示了 Timeplus Cloud 用户界面，但也可以应用于 Proton。

<iframe width="560" height="315" src="https://www.youtube.com/embed/j6FpXg5cfsA?si=Mo5UrviidxqkkXSb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

如果你在本地的ClickHouse或ClickHouse云中有数据，你也可以使用 [外部表](proton-clickhouse-external-table) 来读取数据。

## 如何读/写 ClickHouse {#clickhouse}

你可以使用 [外部表]（proton-clickhouse-external-table）从 ClickHouse 表格中读取数据或向 ClickHouse 表格写入数据。 我们验证了与自托管的ClickHouse、ClickHouse Cloud、适用于ClickHouse的Aiven等的集成。

<iframe width="560" height="315" src="https://www.youtube.com/embed/ga_DmCujEpw?si=ja2tmlcCbqa6HhwT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 如何处理 UPSERT 或 DELETE {#upsert}

默认情况下，Timeplus 中的直播仅限追加。 但是你可以使用 “versioned_kv” 或 “changelog_kv” 模式创建直播来支持数据变更或删除。 [版本化流]（版本流）支持 UPSERT（更新或插入），[变更日志流]（变更日志流）支持 UPSERT 和 DELETE。

你可以使用像 Debezium 这样的工具向 Timeplus 发送 CDC 消息，也可以直接使用 `INSERT` SQL来添加数据。 具有相同主键的值将被覆盖。 欲了解更多详情，请观看此视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/6iplMdHJUMw?si=LGiBkw6QUjq0RGTL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 如何使用 JSON {#json}

Proton 支持强大且易于使用的 JSON 处理。 你可以将整个 JSON 文档保存为 “字符串” 类型的 “原始” 列。 然后使用 JSON 路径作为快捷方式以字符串形式访问这些值。 例如 “raw: a.b.c”。 如果你的数据是整数/浮点数/布尔值或其他类型，你也可以使用 `::` 来转换它们。 例如 `raw: a.b.c:: int`。 如果你想读取 Kafka 主题中的 JSON 文档，你可以选择将每个 JSON 作为 “原始” 字符串读取，也可以将每个顶级键/值对作为列读取。 请查看 [doc](proton-kafka#multi_col_read) 了解详情。

<iframe width="560" height="315" src="https://www.youtube.com/embed/dTKr1-B5clg?si=eaeQ21SjY8JpUXID" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 如何加载 CSV 文件 {#csv}

如果你只需要加载一个 CSV 文件，你可以创建一个直播然后使用 `INSERT INTO.. 选择... FROM 文件 (..) `语法。 例如，如果 CSV 文件中有 3 个字段：时间戳、价格、交易量，则可以通过以下方式创建直播

```sql
```

请注意，直播中将有第 4 列，即\ _tp_time 作为 [事件时间]（事件时间）。

要导入 CSV 内容，请使用 [文件] (https://clickhouse.com/docs/en/sql-reference/table-functions/file) 表函数来设置文件路径、标题和数据类型。

```sql
```

:::info

请注意：

1. 你需要指定列名。 否则，SELECT \*将获得 3 列，而数据流中有 4 列。
2. 出于安全原因，Proton 只读取 `proton-data/user_files`文件夹下的文件。 如果你在 Linux 服务器上通过 `proton install`命令安装质子，则该文件夹将是 `/var/lib/proton/user_files`。 如果你不安装质子并直接通过 “质子服务器启动” 运行质子二进制文件，则该文件夹将是 “proton-data/user_files”
3. 我们建议使用 `max_insert_threads=8` 来使用多线程来最大限度地提高摄取性能。 如果你的文件系统的 IOPS 很高，你可以使用 SETTINGS shards=3 创建数据流，并在 `INSERT`语句中设置更高的 `max_insert_threads` 值。

:::

如果您需要将多个 CSV 文件导入到单个数据流，则可以执行类似的操作。 你甚至可以再添加一列来跟踪文件路径。

```sql
```

## 如何使用 Grafana 或 Metabase 可视化 Proton 查询结果 {#bi}

Proton 的官方 Grafana 插件可在 [此处] (https://grafana.com/grafana/plugins/timeplus-proton-datasource/) 获得。 源代码位于 https://github.com/timeplus-io/proton-grafana-source。 你可以使用该插件运行 SQL 流，并在 Grafana 中构建实时图表，而无需刷新仪表板。 查看 [此处] (https://github.com/timeplus-io/proton/tree/develop/examples/grafana) 获取示例设置。

<iframe width="560" height="315" src="https://www.youtube.com/embed/cBRl1k9qWZc?si=U30K93FUVMyjUA--" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

我们还为 Metabase 提供了一个插件：https://github.com/timeplus-io/metabase-proton-driver 它基于 Proton JDBC 驱动程序。

## 如何以编程方式访问 Timeplus Proton {#sdk}

SQL 是使用 Proton 的主要接口。 [采集 REST API](proton-ingest-api) 允许您使用任何语言将实时数据推送到 Proton。

以下驱动程序可用：

- https://github.com/timeplus-io/proton-java-driver JDBC 和其他 Java 客户端
- https://github.com/timeplus-io/proton-go-driver 适用于 Golang
- https://github.com/timeplus-io/proton-python-driver 适用于 Python
