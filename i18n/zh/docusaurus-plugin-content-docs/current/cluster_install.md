# Cluster Install

Timeplus Enterprise can be installed in multi-node cluster mode for high availability and horizontal scalability.

Both bare metal and Kubernetes are supported.

## Bare Metal Install

Follow the guide on [Single Node Install](singlenode_install) to grab the bare metal package and install on each node. Then update the `config.yml` file to connect the nodes together:

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

For more details about the server configuration, please contact your account manager.

## Kubernetes Install {#k8s}

You can also deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

### 先决条件

- Ensure you have Helm 3.7 + installed in your environment. For details about how to install Helm, see the [Helm documentation](https://helm.sh/docs/intro/install/).
- Ensure you have [Kubernetes](https://kubernetes.io/) 1.24 or higher installed in your environment.
- Ensure you allocate enough resources for the deployment.

### Install Timeplus Enterprise with Helm

Start a Kubernetes cluster.

Contact us to get the Helm chart. We will make the Helm chart repository public soon.

## License Management

To activate or add new license, please follow [the guide](server_config#license).
