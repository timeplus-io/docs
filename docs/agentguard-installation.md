# AgentGuard Installation Guide

This guide walks through a complete AgentGuard setup from scratch:

1. [Prerequisites](#1-prerequisites)
2. [Install and run Timeplus](#2-install-and-run-timeplus)
3. [Install and run AgentGuard](#3-install-and-run-agentguard)
4. [First-time setup wizard](#4-first-time-setup-wizard)
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

> **Docker Compose shortcut:** to run Timeplus and AgentGuard together in one step, skip to [Option C](#option-c--docker-compose-recommended-for-new-installs).

---

## 3. Install and run AgentGuard

### Option A — Shell script installer (recommended)

The installer downloads the correct binary for your platform, installs it to `/usr/local/bin`, and writes a minimal `~/.agentguard/config.yaml` with the Timeplus host/port.

```bash
# Install latest
curl -fsSL https://agentguard.s3.us-west-1.amazonaws.com/install.sh | sh

# Install a specific version
curl -fsSL https://agentguard.s3.us-west-1.amazonaws.com/install.sh | sh -s -- --version v1.2.3
```

Supported platforms: macOS (Apple Silicon / Intel), Linux (x86-64 / ARM64).

After installation, start AgentGuard:

```bash
agentguard
```

Open [http://localhost:8080](http://localhost:8080) — the **setup wizard** appears on first launch (see [Section 4](#4-first-time-setup-wizard)).

### Option B — Docker image (standalone)

```bash
docker run -d \
  --name agentguard \
  -p 8080:8080 \
  -e TIMEPLUS_HOST=<timeplus-host> \
  -e AGENTGUARD_URL=http://<agentguard-host>:8080 \
  -v agentguard-data:/app/data \
  --restart unless-stopped \
  ghcr.io/timeplus-io/agentguard:latest
```

Replace `<timeplus-host>` with the hostname or IP where Timeplus is running (use `host.docker.internal` on macOS/Windows when Timeplus runs on the host machine).

Replace `<agentguard-host>` with the address Timeplus will use to call back AgentGuard for alert webhooks — see [Alert UDF webhook](#alert-udf-webhook) below.

The `-v agentguard-data:/app/data` volume persists the `config.yaml` written by the setup wizard across container restarts and image upgrades. Without it, setup runs again after every restart.

> **Credentials** are entered in the setup wizard — not via environment variables.

### Option C — Docker Compose (recommended for new installs)

This starts Timeplus and AgentGuard together with the correct networking:

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
    image: ghcr.io/timeplus-io/agentguard:latest
    container_name: agentguard
    ports:
      - "8080:8080"
    environment:
      TIMEPLUS_HOST: timeplus
      TIMEPLUS_PORT: 3218
      SERVER_PORT: 8080
      # Timeplus calls this URL for alert webhooks; use the Docker service name.
      AGENTGUARD_URL: "http://agentguard:8080"
    volumes:
      # Persists config.yaml and custom catalog rules across restarts and image upgrades.
      # Mounted at /app/data only — the binary is never shadowed by the volume.
      - agentguard-data:/app/data
    depends_on:
      timeplus:
        condition: service_healthy
    restart: unless-stopped

volumes:
  timeplus-data:
  agentguard-data:
```

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080) — the **setup wizard** appears on first launch.

- AgentGuard waits for Timeplus to pass its health check before starting.
- `AGENTGUARD_URL=http://agentguard:8080` ensures Timeplus Enterprise can call back AgentGuard using the Docker service name.
- Credentials are entered in the setup wizard, not in the compose file.

To stop and remove all data (requires re-setup):
```bash
docker compose down -v
```

### Alert UDF webhook

When a security rule fires, Timeplus executes a Python UDF (`notify_agentguard_udf`) that HTTP-POSTs the alert back to AgentGuard at:

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

## 4. First-time setup wizard

On first launch, AgentGuard shows a 3-step setup wizard instead of the dashboard.

**Step 1 — Connection:** Enter your Timeplus host, HTTP port (3218), native TCP port (8463), and the AgentGuard URL (used for alert callbacks). Defaults are pre-filled from environment variables if set.

**Step 2 — Credentials:** Enter your Timeplus username and password. Click **Test Connection** to verify — the Next button is disabled until the test passes. Credentials are never stored on disk or in the config file; they live only in the server's in-memory session.

**Step 3 — Provision:** Click **Provision Resources** to create all required Timeplus streams, materialized views, UDFs, and seed data. Progress is streamed live in a terminal-style log. On success, you are automatically logged in and redirected to the dashboard.

After setup completes, `config.yaml` is written with `setup_complete: true` and the connection details (no credentials). Subsequent server restarts skip directly to the login page.

> **Re-running setup:** Setup runs only once. To reset, delete `config.yaml` (or remove the Docker volume) and restart the server.

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
          "username": "default",
          "password": ""
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
export AGENTGUARD_USERNAME=default
export AGENTGUARD_PASSWORD=""
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
export AGENTGUARD_USERNAME="default"
export AGENTGUARD_PASSWORD=""
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
./agentguard 2>&1 | grep -E "timeplus|AgentGuard"

# Docker Compose
docker logs agentguard 2>&1 | grep -E "timeplus|AgentGuard"
```

Look for lines like:
```
AgentGuard starting on :8080
Timeplus endpoint: localhost:3218 (native: 8463)
AgentGuard webhook URL: http://localhost:8080
Setup complete: false
```

`Setup complete: false` means the setup wizard will run — navigate to [http://localhost:8080](http://localhost:8080) to complete it. After setup and restart:
```
Setup complete: true
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

Navigate to [http://localhost:8080](http://localhost:8080):
- **First launch:** the setup wizard runs automatically
- **After setup:** the login page appears; sign in with your Timeplus credentials
- **After login:** you land on the dashboard; use the **Onboarding** wizard (`/onboarding`) to connect your first agent
