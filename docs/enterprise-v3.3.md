# Timeplus Enterprise 3.3

## Key Highlights

For a detailed tour of the new features in this release, see [What's New in Timeplus Enterprise 3.3](/enterprise-v3.3-whats-new).

Key highlights of the Timeplus 3.3 release include:

1. New **backup and recovery** capabilities: a stream tool for stream data recovery and backup/restore, sequence-aware backup and recovery controls, plus more resilient recovery paths with incremental commit replay and self-healing from torn WAL tails.
2. Smarter **cluster workload balancing**: stream-shard leader rebalancing and a reliable workload rebalancer for materialized views, with new `SYSTEM TRANSFER SCHED MATERIALIZED VIEW` / `SYSTEM REBALANCE SCHED MATERIALIZED VIEWS` commands and configurable scheduling policies.
3. Major **Python UDF** upgrades: embedded CPython migrated to **3.14 free-threaded** with improved observability, UDF init hooks via SETTINGS, and automatic package reconciliation from S3-hosted requirements.txt.
4. Faster and leaner **startup and recovery**: lazy-loaded primary key index to bound startup memory, memory-pressure interventions to prevent materialized-view reboot recovery storms, and containment of single-table startup failures.
5. Streaming SQL enhancements: **streaming LEFT ANTI JOIN**, `SHUFFLE BY` propagation through CTE/subquery boundaries, shard pruning for IN-subqueries, and a new offsets-only checkpoint mode.
6. Broad stability and correctness hardening across **Raft replication, checkpoints, mutable streams, Kafka sources, and memory accounting**.


## Supported OS {#os}
|Deployment Type| OS |
|--|--|
|Linux bare metal| x64 or ARM chips: Ubuntu 20.04+, RHEL 8+, Fedora 35+, Amazon Linux 2023|
|Mac bare metal| Intel or Apple chips: macOS 14, macOS 15|
|Kubernetes|Kubernetes 1.25+, with Helm 3.12+|

## Releases
We recommend using stable releases for production deployment. Engineering builds are available for testing and evaluation purposes.

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

