# DevOps with Flyway

[Redgate Flyway](https://www.red-gate.com/) extends DevOps to databases to accelerate software delivery and ensure quality code. From version control to continuous delivery, Flyway builds on application delivery processes to automate database deployments.

A database extension for Timeplus is available at [GitHub](https://github.com/timeplus-io/flyway-community-db-support). If you already use Flyway in your DevOps toolchain, you can use Flyway to manage SQL resources with version control and continuous delivery. Comparing to [Timeplus Terraform Provider](/terraform), currently the flyway support has some [limitations](#limitations).

## Demo
Check out this short video that demonstrates how to create, update and clean up Timeplus resources with Flyway.
<iframe width="560" height="315" src="https://www.youtube.com/embed/onGVEZtb_Ik?si=HnDKfl9slxzFwnqk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Installation

Timeplus team have submitted the plugin to Flyway community, before it's merged and available in flyway releases, please download the Timeplus extension as a JAR file from the GitHub [Releases](https://github.com/timeplus-io/flyway-community-db-support/releases) page.

Flyway can be installed as a command-line tool or added to your Java project via Maven or Gradle build tools.

Put the `flyway-database-timeplus-VERSION_NUMBER.jar` to the proper folder or the classpath of the Java project.

You also need to add the [Timeplus JDBC driver](/jdbc) to the flyway folder or Java classpath. Download timeplus-native-jdbc-shaded-VERSION_NUMBER.jar from https://github.com/timeplus-io/timeplus-native-jdbc/releases.

Taking flyway CLI on macOS as an example:
* You can install it via `brew install flyway`
* Download and put the extension to `/opt/homebrew/Cellar/flyway/11.1.0/libexec/lib/flyway/flyway-database-timeplus-10.16.3.jar`
* Download and put the JDBC driver to `/opt/homebrew/Cellar/flyway/11.1.0/libexec/drivers/timeplus-native-jdbc-shaded-2.0.7.jar`

## Setup a sample project
Create a new folder and create a `flyway.toml` file inside.
```toml
[environments.tplocal]
url = "jdbc:timeplus://localhost:7587"
user = "admin"
password = "changeme"
[flyway]
validateMigrationNaming = true
environment = "tplocal"
locations = ["filesystem:migrations"]
cleanDisabled = false
```
Change the `url`, `user` and `password` value to match your Timeplus deployment.

Create a new folder 'migrations' with a few SQL scripts:

V1__Create_person_stream.sql:
```sql
CREATE STREAM PERSON (ID int, NAME string);
```

V2__Add_people.sql:
```sql
INSERT INTO PERSON (ID, NAME)
VALUES (1, 'Axel');
INSERT INTO PERSON (ID, NAME)
VALUES (2, 'Mr. Foo');
INSERT INTO PERSON (ID, NAME)
VALUES (3, 'Ms. Bar');
```

V3__Create_Protobuf_Schema.sql:
```sql
CREATE OR REPLACE FORMAT SCHEMA double_value_dollar AS $$
syntax = "proto3";

message DoubleValue {
    double value = 1;
}

$$ TYPE Protobuf;

```

The folder structure is:
```
.
├── flyway.toml
└── migrations
    ├── V1__Create_person_stream.sql
    ├── V2__Add_people.sql
    ├── V3__Create_Protobuf_Schema.sql
```

## Flyway Commands
Run the `flyway` command from the folder where flyway.toml resides.
* Run `flyway info` to validation the connection to Timeplus, as well as scanning the SQL scripts.
* Run `flyway migrate` to run the SQL scripts. This will setup `flyway_schema_history` to track schema history if the table doesn't exist.
* Run `flyway clean` to delete all streams and the `flyway_schema_history` table.
* Run `flyway repair` if there is any failure in prior `flyway migrate`. This command will remove related rows from `flyway_schema_history` table.

## Limitations
* `flyway_schema_history` is created as a MergeTree table. We plan to add deletion in Mutable Streams and create this as a Mutable Stream. If your deployment is a cluster version of Timeplus Enterprise, please configure flyway to talk to the same node, since the table won't be replicated among the cluster.
