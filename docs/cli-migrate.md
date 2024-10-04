# timeplus migrate

Migrate data and resources between Timeplus deployments, including:
* Migrate the data and configuration from a single-node Timeplus Proton to self-hosted or cloud version of Timeplus Enterprise.
* Migrate the data and configuration among Timeplus Enterprise deployments, even there are breaking changes in the data format. This tool can also be used to apply changes to production deployments after verifying changes in the staging deployments.

This tool is available in Timeplus Enterprise 2.5. It supports [Timeplus Enterprise 2.4.19](/enterprise-v2.4#2419) or above, and Timeplus Proton 1.5.18 or above. Contact us if you need to migrate from a older version.

## How It Works

The migration is done via capturing the SQL DDL from the source deployment and rerunning those SQL DDL in the target deployment. Data are read from source Timeplus via [Timeplus External Streams](/timeplus-external-stream) and write to the target Timeplus via `INSERT INTO .. SELECT .. FROM table(tp_ext_stream)`. The data files won't be copied among the source and target Timeplus, but you need to ensure the target Timeplus can access to the source Timeplus, so that it can read data via Timeplus External Streams.


## Supported Resources

The `migrate` command will migrate the following resources:

- streams, external streams, external tables
- views, materialized views
- UDFs, UDAFs, schemas
- sinks, sources, dashboards, saved queries(a.k.a. bookmarks)

The following resources are not supported yet:

- alerts
- users, roles, grants
- databases
- api keys

Query history in the SQL Console could be exported but won't be migrated to the target Timeplus.

## Preparation

To best ensure the data integrity, it's recommended to stop sending requests to ingestion REST API, stop running INSERT SQL. If in your source deployment, there are materialized views reading data from external Kafka or Pulsar system, you can [pause](/sql-system-pause) them.

Expose the 8463 TCP port from the source deployment. Making sure the target deployment can access to the port.

## Migrate Workflow

1. Create a configuration YAML file to specify the connections to the source and target deployments.

2. Run [timeplus migrate plan](#plan) command with this configuration file. This will capture the DDL and other configurations in your source deployment. A migration plan will be generated.

3. (Optional), you can review and modify the migration plan file. For example, you can remove some of the streams or views which you don't want to create in the target deployment

4. Run [timeplus migrate run](#run) command to create the streams and other resources in the target deployment. Data will be replicated via Timeplus External Streams.

## timeplus migrate plan -f [cfg_file] -p [plan_file]{#plan}

Run `timeplus migrate plan -f config-file-path -p plan_file_path` to generate the migration plan.

Here is a sample configuration file:

```yaml
source:
  app_server_address: "http://source-timeplus:8000"
  timeplusd_address: "source-timeplus:8463"
  username: "db_user"
  password: "db_password"

target:
  app_server_address: "http://target-timeplus:8000"
  timeplusd_address: "target-timeplus:8463"
  username: "db_user"
  password: "db_password"

max_block_size: 2
max_insert_threads: 5
drop_migration_external_stream: true
```

If you want to migrate from or migrate to Timeplus Cloud, you can setup the source or target connection as following:
```yaml
source:
  app_server_address: "https://us-west-2.timeplus.cloud"
  workspace: id1
  api_key: apikey1
  timeplusd_address: "source-timeplus:8463"
  username: "db_user"
  password: "db_password"

target:
  app_server_address: "https://us-west-2.timeplus.cloud"
  workspace: id2
  api_key: apikey2
  timeplusd_address: "target-timeplus:8463"
  username: "db_user"
  password: "db_password"
```
You need to contact us so that we can setup the network and database credential while migrating workspaces in Timeplus Cloud.

Settings in the configuration file:

- `source`. The connection to the source Timeplus.
- `target`. The connection to the target Timeplus.
- `mode`. By default the generated file includes DDL to create resources in the target Timeplus. Set mode to `resource_only` to only dump the resource definitions in the source Timeplus.
- `show_query_history`. Default to `false`. Set it to `true` if you want to include the SQL query history in the generated plan file. But those query history won't be migrated to the target Timeplus.
- `stop_data_ingestion_on_source`. Default to `false`. Set it to `true` to stop all sources on source Timeplus.
- `stop_data_ingestion_on_target`. Default to `false`. Set it to `true` to stop all sources on target Timeplus.
- `max_insert_threads` Default to `8`. The number of insert threads.
- `drop_migration_external_stream` Default `false`. Timeplus External Streams will be created to migrate data. Set to `true` if you want to delete them after migration.
- `max_block_size` Default to `10`. For some streams with large size records, you can set a proper value to control how many rows to be inserted in a batch.
- `use_timeplusd_for_data_migration` Default to `false`. Set it to `true` to use timeplusd TCP port (instead of timeplus_appserver HTTP port) to run the migration SQL. This is recommended for Timeplus deployments with large volume of historical data.

## timeplus migrate run -p [plan_file]{#run}

You can review the generated plan file and make changes if necessary. After the review, you can run this command to start the migration.

```
timeplus migrate run -p plan_file_path
```

## timeplus migrate clean -p [plan_file] {#clean}

If there is anything wrong during the migration and you want to try it again, this `clean` sub-command will delete the migrated resource in taget Timeplus, so that you can recreate them in the next `timeplus migrate run`.

## Limitations

1. There is no checkpoint or error recovering for now. While migrating streams with lots of data, it is possible to experience network interruption. In this case, you can turn on `use_timeplusd_for_data_migration` setting and use timeplusd instead of the application server to run the migration script. You can also run `migrate clean` command to clean up the half-done resources and retry.
2. The owner for the newly created resources in the target Timeplus are the API user in configuration file, not necessarily the orginal owner in source Timeplus.
