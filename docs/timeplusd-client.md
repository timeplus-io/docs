# timeplusd-client

`timeplusd client` is the native CLI for Timeplus Enterprise. It ships in the
`timeplus/bin` folder of [the bare-metal package](/release-downloads) and is on
`PATH` in the `timeplus/timeplusd` Docker image.

:::info
In Docker and Kubernetes environments the alias `timeplusd-client` is also
available and forwards to `timeplusd client`.
:::

Client and server versions are cross-compatible, but newer server features may
be unavailable in older clients — keep them in sync when possible. A version
skew prints:

```
Timeplus client version is older than Timeplus server. It may lack support for new features.
```

## Usage {#cli_usage}

The client runs in two modes:

- **Interactive** — started when no query is supplied. Enter queries at the
  prompt, press Enter to submit (terminate with `;` when `--multiline` / `-m`
  is set). Append `\G` to a query to force Vertical output (MySQL-style).
  Ctrl+C cancels a running query; Ctrl+D, `exit`, `quit`, or `:q` exits the
  shell. History is kept in `~/.timeplusd-client-history`.
- **Batch** — triggered by `--query` / `-q` and/or piping data to `stdin`.
  The request sent to the server is the query, a newline, then `stdin` —
  convenient for large `INSERT`s. Default output format is `PrettyCompact`;
  override with `--format` / `-f`, `--vertical` / `-E`, or a `FORMAT` clause.

By default only a single statement runs per batch invocation. Use
`--multiquery` / `-n` to send several semicolon-separated statements in one
request (not supported for `INSERT`).

### Executing SQL {#executing-sql}

```bash
# interactive
timeplusd client -h 127.0.0.1 --ask-password

# one-shot
timeplusd client -q "SELECT version()"
timeplusd client -d mydb -q "SELECT count() FROM events"

# multiple statements (INSERT excluded)
timeplusd client -n -q "
  CREATE STREAM IF NOT EXISTS demo(id int);
  SELECT count() FROM demo;
"

# run a script file
timeplusd client --multiquery      < statements.sql
timeplusd client --queries-file ./statements.sql

# diagnostics
timeplusd client --time       -q "..."   # elapsed time to stderr
timeplusd client --progress   -q "..."   # rows/sec progress
timeplusd client --stacktrace -q "..."   # server stack trace on error
```

### Queries with Parameters {#cli-queries-with-parameters}

Server-side parameter substitution avoids string formatting on the client.
Reference a parameter with `{<name>:<type>}` and pass it via
`--param_<name>=<value>`:

```bash
timeplusd client --param_ids="[1, 2, 3]" \
  -q "SELECT * FROM sensors WHERE id IN {ids:array(uint32)}"

# identifiers (database/table/column names) use the `identifier` type
timeplusd client --param_db=system --param_tbl=numbers --param_col=number \
  -q "SELECT {col:identifier} FROM {db:identifier}.{tbl:identifier} LIMIT 10"

# tuples and other structured types work the same way
timeplusd client --param_t="(10, ('dt', 10))" \
  -q "SELECT * FROM stream WHERE val = {t:tuple(uint8, tuple(string, uint8))}"
```

Parameters can also be set inside a session:

```bash
timeplusd client -nq "SET param_ids='[1, 2]'; SELECT {ids:array(uint16)}"
```

See [Data types](/datatypes) for the full list of supported parameter types.

## Loading Data {#loading-data}

`INSERT ... FORMAT <fmt>` reads rows from `stdin` in the named format. The
examples below assume:

```sql
CREATE STREAM events (id uint64, name string, ts datetime64(3));
```

### Text formats {#loading-text}

```bash
# CSV, no header
cat <<EOF | timeplusd client -q "INSERT INTO events FORMAT CSV"
1,alice,2026-04-20 10:00:00.000
2,bob,2026-04-20 10:00:01.000
EOF

# CSV with header — column order comes from the file
timeplusd client -q "INSERT INTO events FORMAT CSVWithNames" < events.csv

# tab-separated variants
timeplusd client -q "INSERT INTO events FORMAT TabSeparated" < events.tsv
timeplusd client -q "INSERT INTO events FORMAT TSVWithNames" < events_h.tsv

# NDJSON — inline or from a file
cat <<EOF | timeplusd client -q "INSERT INTO events FORMAT JSONEachRow"
{"id":10,"name":"carol","ts":"2026-04-20 10:05:00.000"}
{"id":11,"name":"dave", "ts":"2026-04-20 10:05:01.000"}
EOF
timeplusd client -q "INSERT INTO events FORMAT JSONEachRow" < events.ndjson
```

### Columnar formats {#loading-columnar}

```bash
timeplusd client -q "INSERT INTO events FORMAT Parquet" < events.parquet
timeplusd client -q "INSERT INTO events FORMAT ORC"     < events.orc
timeplusd client -q "INSERT INTO events FORMAT Arrow"   < events.arrow
```

### Values and pipelines {#loading-misc}

