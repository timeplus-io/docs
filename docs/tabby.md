---
id: tabby
title: Tabby, the Timeplus Data Agent
---

Every Timeplus Enterprise workspace ships with **Tabby**, a chat-based data engineering assistant that lives alongside your streams, views and dashboards. Ask it questions in plain English, and it looks at your actual workspace — tables, materialized views, running pipelines, system health — to answer them, propose changes, and (when you let it) make those changes for you.

## What Tabby can help with

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

## Where to find it

- **The Agent page** (`/agent` in the Console) — a full chat experience: conversation history down the side, a message thread with tool activity and SQL results inline, and an approval flow for anything that would change your workspace.
- **The floating Tabby panel** — available from any Console page as a slide-out drawer, with suggested prompts relevant to whatever page you're on (for example, on the materialized views page it offers to check which views are healthy).
- **Settings → Tabby Agent** — where an admin connects an LLM, sets how much Tabby is allowed to do on its own, and manages memory, skills and external tool connections.

Tabby is on by default, but genuinely inert until an admin saves an LLM connection — no model calls happen, and nothing is created in your workspace, before that first setup step.

## Getting started (for admins)

Open **Settings → Tabby Agent** and provide:

- An LLM endpoint: a base URL, model name, and API key for OpenAI, Anthropic, or any compatible gateway.
- A connection test — Tabby verifies the endpoint actually supports tool use before accepting it, since the agent can't function without that.
- A SQL permission level (see below) — how far Tabby is allowed to go on its own.

Once saved, chat opens up to every user in the workspace. Each person's conversations, memories, scheduled tasks and generated files are private to them by default; admins can see everything.

## You stay in control of what Tabby can do

Every SQL statement Tabby runs executes **as the signed-in user who asked** — so your existing Timeplus permissions are always the real boundary, not a setting inside the agent. On top of that, an admin chooses one of three permission levels:

| Mode | What happens |
| :---- | :---- |
| **Read-only** (default) | Tabby can look at and summarize your data, but can only *suggest* changes in writing — it never runs anything that modifies your workspace. |
| **Approval required** | Tabby can propose a change and show you the exact statement it wants to run; nothing executes until you click approve. If you decline, Tabby won't retry it. |
| **Unrestricted** | Tabby runs the changes it proposes immediately, with your normal Timeplus role-based permissions as the only guardrail. |

Diagnostic reads (looking at system health, running queries, disk usage, etc.) are always available in every mode — there's nothing to approve for Tabby to tell you how your workspace is doing.

## Conversations that feel like chat

- Answers stream in as Tabby works, with its tool calls and SQL results shown inline so you can see exactly what it checked.
- Long or very active conversations load in manageable time windows rather than all at once, with "load earlier" as you scroll back and live updates while a run is in progress.
- Conversations are automatically titled, can be renamed, and can be exported as text or JSON; any answer can be copied with one click.
- If an answer gets cut short by a length limit, Tabby picks up exactly where it left off and marks the answer as continued, so you always get the full response.

## Teaching Tabby — Skills

Tabby ships with five built-in "skills" — reusable playbooks it always has on hand:

| Skill | What it teaches Tabby |
| :---- | :---- |
| **Timeplus SQL guide** | How to write Timeplus streaming SQL — streams, materialized views, joins, windows, UDFs, ingestion and sinks. |
| **Pipeline diagnosis** | A library of recipes for triaging pipeline health: materialized view status and lag, throughput, disk and ingestion pressure, failed or slow queries. |
| **UDF toolsmith** | How to write and reuse Python/JavaScript functions as tools, including installing packages and ingesting external data. |
| **Console navigation** | How to link back to the exact page for any stream, view or pipeline it mentions, so you can jump straight to it. |
| **Visualization** | How and when to render a chart in its answer, and which chart type fits the data. |

Beyond the built-ins, Tabby can **write and save its own skills** as it learns your workflows, and your team can install additional skills from a folder, a zip file, or a public GitHub repository. In a shared workspace, a skill written by a regular (non-admin) user is held as a draft until an admin approves it, so your team's shared playbooks stay reviewed. Skills are versioned, and admins can roll back to an earlier version at any time.

## Tabby remembers

