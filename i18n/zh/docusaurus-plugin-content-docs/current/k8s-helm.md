# Deploy on Kubernetes with Helm

You can deploy Timeplus Enterprise on a Kubernetes cluster with [Helm](https://helm.sh/).

## 先决条件

- Ensure you have Helm 3.12 + installed in your environment. 有关如何安装 Helm 的详细信息，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
- Ensure you have [Kubernetes](https://kubernetes.io/) 1.25 or higher installed in your environment
- Ensure you have allocated enough resources for the deployment. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. You'd better assign the node with at least 8 cores and 16GB memory.
- Network access to Docker Hub

## Quickstart with minikube

This is the quickstart guide to install a 3 nodes Timeplus Enterprise cluster with default configurations on [minikube](https://github.com/kubernetes/minikube) using Helm package manager.

Although this guidance is focus on minikube, you should be able to install it on other k8s such as Amazon EKS or your own k8s cluster as well. You may need to update configurations accordingly to fit your k8s enviroment. Please refer to [Configuration Guide](#configuration-guide) for available `values` of the chart.

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
 helm search repo timeplus
```

A sample output would be:

```bash
NAME                            CHART VERSION   APP VERSION     DESCRIPTION
timeplus/timeplus-enterprise	v2.3.2       	2.2.5      	A Helm chart for deploying a Timeplus enterpris...
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
  additionalUsers:
    - username: timeplus_user
      password: changeme
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
2. Update the username and password of the `additionalUsers`. You will be able to login to Timeplus web with those users. See [User management](#user-management) section for advanced user management.
3. Update the `resources` and make sure your cluster has enough CPU and memory to run the stack. For a 3-nodes cluster deployment, by default each `timeplusd` requires 2 cores and 4GB memory. You'd better assign the node with at least 8 cores and 16GB memory.
4. Optionally refer to [Configuration Guide](#configuration-guide) and add other configurations.

### Install Helm chart

In this step, we install the helm chart using release name `timeplus`.

```bash
export RELEASE=timeplus
helm -n $NS install -f values.yaml $RELEASE timeplus/timeplus-enterprise
```

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
| `ingress.enabled`                                    | Enable ingr                                                                                                |                               |
