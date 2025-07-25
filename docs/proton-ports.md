# Server Ports

Timeplus serves on many ports for different purposes. Only few of them are exposed in sample Docker Compose files.

Here is a summary of common ports you may need. You can check the default server [config.yaml](https://github.com/timeplus-io/proton/blob/develop/programs/server/config.yaml) for details.

| Port | Type       | Default query mode | Clients                                                      |
| ---- | ---------- | ------------------ | ------------------------------------------------------------ |
| 8463 | TCP        | Streaming          | [proton-client](/proton-client) or [timeplusd-client](/timeplusd-client), [Native JDBC](https://github.com/timeplus-io/timeplus-native-jdbc), [Go driver](https://github.com/timeplus-io/proton-go-driver), [Grafana](https://github.com/timeplus-io/proton-grafana-source) |
| 8123 | HTTP       | Batch              | [JDBC](https://github.com/timeplus-io/proton-java-driver)/[ODBC](https://github.com/timeplus-io/proton-odbc) drivers, [DBeaver](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc#connnect-to-proton-via-dbeaver) |
| 3218 | HTTP       | Streaming          | [Ingest API](/proton-ingest-api), [JDBC](https://github.com/timeplus-io/proton-java-driver)/[ODBC](https://github.com/timeplus-io/proton-odbc) drivers, [DBeaver](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc#connnect-to-proton-via-dbeaver) |
| 7587 | TCP        | Batch              | [proton-client](/proton-client)  or [timeplusd-client](/timeplusd-client), [Native JDBC](https://github.com/timeplus-io/timeplus-native-jdbc), [Go driver](https://github.com/timeplus-io/proton-go-driver), [Grafana](https://github.com/timeplus-io/proton-grafana-source) |
| 9363 | Metrics    |                    | [Prometheus integration](/prometheus)           |
