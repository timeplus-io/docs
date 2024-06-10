# 流式ETL：同步MySQL 数据到 ClickHouse

https://github.com/timeplus-io/proton/tree/develop/examples/cdc 提供了 Docker Compose 堆栈，用于演示如何将数据从 MySQL 镜像到 ClickHouse。 常见的用例是保留MySQL作为交易数据库，同时使用ClickHouse来处理分析工作负载。

## 开始举个例子

克隆 [proton](https://github.com/timeplus-io/proton) 存储库或者直接将 docker-compose.yml 下载到一个文件夹中。 在文件夹中运行 docker compose up。 堆栈中有六个 docker 容器：

1. ghcr.io/timeplus-io/proton: latest，作为流媒体数据库。
2. docker.redpanda.com/redpandadata/redpanda，作为兼容 Kafka 的流媒体消息总线
3. docker.redpanda.com/redpandadata/console，作为在 Kafka/Redpanda 中浏览数据的 Web 用户界面
4. debezium/connect，作为 CDC 引擎，用于从 OLTP 读取更改并将数据发送到 Kafka/Redpanda
5. debezium/example-mysql，一个预先配置的 MySQL，作为管道源
6. clickhouse/clickhouse-server，实时 OLAP 作为管道目的地

## 在 ClickHouse 中准备桌子

在 clickhouse 容器中打开 “clickhouse 客户端”。 运行以下 SQL 来创建常规的 MergeTree 表。

```sql
```

## 创建 CDC 作业

由于 Debezium Connect 会泄露端口 8083，因此请在主机服务器中执行以下命令。

```shell
```

## 运行 SQL

你可以使用 docker exec-it \<name> proton-client-h 127.0.0.1-m-n 在 Proton 容器中运行 SQL 客户端。 或者使用 Docker 桌面用户界面选择容器，选择 “执行” 选项卡并键入 proton-client-h 127.0.0.1-m-n 来启动 SQL 客户端。

复制 “mysql-to-clickhouse.sql” 的内容并粘贴到 Proton Client 中并一起运行。 会发生什么：

1. 将创建一个 [Timeplus 外部流]（外部流）来读取 Kafka/Redpanda 主题中的 MySQL CDC 数据。
2. 将创建一个 [外部表]（proton-clickhouse-external-table），用于将数据从Timeplus写入ClickHouse。
3. 将创建一个 [物化视图]（视图 #m_view），用于持续从 Kafka 读取数据并写入 ClickHouse。

mysql-to-clickhouse.sql 的内容是：

```sql
```

## 验证数据已复制到 ClickHouse

返回 ClickHouse 客户端，运行 'select \* from customers' 来查看 MySQL 中的 4 行。

使用 MySQL 客户端（例如 DBeaver）添加一些记录，以查看 “从客户中选择\*” 中的更新。 你也可以运行 “从表（客户）中选择\*” 以避免等待新的更新。

:::info

因为我们在 ClickHouse 中创建了一个基于 MergeTree 的常规表格。 它不支持更新或删除。 如果你需要更改 MySQL 中的数据，你可以使用替换 MergeTree 引擎来创建表。 在这种情况下，Timeplus 需要使用 \`op='u'来处理CDC数据。

:::
