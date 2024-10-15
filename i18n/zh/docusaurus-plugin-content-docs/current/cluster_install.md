# 集群安装

Timeplus 企业版可以以多节点集群模式安装，以实现高可用性和横向可扩展性。

支持裸机和 Kubernetes。

## 裸机安装

Follow the guide in [Single Node Install](/singlenode_install) to grab the bare metal package and install on each node.

There are multiple ways to setup a cluster without Kubernetes. One easy solution is to run all components in one node, and the rest of nodes running the timeplusd only. For other deployment options, please contact [support](mailto:support@timeplus.com) or message us in our [Slack Community](https://timeplus.com/slack).

Choose one node as the lead node, say its hostname is `timeplus-server1`. Stop all services via `timeplus stop` command. Then configure environment variables.

```bash
export ADVERTISED_HOST=timeplus-server1
export METADATA_NODE_QUORUM=timeplus-server1:8464,timeplus-server2:8464,timeplus-server3:8464
export TIMEPLUSD_REPLICAS=3
```

Then run `timeplus start` to start all services, including timeplusd, timeplus_web, timeplus_appserver and timeplus_connector.

On the second node, first make sure all services are stopped via `timeplus stop`.
Then configure environment variables.

```bash
export ADVERTISED_HOST=timeplus-server2
export METADATA_NODE_QUORUM=timeplus-server1:8464,timeplus-server2:8464,timeplus-server3:8464
```

Then run `timeplus start -s timeplusd` to only start timeplusd services.

Similarly on the third node, set `export ADVERTISED_HOST=timeplus-server3` and the same `METADATA_NODE_QUORUM` and only start timeplusd.

## 在Kubernetes安装{#k8s}

你还可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群上部署 Timeplus Enterprise。

### 先决条件

- 确保你的环境中安装了 Helm 3.12+。 有关如何安装 Helm 的详细信息，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
- 确保你的环境中安装了 [Kubernetes](https://kubernetes.io/) 1.25 或更高版本。
- 确保为部署分配了足够的资源

### Deploy Timeplus Enterprise with Helm

Follow the [guide](/k8s-helm) to deploy Timeplus Enterprise on Kubernetes with Helm.

## 许可管理

To activate or add new a license, please follow [our guide](/server_config#license).
