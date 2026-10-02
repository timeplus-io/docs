# Timeplus Enterprise 3.4 — What's New

Timeplus Enterprise 3.4 is Timeplus's first **agentic** release. It introduces **Tabby**, a conversational data agent built directly into every workspace, and a new **App Framework** that packages complete real-time solutions — pipelines, dashboards and all — as one-click installable apps. Together they mark a shift from "a streaming SQL engine you query" toward "a streaming data platform you can talk to and extend."

## Highlights at a Glance

- **Tabby, the Timeplus Data Agent** — a chat assistant built into the Console that explores your data, triages pipeline health, proposes and (with your approval) runs DDL, writes its own Python/JavaScript UDFs when SQL isn't enough, remembers facts across conversations, learns reusable procedures ("skills"), and can run standing instructions on a schedule.
- **Human-in-the-loop by design** — Tabby runs every SQL statement as *your* logged-in user, so Timeplus's own role-based access control is always the backstop; writes can require your explicit approval before anything touches the workspace.
- **App Marketplace and App Framework** — browse and install curated, ready-to-run solutions (e.g. Kafka lag monitoring, log analytics) as self-contained apps, complete with pre-built pipelines and dashboards, configurable in a guided install wizard.
- **Bring your own LLM** — Tabby works with OpenAI, Anthropic, and any OpenAI- or Anthropic-compatible endpoint (self-hosted gateways, Ollama, vLLM, Amazon Bedrock), validated against two dozen+ frontier and open models.
- **Extend the agent with external tools** — connect Tabby to your own HTTP-based tool servers (MCP) so it can act outside the workspace, with per-server approval policies.
- **Build and share your own apps** — package streams, materialized views, UDFs and dashboards into a single `.tpapp` file with a declarative manifest; publish privately or to the community catalog.

## Upgrade Notes (read before upgrading)

| Change | Impact |
| :---- | :---- |
| Tabby is **enabled by default** after upgrading | The agent's chat routes, floating panel, and the "Tabby Agent" settings tab appear automatically. Nothing is created inside your workspace and no LLM calls are made until an admin saves an LLM endpoint under Settings → Tabby Agent. Set `enable-agent: false` to hide the feature entirely if you are not ready to adopt it. |
| Tenants that configured Tabby on an **engineering build before 3.4.11** may have a saved response-length limit (`max_tokens`) of 1024 | That low limit now causes longer answers to cut off sooner than most admins expect. If you configured Tabby before upgrading, open Settings → Tabby Agent and raise "Max tokens" — the stored value is kept as-is across the upgrade for safety, it is not auto-raised. |
| Tabby's LLM API key and any connected external-tool secrets are **encrypted at rest** | If you set the `NEUTRON_ENCRYPTION_KEY` environment variable for the first time after already saving an LLM key, the previously saved key cannot be recovered under the new encryption — re-enter it once after upgrading. Without this variable set, a built-in default key is used (fine for evaluation, not recommended for production credentials). |
| The App Marketplace now points at Timeplus's **public catalog** by default | `GET /apps/available` fetches a public, Timeplus-hosted app index out of the box. Air-gapped or private deployments should point `--app-registry-url` at an internal catalog, or expect that endpoint to need outbound internet access. Installing an app directly from a local `.tpapp` file or a URL always works with no registry configured. |
| Installed apps no longer get a `_tp_app_` database prefix | New installs create a database named exactly after the app's own `db_name`. No action needed for existing installs; this only affects naming going forward. |

---

## 1\. Tabby — the Timeplus Data Agent {#tabby-agent}

Every Timeplus Enterprise workspace now ships with **Tabby**, a chat-based data engineering assistant that lives alongside your streams, views and dashboards. Ask it questions in plain English, and it looks at your actual workspace — tables, materialized views, running pipelines, system health — to answer them, propose changes, and (when you let it) make those changes for you.

### 1.1 What Tabby can help with

