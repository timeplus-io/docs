# Timeplus Enterprise 3.3 — What's New

Timeplus Enterprise 3.3 focuses on **operational resilience and cluster-scale operations**: a new backup & recovery toolkit for streams, smarter workload placement and rebalancing across cluster nodes, tiered-storage and merge tuning controls, a much more robust startup and recovery path, a generational upgrade of the Python UDF runtime, and new streaming SQL capabilities.

## Highlights at a Glance

- **New `timeplusd stream` tool** — offline backup, restore, and repair of a stream's historical data, with sequence-number-aware recovery.  
- **Cluster workload rebalancing** — class-aware placement of scheduled materialized views, plus new `SYSTEM REBALANCE` and `SYSTEM TRANSFER` commands for operator control.  
- **Faster, safer restarts** — lazy index loading, memory-pressure-aware materialized view recovery, and one broken table no longer blocks server startup.  
- **Python UDFs on CPython 3.14 free-threaded** — Python UDFs now run truly in parallel across query threads, with init hooks, declarative package management, and sink flush hooks.  
- **Streaming SQL** — `LEFT ANTI JOIN`, smarter shard pruning, and `SHUFFLE BY`/`PARTITION BY` optimizations across CTEs and views.

## Upgrade Notes (read before upgrading)

| Change | Impact |
| :---- | :---- |
| Rebalancer config moved from `scheduler.rebalancer.*` to a top-level `rebalancer:` section | Update `config.yaml` when upgrading |
| Python runtime upgraded to CPython 3.14 (free-threaded on Linux x86\_64) | Reinstall UDF packages (`SYSTEM INSTALL PYTHON PACKAGE`); verify your packages have Python 3.14 wheels; review UDF thread safety |
| Mutable streams now reject secondary indexes that duplicate a prefix of the primary key | `CREATE MUTABLE STREAM` scripts containing such indexes will fail — remove the redundant index |
| NATS setting `nats_nkey_seed` now strictly means the seed content; NKey auth requires the new `nats_nkey` setting | Update NATS external stream DDL if you used NKey auth before |
| "Too many parts" defaults raised (delay at 1000 parts, reject at 3000\) | Existing streams adopt the new defaults on upgrade unless their `CREATE` named these settings explicitly. These settings are not alterable after creation — to keep the old behavior, set `settings.stream.parts_to_delay_insert` / `parts_to_throw_insert` in `config.yaml` (restart required) before upgrading |
| Primary key indexes are now loaded lazily (default on) | Lower startup memory; first query on a cold part pays a small one-time index read |
| Checkpoint lease expiration default raised 15s → 30s | Failover detection for scheduled materialized views is up to 15s slower unless tuned explicitly |

---

## 1\. Backup, Recovery & Checkpointing

### 1.1 New `timeplusd stream` tool: backup, restore, and repair stream data (\#12267, \#12274)

3.3 introduces a dedicated offline CLI for managing a stream's historical data directly on a node — no running server required. It understands your stream's storage layout automatically, including tiered (hot/cold, S3-backed) and multi-shard streams.

```
timeplusd stream [common-options] <command> [command-options]
```

| Command | What it does |
| :---- | :---- |
| `examine` | Read-only health & sequence report: per-shard committed sequence number, part sequence ranges, and the earliest sequence still available in the write-ahead log |
| `backup` | Archive a stream's historical data (all shards or one shard) into ZIP archives |
| `restore` | Restore from archives — the current data is safely stashed first, so you can always roll back |
| `revert` | Undo a restore by putting the stashed data back |
| `clean` | Delete a stream's historical data (asks for confirmation) |
| `set-committed-sn` | Repair a shard's committed sequence marker (last-resort recovery, asks for confirmation) |

**Typical workflows:**

```shell
# Inspect a stream's on-disk state
timeplusd stream --base-dir /var/lib/timeplusd --stream my_stream examine

# Full backup of a tiered stream (all disks, all shards)
timeplusd stream --base-dir /var/lib/timeplusd --stream my_stream backup --archive-dir /mnt/backup

# Restore with a rollback stash
timeplusd stream --base-dir /var/lib/timeplusd --stream my_stream restore \
    --archive-dir /mnt/backup --save-old-dir /mnt/oldbak

# Changed your mind? Roll it back.
timeplusd stream --base-dir /var/lib/timeplusd --stream my_stream revert --save-old-dir /mnt/oldbak
```

