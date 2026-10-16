# Timeplus Enterprise 3.4 — What's New

Timeplus Enterprise 3.4 is Timeplus's first **agentic** release. It introduces **Tabby**, a conversational data agent built directly into every workspace, and a new **App Framework** that packages complete real-time solutions — pipelines, dashboards and all — as one-click installable apps. Together they mark a shift from "a streaming SQL engine you query" toward "a streaming data platform you can talk to and extend."

## Highlights at a Glance

- **Tabby, the Timeplus Data Agent** — a chat assistant built into every workspace that explores your data, diagnoses pipeline health, and (with your approval) acts on what it finds. [Learn more](/tabby).
- **Human-in-the-loop by design** — Tabby runs every SQL statement as *your* logged-in user, so Timeplus's own role-based access control is always the backstop; writes can require your explicit approval before anything touches the workspace.
- **App Marketplace and App Framework** — browse and install curated, ready-to-run solutions (e.g. Kafka lag monitoring, log analytics) as self-contained apps, complete with pre-built pipelines and dashboards, configurable in a guided install wizard.
- **Bring your own LLM** — Tabby works with OpenAI, Anthropic, and any OpenAI- or Anthropic-compatible endpoint (self-hosted gateways, Ollama, vLLM, Amazon Bedrock), validated against two dozen+ frontier and open models.
- **Extend the agent with external tools** — connect Tabby to your own HTTP-based tool servers (MCP) so it can act outside the workspace, with per-server approval policies.
- **Build and share your own apps** — package streams, materialized views, UDFs and dashboards into a single `.tpapp` file with a declarative manifest; publish privately or to the community catalog.
- **Core engine hardening** — experimental vector-similarity and full-text search indexes, smarter tiered-storage merge-before-move behavior, bounded primary-key index memory, distributed-query correctness fixes, and a long list of replication/checkpoint reliability fixes under sustained production load.

## Upgrade Notes (read before upgrading) {#upgrade-notes}

