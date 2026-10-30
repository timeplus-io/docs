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

#### Known issues {#known_issue_3_3_4}
The following issues are not fixed in 3.3.4, listed from the highest to the lowest severity. Workarounds are given where they exist.

1. `CREATE EXTERNAL STREAM` without a column list crashes `timeplusd` when the Protobuf schema has a recursive message type, including `google/protobuf/struct.proto`, so declare the columns explicitly (#12501).
2. A materialized view that groups a mutable stream and filters it with `WHERE` overwrites a group's aggregate (`sum`, `avg`, `min`, `max`) with `NULL` when an update makes the last row of the group stop matching, so move the condition into the aggregate, for example `sum(if(st = 1, v, 0))` (#12132).
3. A streaming join of an append-only stream with a changing right side (`versioned_kv`, `changelog_kv` or an `EMIT CHANGELOG` subquery) can silently lose left rows while a right key is updated, so use `join_algorithm='hash'` instead of `parallel_hash` (the other cases have no workaround yet) (#12443, #12444, #12445, #12447, #12450).
4. A follower replica can stay in the `Snapshot` state after a node restart or a failed Raft snapshot transfer, and restarting the node or changing the leader may clear it, otherwise contact Timeplus support (#12504, #12163, #12164).
5. A JavaScript aggregate function with a throwing property getter stops `timeplusd` on `CREATE`, and every Python UDF `CREATE` keeps a module in memory until restart, so avoid untrusted source and repeated Python UDF creation on a production node (#12329, #12330).
6. The Iceberg sink cannot write to Amazon S3 Tables, and time travel, partition transforms, row-level deletes, ORC or Avro data files, and `UPDATE`, `DELETE` and `MERGE` are not supported (#12379, #12362).
7. Merges and mutations on very wide streams on S3 disks can run out of memory, so set tier-move TTLs to hours or days instead of minutes and leave memory headroom in `max_server_memory_usage` (#12246, #12401, #12044).
8. A materialized view with `high_availability_model='scheduled'` can run on two nodes after a failover and write duplicated output, and there is no workaround yet (#12458).
9. On mutable streams with `coalesced = true`, a point lookup of only never-written column families returns no row, a partial update does not refresh the `ttl_seconds` of the other column families, and a partial column-family insert is skipped, so write all columns of a column family together and do not combine `coalesced = true` with `ttl_seconds` (#12475, #10514).
10. A query over changelog input with `EMIT ON UPDATE`, periodic emit or `EMIT CHANGELOG` can emit extra intermediate rows, such as `count() = 0`, between the `-1` and `+1` of an update, so ignore them and use the final values (#12446, #12448, #12449).
11. A changelog `LEFT JOIN` where both sides track changes fails with `Method getInt is not supported for nullable(int8)` when `join_use_nulls = 1`, so keep the default `join_use_nulls = 0` (#12506).
12. A `direct` join loads the right side into memory and can use tens of GB, and the `memory_usage` of such a materialized view can be over-reported, so size nodes for the right side and use process memory (RSS) as the source of truth (#11113, #12408).
13. Some queries on large mutable streams are slow, such as `ORDER BY` on indexed columns, large `IN` lists, and secondary-index predicates that skip the leading index columns, so keep `IN` lists short and filter on the leading index columns (#11724, #10059, #11845, #11846, #11934, #11825).
14. DDL in a cluster takes effect asynchronously, so a statement right after `CREATE` can fail with a "does not exist" or `RESOURCE_NOT_INITED` error, and retrying after a short delay works (#8147, #9712, #12424).
15. `SELECT count()` on a Kafka external stream returns too many rows for a compacted topic, so read the messages and count them instead (#4939).
16. `DROP STREAM` is not blocked when a `TASK` reads the stream and leaves the task broken, so drop or change the task first (#11015).
17. `SHOW CREATE users` returns the DDL of the users instead of a stream named `users`, so use `SHOW CREATE STREAM users` (#10194).
18. Correlated subqueries are not supported and fail with `Missing columns`, so rewrite them as a `JOIN` (#205).
19. `changelog(tumble(...))` is not supported, so apply `changelog`, then the window function, then dedup, then `table` (#3062).
20. Row policies apply to historical queries only, not to streaming queries.
21. A function in a view or subquery, such as `substring`, `json_extract_*` or a UDF, can run more than once per row, so compute it once in the inner query and refer to the column (#1083).

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

