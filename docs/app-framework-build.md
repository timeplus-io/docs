# Building Apps

This page explains how to package a Timeplus solution you have already built, meaning its streams, materialized views, UDFs and dashboards, into an installable `.tpapp` app. For installing and operating apps, see [Timeplus Apps](/app-framework).

Anyone can build an app: a partner, a consulting team, or your own platform team turning a one-off pipeline into something that can be installed again for a new environment or shared with the community. The [timeplus-io/apps](https://github.com/timeplus-io/apps) repository holds the apps Timeplus publishes and is the best place to copy a working example from.

## Package layout

A `.tpapp` is a zip archive with this structure:

```
my-app/
├── manifest.yaml          # required
├── ddl/
│   ├── 001_source.sql     # one SQL statement per file, run in the order the manifest lists them
│   ├── 002_events.sql
│   └── 003_mv.sql
└── dashboards/
    └── main.json          # a dashboard definition
```

Package and install it:

```bash
cd my-app && zip -r ../my-app.tpapp manifest.yaml ddl/ dashboards/

curl -X POST http://localhost:8000/default/api/v1beta2/apps/install \
  -F "file=@../my-app.tpapp" \
  -F "config[websocket_url]=wss://example.com/feed"
```

Any multipart field named `config[<key>]` supplies a configuration value. For a JSON-body install from a URL, pass `{"url": "...", "config": {"key": "value"}}` instead.

## The manifest

`manifest.yaml` declares the app's identity, its configuration fields and every resource it creates:

```yaml
package_format_version: 1          # must be 1
id: io.example.my-app              # reverse-domain, unique across apps
name: My App
version: 1.0.0                     # semver; upgrades must increase it
author: Acme
description: What this app does.
icon: "data:image/svg+xml;base64,..."   # optional
categories:                        # optional, free-form tags shown as filters
  - security
  - observability
db_name: my_app                    # ^[a-z][a-z0-9_]{0,31}$, the app's database

config:                            # optional, fields the installer asks for
  - key: websocket_url
    type: string
    required: true
    description: WebSocket feed URL
  - key: api_key
    type: string
    required: true
    secret: true                   # masked in the UI, stored as a secret
    description: API key
  - key: timeout
    type: integer
    required: false
    default: "30"
    description: Connection timeout in seconds

python_packages:                   # optional, installed before any DDL runs
  - websocket-client>=1.4.0

resources:                         # created in this order, dropped in reverse
  - file: ddl/001_source.sql
    type: external_stream
    name: raw_feed
  - file: ddl/002_events.sql
    type: stream
    name: events
  - file: ddl/003_mv.sql
    type: materialized_view
    name: mv_events

dashboards:
  - file: dashboards/main.json
    name: My Dashboard
    description: Real-time view
```

`package_format_version`, `id` and `db_name` are required. Everything else is optional, though an app without resources does nothing. The `name` of each resource must match the identifier the DDL file creates, because the installer uses it to build the `DROP` statement for rollback and uninstall. Quote any value containing `#`, otherwise YAML treats the rest of the line as a comment.

### Configuration fields

Each entry under `config` becomes a field in the install form. Seven types are supported. Omitting `type` means `string`.

| Type | Stored as | Example | Notes |
| :---- | :---- | :---- | :---- |
| `string` | plain string | `"localhost:9092"` | Default. The only type that may be marked `secret: true`. |
| `integer` | decimal string | `"30"`, `"-5"` | Whole numbers only. |
| `float` | decimal string | `"3.14"`, `"30"` | |
| `bool` | `"true"` or `"false"` | `"true"` | No other spellings are accepted. |
| `list` | JSON array of strings | `'["a","b"]'` | The Console collects one item per line. Comma-separated strings are rejected. |
| `choice` | one of `options` | `"kafka"` | Requires an `options` list. |
| `multi_choice` | JSON array, each in `options` | `'["kafka","pulsar"]'` | Requires an `options` list. |

Defaults are always written as strings and must be a valid encoding for the declared type, for example `default: "30"` for an integer or `default: '["metrics"]'` for a `multi_choice`. Timeplus validates the manifest when the package is parsed, and validates the user's values at install and upgrade time, so a bad value fails fast with a message naming the key.

### Resource types

| `type` | Created with | Dropped with |
| :---- | :---- | :---- |
| `stream` | `CREATE STREAM` | `DROP STREAM` |
| `mutable_stream` | `CREATE MUTABLE STREAM` | `DROP STREAM` |
| `external_stream` | `CREATE EXTERNAL STREAM` | `DROP STREAM` |
| `external_table` | `CREATE TABLE` | `DROP TABLE` |
| `materialized_view` | `CREATE MATERIALIZED VIEW` | `DROP VIEW` |
| `view` | `CREATE VIEW` | `DROP VIEW` |
| `udf` | `CREATE FUNCTION` | `DROP FUNCTION` |
| `task` | `CREATE TASK` | `DROP TASK` |
| `alert` | `CREATE ALERT` | `DROP ALERT` |
| `input` | `CREATE INPUT` | `DROP INPUT` |
| `dictionary` | `CREATE DICTIONARY` | `DROP DICTIONARY` |
| `format_schema` | `CREATE FORMAT SCHEMA` | `DROP FORMAT SCHEMA` |
| `named_collection` | `CREATE NAMED COLLECTION` | `DROP NAMED COLLECTION` |
| `system` | any raw statement, such as `INSERT`, `SYSTEM ...` or `GRANT` | not dropped |

A `system` resource is a statement that is run at install time but is not something Timeplus can drop later. Because such statements usually depend on a resource created a step earlier, the installer retries them while that resource settles.

UDFs, format schemas and named collections are **global** in Timeplus. Never prefix their names with the database, in the DDL or in the manifest. Pick names that include your `db_name` so two apps on the same cluster do not collide.

## Templating

DDL files are rendered with Go `text/template` using `{{ }}` delimiters before they run:

| Expression | Expands to |
| :---- | :---- |
| `{{ .DB }}` | The app's database name, the value of `db_name`. |
| `{{ .Config.key_name }}` | The value of a configuration key, after defaults are applied. |

```sql
-- ddl/001_source.sql
CREATE EXTERNAL STREAM IF NOT EXISTS {{ .DB }}.raw_feed (msg string)
SETTINGS type='websocket', url='{{ .Config.websocket_url }}';
```

```sql
-- ddl/002_events.sql
CREATE STREAM IF NOT EXISTS {{ .DB }}.events (
  id       string,
  payload  string
)
TTL to_datetime(_tp_time) + INTERVAL {{ .Config.retention_hours }} HOUR;
```

Dashboard JSON files are rendered with `[[ ]]` delimiters instead, because `{{ }}` is reserved for the dashboard's own runtime filter variables such as `{{filter_time_range}}`, which are left as-is:

```json
{
  "viz_content": "SELECT * FROM [[ .DB ]].events WHERE _tp_time > now() - {{filter_time_range}}"
}
```

Both template kinds have the full [Sprig](https://masterminds.github.io/sprig/) function library available, the same one Helm uses. The functions you will reach for most work with `list` values, which arrive as a JSON array string:

| Need | Expression | Result |
| :---- | :---- | :---- |
| Comma-separated string | `[[ join "," (fromJson .Config.product_ids) ]]` | `BTC-USD,ETH-USD` |
| First element | `[[ index (fromJson .Config.product_ids) 0 ]]` | `BTC-USD` |
| Embed as JSON array | `'{{ .Config.product_ids }}'` | `'["BTC-USD","ETH-USD"]'` |
| Safely quote a value | `{{ .Config.api_key \| quote }}` | `"..."` with inner quotes escaped |
| Fallback | `{{ default "30" .Config.timeout }}` | the value or `30` |

Template processing runs before the dashboard JSON is parsed, so template expressions inside JSON strings may contain unescaped quotes.

## Writing DDL that survives upgrades

An upgrade runs **every DDL file again** against the existing database. The installer does not drop resources first, so a `CREATE` that fails on the second run breaks the upgrade with `already exists`. Follow these rules:

- **Every resource except UDFs**: use `CREATE ... IF NOT EXISTS`. Re-running is a no-op, and existing rows, downstream consumers and the resource's identity are preserved. This matters most for views and materialized views, which other resources and dashboards reference by name.
- **UDFs**: use `CREATE OR REPLACE FUNCTION`. The function body is typically what changes in an upgrade, and `IF NOT EXISTS` would silently keep the old code.
- **Never use `CREATE OR REPLACE VIEW`.** It drops and recreates the view, breaking every materialized view, dashboard panel and query that depends on it. If a view's definition must change, bump the app version and treat it as a migration: drop and recreate explicitly, or version the view name.
- **One statement per file.** Multi-statement files are rejected.
- **Declare Python packages in the manifest**, not as `SYSTEM INSTALL PYTHON PACKAGE` DDL. The installer installs them and waits before running any DDL, and the SQL form has no rollback.

Upgrades are additive for SQL resources. Changing a stream's columns or settings, or removing a resource that the old version created, is not done by the installer and needs manual intervention.

## Dashboards

Each dashboard file is a JSON array of panel objects using the same format the Console's dashboard editor saves: `id`, `title`, `position` on a 12-column grid, `viz_type`, `viz_content` (the SQL) and `viz_config`. Chart types include `line`, `area`, `bar`, `column`, `singleValue`, `table`, `ohlc`, `geo`, `md` and the grammar-driven `grammar` type, plus `selector` and `text_input` control panels for filters.

The quickest way to produce one is to build the dashboard in the Console, export its JSON, then replace the database name with `[[ .DB ]]`. The full panel specification, with every `viz_config` field per chart type and worked examples, is in the apps repository at [skill/references/dashboard-spec.md](https://github.com/timeplus-io/apps/blob/main/skill/references/dashboard-spec.md). For the dashboard feature itself, see [Data Visualization](/viz).

One caution: the Console loads a dashboard in its rendered form. If a user edits an app's dashboard in the Console and you copy that JSON back into your package, any `[[ ]]` expressions will have been replaced by their rendered values. Diff before committing.

## Icon and categories

`icon` is an optional base64 data URI, for example `data:image/svg+xml;base64,...`. It must start with `data:image/` and contain `;base64,` followed by a payload, otherwise the install fails. SVG is the best format. The Console renders icons as rounded squares and, when none is given, shows a default white outline on a pink-to-purple gradient. Icons that match that style look native:

```bash
echo "data:image/svg+xml;base64,$(base64 -i icon.svg | tr -d '\n')"
```

`categories` is an optional list of free-form tags. The Apps page offers them as a filter. Reuse the tags existing apps use, such as `analytics`, `finance`, `security` and `observability`, so your app shows up alongside related ones.

## Keeping secrets out of resource definitions

Marking a configuration key `secret: true` masks it in the install form and stores it as a secret. But once the value is rendered into a DDL file through `{{ .Config.key }}`, it is stored verbatim in the resource definition, and anyone with `SHOW CREATE` privilege on that resource sees it in clear text. This matters most for Python external streams, where credentials naturally end up inside the Python body.

The pattern used by the Timeplus-published apps is to put the secret in a **named collection** and have the engine inject it into the stream's init function at runtime:

```sql
-- ddl/000_creds.sql, listed in the manifest before the stream that uses it
CREATE NAMED COLLECTION IF NOT EXISTS my_app_creds AS
  init_function_parameters = '{"api_key":{{ .Config.api_key | quote }}}'
  NOT OVERRIDABLE;
```

```sql
-- ddl/001_poller.sql
CREATE EXTERNAL STREAM IF NOT EXISTS {{ .DB }}.poller (...)
AS $$
import json
API_KEY = ""

def _tp_init(params):
    global API_KEY
    API_KEY = json.loads(params)["api_key"]

def poll():
    # API_KEY is available here
    ...
$$
SETTINGS type='python', mode='streaming', read_function_name='poll',
         init_function_name='_tp_init', named_collection='my_app_creds';
```

`SHOW CREATE EXTERNAL STREAM` then shows only `named_collection='my_app_creds'`. Use `| quote` on every interpolated secret so the JSON stays valid. Named collections are global, so include your `db_name` in the collection name. Note that the raw value is still readable from `system.named_collections` by anyone with that privilege, and that a stream captures the collection's values when it is created, so changing the collection later does not affect an existing stream. The full walkthrough with caveats is in the apps repository's [builder skill](https://github.com/timeplus-io/apps/blob/main/skill/SKILL.md).

## Common install failures

Install errors are prefixed with the resource that failed, for example `provision mv_events: ...`, so you know which DDL file to look at.

| Error | Cause and fix |
| :---- | :---- |
| `Code: 57 ... already exists` on upgrade | A `CREATE` without `IF NOT EXISTS`. See [Writing DDL that survives upgrades](#writing-ddl-that-survives-upgrades). |
| `Multi-statements are not allowed` | More than one statement in a DDL file. Split them. |
| `Column window_start is reserved` | `window_start` and `window_end` are generated by `tumble` and `hop`. Name your column `time` and alias in the materialized view. |
| `failed at position N ('.')` creating a function or format schema | A `{{ .DB }}.` prefix on a global resource. Remove it. |
| `Unknown function nullif` | Timeplus uses snake_case names such as `null_if`, `count_if` and `array_element`. The install validator is stricter than an ad-hoc query. |
| `Missing columns: '_tp_time'` in a dashboard panel | Views that alias `window_start AS time` do not expose `_tp_time`. Filter on `time` instead. |
| Dashboard or resource name cut off at `#` | Unquoted `#` in YAML. Quote the value. |
| `invalid icon` | The icon is not a `data:image/...;base64,...` URI. |

## Publishing

To share an app with the community, open a pull request to [timeplus-io/apps](https://github.com/timeplus-io/apps) adding an `apps/<your-app>/` folder with `manifest.yaml`, `ddl/`, `dashboards/` and a README. The repository's release workflow builds every app into a `.tpapp`, publishes them as GitHub release assets, and regenerates the `index.json` that Timeplus deployments fetch by default, so your app appears in every Apps page that uses the public registry.

To host a private catalog instead, serve a JSON array where each entry is an app manifest plus a `download_url`, and point the appserver's `app-registry-url` at it. The repository's `registry/build.py` generates such an index from a folder of apps, and `registry/server.py` serves one. See [Configuring the registry](/app-framework#configuring-the-registry).