| You want to… | Tabby… |
| :---- | :---- |
| **Explore your data** | Writes and runs SQL against your workspace, explains the results, and iterates with you. It already knows your catalog of streams, views, materialized views, sources and sinks. |
| **Monitor and diagnose pipelines** | Checks materialized view lag, failures, dead-letter queues, throughput, disk usage and slow or failing queries, using a built-in library of diagnostic recipes. |
| **Build pipelines** | Proposes the DDL for new streams, external streams/tables, materialized views, UDFs and scheduled tasks — and, if you've allowed it, runs that DDL itself, with every write visible to you first. |
| **Write its own tools** | Creates small Python or JavaScript functions on the fly when a plain SQL query can't do the job — for example, to call an external API and enrich your data. |
| **Visualize results** | Drops live or point-in-time charts straight into its answers. |
| **Remember things** | Keeps durable notes — findings, preferences, context — across conversations, scoped to you or shared with your whole workspace. |
| **Learn new procedures** | Saves, refines and reuses step-by-step "skills" (written in plain markdown) so it gets better at your specific workflows over time. |
| **Work unattended** | Runs standing instructions on a schedule, or whenever new data arrives, and reports back in a conversation. |
| **Produce files** | Generates PDFs, CSVs or images from its own code and lets you download them. |

### 1.2 Where to find it

- **The Agent page** (`/agent` in the Console) — a full chat experience: conversation history down the side, a message thread with tool activity and SQL results inline, and an approval flow for anything that would change your workspace.
- **The floating Tabby panel** — available from any Console page as a slide-out drawer, with suggested prompts relevant to whatever page you're on (for example, on the materialized views page it offers to check which views are healthy).
- **Settings → Tabby Agent** — where an admin connects an LLM, sets how much Tabby is allowed to do on its own, and manages memory, skills and external tool connections.

Tabby is on by default, but genuinely inert until an admin saves an LLM connection — no model calls happen, and nothing is created in your workspace, before that first setup step.

### 1.3 Getting started (for admins)

Open **Settings → Tabby Agent** and provide:

- An LLM endpoint: a base URL, model name, and API key for OpenAI, Anthropic, or any compatible gateway.
- A connection test — Tabby verifies the endpoint actually supports tool use before accepting it, since the agent can't function without that.
- A SQL permission level (see below) — how far Tabby is allowed to go on its own.

Once saved, chat opens up to every user in the workspace. Each person's conversations, memories, scheduled tasks and generated files are private to them by default; admins can see everything.

### 1.4 You stay in control of what Tabby can do

Every SQL statement Tabby runs executes **as the signed-in user who asked** — so your existing Timeplus permissions are always the real boundary, not a setting inside the agent. On top of that, an admin chooses one of three permission levels:

| Mode | What happens |
| :---- | :---- |
| **Read-only** (default) | Tabby can look at and summarize your data, but can only *suggest* changes in writing — it never runs anything that modifies your workspace. |
| **Approval required** | Tabby can propose a change and show you the exact statement it wants to run; nothing executes until you click approve. If you decline, Tabby won't retry it. |
| **Unrestricted** | Tabby runs the changes it proposes immediately, with your normal Timeplus role-based permissions as the only guardrail. |

Diagnostic reads (looking at system health, running queries, disk usage, etc.) are always available in every mode — there's nothing to approve for Tabby to tell you how your workspace is doing.

### 1.5 Conversations that feel like chat

- Answers stream in as Tabby works, with its tool calls and SQL results shown inline so you can see exactly what it checked.
- Long or very active conversations load in manageable time windows rather than all at once, with "load earlier" as you scroll back and live updates while a run is in progress.
- Conversations are automatically titled, can be renamed, and can be exported as text or JSON; any answer can be copied with one click.
- If an answer gets cut short by a length limit, Tabby picks up exactly where it left off and marks the answer as continued, so you always get the full response.

### 1.6 Teaching Tabby — Skills

Tabby ships with five built-in "skills" — reusable playbooks it always has on hand:

