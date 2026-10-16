# Introducing AgentGuard

As AI coding agents take on more complex, longer-running tasks, writing code, executing shell commands, installing packages and calling external APIs, the need for visibility into what they do grows with them. **AgentGuard** is a real-time security monitoring pipeline for AI coding agents, built on Timeplus streaming SQL.

Starting with Timeplus Enterprise 3.4, AgentGuard is delivered as a **Timeplus app**. You install it from the Apps page in the Console, it creates its streams, materialized views and dashboard inside a dedicated `ag` database, and your agents send telemetry straight to Timeplus. There is no separate AgentGuard server to run. See [Timeplus Apps](/app-framework) for how apps work in general, and [AgentGuard Installation](/agentguard-installation) for the setup steps.

---

## The Problem

AI agents are powerful. They can autonomously browse files, run commands, make HTTP calls and install dependencies. That autonomy is exactly what makes them useful, and exactly what makes them a new attack surface.

Without visibility into what your agents are doing, you are flying blind:

- A prompt injection in a web page could redirect your agent to exfiltrate source code.
- An agent reading a database result could inadvertently expose credentials in its response.
- A dependency install step could pull in a malicious or unexpected package.
- Agents accumulating LLM token usage across a fleet can burn through budgets without warning.

AgentGuard addresses this with a streaming telemetry pipeline, agent-agnostic detection rules written in SQL, and a live dashboard, all running inside your Timeplus workspace.

---

## What AgentGuard Does

AgentGuard receives every hook event and OpenTelemetry signal your agents emit, normalizes them into a single schema, runs streaming SQL detection rules over that schema, and keeps the results in streams you can query, chart and alert on like any other Timeplus data.

**Key capabilities:**

| Capability | What you get |
|---|---|
| **Hook and OTel ingest** | Agent plugins write lifecycle events to `ag.agentguard_hook_events`. An OTLP/HTTP input on a port you choose receives traces, logs and metrics into the `ag.otel_*` streams. |
| **Common Information Model** | Normalizer materialized views turn heterogeneous events from every supported agent into one unified `ag.agentguard_cim_event` stream, so one SQL rule covers all agents. |
| **Four Core Protection rules** | Prompt injection, data leakage, privilege escalation and supply chain detections run as materialized views from the moment the app is installed. |
| **Threat tracking** | Rule matches land in `ag.agentguard_security_events` and are folded into `ag.agentguard_threats`, one row per agent, session and rule. |
| **Per-call metrics** | Token usage, model and latency for every LLM call in `ag.agentguard_cim_metrics`, plus session and run lookup streams. |
| **Skills and memory tracking** | Which skills agents load and invoke, and what they write to memory, as derived streams. |
| **AgentGuard Overview dashboard** | Events per minute by agent type, open threats by severity, tokens by model and recent threats, bundled with the app. |
| **Open data** | Everything is a Timeplus stream. Query it in the Console, chart it on your own dashboards, ask [Tabby](/tabby) about it, or build alerts on it. |

---

## Supported Agents

| Agent | How telemetry arrives |
|---|---|
| **[Claude Code](https://claude.ai/code)** | The `@timeplus/agentguard-claudecode-plugin` hook handler writes lifecycle events to Timeplus. Claude Code's built-in OpenTelemetry export adds token and latency metrics. |
| **[OpenClaw](https://github.com/timeplus-io/openclaw)** | The `@timeplus/agentguard-openclaw-plugin` captures all OpenClaw lifecycle hooks. OpenClaw's `diagnostics-otel` plugin adds OTel signals. |
| **[Hermes Agent](https://github.com/nousresearch/hermes-agent)** | The `agentguard-hermes-plugin` Python package forwards session, LLM and tool-call events. |
| **Any OpenInference or OTLP emitter** | Point the exporter at the app's OTLP/HTTP input. A normalizer maps OpenInference spans into the same CIM stream. |

All agent types share the same detection rules, metrics and dashboard.

---

## How It Works

```
 Agents (Claude Code / OpenClaw / Hermes / any OTLP emitter)
 ┌──────────────────────────────┐
 │  AgentGuard hook plugin      │  ─── hook events ──►  Timeplus :3218 (or Console :8000)
 │  OTel exporter               │  ─── OTLP/HTTP ─────►  Timeplus :4318 (app input)
 └──────────────────────────────┘

 Timeplus, database `ag`
 ┌──────────────────────────────────────────────────────────────────────────┐
 │  agentguard_hook_events ─┐                                               │
 │  otel_traces / otel_logs ┴─► mv_cim_* normalizers                        │
 │                                └─► agentguard_cim_event                  │
 │                                      ├─► mv_cim_metrics_* ─► metrics     │
 │                                      └─► mv_rule_rp001..rp004            │
 │                                            └─► agentguard_security_events│
 │                                                  └─► mv_threats ─► threats│
 │  AgentGuard Overview dashboard                                           │
 └──────────────────────────────────────────────────────────────────────────┘
```

Hook events flow from the agent plugins directly into Timeplus. One **CIM normalizer** per agent type (Claude Code, OpenClaw, Hermes and OpenInference) turns them into the unified `agentguard_cim_event` schema. The detection rules query that normalized stream, so the same SQL detects threats from any supported agent without modification.

When a rule matches, it writes to `agentguard_security_events`. The `mv_threats` materialized view deduplicates matches by agent, session and rule into the `agentguard_threats` mutable stream, which the dashboard reads for its open-threats and recent-threats panels.

---

## Built-in Security Rules

AgentGuard ships four detection rules. They are **enabled and running from the moment the app is installed**.

| Rule | Materialized view | Severity | What it detects |
|---|---|---|---|
| **Prompt Injection Shield** | `mv_rule_rp001` | Critical | Jailbreak attempts and instruction-override patterns in user messages and LLM prompts |
| **DLP Sentinel** | `mv_rule_rp002` | Critical | Sensitive data such as API keys, secrets, SSNs, AWS credentials and GitHub tokens appearing in tool results or LLM responses |
| **Privilege Guard** | `mv_rule_rp003` | Warning | Dangerous tool calls: shell execution, `sudo`, `rm -rf`, `/etc/passwd` access |
| **Supply Chain Watch** | `mv_rule_rp004` | Warning | Package install commands such as `npm install`, `pip install` and `brew install` |

Each rule is an ordinary materialized view. To switch one off or back on:

```sql
SYSTEM PAUSE MATERIALIZED VIEW ag.mv_rule_rp002;
SYSTEM RESUME MATERIALIZED VIEW ag.mv_rule_rp002;
```

To add your own detection, create a materialized view over `ag.agentguard_cim_event` that writes matches into `ag.agentguard_security_events`. Run `SHOW CREATE ag.mv_rule_rp003` to see how a shipped rule is written and use it as a template.

---

## What Changed from the Standalone AgentGuard

Earlier AgentGuard releases ran as a separate Go server with its own web UI. That server is retired. The app carries the full data pipeline and the Core Protection rules, but the following server-side features are no longer available:

- Approval holds and synchronous blocking of risky tool calls
- The threat lifecycle workflow (acknowledge and clear) and live alert notifications
- The setup wizard, agent onboarding wizard and login
- The Rule Packs page and the wider rule catalog beyond the four Core Protection rules
- Sentry, Semantic DLP, user management and cost budget enforcement

In their place you have the Timeplus Console itself: the app's detail page for its resources and dashboard, the SQL console for ad hoc queries, Timeplus [alerts](/alert) for notifications, and Tabby for conversational investigation.
