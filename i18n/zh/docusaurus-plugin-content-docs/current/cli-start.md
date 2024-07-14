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

## Note for macOS users

If you are using macOS and fail to start Timeplus Enterprise, please check the "Privacy & Security" settings and see whether there is any warning for "timeplusd". If so, choose "Allow Anyway" to trust timeplusd and start Timeplus Enterprise again.

## See Also

[timeplus stop](cli-stop)

[timeplus restart](cli-restart)

[timeplus status](cli-status)
