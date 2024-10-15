# timeplus restore

Restore from a Timeplus Enterprise backup file.

## timeplus restore -f [file] -d [home]

```
timeplus restore -f timeplus.bak -d ..
```

This will load the backup file and restores to the Timeplus Enterprise base folder.

It is recommended to [stop](/cli-stop) the Timeplus Enterprise services, restore the data and configuration, then [start](/cli-start) the service.

## See Also

[timeplus backup](/cli-backup)

[timeplus stop](/cli-stop)

[timeplus start](/cli-start)
