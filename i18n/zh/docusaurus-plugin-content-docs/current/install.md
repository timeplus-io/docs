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
- **Config-less Mode.** You run `proton server` to start the server and put the config/logs/data in the current folder `proton-data`. Then use `proton client` in the other terminal to start the SQL client.
- **服务器模式。** 您可以运行 `sudo proton install` 将服务器安装在预定义路径和默认配置文件中。 Then you can run `sudo proton server -C /etc/proton-server/config.yaml` to start the server and use `proton client` in the other terminal to start the SQL client.

对于 Mac 用户，你还可以使用 [Homebrew](https://brew.sh/) 来管理安装/升级/卸载：

```shell
brew install timeplus-io/timeplus/proton
```

### 作为 Docker 容器{#docker}

```bash
docker run -d --pull always -p 8123:8123 -p 8463:8463 --name proton d.timeplus.com/timeplus-io/proton:latest
```

Please check [Server Ports](proton-ports) to determine which ports to expose, so that other tools can connect to Timeplus, such as DBeaver.

### Docker 撰写 {#compose}

[Docker Compose 堆栈](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) 演示了如何使用外部流在 Kafka/Redpanda 中读取/写入数据。

### Kubernetes

通过 Kubernetes 运行单节点 Proton 是可能的。 我们建议您[联系我们](mailto:support@timeplus.com)进行私有化Timeplus Enterprise部署。
