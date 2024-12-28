import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deploy on Kubernetes with Helm

You can deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

## Prerequisites

- Ensure you have Helm 3.12 + installed in your environment. For details about how to install Helm, see the [Helm documentation](https://helm.sh/docs/intro/install/)
- Ensure you have [Kubernetes](https://kubernetes.io/) 1.25 or higher installed in your environment. We tested our software and installation process on Amazon EKS, and self-hosted Kubernetes. Other Kubernetes distributions should work in the similar way.
- Ensure you have allocated enough resources for the deployment. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. Please refer to [Planning capacity](#planning-capacity) section for production deployment.
* Network access to Internet. If your environment is air-gapped, please refer to [Offline installation](#offline-installation).

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
timeplus/timeplus-enterprise	v4.0.10      	2.5.11     	Helm chart for deploying a cluster of Timeplus ...
timeplus/timeplus-enterprise	v3.0.7       	2.4.23     	Helm chart for deploying a cluster of Timeplus ...
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
  storage:
    stream:
      className: <Your storage class name>
      size: 100Gi
    history:
      className: <Your storage class name>
      size: 100Gi
  defaultAdminPassword: timeplusd@t+
  resources:
    limits:
      cpu: "32"
      memory: "60Gi"
    requests:
      cpu: "2"
      memory: 4Gi
```
Then make changes to better fit your need.
1. Update the storage class name and size accordingly. You can check available storage class on your cluster by running `kubectl get storageclass`. If you have enabled storage dynamic provisioning, you may want to set both `timeplusd.storage.stream.selector` and `timeplusd.storage.history.selector` to `null`
2. Update `defaultAdminPassword`. This is the password for the default admin user `proton`, which is used internally in the system.
3. Review and update the `replicas`. Set it to `3` to setup a cluster with 3 timeplusd nodes. Set it to `1` to setup a single node for testing or small workload.
4. Update the `resources` and make sure your cluster has enough CPU and memory to run the stack. By default each `timeplusd` pod requires 2 cores and 4GB memory. However, you'd better to have at least 8 cores and 20Gi memory for each node to make sure Timeplus Enteprise works well under small to medium workload.
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
You can run `kubectl -n timeplus get jobs` to check whether `timeplus-provision` is completed or not. Once this job is completed, you can start use Timeplus Enterprise.
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

The above quick start guide assume there is network access to the dockerhub to pull all required images. In case there is no access to the dockerhub, user need import required images into kubernetes cluster first. You can run
1. Run `helm template -f ./values.yaml timeplus/timeplus-enterprise | grep image: | cut -d ":" -f2,3 | sort | uniq | sed 's/"//g'` to list all required images.
2. Use `docker save` to save the images locally. Please refer to https://docs.docker.com/reference/cli/docker/image/save/.
3. Upload the images to your k8s image registry.

Note, you may need update the `imageRegistry` in `values.yaml` to point to your own k8s registry.

### Uninstall and cleanup

To uninstall the helm release, just run `helm -n $NS uninstall $RELEASE` to uninstall it.

Please note, by default, all the PVCs will not be deleted. You can use `kubectl get pvc -n $NS` and `kubectl delete pvc <pvc_name> -n $NS` to manually delete them.

You can run `kubectl delete namespace $NS` to delete all PVCs and the namespace.

## Go Production

### Planning capacity

This section provides recommendations for sizing your Timeplus Enterprise deployment. The actual resource requirements may vary based on your specific use case and workload.

The timeplusd component is the core of the Timeplus Enterprise stack. It requires significant CPU and memory resources to handle data processing and queries. It is highly recommended to run `timeplusd` dedicatedly on the node.

For small to medium-sized deployement, you may consider the following cluster configuration as the start point

- 3 nodes with:
  - 16 cores each
  - 32 Gi memory each
  - 500Gi storage with iops > 3000 each

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

### Upgrade Timeplus Enterprise

Please check the [release notes](/enterprise-releases) to confirm the target version of Timeplus Enterprise can be upgraded in-place, by reusing the current data and configuration. For example [2.3](/enterprise-v2.3) and [2.4](/enterprise-releases) are incompatible and you have to use migration tools.

If you confirm you can upgrade to the new version, you can run the following commands to upgrade to the latest version:

```bash
helm repo update
helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise
```

You can also check the available versions and upgrade to a specific version:

```bash
helm repo update
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

### Troubleshooting

If something goes wrong, you can run the following commands to get more information.

1. `kubectl get pods -n $NS`: Make sure all pods are in `Running` status and the `READY` is `1/1`.
2. `kubectl logs <pod> -n $NS`: Try to check the logs of each pod to make sure there is no obvious errors.
3. Run `kubectl cluster-info dump -n $NS` to dump all the information and send it to us.

## Configuration Guide

You may want to customize the configurations of Timeplus Appserver or Timeplusd. Here is a quick example of how to modify the `values.yaml`. For the list of available configuration items, please refer to the docs of [Timeplus Appserver](https://docs.timeplus.com/server_config#appserver) and [Timeplusd](https://docs.timeplus.com/server_config#timeplusd).

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
- `imageRegistry`: Defaulted to the official dockerhub (`docker.io`).
- `imagePullPolicy`: Defaulted to `IfNotPresent`.
- `resources`: [Resource](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) property. Defaulted to `null` except for `timeplusd` component. Please refer to `timeplusd` section to find out the default value.
- `labels`: Extra labels that applied to Pod/Deploy/Sts. Defaulted to `null`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| global.affinity | object | `{}` | This is the global affinity settings. Once set, it will be applied to every single component. If you'd like to set affinity for each component, you can set `affinity` under component name. For example you can use `timeplusd.affinity` to control the affinity of timeplusd Refer to https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/ |
| global.imagePullPolicy | string | `"IfNotPresent"` | This setting is available for each component as well. |
| global.imageRegistry | string | `""` | This setting is available for each component as well. |
| global.nodeSelector | object | `{}` | See https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector |
| global.pvcDeleteOnStsDelete | bool | `false` | Only valid with k8s >= 1.27.0. Ref: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention |
| global.pvcDeleteOnStsScale | bool | `false` | Only valid with k8s >= 1.27.0. Ref: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention |
| global.tolerations | list | `[]` | See https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| ingress.domain | string | `nil` | If you want use an ip, please remove it. it's will match all (equal *). |
| ingress.enabled | bool | `false` | You will need to manually create ingress if you don't want to enable it here. |
| provision.dashboards | bool | `true` | Monitoring dashboards |
| provision.enabled | bool | `true` | Provision job will ONLY be run once after the first installation if it is enabled. A Job will be created to provision default resources such as users, licenses, and etc. This Job shares the same configurations (e.g. resource limit) as `timeplusCli` below. Disable it during installation and re-enable it later won't work. |
| timeplusAppserver.configs | object | `{}` | Configurations for appserver. e.g. `enable-authentication: true`. See https://docs.timeplus.com/server_config#appserver |
| timeplusAppserver.enabled | bool | `true` | Timeplus web, Timeplus connector will not work properly if Timeplus appserver is not enabled. |
| timeplusAppserver.extraContainers | list | `[]` | Extra containers that to be run together with the main container. |
| timeplusAppserver.extraVolumes | list | `[]` | Extra volumes that to be mounted |
| timeplusAppserver.image | string | `"timeplus/timeplus-appserver"` |  |
| timeplusCli.enabled | bool | `false` |  |
| timeplusCli.image | string | `"timeplus/timeplus-cli"` |  |
| timeplusConnector.enabled | bool | `true` |  |
| timeplusConnector.extraContainers | list | `[]` | Extra containers that to be run together with the main container. |
| timeplusConnector.extraVolumes | list | `[]` | Extra volumes that to be mounted |
| timeplusConnector.image | string | `"timeplus/timeplus-connector"` |  |
| timeplusWeb.enabled | bool | `true` |  |
| timeplusWeb.image | string | `"timeplus/timeplus-web"` |  |
| timeplusd.config | object | `{}` | Configurations for timeplusd. See https://docs.timeplus.com/server_config#timeplusd |
| timeplusd.defaultAdminPassword | string | `"timeplusd@t+"` | Timeplus appserver will use this username and password to connect to timeplusd to perform some administration operations such as user management. |
| timeplusd.enabled | bool | `true` |  |
| timeplusd.extraContainers | list | `[]` | Extra containers that to be run together with the main container. |
| timeplusd.extraInitContainers | list | `[]` | Extra init containers. It will be run before other init containers. |
| timeplusd.extraVolumes | list | `[]` | Extra volumes that to be mounted |
| timeplusd.image | string | `"timeplus/timeplusd"` |  |
| timeplusd.ingress.enabled | bool | `false` | To send REST API call to timeplusd, the URL will be http(s)://\<publicDomain>:\<port>\<restPath> e.g.   - curl http://timeplus.local/timeplusd/info   - curl http://timeplus.local/timeplusd/v1/ddl/streams |
| timeplusd.initJob.image | string | `"timeplus/boson"` |  |
| timeplusd.livenessProbe | object | `{"failureThreshold":20,"httpGet":{"path":"/timeplusd/ping","port":"http-streaming","scheme":"HTTP"},"initialDelaySeconds":30,"periodSeconds":30,"successThreshold":1,"timeoutSeconds":1}` | K8s liveness probe for timeplusd. Please refer to https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| timeplusd.replicas | int | `3` | Current only support replicas 1 or 3 |
| timeplusd.resources | object | `{"limits":{"cpu":"32","memory":"60Gi"},"requests":{"cpu":"2","memory":"4Gi"}}` | Make sure at least 2 cores are assigned to each timeplusd |
| timeplusd.service.nodePort | int | `30863` |  |
| timeplusd.service.type | string | `"ClusterIP"` | Update type to `NodePort` if you want to access timeplusd directly (rest API, metrics, and etc.) |
| timeplusd.storage.history | object | `{"className":"local-storage","selector":{"matchLabels":{"app":"timeplusd-data-history"}},"size":"10Gi"}` | PV settings for historical storage. |
| timeplusd.storage.log | object | `{"className":"local-storage","enabled":false,"selector":{"matchLabels":{"app":"timeplusd-log"}},"size":"10Gi"}` | PV settings for logs. It is disabled by default so you don't need a separate PV for it. |
| timeplusd.storage.stream | object | `{"className":"local-storage","selector":{"matchLabels":{"app":"timeplusd-data-stream"}},"size":"10Gi"}` | PV settings for streaming storage. |
