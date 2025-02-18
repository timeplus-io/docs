# API Key

:::warning
This page is deprecated. API Key is only applicable to Timeplus Cloud, which is no longer available.
:::

The [REST API](https://docs.timeplus.com/rest) of Timeplus Cloud is secured by API keys.

For Timeplus Enterprise self-hosted deployments, you need to set HTTP Authorization header to be `Basic [Base64 encoded user:password]`.

For example, if the username is `admin` and the password is `password` (not recommended to set this in production), you can generate the base64 encoded string for `admin:password` as `YWRtaW46cGFzc3dvcmQ`, via the command line `echo -n "admin:password" | base64`. Then set the HTTP header `Authorization` as `Basic YWRtaW46cGFzc3dvcmQ`. This also can be set in `curl` via `-u admin:password` flag.

You need to create an API key to access the Timeplus REST API in the cloud. Here’s how to create one:

1. Click on your **avatar** in the top right corner. In the dropdown, click **Personal Settings**.

![User avatar and Personal Settings](/img/api-key-avatar-1.png)

2. In the API Keys section, click the **Create API Key** button.

![Create API Key](/img/api-key-settings-2.png)

3. Enter an optional description for the key, choose an expiration date if needed, and click **Create**.

![API Key dialog](/img/api-key-dialog-3.png)

4. The API key will only be shown to you once - make sure you securely save it right away. You won’t be able to retrieve the key again later in the console.

![Copy API key](/img/api-key-copy-4.png)
