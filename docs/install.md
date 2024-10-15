# Install

## Timeplus Enterprise in the cloud{#cloud}

The quickest and easiest way to get started with Timeplus is to sign up a free account on our fully-managed platform at [us-west-2.timeplus.cloud](https://us-west-2.timeplus.cloud).

Simply sign up with Google or Microsoft Single Sign-On, or create a username and password. Next, create a new workspace and start your streaming analytics journey.

## Timeplus Enterprise self-hosted{#self-hosted}

Install Timeplus Enterprise with high availability and scalability in your own data center or cloud account, using the [bare metal installer](/singlenode_install#bare_metal) or the official Timeplus [Kubernetes Helm Chart](/cluster_install#k8s).

## Timeplus Proton, the core engine{#proton}

### As a single binary{#binary}

```shell
curl https://install.timeplus.com/oss | sh
```

Once the `proton` binary is available, you can run Timeplus Proton in different modes:

- **Local Mode.** You run `proton local` to start it for fast processing on local and remote files using SQL without having to install a full server
- **Config-less Mode.** You run `proton server` to start the server and put the config/logs/data in the current folder `proton-data`. Then use `proton client` in the other terminal to start the SQL client.
- **Server Mode.** You run `sudo proton install` to install the server in predefined path and a default configuration file. Then you can run `sudo proton server -C /etc/proton-server/config.yaml` to start the server and use `proton client` in the other terminal to start the SQL client.

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew install timeplus-io/timeplus/proton
```

### As a Docker container{#docker}

```bash
docker run -d --pull always -p 8123:8123 -p 8463:8463 --name proton d.timeplus.com/timeplus-io/proton:latest
```
Please check [Server Ports](/proton-ports) to determine which ports to expose, so that other tools can connect to Timeplus, such as DBeaver.

### Docker Compose {#compose}

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

### Kubernetes

Running the single node Proton via Kubernetes is possible. We recommend you [contact us](mailto:support@timeplus.com) to deploy Timeplus Enterprise for on-prem deployment.
