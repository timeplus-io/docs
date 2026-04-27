# Timeplus Enterprise 3.2

## Key Highlights

Key highlights of the Timeplus 3.2 release include:

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

### 3.2.7 {#3_2_7}
Released on 04-26-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_2_7)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.2.7`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 11.0.13`

Component versions:
* timeplusd 3.2.7
* timeplus_appserver 3.2.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.0

#### Changelog {#changelog_3_2_6}

**Bug Fixes**
* Fix intermittent crashes under parallel workloads(#12019)
* Fix data race in getting watermark (#12022)

### 3.2.6 {#3_2_6}
Released on 04-23-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_2_6)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.2.6`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 11.0.12`

Component versions:
* timeplusd 3.2.6
* timeplus_appserver 3.2.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.0

#### Changelog {#changelog_3_2_6}

**Features and Enhancements**
* NATS JetStream external stream support (#11900)
* Enhance NATS I/O (#11957)
* Enhance performance and error handling related to NATS(#11996).
* Refine NATS settings (#11976)
* Close all idle TCP connections in one pass (#11930)

**Performance**
* Cache `StorageView::isStreamingQuery` per query (#11902)

**Bug Fixes**
* Fix replication factor for internal system streams in cluster setup (#12009)
* Fix NATS JetStream source (#11968)
* Reset `ReadBuffer` canceled flag on rewind (#11953)
* Fix CH_CASE issues: WITH-alias missing column, throttle overflow, `nth_value` (#11920)
* Rewind `idempotent_keys` on commit retry and recovery (#11922)
* Keep NULL-valued granules in skip index for `IS NULL` / `OR` predicates (#11937)
* Fix `_tp_sn` / `_tp_time` event predicate seeks (#11840)
* Honor stop signal inside mutable-stream commit (#11918)
* Strip `_tp_delta` from virtuals of bounded table (mutable_stream) reads (#11905)
* Reset fetch session when block reader `read()` fails (#11891)
* Preserve backfill from historical store filter pruning (seek_to) (#11859)

### 3.2.3 {#3_2_3}
Released on 04-12-2026. Installation options:
* For Linux or Mac users: [Downloads](/release-downloads#3_2_3)
* For Docker users (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:3.2.3`
* For Kubernetes users: `helm install timeplus/timeplus-enterprise --version 11.0.7`

Component versions:
* timeplusd 3.2.3
* timeplus_appserver 3.2.1
* timeplus_connector 3.1.0
* timeplus cli 3.0.0
* timeplus byoc 1.0.0

#### Changelog {#changelog_3_2_3}

This release consolidates all timeplusd changes from 3.1.2 through 3.2.3.

**Features and Enhancements**
* Add global tiered storage policy (#11811)
* Add feature flag to disable the workload rebalancer (#11815)
* Enhance parallel Kafka source (#11742)
* Add Python external stream init and deinit hooks (#11756)
* Add server config gates for JavaScript and Python UDFs (#11752)
* Propagate local API user to Python UDF (#11806) and introduce local API user support (#11804)
* Support non-const arguments for `rand` distribution functions (#11715)
* Add time-weighted aggregate combinator support and coverage (#11583)
* Support map type generation in random stream (#11586)
* Add `keep_range_join_max_buckets` setting to cap range join bucket count (#11775)
* Improve discard log messages to include `range_time_column` name (#11854)
* Add IPv6 support (#11653) and IPv6 enforce setting with misc fixes (#11670)
* Enable client batch send by default (#11658)
* Upgrade curl to 8.18 and enable Pulsar on macOS (#11693)
* Upgrade Pulsar client to v4.0.1 (#11611)
* Backfill right-side hash table in streaming enrichment joins (#11702)
* Tolerate `UNKNOWN_STREAM` in `DROP CASCADE / IF EXISTS` (#11820)
* Derive subject name according to schema subject strategy (#11705)
* Better error handling in stream metadata updates (#11542)
* Move external stream validation from constructors to dedicated methods (#11636)
* Validate task creation (#11664)

**Performance**
* Batch process Protobuf messages for Kafka (#11572)
* Avoid `Field` temporaries in C++ to Python column conversion (#11836)
* Set `fill_cache=false` on KV full-scan read paths (#11831)
* Add Python GIL wait instrumentation (#11808)
* Improve Python UDF data conversion and Python consume sink performance (#11788)
* Commit historical data inline in the poll thread (#11749)
* Merge small JSON blocks before commit (#11765)
* Add request pooling (#11643)
* Introduce recyclable network buffers (#11626)
* Scatter/gather writes for client (#11629)
* Sharding inflight requests map (#11628) and sharding response channel (#11655)
* Switch blocking queue to dequeue with queue reuse (#11622)
* Optimize eloop wakeup (#11617) and net perf baseline (#11616)
* Fine tune network buffer size (#11641)
* Refactor string-concatenation INSERTs to block-based inserts (#11573)
* Lock guard in consumer (#11800)

**Bug Fixes**
* Disable checkpoints at runtime for random-source materialized views (#11827)
* Fix join changelog mode for nested aggregation (#11833)
* Fix cgroup memory accounting (#11817)
* Prevent early meta-log compaction (#11826)
* Fix zero replication client (#11813)
* Fix async commit batch and client lifecycle (#11810)
* Fix memory tracker regression causing spurious `MEMORY_LIMIT_EXCEEDED` (#11783)
* Fix TimeWheel races and shutdown ordering (#11718)
* Fix heap-use-after-free in `RocksDBColumnFamilyHandler::destroy()` (#11758)
* Clear spilled hybrid update state after emit batches (#11741)
* Fix replicated log startup epoch recovery (#11728)
* Handle Python source cancel during MV failover (#11727)
* Fix context expired MV table subquery (#11738)
* Fix streaming CTE/subquery with aggregation returning empty results (#11695)
* Update MV schema after `ALTER STREAM MODIFY QUERY` (#11681)
* Keep session watermark monotonic (#11649)
* Support more streaming resize combinations (#11671)
* Fix `synthesizeQuorumReplicationStatus` (#11668)
* SQL analyzer now returns 400 for invalid SQL (#11708)
* Fix watchdog restart semantics (#11706)
* Preserve OR semantics with empty `IN` on mutable stream (#11596)
* Handle malformed Confluent Protobuf messages gracefully (#11587)
* Fix avg time-weighted overflow (#11591)
* Fix fatal crash from stale async checkpoint epoch mismatch (#11601)
* Fix secondary index cleanup on delete for mutable stream (#11593)
* Fix server wakeup during shutdown (#11633)
* Fix meta log lagging (#11682)
* Improve `FetchHint` unset `file_position` logging (#11772)
* Backport replxx updates (#11818)
* Port Proton OSS #1124: merge small JSON block before commit (#11765)
* Add self-join regression coverage fix (#11678)
