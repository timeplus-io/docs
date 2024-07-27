# Cluster Install
Timeplus Enterprise can be installed in multi-node cluster mode for high availability and horizontal scalability.

Both bare metal and Kubernetes are supported.

## Bare Metal Install

Follow the guide in [Single Node Install](singlenode_install) to grab the bare metal package and install on each node.

There are multiple ways to setup a cluster without Kubernetes. One easy solution is to run all components in one node, and the rest of nodes running the timeplusd only. For other deployment options, please contact [support](mailto:support@timeplus.com) or message us in our [Slack Community](timeplus.com/slack).

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


## Kubernetes Install {#k8s}

You can also deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

### Prerequisites
* Ensure you have Helm 3.12 + installed in your environment. For details about how to install Helm, see the [Helm documentation](https://helm.sh/docs/intro/install/)
* Ensure you have [Kubernetes](https://kubernetes.io/) 1.25 or higher installed in your environment
* Ensure you have allocated enough resources for the deployment

### Deploy Timeplus Enterprise with Helm

Follow the [guide](k8s-helm) to deploy Timeplus Enterprise on Kubernetes with Helm.

## License Management
To activate or add new a license, please follow [our guide](server_config#license).
