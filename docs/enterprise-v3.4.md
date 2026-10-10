# Timeplus Enterprise 3.4

## Key Highlights

For a detailed tour of the new features in this release, see [What's New in Timeplus Enterprise 3.4](/enterprise-v3.4-whats-new).

Key highlights of the Timeplus 3.4 release include:

1. [**Tabby, the Timeplus Data Agent**](/enterprise-v3.4-whats-new#tabby-agent): a conversational data agent built into every workspace that explores your data, triages pipeline health, proposes and (with approval) runs DDL, writes its own Python/JavaScript UDFs, remembers facts across conversations, learns reusable "skills", runs standing instructions on a schedule, and connects to external tools via MCP. Works with OpenAI, Anthropic, and any compatible endpoint (including Amazon Bedrock).
2. [**App Framework and App Marketplace**](/enterprise-v3.4-whats-new#app-framework): install, upgrade and manage ready-made real-time solutions — pipelines and dashboards bundled together — as self-contained `.tpapp` packages, browsable from a built-in catalog or built and published yourself.
3. [**Core engine: new experimental index types**](/enterprise-v3.4-whats-new#core-engine): vector-similarity and full-text (inverted) indexes land in timeplusd for the first time, enabling semantic search and fast token search directly in the engine.
4. [**Smarter tiered storage**](/enterprise-v3.4-whats-new#core-engine): merge-before-move and move-grace holding substantially reduce the number of small objects written to a cold/S3 storage tier under continuous streaming ingestion.
5. [**Bounded primary-key index memory**](/enterprise-v3.4-whats-new#core-engine): a new per-stream cache limit evicts least-recently-used primary-key indexes, closing a memory growth path left open by 3.3's lazy index loading.
6. [**Distributed query correctness fixes**](/enterprise-v3.4-whats-new#core-engine): `SETTINGS target_nodes` now works for ordinary historical queries, `count()` is no longer overcounted on co-located shards, and `SYSTEM STOP MERGES`/`MOVES` now covers every shard of a multi-shard stream.
7. A long list of **replication, checkpoint and commit-path reliability fixes** closed out under sustained production load — Raft deadlock and recovery fixes, checkpoint barrier loss, failed-commit recovery and data-loss fixes, mutable stream fixes, and more.

## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 3.4.1 {#3_4_1}
Released on 09-30-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_4_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.4.1`
* For Kubernetes users: see the [Timeplus Helm chart repository](https://github.com/timeplus-io/helm-charts) for the chart version tracking 3.4.1 (the chart's `enableAgent` toggle for Tabby is rolling out — check the chart's release notes before upgrading)

Component versions:
* timeplusd 3.4.1
* timeplus_appserver 3.4.1
* timeplus_connector 3.1.0
* timeplus cli 3.1.1
* timeplus byoc 1.1.0-rc.0

#### Changelog {#changelog_3_4_1}

This release consolidates all timeplusd changes from 3.3.1 through 3.4.1, plus the first appserver release of Tabby, the Timeplus Data Agent, and the App Framework.

**Timeplus Appserver**

See [What's New in Timeplus Enterprise 3.4](/enterprise-v3.4-whats-new) for the full tour. Highlights:
* Tabby, the Timeplus Data Agent — chat, SQL permission modes with human-in-the-loop approval, skills, cross-conversation memory, background tasks, MCP external tool connections, downloadable artifacts, and support for OpenAI/Anthropic-compatible models including Amazon Bedrock
* App Framework — app marketplace/catalog, install/upgrade/uninstall lifecycle, per-app resource and dashboard management, and tooling to build and publish your own apps

**timeplusd — Features and Enhancements**
* Vector-similarity and full-text (inverted) index experiments (#12292)
* Merge expired parts before no-merge TTL moves (#12269)
* Hold fresh lone parts before no-merge TTL moves — `ttl_move_grace_seconds` (#12360)
* Bound lazy-loaded primary key index memory — `primary_key_cache_max_bytes` (#12284)
* Support historical table query on a specified node via `SETTINGS target_nodes` (#12344)
* Restrict trivial `count()` to the shards requested by the query (#12357)
* Make `SYSTEM STOP MERGES`/`MOVES` cover every shard of a multi-shard stream (#12304)
* Apply merge selector limits to `OPTIMIZE STREAM PARTITION` without `FINAL` (#12367)
* Reject read-only and write-once disks in `CREATE STORAGE POLICY` (#12377)
* Stream tool: partition-scoped backup and additive fill restore (#12331)
* Harden `timeplusd meta` CLI and add offline database drop (#12300)
* Add consume schema strategy (single/all/raw) to decode Confluent messages with schema (#12294)
* Upgrade `pulsar-client-cpp` to v4.2.0 (#12281)
* Upgrade `contrib/avro` to decode negative array block counts (#12364)
* Support historical table query on a specified node via `target_nodes` for log external streams and `system.timeplusd_log` (carried from 3.3)
* Allow large operator-new allocations to throw `MEMORY_LIMIT_EXCEEDED` (ported from upstream) (#12355)
* Use Iceberg database `storage_endpoint` for S3 URL (#12356)
* Port New Analyzer/Planner from ClickHouse, part 1 (#12358)
* Port proton OSS Iceberg S3 table support, part 1 (#12383)

**timeplusd — Bug Fixes**
* Reject pausing a materialized view before its first pipeline build (#12328)
* Fix streaming `arg_min`/`arg_max` compile error for bfloat16 (#12334)
* Fix file writer finalize (Kafka PEM file write) (#12335)
* Fix checkpoint barrier loss in `RemoteSource` async-read path (#12326)
* Fix container-overflow in `MergeTreeDataPartWriterOnDisk::cancel()` after skip indices are finalized (#12369)
* Reset `exec_mode` for parallel-replica remote legs so materialized views over log external streams can start (#12373)
* Rebuild secondary index for primary-key-subset index key columns (#12348, #12351)
* Make NativeLog fetch honor the caller's byte budget (#12350)
* Recover trimmed Raft hard state from the durable checkpoint record (#12382)
* Fix Raft scheduler self-deadlock on outbound send backpressure (#12417)
* Add negate method to `AggregateFunctionIf` for streaming retract semantics (#12243)
* Keep storage policy tracked as in-use until deferred stream drop completes (#12390)
* Fill absent `_tp_sn` so coalesced mutable inserts commit `_tp_time` correctly (#12391)
* Treat `remote()` hosts that resolve to this server as local again (#12395)
* Rewind idempotent keys when an inline historical commit fails (#12392)
* Fix `CREATE STREAM ... AS SELECT` with an explicit column list, including a mutable-stream segfault (#12394)
* Retry a failed historical commit instead of wedging the committed sequence number (#12404)
* Refresh node memory total per heartbeat so runtime cgroup limit changes propagate (#12410)
* Fix null idempotent keys after a schema switch inside a historical commit batch (#12406)
* Fix NULL handling in nullable `arg_min`/`arg_max`: checkpoint recovery `CORRUPTED_DATA` and NULL values in the state (#12407)
* Release historical parts once a streaming query has read them (#12375)
* Parse creation query AST every time on provisioner retry (#12325)
* Decode pip output as UTF-8 instead of the locale encoding (#12321)
* Hide stray Parquet symbol (#12421)

#### Upgrade notes {#upgrade_notes_3_4_1}

See the full [Upgrade Notes table](/enterprise-v3.4-whats-new#upgrade-notes) in What's New for details. In short:
* Tabby is enabled by default but inert until an admin configures an LLM endpoint; set `enable-agent: false` to hide it entirely.
* If you configured Tabby before 3.4.11, check the "Max tokens" setting — it may still be at the old default of 1024.
* Set `NEUTRON_ENCRYPTION_KEY` before saving Tabby's LLM credentials in production; re-enter the key once if you set this variable after already saving it.
* Changelog materialized views using a nullable argument with `sum_if`/`count_if`/other `_if` aggregates need to be recreated after upgrading (checkpoint layout changed, #12243).
* If you ever ran `MATERIALIZE INDEX ... WITH CLEAR` on a mutable stream whose secondary index key is a subset of the primary key, re-run it once after upgrading to purge bad entries written by the old bug (#12351).
* Pulsar external streams must use a `pulsar+ssl://` URL to request TLS; a plain `pulsar://` URL with TLS settings no longer silently enables TLS.
