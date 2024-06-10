# 单节点安装

无论有没有Docker，Timeplus 企业版都可以轻松地安装在单个节点上。

## 裸机安装{#bare_metal}

If your server or computer is running Linux or MacOS, you can run the following command to download the package and start Timeplus Enterprise without any other dependencies. For Windows users, please follow [our guide](#docker) for running Timeplus Enterprise with Docker.

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

此脚本会将最新的软件包（基于您的操作系统和 CPU 架构）下载到当前文件夹。 解压缩包并启动 Timeplus 企业服务器。

You can also download packages manually with the following links:

- Linux（[英特尔/AMD 芯片](https://install.timeplus.com/latest-linux-amd64.tar.gz)、[ARM 芯片](https://install.timeplus.com/latest-linux-arm64.tar.gz)）
- MacOS ([Intel chip](https://install.timeplus.com/latest-darwin-amd64.tar.gz), [Apple Silicon chip](https://install.timeplus.com/latest-darwin-arm64.tar.gz))
- Windows (Please [install via Docker](#docker))

After you download the package, put it in a desired folder, uncompress the file, and you can run Timeplus Enterprise with preconfigured settings:

```shell
tar xfv file.tar.gz
```

然后将目录更改为 `bin`文件夹并运行

```shell
。/timeplus 开始
```

这将通过几个关键流程启动Timeplus Enterprise：

- `timeplusd`: The core SQL engine, servering at port 8463 (TCP, for `timeplus client`) and 3218 (HTTP, for JDBC/ODBC drivers
- `timeplus_appserver`: The application server, servering at HTTP port 8000
- `timeplus_web`: The web UI, managed by `timeplus_appserver`
- `timeplus_connnector`: The service to provide extra sources and sinks, managed by `timeplus_appserver`

Access the Timeplus Enterprise web console via http://localhost:8000. On your first login, please create an account with a password to start the 30-day free trial.

也可以通过运行 `timeplus start-s service_name` 来启动/停止单个进程。 For example, when you only want to startup Timeplus Core (SQL Engine), run `timeplus start -s timeplusd`.

For more information, please run  `timeplus start -h` for details.

## 安装 Docker{#docker}

Alternatively, run the following command to start Timeplus Enterprise with [Docker](https://www.docker.com/get-started/):

```shell
docker run-p 8000:8000 timeplus/timeplus-企业版
```

一些可选参数：

- 添加 `--name timeplus` 来设置容器的名称
- Add `-d` to run the container in the background
- Add `-p 8463:8463 -p 3218:3218` if you want to run SQL with `timeplus client` or JDBC/ODBC drivers
- Add `-v "$(pwd)"/data:/timeplus/data -v "$(pwd)"/logs:/timeplus/logs` if you want to mount the data and log files to your host

## Docker Compose 快速入门 {#compose}

To try our demo kit, you can use Docker Compose to start Timeplus Enterprise, together with Redpanda (A Kafka API compatiable message bus), ClickHouse and data generator.

对于 Linux 或 Mac 用户，请运行以下命令：

```bash
curl https://install.timeplus.com/sp-demo | sh
```

For Windows users, you can download the package with Docker Compose file and bootstrap scripts [here](https://timeplus.io/dist/timeplus_enterprise/sp-demo-20240522.zip).

Access the Timeplus demo kit web console at https://localhost:8000.

该堆栈演示了如何运行流式 ETL、从 Kafka API 获取数据、应用过滤器或聚合，然后发送到另一个 Kafka 主题或 ClickHouse 表。 For more details, please see:

- [Tutorial – Streaming ETL: Kafka to Kafka](tutorial-sql-etl)
- [Tutorial – Streaming ETL: Kafka to ClickHouse](tutorial-sql-etl-kafka-to-ch)

## 许可证管理{#license}

当你启动Timeplus Enterprise并首次访问网络控制台时，30天的免费试用开始。 当它结束时，软件将停止运行。

请查看 [指南](server_config #license) 更新许可证。
