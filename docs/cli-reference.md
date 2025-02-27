# CLI Reference

Besides [timeplusd-client](/timeplusd-client), Timeplus also provide the `timeplus` command line interface to help you manage the self-hosted deployments.

For bare metal installation, the `timeplus` binary is available in `/bin` folder. For Kubernetes deployments, please add the following section to `values.yaml `:
```yaml
timeplusCli:
  enabled: true
```

Then upgrade the helm chart via:
```bash
helm -n $NS upgrade -f values.yaml $RELEASE timeplus/timeplus-enterprise
```
Once `timeplus-cli` pod is up and running, you can run `kubectl exec -n $NS -it timeplus-cli -- /bin/bash` to run commands in the pod.


## Commands

The following table displays the available top-level `timeplus` commands.

| Command                      | Description       |
| ----------------------------- | ---------- |
| [timeplus start](/cli-start)             | Start Timeplus Enterprise services    |
| [timeplus stop](/cli-stop)             | Stop Timeplus Enterprise services    |
| [timeplus restart](/cli-restart)             | Restart Timeplus Enterprise services    |
| [timeplus service](/cli-service)             | Add Timeplus Enterprise services to systemd control  |
| [timeplus license](/cli-license)             |Manage Timeplus Enterprise licenses|
| [timeplus diag](/cli-diag)             |Run diagnostics of Timeplus Enterprise services|
| [timeplus migrate](/cli-migrate) | Migrate data and resources between Timeplus Enterprise deployments |
| [timeplus backup](/cli-backup)             |Create a Timeplus enterprise backup|
| [timeplus restore](/cli-backup)             |Restore a Timeplus enterprise backup|
| [timeplus sync](/cli-sync)             |Synchronizes resources to Timeplus Enterprise|
| [timeplus version](/cli-version)             |Show Timeplus Enterprise version|
| [timeplus help](/cli-help)             |Help about any command|

## Common Flags

Most of the commands support the following flags:
* `-v`, or `--verbose`: run the command in the verbose mode
* `-h`, or `--help`: show the help message for the command, with sub-commands and flags.
