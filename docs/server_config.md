# Server Configuration

When you run Timeplus Enterprise in a self-hosted environment, the default settings are designed to accommodate common use cases with ease and optimal performance. The server can be configured via the web console, or via Kubernetes Helm chart.

:::info For Kubernetes Deployment
After the installation, you can further customize the configuration by updating the `values.yaml`. Please refer to [Configuration Guide](/k8s-helm#configuration-guide). Once the `values.yaml` is ready, apply this via:

```bash
export RELEASE=timeplus
helm -n $NS upgrade -f values.yaml $RELEASE timeplus/timeplus-enterprise
```
:::

## User Management {#users}

For single node deployments, when you launch the web console of Timeplus Enterprise for the first time, you will be prompted to create a new account with password.

For multi-node clusters deployed via [Helm Chart](/k8s-helm), please set the system account and user accounts in the values.yaml. The system account is created automatically for internal components to communicate to each other. The username is `proton`, with the password defaulting to `timeplusd@t+`.

To edit or add new users, you can use the [timeplus user](/cli-user) CLI or container, which supports bare metal and Kubernetes, both single node and multi-node.

## License Management{#license}

Your 30-day free trial starts when you start Timeplus Enterprise and access the web console for the first time. When your free trial ends, Timeplus Enterprise will stop working.

You can [contact us](mailto:support@timeplus.com) to purchase a license, then upload it in the web console. Click *Workspace Settings* in the left navigation menu and choose the *License* tab. Copy and paste the license file or upload the file.

![Add license](/img/add_license.png)

You can also import a license by running the following command when Timeplus Enterprise is running.

```
./bin/timeplus license import -h license_key -h license_filepath
```

## Enable HTTPS {#https}

By default, Timeplus Enterprise web console is running on 8000, on a plain HTTP port. If you need to turn on self-signed or CA-signed HTTPS, you can edit conf/timeplus_appserver.yaml as follows:

```yaml
server-port: 8443
tls: true
cert: ../cert/ca.crt
key: ../cert/ca.key
```

To create a self-signed certificate, follow [this doc](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/securing_networks/creating-and-managing-tls-keys-and-certificates_securing-networks) and put the certificate files in the `timeplus/cert` folder.

Stop and restart Timeplus after the configuration change.

## Run as a system service {#service}

To run Timeplus Enterprise as a service, you need a OS that supports `systemd`.

To install it as a systemd service, run `sudo ./bin/timeplus service enable -u user -g user_group`.

Note:

1. Root privilege is required to enable the service
2. Use the same user/user_group for uncompressing the Timeplus installation package
3. This command will add a service into `/etc/systemd/system/timeplus.service`. When it is successfully installed, it will enable and start the service. Later on you can use `systemctl` command to manage the service.

## Timeplus Appserver configurations {#appserver}

Timeplus Appserver read configurations from configuration file (.yaml) and environment variables. The default values listed below are the default values that hardcoded inside the binary file. The actual default value may be different depends on your deployement (bare-metal or k8s via helm)

```yaml
# IP interface and port the server should bind to
server-addr: "0.0.0.0"
server-port: 8000

# IP interface and port the server should bind to for serving internal APIs, by default it uses the preferred outbound IP address on the machine. For best practice use an internal IP and never use 0.0.0.0"
# Timeplus Connector talks to Timeplus Appserver via internal endpoint. Make sure you also update `NEUTRON_ADDRESS` from Timeplus Connector side
server-internal-addr:
server-internal-port: 8081

# To enable TLS, please refer to the Enable HTTPS section
tls: false

# Level of log, support panic|fatal|error|warn|info|debug|trace
log-level: info

# The address of the Timeplus connector endpoint
connector-addr: "orbit.tp-tenant-{{ .workspace_id }}:4196"

# The maximum interval (in millisecond) between two flushes to the query SSE channel.
query-buffer-interval: 100

# The maximum number of rows buffered in memory before flushing to the query SSE channel.
query-buffer-max: 100

# Whether to enable authentication
enable-authentication: false

# Whether to enable authorization
enable-authorization: false
```

## Timeplus Connector configurations {#connector}

Timeplus Connector read configurations from environment variables. The default values listed below are the default values that hardcoded inside the binary file. The actual default value may be different depends on your deployement (bare-metal or k8s via helm)

```bash
# Address of Timeplus Appserver's internal endpoint
export NEUTRON_ADDRESS="localhost:8081"

# Hostname and port that Timeplus Connector server bind to. Notice that Timeplus Connector starts the benthos server that listen to port TIMEPLUS_CONNECTOR_PORT-1 (by default 4195). However, this port is not supposed to be called by anyone else.
# Timeplus Appserver submits sources and sinks to Timeplus Connector via this endpoint. Make sure you also update `connector-addr` from Timeplus Appserver side
export TIMEPLUS_CONNECTOR_HOST="0.0.0.0"
export TIMEPLUS_CONNECTOR_PORT=4196
```

## Timeplusd configurations {#timeplusd}

```yaml
logger:
  # Possible levels [1]:
  # - none (turns off logging)
  # - fatal
  # - critical
  # - error
  # - warning
  # - notice
  # - information
  # - debug
  # - trace
  level: information

# Maximum number of concurrent queries.
max_concurrent_queries: 100
# Maximum number of concurrent insert queries.
max_concurrent_insert_queries: 100
# Maximum number of concurrent select queries.
max_concurrent_select_queries: 100
```