| Change | Impact |
| :---- | :---- |
| Tabby is **enabled by default** after upgrading | The agent's chat routes, floating panel, and the "Tabby Agent" settings tab appear automatically. Nothing is created inside your workspace and no LLM calls are made until an admin saves an LLM endpoint under Settings → Tabby Agent. Set `enable-agent: false` in the appserver's `config.yaml` (see [server configuration](/server_config#appserver)) to hide the feature entirely if you are not ready to adopt it. |
| Tenants that configured Tabby on an **engineering build before 3.4.11** may have a saved response-length limit (`max_tokens`) of 1024 | That low limit now causes longer answers to cut off sooner than most admins expect (the default was raised to 8192 in build 3.4.11). Engineering build numbers run on their own, higher-counting sequence than stable release numbers — build 3.4.11 is *older* than stable release 3.4.1, not newer. If you configured Tabby before upgrading, open Settings → Tabby Agent and raise "Max tokens" — the stored value is kept as-is across the upgrade for safety, it is not auto-raised. |
| Tabby's LLM API key and any connected external-tool secrets are **encrypted at rest** | If you set the `NEUTRON_ENCRYPTION_KEY` environment variable for the appserver process for the first time after already saving an LLM key, the previously saved key cannot be recovered under the new encryption — re-enter it once after upgrading. Without this variable set, a built-in default key is used (fine for evaluation, not recommended for production credentials). On the Helm chart, set this via `timeplusAppserver.encryptionKey` or `timeplusAppserver.existingEncryptionKeySecret`. |
| The App Marketplace now points at Timeplus's **public catalog** by default | `GET /apps/available` fetches a public, Timeplus-hosted app index out of the box. Air-gapped or private deployments should point the appserver's `app-registry-url` config.yaml setting (or `--app-registry-url` flag) at an internal catalog, or expect that endpoint to need outbound internet access. Installing an app directly from a local `.tpapp` file or a URL always works with no registry configured. |
| Installed apps no longer get a `_tp_app_` database prefix | New installs create a database named exactly after the app's own `db_name`. No action needed for existing installs; this only affects naming going forward. |
| Changelog materialized views using a nullable argument with `sum_if` / `count_if` / other `_if` aggregates | Before this fix, retracting (updating) an existing key in a changelog query threw `NOT_IMPLEMENTED` instead of producing a correct result (#12243) — every subsequent update to that key kept failing until the view was recreated. The internal checkpoint layout also changed to support the fix; existing checkpoints are not compatible — recreate any affected materialized view after upgrading. |
| Streams written with idempotent insert ids and `MATERIALIZE INDEX ... WITH CLEAR` run on a mutable stream whose secondary index key is a subset of the primary key | A rebuild bug that wrote bad empty-key entries is fixed (#12351); if you ever ran that rebuild before upgrading, re-run `MATERIALIZE INDEX ... WITH CLEAR` once after upgrading to purge the bad entries. |
| Pulsar external streams using inline TLS settings on a plain `pulsar://` URL | The vendored Pulsar client was upgraded; TLS must now be requested via a `pulsar+ssl://` service URL — a `pulsar://` URL with TLS settings now only logs a warning and connects in **plaintext**, instead of silently enabling TLS as before. An existing stream pointed at a TLS-only broker will now fail to connect outright (the broker rejects the plaintext handshake) rather than being silently downgraded. |

---

## 1\. Tabby — the Timeplus Data Agent {#tabby-agent}

Tabby is a chat-based data engineering assistant built into every workspace. Ask it questions in plain English and it explores your actual tables, materialized views, pipelines and system health to answer them — and, with your approval, proposes and runs the SQL to act on what it finds.

- **Explores and diagnoses your workspace** — writes and runs SQL against your catalog of streams, views, materialized views, sources and sinks, and checks pipeline lag, failures and throughput using a built-in library of diagnostic recipes.
- **Proposes and (with approval) runs changes** — every SQL statement executes as *your* signed-in user, so Timeplus's own role-based permissions are always the real boundary; an admin chooses read-only, approval-required, or unrestricted mode.
- **Writes its own tools** — creates small Python or JavaScript functions on the fly when a plain SQL query can't do the job.
- **Remembers and learns** — keeps durable notes across conversations (private or shared with your workspace), and saves, refines and reuses step-by-step "skills" so it improves at your specific workflows over time.
- **Works unattended** — runs standing instructions on a schedule or whenever new data arrives, always read-only, and reports back in a dedicated conversation.
- **Connects to external tools via MCP** — reaches outside the workspace to your own HTTP-based tool servers, with per-server approval policies.
- **Works with your LLM of choice** — OpenAI, Anthropic, and any OpenAI- or Anthropic-compatible endpoint, including self-hosted gateways and Amazon Bedrock.

[Learn more about Tabby](/tabby) — admin setup, permission modes, skills, memory, MCP connections, supported models, and the full configuration reference.

---

## 2\. App Framework — install ready-made real-time solutions {#app-framework}

The App Framework packages a complete real-time solution — the streams, pipelines, materialized views and dashboards that solve a specific problem — into a single installable app, browsable from a built-in catalog.

- **Browse and install** — the Apps page's Catalog (Timeplus and community apps, with search and category filters) or Installed view; install from the catalog or from a `.tpapp` file.
- **Safe by default** — a failed install rolls back atomically so an app is never left half-installed; password- and API-key-style configuration fields are masked and stored as secrets.
- **Upgrade and uninstall cleanly** — upgrades replace dashboards and add new resources without ever dropping or altering existing data; uninstall gives you a choice to keep or delete the app's data.
- **Dedicated per-app resources** — each installed app gets its own database, so installing the same app twice for different data sources never collides.
- **Manage what's installed** — a detail page per app with configuration, a resources/lineage view, bundled dashboards, and an audit log of install/upgrade/configuration events.
- **Build and publish your own apps** — package streams, materialized views, UDFs and dashboards into a single `.tpapp` archive with a declarative manifest, configuration fields templated into SQL and dashboards, and resource declarations down to Python package dependencies and storage disks.

[Learn more about the App Framework](/app-framework) — manifest reference, templating helpers, and the app-registry configuration for air-gapped deployments.

---

## 3\. Core Engine: Reliability, Storage and New Index Types {#core-engine}

Alongside the two new appserver-level features, Timeplus Enterprise 3.4 carries forward a full release cycle of improvements to **timeplusd**, the core streaming SQL engine — spanning new experimental index types, smarter tiered-storage behavior, and a substantial list of correctness and reliability fixes found and closed out under real production load.

### 3.1 Experimental vector-similarity and full-text search indexes (#12292) {#vector-fulltext-indexes}

timeplusd gains two new index types, ported from upstream ClickHouse and adapted to Timeplus's streaming engine:

- **Vector-similarity index** — speeds up nearest-neighbor search over vector/embedding columns, the building block for semantic search and RAG-style retrieval directly inside Timeplus.
- **Full-text (inverted) index** — speeds up `has_token()`-style text search over string columns, without a full table scan.

Both are **experimental** in 3.4: available to try, but not yet recommended as the primary access path for a production-critical query. A follow-up hardening fix (#12369) closed a crash found while validating the port, where dropping a table mid-merge while a text index was still finalizing on-disk could abort the server.

### 3.2 Smarter tiered storage: merge-before-move and move-grace holding (#12269, #12360) {#tiered-storage}

Two related improvements make `TTL ... TO VOLUME/DISK` on a `prefer_not_to_merge` cold tier (typically S3) behave the way most operators already expect:

- **Merge before move (#12269)**: when a batch of small parts becomes TTL-eligible to move to a cold volume, timeplusd now checks whether those parts can still be merged with a neighbor first. If they can, the merge runs through the normal merge scheduler and the (now larger, fewer) resulting parts move to the cold tier afterward — instead of each small part being uploaded to S3 individually. Parts that genuinely have no merge partner move immediately as before, and disk-pressure evacuation always takes priority over waiting for a merge.
- **Move-grace holding (#12360)**: a new stream setting, `ttl_move_grace_seconds` (default 300), additionally holds a *lone* part — one with no current merge partner — for a short grace window before moving it, in case a merge partner shows up moments later from continued ingestion. This specifically helps steady, small-batch streaming ingestion into an already-expired TTL window, which previously moved every single small part to the cold tier as soon as it landed.

Net effect: fewer, larger objects land in cold/object storage, which means fewer PUT requests and better compression — without changing how `prefer_not_to_merge` or TTL moves are configured.

### 3.3 Primary-key index memory is now boundable (#12284) {#primary-key-index-memory}

Building on 3.3's lazy-loaded primary key indexes, 3.4 adds a new per-stream setting, `primary_key_cache_max_bytes`, that caps how much memory loaded primary-key indexes are allowed to hold at once. Once the cap is exceeded, the least-recently-used indexes are evicted in batches and transparently reloaded the next time they're needed — closing the gap where a stream with many parts and a high-cardinality primary key could otherwise grow its resident index memory unbounded after 3.3's lazy loading. The default (`0`) preserves the previous unlimited behavior; set it explicitly at `CREATE STREAM` time to bound it (it cannot be changed later via `ALTER STREAM`).

### 3.4 Distributed query correctness fixes (#12344, #12357, #12304) {#distributed-query-fixes}

Three fixes tighten up how queries behave on multi-shard and multi-node deployments:

- **Query a specific node's data directly** — `SELECT ... FROM table(my_stream) SETTINGS target_nodes='<node_id>'` now works for ordinary historical queries (previously this setting only applied to log level changes and log introspection), making it straightforward to inspect exactly what one node currently holds.
- **Fixed: `count()` could be badly overcounted on multi-shard streams.** When several shards of the same stream were co-located on one node, a plain `SELECT count()` could return the total across all co-located shards multiple times over — now `count()` is correctly restricted to just the shards the query actually asked for.
- **Fixed: `SYSTEM STOP MERGES` / `SYSTEM STOP MOVES` on a multi-shard stream only stopped the first shard.** Both commands now apply to every shard of the stream on that node, matching what most operators already assumed.

### 3.5 Operational and tooling improvements

- **`timeplusd stream` tool gains partition-scoped repair** (#12331): beyond the full stream backup/restore introduced in 3.3, the offline stream tool can now back up and restore **individual partitions** of a replica (`backup --partition`), additively filling just the missing partitions on a damaged replica without touching the rest of its data — with the same safety guarantees (pre-fill data is stashed, a sequence-number guard prevents corrupting committed state, and `revert` undoes a fill cleanly).
- **Hardened offline recovery CLI** (`timeplusd meta`) (#12300): the last-resort tool for inspecting and repairing the metadata store when the server won't start no longer crashes on malformed input, now supports deleting an entire broken database offline (previously impossible once a database's files were already gone from disk), and every destructive action requires explicit confirmation with a clear exit-code contract.
- **Confluent Schema Registry: configurable multi-schema consumption** (#12294): previously, a Kafka topic carrying more than one Avro schema via Confluent's registry had no way to select which type to consume — consuming it could fail outright with a schema-registry subject-lookup error, or silently mis-map fields across the different schema types. A new external stream setting, `consume_schema_strategy` (`single` / `all` / `raw`), now controls how such messages are decoded.
- **Pulsar client upgraded to 4.2.0** (#12281): fixes a bug where a failed seek (for example to a checkpoint position already trimmed by topic retention) was silently reported as successful, which could mask a consumer that stopped making progress. TLS must now be requested with a `pulsar+ssl://` URL (see Upgrade Notes).
- **Avro decoding hardened** (#12364): long Avro arrays/maps split into multiple blocks (as produced by some Java encoders) now decode correctly instead of failing with a negative-length error; a related crash decoding Avro data submitted directly over HTTP (outside of Kafka) is also fixed.

### 3.6 Reliability fixes under production load

The majority of this release's engine effort went into closing out correctness and availability issues found operating multi-node clusters under real workloads — the kind of fix that doesn't change a single SQL statement's behavior but materially improves uptime:

- **Replication and consensus (Raft)**: fixed a self-deadlock where a slow or unresponsive peer could freeze replication and leader elections for every shard a node led, recoverable only by a restart (#12417); fixed a crash-on-start after an unclean shutdown where the persisted Raft state and the durable log disagreed on what had been committed (#12382).
- **Checkpointing**: fixed a bug where a materialized view's checkpoint "barrier" could be silently dropped on Linux's async read path, leaving the view's checkpoint permanently stuck in-progress with no error ever surfaced (#12326).
- **Nullable `arg_min`/`arg_max` checkpoint recovery** (#12407): fixed a materialized view using a nullable `arg_min`/`arg_max` argument that could never recover from its checkpoint — every recovery attempt failed with `CORRUPTED_DATA`, leaving the view stuck in recovery until it was recreated; the bug affected all releases since 2.9.x (#9130+).
- **Commit path durability**: fixed a case where a failed commit to historical storage (for example during a transient memory or disk pressure spike) could permanently freeze a shard's committed position, causing unbounded log retention until a restart — the engine now retries automatically instead (#12404); fixed a related server crash after a schema change (`ALTER STREAM`) landed in the same flush window as idempotent writes (#12406); fixed permanent data loss where records from a failed commit were later re-fetched and incorrectly discarded as duplicates (#12392).
- **Mutable streams**: fixed incorrect timestamps and silently dropped columns on certain inserts into "coalesced" mutable streams (#12391).
- **Resource cleanup**: fixed a storage-policy / stream-drop race that could leave a dropped stream's data directory behind on disk forever (#12390); fixed streaming queries and materialized views pinning historical data parts indefinitely, preventing their cleanup even after the data expired or was merged away (#12375).
- **`CREATE STREAM ... AS SELECT`**: fixed `CREATE [MUTABLE] STREAM ... AS (SELECT ...)` failing with `NUMBER_OF_COLUMNS_DOESNT_MATCH` and leaving a half-created stream behind; the workaround of explicitly listing `_tp_time` in the `SELECT` to dodge that error silently dropped its `now64()` default, so later inserts stored the Unix epoch instead of the current time. Also fixes a server crash on the mutable-stream variant (#12394).
- **Materialized views over log streams**: fixed materialized views over internal log streams (e.g. `system.timeplusd_err_log`) failing to ever start on multi-node clusters (#12373).
- **`remote()` table function**: fixed queries using `remote()` to point at the server's own address incorrectly running as a remote connection instead of locally, which could cause spurious access-denied errors and incorrect `GLOBAL IN` results (#12395).
- **Storage policy safety**: `CREATE STORAGE POLICY` now rejects read-only or write-once disk types (e.g. `s3_plain`) that cannot support TTL/tiering moves, closing off a misconfiguration that could otherwise cause runaway, repeated re-uploads of the same data (#12377).
- **`OPTIMIZE STREAM ... PARTITION`**: previously merged every part of the named partition in one unconditional pass — behaving the same as `PARTITION ... FINAL` even without `FINAL` — ignoring the `max_bytes_to_merge_at_max_space_in_pool` and `max_parts_to_merge_at_once` limits that bound a regular merge; now respects those same limits per call (#12367).
- **Cluster memory display staleness** (#12410): fixed the Console's Nodes Overview "Memory Total" sticking at its startup value after a live cgroup memory-limit change (Kubernetes in-place resize, `docker update`, `systemctl set-property`), which could show Memory Used above Memory Total. Display only — the server's actual memory limit and admission control were unaffected.
- **Large allocations no longer silently exhaust memory** (#12355): ported ClickHouse's `operator new` memory-limit enforcement so a sufficiently large single allocation now throws `MEMORY_LIMIT_EXCEEDED` instead of continuing unchecked until the server is OOM-killed.
