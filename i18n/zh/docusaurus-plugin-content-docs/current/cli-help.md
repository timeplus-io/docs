# timeplus help

## timeplus help

When you run `timeplus help` without extra parameters, it will list all available commmands, e.g.

```
Timeplus Enterprise, a simple, powerful, and cost-efficient stream processing platform.

Usage:
  timeplus [flags]
  timeplus [command]

Available Commands:
  backup      Create a Timeplus enterprise backup
  cluster     Manage Timeplus enterprise cluster
  config      Manage Timeplus Enterprise configuration
  diag        Run diagnostics of Timeplus Enterprise services
  help        Help about any command
  license     Manage Timeplus Enterprise licenses
  restart     Restart Timeplus Enterprise services
  restore     Restore a Timeplus enterprise backup
  service     Add Timeplus Enterprise services to systemd control
  start       Start Timeplus Enterprise services
  status      Check Timeplus Enterprise services status
  stop        Stop Timeplus Enterprise services
  sync        Synchronizes resources to timeplusd.
  user        Manage Timeplus Enterprise users
  version     Show Timeplus Enterprise version

Flags:
  -h, --help   help for timeplus

Use "timeplus [command] --help" for more information about a command.
```

## timeplus help [command]

You can add the command name after `help` to see the available flags, e.g.

```
timeplus help start
Start Timeplus Enterprise services

Usage:
  timeplus start [flags]

Flags:
  -h, --help              help for start
  -p, --password string   system admin password (default "timeplus@t+")
  -s, --service string    service (all, timeplusd, timeplus_appserver, timeplus_web, timeplus_connector) to start (default "all")
  -v, --verbose           run command in verbose mode
```
