# Timeplus Enterprise 3.3

## Key Highlights

Key highlights of the Timeplus 3.3 release include:

1. Major performance improvement in the data replication **network layer** — up to 30x faster in some scenarios — powered by request pooling, recyclable network buffers, sharded request/response channels, scatter/gather writes, and IPv6 support.
2. Major performance improvement (up to 40x) for Kafka consume / **parsing for Protobuf, CSV, and similar formats** via smart batching and a new parallel parsing strategy for Kafka source.
3. Major enhancements to **Python UDFs** and **external Python table functions** now enable secure, direct communication with the local timeplusd instance via automatically provisioned an ephemeral user and token. 
4. **NATS JetStream** source / sink support.
5. Broad stability and quality hardening across **mutable streams, checkpoints, materialized views, streaming joins, memory accounting, and replicated log recovery**.
6. Improved **Okta SSO** integration with a smoother login flow and support for mapping Okta users to read-only or admin roles.

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
* Enhancement & Performance Improvements
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
* Reliable workload rebalancer for Raft MVs + manual trigger (#12204/#12205) 
* Support Python UDF init hooks via SETTINGS (#12198) 
* SYSTEM TRANSFER SCHED MATERIALIZED VIEW (#12189/#12201) 
* SYSTEM REBALANCE SCHED MATERIALIZED VIEWS - manual rebalance trigger (#12200) 
* Schedule policy (#12196) 
* Reconcile Python UDF packages from S3-hosted requirements.txt (#12186/#12187) 
* Throttle repeated kafka broker outage warnings (#12191/#12194) 
* Support flush hook in python external stream sink (#12183/#12184) 
* Refine merge settings (#12178) 
* Prefer not to merge settings (#12161) 
* Add offsets-only checkpoint mode (#11753) 
* Enhance stall detection (#12074) 
* Enable shard pruning for IN-subquery and literal tuple-IN (#1175/#12139) 
* Support nats nkey authentication (#12120) 
* Support streaming LEFT ANTI JOIN (#12119) 
* Support set jwt and seed content in settings (#12116) 
* Block mutable stream secondary index when secondary index key is... (#12113) 
* Refresh QueryScope per build to clear phantom memory_tracker amount (#12096) 
* Unblock metric tick from S3 LIST + TTL cache historical-store size (#12052) 
* Enable vertical merge for wide part (#12057)

**Bug Fixes**
* Decode Pip Output As UTF-8 Instead of the Locale Encoding (#12293)
* Keep -1/+1 Consecutive Pair Contiguous Through the Shard Merge (#12234)
* Stage Pip into the Python Asset so Package Install Works (#12285)
* Sync Executor with Upstream and Back Off Merge Selection After Memory-Limited Failures (#12247)
* Clamp Negative Low_sn to 0 When Logging Processed_sn Fallback (#12277)
* SYSTEM STOP MERGES Segfault on Streams Without Local Historical Storage (#12268)
* Bound Hydrated Bytes Parked in Shared Storage Fetch Batches (#12262)
* Silent Data Loss When Raft Proposals Are Dropped During No-Leader Windows (#12260)
* JS UDF Dictionary getValue/batchGetValues Missing-Key Handling (#12253)
* Stream Recovery Replay with Incremental Commits (#12251)
* Stop Torn-Tail Recovery from Inverting a Loglet (#12238)
* Stop the Historical-Recovery OOM Crash-Loop at Write, Load, and Recover (#12237)
* Gate Retention on a Real Applied-SN (#12228)
* Rebind Prefix-Range Slices After Merge (#12230)
* Reduce Default TTL of High-Frequency Metric Logs (#12226)
* Override isReady() to Gate MV Builds on Schema Readiness (#12222)
* Check Attributes Existence Before JSON Extraction (#12216)
* Mitigate Protobuf Map-Entry for Confluent Registry (#12211)
* Manual Rebalance Trigger: Immediate Task Is Not a Scheduling Failure (#12208)
* Deterministic Per-Stream Tie-Break to Remove Low-Node-ID Placement Bias (#12207)
* De-Flake 01606_merge_from_wide_to_compact Part-Level Race (#12197)
* Use the Shard's Storage When Listing Active Parts in system.parts (#12192, #12193)
* Roll Back Torn WAL Tail on Partial Write Under ENOSPC (#12185)
* Throw bad_alloc on Failed ByteVector Allocation Instead of NULL Dereference (#12181)
* Suppress Phantom Changelog Rows in Multishard Memory Aggregation (#12162)
* Restore data_version on StoragePolicyDescriptor Deserialize (#12170)
* Drop Spurious "Profile Counters Are Not Set" Warning (#12166)
* Clone inner_query and Serialize Lazy Semantic Init (#12152)
* EMIT ON UPDATE No Longer Drops Updates When +1 Partner Is Filtered to Empty (#12126)
* Direct Join Honors Nullable Left Keys (#12143)
* Enforce NAMED_COLLECTION Access in Settings Merge (#12151)
* DROP DATABASE CASCADE Fails with Alerts (#12130, #12158)
* Self-Heal NativeLog Replica from Torn-WAL Inconsistency Instead of Crash-Looping (#12156)
* Stabilize Flaky TimeWheel Timer UT (#12026, #12154)
* Restore min_size_to_keep Floor for Metadata and Checkpoint Logs (#12137)
* Version_column + TTL Is Now Safe (#11991)
* Cap Delayed Write Streams for Parallel-Write Disks (#12123)
* Background NativeLog Commit No Longer Throws TOO_MANY_PARTS (#12112)
* Skip Filter+Expr Fusion When Child Carries Substream-Aware Stateful Functions (#12111)
* Bump V8 and Cherry-Pick ARM64 64K-Page Fixes (#12105)
* Apply Proposed librdkafka Fix (#12103)
* Pulsar Healthcheck + ddl_index/named_collection Bugs Exposed by #12086 (#12088)
* Mutable File Descriptor Leak (#12093)
* Align DNSResolver Throw Type with Upstream (#12087)
* Stop Tracking Loading-Dependency Edges (#12080)
* Resolve Python Interpreter Symlinks Recursively (#12081)
* Kafka Client Race Between Shutdown() and Read() (#12078)
* Restore -Wl,-U,_inside_main Link Flag for Darwin (#12072)
* Fix CF Corruption for Mutable Stream When Alter Stream Add Index and Reboot (#12070)
* Disable Mini Darwin x86 Build (#12050)
* Probe Builtin Views via system.stream_shards (#12047)
* Disable jemalloc for Darwin Mini (MinSizeRel) (#12046)
* Retry on Poco::Exception in ReadBufferFromS3::nextImpl (#12041)
* Fix macOS ARM64 Debug Link Error for inside_main (#12040)
* Fix Hanging Issue in Recreate Consumer (#12038)
* Fix System Streams Smoke Check for Views (#12033)
* Gate OTel External Stream on USE_GRPC (#12032)
* Fix Data Race in Getting Watermark (#12031)

