# 安装

## 云端的 Timeplus 企业版{#cloud}

The quickest and easiest way to get started with Timeplus is to sign up a free account on our fully-managed platform at [us.timeplus.cloud](https://us.timeplus.cloud).

Simply sign up with Google or Microsoft Single Sign-On, or create a username and password. Next, create a new workspace and start your streaming analytics journey.

## Timeplus 企业版自托管{#self-hosted}

Install Timeplus Enterprise with high availability and scalability in your own data center or cloud account, using the [bare metal installer](singlenode_install#bare-metal-install) or the official Timeplus [Kubernetes Helm Chart](cluster_install#k8s).

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

通过 Kubernetes 运行单节点 Proton 是可能的。 We recommend you [contact us](mailto:support@timeplus.com) to deploy Timeplus Enterprise for on-prem deployment.
