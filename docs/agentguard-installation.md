# AgentGuard Installation Guide

This guide walks through a complete AgentGuard setup:

1. [Prerequisites](#1-prerequisites)
2. [Install the AgentGuard app](#2-install-the-agentguard-app)
3. [Connect Claude Code](#3-connect-claude-code)
4. [Connect OpenClaw](#4-connect-openclaw)
5. [Connect Hermes Agent](#5-connect-hermes-agent)
6. [Verify everything is working](#6-verify-everything-is-working)
7. [Manage rules, upgrade and uninstall](#7-manage-rules-upgrade-and-uninstall)

---

## 1. Prerequisites

| Requirement | Minimum version | Notes |
|---|---|---|
| Timeplus Enterprise | **3.4** | The App Framework is required. Earlier versions cannot install `.tpapp` packages. |
| Node.js | 18+ | For the Claude Code and OpenClaw plugins |
| Python | 3 | For the Hermes plugin |
| Claude Code CLI | any | Only for Claude Code integration |
| OpenClaw | 2026.4.0+ | Only for OpenClaw integration |
| Hermes Agent | any | Only for Hermes integration |

Follow the [Timeplus Enterprise installation guide](/bare-metal-install) if you do not have a workspace yet. The following ports must be reachable from the machines where your agents run:

| Port | Service | Purpose |
|---|---|---|
| `3218` | timeplusd | HTTP ingest API. The plugins send hook events here by default. |
| `8000` | Timeplus Console | Web console. Also the REST ingest endpoint when port 3218 is not exposed. |
| `4318` | AgentGuard app | OTLP/HTTP input created by the app. Configurable at install time. |

---

## 2. Install the AgentGuard app

1. Open **Apps** in the Console sidebar and find **AgentGuard** in the catalog. It is listed under the `security` and `observability` categories.
2. Click **Install** and review the two configuration fields:

   | Field | Default | Purpose |
   |---|---|---|
   | `otel_port` | `4318` | TCP port the OTLP/HTTP input listens on. Pick another port if 4318 is already in use on the Timeplus host. |
   | `otel_listen_host` | `0.0.0.0` | Bind address for the OTLP/HTTP input. |

3. Click **Install** again. Timeplus creates the `ag` database and every resource in it. If anything fails, the install is rolled back and nothing is left behind.

If your deployment cannot reach the public app catalog, download `agentguard.tpapp` from the [apps releases page](https://github.com/timeplus-io/apps/releases/latest) and install it with **Upload App** instead.

### What gets installed

All resources live in database `ag`:

| Layer | Resources |
|---|---|
| Raw OTel | `otel_traces`, `otel_logs`, `otel_metrics_*` streams and the `agentguard_otel_input` OTLP/HTTP receiver |
| Raw hooks | `agentguard_hook_events`, written by the agent plugins |
| CIM | `agentguard_cim_event` and the `mv_cim_*` normalizers, one per agent type |
| Metrics | `agentguard_cim_metrics` with the `mv_cim_metrics_*` views, plus `agentguard_session_agents` and `agentguard_run_latency` lookups |
| Security | `agentguard_security_events`, `agentguard_threats` and `mv_threats` |
| Derived | `agentguard_skills` with `mv_skills_*`, `agentguard_memory_ops` with `mv_memory_*` |
| Cost | `agentguard_pricing` and `agentguard_cost_budgets`, schema only |
| Rules | `agentguard_rules` and the four Core Protection rules `mv_rule_rp001` to `mv_rule_rp004`, running |
| Dashboard | **AgentGuard Overview** |

Open the app's detail page to see every resource under **Resources**, the dashboard under **Dashboard**, and the install history under **Events Log**.

---

## 3. Connect Claude Code

### 3a. Install the plugin

```bash
npm install -g @timeplus/agentguard-claudecode-plugin
```

This installs the `agentguard-hook` command on your `PATH`.

### 3b. Set environment variables

Add these to your shell profile (`~/.zshrc` or `~/.bashrc`) **before** launching Claude Code, replacing the credentials with your Timeplus user:

```bash
export AGENTGUARD_AGENT_ID="your-hostname"        # identifies this machine
export AGENTGUARD_DEPLOYMENT_ID="local"
export AGENTGUARD_DEPLOYMENT_NAME="Local Dev"
export AGENTGUARD_TIMEPLUS_URL="http://localhost:3218"
export AGENTGUARD_USERNAME="proton"
export AGENTGUARD_PASSWORD=""
```

`AGENTGUARD_DATABASE` defaults to `ag`, matching the app, so it does not need to be set. If timeplusd's port 3218 is not reachable from the agent machine, for example on Kubernetes behind an ingress, send events through the Console's REST API with the same credentials instead:

```bash
export AGENTGUARD_INGEST_API=rest
export AGENTGUARD_TIMEPLUS_URL="http://<timeplus-host>:8000"   # or the console's HTTPS URL
```

Then reload your shell:

```bash
source ~/.zshrc   # or ~/.bashrc
```

### 3c. Register hooks in Claude Code

Merge the following into `~/.claude/settings.json`. If the file does not exist, create it. Every hook runs asynchronously, so Claude Code never waits on AgentGuard.

```json
{
  "hooks": {
    "SessionStart":       [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "SessionEnd":         [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "UserPromptSubmit":   [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "PreToolUse":         [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "PostToolUse":        [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "PostToolUseFailure": [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "SubagentStart":      [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "SubagentStop":       [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "Stop":               [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}],
    "PermissionDenied":   [{"matcher":"*","hooks":[{"type":"command","command":"agentguard-hook","async":true}]}]
  }
}
```

> **Merge, do not replace.** If you already have a `settings.json`, add only the `hooks` key. Existing keys are unaffected.

### 3d. OTel telemetry

Add the following `env` block to `~/.claude/settings.json` (merge with any existing `env` keys) to capture LLM token usage, cost and latency from Claude Code. The endpoint is the Timeplus host and the `otel_port` you chose at install time:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY":        "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER":               "otlp",
    "OTEL_LOGS_EXPORTER":                  "otlp",
    "OTEL_TRACES_EXPORTER":                "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL":         "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT":         "http://localhost:4318",
    "OTEL_METRIC_EXPORT_INTERVAL":         "10000",
    "OTEL_LOGS_EXPORT_INTERVAL":           "5000",
    "OTEL_LOG_TOOL_DETAILS":               "1"
  }
}
```

> **Protocol note:** Claude Code requires `http/protobuf`. Do not use `grpc`. The app's input accepts OTLP over HTTP only.

Quit and reopen Claude Code for the hooks and environment to take effect.

---

## 4. Connect OpenClaw

### 4a. Install the plugin

```bash
npm install @timeplus/agentguard-openclaw-plugin
```

OpenClaw discovers the plugin from `node_modules` automatically.

### 4b. Configure the plugin

Add the plugin to your `openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "agentguard": {
        "enabled": true,
        "config": {
          "timeplusUrl": "http://localhost:3218",
          "database": "ag",
          "stream": "agentguard_hook_events",
          "deploymentId": "my-team",
          "deploymentName": "My Team",
          "flushMs": 2000,
          "batchSize": 50,
          "username": "proton",
          "password": ""
        }
      }
    }
  }
}
```

Every field except `deploymentId` and `deploymentName` can also be set with an environment variable before starting OpenClaw:

| Env var | Config field | Default |
|---|---|---|
| `AGENTGUARD_TIMEPLUS_URL` | `timeplusUrl` | `http://localhost:3218` |
| `AGENTGUARD_INGEST_API` | `ingestApi` | `timeplusd`. Set `rest` to send through the Console on port 8000 when 3218 is not exposed. |
| `AGENTGUARD_DATABASE` | `database` | `ag` |
| `AGENTGUARD_STREAM` | `stream` | `agentguard_hook_events` |
| `AGENTGUARD_FLUSH_MS` | `flushMs` | `2000` |
| `AGENTGUARD_BATCH_SIZE` | `batchSize` | `50` |
| `AGENTGUARD_USERNAME` | `username` | `proton` |
| `AGENTGUARD_PASSWORD` | `password` | _(empty)_ |

> **Docker (OpenClaw in a container, Timeplus on the host):** use `http://host.docker.internal:3218` as the Timeplus URL.

### 4c. OTel diagnostics

To export LLM traces, metrics and logs from OpenClaw as well, add the `diagnostics-otel` section to `openclaw.json`, pointing at the app's OTLP port:

```json
{
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "endpoint": "http://localhost:4318",
      "traces": true,
      "metrics": true,
      "logs": true,
      "serviceName": "openclaw",
      "sampleRate": 1,
      "flushIntervalMs": 3000
    }
  },
  "plugins": {
    "entries": {
      "diagnostics-otel": { "enabled": true }
    }
  }
}
```

> **Docker:** use `http://host.docker.internal:4318` for the endpoint.

When the plugin loads, OpenClaw's log shows the ingest target:

```
[agentguard] active — streaming to http://localhost:3218/timeplusd/v2/ingest/ag/streams/agentguard_hook_events (timeplusd) (flush every 2000ms, batch size 50) deployment=my-team
```

---

## 5. Connect Hermes Agent

### 5a. Install the plugin

```bash
pip install agentguard-hermes-plugin
agentguard-hermes install
```

This copies the plugin into `~/.hermes/plugins/agentguard/`, where Hermes loads it on startup.

### 5b. Set environment variables

Set these before starting Hermes:

```bash
export AGENTGUARD_TIMEPLUS_URL="http://localhost:3218"
export AGENTGUARD_USERNAME="proton"
export AGENTGUARD_PASSWORD=""
export AGENTGUARD_DEPLOYMENT_ID="local"
export AGENTGUARD_DEPLOYMENT_NAME="Local Dev"
```

`AGENTGUARD_AGENT_ID` defaults to the hostname and `AGENTGUARD_DATABASE` to `ag`. The same `AGENTGUARD_INGEST_API=rest` switch as the other plugins sends events through the Console when port 3218 is not reachable.

---

## Interactive installer

Instead of configuring a plugin by hand, you can run the installer script from the [AgentGuard repository](https://github.com/timeplus-io/AgentGuard/blob/main/agents/install.sh). It prompts for the agent type, agent and deployment identity, the Timeplus URL, credentials and database, then installs the plugin and writes its configuration. For Claude Code it also derives the OTel endpoint from the Timeplus URL. Synchronous tool blocking is always off, since there is no server to hold on.

---

## 6. Verify everything is working

### Check hook events are arriving

Start an agent session, run a tool call, then query the hook stream. In the Console's SQL editor:

```sql
SELECT hook_name, agent_type, agent_id, event_time
FROM table(ag.agentguard_hook_events)
ORDER BY event_time DESC
LIMIT 10;
```

Or from the command line:

```bash
curl -s -u "proton:" -X POST http://localhost:3218/proton/v1/query \
  -H 'Content-Type: application/json' \
  -d '{"query":"SELECT hook_name, agent_type, agent_id, event_time FROM table(ag.agentguard_hook_events) ORDER BY event_time DESC LIMIT 10"}'
```

You should see rows with `agent_type` set to `claudecode`, `openclaw` or `hermes`.

### Check events are being normalized

```sql
SELECT agent_type, event_type, count()
FROM table(ag.agentguard_cim_event)
GROUP BY agent_type, event_type;
```

### Check OTel data is arriving

If you enabled OTel export, the raw streams fill as the agent makes LLM calls:

```sql
SELECT count() FROM table(ag.otel_logs);
SELECT count() FROM table(ag.otel_metrics_sum);
```

### Check the rules are running

Open the app's detail page and look at the `mv_rule_rp001` to `mv_rule_rp004` entries under **Resources**, or open **Materialized Views** in the Console and confirm all four show as running.

### Open the dashboard

From the app's detail page, open the **Dashboard** tab and click **AgentGuard Overview**. The panels populate as events arrive.

---

## 7. Manage rules, upgrade and uninstall

**Pause or resume a rule.** Each rule is a materialized view:

```sql
SYSTEM PAUSE MATERIALIZED VIEW ag.mv_rule_rp002;
SYSTEM RESUME MATERIALIZED VIEW ag.mv_rule_rp002;
```

Rules are left running across upgrades. A rule you paused stays paused.

**Upgrade.** When a newer AgentGuard version is in the catalog, the app card shows **Update Available**. Upgrading keeps all data in `ag`, adds any new resources and replaces the dashboard. See [Upgrading an app](/app-framework#upgrading-an-app).

**Uninstall.** Deleting the app from the Apps page drops database `ag` and **all telemetry stored in it**. Export anything you want to keep first.
