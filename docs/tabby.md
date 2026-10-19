# Tabby, the Timeplus Data Agent

**Tabby** is the conversational data agent built into every Timeplus Enterprise workspace, starting with release 3.4. It is a chat surface in the Timeplus Console, backed by an LLM-driven agent that runs inside the Timeplus appserver and works directly against your own Timeplus engine. You bring the model: any OpenAI-compatible endpoint, or the Anthropic Messages API, including Amazon Bedrock. Timeplus brings the workspace knowledge, the SQL tooling, the safety rails and the memory.

Ask Tabby a question in plain English and it looks at your actual workspace, including streams, materialized views, running pipelines and system health, to answer it, propose changes and, when you allow it, make those changes for you.

Tabby is on by default in 3.4, but it is inert until an administrator saves an LLM endpoint in the Console. No model calls are made and nothing is created in your workspace before that first setup step.

## Where to find Tabby

- **The Tabby page** (`/agent` in the Console): a full chat experience with a conversation list, message history, approval cards, tool-call cards with SQL result tables, collapsible reasoning, chart blocks and artifact download cards.
- **A floating Tabby panel on every Console page**: the same chat in a slide-out drawer, with suggested prompts that follow the page you are on. On the materialized views page, for example, it offers to check which views are running, which are unhealthy and what they depend on.
- **Workspace settings → Tabby Agent**: where an administrator connects an LLM, sets how much Tabby is allowed to do on its own, adjusts budgets, and manages external tool (MCP) servers. This tab is visible only when the agent is enabled on the server.
- **Memory, Skills and Artifacts sheets** on the Tabby page, for reviewing what Tabby has remembered, learned and produced.

## What Tabby can do

| You want to… | Tabby… |
| :---- | :---- |
| **Explore your data** | Writes and runs Timeplus SQL against your workspace, explains the results and iterates with you. It already knows your catalog of streams, views, materialized views, sources and sinks. |
| **Monitor and diagnose pipelines** | Checks materialized view lag, failures, dead-letter queues, throughput, disk usage, ingest pressure and slow or failing queries, using a built-in library of diagnostic recipes over the engine's `system` tables. |
| **Build pipelines** | Proposes the DDL for streams, external streams and tables, materialized views, UDFs and tasks, and runs it under an administrator-chosen write mode, with per-statement approval available. |
| **Write its own tools** | Creates Python or JavaScript UDFs as reusable tools when SQL alone cannot do the job, for example to call an external API and enrich your data. |
| **Visualize results** | Embeds live or point-in-time charts directly in its answers, one click away from a dashboard. |
| **Remember things** | Keeps durable facts, findings and preferences across conversations, scoped to you or shared with your workspace. |
| **Learn procedures** | Saves, refines, installs and reuses step-by-step "skills" written in plain markdown, so it gets better at your specific workflows over time. |
| **Work unattended** | Runs standing instructions on a schedule or whenever new data arrives, and reports back in a conversation. |
| **Produce files** | Keeps PDF, CSV or image files produced by its own code as downloadable artifacts. |

### Chat with your workspace

- Answers stream in as Tabby works. Tool calls and SQL results are shown inline, so you can see exactly what it checked.
- Conversations are titled automatically after the first turn, can be renamed, deleted and replayed with their full tool and approval history, and can be exported as text or JSON. Any answer can be copied with one click.
- Long or very active conversations load in time windows (from the last 5 minutes up to everything), with "load earlier" as you scroll back and live updates while a run is in progress. Export always downloads the whole conversation.
- Answers are never silently cut short. An answer clipped by the model's output limit is continued once and, if still incomplete, marked as truncated. A refusal or a provider content filter is shown as a short note. If a turn runs out of steps before the model has answered, the answer says so instead of ending empty.

### Explore and query

- Tabby runs historical SQL one statement at a time, with a row cap, a timeout and truncation of oversized results, all configurable per workspace. It can also validate a statement without running it.
- Reads must be bounded. Streams are read through `table(...)`, and windowed aggregations over bounded data such as `tumble(table(s), 5s)` are supported for snapshots and chart probes. Unbounded streaming reads are refused with a hint. Tabby proposes the streaming SQL for you to run or materialize rather than holding a never-ending query open.
- The engine's `system` tables are readable in every mode, so diagnostics never need an approval click.
- Every stream, view or pipeline Tabby mentions is rendered as a Console deep link, so you can jump straight to it.

### Monitor and diagnose

The built-in **timeplus-diagnose** skill carries the triage recipes Timeplus support uses: materialized view status and errors, lag, throughput, disk and ingest pressure, failed and running queries. It starts every investigation by checking that the engine's own metrics collectors are fresh, so Tabby never diagnoses from stale numbers, and it knows which engine log entries are benign noise generated by the Console and the agent themselves.

