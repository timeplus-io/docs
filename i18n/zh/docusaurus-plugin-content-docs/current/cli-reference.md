# CLI Reference

For [bare metal](singlenode_install) installation, the `timeplus` command line interface provides many handy features to help you manage the self-hosted deployments.

## Commands

The following table displays the available top-level `timeplus` commands.

| Command                         | 描述                                                  |
| ------------------------------- | --------------------------------------------------- |
| [timeplus start](cli-start)     | Start Timeplus Enterprise services                  |
| [timeplus stop](cli-stop)       | Stop Timeplus Enterprise services                   |
| [timeplus restart](cli-restart) | Restart Timeplus Enterprise services                |
| [timeplus service](cli-service) | Add Timeplus Enterprise services to systemd control |
| [timeplus license](cli-license) | Manage Timeplus Enterprise licenses                 |
| [timeplus user](cli-user)       | Manage Timeplus Enterprise users                    |
| [timeplus diag](cli-diag)       | Run diagnostics of Timeplus Enterprise services     |
| [timeplus backup](cli-backup)   | Create a Timeplus enterprise backup                 |
| [timeplus restore](cli-backup)  | Restore a Timeplus enterprise backup                |
| [timeplus sync](cli-sync)       | Synchronizes resources to Timeplus Enterprise       |
| [timeplus version](cli-version) | Show Timeplus Enterprise version                    |
| [timeplus help](cli-help)       | Help about any command                              |

## Common Flags

Most of the commands support the following flags:

- `-v`, or `--verbose`: run the command in the verbose mode
- `-h`, or `--help`: show the help message for the command, with sub-commands and flags.
