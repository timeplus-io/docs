# timeplus sync
Synchronizes resources to Timeplus Enterprise.

It works like a database migration tool except that it does not store the migration states, instead, users are responsible for deciding which migration scripts to run.

Features:

* Runs migration scripts in dictionary order (by script file names).
* Supports Go template. All migration scripts will be rendered as Go tempaltes.
* Function for extracting UDF/A Javascript from Javascript files.

## timeplus sync apply [file_or_folder]
For example:
```
timeplus sync apply path/to/your/migration-script.sql
```
This command will run the path/to/your/migration-script.sql SQL script (the file MUST use .sql as its extension name) for the current running Timeplus server.

Sample output:
```
Applying file migration-script.sql ... done.
```

You can also specify a folder, for example:
```
timeplus sync apply path/to/your/migration-scripts
```
In this case, all migration scripts (files with .sql extension name) will be applied one by one in the A-to-Z dictionary order. All other files will be ignored. For example, given that migration-scripts folder contains the following files:
```
migration-scripts/
├── README.md
├── 01.sql
├── 02.sql
├── 03.sql
├── 04.sql
└── udf_function.js
```
The scripts will be executed in the following order:
1. 01.sql
2. 02.sql
3. 03.sql
4. 04.sql

`udf_function.js` and `README.md` are skipped because they do not have .sql extension.

If a directory has sub-directories, migration scripts in the sub-directories will be executed too, but they will be executed after the scripts in the parent directory.

It's also possible to specify multiple paths to the apply command. For example:
```
timeplus sync apply path/to/script_01.sql path/to/script_02.sql path/to/scripts-folder
```

### Templates and Variables
All migration scripts are treated as [Go template](https://pkg.go.dev/text/template). This command uses the [sprig](https://masterminds.github.io/sprig/) library, thus all functions provided by sprig are all available to use.

Also, a special data `.values` is defined to allow users to define their own values to be used in the migrations scripts. For example, given a migration script contains the following SQL statement:
```sql
CREATE EXTERNAL STREAM metrics (
  name string,
  value float64,
  labels map[string]string
) SETTINGS type='kafka',brokers='{{ .values.kafka.brokers }}',topic='{{ .values.kafka.topic }}'
```
The statemant does not hard-code the Kafka brokers and topic, so that it can be easily shared in different environements. There are several ways to speicy the values.

#### Set variable value in the command
Use command line argument `--set`.

You can set multiple values with comma as the separator, e.g.
```
timeplus sync apply --set a=1,b=2 t.sql
```
Or, specify the values in their own --set:
```
timeplus sync apply --set a=1 -- set b=2 t.sql
```

#### Set variable values in a file
Create a file called values.yaml (or any name you like to use), and write the following content in it:
```yaml
a: 1
b: 2
```

Or with hierarchy, e.g.
```yaml
kafka:
  brokers: localhost:9092
  topic: my-topic
```
Then you can run the command:
```
timeplus sync apply -f values.yaml my_script.sql
```

## timeplus sync apply --dry-run
Dry-run mode is supported. It prints what SQL statements will be executed without actually executing them.

For example the SQL file is:
```sql
create stream test{{.values.a}}(col_{{.values.b}} string)
```

```
timeplus sync apply --dry-run --set a=1,b=2 t.sql
Applying file t.sql ...
Execute:

create stream test1(col_2 string)

done.
```
