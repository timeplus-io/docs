# Single Node Install

Timeplus Enterprise can be easily installed on a single node, with or without Docker.

## Bare Metal Install{#bare_metal}

If your server or laptop is running Linux or MacOS, you can run the following command to download the package and start Timeplus Enterprise without any other dependencies. For Windows users, please follow [the guide](#docker) to run Timeplus Enterprise with Docker.

```shell
curl https://install.timeplus.com | sh
```

This script will download the latest package (based on your operating system and CPU architecture) to the current folder. Uncompress the package and start the Timeplus Enterprise server.

You can also download the packages mannually with the following links:
* Linux ([Intel/AMD chip](https://install.timeplus.com/latest-linux-amd64.tar.gz), [ARM chip](https://install.timeplus.com/latest-linux-arm64.tar.gz))
* macOS ([Intel chip](https://install.timeplus.com/latest-darwin-amd64.tar.gz), [Apple Silicon chip](https://install.timeplus.com/latest-darwin-arm64.tar.gz))
* Windows (Not available. Please [install via Docker](#docker))

After you download the package, put it in a desired folder, uncompress the file and you can run Timeplus Enterprise with preconfigured settings:

```shell
tar xfv file.tar.gz
```
Then change directory to the `bin` folder and run
```shell
./timeplus start
```

This will start Timeplus Enterprise with a few key processes:
* `timeplusd`: the core SQL engine, servering at port 8463 (TCP, for `timeplus client`) and 3218 (HTTP, for JDBC/ODBC drivers).
* `timeplus_appserver`: the application server, servering at HTTP port 8000
* `timeplus_web`: the web UI, managed by `timeplus_appserver`.
* `timeplus_connnector`: the service to provide extra sources and sinks, , managed by `timeplus_appserver`.

You can access the Timeplus Enterprise Web Console via http://localhost:8000. On your first login, please create an account with a password and start the 30-day free trial.

It is also possible to only start/stop single process by running `timeplus start -s service_name`. For example where you only want to startup the Timeplus Core, run `timeplus start -s timeplusd`.

For more information, just run  `timeplus start -h` for details.

## Docker Install{#docker}

You can also run the following command to start Timeplus Enterprise, with [Docker](https://www.docker.com/get-started/):
```shell
docker run -p 8000:8000 timeplus/timeplus-enterprise
```

A few optional parameters:
* Add `--name timeplus` to set a name for the container
* Add `-d` to run the container at background
* Add `-p 8463:8463 -p 3218:3218` if you want to run SQL with `timeplus client` or JDBC/ODBC drivers.
* Add `-v "$(pwd)"/data:/timeplus/data -v "$(pwd)"/logs:/timeplus/logs` if you want to mount the data and log files to your host.

## Quickstart with Docker Compose {#compose}
You can also use Docker Compose to start Timeplus Enterprise, together with Redpanda (A Kafka API compatiable message bus), ClickHouse and data generator.

For Linux or Mac users, please run the command:
```bash
curl https://install.timeplus.com/sp-demo | sh
```

For Windows users, you can download the package with docker compose file and bootstrap scripts [here](https://timeplus.io/dist/timeplus_enterprise/sp-demo-20240522.zip).

Access the web console at http://localhost:8000.

This stack demonstrates how to run streaming ETL, getting data from Kafka API, applying filter or aggregation, then sending to another Kafka topic or ClickHouse tables. For more details, please check:
* [Tutorial: Streaming ETL: Kafka to Kafka](tutorial-sql-etl)
* [Tutorial: Streaming ETL: Kafka to ClickHouse](tutorial-sql-etl-kafka-to-ch)

## License Management{#license}
When you start Timeplus Enterprise and access the web console for the first time, the 30-day free trial starts. When it ends, the software stops working.

Please check [the guide](server_config#license) to update licenses.
