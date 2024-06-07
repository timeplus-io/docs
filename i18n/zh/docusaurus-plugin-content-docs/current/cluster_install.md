# 集群安装

Timeplus 企业版可以以多节点集群模式安装，以实现高可用性和横向可扩展性。

支持裸机和 Kubernetes。

## 裸机安装

按照 [单节点安装]（singlenode_install）上的指南获取裸机软件包并安装在每个节点上。 然后更新 config.yml 文件以将节点连接在一起：

```yaml
节点：
  # 该节点所属的集群 ID。只有具有相同集群 ID 的节点才能形成集群
  cluster_id: timeplus_cluster
  advertised_host:
  角色:
    角色:#Supported 角色：元数据、数据、收录、查询。`Data` 角色包含 `Ingest 和 Query` 角色
      -元数据
      -数据
集群：
  metadata_node_quorum：localhost: 8464
```

有关服务器配置的更多详细信息，请联系您的客户经理。

## 安装 Kubernetes {#k8s}

你还可以使用 [Helm] (https://helm.sh/) 在 Kubernetes 集群上部署 Timeplus Enterprise。

### 先决条件

- 确保你的环境中安装了 Helm 3.7+。 有关如何安装 Helm 的详细信息，请参阅 [Helm 文档] (https://helm.sh/docs/intro/install/)。
- 确保你的环境中安装了 [Kubernetes] (https://kubernetes.io/) 1.24 或更高版本。
- 确保为部署分配足够的资源。

### 使用 Helm 安装 Timeplus 企业版

启动 Kubernetes 集群。

联系我们获取 Helm 图表。 我们将很快公开 Helm 图表存储库。

## 许可证管理

要激活或添加新许可证，请遵循 [指南] (server_config #license)。
