# AgentGuard Installation Guide

This guide walks through a complete AgentGuard setup from scratch:

1. [Prerequisites](#1-prerequisites)
2. [Install and run Timeplus](#2-install-and-run-timeplus)
3. [Create a Timeplus user for AgentGuard](#3-create-a-timeplus-user-for-agentguard)
4. [Install and run AgentGuard](#4-install-and-run-agentguard)
5. [Connect OpenClaw](#5-connect-openclaw)
6. [Connect Claude Code](#6-connect-claude-code)
7. [Verify everything is working](#7-verify-everything-is-working)

---

## 1. Prerequisites

| Requirement | Minimum version | Notes |
|---|---|---|
| Docker | 24+ | Optional — only needed for Docker-based Timeplus or AgentGuard |
| Timeplus Enterprise | **3.2.1+** | Required — earlier versions are not supported |
| Node.js | 18+ | Required for agent plugins |
| Go | 1.23+ | Only if building AgentGuard from source |
| Claude Code CLI | any | Only for Claude Code integration |
| OpenClaw | 2026.4.0+ | Only for OpenClaw integration |

---

## 2. Install and run Timeplus

AgentGuard requires [Timeplus Enterprise](https://timeplus.com) **3.2.1 or later**. Follow the official installation guide for your preferred deployment method:

- **Binary (Linux / macOS):** [docs.timeplus.com/bare-metal-install](https://docs.timeplus.com/bare-metal-install)
- **Docker / Docker Compose:** same page, Docker Install section

Once Timeplus is running, the following ports must be reachable by AgentGuard and the agent plugins:

| Port | Service | Purpose |
|---|---|---|
| `3218` | Timeplus | HTTP query API — used by AgentGuard |
| `8463` | Timeplus | Native TCP protocol — used by AgentGuard |
| `4317` | Timeplus | OTLP gRPC — agent OTel telemetry |
| `4318` | Timeplus | OTLP HTTP — agent OTel telemetry |
| `8000` | Timeplus | Web console |

Wait for Timeplus to be ready before continuing:

```bash
until curl -sf http://localhost:3218/ping > /dev/null 2>&1; do
  echo "Waiting for Timeplus..."; sleep 5
done
echo "Timeplus is ready"
```

> **Docker Compose shortcut:** to run Timeplus and AgentGuard together in one step, skip to [section 4C](#option-c--docker-compose-recommended-for-new-installs).

---

## 3. Create a Timeplus user for AgentGuard

AgentGuard connects to Timeplus using dedicated credentials. Skip this section if you are using the default `default` user with no password (acceptable for local dev).

### Via Timeplus web console

1. Open [http://localhost:8000](http://localhost:8000) in your browser.
2. Log in with the default admin credentials (set during first-run setup).
3. Navigate to **Settings → Users → Add User**.
4. Create a user — for example:
   - **Username:** `User`
   - **Password:** `Password`
   - **Role:** Admin (AgentGuard needs DDL permissions to create streams and views on startup)
5. Click **Save**.

---

## 4. Install and run AgentGuard

### Option A — Shell script installer (recommended)

The installer downloads the correct binary for your platform from S3, installs it to `/usr/local/bin`, and guides you through Timeplus Enterprise connection configuration interactively.

```bash
# Install latest
curl -fsSL https://agentguard.s3.us-west-1.amazonaws.com/install.sh | sh

# Install a specific version
curl -fsSL https://agentguard.s3.us-west-1.amazonaws.com/install.sh | sh -s -- --version v1.2.3
```

Supported platforms: macOS (Apple Silicon / Intel), Linux (x86-64 / ARM64).

The script will:
1. Download the correct binary and install it to `/usr/local/bin/agentguard`
2. Prompt for your Timeplus Enterprise connection settings and write `~/.agentguard/config.yaml`
3. Optionally set up AgentGuard as a background service (launchd on macOS, systemd on Linux)

After installation, start AgentGuard manually with:
```bash
agentguard
```

Or use the service that was configured during installation.

Open [http://localhost:8080](http://localhost:8080).

AgentGuard creates all required Timeplus streams and materialized views on first startup. This is non-fatal — the server starts even if Timeplus is temporarily unavailable.

> **Non-interactive install:** If you pipe the script through `sh` without a terminal (e.g. in CI), configuration prompts are skipped. Edit `~/.agentguard/config.yaml` manually afterwards.

### Option C — Docker Compose (recommended for new installs)

This starts Timeplus and AgentGuard together with the correct networking. Save the following as `docker-compose.yaml` and run it:

```yaml
services:
  timeplus:
    image: timeplus/timeplus-enterprise:3.2.1
    platform: linux/amd64
    container_name: timeplus
    ports:
      - "3218:3218"   # HTTP query API (used by AgentGuard)
      - "8123:8123"   # HTTP query API normal
      - "8463:8463"   # Native TCP protocol
      - "4317:4317"   # OTLP gRPC (agent OTel telemetry)
      - "4318:4318"   # OTLP HTTP (agent OTel telemetry)
      - "8000:8000"   # Timeplus Enterprise web console
    volumes:
      - timeplus-data:/timeplus/data/
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "bash -c 'echo > /dev/tcp/localhost/3218' 2>/dev/null || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 30s

  agentguard:
    image: timeplus/agentguard:latest
    container_name: agentguard
    ports:
      - "8080:8080"
    environment:
      TIMEPLUS_HOST: timeplus
      TIMEPLUS_PORT: 3218
      TIMEPLUS_NATIVE_PORT: 8463
      TIMEPLUS_USER: "proton"
      TIMEPLUS_PASSWORD: "timeplus@t+"
      SERVER_PORT: 8080
      # Timeplus calls this URL for alert webhooks; use the Docker service name.
      AGENTGUARD_URL: "http://agentguard:8080"
    depends_on:
      timeplus:
        condition: service_healthy
    restart: unless-stopped

volumes:
  timeplus-data:
```

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080).

- AgentGuard waits for Timeplus to pass its health check before starting.
- `AGENTGUARD_URL=http://agentguard:8080` ensures Timeplus Enterprise can call back AgentGuard for alert webhooks using the Docker service name.
- Change `TIMEPLUS_USER` / `TIMEPLUS_PASSWORD` if you created a different user in step 3.

To stop and remove volumes:
```bash
docker compose down -v
```

### Option B — Docker image (standalone)

```bash
docker run -d \
  --name agentguard \
  -p 8080:8080 \
  -e TIMEPLUS_HOST=<timeplus-host> \
  -e TIMEPLUS_USER=proton \
  -e TIMEPLUS_PASSWORD="timeplus@t+" \
  -e AGENTGUARD_URL=http://<agentguard-host>:8080 \
  --restart unless-stopped \
  timeplus/agentguard:latest
```

Replace `<timeplus-host>` with the hostname or IP where Timeplus is running (use `host.docker.internal` on macOS/Windows when Timeplus runs on the host machine).

Replace `<agentguard-host>` with the address Timeplus will use to call back AgentGuard for alert webhooks — see [Alert UDF webhook](#alert-udf-webhook) below.

### Alert UDF webhook

AgentGuard creates a Timeplus Python UDF (`notify_agentguard_udf`) at startup. When a security rule fires, Timeplus calls this UDF, which HTTP-POSTs the alert back to AgentGuard at:

```
<AGENTGUARD_URL>/api/alerts/webhook
```

This is a **Timeplus → AgentGuard** call, so `AGENTGUARD_URL` must be the address where AgentGuard is reachable _from Timeplus's network perspective_:

| Deployment | `AGENTGUARD_URL` |
|---|---|
| Both on host | `http://localhost:8080` _(default)_ |
| Docker Compose | `http://agentguard:8080` _(pre-configured)_ |
| AgentGuard in Docker, Timeplus on host | `http://host.docker.internal:8080` |
| Remote / cloud | `http://<public-ip-or-hostname>:8080` |

---

## 5. Connect OpenClaw

### 5a. Install the plugin

```bash
npm install @timeplus/agentguard-openclaw-plugin
```

### 5b. Configure the plugin

Add the plugin to your `openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "agentguard": {
        "enabled": true,
        "config": {
          "timeplusUrl": "http://localhost:3218",
          "deploymentId": "my-team",
          "deploymentName": "My Team",
          "stream": "agentguard_hook_events",
          "flushMs": 2000,
          "batchSize": 50,
          "username": "proton",
          "password": "timeplus@t+"
        }
      }
    }
  }
}
```

Or set environment variables before starting OpenClaw:

```bash
export AGENTGUARD_TIMEPLUS_URL=http://localhost:3218
export AGENTGUARD_DEPLOYMENT_ID=my-team
export AGENTGUARD_DEPLOYMENT_NAME="My Team"
export AGENTGUARD_USERNAME=proton
export AGENTGUARD_PASSWORD="timeplus@t+"
```

> **Docker (OpenClaw in container, Timeplus on host):** Use `http://host.docker.internal:3218` instead of `localhost`.

### 5c. OTel diagnostics

To export LLM traces, metrics, and logs from OpenClaw to Timeplus, add the `diagnostics-otel` section to `openclaw.json`:

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

> **Docker:** Use `http://host.docker.internal:4318` for the endpoint.

### 5d. Docker-based setup (this repo)

If running OpenClaw via Docker using the Makefile in `agents/openclaw/`:

```bash
cd agents/openclaw

make workspace      # one-time: create .openclaw/ with correct permissions
make init           # one-time: run the OpenClaw onboarding wizard
make configure      # inject AgentGuard plugin config into openclaw.json
make deploy-plugin  # build plugin + start container
make url            # print the dashboard URL with auth token
```

`make configure` automates steps 5b and 5c above for the Docker environment.

---

## 6. Connect Claude Code

### 6a. Install the plugin globally

```bash
npm install -g @timeplus/agentguard-claudecode-plugin
```

This installs the `agentguard-hook` command on your `PATH`.

### 6b. Set environment variables

Add these to your shell profile (`~/.zshrc` or `~/.bashrc`) **before** launching Claude Code:

```bash
export AGENTGUARD_AGENT_ID="your-hostname"        # identifies this machine
export AGENTGUARD_DEPLOYMENT_ID="local"
export AGENTGUARD_DEPLOYMENT_NAME="Local Dev"
export AGENTGUARD_TIMEPLUS_URL="http://localhost:3218"
export AGENTGUARD_USERNAME="proton"
export AGENTGUARD_PASSWORD="timeplus@t+"
```

Then reload your shell:

```bash
source ~/.zshrc   # or ~/.bashrc
```

### 6c. Register hooks in Claude Code

Merge the following into `~/.claude/settings.json`. If the file does not exist, create it.

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

### 6d. OTel telemetry

Add the following `env` block to `~/.claude/settings.json` (merge with any existing `env` keys) to capture LLM token usage, cost, and latency from Claude Code:

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

> **Protocol note:** Claude Code requires `http/protobuf`. Do not use `grpc`.

---

## 7. Verify everything is working

### Check Timeplus is reachable

```bash
curl -s http://localhost:3218/ping
# expected: "Ok."
```

### Check AgentGuard started cleanly

```bash
# Binary / local
./backend/server 2>&1 | grep -E "timeplus|AgentGuard"

# Docker Compose
docker logs agentguard 2>&1 | grep -E "timeplus|AgentGuard"
```

Look for lines like:
```
AgentGuard starting on :8080
Proton endpoint: localhost:3218 (native: 8463)
AgentGuard webhook URL: http://localhost:8080
timeplus: UDF notify_agentguard_udf created/updated (webhook: http://localhost:8080)
```

### Check Claude Code hook events are arriving

Start a Claude Code session, run a tool call, then query Timeplus:

```bash
curl -s -X POST http://localhost:3218/proton/v1/query \
  -H 'Content-Type: application/json' \
  -d '{"query":"SELECT hook_name, agent_id, event_time FROM table(agentguard_hook_events) WHERE agent_type='"'"'claudecode'"'"' ORDER BY event_time DESC LIMIT 5"}'
```

### Check OpenClaw hook events are arriving

```bash
curl -s -X POST http://localhost:3218/proton/v1/query \
  -H 'Content-Type: application/json' \
  -d '{"query":"SELECT hook_name, agent_id, event_time FROM table(agentguard_hook_events) WHERE agent_type='"'"'openclaw'"'"' ORDER BY event_time DESC LIMIT 5"}'
```

### Open the dashboard

Navigate to [http://localhost:8080/onboarding](http://localhost:8080/onboarding) for the guided setup wizard, or go straight to [http://localhost:8080/dashboard](http://localhost:8080/dashboard) to see live agent activity.
