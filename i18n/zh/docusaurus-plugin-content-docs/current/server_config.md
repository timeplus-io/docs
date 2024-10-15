# 服务器配置

当您在自托管环境中运行 Timeplus Enterprise 时，默认设置旨在轻松实现最佳性能以适应常见用例。 可以通过修改配置文件或通过 Web 控制台来配置服务器。

## 用户管理 {#users}

For single node deployments, when you launch the web console of Timeplus Enterprise for the first time, you will be prompted to create a new account with password.

For multi-node clusters deployed via [Helm Chart](/k8s-helm), please set the system account and user accounts in the values.yaml. The system account is created automatically for internal components to communicate to each other. The username is `proton`, with the password defaulting to `timeplusd@t+`.

To edit or add new users, you can use the [timeplus user](/cli-user) CLI or container, which supports bare metal and Kubernetes, both single node and multi-node.

## 许可证管理{#license}

您的 30 天免费试用期从您启动 Timeplus 企业版并首次访问网络控制台时开始。 当您的免费试用期结束时，Timeplus 企业版将停止运行。

您可以[联系我们](mailto:support@timeplus.com)购买许可，然后上传到 web 控制台。 点击左侧导航菜单中的_工作空间设置_，然后选择_许可证_选项卡。 复制并粘贴许可证文件或上传该文件。

![添加许可证](/img/add_license.png)

你也可以在 Timeplus 企业版运行时通过运行以下命令来导入许可。

```
。/bin/timeplus 许可证导入-h license_key-h license_filepath
```

## 启用 HTTPS {#https}

默认情况下，Timeplus Enterprise 网络控制台在 8000 上运行，使用HTTP 端口。 如果你需要开启自签名或 CA 签名的 HTTPS，你可以按如下方式编辑 conf/timeplus_appserver.yaml：

```yaml
server-port: 8443
tls: true
cert: ../cert/ca.crt
key: ../cert/ca.key
```

要创建自签名证书，你可以关注 [此文档](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/securing_networks/creating-and-managing-tls-keys-and-certificates_securing-networks) 并将证书文件放在 `timeplus/cert`文件夹下。

配置更改后停止并重启 Timeplus。

## 作为系统服务运行 {#service}

要将Timeplus Enterprise作为服务运行，你需要一个支持 “systemd” 的操作系统。

要将其安装为 systemd 服务，请运行 `sudo。/bin/timeplus 服务启用-u 用户-g user_group`。

备注：

1. Root privilege is required to enable the service
2. 使用相同的用户/用户组解压缩 Timeplus 安装包
3. 这个命令会在 `/etc/systemd/system/timeplus.service`中添加一个服务。 成功安装后，它将启用并启动该服务。 稍后你可以使用 systemctl 命令来管理该服务。

## Timeplus Appserver configurations {#appserver}

```yaml
# The maximum number of tcp connections to timeplusd in the idle connection pool
timeplusd-max-idle-conns: 10

# The maximum interval (in millisecond) between two flushes to the query SSE channel.
query-buffer-interval: 100

# The maximum number of rows buffered in memory before flushing to the query SSE channel.
query-buffer-max: 100

# If disabled, you will not be required to login appserver. Appserver will always behaviour as the timeplusd user configured in `appserver-user-timeplusd-username`
enable-authentication: true

# Required only if `enable-authentication` is set to be `false`.
appserver-user-timeplusd-username: "default"

# Required only if `enable-authentication` is set to be `false`.
appserver-user-timeplusd-password: ""
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
