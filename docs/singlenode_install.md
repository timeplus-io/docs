# Single Node Install

Timeplus Enterprise can be easily installed on a single node, with or without Docker.

## Bare Metal Install{#bare_metal}

If your server or laptop is running Linux or MacOS, you can run the following command to download the package and start Timeplus Enterprise without any other dependencies.

```shell
curl https://install.timeplus.com | sh
```

You can also download the packages mannually with the following links:
* [TimeplusEnterprise-v2.1.6.0-Linux-x86_64.tar.gz](https://timeplus.io/dist/timeplus_enterprise/TimeplusEnterprise-v2.1.6.0-Linux-x86_64.tar.gz) (318 MB)
* TimeplusEnterprise-v2.1.6.0-Linux-aarch64.tar.gz (coming soon)
* TimeplusEnterprise-v2.1.6.0-Darwin-x86_64.tar.gz (coming soon)
* TimeplusEnterprise-v2.1.6.0-Darwin-arm64.tar.gz (coming soon)

After you download the package, put it in a desired folder, uncompress the file and you can run Timeplus Enterprise with preconfigured settings:

```shell
tar xfv file.tar.gz
```
Then change directory to the `bin` folder and run
```shell
timeplus start
```

This will start Timeplus Enterprise with a few key components:
* `timeplusd`: the core SQL engine, servering at port 8463 (TCP, for `timeplus client`) and 3218 (HTTP, for JDBC/ODBC drivers).
* `timeplus_appserver`: the application server, servering at HTTP port 8000
* `timeplus_web`: the web UI, managed by `timeplus_appserver`.
* `timeplus_connnector`: the service to provide extra sources and sinks, , managed by `timeplus_appserver`.

You can access the Timeplus Console via http://localhost:8000. On your first login, please share your contact information and start the 30-day free trial.

## Docker Install{#docker}

You can also run the following command to start Timeplus Enterprise, with Docker:
```shell
docker run -p 8000:8000 timeplus/timeplus-aio:0542064f
```

A few optional parameters:
* Add `--name timeplus` to set a name for the container
* Add `-d` to run the container at background
* Add `-p 8463:8463 -p 3218:3218` if you want to run SQL with `timeplus client` or JDBC/ODBC drivers.
* Add `-v "$(pwd)"/data:/timeplus/data -v "$(pwd)"/logs:/timeplus/logs` if you want to mount the data and log files to your host.

## Quickstart with Docker Compose {#compose}
You can also use Docker Compose to start Timeplus Enterprise, together with Redpanda (A Kafka API compatiable message bus) and data generator.

```bash
wget https://install.timeplus.com/docker-compose.yml
docker compose up
```

Access the web console at https://localhost:8000.

## License Management{#license}
When you start Timeplus Enterprise and access the web console for the first time, the 30-day free trial starts. When it ends, the software stops working.

You can [contact us](mailto:support@timeplus.com) and purchase a license, then upload in the web console. Click the *Workspace Settings* on the bottom-left and choose *License* tab. Copy and paste the license file or upload the file.

![Add license](/img/add_license.png)
