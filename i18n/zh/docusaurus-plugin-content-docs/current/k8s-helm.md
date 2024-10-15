import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deploy on Kubernetes with Helm

You can deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

## 先决条件

- 确保你的环境中安装了 Helm 3.12+。 有关如何安装 Helm 的详细信息，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
- 确保你的环境中安装了 [Kubernetes](https://kubernetes.io/) 1.25 或更高版本。 We tested our software and installation process on Amazon EKS, minikube and k3s. Other Kubernetes distributions should work in the similar way.
- 确保为部署分配了足够的资源. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. You'd better assign the node with at least 8 cores and 16GB memory.
- Network access to Docker Hub

## Quickstart with minikube or kind

This is the quickstart guide to install a 3 nodes Timeplus Enterprise cluster with default configurations on [minikube](https://github.com/kubernetes/minikube) or [kind](https://kind.sigs.k8s.io/) using Helm package manager.

Although this guidance is focus on minikube or kind, you should be able to install it on other Kubernetes, such as Amazon EKS or your own Kubernetes cluster as well. You may need to update configurations accordingly to fit your Kubernetes environment. Please refer to [Configuration Guide](#configuration-guide) for available `values` of the chart.

### Get minikube or kind ready

<Tabs defaultValue="minikube">
<TabItem value="minikube" label="minikube" default>
Please follow https://minikube.sigs.k8s.io/docs/start/ to get the minikube ready. For Mac users, you may get it via:
```bash
brew install minikube
minikube start
```
</TabItem>
<TabItem value="kind" label="kind" default>
Please follow https://kind.sigs.k8s.io/ to get the kind ready. For Mac users, you may get it via:
```bash
brew install kind
kind create cluster
```
</TabItem>
</Tabs>

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
timeplus/timeplus-enterprise	v3.0.3       	2.4.25     	Helm chart for deploying a cluster of Timeplus ...
timeplus/timeplus-enterprise	v3.0.2       	2.4.18     	Helm chart for deploying a cluster of Timeplus ...
```

Please choose the latest `CHART VERSION`. Staring from v3.0.0 chart version, the `APP VERSION` is the same version as [Timeplus Enterprise](/enterprise-releases).

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
  # -- Current only support replicas 1 or 3
  replicas: 3
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
```

Then make changes to better fit your need.

1. Update the storage class name and size accordingly. You can check available storage classes on your cluster by running `kubectl get storageclass`. Common values are `local`, `standard`, `ebs-gp3-basic-auto-delete`, `ebs-gp3-basic-encrypted`, etc.
2. Update the username and password of the `provision.users`. You will be able to login to Timeplus web with those users. See [User management](#user-management) section for advanced user management.
3. Update `defaultAdminPassword`. This is the password for the default admin user `proton`, which is used internally in the system.
4. Review and update the `replicas`. Set it to `3` to setup a cluster with 3 timeplusd nodes. Set it to `1` to setup a single node for testing or small workload.
5. Update the `resources` and make sure your cluster has enough CPU and memory to run the stack. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. You'd better assign the node with at least 8 cpu and 16GB memory.
6. Optionally refer to [Configuration Guide](#configuration-guide) and add other configurations.

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
timeplus-appserver-75dff8f964-g4fl9   1/1     Running   0          118s
timeplus-connector-7c85b7c9c9-gwdtn   1/1     Running   0          118s
timeplus-provision-pqdjj              0/1     Completed 0          118s
timeplus-web-58bcb4f486-s8wmx         1/1     Running   0          118s
timeplusd-0                           1/1     Running   0          118s
timeplusd-1                           1/1     Running   0          118s
timeplusd-2                           1/1     Running   0          118s
```

If all the pods status are in `Running` status, except `timplus-provision-..`, then the stack is ready to access. If some pods cannot turn to `Running` status, you can run `kubectl describe pod <pod_name> -n $NS` to get more information.

### Expose the Timeplus Console

There are different ways to expose the services of Timeplus stack. In this step, we use port forward of kubectl to get a quick access. Run `kubectl port-forward svc/timeplus-appserver 8000:8000 -n $NS --address 0.0.0.0` and then open the address `http://localhost:8000` in your browser to visit Timeplus Console web UI. After finishing the onboarding, you should be able to login with the username and password which you set in `additionalUsers`.

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

### Uninstall and cleanup

To uninstall the helm release, just run `helm -n $NS uninstall $RELEASE` to uninstall it.

Please note, by default, all the PVCs will not be deleted. You can use `kubectl get pvc -n $NS` and `kubectl delete pvc <pvc_name> -n $NS` to manually delete them.

You can run `kubectl delete namespace $NS` to delete all PVCs and the namespace.

## Operations

### User management

Currently Timeplus web doesn't support user management yet. You will need to deploy the `timeplus cli` pod to run `timeplus cli` to manage users. In order to do so, please add the following section to `values.yaml `:

```yaml
timeplusCli:
  enabled: true
```

Then upgrade the helm chart via:

```bash
helm -n $NS upgrade -f values.yaml $RELEASE timeplus/timeplus-enterprise
```

Once `timeplus-cli` pod is up and running, you can run `kubectl exec -n $NS -it timeplus-cli -- /bin/bash` to run commands in the pod. Please refer to the following commands to do the user management. Make sure you update the command accordingly to your own deployment.

```bash
# Get the IP of timeplusd pods
export TIMEPLUSD_POD_IPS=timeplusd-0.timeplusd-svc.timeplus.svc.cluster.local:8463

# List users
timeplus user list --address ${TIMEPLUSD_POD_IPS} --admin-password timeplusd@t+

# Create an user with username "hello" and password "word"
timeplus user create --address ${TIMEPLUSD_POD_IPS} --admin-password timeplusd@t+ --user hello --password world

# Delete the user "hello"
timeplus user delete --address ${TIMEPLUSD_POD_IPS} --admin-password timeplusd@t+ --user hello
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
