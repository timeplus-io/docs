# Introducing AgentGuard

As AI coding agents take on more complex, longer-running tasks — writing code, executing shell commands, installing packages, calling external APIs — the need for visibility and control grows with them. **AgentGuard** is a real-time security monitoring and governance platform built specifically for AI agent fleets.

---

## The Problem

AI agents are powerful. They can autonomously browse files, run commands, make HTTP calls, and install dependencies. That autonomy is exactly what makes them useful — and exactly what makes them a new attack surface.

Without visibility into what your agents are doing, you are flying blind:

- A prompt injection in a web page could redirect your agent to exfiltrate source code.
- An agent reading a database result could inadvertently expose credentials in its response.
- A dependency install step could pull in a malicious or unexpected package.
- Agents accumulating LLM token usage across a fleet can burn through budgets without warning.

AgentGuard addresses all of this with a streaming telemetry pipeline, agent-agnostic threat detection rules, and a live security dashboard.

---

## What AgentGuard Does

AgentGuard sits alongside your agent fleet and continuously monitors every hook event — tool calls, LLM interactions, session boundaries — as they happen. It normalizes events from different agent frameworks into a unified schema, applies streaming SQL detection rules, and surfaces threats, metrics, and costs in real time.

**Key capabilities:**

| Capability | What you get |
|---|---|
| **Setup wizard** | One-time first-launch wizard that connects to Timeplus, provisions all resources, and logs you in |
| **Live threat feed** | Instant alerts when a detection rule fires, with severity, agent identity, and the raw event payload |
| **Agent fleet overview** | All active agents with event counts, session counts, token usage, and last-seen timestamps |
| **Session & run traces** | Per-session waterfall view of every LLM call and tool invocation, with timing |
| **Cost governance** | Daily spend trends, per-model token breakdown, configurable pricing, MTD forecast |
| **Rule packs** | Install, enable/disable, and upgrade versioned detection rules without restarting |
| **SQL console** | Ad-hoc streaming SQL directly against the underlying event streams |
| **Agent onboarding** | Step-by-step wizard for connecting a new agent in under five minutes |

---

## Supported Agents

AgentGuard currently supports two agent frameworks:

- **[OpenClaw](https://github.com/timeplus-io/openclaw)** — An open-source AI coding agent framework. AgentGuard installs a hook plugin that captures every lifecycle event and posts it to Timeplus.
- **[Claude Code](https://claude.ai/code)** — Anthropic's official CLI for Claude. AgentGuard installs hook handlers into `~/.claude/settings.json` and optionally configures OpenTelemetry export for full LLM token and latency metrics.

Both agent types share the same detection rules, cost accounting, and dashboard — no agent-specific configuration needed after setup.

---

## How It Works

```
 Agent (OpenClaw / Claude Code)
 ┌──────────────────────────────┐
 │  AgentGuard hook plugin      │  ─── hook events ──►  Timeplus :3218
 │  OTel plugin (Claude Code)   │  ─── OTLP/HTTP ─────►  Timeplus :4318
 └──────────────────────────────┘

 Timeplus (streaming SQL engine)
 ┌──────────────────────────────────────────────────────────────────────────┐
 │  agentguard_hook_events  ──► CIM normalizer MVs                          │
 │                               └─► agentguard_cim_event                   │
 │                                      └─► rule MVs                        │
 │                                           └─► agentguard_security_events │
 │                                                └─► threats + alerts      │
 └──────────────────────────────────────────────────────────────────────────┘

 AgentGuard Backend (Go/Gin :8080)
 └── REST API + SSE notifications + embedded React SPA
```

Hook events flow from agent plugins directly into Timeplus. Two **CIM (Common Information Model)** materialized views normalize heterogeneous events from OpenClaw and Claude Code into a single unified schema (`agentguard_cim_event`). Detection rules query this normalized stream — so the same SQL detects threats from any supported agent without modification.

When a rule matches, it writes to `agentguard_security_events`. A threat deduplication pipeline groups matches by `(agent, session, rule)` and maintains their lifecycle status (`open → acknowledged → cleared`). A noise-suppression filter ensures you only get alerted when a threat is new or has re-opened after being cleared.

The AgentGuard backend exposes a REST API that queries Timeplus for all dashboard data. A Server-Sent Events stream pushes live alert notifications to all connected browser clients as detections arrive.

---

## Built-in Security Rules

AgentGuard ships with four detection rules out of the box. Rules are disabled by default and must be explicitly activated.

| Rule | Severity | What it detects |
|---|---|---|
| **Prompt Injection Shield** | Critical | Jailbreak attempts and instruction-override patterns in user messages and LLM prompts |
| **DLP Sentinel** | Critical | Sensitive data (API keys, secrets, SSNs, AWS credentials, GitHub tokens) appearing in tool results or LLM responses |
| **Privilege Guard** | Warning | Dangerous tool calls: shell execution, `sudo`, `rm -rf`, `/etc/passwd` access |
| **Supply Chain Watch** | Warning | Package install commands (`npm install`, `pip install`, `brew install`, etc.) |

All rules are written in standard streaming SQL and can be inspected, customized, or replaced from the **Rule Packs** page. Custom rules can be added through the same interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Streaming database | [Timeplus](https://timeplus.com) (streaming SQL, materialized views, mutable streams, alerts) |
| Backend | Go 1.23, Gin, Cobra, Viper |
| Frontend | React 18, Vite, React Router v6, Tailwind CSS, Recharts |
| Agent telemetry | OpenTelemetry OTLP/HTTP (logs, traces, metrics) |
| Hook events | Custom HTTP ingest → Timeplus stream |