| Skill | What it teaches Tabby |
| :---- | :---- |
| **Timeplus SQL guide** | How to write Timeplus streaming SQL — streams, materialized views, joins, windows, UDFs, ingestion and sinks. |
| **Pipeline diagnosis** | A library of recipes for triaging pipeline health: materialized view status and lag, throughput, disk and ingestion pressure, failed or slow queries. |
| **UDF toolsmith** | How to write and reuse Python/JavaScript functions as tools, including installing packages and ingesting external data. |
| **Console navigation** | How to link back to the exact page for any stream, view or pipeline it mentions, so you can jump straight to it. |
| **Visualization** | How and when to render a chart in its answer, and which chart type fits the data. |

Beyond the built-ins, Tabby can **write and save its own skills** as it learns your workflows, and your team can install additional skills from a folder, a zip file, or a public GitHub repository. In a shared workspace, a skill written by a regular (non-admin) user is held as a draft until an admin approves it, so your team's shared playbooks stay reviewed. Skills are versioned, and admins can roll back to an earlier version at any time.

### 1.7 Tabby remembers

Tabby can save durable notes to its own memory — a fact about your schema, a preference you stated, a finding from a previous investigation — and recall them in future conversations. Memories are either **private to you** or **shared with your workspace**; Tabby only ever writes to its own memory out loud, in the conversation, so nothing is saved silently behind the scenes. You can review and delete anything Tabby remembers about you (or, if you're an admin, anything shared workspace-wide) from the Memory panel on the Agent page.

### 1.8 Charts and generated files

- Tabby can embed a live or point-in-time chart directly in its answer, and offers to pin it to a dashboard with one click.
- When Tabby's own code produces a file — a report, an export, an image — it's saved as a downloadable artifact attached to the conversation, visible in an Artifacts list.

### 1.9 Standing instructions — background tasks

Ask Tabby to keep an eye on something, and it can turn that into a background task that runs **on a schedule** (for example, every morning) or **whenever matching data arrives**, without you needing to ask again. Each run lands its findings back in a dedicated conversation for that task, and the Console flags when a task has new output to review. Background runs are deliberately more constrained than an interactive chat — they're always read-only and can't modify Tabby's own memory, skills or other tasks, so an unattended run can't quietly expand its own authority.

### 1.10 Connecting external tools (MCP)

Beyond your Timeplus workspace, Tabby can be connected to external tool servers using the Model Context Protocol (MCP) — for example, a server that can look things up in a ticketing system or an internal wiki. An admin registers each server once in Settings → Tabby Agent, and chooses how cautious Tabby should be before using it: always ask first, trust read-only actions, or never ask. Every MCP call Tabby makes is shown to you the same way a SQL approval is, naming the server, the tool, and the exact arguments.

### 1.11 Bring your own model

Tabby works with:

- **OpenAI** and any OpenAI-compatible endpoint — including self-hosted gateways, Ollama, vLLM, and Amazon Bedrock's OpenAI-compatible routes.
- **Anthropic**, including `api.anthropic.com` and Amazon Bedrock's Claude routes.

Timeplus validated Tabby against a broad sweep of current models on Amazon Bedrock. Recommended models include Claude Opus/Sonnet/Haiku, GLM-4.6/4.7/5, Kimi K2.5, DeepSeek v3.1, Mistral Large 3, MiniMax M2.1, and the GPT-5 family. The connection test in Settings → Tabby Agent will reject a model that doesn't support tool calling, since Tabby can't function without it — so a misconfiguration is caught immediately, not three questions into a conversation.

### 1.12 Security and governance, at a glance

- Off switch: `enable-agent: false` removes Tabby's routes, background processing and UI entirely.
- Every tool runs as the authenticated user — Tabby can never see or do more than that person already could in Timeplus.
- Writes are gated by the admin-chosen permission level; in approval mode, nothing runs without a click, and a declined action is never retried silently.
- Your LLM API key and any external-tool secrets are encrypted at rest.
- Tabby is explicitly instructed to treat anything it reads as data, never as an instruction to follow — guarding against a malicious document or query result trying to hijack its behavior.
- Background (unattended) runs are always read-only and cannot modify memory, skills, or other tasks.

---

## 2\. App Framework — install ready-made real-time solutions {#app-framework}

Timeplus Enterprise 3.4 introduces the **App Framework**: a way to package a complete real-time solution — the streams, pipelines and dashboards that solve a specific problem — into a single installable app. If you've used plugin ecosystems like Grafana plugins or Splunk apps, the idea will be familiar: instead of building a pipeline from scratch, you install an app and get a working solution in minutes.

### 2.1 What's in an app

An **app** is a bundle containing everything needed to stand up a solution:

- The data pipeline itself — external streams (your data sources), streams, materialized views, UDFs and scheduled tasks.
- One or more ready-made **dashboards** to visualize the result.
- A small set of configuration fields you fill in at install time (for example, a Kafka broker address or a polling interval).

Everything an app creates lives in its own dedicated database, so installing multiple apps — or the same app twice for different data sources — never collides.

### 2.2 Browsing the App Marketplace

The **Apps** page in the Console has two views:

- **Catalog** — browse apps available to install, grouped into solutions built by Timeplus and solutions shared by the community, with search and category filters. Each card shows whether it's already installed, and flags when a newer version is available.
- **Installed** — the apps already running in your workspace, with their status, version and author at a glance.

By default, the catalog is backed by Timeplus's public app index; your admin can point it at a private, internally hosted catalog instead if your deployment needs to stay offline from the public internet.

### 2.3 Installing an app

Install an app in one of two ways:

- **From the catalog** — pick an app, fill in its configuration form (broker addresses, credentials, thresholds — whatever the app declares it needs), and install.
- **From a file** — drag and drop a `.tpapp` package you downloaded or built yourself onto the install area.

During install, Timeplus walks through the app's requirements — compatible edition and version, any required features — and creates every declared resource. If anything fails partway through, the whole install is rolled back automatically; an app is never left half-installed. Password- and API-key-style configuration fields are masked in the UI and stored as secrets, not as plain configuration.

### 2.4 Upgrading and uninstalling

- **Upgrade** replaces an app's dashboards with the new version's and adds any new pipeline resources, while **never dropping or altering your existing data** — your history is always preserved across an upgrade. Timeplus only lets you upgrade to a strictly newer version, so you can't accidentally downgrade and lose a newer feature.
- **Uninstall** gives you a choice: a clean removal that deletes everything the app created (including its historical data), or a "preserve data" removal that drops the pipeline and dashboards but keeps your streams and their data intact.

### 2.5 Managing an installed app

Each installed app has a detail page with:

- **Configuration** — review and, where supported, edit the values you supplied at install time.
- **Resources** — every stream, view and pipeline the app owns, viewable as a list or as a live data-lineage diagram scoped to just that app.
- **Dashboards** — the app's bundled dashboards, ready to use.
- **Events** — a history log of what the app has done (installed, upgraded, configuration changed), so changes to an app are always auditable.

### 2.6 Building and sharing your own apps

Anyone can package a Timeplus solution as an app:

- An app is a single `.tpapp` archive containing a manifest (`manifest.yaml`) plus the SQL and dashboard definitions it needs.
- The manifest declares the app's identity and version, the Timeplus edition/version it needs, its configuration fields (text, numbers, booleans, dropdowns, multi-select, lists, and masked secrets, each with validation), and every resource it creates — down to streams, materialized views, UDFs, Python package dependencies, and even dedicated storage disks.
- Configuration values can be templated directly into the app's SQL and dashboards (for example, substituting a user-supplied broker address into a `CREATE EXTERNAL STREAM` statement), with a rich library of template helpers available for formatting values.
- Optional metadata — an icon and category tags — control how an app looks and where it's found in the catalog.

This makes it straightforward for a partner, a consulting team, or your own platform team to turn a one-off pipeline you've already built into something that can be installed again — for a new customer, a new environment, or shared with the wider Timeplus community.

### 2.7 Configuration reference (for admins)

| Setting | Default | Purpose |
| :---- | :---- | :---- |
| App registry URL (`--app-registry-url`) | Timeplus's public catalog | Where the Console's catalog view fetches its list of installable apps from. Point this at a private, internally hosted index for air-gapped or security-sensitive deployments. |

---
