# API 密钥

The [REST API](https://docs.timeplus.com/rest) of Timeplus Enterprise is secured by API keys in Timeplus Cloud.

:::info
For Timeplus Enterprise self-hosted deployments, you need to set HTTP Authorization header to be `Basic [Base64 encoded user:password]`.

For example, if the username is `admin` and the password is `password` (not recommended to set this in production), you can generate the based64 encoded string for `admin:password` as `YWRtaW46cGFzc3dvcmQ`, via the command line `echo -n "admin:password" | base64`. Then set the HTTP header `Authorization` as `Basic YWRtaW46cGFzc3dvcmQ`. This also can be set in `curl` via `-u admin:password` flag.
:::

You need to create an API key to access the Timeplus REST API in the cloud. 以下是如何创建的步骤：

1. 点击右上角的 **头像**。 在下拉列表中，单击 **个人设置**。

![用户头像和个人设置](/img/api-key-avatar-1.png)

2. 在 API 密钥部分，单击 **创建 API 密钥** 按钮。

![创建 API 密钥](/img/api-key-settings-2.png)

3. 输入密钥的可选描述，根据需要选择到期日期，然后单击 **创建**。

![API 密钥对话框](/img/api-key-dialog-3.png)

4. API密钥只会向您显示一次——请确保您安全且及时地将它保存好。 您之后将无法在控制台再次检索该密钥。

![复制 API 密钥](/img/api-key-copy-4.png)
