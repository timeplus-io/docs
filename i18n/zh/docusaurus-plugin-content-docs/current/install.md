# 安装

## 云端的 Timeplus 企业版{#cloud}

开始使用Timeplus的最快、最简单的方法是在完全托管的 [us.timeplus.cloud](https://us.timeplus.cloud) 注册一个免费账户。

只需使用谷歌或微软单点登录进行注册，或创建用户名和密码即可。 接下来，创建一个新的工作区并开始您的流式分析旅程。

## Timeplus 企业版自托管{#self-hosted}

使用 [裸机安装程序](singlenode_install #bare-metal-install)或官方 Timeplus [Kubernetes Helm Chart](cluster_install #k8s)在自己的数据中心或云账户中安装具有高可用性和可扩展性的 Timeplus 企业版。

## Timeplus Proton，核心引擎{#proton}

### 作为单个二进制文件{#binary}

```shell
curl https://install.timeplus.com/oss | sh
```

一旦 `proton` 二进制文件可用，你就可以以不同的模式运行 Timeplus Proton：

- **本地模式。** 您可以运行 `proton local` 来启动它，以便使用 SQL 快速处理本地和远程文件，而无需安装完整的服务器
- **无配置模式。** 你运行 `Proton服务器`来启动服务器并将配置/日志/数据放入当前文件夹。 然后在另一个终端使用 proton client-h 127.0.0.1 启动 SQL 客户端。
- **服务器模式。** 您可以运行 `sudo proton install` 将服务器安装在预定义路径和默认配置文件中。 然后你可以运行 sudo proton server-c/etc/Proton-server/config.yaml 来启动服务器，并在另一个终端使用 proton client 来启动 SQL 客户端。

对于 Mac 用户，你还可以使用 [Homebrew](https://brew.sh/) 来管理安装/升级/卸载：

```shell
brew tap tap timeplus-io/timeplus
brew inst
```

### 作为 Docker 容器{#docker}

```bash
docker run-d--pull always--name proton ghcr.io/timeplus-io/proton: latest
```

如果你无法访问 ghcr，你可以从 `public.ecr.aws/timeplus/proton`中提取图片

您可能需要公开 Proton 容器中的端口，以便其他工具可以连接到该容器，例如 DBeaver。 请检查 [服务器端口]（Proton端口）以查看每个要暴露的端口。 例如：

```shell
docker run-d--pull always-p 8123:8123-p 8463:8463--name proton ghcr.io/timeplus-io/proton: latest
```

### Docker 撰写 {#compose}

[Docker Compose 堆栈](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) 演示了如何使用外部流在 Kafka/Redpanda 中读取/写入数据。

### Kubernetes

通过 Kubernetes 运行单节点 Proton 是可能的。 我们建议您[联系我们](mailto:support@timeplus.com)进行私有化Timeplus Enterprise部署。
