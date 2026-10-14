# Timeplus Apps

Timeplus Enterprise 3.4 introduces the **App Framework**: a way to package a complete real-time solution, meaning the streams, pipelines and dashboards that solve one specific problem, into a single installable **app**. If you have used plugin ecosystems such as Grafana plugins or Splunk apps, the idea will be familiar. Instead of building a pipeline from scratch, you install an app and get a working solution in minutes.

This page is for people who install and operate apps. If you want to package your own solution as an app, see [Building Apps](/app-framework-build).

## What an app is

An app is a `.tpapp` package (a zip archive) that bundles everything needed to stand up a solution:

- **The data pipeline**: external streams for your data sources, streams, materialized views, views, UDFs, scheduled tasks, alerts and inputs.
- **One or more dashboards** to visualize the result.
- **A small set of configuration fields** you fill in at install time, for example a broker address, an API key or a polling interval.
- **Python packages** the pipeline needs, installed before any resource is created.

Everything an app creates lives in its own **dedicated database**, named after the app's `db_name`. Installing several apps, or inspecting what one app owns, never collides with your other work. UDFs, named collections and format schemas are global in Timeplus and are the exception. They are created without a database prefix.

Timeplus publishes a growing set of apps you can browse at [timeplus-io.github.io/apps](https://timeplus-io.github.io/apps/). At the 3.4 release they include real-time crypto market data from Coinbase, a WorldQuant Alpha 101 streaming demo, GitHub public events, Hacker News ingestion, complex event processing for fraud detection, Cisco ASA DDoS detection, a game analytics feature pipeline, AWS cost monitoring, a GeoIP lookup, NYC taxi fleet tracking, OCSF security events, and [AgentGuard](/agentguard-introduction), which is itself distributed as an app.

## The Apps page

Open **Apps** in the Console sidebar. The page lists the apps available from the registry together with the apps already installed in your workspace. Each card shows the app's icon, name, version, author and description. Cards for installed apps show their status, and a card shows an **Update Available** badge when the registry has a newer version than the one you have installed.

Use the controls at the top to narrow the list:

- **Search** by name or description.
- **Category** filters on the free-form tags an app declares, such as `security`, `finance` or `observability`.
- **Support Type** separates apps published by Timeplus from apps shared by the community. Any app whose author is not Timeplus is shown as Community.

## Installing an app

There are two ways to install:

- **From the catalog**: pick an app card and click **Install**. Timeplus downloads the package from the registry.
- **From a file**: click **Upload App** and choose a `.tpapp` package you downloaded or built yourself. Only `.tpapp` files are accepted.

Either way, Timeplus reads the package's manifest and shows a configuration form with one field per declared setting. Required fields are marked, defaults are pre-filled, list fields take one item per line, and fields the app marks as secret are masked. Fill in the form and click **Install**.

During the install Timeplus:

1. Validates the manifest and your configuration values against their declared types.
2. Installs any Python packages the app declares and waits for them to finish.
3. Creates the app's database and then every declared resource, in the order the manifest lists them.
4. Creates the app's dashboards.

If anything fails part-way, everything created so far is rolled back in reverse order and the app is not left half-installed. The error names the resource that failed, for example `provision mv_coinbase_1s: ...`, so the author can fix the package.

Configuration values are stored with the app. Values marked secret are stored as secrets and are shown masked in the Console. Note that a value rendered into a resource definition, for example a URL inside a `CREATE EXTERNAL STREAM` statement, is visible to anyone who can run `SHOW CREATE` on that resource. See [Building Apps](/app-framework-build#keeping-secrets-out-of-resource-definitions) for the pattern app authors use to avoid this.

### App status

| Status | Meaning |
| :---- | :---- |
| `installed` | The app is installed and its resources exist. This is the normal state. |
| `upgrading` | An upgrade is in progress. |
| `uninstalling` | An uninstall is in progress. |
| `failed` | An install or upgrade failed after rollback. See the Events Log on the detail page for the error. A failed upgrade can be retried. |

## Upgrading an app

When the registry has a newer version of an installed app, the card shows **Update Available** and you can upgrade from it. Through the REST API you can also upgrade from a `.tpapp` file or a URL.

An upgrade:

- **Never drops or alters your data.** The app's database and existing streams are left untouched, so history is preserved.
- **Adds new resources.** Every DDL file in the new package is run again against the existing database. Well-formed packages write `CREATE ... IF NOT EXISTS`, so resources that already exist are skipped and new ones are created. Existing streams, views and materialized views are not modified, and resources removed from the new package are not dropped. UDFs are usually written with `CREATE OR REPLACE FUNCTION`, so their body is updated.
- **Replaces dashboards.** The old dashboards are deleted and the new package's dashboards are created, because dashboards carry no user data.
- **Is forward-only.** Timeplus rejects a package whose version is not strictly greater than the installed one, so you cannot downgrade by accident.
- **Rolls back on failure.** Newly created resources are dropped and the app is marked `failed`. If the failure happened after the old dashboards were deleted, the data is intact but the dashboards are gone until you retry.

## Uninstalling an app

Click **Delete** on an installed app. Timeplus removes the app's dashboards, drops every resource it created in reverse order, and drops the app's database, including all historical data.

Through the REST API you can instead keep the data: pass `preserve_data=true` to the delete endpoint and Timeplus keeps the app's streams and external tables and drops everything else, including materialized views, views, mutable streams, UDFs, tasks and alerts. This option is not available in the Console.

## Managing an installed app

Click an installed app to open its detail page. The header shows the status, version, author, description, database name, and when it was created and last modified. Four tabs follow:

- **Configuration**: the values you supplied at install time. Secret values are masked. Configuration cannot be edited after install. To change a value, uninstall and reinstall the app.
- **Resources**: every stream, view, pipeline, UDF and other resource the app owns, as a **List** with links to each resource's own page, or as a **Lineage** diagram scoped to just that app.
- **Dashboard**: the app's bundled dashboards, ready to open.
- **Events Log**: a history of what has happened to the app, including install, upgrade and uninstall with their started, completed or failed status, who performed them, and error details.

## Configuring the registry

The Apps page fetches its catalog from a registry URL, configured in the appserver's `config.yaml` (see [Timeplus Appserver configuration](/server_config#appserver)):

| Setting | Default | Purpose |
| :---- | :---- | :---- |
| `app-registry-url` (or `--app-registry-url`) | `https://github.com/timeplus-io/apps/releases/latest/download/index.json` | URL of a JSON index listing installable apps. |

The default points at Timeplus's public catalog, which is published from the [timeplus-io/apps](https://github.com/timeplus-io/apps) repository on GitHub. Fetching it needs outbound internet access from the appserver. If the registry is unreachable, the Apps page shows "App registry unavailable" and installed apps are still listed and manageable.

Air-gapped or security-sensitive deployments can point the setting at an internal index. The index is a JSON array where each entry is an app manifest plus a `download_url` for its `.tpapp` file. The apps repository includes a small `registry/server.py` that serves such an index from a folder of packages, and `registry/build.py` that generates one. Installing from an uploaded `.tpapp` file always works with no registry configured.

## REST API

Everything the Console does is available over REST under `/{tenant}/api/v1beta2/apps`:

| Action | Endpoint |
| :---- | :---- |
| List installed apps | `GET /apps` |
| List apps available from the registry | `GET /apps/available` |
| Install from a file or URL | `POST /apps/install` (multipart `file`, or JSON body with `url`) |
| Get, delete an app | `GET /apps/{app_id}`, `DELETE /apps/{app_id}?preserve_data=true` |
| Upgrade an app | `POST /apps/{app_id}/upgrade` (same body as install) |
| Read configuration | `GET /apps/{app_id}/config` |
| List lifecycle events | `GET /apps/{app_id}/events` |

Configuration values are passed at install time as `config[<key>]=<value>` multipart fields, or as a `config` object in the JSON body:

```bash
# Install from a local package, overriding two settings
curl -X POST http://localhost:8000/default/api/v1beta2/apps/install \
  -F "file=@market-data.tpapp" \
  -F 'config[product_ids]=["BTC-USD","ETH-USD"]'

# Install from a URL
curl -X POST http://localhost:8000/default/api/v1beta2/apps/install \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/timeplus-io/apps/releases/latest/download/cep.tpapp"}'
```

See the [REST API reference](pathname:///rest.html) for request and response schemas.
