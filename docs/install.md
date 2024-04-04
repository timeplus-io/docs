# Install

### A single binary:

```shell
curl https://install.timeplus.com | sh
```

For Mac users, you can also use [Homebrew](https://brew.sh/) to manage the install/upgrade/uninstall:

```shell
brew tap timeplus-io/timeplus
brew install proton
```

### Docker:

```bash
docker run -d --pull always --name proton ghcr.io/timeplus-io/proton:latest
```

In case you cannot access ghcr, you can pull the image from `public.ecr.aws/timeplus/proton`

### Docker Compose:

The [Docker Compose stack](https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce) demonstrates how to read/write data in Kafka/Redpanda with external streams.

### Timeplus Cloud:

One step to try Proton in [Timeplus Cloud](https://us.timeplus.cloud/)
