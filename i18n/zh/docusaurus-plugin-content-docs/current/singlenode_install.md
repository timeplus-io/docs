# 单节点安装

无论有没有Docker，Timeplus 企业版都可以轻松地安装在单个节点上。

## 裸机安装{#bare_metal}

如果你的服务器或电脑运行的是 Linux 或 macOS，你可以运行以下命令来下载软件包并在没有任何其他依赖关系的情况下启动 Timeplus Enterprise。 对于 Windows 用户，请按照 [指南](#docker) 使用 Docker 运行 Timeplus Enterprise。

```shell
curl -sSf https://raw.githubusercontent.com/timeplus-io/proton/develop/install.sh | sh
```

此脚本会将最新的软件包（基于您的操作系统和 CPU 架构）下载到当前文件夹。 解压缩包并启动 Timeplus 企业服务器。

您也可以通过以下链接手动下载软件包：

- Linux（[英特尔/AMD 芯片](https://install.timeplus.com/latest-linux-amd64.tar.gz)、[ARM 芯片](https://install.timeplus.com/latest-linux-arm64.tar.gz)）
- MacOS（[英特尔芯片](https://install.timeplus.com/latest-darwin-amd64.tar.gz)，[苹果芯片](https://install.timeplus.com/latest-darwin-arm64.tar.gz))
- Windows（请 [通过 Docker 安装](#docker)）

下载软件包后，将其放入所需的文件夹，解压缩文件，即可使用预先配置的设置运行 Timeplus Enterprise：

```shell
tar xfv file.tar.gz
```

然后将目录更改为 `bin`文件夹并运行

```shell
./timeplus start
```

这将通过几个关键流程启动Timeplus Enterprise：

- `timeplusd`：核心 SQL 引擎，在端口 8463（TCP，用于 “timeplus 客户端”）和 3218（HTTP，用于 JDBC/ODBC 驱动程序）提供服务
- `timeplus_appserver`：应用程序服务器，在 HTTP 端口 8000 上提供服务
- `timeplus_web`：网页用户界面，由 `timeplus_appserver` 管理
- `timeplus_connector`：提供额外源和接收器的服务，由 `timeplus_appserver` 管理

通过 http://localhost:8000 访问 Timeplus Enterprise 网络控制台。 首次登录时，请使用密码创建一个帐户以开始 30 天免费试用。

也可以通过运行 `timeplus start-s service_name` 来启动/停止单个进程。 例如，当你只想启动 Timeplus Core (SQL Engine) 时，运行 `timeplus start-s timeplusd`。

欲了解更多信息，请运行 `timeplus start-h` 了解详情。

## 通过Docker安装{#docker}

你也可以使用 [Docker](https://www.docker.com/get-started/) 运行以下命令启动 Timeplus Enterprise：

```shell
docker run -p 8000:8000 timeplus/timeplus-enterprise
```

一些可选参数：

- 添加 `--name timeplus` 来设置容器的名称
- 添加 `-d` 在后台运行容器
- 如果你想使用 `timeplus client` 或 JDBC/ODBC 驱动程序运行 SQL，请添加 \`-p 8463:8463-p 3218:3218
- 如果你想将数据和日志文件挂载到主机，请添加 `-v”$(pwd)“/data: /timeplus/data-v”$(pwd)“/logs: /timeplus/logs`

## Docker Compose 快速入门 {#compose}

要试用我们的演示套件，你可以使用 Docker Compose 启动 Timeplus Enterprise，以及 Redpanda（与 Kafka API 兼容的消息总线）、ClickHouse 和数据生成器。

对于 Linux 或 Mac 用户，请运行以下命令：

```bash
curl https://install.timeplus.com/sp-demo | sh
```

对于 Windows 用户，你可以下载包含 docker 撰写文件和引导脚本的软件包 [此处](https://timeplus.io/dist/timeplus_enterprise/sp-demo-20240522.zip)。

通过 http://localhost:8000 访问 Timeplus Enterprise 网络控制台。

该堆栈演示了如何运行流式 ETL、从 Kafka API 获取数据、应用过滤器或聚合，然后发送到另一个 Kafka 主题或 ClickHouse 表。 更多详情，请参阅：

- [教程：流 ETL：从 Kafka 到 Kafka](教程-sql-etl)
- [教程：流 ETL：从 Kafka 到 ClickHouse](教程-sql-etl-kafka-to-ch)

## 许可证管理{#license}

当你启动Timeplus Enterprise并首次访问网络控制台时，30天的免费试用开始。 当它结束时，软件将停止运行。

请查看 [指南](server_config #license) 更新许可证。

## Upgrade {#upgrade}

To upgrade Timeplus Enterprise, run `timeplus stop` to stop all the servies. Then replace all the binaries to the higher version of Timepluse Enterprise release and then run `timeplus start`.

## Uninstall {#uninstall}

Timeplus Enterprise has no external dependencies. Just run `timeplus stop` then delete the timeplus folder.