### Build pipelines, with a human in the loop

Tabby grounds every DDL proposal in the built-in **timeplus-sql-guide** skill, a reference to Timeplus streaming SQL covering streams, materialized views, joins, windows, UDFs, ingestion, sinks, tasks and alerts.

Every SQL statement Tabby runs executes **as the signed-in user who asked**, so your existing Timeplus permissions are always the real boundary. On top of that, an administrator chooses one of three write modes under **SQL permissions**:

| Mode | What happens |
| :---- | :---- |
| **Read-only** (default) | Tabby can look at and summarize your data, but only *suggests* changes in prose for you to run. It never runs anything that modifies your workspace. |
| **Approval** | Tabby can propose a change and shows you the exact statement on an approval card. Nothing executes until you click Approve. If you deny it, let it time out, or close the tab, the statement is reported to the model as not executed, and the model is told not to retry it. Once an approved statement has run, the card shows whether the engine accepted it. |
| **Unrestricted** | Tabby runs the changes it proposes immediately as the signed-in user, with your normal Timeplus role-based permissions as the only guardrail. |

Sensitive reads, such as `information_schema`, `SHOW CREATE`, `SHOW USERS`, `SHOW GRANTS`, and the `remote()`, `cluster()` and `merge()` table functions, are treated like writes and follow the same mode.

### Visualize

Ask Tabby to chart, plot or graph something and the answer carries a chart block the Console renders live. Tabby probes the query first with a bounded version so the chart's columns are real, picks the chart type, and chooses between a **streaming** chart that keeps updating and a **historical** snapshot based on the SQL. The chart runs under your credentials, read-only, and **Add to dashboard** is one click away.

### Extend Tabby with code

The built-in **timeplus-udf-toolsmith** skill teaches Tabby to turn a need SQL cannot meet into a reusable UDF: reuse an existing one before writing another, name it clearly, test it on literals, install Python packages when needed, and follow a safe pattern for UDFs that ingest from external feeds. Creating a UDF is a write, so it follows the write mode and the approval card.

Files a UDF produces, such as a PDF report, a CSV export or a chart image, are stored as **artifacts**, listed and downloadable from the conversation and from the Artifacts sheet. The file bytes never pass through the model. Artifacts are retained for seven days by default, and downloads are capped at 16 MiB.

### Memory

Tabby remembers across conversations. Each memory has a scope: **workspace**, shared with everyone in the workspace, or **private** to the user who was chatting. Tabby decides what to remember and says so in the transcript. There is no silent summarization at the end of a conversation, which is the safeguard against a planted "memory".

Each scope holds up to 500 live memories. When a scope is full, Tabby is asked to forget something stale rather than overwrite silently. The **Memory sheet** lets every user review and delete what Tabby remembers about them. Administrators can delete workspace memories. Memory can be switched off per workspace while keeping existing memories reviewable.

### Skills

