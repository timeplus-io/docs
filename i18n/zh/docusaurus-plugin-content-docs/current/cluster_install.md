# 集群安装

Timeplus 企业版可以以多节点集群模式安装，以实现高可用性和横向可扩展性。

支持裸机和 Kubernetes。

## 裸机安装

Follow the guide in [Single Node Install](singlenode_install) to grab the bare metal package and install on each node.

Next, update the `config.yml` file to connect the nodes together:

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

For more details about the server configuration, please contact [support](mailto:support@timeplus.com) or message us in our [Slack Community](timeplus.com/slack).

## Kubernetes Install {#k8s}

You can also deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

### 先决条件

- Ensure you have Helm 3.7 + installed in your environment. For details about how to install Helm, see the [Helm documentation](https://helm.sh/docs/intro/install/)
- Ensure you have [Kubernetes](https://kubernetes.io/) 1.24 or higher installed in your environment
- Ensure you have allocated enough resources for the deployment

### Install Timeplus Enterprise with Helm

Start a Kubernetes cluster.

Please [contact us](mailto:support@timeplus.com) to get the Helm chart. We will make the Helm chart repository public soon.

## License Management

To activate or add new a license, please follow [our guide](server_config#license).
