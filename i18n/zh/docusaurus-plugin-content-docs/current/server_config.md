# 服务器配置

当您在自托管环境中运行 Timeplus Enterprise 时，默认设置旨在轻松实现最佳性能以适应常见用例。 The server can be configured either by modifying the configuration file or via the web console.

## 用户管理 {#users}

默认情况下，系统将自动创建系统帐户以执行系统级操作，例如管理用户帐户和读取/写入指标。 The username is `proton`, with the password defaulting to `timeplus@t+`. 当你运行 `timeplus start` 时，通过设置 `--password` 标志可以覆盖这个密码。

When you launch the web console of Timeplus Enterprise for the first time, you will be prompted to create a new account with password.

要编辑或添加新用户，你可以编辑 conf/users.yaml，然后重新启动服务器。 A web UI for managing users will be provided soon.

## 许可证管理{#license}

Your 30-day free trial starts when you start Timeplus Enterprise and access the web console for the first time. When your free trial ends, Timeplus Enterprise will stop working.

You can [contact us](mailto:support@timeplus.com) to purchase a license, then upload it in the web console. Click _Workspace Settings_ in the left navigation menu and choose the _License_ tab. 复制并粘贴许可证文件或上传该文件。

![添加许可证](/img/add_license.png)

你也可以在 Timeplus 企业版运行时通过运行以下命令来导入许可。

```
。/bin/timeplus 许可证导入-h license_key-h license_filepath
```

## 启用 HTTPS {#https}

By default, Timeplus Enterprise web console is running on 8000, on a plain HTTP port. 如果你需要开启自签名或 CA 签名的 HTTPS，你可以按如下方式编辑 conf/timeplus_appserver.yaml：

```yaml
服务器端口：8443
tls：true
cert:../cert/ca.crt
密钥:../cert/ca.key
```

To create a self-signed certificate, follow [this doc](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/securing_networks/creating-and-managing-tls-keys-and-certificates_securing-networks) and put the certificate files in the `timeplus/cert` folder.

Stop and restart Timeplus after the configuration change.

## 作为系统服务运行 {#service}

要将Timeplus Enterprise作为服务运行，你需要一个支持 “systemd” 的操作系统。

要将其安装为 systemd 服务，请运行 `sudo。/bin/timeplus 服务启用-u 用户-g user_group`。

备注：

1. Root privilage is required to enable the service
2. 使用相同的用户/用户组解压缩 Timeplus 安装包
3. 这个命令会在 `/etc/systemd/system/timeplus.service`中添加一个服务。 成功安装后，它将启用并启动该服务。 稍后你可以使用 systemctl 命令来管理该服务。
