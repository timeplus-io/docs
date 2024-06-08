# 服务器配置

当您在自托管环境中运行 Timeplus Enterprise 时，默认设置旨在轻松实现最佳性能以适应常见用例。 可以通过修改配置文件或通过 Web 控制台来配置服务器。

## 用户管理 {#users}

默认情况下，系统将自动创建系统帐户以执行系统级操作，例如管理用户帐户和读取/写入指标。 用户名是 `proton`，密码默认为 `timeplus @t +`。 当你运行 `timeplus start` 时，通过设置 `--password` 标志可以覆盖这个密码。

当你首次启动Timeplus Enterprise的网络控制台时，系统将提示你使用密码创建新用户。

要编辑或添加新用户，你可以编辑 conf/users.yaml，然后重新启动服务器。 Web 用户界面将很快提供。

## 许可证管理{#license}

当你启动Timeplus Enterprise并首次访问网络控制台时，30天的免费试用开始。 当它结束时，软件将停止运行。

你可以 [联系我们]（邮箱：support@timeplus.com）购买许可证，然后上传到 Web 控制台。 点击左下角的_工作空间设置_，然后选择_许可证_选项卡。 复制并粘贴许可证文件或上传该文件。

![添加许可证] (/img/add_license.png)

你也可以在 Timeplus 企业版运行时通过运行以下命令来导入许可。

```
。/bin/timeplus 许可证导入-h license_key-h license_filepath
```

## 启用 HTTPS {#https}

默认情况下，Timeplus Enterprise 网络控制台在普通 HTTP 端口上监听 8000。 如果你需要开启自签名或 CA 签名的 HTTPS，你可以按如下方式编辑 conf/timeplus_appserver.yaml：

```yaml
服务器端口：8443
tls：true
cert:../cert/ca.crt
密钥:../cert/ca.key
```

要创建自签名证书，你可以关注 [此文档] (https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/securing_networks/creating-and-managing-tls-keys-and-certificates_securing-networks) 并将证书文件放在 `timeplus/cert`文件夹下。

配置更改后停止并启动 timeplus 服务。

## 作为系统服务运行 {#service}

要将Timeplus Enterprise作为服务运行，你需要一个支持 “systemd” 的操作系统。

要将其安装为 systemd 服务，请运行 `sudo。/bin/timeplus 服务启用-u 用户-g user_group`。

备注：

1. 需要根权限才能启用该服务。
2. 使用相同的用户/用户组解压缩 Timeplus 安装包
3. 这个命令会在 `/etc/systemd/system/timeplus.service`中添加一个服务。 成功安装后，它将启用并启动该服务。 稍后你可以使用 systemctl 命令来管理该服务。
