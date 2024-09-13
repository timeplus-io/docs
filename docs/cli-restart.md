# timeplus restart
Restart the Timeplus Enterprise services in the current node.

## timeplus restart
When you run `timeplus restart` without extra parameters, it will restart all services, e.g.
```
stopping service timeplusd
stopping service timeplus_web
stopping service timeplus_connector
stopping service timeplus_appserver
.
service timeplus_appserver stopped

service timeplus_web stopped

service timeplus_connector stopped
............
service timeplusd stopped
start service timeplusd
start service timeplus_appserver
start service timeplus_web
start service timeplus_connector
.
service timeplus_connector started
.
service timeplus_web started
..........
service timeplusd started

service timeplus_appserver started
Timeplus restarted. Open http://localhost:8000 in your browser to access Timeplus web console
```

## timeplus restart -s [service]
You can also use the `-s` or `--service` flag to restart a specific service, e.g.
```
timeplus restart -s timeplusd
stopping service timeplusd
..............
service timeplusd stopped
start service timeplusd
......
service timeplusd started
```
## See Also

[timeplus start](/cli-start)

[timeplus stop](/cli-stop)

[timeplus status](/cli-status)
