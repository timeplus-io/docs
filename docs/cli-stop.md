# timeplus stop
Stop the Timeplus Enterprise services in the current node.

## timeplus stop
When you run `timeplus stop` without extra parameters, it will stop all services, e.g.
```
stopping service timeplus_web
stopping service timeplus_appserver
stopping service timeplusd
stopping service timeplus_connector

service timeplus_connector stopped

service timeplus_appserver stopped

service timeplus_web stopped
..........
service timeplusd stopped
```
Usually all services will be stopped immediately, except `timeplusd`, which may take a few seconds or minutes, depending on the server workload.

## timeplus stop -s [service]
You can also use the `-s` or `--service` flag to stop a specific service, e.g.
```
timeplus stop -s timeplusd
stopping service timeplusd

service timeplusd stopped
```
## See Also
[timeplus start](cli-start)

[timeplus restart](cli-restart)

[timeplus status](cli-status)
