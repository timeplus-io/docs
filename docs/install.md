# Install

## Timeplus Enterprise in the cloud{#timeplus-cloud}

The quickest and easiest way to get started with Timeplus to sign up a free account at the fully-managed [us.timeplus.cloud](https://us.timeplus.cloud).

You just need to sign up with Google or Microsoft Single Sign-On, or create a new username and password. Then create a new workspace and start your streaming journey.

## Timeplus Enterprise on-prem{#timeplus-self-hosted}

Customers can install Timeplus Enterprise with high availability and scalability using bare metal installer or the official Timeplus Kubernetes Helm Chart. [Contact us](mailto:info@timeplus.com) to learn more.

## Timeplus Proton, the core engine{#proton}

### As a single binary{#binary}

```shell
curl https://install.timeplus.com/oss | sh
```

Once the `proton` binary is available, you can run Timeplus Proton in different modes:

- **Local Mode.** You run `proton local` to start it for fast processing on local and remote files using SQL without having to install a full server
- **Config-less Mode.** You run `proton server` to start the server and put the config/logs/data in the current folder. Then use `proton client -h 127.0.0.1` in the other terminal to start the SQL client.
- **Server Mode.** You run `sudo proton install` to install the server in predefined path and a default configuration file. Then you can run `sudo proton server -C/etc/proton-server/config.yaml` to start the server and use `proton client` in the other terminal to start the SQL client.

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

### As a Docker container{#docker}

```bash
docker run -d --pull always --name proton ghcr.io/timeplus-io/proton:latest
```

In case you cannot access ghcr, you can pull the image from `public.ecr.aws/timeplus/proton`

You may need to expose ports from the Proton container so that other tools can connect to it, such as DBeaver. Please check [Server Ports](proton-ports) for each port to expose. For example:

```shell
docker run -d --pull always -p 8123:8123 -p 8463:8463 --name proton ghcr.io/timeplus-io/proton:latest
```

### Docker Compose {#compose}

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

### Kubernetes

Running the single node Proton via Kubernetes is possible. We recommend you contact us to deploy Timeplus Enterprise for on-prem deployment.
