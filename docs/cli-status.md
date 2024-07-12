# timeplus status

Show the status for Timeplus Enterprise services.

## timeplus status
When you run `timeplus status` without extra parameters, it will list the status for all services, e.g.
```
service                   status     healthy
timeplusd                 running    true
timeplus_web              running    true
timeplus_connector        running    true
timeplus_appserver        running    true
```

Or:
```
service                   status     healthy
timeplusd                 stopped    false
timeplus_web              stopped    false
timeplus_connector        stopped    false
timeplus_appserver        stopped    false
```

The "status" can be either "running" or "stopped", by checking the pid (process id). The "healthy" value is determined by checking the HTTP endpoint of each service. For stopped service, the "healthy" value ought to be "false".

## timeplus status -v
`-v` or `--verbose` flag can show extra information, such as the pid (process id).

## See Also

[timeplus start](cli-start)

[timeplus stop](cli-stop)

[timeplus restart](cli-restart)
