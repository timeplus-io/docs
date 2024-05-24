# Server Configuration

## User Management {#users}
There is a default user for Timeplus with the username `default` and empty password.

To edit or add new users, you can edit the conf/users.yaml.

Here is a snippet of the default settings:
```yaml
users:
  default:
    allow_databases:
    - database: default
    default_database: default
    networks:
    - ip: ::/0
    password: ""
    profile: default
    quota: default
```

## License Management{#license}
When you start Timeplus Enterprise and access the web console for the first time, the 30-day free trial starts. When it ends, the software stops working.

You can [contact us](mailto:support@timeplus.com) and purchase a license, then upload in the web console. Click the *Workspace Settings* on the bottom-left and choose *License* tab. Copy and paste the license file or upload the file.

![Add license](/img/add_license.png)

## Enable HTTPS {#https}

By default, Timeplus Enterprise web console is listening on 8000 in HTTP protocol. If you need to turn on self-signed or CA-signed HTTPS, you can edit conf/timeplus_appserver.yaml.

More detailed guide will be added. Or contact us for support.
