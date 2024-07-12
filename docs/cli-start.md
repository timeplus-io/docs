# timeplus start
Start the Timeplus Enterprise services in the current node.

## timeplus start
When you run `timeplus start` without extra parameters, it will start all services, e.g.
```
start service timeplus_appserver
start service timeplus_web
start service timeplus_connector
start service timeplusd
.
service timeplus_connector started
.
service timeplus_web started
........
service timeplusd started

service timeplus_appserver started
Timeplus started. Open http://localhost:8000 in your browser to access Timeplus web console
```

## timeplus start -s [service]
You can also use the `-s` or `--service` flag to start a specific service, e.g.
```
timeplus start -s timeplusd
start service timeplusd
......
service timeplusd started
```

## See Also
[timeplus stop](cli-stop)

[timeplus restart](cli-restart)

[timeplus status](cli-status)