**Sequence-aware recovery.** Backups can be cut at an exact per-shard sequence number, so a restored node replays the remaining write-ahead log without losing or skipping data:

```shell
# Back up a 4-shard stream, capping each shard at a known-good sequence number
timeplusd stream --stream my_stream backup \
    --archive-dir /mnt/backup --max-sn-per-shard 100,200,300,400

# Back up only the object-storage metadata, skipping local part payloads
timeplusd stream --stream my_stream backup \
    --archive-dir /mnt/backup --skip-local-parts
```

**Built-in safety:**

- Data-modifying commands take an exclusive lock on the metastore, so they refuse to run while `timeplusd` is still up — no risk of corrupting a live server.  
- Destructive commands (`clean`, `set-committed-sn`) require interactive confirmation.  
- Restore validates archive identity (stream, shard) and integrity before touching any live data, and always stashes the current data first.  
- Archives store parts uncompressed (they're already compressed on disk), so backup and restore run at raw I/O speed.

>   
> **Note:** for S3-tiered streams, archives capture metadata pointers to S3 objects — the S3 objects themselves are not copied, so keep the bucket contents intact for as long as you keep the backup.

### 1.2 Checkpoint lease resilience (\#12266)

The checkpoint lease that coordinates materialized view failover across nodes is now resilient to file corruption (for example after a power loss mid-write). Instead of getting stuck retrying forever:

- The rightful owner **heals** its own corrupted lease automatically.  
- Another node **takes over** a corrupted lease only after waiting out a full grace period, so a healthy owner is never preempted.  
- The lease is now also kept renewed **while a query is still recovering its state**, so a materialized view with a large state to restore can no longer lose its lease mid-recovery.

The default lease expiration period was raised from 15s to 30s for more headroom (configurable under `query_state_checkpoint.lease_expiration_period_ms`).

### 1.3 Offsets-only checkpoint mode (\#11753)

A new lightweight checkpoint mode for pipelines whose state is cheap to rebuild from the source. Instead of persisting the full operator state (aggregations, joins, dedup tables) at every checkpoint, only the **source offsets** are saved. On restart, the pipeline replays from the recorded offsets and rebuilds its state.

```sql
CREATE MATERIALIZED VIEW my_mv AS
  SELECT id, sum(val) AS total FROM my_stream GROUP BY id
  SETTINGS checkpoint_settings = 'offsets_only=true', checkpoint_interval = 1;
```

- Dramatically cheaper and faster checkpoints; less checkpoint storage.  
- Default is off (`offsets_only=false`) — existing queries are unaffected.  
- Delivery guarantees to external sinks (Kafka, Pulsar, NATS, HTTP, ClickHouse) are unchanged — sinks still flush and acknowledge on every checkpoint.  
- Use it when the source retains enough history to replay from the last checkpoint. Window aggregations (tumble, hop, session) are a natural fit: closed windows have already been emitted and their state no longer matters, so only the current windows need rebuilding on restart.

---

## 2\. Cluster Scheduling & Workload Rebalancing

3.3 delivers a major upgrade to how work is placed and balanced across cluster nodes — both for **scheduled materialized views** (placed by the scheduler on one node) and for **replicated materialized views and stream shards** (where Raft leadership determines which node does the work).

### 2.1 Smarter placement for scheduled materialized views (\#12196)

The scheduler now understands *what* each materialized view is, not just how many views a node already runs. Every view is classified — by an explicit tag, by declared resource weights, or automatically as aggregation / join / plain — and each class is spread evenly across eligible nodes. Heavy aggregation views no longer pile onto the same node while trivial pass-through views spread out.

You can influence placement declaratively:

```sql
-- Group related views with a tag: views sharing a tag are spread apart
CREATE SCHEDULED MATERIALIZED VIEW mv1 INTO target AS
  SELECT device, value FROM src WHERE value > 0
COMMENT 'tag=fraud_pipeline';

-- Declare resource weights: the scheduler balances by declared cost
CREATE SCHEDULED MATERIALIZED VIEW mv2 INTO target2 AS
  SELECT device, count() FROM src GROUP BY device
SETTINGS cpu_weight = 2, memory_weight = 1073741824;

-- Pin a view to a specific node
SETTINGS preferred_exec_node = 101;
```

A periodic background pass (default every 30s) gently corrects residual imbalance — it only ever makes strictly improving moves, so it cannot thrash a balanced cluster. Configuration:

```
scheduler:
    execute_stream_policy: class_aware      # or round_robin (legacy behavior)
    periodic_rebalance_interval_ms: 30000   # 0 disables the periodic pass
```

Placement is now fully observable — `system.execute_stream_assignments` gained `class`, `tag`, `cpu_weight`, `memory_weight`, and `preferred_exec_node` columns:

```sql
SELECT node_id, class, tag, count()
FROM system.execute_stream_assignments
GROUP BY node_id, class, tag ORDER BY node_id;
```

### 2.2 Manual rebalance and transfer commands (\#12200, \#12201, \#12205)

Three new operator commands give you direct control over workload placement (all require the `SYSTEM SHUTDOWN` privilege and a multi-node cluster):

```sql
-- Run one rebalance pass for scheduled materialized views, on demand
SYSTEM REBALANCE SCHED MATERIALIZED VIEWS;

-- Move a specific scheduled materialized view to a chosen node
SYSTEM TRANSFER SCHED MATERIALIZED VIEW default.my_mv TO 101;

-- Run one rebalance pass for replicated (Raft-based) materialized views
SYSTEM REBALANCE MATERIALIZED VIEWS;
```

These make it practical to run with automatic rebalancing disabled and trigger it deliberately — e.g. after dropping a batch of views, before a maintenance window, or to drain a node. The transfer command validates the target node (exists, online, allowed by the view's node affinity) and rejects replicated views with a pointer to `SYSTEM TRANSFER LEADER` instead.

> The rebalance commands return as soon as the request is accepted; verify results via `system.execute_stream_assignments` or `system.mv_rebalance_history`. Each pass makes a small number of conservative moves — repeat if the cluster is badly skewed.

### 2.3 Reliable workload rebalancer for replicated materialized views (\#12204, \#12205)

The `reliable` rebalancer type — which balances Raft leadership of replicated materialized views — was substantially improved:

- **Separate memory and CPU overload thresholds.** Memory pressure is dangerous earlier than CPU pressure; the two now have independent thresholds, and a move is never allowed to push the *receiving* node into overload.  
- **Class-aware balancing.** Among equally good moves, the rebalancer prefers the one that best spreads heavy (aggregation/join) leaders across nodes.  
- **Optional leader-count balancing.** By default the rebalancer acts only when a node is overloaded. Opt in to also spread leadership on pure count skew — useful after failovers, which naturally concentrate leadership on surviving nodes.

```
rebalancer:
    enabled: true
    type: reliable                              # greedy | memory | reliable
    interval: 30
    rebalance_only_nodes_are_overloaded: true   # false: also fix leader-count skew
    node_overloaded_mem_util_threshold: 0.5
    node_overloaded_cpu_util_threshold: 0.7
```

The rebalancer deliberately makes **one move per cycle** and re-measures before the next — this absorbs the new leader's warm-up and prevents oscillation. Moves are recorded in `system.mv_rebalance_history`.

### 2.4 Stream-shard leader rebalancing (\#12204, \#12215)

The rebalancer can now also balance the Raft leadership of **stream data shards** — conceptually like Kafka partition-leader rebalancing. Only a shard's leader does the write-path work, so after a node restart or failover, leadership concentrates on the surviving nodes and previously never moved back. With this feature enabled, leadership is spread across nodes weighted by each stream's recent throughput.

```
rebalancer:
    rebalance_stream_shards: true    # default: false (opt-in)
```

Materialized-view rebalancing keeps priority; shard-leader moves happen in quiet cycles, at most one transfer per cycle, and never target an already-overloaded node. Inspect leadership distribution with:

```sql
SELECT leader_node, count() FROM system.quorum_status
WHERE database = 'default' AND shard < 1000 GROUP BY leader_node;
```

---

## 3\. Storage Engine: Merges, Moves & Tiered Storage

### 3.1 Pause and resume background data movement (\#12270)

For tiered-storage deployments, you can now pause background part movement (TTL-driven and policy-driven moves to other disks/volumes) — server-wide or per stream — and resume it later. Useful during an object-store incident, a bandwidth-constrained window, or maintenance where you want I/O reserved for ingestion and merges.

```sql
SYSTEM STOP MOVES;                       -- pause all background moves
SYSTEM STOP MOVES default.iot_events;    -- pause moves for one stream
SYSTEM START MOVES;                      -- resume
```

Requires the `SYSTEM MOVES` privilege. The pause is in-memory and per node: a restart re-enables moves, and in a cluster the command should be issued on each node. Note that while moves are paused, data keeps accumulating on its current volume — watch disk headroom during a long pause.

### 3.2 Merge concurrency is now configurable at the server level (\#12224)

`background_pool_size` and `background_merges_mutations_concurrency_ratio` are now genuine server settings in `config.yaml`. Previously, setting them there looked correct but was silently ignored — the merge pool always used the built-in default. Now you can actually size merge concurrency for your hardware:

```
# Total concurrent merge/mutation tasks = pool size × ratio
background_pool_size: 16                           # default 16
background_merges_mutations_concurrency_ratio: 2   # default 2; fractional values allowed
```

Additional guardrails were added: misconfigurations that would make mutations unrunnable are now rejected at startup with a clear error, and a merge memory limit configured above the server memory limit is automatically clamped (with a warning in the log). Changes take effect at server restart.

### 3.3 Ingestion back-pressure retuned for streaming workloads (\#12178)

The "too many parts" thresholds were retuned for continuous streaming ingestion. Streams ingest small blocks continuously, so part counts legitimately run much higher than in batch-loading systems — and the old defaults caused artificial insert delays and `Too many parts` errors in perfectly healthy pipelines during bursts and catch-up.

| Setting | Old default | New default |
| :---- | :---- | :---- |
| `parts_to_delay_insert` (start slowing inserts) | 150 | **1000** |
| `parts_to_throw_insert` (reject inserts) | 300 | **3000** |
| `max_avg_part_size_for_too_many_parts` (disable the check once parts are large) | 10 GiB | **1 GiB** |

The new defaults also apply to existing streams on upgrade, unless a stream's `CREATE` statement named these settings explicitly. `ALTER STREAM … MODIFY SETTING` does not support these settings. For streams that did not specify them at creation, the effective values can be changed server-wide via `config.yaml` (restart required) — for example, to keep the old thresholds:

```yaml
settings:
    stream:
        parts_to_delay_insert: 150
        parts_to_throw_insert: 300
```

If you alert on `Too many parts` as a merge-health signal, switch to monitoring active part counts directly, since the error now fires much later.

### 3.4 Tiered storage policies: `prefer_not_to_merge`, volume priorities, and fresher disk balancing (\#12161)

Storage policies created with `CREATE STORAGE POLICY` gain three per-volume properties:

```sql
CREATE STORAGE POLICY hot_cold AS $$
volumes:
    hot:
        disk: default
        volume_priority: 1
        load_balancing: least_used
        least_used_ttl_ms: 10000
    cold:
        disk: cold_s3
        volume_priority: 2
        prefer_not_to_merge: true
        perform_ttl_move_on_insert: false
move_factor: 0.1
$$;
```

- **`prefer_not_to_merge`** (default `false`) — excludes a volume's parts from background merges. Ideal for a cold S3 tier: merging object-storage parts re-downloads and re-uploads data for little benefit. You can still override at runtime with `SYSTEM STOP/START MERGES ON VOLUME <policy>.<volume>`.  
- **`volume_priority`** — explicit volume ordering within a policy (lower \= higher priority). Values must be unique and contiguous from 1; violations are rejected at creation with a clear error.  
- **`least_used_ttl_ms`** (default `60000`) — how often the `least_used` disk-balancing mode refreshes its view of disk free space, fixing a staleness issue where the ranking never updated.

Also fixed: `max_data_part_size_bytes` and `max_data_part_size_ratio` are now read under their correct names, and `perform_ttl_move_on_insert` is honored in policies. Policies written by 3.3 use an updated internal format; during a rolling upgrade, avoid creating or modifying storage policies until all nodes are on 3.3.

### 3.5 Vertical merge restored for wide tables (\#12057)

The vertical (column-by-column) merge algorithm had been unintentionally disabled by an earlier refactor, forcing all merges through the horizontal algorithm — which holds every column in memory at once. 3.3 restores vertical merge for wide parts, substantially reducing peak merge memory on wide-schema streams (the default activation threshold is 11+ non-primary-key columns). No action needed; the existing `enable_vertical_merge_algorithm` settings simply work again. You can confirm via the `Selected MergeAlgorithm: Vertical` log line or `system.merges`.

---

## 4\. Startup Resilience & Memory Management

3.3 hardens the path that matters most in an incident: **restarting a node under pressure**.

### 4.1 One broken table no longer blocks server startup (\#12264)

Previously, a single table that failed to start (for example due to corruption after an unclean shutdown) aborted the entire server startup. Now the failure is contained: the affected table is logged (`Failed to start up <db>.<table>`) and left attached-but-not-ready, while every other table and the server itself come up normally.

Two supporting improvements:

- The default threshold for automatically handling broken parts after an unclean shutdown (`max_suspicious_broken_parts_bytes`) was raised from 1 GiB to 150 GiB, matching the largest part a merge can legally produce — so a single legitimately-large broken part no longer refuses startup.  
- MergeTree log lines now include the **shard number**, so on multi-shard streams you can tell exactly which shard is loading slowly or stuck, and part-load completion (count \+ duration) is logged at INFO level.

>   
> Operators should now watch logs for `Failed to start up …` — a degraded table no longer announces itself by failing the whole boot.

### 4.2 Lazy-loaded primary key indexes bound startup memory (\#12250)

Primary key indexes are no longer loaded into memory for every part at startup. They are loaded on first use instead — which caps startup memory on deployments with many parts, especially S3-tiered clusters where cold parts previously paid resident-memory rent without ever being queried. This fixes reboot failures with `MEMORY_LIMIT_EXCEEDED` during data-part loading.

- Enabled by default via the new stream setting `primary_key_lazy_load` (set to `0` to restore eager loading).  
- The first primary-key-filtered query against a cold part pays a small one-time index read.  
- `system.parts.primary_key_bytes_in_memory` now reports true residency — 0 for parts whose index hasn't been needed yet.

### 4.3 Materialized view recovery no longer storms a memory-pressured server (\#12219)

After a cluster reboot, every materialized view rebuilds its pipeline at once. On a memory-pressured node this used to trigger a storm of `MEMORY_LIMIT_EXCEEDED` failures and retries that kept the server pinned at its limit. Now, a view checks available memory headroom **before** building: if resident memory is already above a configurable fraction of the server memory limit (default 90%), the build is deferred and retried later with exponential backoff — views wait for headroom instead of fighting for it.

```
# Fraction of the server memory limit below which MV pipelines may build (default 0.9)
mv_execution_memory_usage_to_server_limit_ratio: 0.9

# Emergency ops switch: bring the cluster up with ALL materialized views paused,
# then resume them selectively (default false)
_tp_pause_all_materialized_views: false
```

A deferred view shows a clear status message (`Deferred building MV pipeline: RSS … reached …% of the memory hard limit`) so you can distinguish "waiting for memory" from a real failure.

### 4.4 Accurate materialized view memory accounting across recoveries (\#12096)

Fixed a subtle accounting bug where failed allocations left "phantom" bytes charged to a materialized view's memory tracker. Across repeated recovery cycles — exactly the situation after an out-of-memory event — the phantom amount grew until the view could no longer run at all, even though no memory was actually held. Memory accounting now starts clean on every recovery, breaking the self-reinforcing failure loop. Fully automatic; no configuration.

### 4.5 Metrics collection no longer blocks on storage size queries (\#12052)

Storage-size metrics (checkpoint storage, historical store) used to be computed synchronously during metric collection — for S3-backed storage that meant object-store LIST calls inline in the metrics tick, which could stall or drop *all* metrics exactly when the system was busiest. These sizes are now served from a background-refreshed cache: metrics always return immediately, and sizes for remote storage refresh asynchronously.

```
# TTL for metrics-only size caches (seconds, default 1800; read at startup)
metrics_cache_ttl_seconds: 1800
```

Sizes for remote-backed storage are now eventually consistent (up to the TTL); local storage remains exact. Metric names and dimensions are unchanged.

---

## 5\. Python UDFs & Python External Streams

### 5.1 Python 3.14 with free-threaded execution — parallel Python UDFs (\#11852)

The embedded Python runtime is upgraded from CPython 3.10 to **CPython 3.14**, and Linux x86\_64 builds ship the **free-threaded** (no-GIL) runtime. Python UDFs now execute truly in parallel across query threads — previously, every Python UDF call in the entire server serialized on one global lock, capping Python-heavy pipelines at roughly one core.

Verify it live:

```sql
CREATE OR REPLACE FUNCTION is_free_threaded(value int32) RETURNS bool LANGUAGE PYTHON AS $$
import sys
def is_free_threaded(value):
    return [not sys._is_gil_enabled()] * len(value)
$$;
SELECT is_free_threaded(1);   -- true on free-threaded builds
```

New observability for the Python runtime:

- `system.metrics`: `PythonLivePipelines` — pipeline stages currently using the Python runtime.  
- `system.events`: `PythonPackagesInstalled` — completed package installs.  
- `system.asynchronous_metrics`: `NonJemallocMemory` and detailed process-memory breakdowns (`MemoryAnonymous`, `MemoryPss`, `MemorySwap`, …), plus `PythonMimallocCommitted` / `PythonMimallocPeakCommitted` on free-threaded builds — closing the memory-visibility gap introduced by Python's own allocator.

**Migration checklist:**

- **Reinstall UDF packages.** The site-packages directory moved with the Python version; run `SYSTEM INSTALL PYTHON PACKAGE` for your dependencies again after upgrading (or use the new requirements.txt reconciliation, below).  
- **Check wheel availability.** Packages must provide Python 3.14 free-threaded (`cp314t`) wheels; a few ecosystem packages don't yet.  
- **Review thread safety.** With free-threading, multiple query threads can enter the same Python function concurrently — module-level mutable state in your UDFs now needs to be thread-safe.  
- Container deployments need a matching system interpreter (`python3.14t`); the official images include it, and the server validates the match at startup with a clear error if it's wrong.

### 5.2 Python UDF initialization hooks (\#12198)

Python UDFs can now declare a one-time initialization function — the right place to load a model, open a client connection, or read credentials — instead of relying on import-time side effects or per-call lazy init. Parameters can be passed inline or, for secrets, pulled from a **named collection** so they never appear in the UDF definition or `SHOW CREATE FUNCTION` output.

```sql
-- Keep the secret in a named collection, out of UDF metadata
CREATE NAMED COLLECTION nc_udf_init AS init_function_parameters = '{"api_key":"…"}' NOT OVERRIDABLE;

CREATE FUNCTION enrich(x string) RETURNS string LANGUAGE PYTHON AS $$
import json
CLIENT = None
def _tp_init(params):
    global CLIENT
    CLIENT = make_client(json.loads(params)['api_key'])

def enrich(xs):
    return [CLIENT.lookup(x) for x in xs]
$$ SETTINGS init_function_name = '_tp_init', named_collection = 'nc_udf_init';
```

- Works for both scalar and aggregate Python UDFs (for aggregates, the hook runs before the class is instantiated).  
- `init_function_parameters` (inline) and `named_collection` are mutually exclusive; both require `init_function_name`. A hook with no parameter source is called with no arguments.  
- The named collection is read at UDF load time on each node, so rotating the secret takes effect on the next module load.  
- Creating a UDF that references a named collection requires the corresponding grant, and the collection contents are never displayed.  
- If the init hook fails, the module is unloaded and the next call retries cleanly.

### 5.3 Declarative package management: requirements.txt in S3 (\#12186, \#12187)

Keep every node's Python UDF environment converged from one durable source of truth: host a `requirements.txt` in S3, and every node installs missing packages at startup and re-checks periodically. This is the recommended setup for Kubernetes deployments with ephemeral compute nodes, where imperative `SYSTEM INSTALL PYTHON PACKAGE` calls were lost on every pod reschedule.

```
python_requirements:
    url: https://my-bucket.s3.us-west-2.amazonaws.com/proton/requirements.txt
    poll_interval_sec: 300        # 0 = check at startup only
    # Credentials optional — falls back to IRSA / instance profile / AWS_* env vars
    access_key_id: ACCESS_KEY_ID
    secret_access_key: SECRET_ACCESS_KEY
    region: us-west-2
    # Optional pip mirror overrides
    index_url: https://pypi.org/simple
```

- **Fail-open**: an unreachable or malformed file never blocks server startup; the node retries with backoff.  
- **Idempotent**: unchanged file content is a no-op (content digest tracking), and file updates apply within a poll interval, no restart needed.  
- **Install-only** by design: removing a line never uninstalls anything (use `SYSTEM UNINSTALL PYTHON PACKAGE` for cleanup). Pin versions (`package==x.y.z`) so all nodes converge identically.

### 5.4 Flush hook for Python sinks (\#12183, \#12184)

Python external streams used as a sink can now declare a `flush_function_name`. The function is called on **every checkpoint** of the writing pipeline and once on **graceful close**, giving Python code that batches rows internally (e.g. to amortize an API call) a reliable signal to push its buffer — buffered rows are no longer lost on shutdown.

```sql
CREATE EXTERNAL STREAM my_sink(val int32) AS $$
_buffer = []

def my_write(val):
    _buffer.extend(val)              # batch instead of writing immediately

def my_flush():                      # called on each checkpoint and before close
    push_to_api(_buffer)
    _buffer.clear()
$$ SETTINGS type='python', write_function_name='my_write', flush_function_name='my_flush';
```

With a materialized view writing into the sink, the flush cadence follows the view's `checkpoint_interval`. Flush is guaranteed to run before the module's `deinit` on close.

---

## 6\. Streaming SQL & Query Processing

### 6.1 Streaming LEFT ANTI JOIN (\#12119)

Streaming joins now support `LEFT ANTI JOIN`: emit each left-side event whose join key has **no match** in the current snapshot of the right side. This directly expresses patterns like unmatched orders, unknown device IDs, or transactions with no corresponding reference record — previously impossible without workarounds.

```sql
-- Alert on events from devices not present in the reference stream
CREATE MATERIALIZED VIEW unknown_devices AS
SELECT e.device_id, e.payload
FROM events e
LEFT ANTI JOIN table(device_registry) r ON e.device_id = r.device_id;
```

- Supported for all combinations of append streams, `versioned_kv` streams, and mutable streams on either side, in streaming and historical (`table()`) modes.  
- Semantics are one-directional enrichment: the right side is a snapshot the left stream probes. A right-side row arriving *after* a left event was emitted does not retract that output.  
- Left rows with a NULL join key are dropped (neither matched nor emitted), consistent with SQL ANTI JOIN convention. `RIGHT`/`FULL ANTI` are not supported.

### 6.2 `SHUFFLE BY` / `PARTITION BY` now work across CTEs, subqueries, and views (\#12129)

Data partitioning declared inside a CTE, subquery, or view is now visible to the outer query. When the inner partitioning keys cover the outer query's needs, the redundant re-shuffle is skipped entirely — previously the partitioning was forgotten at every query boundary and data was re-sharded again.

```sql
-- The outer aggregation now reuses the CTE's shuffle instead of re-sharding
WITH shuffled AS (
    SELECT k, v FROM table(src) SHUFFLE BY k
)
SELECT k, sum(v) FROM shuffled GROUP BY k;
```

- No new syntax or settings — existing `SHUFFLE BY` and `PARTITION BY` simply become effective across boundaries, including views over views and materialized view pipelines.  
- Reuse is strictly correctness-preserving: the optimization applies only when the inner keys are a subset of the outer keys and no intermediate operation (key-rebinding projections, ARRAY JOIN on a key, RIGHT/FULL joins) could break the partitioning. In every other case the query re-shards exactly as before.

### 6.3 Shard pruning for IN-subqueries and multi-column IN (\#12139)

Queries on multi-shard streams now prune shards for two common predicate shapes that previously always scanned every shard:

**Multi-column (tuple) IN** — works out of the box with `optimize_skip_unused_shards` (on by default):

```sql
-- With a composite sharding key on (chain_id, address): reads only the matching shards
SELECT count() FROM table(t)
WHERE (chain_id, address) IN ((1, 'addr_42'), (1, 'addr_88'));
```

**IN with a subquery** — opt-in via a new setting; the subquery is evaluated first and its result used to prune:

```sql
SET optimize_skip_unused_shards_with_subqueries = 1;
SELECT count() FROM table(s) WHERE id IN (SELECT id FROM allowlist);
```

Pruning is conservative: `NOT IN`, NULL values, result sets larger than `optimize_skip_unused_shards_limit` (default 1000), and streaming subqueries all safely fall back to scanning all shards. Streaming queries are never pruned to zero shards, so continuous queries keep waiting for future events.

### 6.4 Guardrail: redundant mutable stream indexes rejected (\#12113)

Creating a mutable stream with a secondary index whose columns duplicate a leading prefix of the primary key (e.g. `INDEX idx id` with `PRIMARY KEY id`) is now rejected at DDL time with a clear error. Such an index adds write amplification and storage cost with zero query benefit — the primary key already provides that access path. Existing DDL scripts containing such an index need the redundant index removed.

---

## 7\. Connectivity & External Streams

### 7.1 NATS JetStream: NKey authentication and inline credentials (\#12116, \#12120)

NATS JetStream external streams now support the full spectrum of NATS authentication, with secrets suppliable either as files or inline in settings — the latter ideal for containerized deployments where secrets arrive via configuration rather than mounted files.

```sql
-- Decentralized JWT auth, fully inline (no file on disk)
SETTINGS type='nats_jetstream', subject='orders.>',
         nats_jwt='eyJ0eXAiOi...', nats_nkey_seed='SUAxxxxxxxx'

-- NKey auth with an inline seed
SETTINGS type='nats_jetstream', subject='orders.>',
         nats_nkey='UAxxxxxxxx', nats_nkey_seed='SUAxxxxxxxx'

-- NKey auth with the seed on disk
SETTINGS type='nats_jetstream', subject='orders.>',
         nats_nkey='UAxxxxxxxx', nats_nkey_seed_file='/etc/nats/user.nk'

-- Credentials file (optionally with a separate seed file)
SETTINGS type='nats_jetstream', subject='orders.>',
         nats_creds_file='/etc/nats/user.creds'
```

Exactly one authentication method may be configured at a time (username/password, token, credentials file, JWT, or NKey); invalid combinations are rejected at stream creation with a clear message.

> **Migration note:** `nats_nkey_seed` now strictly means the seed content. If you previously attempted NKey auth by setting `nats_nkey_seed` alone, add the new `nats_nkey` setting (the public NKey identity). Treat inline secrets in DDL with the same care as any other credential.

### 7.2 Quieter logs during Kafka broker outages (\#12191, \#12194)

During a Kafka broker outage, the client library reports transport failures many times per second per consumer — which used to flood the server log with thousands of near-identical lines, drowning out everything else. Non-fatal Kafka errors are now throttled to at most one warning per 30 seconds per consumer and error type, and each emitted line carries a `log_recurring=<count>` field telling you how many occurrences it represents. Fatal errors are never throttled. No configuration needed; if you parse these log lines, note the new field and the reduced frequency.

### 7.3 More reliable Kafka consumer stall recovery (\#12074)

The stall detector for Kafka external streams was reworked. Previously, on multi-partition topics a single stall could trigger a cascade of redundant consumer recreations (one per partition), and a consumer that had legitimately caught up with the broker could be immediately re-flagged as stalled. Now:

- Consumer recreation has a **cooldown** equal to `consumer_stall_timeout_ms` (default 60s), so one recovery action serves all partitions instead of each partition triggering its own.  
- The detector correctly restarts its observation window after a recreation and after confirming the consumer has caught up, eliminating false stall verdicts on quiet partitions.

The existing `consumer_stall_timeout_ms` setting drives everything (0 disables stall detection, as before); the stall warning is now logged only when a recreation actually happens.  
