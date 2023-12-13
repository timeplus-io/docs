# Server Ports

As a database, Proton serves on many ports for different purposes. Only few of them are exposed in sample Docker Compose files.

Here is a summary of common ports you may need. You can check the default server [config.yaml](https://github.com/timeplus-io/proton/blob/develop/programs/server/config.yaml) for details. 

| Port | Type       | Default query mode | Clients                                                      |
| ---- | ---------- | ------------------ | ------------------------------------------------------------ |
| 8463 | TCP        | Streaming          | proton-client, [Go driver](https://github.com/timeplus-io/proton-go-driver), [Grafana](https://github.com/timeplus-io/proton-grafana-source) |
| 8123 | HTTP       | Batch              | [JDBC](https://github.com/timeplus-io/proton-java-driver)/[ODBC](https://github.com/timeplus-io/proton-odbc) drivers, [DBeaver](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc#connnect-to-proton-via-dbeaver), [metabase](https://github.com/timeplus-io/metabase-proton-driver) |
| 3218 | HTTP       | Streaming          | [Ingest API](proton-ingest-api), [JDBC](https://github.com/timeplus-io/proton-java-driver)/[ODBC](https://github.com/timeplus-io/proton-odbc) drivers, [DBeaver](https://github.com/timeplus-io/proton/tree/develop/examples/jdbc#connnect-to-proton-via-dbeaver), [metabase](https://github.com/timeplus-io/metabase-proton-driver) |
| 7587 | TCP        | Batch              | proton-client, [Go driver](https://github.com/timeplus-io/proton-go-driver), [Grafana](https://github.com/timeplus-io/proton-grafana-source) |
| 5432 | PostgreSQL | Batch              | psql                                                         |
| 9004 | MySQL      |                    | mysql                                                        |
| 9009 | Cluster    |                    | low-level data access between servers                        |

