---
id: app-framework
title: App Framework and App Marketplace
---

The **App Framework** packages a complete real-time solution — the streams, pipelines and dashboards that solve a specific problem — into a single installable app. If you've used plugin ecosystems like Grafana plugins or Splunk apps, the idea will be familiar: instead of building a pipeline from scratch, you install an app and get a working solution in minutes.

## What's in an app

An **app** is a bundle containing everything needed to stand up a solution:

- The data pipeline itself — external streams (your data sources), streams, materialized views, UDFs and scheduled tasks.
- One or more ready-made **dashboards** to visualize the result.
- A small set of configuration fields you fill in at install time (for example, a Kafka broker address or a polling interval).

Everything an app creates lives in its own dedicated database, so installing multiple apps — or the same app twice for different data sources — never collides.

## Browsing the App Marketplace

The **Apps** page in the Console has two views:

- **Catalog** — browse apps available to install, grouped into solutions built by Timeplus and solutions shared by the community, with search and category filters. Each card shows whether it's already installed, and flags when a newer version is available.
- **Installed** — the apps already running in your workspace, with their status, version and author at a glance.

By default, the catalog is backed by Timeplus's public app index; your admin can point it at a private, internally hosted catalog instead if your deployment needs to stay offline from the public internet (see Configuration reference below).

## Installing an app

Install an app in one of two ways:

- **From the catalog** — pick an app, fill in its configuration form (broker addresses, credentials, thresholds — whatever the app declares it needs), and install.
- **From a file** — drag and drop a `.tpapp` package you downloaded or built yourself onto the install area.

During install, Timeplus walks through the app's requirements — compatible edition and version, any required features — and creates every declared resource. If anything fails partway through, the whole install is rolled back automatically; an app is never left half-installed. Password- and API-key-style configuration fields are masked in the UI and stored as secrets, not as plain configuration.

## Upgrading and uninstalling

- **Upgrade** replaces an app's dashboards with the new version's and adds any new pipeline resources, while **never dropping or altering your existing data** — your history is always preserved across an upgrade. Timeplus only lets you upgrade to a strictly newer version, so you can't accidentally downgrade and lose a newer feature.
- **Uninstall** gives you a choice: a clean removal that deletes everything the app created (including its historical data), or a "preserve data" removal that drops the pipeline and dashboards but keeps your streams and their data intact.

## Managing an installed app

Each installed app has a detail page with:

- **Configuration** — review and, where supported, edit the values you supplied at install time.
- **Resources** — every stream, view and pipeline the app owns, viewable as a list or as a live data-lineage diagram scoped to just that app.
- **Dashboards** — the app's bundled dashboards, ready to use.
- **Events** — a history log of what the app has done (installed, upgraded, configuration changed), so changes to an app are always auditable.

:::note
Prior to 3.4, installed apps got a `_tp_app_` database prefix. Starting in 3.4, new installs create a database named exactly after the app's own `db_name`. This is a naming change going forward only — existing installs from before 3.4 are unaffected and need no action.
:::

## Building and sharing your own apps

Anyone can package a Timeplus solution as an app:

- An app is a single `.tpapp` archive containing a manifest (`manifest.yaml`) plus the SQL and dashboard definitions it needs.
- The manifest declares the app's identity and version, the Timeplus edition/version it needs, its configuration fields (text, numbers, booleans, dropdowns, multi-select, lists, and masked secrets, each with validation), and every resource it creates — down to streams, materialized views, UDFs, Python package dependencies, and even dedicated storage disks.
- Configuration values can be templated directly into the app's SQL and dashboards (for example, substituting a user-supplied broker address into a `CREATE EXTERNAL STREAM` statement), with a rich library of template helpers available for formatting values.
- Optional metadata — an icon and category tags — control how an app looks and where it's found in the catalog.

This makes it straightforward for a partner, a consulting team, or your own platform team to turn a one-off pipeline you've already built into something that can be installed again — for a new customer, a new environment, or shared with the wider Timeplus community.

### Manifest field reference

| Field group | Covers |
| :---- | :---- |
| **Identity & version** | App name, version, author, icon and category tags. |
| **Compatibility** | Minimum/required Timeplus edition and version. |
| **Configuration fields** | Text, number, boolean, dropdown, multi-select, list, and masked-secret field types, each with validation rules. |
| **Declared resources** | Streams, external streams, materialized views, UDFs, Python package dependencies, scheduled tasks, and dedicated storage disks. |
| **Dashboards** | One or more bundled dashboard definitions. |
| **Templating** | Config values substituted into SQL and dashboard definitions via a library of template helpers. |

## Configuration reference (for admins)

| Setting | Default | Purpose |
| :---- | :---- | :---- |
| App registry URL (`--app-registry-url`, or `app-registry-url` in appserver `config.yaml`) | Timeplus's public catalog | Where the Console's catalog view fetches its list of installable apps from. Point this at a private, internally hosted index for air-gapped or security-sensitive deployments — the public default needs outbound internet access. Installing an app directly from a local `.tpapp` file or a URL always works with no registry configured. |

## See also

* [What's New in Timeplus Enterprise 3.4](/enterprise-v3.4-whats-new) — the App Framework's initial 3.4 release notes and upgrade notes.
* [Tabby, the Timeplus Data Agent](/tabby) — Tabby can help you diagnose and build the pipelines an app installs.
