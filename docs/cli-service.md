# timeplus service
Add Timeplus Enterprise services to Linux systemd control. This feature is not available for macOS.

## timeplus service enable
This command needs to be ran by the root user.

Please get the current user and user group via command lines.
```bash
whoami
groups
```
Then use `sudo` to enable the service with the right user and group.
```bash
sudo timeplus/bin/timeplus service enable -u [user] -g [group]
Timeplus serice config created at /etc/systemd/system/timeplus.service
system daemon reloaded
Timeplus service enabled
```

Then you can use systemctl to manage the service, e.g.
* `sudo systemctl status timeplus.service`
* `sudo systemctl start timeplus.service`
* `sudo systemctl stop timeplus.service`
* `sudo systemctl restart timeplus.service`

To remove the service, run this command:
```bash
sudo rm /etc/systemd/system/timeplus.service
```
