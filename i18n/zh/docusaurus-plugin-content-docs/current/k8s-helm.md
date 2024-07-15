# Deploy on Kubernetes with Helm

You can deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

## 先决条件

- Ensure you have Helm 3.12 + installed in your environment. 有关如何安装 Helm 的详细信息，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
- Ensure you have [Kubernetes](https://kubernetes.io/) 1.25 or higher installed in your environment. We tested our software and installation process on Amazon EKS, minikube and k3s. Other Kubernetes distributions should work in the similar way.
- Ensure you have allocated enough resources for the deployment. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. You'd better assign the node with at least 8 cores and 16GB memory.
- Network access to Docker Hub

## Quickstart with minikube

This is the quickstart guide to install a 3 nodes Timeplus Enterprise cluster with default configurations on [minikube](https://github.com/kubernetes/minikube) using Helm package manager.

Although this guidance is focus on minikube, you should be able to install it on other k8s such as Amazon EKS or your own k8s cluster as well. You may need to update configurations accordingly to fit your k8s environment. Please refer to [Configuration Guide](#configuration-guide) for available `values` of the chart.

### Get minikube ready

Please follow https://minikube.sigs.k8s.io/docs/start/ to get the minikube ready. For Mac users, you may get it via:

```bash
brew install minikube
minikube start
```

### Add Timeplus Helm chart repository

Simply run the following commands to add the repo and list charts from the repo.

```bash
 helm repo add timeplus https://install.timeplus.com/charts
 helm repo update
 helm search repo timeplus
```

A sample output would be:

```bash
NAME                        	CHART VERSION	APP VERSION	DESCRIPTION
timeplus/timeplus-enterprise	v2.4.2       	2.3.7      	A Helm chart for deploying a cluster of Timeplus...
```

### Create Namespace

User can choose to install the Timeplus Enterprise into different namespace. In this guide, we use namespace name `timeplus`.

```bash
export NS=timeplus
kubectl create ns $NS
```

### Prepare the `values.yaml`

Copy and paste the following sample yaml file into `values.yaml`.

```yaml
provision:
  users:
    - username: timeplus_user
      password: changeme
timeplusd:
  storage:
    stream:
      className: <Your storage class name>
      size: 10Gi
      selector: null
    history:
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
      memory: 4Gi
kv:
  storage:
    className: <Your storage class name>
    size: 10Gi
    selector: null
```

Then make changes to better fit your need.

1. Update the storage class name and size accordingly. You can check available storage class on your cluster by running `kubectl get storageclass`.
2. Update the username and password of the `provision.users`. You will be able to login to Timeplus web with those users. See [User management](#user-management) section for advanced user management.
3. Update `defaultAdminPassword`. This is the password for the default admin user `proton`.
4. Update the `resources` and make sure your cluster has enough CPU and memory to run the stack. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. You'd better assign the node with at least 8 cores and 16GB memory.
5. Optionally refer to [Configuration Guide](#configuration-guide) and add other configurations.

### Install Helm chart

In this step, we install the helm chart using release name `timeplus`.

```bash
export RELEASE=timeplus
helm -n $NS install -f values.yaml $RELEASE timeplus/timeplus-enterprise
```

You can run `kubectl -n $NS get jobs` to check whether `timeplus-provision` is completed or not. Once this job is completed, you can start use Timeplus Enterprise.

It will take 1 or 2 minutes to start the whole stack, run following `kubectl get pods -n $NS` to check the stack status, for example:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
kv-0                                  1/1     Running   0          118s
timeplus-appserver-75dff8f964-g4fl9   1/1     Running   0          118s
timeplus-connector-7c85b7c9c9-gwdtn   1/1     Running   0          118s
timeplus-web-58bcb4f486-s8wmx         1/1     Running   0          118s
timeplusd-0                           1/1     Running   0          118s
timeplusd-1                           1/1     Running   0          118s
timeplusd-2                           1/1     Running   0          118s
```

If all the pods status are in `Running` status, then the stack is ready to access. If some pods cannot turn to `Running` status, you can run `kubectl describe pod <pod_name> -n $NS` to get more information.

### Expose the Timeplus Console

There are different ways to expose the services of Timeplus stack. In this step, we use port forward of kubectl to get a quick access. Run `kubectl port-forward svc/timeplus-appserver 8000:8000 -n $NS --address 0.0.0.0` and then open the address `http://localhost:8000` in your browser to visit Timeplus Console web UI. After finishing the onboarding, you should be able to login with the username and password which you set in `additionalUsers`.

### Uninstall and cleanup

To uninstall the helm release, just run `helm -n $NS uninstall $RELEASE` to uninstall it.

Please note, by default, all the PVCs will not be deleted. You can use `kubectl get pvc -n $NS` and `kubectl delete pvc <pvc_name> -n $NS` to manually delete them.

You can run `kubectl delete namespace $NS` to delete all PVCs and the namespace.

## Operations

### User management

Currently Timeplus web doesn't support user management yet. You will need to deploy the `timeplus cli` pod to run `timeplus cli` to manage users. In order to do so, please add the following section to `values.yaml ` and upgrade the helm chart.

```yaml
timeplusCli:
  enabled: true
```

Once `timeplus-cli` pod is up and running, you can run `kubectl exec -it timeplus-cli -- /bin/bash -n $NS` to run commands in the pod. Please refer to the following commands to do the user management. Make sure you update the command accordingly to your own deployment.

```bash
# Get the IP of timeplusd pods
export TIMEPLUSD_POD_IPS=$(kubectl get pods -n $NS -l app.kubernetes.io/component=timeplusd -o jsonpath='{.items[*].status.podIP}' | tr ' ' '\n' | sed "s/\$/:${TIMEPLUSD_TCP_PORT}/" | paste -sd ',' -)

# List users
timeplus user list --address ${TIMEPLUSD_POD_IPS}  --admin-password mypassword

# Create an user with username "hello" and password "word"
timeplus user create --address ${TIMEPLUSD_POD_IPS} --admin-password mypassword --user hello --password world

# Delete the user "hello"
timeplus user delete --address ${TIMEPLUSD_POD_IPS}  --admin-password mypassword --user hello
```

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

| Key                                                  | 描述                                                                                                         | Default Value                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **global**                                           |                                                                                                            |                               |
| `global.nodeSelector`                                | Node selector for scheduling pods                                                                          | `{}`                          |
| `global.tolerations`                                 | Tolerations for scheduling pods                                                                            | `[]`                          |
| `global.affinity`                                    | Affinity settings for scheduling pods                                                                      | `{}`                          |
| `global.imageRegistry`                               | Image registry for pulling images                                                                          | `""`                          |
| `global.imagePullPolicy`                             | Image pull policy                                                                                          | `"IfNotPresent"`              |
| `global.pvcDeleteOnStsDelete`                        | Delete PVCs when StatefulSet is deleted (K8s >= 1.27.0) | `false`                       |
| `global.pvcDeleteOnStsScale`                         | Delete PVCs when StatefulSet is scaled (K8s >= 1.27.0)  | `false`                       |
| **timeplus**                                         |                                                                                                            |                               |
| `timeplus.publicDomain`                              | Public domain or IP address of the cluster                                                                 | `timeplus.local`              |
| `timeplus.port`                                      | Port for accessing the service, should be quoted                                                           | `"80"`                        |
| **timeplusWeb**                                      |                                                                                                            |                               |
| `timeplusWeb.enabled`                                | Enable Timeplus Web service                                                                                | `true`                        |
| `timeplusWeb.imageRegistry`                          | Image registry for Timeplus Web                                                                            | `""`                          |
| `timeplusWeb.imagePullPolicy`                        | Image pull policy for Timeplus Web                                                                         | `"IfNotPresent"`              |
| `timeplusWeb.image`                                  | Image name for Timeplus Web                                                                                | `timeplus/timeplus-web`       |
| `timeplusWeb.tag`                                    | Image tag for Timeplus Web                                                                                 | `1.4.17`                      |
| `timeplusWeb.labels`                                 | Labels for Timeplus Web pods and deployment                                                                | `{}`                          |
| `timeplusWeb.affinity`                               | Affinity settings for Timeplus Web                                                                         | `{}`                          |
| `timeplusWeb.resources`                              | Resource requests and limits for Timeplus Web                                                              | `{}`                          |
| **timeplusAppserver**                                |                                                                                                            |                               |
| `timeplusAppserver.enabled`                          | Enable Timeplus Appserver                                                                                  | `true`                        |
| `timeplusAppserver.imageRegistry`                    | Image registry for Timeplus Appserver                                                                      | `""`                          |
| `timeplusAppserver.imagePullPolicy`                  | Image pull policy for Timeplus Appserver                                                                   | `"IfNotPresent"`              |
| `timeplusAppserver.image`                            | Image name for Timeplus Appserver                                                                          | `timeplus/timeplus-appserver` |
| `timeplusAppserver.tag`                              | Image tag for Timeplus Appserver                                                                           | `1.4.32`                      |
| `timeplusAppserver.labels`                           | Labels for Timeplus Appserver pods and deployment                                                          | `{}`                          |
| `timeplusAppserver.replicas`                         | Number of replicas for Timeplus Appserver                                                                  | `1`                           |
| `timeplusAppserver.configs`                          | Custom configurations for Timeplus Appserver                                                               | `{}`                          |
| `timeplusAppserver.affinity`                         | Affinity settings for Timeplus Appserver                                                                   | `{}`                          |
| `timeplusAppserver.resources`                        | Resource requests and limits for Timeplus Appserver                                                        | `{}`                          |
| **timeplusd**                                        |                                                                                                            |                               |
| `timeplusd.enabled`                                  | Enable Timeplus Daemon                                                                                     | `true`                        |
| `timeplusd.imageRegistry`                            | Image registry for Timeplus Daemon                                                                         | `""`                          |
| `timeplusd.imagePullPolicy`                          | Image pull policy for Timeplus Daemon                                                                      | `"IfNotPresent"`              |
| `timeplusd.image`                                    | Image name for Timeplus Daemon                                                                             | `timeplus/timeplusd`          |
| `timeplusd.tag`                                      | Image tag for Timeplus Daemon                                                                              | `2.2.7`                       |
| `timeplusd.labels`                                   | Labels for Timeplus Daemon pods and StatefulSet                                                            | `{}`                          |
| `timeplusd.replicas`                                 | Number of replicas for Timeplus Daemon                                                                     | `3`                           |
| `timeplusd.affinity`                                 | Affinity settings for Timeplus Daemon                                                                      | `{}`                          |
| `timeplusd.defaultAdminUsername`                     | Default admin username                                                                                     | `admin`                       |
| `timeplusd.defaultAdminPassword`                     | Default admin password                                                                                     | `timeplusd@t+`                |
| `timeplusd.initJob.imageRegistry`                    | Image registry for initialization job                                                                      | `""`                          |
| `timeplusd.initJob.imagePullPolicy`                  | Image pull policy for initialization job                                                                   | `"IfNotPresent"`              |
| `timeplusd.initJob.image`                            | Image name for initialization job                                                                          | `timeplus/boson`              |
| `timeplusd.initJob.tag`                              | Image tag for initialization job                                                                           | `0.0.2`                       |
| `timeplusd.initJob.resources`                        | Resource requests and limits for initialization job                                                        | `{}`                          |
| `timeplusd.ingress.enabled`                          | Enable ingress for Timeplus Daemon                                                                         | `false`                       |
| `timeplusd.ingress.restPath`                         | Path for REST API calls to Timeplus Daemon                                                                 | `"/timeplusd"`                |
| `timeplusd.service.type`                             | Service type for Timeplus Daemon                                                                           | `ClusterIP`                   |
| `timeplusd.storage.log.enabled`                      | Enable separate PV for logs                                                                                | `false`                       |
| `timeplusd.storage.log.className`                    | Storage class for logs                                                                                     | `local-storage`               |
| `timeplusd.storage.log.size`                         | Size of PV for logs                                                                                        | `10Gi`                        |
| `timeplusd.storage.log.selector.matchLabels.app`     | Selector labels for log PV                                                                                 | `timeplusd-log`               |
| `timeplusd.storage.stream.className`                 | Storage class for stream data                                                                              | `local-storage`               |
| `timeplusd.storage.stream.size`                      | Size of PV for stream data                                                                                 | `10Gi`                        |
| `timeplusd.storage.stream.selector.matchLabels.app`  | Selector labels for stream data PV                                                                         | `timeplusd-data-stream`       |
| `timeplusd.storage.history.className`                | Storage class for historical data                                                                          | `local-storage`               |
| `timeplusd.storage.history.size`                     | Size of PV for historical data                                                                             | `10Gi`                        |
| `timeplusd.storage.history.selector.matchLabels.app` | Selector labels for historical data PV                                                                     | `timeplusd-data-history`      |
| `timeplusd.resources.limits.cpu`                     | CPU limits for Timeplus Daemon                                                                             | `"32"`                        |
| `timeplusd.resources.limits.memory`                  | Memory limits for Timeplus Daemon                                                                          | `"60Gi"`                      |
| `timeplusd.resources.requests.cpu`                   | CPU requests for Timeplus Daemon                                                                           | `"2"`                         |
| `timeplusd.resources.requests.memory`                | Memory requests for Timeplus Daemon                                                                        | `4Gi`                         |
| `timeplusd.config`                                   | Custom configurations for Timeplus Daemon                                                                  | `{}`                          |
| `timeplusd.livenessProbe`                            | Liveness probe settings for Timeplus Daemon                                                                | See `values.yaml`             |
| **timeplusConnector**                                |                                                                                                            |                               |
| `timeplusConnector.enabled`                          | Enable Timeplus Connector                                                                                  | `true`                        |
| `timeplusConnector.imageRegistry`                    | Image registry for Timeplus Connector                                                                      | `""`                          |
| `timeplusConnector.imagePullPolicy`                  | Image pull policy for Timeplus Connector                                                                   | `"IfNotPresent"`              |
| `timeplusConnector.image`                            | Image name for Timeplus Connector                                                                          | `timeplus/timeplus-connector` |
| `timeplusConnector.tag`                              | Image tag for Timeplus Connector                                                                           | `1.5.3`                       |
| `timeplusConnector.labels`                           | Labels for Timeplus Connector pods and deployment                                                          | `{}`                          |
| `timeplusConnector.affinity`                         | Affinity settings for Timeplus Connector                                                                   | `{}`                          |
| `timeplusConnector.resources`                        | Resource requests and limits for Timeplus Connector                                                        | `{}`                          |
| **kv**                                               |                                                                                                            |                               |
| `kv.enabled`                                         | Enable KV service                                                                                          | `true`                        |
| `kv.imageRegistry`                                   | Image registry for KV service                                                                              | `""`                          |
| `kv.imagePullPolicy`                                 | Image pull policy for KV service                                                                           | `"IfNotPresent"`              |
| `kv.image`                                           | Image name for KV service                                                                                  | `timeplus/timeplusd`          |
| `kv.tag`                                             | Image tag for KV service                                                                                   | `2.2.7`                       |
| `kv.labels`                                          | Labels for KV service pods and StatefulSet                                                                 | `{}`                          |
| `kv.storage.className`                               | Storage class for KV service                                                                               | `local-storage`               |
| `kv.storage.size`                                    | Size of PV for KV service                                                                                  | `10Gi`                        |
| `kv.storage.selector.matchLabels.app`                | Selector labels for KV service PV                                                                          | `kv`                          |
| `kv.resources`                                       | Resource requests and limits for KV service                                                                | `{}`                          |
| `kv.affinity`                                        | Affinity settings for KV service                                                                           | `{}`                          |
| **ingress**                                          |                                                                                                            |                               |
| `ingress.enabled`                                    | Enable ingress                                                                                             |                               |
