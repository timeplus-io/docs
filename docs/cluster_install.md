# Cluster Install
Timeplus Enterprise can be installed in multi-node cluster mode for high availability and horizontal scalability.

Both bare metal and Kubernetes are supported.

## Bare Metal Install

Follow the guide on [Single Node Install](singlenode_install) to grab the bare metal package and install on each node. Then update the `config.yml` file to connect the nodes together:

```yaml
node:
  advertised_host:
cluster:
  metadata_node_quorum: host1,host2
kv_service:
  enabled: true
data:
  datastore:
    log:
      preallocate: false
```

## Kubernetes Install {#k8s}

You can also deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

### Prerequisites
* Ensure you have Helm 3.7 + installed in your environment. For details about how to install Helm, see the [Helm documentation](https://helm.sh/docs/intro/install/).
* Ensure you have [Kubernetes](https://kubernetes.io/) 1.24 or higher installed in your environment.
* Ensure you allocate enough resources for the deployment.

### Install Timeplus Enterprise with Helm
Start a Kubernetes cluster.
Add the Timeplus Enterprise Helm chart repository:
```shell
helm repo add timeplus https://install.timeplus.com/helm-charts/ --force-update
helm repo update
```
Other steps (TBD)

## License Management
To activate or add new license, please follow the same process as [single node deployment](singlenode_install#license).
