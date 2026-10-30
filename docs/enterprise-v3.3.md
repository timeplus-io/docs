# Timeplus Enterprise 3.3

## Key Highlights

For a detailed tour of the new features in this release, see [What's New in Timeplus Enterprise 3.3](/enterprise-v3.3-whats-new).

Key highlights of the Timeplus 3.3 release include:

1. New [**backup and recovery**](/enterprise-v3.3-whats-new#backup-recovery) capabilities: a stream tool for stream data recovery and backup/restore, sequence-aware backup and recovery controls, plus more resilient recovery paths with incremental commit replay and self-healing from torn WAL tails.
2. Smarter [**cluster workload balancing**](/enterprise-v3.3-whats-new#cluster-rebalancing): stream-shard leader rebalancing and a reliable workload rebalancer for materialized views, with new `SYSTEM TRANSFER SCHED MATERIALIZED VIEW` / `SYSTEM REBALANCE SCHED MATERIALIZED VIEWS` commands and configurable scheduling policies.
3. Major [**Python UDF**](/enterprise-v3.3-whats-new#python-udfs) upgrades: embedded CPython migrated to **3.14 free-threaded** with improved observability, UDF init hooks via SETTINGS, and automatic package reconciliation from S3-hosted requirements.txt.
4. Faster and leaner [**startup and recovery**](/enterprise-v3.3-whats-new#startup-resilience): lazy-loaded primary key index to bound startup memory, memory-pressure interventions to prevent materialized-view reboot recovery storms, and containment of single-table startup failures.
5. [**Streaming SQL enhancements**](/enterprise-v3.3-whats-new#streaming-sql): **streaming LEFT ANTI JOIN**, `SHUFFLE BY` propagation through CTE/subquery boundaries, shard pruning for IN-subqueries, and a new offsets-only checkpoint mode.
6. Broad stability and correctness hardening across **Raft replication, checkpoints, mutable streams, Kafka sources, and memory accounting**.


## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Known issues {#known_issues}

The issues below affect Timeplus Enterprise 3.3.x, including 3.3.4, and are not fixed in any 3.3 release yet. Each entry describes what you may see and, where one exists, a workaround. When a fix ships, the entry is removed and the fix is listed in the changelog of that release. If you run into one of these issues and need help, contact Timeplus support.

### Query results and streaming SQL

#### Materialized view writes NULL when the last row of a group no longer matches {#ki_mv_null_upsert}
* **Symptom:** A materialized view with `GROUP BY` reads from a mutable stream and has a `WHERE` filter. An update to the source makes the last row of a group stop matching the filter. If the view writes to a mutable stream, the previous aggregate value of that group is overwritten with `NULL`. This happens for aggregates that can return `NULL`, such as `sum`, `avg`, `min` and `max` on nullable columns. `count()` is not affected, and neither are append-only sources. (#12132)
* **Workaround:** Remove the `WHERE` filter and move the condition into the aggregate, for example `sum(if(st = 1, v, 0))` instead of `sum(v) ... WHERE st = 1`. The group then shows `0` instead of disappearing, so check that this suits your logic.

#### Streaming JOIN against a changelog can lose left rows {#ki_join_drops_rows}
* **Symptom:** An append-only stream joined (`INNER` or `LEFT`) with a right side that keeps changing (a `versioned_kv` or `changelog_kv` stream, or a subquery with `EMIT CHANGELOG`) can lose left rows while the matching right key is being updated. No error is returned in most cases. An `INNER JOIN` produces no row, and a `LEFT JOIN` produces default values for the right columns. The cases known today are:
  * `join_algorithm='parallel_hash'`. (#12444, #12445)
  * A `changelog_kv` right stream that is written by a materialized view with `EMIT CHANGELOG`. (#12443)
  * An `EMIT CHANGELOG` aggregation as the right side that runs on a multi-shard source, especially when the source is not sharded by the group key. The server log can contain `Existing value is not found in joined hash table`. (#12447, #12450)
* **Workaround:** Use `SETTINGS join_algorithm='hash'` instead of `parallel_hash`. For the other cases there is no workaround yet. If you need exact results, compare the join output with the left input.

#### Intermediate results over changelog input {#ki_changelog_intermediate}
* **Symptom:** With `EMIT ON UPDATE`, periodic emit or `EMIT CHANGELOG`, a query over a changelog input can emit rows computed between the retraction (`-1`) and the new value (`+1`) of an update. For example, `PARTITION BY ... EMIT ON UPDATE` can emit an extra row such as `count() = 0` when an update touches several partitions. A global aggregation over a multi-shard changelog input, and a JavaScript UDA with `has_customized_emit: true`, can also emit wrong intermediate values. Final values are correct. (#12446, #12448, #12449)
* **Workaround:** Treat these rows as intermediate. Ignore them downstream or read only the final value.

#### Changelog `LEFT JOIN` fails with `join_use_nulls = 1` {#ki_join_use_nulls}
* **Symptom:** A streaming query or materialized view that does a `LEFT JOIN` where both sides track changes (for example a mutable stream joined with a mutable stream) fails with `Method getInt is not supported for nullable(int8)` if `join_use_nulls = 1` and the first left row arrives before any right row. The materialized view keeps failing and restarting. (#12506)
* **Workaround:** Do not set `join_use_nulls = 1` for these joins. The default (`0`) works.

#### Coalesced mutable streams {#ki_coalesced}
* **Symptom:** For mutable streams created with `coalesced = true`:
  * A point lookup (`WHERE <primary key> = ...`) that selects only columns of column families that have never been written for that key returns no row, while `SELECT *` and `count()` return it. (#12475)
  * With `ttl_seconds`, a partial update refreshes the TTL only of the column families it fully covers. The other columns, and lookups through secondary indexes, can expire earlier than the rest of the row. (#12475)
  * Inserting only some columns of a column family is skipped. An insert must contain all columns of each column family it writes. (#10514)
* **Workaround:** Always write all columns of a column family together. Do not combine `coalesced = true` with `ttl_seconds`.

### Stability and cluster operation

#### Server crash when creating a Kafka external stream from a recursive Protobuf schema {#ki_protobuf_recursion}
* **Symptom:** `CREATE EXTERNAL STREAM` without a column list crashes the `timeplusd` process (segmentation fault) when the column types are inferred from a Protobuf schema that contains a message type referring to itself, directly or through other messages. All queries on that node stop until it restarts. The schema can come from a schema registry or from `CREATE FORMAT SCHEMA`. Schemas that import `google/protobuf/struct.proto` (`Struct`, `Value`, `ListValue`) are affected too. (#12501)
* **Workaround:** Declare the columns explicitly in `CREATE EXTERNAL STREAM` instead of inferring them, and do not point column inference at schemas with recursive message types.

#### A replica can stay in the `Snapshot` state {#ki_replica_snapshot}
* **Symptom:** After a node restart or a failed Raft snapshot transfer, a follower replica of a stream can stay in the `Snapshot` replication state (see `system.v_under_replication_replicas`). Its data stops advancing, and the server log repeats `SEQUENCE_COMPACTED_AWAY` about every 2 seconds. (#12504, #12163, #12164)
* **Workaround:** A restart of the affected node or a leader change can clear the state in some cases. If the replica stays in `Snapshot`, contact Timeplus support.

#### A scheduled materialized view can run on two nodes after a failover {#ki_scheduled_mv_twice}
* **Symptom:** For a materialized view with `high_availability_model='scheduled'`, if a worker node goes offline while the scheduler is busy, the view can be assigned to two nodes at once. The target stream then receives duplicated output. (#12458)
* **Workaround:** None. If you see duplicated output after a node failure, contact Timeplus support.

#### Memory use of merges and mutations on S3 storage {#ki_s3_merge_memory}
* **Symptom:** With S3 disks and very wide streams (hundreds of columns), a background merge keeps the whole output part in memory until it is uploaded. Under memory pressure, merges fail with `MEMORY_LIMIT_EXCEEDED`, and in the worst case the node is killed for running out of memory and keeps restarting. Mutations (`ALTER ... UPDATE` and `DELETE`) retry immediately after such a failure instead of backing off. A `TTL ... TO VOLUME` expression with a timestamp that is already in the past (for example `to_start_of_hour(_tp_time) + INTERVAL 1 MINUTE TO VOLUME 'cold'`) makes every small part eligible for the cold tier at once and creates many small S3 objects. (#12246, #12401, #12044)
* **Workaround:** Move data to the cold tier hours or days after ingestion, not minutes. Avoid extremely wide streams on S3 disks. Leave headroom in `max_server_memory_usage` and `merges_mutations_memory_usage_soft_limit`.

#### JavaScript and Python UDFs {#ki_udf}
* **Symptom:**
  * `CREATE AGGREGATE FUNCTION` with JavaScript source that has an object property getter that throws an error (or a `Proxy` with a throwing trap) stops the `timeplusd` process. (#12329)
  * Each `CREATE [OR REPLACE] FUNCTION ... LANGUAGE PYTHON`, including failed ones, leaves the validated module loaded until the process restarts, so memory grows slowly with the number of statements. (#12330)
* **Workaround:** Do not run these statements with untrusted source code. Avoid creating Python UDFs repeatedly (for example in CI loops) on a production node, and restart the node after heavy UDF changes.

### Performance and memory

#### Direct join against a mutable stream uses a lot of memory {#ki_direct_join_memory}
* **Symptom:**
  * The right side of a `direct` join is loaded into memory. With tens of millions of keys it can reach tens of GB, and `max_bytes_in_direct_join` does not bound every case. (#11113)
  * The `memory_usage` shown in `system.processes` and in the cluster monitoring page for a materialized view with a direct join against a heavily written mutable stream can keep growing and exceed the real memory. This is an accounting error. Use the RSS of the process or host as the source of truth. (#12408)
* **Workaround:** None for the first item. Size nodes for the right-side table.

#### Slow queries on mutable streams {#ki_mutable_stream_perf}
* **Symptom:** Some query shapes on large mutable streams are slow: `ORDER BY` on indexed columns does not use the index order, large `IN` lists on indexed columns, `count()` and paged queries on tables with tens of thousands of rows, and secondary-index lookups where the predicate does not cover the leading index columns. (#11724, #10059, #11845, #11846, #11934, #11825)
* **Workaround:** Keep `IN` lists short, make predicates cover the leading columns of the index, avoid `ORDER BY` on index columns for very large results, and use TTL to limit the number of rows.

### Connectors

#### Apache Iceberg: writing to Amazon S3 Tables, and feature coverage {#ki_iceberg}
* **Symptom:**
  * Writing to Amazon S3 Tables with the Iceberg sink fails in 3.3.x. (#12379)
  * Iceberg support is partial. Time travel, partition specs and transforms, row-level deletes, ORC and Avro data files, partitioned writes, and `UPDATE`, `DELETE` and `MERGE` are not available yet. (#12362)
* **Workaround:** None.

#### Kafka external stream: `count()` on a compacted topic {#ki_kafka_count}
* **Symptom:** `SELECT count() FROM table(<kafka stream>)` computes the result from offsets. On a compacted topic, where compaction removed offsets, the result is higher than the number of messages. (#4939)
* **Workaround:** Do not rely on `count()` over a compacted topic. Read the messages and count them instead.

### SQL and DDL

#### DDL in a cluster takes effect asynchronously {#ki_async_ddl}
* **Symptom:** After `CREATE STREAM` or `CREATE VIEW` returns on one node, an immediate query or insert through another node, especially a data-only node, can fail for a short time with a "does not exist" error. `SYSTEM PAUSE MATERIALIZED VIEW` right after `CREATE MATERIALIZED VIEW` fails with `RESOURCE_NOT_INITED` because the pipeline is not built on every replica yet, and the view can end up paused on some replicas only. (#8147, #9712, #12424)
* **Workaround:** Retry after a short delay, and check the state with `SHOW` or system tables before running the next statement.

#### `DROP STREAM` is not blocked when a task reads the stream {#ki_drop_stream_task}
* **Symptom:** `DROP STREAM` succeeds even if a `TASK` selects from the stream, also when `enable_dependency_check = 1`. The task is left broken. Views, materialized views and alerts are protected. (#11015)
* **Workaround:** Drop or change the dependent tasks before dropping the stream.

#### `SHOW CREATE users` shows the user, not a stream named `users` {#ki_show_create_users}
* **Symptom:** If a stream is named `users`, `SHOW CREATE users` returns the DDL of the users, not of the stream. (#10194)
* **Workaround:** Use `SHOW CREATE STREAM users`.

#### SQL limitations {#ki_sql_limitations}
* Correlated subqueries are not supported and fail with `Missing columns`. Rewrite them as a `JOIN`. (#205)
* `changelog(tumble(...))` is not supported. Use the order `changelog` → `tumble`/`hop`/`session` → dedup → `table`. (#3062)
* Row policies apply to historical queries only, not to streaming queries.
* A function in a view or subquery can be executed more than once per row, for example `substring`, `json_extract_*` and UDFs. Compute the value once in the inner query and refer to the column. (#1083)

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

### 3.3.4 {#3_3_4}
Released on 10-28-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_3_4)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.3.4`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 13.0.8`

Component versions:
* timeplusd 3.3.4
* timeplus_appserver 3.3.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.1-rc.2

#### Changelog {#changelog_3_3_4}

This release consolidates timeplusd changes introduced since 3.3.3. For changes already published in 3.3.3, see the [3.3.3 changelog](#changelog_3_3_3) below.

The 3.4.1 release predates several of the changes listed below, for example the Raft snapshot epoch fix (#12432) and Protobuf schema references with `schema_message_name` (#12479), so moving from 3.3.4 to 3.4.1 loses those changes. Before moving from 3.3.4 to a 3.4.x release, check that the changelog of that release lists the entries you rely on.

**Features and Enhancements**
* Kafka external streams with schema registry: support Protobuf schemas that import other schemas (references), and add two new settings — `schema_message_name` to pick which top-level message the stream's columns are inferred from, and `consume_schema_strategy` (`single` / `all` / `raw`) to control how messages with different schema IDs are handled (#12479).
* `consume_schema_strategy='single'` now accepts every registered version of the stream's subject, so frames written before a compatible schema evolution stay readable (#12497).
* With `consume_schema_strategy='single'`, a Protobuf message of a different top-level message type that shares the stream's schema ID is skipped instead of failing the read with `NO_COLUMNS_SERIALIZED_TO_PROTOBUF_FIELDS`; the stream's message is chosen by `schema_message_name` and defaults to the first message of the schema (#12487, #12489, ported in #12491). `SELECT count()` on a schema-registry Kafka stream that resolves to `single` also applies this filter instead of returning the raw number of Kafka messages (#12488, #12490, ported in #12491).
* When `consume_schema_strategy` is not set, its default now follows `subject_name_strategy`: `'all'` for `TopicNameStrategy` (or when `subject_name_strategy` is not set), and `'single'` for `RecordNameStrategy`, `TopicRecordNameStrategy` and custom strategies (#12502, #12500). An explicit value always wins, and the resolved default is not stored in the stream DDL. Upgrade notes from 3.3.3:
  * Avro streams: no change. Streams using `RecordNameStrategy` / `TopicRecordNameStrategy` still consume only the record type of `schema_subject_name`, and streams using `TopicNameStrategy` still consume every message.
  * Protobuf streams using `RecordNameStrategy` / `TopicRecordNameStrategy`: 3.3.3 consumed every message of the topic regardless of its schema; 3.3.4 consumes only the messages of the selected subject (and of the message chosen by `schema_message_name`) and silently skips the rest. To keep the 3.3.3 behavior, set `consume_schema_strategy = 'all'`.
  * A changed `consume_schema_strategy` (including after `ALTER STREAM ... MODIFY SETTING`) is applied when the stream reloads, e.g. after a server restart.
  * Downgrade: streams that set `consume_schema_strategy` explicitly cannot be loaded by 3.3.3 (unknown setting). Streams that rely on the default can.
* Merge TTL-expired parts before moving them to a no-merge volume (e.g. S3 cold tier), so they land as fewer, larger parts (#12269). A new stream setting `ttl_move_grace_seconds` additionally holds freshly written lone parts on the local volume so late batches can still merge before the move (#12360); its default is 1 hour (#12493).
* Apply merge selector limits (`max_bytes_to_merge_at_max_space_in_pool`, `max_parts_to_merge_at_once`) to `OPTIMIZE STREAM ... PARTITION p` without `FINAL`; it now triggers one bounded merge per call instead of merging the whole partition, and compacts `prefer_not_to_merge` volumes (#12367).
* Reduce default system log retention and disable `log_query_threads` by default (#12441). The new retention is 3 days for `trace_log`, 7 days for `query_thread_log`, 14 days for `part_log` and 7 days for `stream_metric_log`, and `log_query_threads` now defaults to `false`. On the first start after the upgrade, the existing `trace_log`, `query_thread_log` and `part_log` tables (whose definition changed) are renamed to `<name>_N` and kept rather than dropped, so their disk space is not reclaimed until you drop the renamed tables; `stream_metric_log` is dropped and re-created with the new TTL. Impact: with the old defaults, system log tables could consume most of a node's local disk. The same change shipped in 2.8.49 as #12440, see the [2.8.21 release notes](/enterprise-v2.8#2_8_21) (timeplusd 2.8.49).

**Bug Fixes**
* Stamp Raft snapshots with the committed entry's epoch instead of the election epoch (#12432). Impact: a replica that installed a snapshot right after a leader election could get permanently stuck, with the leader resending the same batches to it forever (up to hundreds of MB/s of node-to-node traffic); restarting did not help.
* Wait for the shard leader before proposing a write instead of letting Raft drop it (#12431). Impact: `CREATE STREAM ... AS SELECT` on a multi-node cluster could lose its fill with `INGEST_TIMEOUT` and leave the new stream empty; any write landing during a Raft election blocked for the full `insert_timeout_ms` and then failed.
* Rewind the snapshot to sn 0 when the recipient's historical store is empty (#12456). Impact: a replica that lost both its NativeLog and historical store (e.g. a fresh disk or wiped PVC) rejected the catch-up snapshot and stayed at 0 rows forever.
* Fix `Unstable::trim` erasing a single Raft log entry instead of the tail (#12429). Impact: `SYSTEM RECOVER STREAM` could leave a hole in the unstable Raft log.
* Fix append stream JOIN `versioned_kv` dropping left rows while the joined right key is being updated (#12439). Impact: `INNER JOIN` silently lost whole left chunks; `LEFT JOIN` emitted them with default right values.
* Keep a re-created stream's execution assignment when the old stream of the same name is removed (#12465). Impact: after dropping and re-creating a scheduled materialized view under the same name, a node could silently reject later assignments, leaving the MV running nowhere (status `Unknown`) or running twice.
* Hide TTL-expired mutable stream entries on read and keep internal metadata out of TTL (#12473). Impact: on mutable streams with `ttl_seconds`, half-expired rows could fail scans with `LOGICAL_ERROR` or return contradictory point-lookup results; TTL compaction could also drop internal metadata, so columns added by `ALTER` read back empty after a restart, and re-added indexes returned nothing. Expired rows now disappear from reads as soon as they expire instead of at the next compaction.
* Fill `CREATE STREAM AS SELECT` with an explicit column list (#12481). Impact: the fill insert could fail because the auto-added `_tp_time`/`_tp_sn` columns made the target wider than the SELECT header; also fixed a crash path when `CREATE MUTABLE STREAM AS SELECT` reads from `table(x)`.

### 3.3.3 {#3_3_3}
Released on 09-29-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_3_3)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.3.3`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 13.0.7`

Component versions:
* timeplusd 3.3.3
* timeplus_appserver 3.3.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.1-rc.2

#### Changelog {#changelog_3_3_3}

This release consolidates timeplusd changes introduced since 3.3.1. For changes already published in 3.3.1, see the [3.3.1 changelog](#changelog_3_3_1) below.

**Features and Enhancements**
* Harden timeplusd meta CLI and add offline database drop for outage remediation (#12300)
* Add partition-scoped backup and additive fill restore to the stream tool (#12331)

**Bug Fixes**
* Fix a Raft scheduler deadlock that occurred when an outbound send queue was full (#12418). Impact: could halt replication and leader election cluster-wide until restarted.
* Reject pausing a materialized view before its first pipeline build (#12328). Impact: a `SYSTEM PAUSE MATERIALIZED VIEW` issued right after `CREATE MATERIALIZED VIEW` could block DDL processing on a node until it was restarted. Such a pause now fails with `RESOURCE_NOT_INITED` and can be retried.
* Recover trimmed Raft hard state from the durable checkpoint record (#12400). Impact: a replica could fatal-abort on every startup after a hard reset.
* Release historical parts once a streaming query has read them (#12375). Impact: outdated parts could not be deleted while the streaming query or materialized view that read them was running, growing disk usage.
* Retry a failed historical commit instead of wedging the committed sn (#12404). Impact: one failed commit could freeze a shard and grow disk usage indefinitely.
* Reset exec_mode for parallel-replica remote legs so materialized views over log external streams can start (#12373). Impact: such MVs could never start on a multi-node cluster.
* Fix checkpoint barrier loss in RemoteSource async-read path (#12326). Impact: an MV could silently get stuck at its first checkpoint epoch forever.
* Make NativeLog fetch honor the caller's byte budget (#12350). Impact: background polling could fetch up to 8192x more data than intended, risking OOM.
* Fix secondary index rebuild on mutable streams when the index key columns are a subset of the primary key (#12351). Impact: `ALTER STREAM ... ADD INDEX` backfilled existing rows under empty index keys, so index queries missed old rows and empty-string lookups returned bogus matches.
* Make SYSTEM STOP MERGES/MOVES cover every shard of a multi-shard stream (#12304). Impact: the command silently affected only the first shard.
* `CREATE STORAGE POLICY` now rejects read-only and write-once (e.g. `s3_plain`) disks (#12377). Impact: TTL moves to such disks retried forever, causing massive redundant S3 writes. Existing storage policies are not re-validated on upgrade; if one uses a write-once disk, move it to a disk type that supports renames, such as `s3`.
* Rewind idempotent keys when an inline historical commit fails (#12392). Impact: could cause permanent, silent data loss on commit failure.
* Fix null idempotent keys after a schema switch inside a historical commit batch (#12406). Impact: could crash the whole server (no data loss).
* Fix NULL handling in `arg_min`/`arg_max` over nullable columns (#12407). Impact: a NULL value could overwrite the aggregate result, and affected materialized views could fail checkpoint recovery with `CORRUPTED_DATA`.
* Parse creation query AST every time on provisioner retry, so a retried CREATE no longer carries a stale UUID (#12325). Impact: a stale orphan directory could block cluster-wide schema creation.
* Fix PEM files not being flushed to disk for Kafka, HTTP and Splunk HEC external streams (#12335). Impact: the CA or private key file could be written empty, breaking TLS connections.

### 3.3.1 {#3_3_1}
Released on 08-01-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_3_1)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.3.1`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 13.0.6`

Component versions:
* timeplusd 3.3.1
* timeplus_appserver 3.3.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.1-rc.2

#### Changelog {#changelog_3_3_1}

This release consolidates all timeplusd changes from 3.2.11 through 3.3.1.

**Features and Enhancements**
* Add sequence-aware backup and recovery controls (#12274)
* Enable SYSTEM STOP and START MOVES (#12270)
* Add stream tool for stream data recovery and backup/restore (#12267)
* Tolerate corrupted checkpoint lease and keep it renewed during recovery (#12266)
* Contain single-table startup failure, raise broken-parts bytes threshold, shard-attributed load logs (#12264)
* Lazy-load primary key index to bound startup memory (#12250)
* Migrate embedded CPython to 3.14 free-threaded + FT observability (#11852)
* Memory-pressure interventions for materialized-view reboot recovery storm (#12219)
* MergeTree global merge settings (#12224)
* Propagate SHUFFLE BY through CTE/subquery boundaries (#12129)
* Stream-shard leader rebalancing — config + balancing core (#12204/#12215)
* Reliable workload rebalancer for Raft materialized views + manual trigger (#12204/#12205)
* Support Python UDF init hooks via SETTINGS (#12198)
* SYSTEM TRANSFER SCHED MATERIALIZED VIEW (#12189/#12201)
* SYSTEM REBALANCE SCHED MATERIALIZED VIEWS - manual rebalance trigger (#12200)
* Schedule policy (#12196)
* Reconcile Python UDF packages from S3-hosted requirements.txt (#12186/#12187)
* Throttle repeated Kafka broker outage warnings (#12191/#12194)
* Support flush hook in Python external stream sink (#12183/#12184)
* Refine merge settings (#12178)
* Prefer not to merge settings (#12161)
* Add offsets-only checkpoint mode (#11753)
* Enhance stall detection (#12074)
* Enable shard pruning for IN-subquery and literal tuple-IN (#12139)
* Support NATS NKey authentication (#12120)
* Support streaming LEFT ANTI JOIN (#12119)
* Support setting JWT and seed content in settings (#12116)
* Block mutable stream secondary index creation for unsupported key expressions (#12113)
* Refresh QueryScope per build to clear phantom memory_tracker amount (#12096)
* Unblock metric tick from S3 LIST + TTL cache historical-store size (#12052)
* Enable vertical merge for wide part (#12057)

**Bug Fixes**
* Decode pip output as UTF-8 instead of the locale encoding (#12293)
* Keep -1/+1 consecutive pair contiguous through the shard merge (#12234)
* Stage pip into the Python asset so package install works (#12285)
* Sync executor with upstream and back off merge selection after memory-limited failures (#12247)
* Clamp negative low_sn to 0 when logging processed_sn fallback (#12277)
* Fix SYSTEM STOP MERGES segfault on streams without local historical storage (#12268)
* Bound hydrated bytes parked in shared storage fetch batches (#12262)
* Fix silent data loss when Raft proposals are dropped during no-leader windows (#12260)
* Fix JS UDF dictionary getValue/batchGetValues missing-key handling (#12253)
* Fix stream recovery replay with incremental commits (#12251)
* Stop torn-tail recovery from inverting a loglet (#12238)
* Stop the historical-recovery OOM crash-loop at write, load, and recover (#12237)
* Gate retention on a real applied-SN (#12228)
* Rebind prefix-range slices after merge (#12230)
* Reduce default TTL of high-frequency metric logs (#12226)
* Override isReady() to gate materialized view builds on schema readiness (#12222)
* Check attributes existence before JSON extraction (#12216)
* Mitigate Protobuf map-entry issue for Confluent schema registry (#12211)
* Manual rebalance trigger: immediate task is not a scheduling failure (#12208)
* Deterministic per-stream tie-break to remove low-node-ID placement bias (#12207)
* Use the shard's storage when listing active parts in system.parts (#12192, #12193)
* Roll back torn WAL tail on partial write under ENOSPC (#12185)
* Throw bad_alloc on failed ByteVector allocation instead of NULL dereference (#12181)
* Suppress phantom changelog rows in multishard memory aggregation (#12162)
* Restore data_version on StoragePolicyDescriptor deserialize (#12170)
* Drop spurious "Profile counters are not set" warning (#12166)
* Clone inner_query and serialize lazy semantic init (#12152)
* EMIT ON UPDATE no longer drops updates when +1 partner is filtered to empty (#12126)
* Direct join honors nullable left keys (#12143)
* Enforce NAMED_COLLECTION access in settings merge (#12151)
* Fix DROP DATABASE CASCADE failure when alerts exist (#12130, #12158)
* Self-heal NativeLog replica from torn-WAL inconsistency instead of crash-looping (#12156)
* Restore min_size_to_keep floor for metadata and checkpoint logs (#12137)
* Make version_column + TTL safe (#11991)
* Cap delayed write streams for parallel-write disks (#12123)
* Background NativeLog commit no longer throws TOO_MANY_PARTS (#12112)
* Skip filter and expression fusion when child carries substream-aware stateful functions (#12111)
* Bump V8 and cherry-pick ARM64 64K-page fixes (#12105)
* Apply proposed librdkafka fix for improved Kafka stability (#12103)
* Fix Pulsar health check and ddl_index/named_collection issues (#12088)
* Fix mutable stream file descriptor leak (#12093)
* Align DNSResolver throw type with upstream (#12087)
* Fix incorrect alert dependency tracking behavior (#12080)
* Resolve Python interpreter symlinks recursively (#12081)
* Fix Kafka client race between shutdown() and read() (#12078)
* Fix mutable stream corruption after adding an index and rebooting (#12070)
* Probe builtin views via system.stream_shards (#12047)
* Retry on Poco::Exception in ReadBufferFromS3::nextImpl (#12041)
* Fix hanging issue when recreating Kafka consumer (#12038)
* Gate OTel external stream on USE_GRPC (#12032)
* Fix data race in getting watermark (#12031)