Tabby can save durable notes to its own memory — a fact about your schema, a preference you stated, a finding from a previous investigation — and recall them in future conversations. Memories are either **private to you** or **shared with your workspace**; Tabby only ever writes to its own memory out loud, in the conversation, so nothing is saved silently behind the scenes. You can review and delete anything Tabby remembers about you (or, if you're an admin, anything shared workspace-wide) from the Memory panel on the Agent page.

## Charts and generated files

- Tabby can embed a live or point-in-time chart directly in its answer, and offers to pin it to a dashboard with one click.
- When Tabby's own code produces a file — a report, an export, an image — it's saved as a downloadable artifact attached to the conversation, visible in an Artifacts list.

## Standing instructions — background tasks

Ask Tabby to keep an eye on something, and it can turn that into a background task that runs **on a schedule** (for example, every morning) or **whenever matching data arrives**, without you needing to ask again. Each run lands its findings back in a dedicated conversation for that task, and the Console flags when a task has new output to review. Background runs are deliberately more constrained than an interactive chat — they're always read-only and can't modify Tabby's own memory, skills or other tasks, so an unattended run can't quietly expand its own authority.

## Connecting external tools (MCP)

Beyond your Timeplus workspace, Tabby can be connected to external tool servers using the Model Context Protocol (MCP) — for example, a server that can look things up in a ticketing system or an internal wiki. An admin registers each server once in Settings → Tabby Agent, and chooses how cautious Tabby should be before using it: always ask first, trust read-only actions, or never ask. Every MCP call Tabby makes is shown to you the same way a SQL approval is, naming the server, the tool, and the exact arguments.

## Bring your own model

Tabby works with:

- **OpenAI** and any OpenAI-compatible endpoint — including self-hosted gateways, Ollama, vLLM, and Amazon Bedrock's OpenAI-compatible routes.
- **Anthropic**, including `api.anthropic.com` and Amazon Bedrock's Claude routes.

Timeplus validated Tabby against a broad sweep of current models on Amazon Bedrock. Recommended models include Claude Opus/Sonnet/Haiku, GLM-4.6/4.7/5, Kimi K2.5, DeepSeek v3.1, Mistral Large 3, MiniMax M2.1, and the GPT-5 family — this list moves quickly as new models ship, so check Settings → Tabby Agent for the current recommendations rather than relying solely on this page. The connection test in Settings → Tabby Agent will reject a model that doesn't support tool calling, since Tabby can't function without it — so a misconfiguration is caught immediately, not three questions into a conversation.

## Configuration reference (for admins)

| Setting | Where | Purpose |
| :---- | :---- | :---- |
| `enable-agent` (default `true`) | Appserver `config.yaml` (see [server configuration](/server_config#appserver)) | Set to `false` to remove Tabby's routes, background processing and UI entirely. |
| `NEUTRON_ENCRYPTION_KEY` | Appserver environment variable | Encrypts Tabby's LLM API key and any connected external-tool secrets at rest. Without it, a built-in default key is used (fine for evaluation, not recommended for production credentials). |
| `timeplusAppserver.encryptionKey` / `timeplusAppserver.existingEncryptionKeySecret` | Helm chart values | Helm equivalents of `NEUTRON_ENCRYPTION_KEY` for Kubernetes deployments. |

If you set `NEUTRON_ENCRYPTION_KEY` for the first time *after* already saving an LLM key, that previously saved key cannot be recovered under the new encryption — re-enter it once after making the change.

## Security and governance, at a glance

- Off switch: `enable-agent: false` in the appserver's `config.yaml` removes Tabby's routes, background processing and UI entirely.
- Every tool runs as the authenticated user — Tabby can never see or do more than that person already could in Timeplus.
- Writes are gated by the admin-chosen permission level; in approval mode, nothing runs without a click, and a declined action is never retried silently.
- Your LLM API key and any external-tool secrets are encrypted at rest.
- Tabby is explicitly instructed to treat anything it reads as data, never as an instruction to follow — guarding against a malicious document or query result trying to hijack its behavior.
- Background (unattended) runs are always read-only and cannot modify memory, skills, or other tasks.

## See also

* [What's New in Timeplus Enterprise 3.4](/enterprise-v3.4-whats-new) — Tabby's initial 3.4 release notes and upgrade notes.
* [App Framework](/app-framework) — install ready-made real-time solutions alongside Tabby.