A skill is a procedure written as a `SKILL.md` file (the [agentskills.io](https://agentskills.io) format) with optional reference files. Five skills ship with Timeplus and are installed in every workspace:

| Skill | What it teaches Tabby |
| :---- | :---- |
| `timeplus-sql-guide` | Timeplus streaming SQL end to end. |
| `timeplus-diagnose` | Pipeline triage recipes over the `system` tables. |
| `timeplus-udf-toolsmith` | Creating, testing and reusing UDFs as tools, and storing produced files as artifacts. |
| `timeplus-ui-navigation` | Rendering every resource as a Console deep link. |
| `timeplus-visualization` | Probe-first charting and the chart block format. |

Beyond these, Tabby and your team can add skills:

- **Tabby writes its own.** When a procedure proves useful, Tabby can save it as a skill, refine it later and archive it, in the workspace or in your private scope.
- **Draft approval for shared skills.** A workspace skill created or edited by a non-administrator is a draft only its author can use until an administrator approves it. Administrators' changes take effect immediately.
- **Full version history.** Every version is kept. Administrators can inspect the history and roll back, and the history is exposed as a SQL view for auditing.
- **Install from a folder, a zip file or a public GitHub repository**, with a dry-run preview, provenance shown per version, one-click upgrade for GitHub-sourced skills, and an optional allow-list of repositories.

The **Skills sheet** covers all of it: list, detail, draft review, version history, install, pin, deactivate and restore, roll back, and delete.

Upgrading Timeplus refreshes the five built-in skills. If your workspace edited a built-in skill, the new release's version supersedes the edit, and the edited version is kept in history.

### Background tasks

Tabby can work unattended. A **background task** is a standing instruction plus a trigger:

- **Scheduled tasks** run on a cron expression with a timezone, or at a fixed interval. Each run starts from the result of a read-only context query the engine runs at trigger time, so the model sees fresh data.
- **Data tasks** trigger on a streaming query instead. Each emitted row is a trigger, rate-limited to one run per minute by default.

Every run executes **read-only, as the task's creator**, with a reduced tool set. It can query, load skills and read memory, but it cannot change memory, skills or tasks, so an unattended run can never rewrite its own instructions or schedule more of itself. External MCP tools are never offered to unattended runs.

Results land in one rolling conversation per task, which the Console flags with an unread indicator. A run ledger records every run with its trigger, status and token usage. Runs missed during an outage are coalesced into a single catch-up run.

Tasks are created and managed from chat, for example "every morning at 8, check the ingest lag and tell me if anything is behind", or through the REST API. They can be disabled and re-enabled without losing the definition, and run on demand.

### External tools (MCP)

Administrators can connect **Model Context Protocol** (MCP) servers to a workspace so their tools appear to Tabby alongside the built-in ones, for example a server that can look things up in a ticketing system or an internal wiki. Each server has a URL (streamable HTTP), an optional secret header stored encrypted, an allow-list of tools, a call timeout, and an **approval policy** that is independent of the SQL write mode:

| Policy | What happens |
| :---- | :---- |
| **Always ask** (default) | Every call is shown on an approval card naming the server, the tool and the exact arguments, and runs only after a click. |
| **Trust read-only hints** | Calls to tools the server marks as read-only run without a card. Everything else asks. |
| **Never ask** | Calls run immediately. |

A test button connects and lists the server's tools before anything is saved. A server that is down or slow is skipped for the turn and Tabby is told why, so it can say so rather than fail.

### Model support

Tabby speaks two wire protocols, selected by **API type** in the settings:

| API type | Works with |
| :---- | :---- |
| `openai` | Any OpenAI-compatible Chat Completions endpoint: OpenAI, API gateways, Ollama, vLLM, and Amazon Bedrock's OpenAI-compatible endpoint. |
| `anthropic` | The Anthropic Messages API: `api.anthropic.com` and Amazon Bedrock's Anthropic endpoint. |

On Amazon Bedrock the choice is dictated by the model. Claude models are Messages-only, the `gpt-oss` family is Chat-Completions-only, and the two use different base URLs (`.../v1` for `openai`, `.../anthropic` for `anthropic`).

The connection test checks reachability **and forces a tool call**, so a model that cannot call tools is rejected up front rather than failing mid-conversation. Models validated as recommended on Bedrock at the 3.4 release include Claude Opus 5, Sonnet 5, Fable 5 and 5.1, Opus 4.7 and 4.8, and Haiku 4.5; GLM 4.6, 4.7 and 5; Kimi K2.5 and K2 Thinking; Mistral Large 3 and Ministral 3; MiniMax M2 and M2.1; GPT-5.4, 5.5 and the 5.6 family; and the `gpt-oss` models. Models known to leak their tool-call markup into answers are guarded: such a turn fails cleanly with an explanation instead of showing raw protocol tokens.

## How Tabby keeps your workspace safe

- **Tabby runs as you.** Every statement executes as the signed-in Console user, so Timeplus role-based access control is always the second line of defense. Conversations, memories, tasks and artifacts belong to their owner. Administrators have broader visibility.
- **Nothing changes without a mode and, in approval mode, a click.** The write mode is administrator-controlled, and there is no auto-approve. Approval cards show the exact statement, and a denied or timed-out statement is reported as not executed, never retried silently.
- **Unbounded or sensitive reads are gated.** Reads must be bounded, the appserver's own credential store is never readable through the agent, and engine-internal reads follow the write mode.
- **Credentials are encrypted at rest.** The LLM API key and MCP secrets are sealed with AES-256-GCM. Set `NEUTRON_ENCRYPTION_KEY` for real protection. Without it a built-in key only obfuscates, and the server logs a clear warning. A lost key surfaces as a configuration error in the settings, never as an empty credential.
- **Tool output is data, not instructions.** The model is told that anything returned by a tool is data, never to run a write the user did not ask for, and unattended runs cannot write memory, skills or tasks.
- **Honest failures.** A model that emits unparsed tool-call markup, hits its output limit, refuses, or runs out of steps produces a visible outcome, not a plausible-looking transcript of work that did not happen.
- **Off switch.** Disabling the agent on the server removes its routes, its background consumer and the Console UI entirely.

## Getting started

1. Tabby is enabled by default. To turn it off, set `enable-agent: false` in the appserver's `config.yaml` (see [Timeplus Appserver configuration](/server_config#appserver)) or pass the equivalent flag. On Kubernetes, the Helm chart will expose this as `timeplusAppserver.enableAgent` once that chart release ships. Until then, use `extraEnv`.
2. Open **Workspace settings → Tabby Agent**, choose the API type, enter the base URL, model and API key, and click **Test connection**. The test must pass a forced tool call.
3. Choose the **SQL permissions** mode. Read-only is the default. Approval mode is the recommended setting for teams that want Tabby to build pipelines.
4. Optionally adjust budgets and recall limits. The defaults suit most workspaces.

Once saved, chat opens up to every user in the workspace. Each person's conversations, memories, tasks and artifacts are private to them by default.

## Settings reference

### Workspace settings

These are persisted per workspace and editable in the Console under **Workspace settings → Tabby Agent**.

| Setting | Default | Meaning |
| :---- | :---- | :---- |
| API type | `openai` | `openai` or `anthropic`. See [Model support](#model-support). |
| Base URL | none | Used verbatim. `openai` expects the `/v1` root. `anthropic` expects the root without `/v1`. |
| API key | none | Encrypted at rest and never shown back. Leaving it blank on save keeps the stored key. |
| Model | none | Model identifier as the endpoint names it. |
| Max tokens | 8192 | Model output budget per call. |
| Timeout | 60 s | Per-call HTTP timeout to the model. |
| Max iterations | 12 (2 to 32) | Tool-call steps per turn. The last step must be an answer. |
| Turn token budget | 32,000 | Conversation history replayed to the model per turn. |
| SQL timeout | 30,000 ms (max 55,000) | Per-statement timeout. |
| SQL max rows | 1,000 (max 5,000) | Row cap injected into every read. |
| Tool result max bytes | 16,384 | Oversized tool results are truncated with a marker. |
| Approval timeout | 300 s | How long an approval card waits for a decision. |
| Memory enabled | on | Memory tools and recall. |
| Memory recall limit | 50 (10 to 200) | Memories indexed in the model's context. |
| Skill recall limit | 30 (10 to 100) | Skills indexed in the model's context. |

### Server configuration

These are set in the appserver's `config.yaml`, as command-line flags, or as environment variables.

| Setting | Default | Purpose |
| :---- | :---- | :---- |
| `enable-agent` | `true` | Mount the agent, its background consumer and the Console tab. |
| `agent-chat-api-type`, `agent-chat-base-url`, `agent-chat-api-key`, `agent-chat-model` | empty | Seed the LLM settings on first start. Values saved in the Console win afterwards. |
| `agent-write-mode` | `readonly` | Seed only. Administrators change it in the Console. |
| `agent-skill-install-github-allowlist` | empty | `owner` or `owner/repo` entries. Empty allows any public repository. |
| `agent-artifact-ttl-seconds` | 604,800 (7 days) | Artifact retention. `-1` keeps artifacts forever. |
| `NEUTRON_ENCRYPTION_KEY` (environment variable) | built-in key | Master key sealing the API key and MCP secrets. The Helm chart sets it from `timeplusAppserver.encryptionKey` or `timeplusAppserver.existingEncryptionKeySecret`. |

### REST API

Everything the Console does is available over REST under `/{tenant}/api/v1beta2/agent/`, with the same ownership rules: status and settings, chat (server-sent events), approvals, memories, skills, background tasks, artifacts and MCP servers. See the [REST API reference](pathname:///rest.html) for details.

## Good to know

### Upgrading to 3.4

- Tabby is enabled by default. Set `enable-agent: false` if you do not want it mounted.
- Workspaces that saved an LLM configuration on an earlier 3.4 engineering build may still have Max tokens at 1024. Raise it to 8192 in the settings for complete answers.
- If you set `NEUTRON_ENCRYPTION_KEY` after an LLM key was saved under the built-in key, re-enter the LLM key once.

### Deployment

- Multi-replica appserver deployments should use sticky sessions. Approval cards and MCP tool catalogs are tracked per appserver instance, and a background task run executes with the engine session of the task's creator on the instance that picks it up. A run landing on an instance where the creator has never signed in is recorded as failed with a clear message rather than run under another identity.
- The Helm chart carries the encryption-key values today. The `enableAgent` toggle lands in its next release.

### Current limits

- Memory is what Tabby explicitly saves, searched by keyword. There is no end-of-conversation summarization and no embedding search.
- Background task results are delivered to the task's conversation. Delivery to sinks is planned. Tasks are managed from chat or the API. A dedicated Console page is planned.
- The model field is free text. A mistyped model name shows up as a failed connection test.
- Each enabled MCP server is contacted at the start of every interactive turn, so many servers add latency.
- Sink and source connector credentials are not yet encrypted at rest. Only the agent's own credentials are.
