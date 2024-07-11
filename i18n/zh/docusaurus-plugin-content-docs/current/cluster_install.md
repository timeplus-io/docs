# 集群安装

Timeplus 企业版可以以多节点集群模式安装，以实现高可用性和横向可扩展性。

支持裸机和 Kubernetes。

## 裸机安装

安装[单节点安装](singlenode_install)指南在每个物理机格子安装一个节点。

接下来，更新 config.yml 文件以将节点连接在一起：

```yaml
node:
  # cluster id this node belongs to. Only nodes in the same cluster id can form a cluster
  cluster_id: timeplus_cluster
  advertised_host:
  roles:
    role: #Supported roles : Metadata, Data, Ingest, Query.`Data` role contains both `Ingest and Query` roles
      - Metadata
      - Data
cluster:
  metadata_node_quorum: localhost:8464
```

欲了解服务器配置的更多详情，请联系 [support](mailto:support@timeplus.com) 或在 [Slack Community](timeplus.com/slack)与我们讨论。

## 在Kubernetes安装{#k8s}

你还可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群上部署 Timeplus Enterprise。

### 先决条件

- 确保你的环境中安装了 Helm 3.7+。 有关如何安装 Helm 的详细信息，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
- 确保你的环境中安装了 [Kubernetes](https://kubernetes.io/) 1.24 或更高版本。
- 确保为部署分配了足够的资源

### Deploy Timeplus Enterprise with Helm

Follow the [guide](k8s-helm) to deploy Timeplus Enterprise on Kubernetes with Helm.

## 许可管理

要激活或添加新许可证，请遵循 [指南](server_config#license)。
