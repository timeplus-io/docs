# Server Configuration

When you run Timeplus Enterprise in a self-hosted environment, the default settings are designed to accommodate common use cases with ease and optimal performance. The server can be configured either by modifying the configuration file or via the web console.

## User Management {#users}
By default, a system account will be created automatically to perform system level operations, such as managing user accounts and reading/writing metrics. The username is `proton`, with the password defaulting to `timeplus@t+`. This password can be overriden by setting `--password` flag when you run `timeplus start`.

When you launch the web console of Timeplus Enterprise for the first time, you will be prompted to create a new account with password.

To edit or add new users, you can edit the conf/users.yaml, then restart the server. A web UI for managing users will be provided soon.

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
1. Root privilage is required to enable the service
2. Use the same user/user_group for uncompressing the Timeplus installation package
3. This command will add a service into `/etc/systemd/system/timeplus.service`. When it is successfully installed, it will enable and start the service. Later on you can use `systemctl` command to manage the service.
