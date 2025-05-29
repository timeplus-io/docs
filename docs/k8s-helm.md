import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deploy on Kubernetes with Helm

You can deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

For visual learning, you can watch the following video:
<iframe width="560" height="315" src="https://www.youtube.com/embed/kFyzYx1JI_8?si=WVszQMuFyW6Xcixm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Prerequisites

- Ensure you have Helm 3.12 + installed in your environment. For details about how to install Helm, see the [Helm documentation](https://helm.sh/docs/intro/install/)
- Ensure you have [Kubernetes](https://kubernetes.io/) 1.25 or higher installed in your environment. We tested our software and installation process on Amazon EKS, Google GKE, and self-hosted Kubernetes. Other Kubernetes distributions should work in the similar way.
- Ensure you have allocated enough resources for the deployment. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. Please refer to [Planning capacity](#planning-capacity) section for production deployment.
* Network access to Internet. If your environment is air-gapped, please refer to [Offline installation](#offline-installation).
* Port 8464 needs to be open on each k8s node. The pods behind timeplusd Statefulset uses this port to talk to each other.

## Quickstart with self-hosted Kubernetes

This is the quickstart guide to install a 3 nodes Timeplus Enterprise cluster with default configurations on a self-hosted Kubernetes using Helm package manager.

You need to update configurations accordingly to fit your Kubernetes environment. Please refer to [Configuration Guide](#configuration-guide) for available `values` of the chart.

### Add Timeplus Helm chart repository

Simply run the following commands to add the repo and list charts from the repo.

```bash
helm repo add timeplus https://install.timeplus.com/charts
helm repo update
helm search repo timeplus -l
```

A sample output would be:

```bash
NAME                        	CHART VERSION	APP VERSION	DESCRIPTION
timeplus/timeplus-enterprise	v6.0.4       	2.7.1      	Helm chart for deploying a cluster of Timeplus ...
timeplus/timeplus-enterprise	v6.0.3       	2.7.0      	Helm chart for deploying a cluster of Timeplus ...
```

Staring from v3.0.0 chart version, the `APP VERSION` is the same version as [Timeplus Enterprise](/enterprise-releases). Prior to v3.0.0 chart version, the `APP VERSION` is the same version as the timeplusd component.

### Create Namespace

User can choose to install the Timeplus Enterprise into different namespace. In this guide, we use namespace name `timeplus`.

```bash
export NS=timeplus
kubectl create ns $NS
```

### Prepare the `values.yaml`

Copy and paste the following yaml snippet into `values.yaml`.

```yaml
timeplusd:
  replicas: 3
  # Uncomment the following two lines to use headless service if you are going to deploy Timeplus to Google GKE.
  # service:
  #  clusterIP: None
  storage:
    stream:
      className: <Your storage class name>
      size: 100Gi
      # Keep this to be `false` if you are on Amazon EKS with EBS CSI controller.
      # Otherwise please carefully check your provisioner and set them properly.
      selector: false
    history:
      className: <Your storage class name>
      size: 100Gi
      selector: false
    log:
      # This log PV is optional. If you have log collect service enabled on your k8s cluster, you can set this to be false.
      # If log PV is disabled, the log file will be gone after pod restarts.
      enabled: true
      className: <Your storage class name>
      size: 10Gi
      selector: null
  defaultAdminPassword: timeplusd@t+
  resources:
    limits:
      cpu: "32"
      memory: "60Gi"
    requests:
      cpu: "2"
      memory: "4Gi"
```
Then make changes to better fit your need.
1. Update the storage class name, size and selector accordingly. Please check the [Planning capacity](#planning-capacity) section for storage recommendations. You can check available storage class on your cluster by running `kubectl get storageclass`.
2. Update `defaultAdminPassword`. This is the password for the default admin user `proton`, which is used internally in the system.
3. Review and update the `replicas`. Set it to `3` to setup a cluster with 3 timeplusd nodes. Set it to `1` to setup a single node for testing or small workload. Please note that you **cannot** change the number of replicas after the deployment.
4. Update the `resources` and make sure your cluster has enough CPU and memory to run the stack. By default each `timeplusd` pod requires 2 cores and 4GB memory. However, you'd better to have at least 8 cores and 20Gi memory for each node to make sure Timeplus Enterprise works well under small to medium workload.
5. Optionally refer to [Configuration Guide](#configuration-guide) and add other configurations.

### Install Helm chart

In this step, we install the helm chart using release name `timeplus`.

```bash
export RELEASE=timeplus
helm -n $NS install -f values.yaml $RELEASE timeplus/timeplus-enterprise
```

You should see following output within a couple of minutes.

```bash
NAME: timeplus
LAST DEPLOYED: Tue Aug  6 13:41:31 2024
NAMESPACE: timeplus
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Your Timeplus Enterprise stack is deployed! It may take a few minutes before all the services are up and running.
```

To make sure everything is up and running, run `kubectl get pods -n $NS` to check the stack status

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
timeplus-appserver-6f9ddfb5b-4rs98    1/1     Running     0          13m
timeplus-connector-796ff45cb4-4bj6r   1/1     Running     0          13m
timeplus-provision-2wnxj              0/1     Completed   0          12m
timeplus-web-58cf6765d9-glq4l         1/1     Running     0          13m
timeplusd-0                           1/1     Running     0          13m
timeplusd-1                           1/1     Running     0          13m
timeplusd-2                           1/1     Running     0          13m
```

If any of the pod is in error status, you can try to use `kubectl describe pod <error pod> -n $NS` to debug. For more details, please refer to [Troubleshooting](#troubleshooting) section.


### Expose the Timeplus Console

There are different ways to expose the services of Timeplus stack. In this step, we use port forward of kubectl to get a quick access. Run `kubectl port-forward svc/timeplus-appserver 8000:8000 -n $NS --address 0.0.0.0` and then open the address `http://localhost:8000` in your browser to visit Timeplus Console web UI.

As long as you are able to access the UI, you are now ready to explore the Timeplus Enterprise.

### Offline installation

The above quick start guide assume there is network access to the Docker Hub to pull all required images. In the case there is no access to the Docker Hub, users need import required images into Kubernetes cluster first. You can run:
1. Run `helm template -f ./values.yaml timeplus/timeplus-enterprise | grep image: | cut -d ":" -f2,3 | sort | uniq | sed 's/"//g'` to list all required images.
2. Use `docker save` to save the images locally. Please refer to https://docs.docker.com/reference/cli/docker/image/save/.
3. Upload the images to your Kubernetes image registry.

Note, you may need update the `imageRegistry` in `values.yaml` to point to your own Kubernetes registry.

### Uninstall and cleanup

To uninstall the helm release, just run `helm -n $NS uninstall $RELEASE` to uninstall it.

Please note, by default, all the PVCs will not be deleted. You can use `kubectl get pvc -n $NS` and `kubectl delete pvc <pvc_name> -n $NS` to manually delete them.

You can run `kubectl delete namespace $NS` to delete all PVCs and the namespace.

## Go Production

### Planning capacity

This section provides recommendations for sizing your Timeplus Enterprise deployment. The actual resource requirements may vary based on your specific use case and workload.

The timeplusd component is the core of the Timeplus Enterprise stack. It requires significant CPU and memory resources to handle data processing and queries. It is highly recommended to run `timeplusd` dedicatedly on the node.

For small to medium-sized deployment, you may consider the following cluster configuration as the start point:

- 3 nodes with:
  - 16 cores each
  - 32 Gi memory each
  - 500Gi storage with iops > 3000 each

:::warning
You cannot change the number of nodes after the deployment. If your development environment is a single-node Timeplus Enterprise, and you want to setup a multi-node cluster, you need to install a new cluster and migrate the data via [timeplus migrate](/cli-migrate) CLI.
:::
A sample `values.yaml` configuration:
```yaml
timeplusd:
  resources:
    requests:
      cpu: "8"
      memory: "16Gi"
    # Don't enforce any resource limit here so that timeplusd can fully leverage the resources on its pod
    # limits:
    #   cpu: "32"
    #   memory: "60Gi"

  storage:
    stream:
      className: <storage class with high iops>
      size: 250Gi

    history:
      className: <storage class with high iops>
      size: 250Gi
```


## Operations

### Update Configuration

After the installation, you can further customize the configuration by updating the `values.yaml`. Please refer to [Configuration Guide](#configuration-guide). Once the `values.yaml` is ready, apply this via:

```bash
export RELEASE=timeplus
helm -n $NS upgrade -f values.yaml $RELEASE timeplus/timeplus-enterprise
```

### Update PV size for timeplusd

Due to the [limitation of Kubernetes Statefulset](https://github.com/kubernetes/kubernetes/issues/68737), you will need to manually update the PV size for timeplusd. Notice that this will cause downtime of Timeplus Enterprise.

1. Make sure the `global.pvcDeleteOnStsDelete` is not set or is set to be `false`. You can double check this by running command `kubectl -n <ns> get sts timeplusd -ojsonpath='{.spec.persistentVolumeClaimRetentionPolicy}'` and make sure both `whenDeleted` and `whenScaled` are `retain`. This is extremely important otherwise your PV may be deleted and all the data will be lost.
1. Run `kubectl -n <ns> delete sts/timeplusd` to temporarily delete the statefulset. Wait until all timeplusd pods are terminated. This step is necessary to workaround the Kubernetes limitation.
1. Run `kubectl -n <ns> get pvc` to list all the PVCs and their corresponding PVs. For each PV you want to resize, run command `kubectl -n edit pvc <pvc>` to update the `spec.resources.requests.storage`. Notice that all timeplusd replicas need to have the same storage size so please make sure all updated PVCs have the same storage size.
1. Run `kubectl get pv <pv> -o=jsonpath='{.spec.capacity.storage}'` to make sure all corresponding PVs have been updated. It takes a while before Kubernetes update the capacity field of the PVC so as long as you can see the underlying storage size gets updated, you can process to the next step.
1. Update the `timeplusd.storage.stream.size` and/or `timeplusd.storage.stream.history.size` in `values.yaml` that you used to deploy Timeplus Enterprise.
1. Run helm upgrade command to upgrade the deployment. New statefulset will be created to pick up the PV size changes.

### Upgrade Timeplus Enterprise

#### Do not attempt to upgrade across multiple major chart versions at a time

This helm chart follows [Semantic Versioning](https://semver.org/). It is always the best practice to upgrade one major chart version at a time even if the breaking change doesn't impact your deployment.

#### Check if there is an incompatible breaking change needing manual actions

Each major chart version contains a new major Timeplus Enterprise version. If you are not going to upgrade the major version, you can just go ahead to run the helm upgrade command. Otherwise, please check:
1. The [release notes](/release-notes) of Timeplus Enterprise to confirm the target version can be upgraded in-place, by reusing the current data and configuration. For example [2.3](/enterprise-v2.3) and [2.4](/enterprise-releases) are incompatible and you have to use migration tools.
2. The [upgrade guide](#upgrade-guide) of helm chart. You may need to modify your `values.yaml` according to the guide before upgrade.

#### Run helm upgrade

If you confirm you can upgrade to the new version, you can run the following commands to upgrade:

```bash
# Upgrade to the latest version
helm repo update
helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise

# Or You can also check the available versions and upgrade to a specific version:
helm search repo timeplus -l
helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise --version va.b.c
```

### Prometheus metrics

Timeplus Enterprise exposes its metrics in Prometheus format to allow monitoring the cluster status.

It is recommended to configure your existing Prometheus metrics collector such as [Grafana Agent](https://grafana.com/docs/agent/latest/) or [Vector](https://vector.dev/) to scrape metrics from timeplusd pods directly.

The metrics of timeplusd are exposed at `:9363/metrics`. You will need to collect the metrics from all timeplusd pods. For example, if your Timeplus Enterprise is installed in `my_ns` namespace, you can configure the collector to collect metrics from

- `timeplusd-0.timeplusd-svc.my_ns.svc.cluster.local:9363/metrics`
- `timeplusd-1.timeplusd-svc.my_ns.svc.cluster.local:9363/metrics`
- `timeplusd-2.timeplusd-svc.my_ns.svc.cluster.local:9363/metrics`

Similarly, for timeplus-connector, the metrics are exposed at `:4196/metrics`. For example `http://timeplus-connector.my_ns:4196/metrics`. You can refer to the [docs](https://docs.redpanda.com/redpanda-connect/components/metrics/about/) on Redpanda Connect site for more details.

If you are interested in building Grafana dashboards based on the metrics, please contact us.

### Recover from EBS snapshots

If you deploy Timeplus Enterprise on Amazon EKS, assuming that you are using EBS volume for persistent volumes, you can use EBS snapshots to backup the volumes. Then in the case of data lost (for example, the EBS volume is broken, or someone accidentally delete the data on the volume ), you can restore the persistent volumes from EBS snapshots with the following steps:

#### Step 1 - Find snapshots of a workspace

First, we need to find out the PV name

```bash
kubectl get pvc -n $NS proton-data -o=jsonpath='{.spec.volumeName}'
```

You will get the PV name looks like this

```
pvc-ff33a8a4-ed91-4192-8a4b-30e4368b6670
```

Then you use this PV name to get the EBS volume ID

```bash
kubectl describe pv pvc-ff33a8a4-ed91-4192-8a4b-30e4368b6670 -o=jsonpath='{.spec.csi.volumeHandle}'
```

You will get the volume ID looks like this

```
vol-01b243a849624a2be
```

Now you can use this volume ID to list the available snapshot

```bash
aws ec2 describe-snapshots --output json --no-cli-pager --filter 'Name=volume-id,Values=vol-01b243a849624a2be' | jq '.Snapshots | .[] | select(.State == "completed") | .SnapshotId + " " + .StartTime'
```

You will see the snapshot IDs with the time when the snapshot was created, like

```
"snap-064a198d977abf0d9 2022-10-13T09:22:15.188000+00:00"
"snap-037248e84dcb666aa 2022-10-11T09:29:57.456000+00:00"
"snap-0a92fb9ab6c976356 2022-10-09T09:23:19.104000+00:00"
"snap-005ebf9d0c1006a5b 2022-10-06T09:23:42.775000+00:00"
"snap-0e39d233cece1b015 2022-10-04T09:15:59.079000+00:00"
"snap-04eb5d2ba8b50c432 2022-10-02T09:18:39.147000+00:00"
```

You will pick one snapshot from the list for the recovery (usually the latest one).

#### Step 2 - Create an EBS volume with the snapshot

Assume the snapshot ID you pick is `snap-064a198d977abf0d9`, now you create an EBS volume by

```bash
aws ec2 create-volume --output yaml --availability-zon us-west-2a --snapshot-id snap-064a198d977abf0d9 --volume-type gp3
```

:::info
In this example, we didn't use `--iops` nor `--throughput`. But in real case, you might need to use them. So before running this command, run (replace `vol-01b243a849624a2be` with the volume ID you found in step 1 above):

```bash
aws ec2 describe-volumes --filters 'Name=volume-id,Values=vol-01b243a849624a2be'
```

And you will find the `Iops` and `Throughput` from the output, make sure the new volume you are going to create matches these values.
:::

After running the `create-volume` command, you will see output looks like

```
AvailabilityZone: us-west-2a
CreateTime: '2022-10-13T20:05:53+00:00'
Encrypted: false
Iops: 3000
MultiAttachEnabled: false
Size: 80
SnapshotId: snap-064a198d977abf0d9
State: creating
Tags: []
Throughput: 125
VolumeId: vol-0d628e0096371cb67
VolumeType: gp3
```

The `VolumeId` is what you need for next step, in this example, it is `vol-0d628e0096371cb67`.

#### Step 3 - Create a new PV

Firstly, use the PV name you found in step 1 and the volume ID of volume you created in step 2 to run the following command to generate the YAML file for the new PV you are going to create:

```bash
kubectl get pv pvc-17510f7b-8e66-472d-a1dc-4245b2f51e1a -oyaml | yq 'del(.metadata.creationTimestamp) | del(.metadata.resourceVersion) | del(.metadata.uid) | del(.status) | .spec.csi.volumeHandle = "vol-0d628e0096371cb67" | .metadata.name = "pvc-manual-vol-0d628e0096371cb67"' > new-pv.yaml
```

Then use the YAML file to create the PV

```bash
kubectl apply -f new-pv.yaml
```

#### Step 4 - Make the proton pod use the new PV

First, delete the existing PV

```bash
kubectl delete pv pvc-17510f7b-8e66-472d-a1dc-4245b2f51e1a
```

Even though it will show the PV is deleted, but the command will be blocked because the PV is currently in-use. So leave this along, and open a new terminal to run the next command.

Next, delete the existing pvc

```bash
kubectl delete pvc -n $NS proton-data
```

Similarly, this command will also be blocked because the PVC is in-use. Leave it alone, and open a new terminal to run the next command.

Finally, delete the proton pod

```bash
kubectl delete pod -n $NS proton-0
```

Once the pod is deleted, the previous commands will also be unblocked thus the existing PVC and PV will be deleted.

Once the new pod is up and running, it will use the PV you previously created manually. You can double check by

```bash
kubectl get pvc -n $NS proton-data -o=jsonpath='{.spec.volumeName}'
```

It should return the name you used in your new PV, in this example it is `pvc-manual-vol-0d628e0096371cb67`.

## Configuration Guide

You may want to customize the configurations of Timeplus Appserver or Timeplusd. Here is a quick example of how to modify the `values.yaml`. For the list of available configuration items, please refer to the docs of [Timeplus Appserver](./server_config#appserver) and [Timeplusd](./server_config#timeplusd).

```yaml
# Attention please: timeplusAppserver uses `configs` while timeplusd uses `config`
timeplusAppserver:
  configs:
    enable-access-log: false

timeplusd:
  config:
    max_concurrent_queries: 1000
    max_concurrent_insert_queries: 1000
    max_concurrent_select_queries: 1000
```

There are a lot of other configurations available to customize the deployment. Some of the properties are available for each component. To save some space, we won't list them in the next `Values` section.

- `affinity`: [Node affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) property.
- `imageRegistry`: Defaulted to the official Docker Hub (`docker.io`).
- `imagePullPolicy`: Defaulted to `IfNotPresent`.
- `resources`: [Resource](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) property. Defaulted to `null` except for `timeplusd` component. Please refer to `timeplusd` section to find out the default value.
- `labels`: Extra labels that applied to Pod/Deploy/Sts/Svc. Defaulted to `null`.
- `annotations`: Extra annotations that applied to Pod/Deploy/Sts. Defaulted to `null`.
- `securityContext`: Extra security Context that applied to Pod/Deploy/Sts. Defaulted to `null`.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| global.affinity | object | `{}` | This is the global affinity settings. Once set, it will be applied to every single component. If you'd like to set affinity for each component, you can set `affinity` under component name. For example you can use `timeplusd.affinity` to control the affinity of timeplusd Refer to https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/ |
| global.imagePullPolicy | string | `"IfNotPresent"` | This setting is available for each component as well. |
| global.imageRegistry | string | `"docker.timeplus.com"` | This setting is available for each component as well. |
| global.nodeSelector | object | `{}` | See https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector |
| global.pvcDeleteOnStsDelete | bool | `false` | Only valid with k8s >= 1.27.0. Ref: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention |
| global.pvcDeleteOnStsScale | bool | `false` | Only valid with k8s >= 1.27.0. Ref: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention |
| global.tolerations | list | `[]` | See https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| ingress.appserver | object | `{"domain":null,"enabled":false}` | Only Nginx controller is tested. https://kubernetes.github.io/ingress-nginx/ ingressClassName: nginx Uncomment the tls section below to enable https. You will need to follow   1. https://kubernetes.io/docs/concepts/services-networking/ingress/#tls   2. https://kubernetes.github.io/ingress-nginx/user-guide/tls/ to create a k8s secret that contains certificate and private key tls:   - hosts: [timeplus.local]   secretName: "secret-name" |
| ingress.appserver.domain | string | `nil` | If you want use an ip, please remove it. it's will match all (equal *). |
| ingress.timeplusd.domain | string | `nil` | If you want use an ip, please remove it. it's will match all (equal *). |
| ingress.timeplusd.enabled | bool | `false` | To send REST API call to timeplusd, the URL will be http(s)://<publicDomain>:<port><restPath> e.g.   - curl http://timeplus.local/timeplusd/info   - curl http://timeplus.local/timeplusd/v1/ddl/streams |
| ingress.timeplusd.httpSnapshotPath | string | `"/snapshot"` | * update thte `httpSnapshotPath` to be `/` and use different domain for appserver and timeplusd ingress |
| prometheus_metrics.enabled | bool | `false` |  |
| prometheus_metrics.remote_write_endpoint | string | `"http://timeplus-prometheus:80"` |  |
| prometheus_metrics.vector.image | string | `"timberio/vector"` |  |
| provision.dashboards | bool | `true` | Monitoring dashboards |
| provision.enabled | bool | `true` | Provision job will ONLY be run once after the first installation if it is enabled. A Job will be created to provision default resources such as users, licenses, and etc. This Job shares the same configurations (e.g. resource limit) as `timeplusCli` below. Disable it during installation and re-enable it later won't work. |
| timeplusAppserver.configs | object | `{}` | Configurations for appserver. e.g. `enable-authentication: true`. See https://docs.timeplus.com/server_config#appserver |
| timeplusAppserver.enabled | bool | `true` | Timeplus web, Timeplus connector will not work properly if Timeplus appserver is not enabled. |
| timeplusAppserver.extraContainers | list | `[]` | Extra containers that to be run together with the main container. |
| timeplusAppserver.extraVolumes | list | `[]` | Extra volumes that to be mounted |
| timeplusAppserver.image | string | `"timeplus/timeplus-appserver"` |  |
| timeplusAppserver.metastoreType | string | `"stream"` |  |
| timeplusCli.enabled | bool | `false` |  |
| timeplusCli.image | string | `"timeplus/timeplus-cli"` |  |
| timeplusConnector.configMap | object | `{"logger":{"add_timestamp":true,"file":{"path":"/timeplus/connector-server.log","rotate":true,"rotate_max_age_days":1},"level":"INFO"}}` | With this default config map, the logs will be written to local ephemeral volume. You can set configMap to be `null` and the logs will be written to stdout. However, you will not be able to view logs of the source and sink on UI if it is `null`. |
| timeplusConnector.enabled | bool | `true` |  |
| timeplusConnector.extraContainers | list | `[]` | Extra containers that to be run together with the main container. |
| timeplusConnector.extraVolumes | list | `[]` | Extra volumes that to be mounted |
| timeplusConnector.image | string | `"timeplus/timeplus-connector"` |  |
| timeplusWeb.enabled | bool | `true` |  |
| timeplusWeb.image | string | `"timeplus/timeplus-web"` |  |
| timeplusd.computeNode | object | `{"config":{},"replicas":0,"resources":{"limits":{"cpu":"32","memory":"60Gi"},"requests":{"cpu":"2","memory":"4Gi"}}}` | Compute node |
| timeplusd.config | object | `{}` | Configurations for timeplusd. See https://docs.timeplus.com/server_config#timeplusd |
| timeplusd.defaultAdminPassword | string | `"timeplusd@t+"` | Timeplus appserver will use this username and password to connect to timeplusd to perform some administration operations such as user management. |
| timeplusd.enableCoreDump | bool | `false` |  |
| timeplusd.enabled | bool | `true` |  |
| timeplusd.extraContainers | list | `[]` | Extra containers that to be run together with the main container. |
| timeplusd.extraEnvs | list | `[]` | Extra environment variables |
| timeplusd.extraInitContainers | list | `[]` | Extra init containers. It will be run before other init containers. |
| timeplusd.extraUsers | object | `{}` | Extra users |
| timeplusd.extraVolumes | list | `[]` | Extra volumes that to be mounted |
| timeplusd.image | string | `"timeplus/timeplusd"` |  |
| timeplusd.initJob.image | string | `"timeplus/boson"` |  |
| timeplusd.livenessProbe | object | `{"failureThreshold":20,"httpGet":{"path":"/timeplusd/ping","port":"http-streaming","scheme":"HTTP"},"initialDelaySeconds":30,"periodSeconds":30,"successThreshold":1,"timeoutSeconds":1}` | K8s liveness probe for timeplusd. Please refer to https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| timeplusd.replicas | int | `3` | A typical deployment contains 1, 3, or 5 replicas. The max number of Metadata node is 3. If you specify more than 3 replicas, the first 3 will always be Metadata and Data node and the rest of them will be Data node only. |
| timeplusd.resources | object | `{"limits":{"cpu":"32","memory":"60Gi"},"requests":{"cpu":"2","memory":"4Gi"}}` | Make sure at least 2 cores are assigned to each timeplusd |
| timeplusd.service.clusterIP | string | `nil` | Set clusterIP to be `None` to create a headless service. |
| timeplusd.service.nodePort | int | `30863` |  |
| timeplusd.service.type | string | `"ClusterIP"` | Update type to `NodePort` if you want to access timeplusd directly (rest API, metrics, and etc.) |
| timeplusd.serviceAccountName | string | `""` |  |
| timeplusd.sleep | bool | `false` | Don't start timeplusd automatically when pod is up. Instead, just run sleep command so that you can exec into the pod to debug. |
| timeplusd.storage.history | object | `{"className":"local-storage","selector":{"matchLabels":{"app":"timeplusd-data-history"}},"size":"100Gi","subPath":"./"}` | PV settings for historical storage. |
| timeplusd.storage.log | object | `{"className":"local-storage","enabled":true,"selector":{"matchLabels":{"app":"timeplusd-log"}},"size":"30Gi","subPath":"./"}` | PV settings for logs. |
| timeplusd.storage.log.enabled | bool | `true` | When disabled, log will be written to stream storage (/var/lib/timeplusd/nativelog) |
| timeplusd.storage.stream | object | `{"className":"local-storage","metastoreSubPath":"./","nativelogSubPath":"./","selector":{"matchLabels":{"app":"timeplusd-data-stream"}},"size":"100Gi"}` | PV settings for streaming storage. |

## Upgrade guide

### v6 to v7
:::info
[Timeplus Enterprise 2.7](/enterprise-v2.7)'s helm chart versions are v6.0.x.
[Timeplus Enterprise 2.8](/enterprise-v2.8)'s helm chart versions are v7.0.x.
:::

By default, the v7 helm chart is configured to use new mutable stream based KV store. If you've decided not to run the migration, you can just use `helm upgrade` to upgrade the chart.

If you have decided to run the migration, here are the steps to follow:

1. Update the `values.yaml` to enable Timeplus CLI and disable both Timeplus connector and appserver
```yaml
timeplusCli:
  enabled: true
timeplusConnector:
  enabled: false
timeplusAppserver:
  enabled: false
```
2. Use `helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise --version v7.x.x` to upgrade your Timeplus Enterprise deployment with v7 chart.
3. Use `kubectl -n $NS get pods` to check the status of the pods. Please make sure that:
    1. `timeplusd` pods has been upgraded to 2.8.x 
    2. `timeplus-appserver` pod is terminated
    3. `timeplus-connector` pod is terminated
    4. `timeplus-cli` pod is up and running
4. Run `kubectl -n $NS exec timeplus-cli -it -- /bin/bash`
5. Run `./bin/timeplus migrate kv --host timeplusd-0.timeplusd-svc.<namespace>.svc.cluster.local -p <password>`
    1. Replace `<namespace>` with the namespace that Timeplus Enterprise is deployed to
    2. Replace `<password>` with the admin password. If you haven't customized it via `values.yaml`, please use the default password `timeplusd@t+`
6. Wait until the command above finishes. It should be very fast. In case of any error, please contact Timeplus support.
7. Once migration succeed, you can revert the `values.yaml` change you have done for step 1 and run `helm upgrade` to apply the change.

### v5 to v6
:::info
[Timeplus Enterprise 2.6](/enterprise-v2.6)'s helm chart versions are v5.0.x.
[Timeplus Enterprise 2.7](/enterprise-v2.7)'s helm chart versions are v6.0.x.
:::

1. A few timeplusd built-in users (`neutron`, `pgadmin`, `system`, `default`) are removed. If you do need any of these users, please add them back to `timeplusd.extraUsers`, for example:
```yaml
timeplusd:
  extraUsers:
    users:
      default:
        password: ""
        networks:
          - ip: "::/0"
        profile: default
        quota: default
        allow_databases:
          - database: default
        default_database: default
```

2. Now you can configure ingress for Appserver and Timeplusd independently under `ingress` section.

| Old | New |
|-----|-----|
|`timeplusd.ingress.enabled`|`ingress.timeplusd.enabled`|
|`ingress.enabled`|`ingress.timeplusd.enabled`, `ingress.appserver.enabled`|
|`ingress.domain`|`ingress.timeplusd.domain`, `ingress.appserver.domain`|

## Troubleshooting

If something goes wrong, you can run the following commands to get more information.

1. `kubectl get pods -n $NS`: Make sure all pods are in `Running` status and the `READY` is `1/1`.
2. `kubectl logs <pod> -n $NS`: Try to check the logs of each pod to make sure there is no obvious errors.
3. Run `kubectl cluster-info dump -n $NS` to dump all the information and send it to us.

### Timeplusd keep restarting with `bootstrap: Failed to send request=Hello to peer node` error

This error indicates that timeplusd cannot connect to its peer node. Most likely the network (port 8464) between different k8s node is blocked. A typical way to check is to 
1. Create 2 testing pods on **different** k8s nodes, check if you can access port 8464 from pod 1 on node 1 to pod 2 on node 2. Most likely it will fail in this case.
2. Create 2 testing pods on the **same** k8s node, check if you can access port 8464 from pod 1 to pod 2 on the same node. If this works, then it proves that there is an issue with inter-node network. You can check if there is any firewall settings that block port 8464.