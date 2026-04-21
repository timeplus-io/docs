# proton-client

`proton client` is the native CLI for [Timeplus Proton](/proton), shipped in
the single `proton` binary. The alias `proton-client` forwards to
`proton client`.

The CLI shares its flags, configuration, and I/O formats with
[`timeplusd-client`](/timeplusd-client) — see that page for usage, parameterized
queries, and loading/dumping data. Substitute `proton client` for
`timeplusd client` in any example.

:::tip
Connect to Timeplus Proton with `proton-client` and to `timeplusd` in Timeplus
Enterprise with `timeplusd-client`. Mixing them works for basic queries but
hides Enterprise-only features — for example, `proton-client` rejects
`CREATE MUTABLE STREAM` on a [mutable stream](/mutable-stream) at the client
side before the request reaches the server.
:::

## Proton-specific defaults

- **History file:** `~/.proton-client-history`
- **Config files** (first match wins): `--config-file` path → `./proton-client.xml` → `~/.proton-client/config.xml` → `/etc/proton-client/config.xml`
- **Native TCP port:** `8463` (see [Server Ports](/proton-ports))

## Quick start

```bash
# interactive shell
proton client -h 127.0.0.1 --ask-password

# one-shot query
proton client -q "SELECT version()"

# load NDJSON
proton client -q "INSERT INTO events FORMAT JSONEachRow" < events.ndjson

# dump to CSV (wrap the stream with table(...) so the query is bounded)
proton client -q "SELECT * FROM table(events) FORMAT CSVWithNames" > events.csv
```