```bash
# inline literals
timeplusd client -q "INSERT INTO events VALUES (100,'eve','2026-04-20 10:10:00.000')"

# remote source
curl -sS https://example.com/events.csv \
  | timeplusd client -q "INSERT INTO events FORMAT CSVWithNames"

# server-to-server copy — Native is the fastest binary format
timeplusd client -h src -q "SELECT * FROM events FORMAT Native" \
  | timeplusd client -h dst -q "INSERT INTO events FORMAT Native"

# tolerate up to 10 malformed rows (or use --input_format_allow_errors_ratio=R)
timeplusd client --input_format_allow_errors_num=10 \
  -q "INSERT INTO events FORMAT JSONEachRow" < events.ndjson
```

## Dumping Data {#dumping-data}

Pick the output format with `-f` or a trailing `FORMAT` clause and redirect
`stdout`. Wrap the stream with `table(...)` so the query is bounded — a plain
`SELECT ... FROM <stream>` is streaming and never returns.

### Text formats {#dumping-text}

```bash
# the two styles are equivalent — pick either the -f flag or a trailing FORMAT clause
timeplusd client -f CSVWithNames -q "SELECT * FROM table(events)"     > events.csv
timeplusd client -q "SELECT * FROM table(events) FORMAT CSVWithNames" > events.csv

timeplusd client -q "SELECT * FROM table(events) FORMAT TSVWithNames" > events.tsv
timeplusd client -q "SELECT * FROM table(events) FORMAT JSON"         > events.json    # meta + data
timeplusd client -q "SELECT * FROM table(events) FORMAT JSONEachRow"  > events.ndjson
timeplusd client -q "SELECT * FROM table(events) FORMAT SQLInsert"    > events.sql     # replayable INSERTs
```

### Columnar formats {#dumping-columnar}

```bash
timeplusd client -q "SELECT * FROM table(events) FORMAT Parquet" > events.parquet
timeplusd client -q "SELECT * FROM table(events) FORMAT ORC"     > events.orc
timeplusd client -q "SELECT * FROM table(events) FORMAT Arrow"   > events.arrow
```

For large exports, prefer `Native` or `Parquet` over CSV/JSON — faster and
schema-preserving.

### Terminal output {#dumping-pretty}

```bash
timeplusd client -q "SELECT * FROM table(events) LIMIT 5 FORMAT PrettyCompact"
timeplusd client -q "SELECT * FROM table(events) LIMIT 1 FORMAT Vertical"   # one column per line
```

### Compress and split {#dumping-pipeline}

```bash
timeplusd client -q "SELECT * FROM table(events) FORMAT CSVWithNames" | gzip > events.csv.gz
timeplusd client -q "SELECT * FROM table(events) FORMAT JSONEachRow"  | zstd > events.ndjson.zst

# 1M-row chunks
timeplusd client -q "SELECT * FROM table(events) FORMAT CSVWithNames" \
  | split -l 1000000 - events_part_
```

## Configuration {#interfaces_cli_configuration}

Options may be passed on the command line or set in a config file;
command-line values win.

### Command-line options {#command-line-options}

| Flag | Description |
| --- | --- |
| `-h, --host` | Server hostname or IP. Default `localhost`. |
| `--port` | Native TCP port. Default `8463` (HTTP uses a different port). |
| `-u, --user` | User. Default `default`. |
| `--password` | Password (empty by default). |
| `--ask-password` | Prompt for the password. |
| `-d, --database` | Default database. |
| `-q, --query` | Query string for batch mode. |
| `--queries-file` | Path to a file with queries to run. |
| `-m, --multiline` | Allow multi-line queries in interactive mode. |
| `-n, --multiquery` | Allow multiple semicolon-separated queries in one batch. |
| `-f, --format` | Default output format (`PrettyCompact` otherwise). |
| `-E, --vertical` | Alias for `--format=Vertical`. |
| `-t, --time` | Print query time to `stderr` in batch mode. |
| `--stacktrace` | Print the server stack trace on exceptions. |
| `--secure` | Connect over TLS. |
| `--config-file` | Path to a config file. |
| `--history_file` | Path to the history file. |
| `--param_<name>` | Value for a [parameterized query](#cli-queries-with-parameters). |
| `--hardware-utilization` | Include hardware stats in the progress bar. |
| `--print-profile-events` | Emit `ProfileEvents` packets. |
| `--profile-events-delay-ms` | Delay between `ProfileEvents` packets (`-1` = totals only, `0` = every packet). |

### Configuration files {#configuration_files}

`timeplusd client` loads the first file that exists, in order:

1. the path passed to `--config-file`
2. `./timeplusd-client.xml`
3. `~/.timeplusd-client/config.xml`
4. `/etc/timeplusd-client/config.xml`

```xml
<config>
    <user>username</user>
    <password>password</password>
    <secure>true</secure>
    <openSSL>
      <client>
        <caConfig>/etc/ssl/cert.pem</caConfig>
      </client>
    </openSSL>
</config>
```

### Query ID {#query-id-format}

Interactive mode prints a query ID for every statement:

```
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```
