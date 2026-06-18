# Scheduling & Rebalancing

In a cluster, [Scheduled Materialized Views](/materialized-view-high-availability#scheduler-based-ha) (and scheduled Alerts) are placed on worker nodes by a **centralized scheduler**. The scheduler runs on the leader of its own Raft quorum and decides *which node runs each view*, keeping the cluster balanced as views are created, nodes come and go, and load drifts over time.

This page explains how that placement decision is made and how the cluster rebalances. For the high-availability and failover model that the scheduler powers, see [High Availability](/materialized-view-high-availability). For how to declare a view as scheduled, see [`CREATE MATERIALIZED VIEW`](/sql-create-materialized-view).

:::warning Scheduler ≠ Workload Rebalancer
This page is about the **scheduler** for **Scheduled (shared-checkpoint) Materialized Views** — it decides *which single node runs each view*. The "rebalancing" here means moving those scheduled views between worker nodes.

It is a **different subsystem** from the **workload rebalancer**, which balances **Raft leadership of replicated (default) Materialized Views** — see [Workload Rebalancing](/materialized-view-rebalancing). The two never act on the same view: scheduled MVs are *scheduled*, replicated MVs are *rebalanced*.
:::

:::info
A Materialized View is **automatically** treated as a **Scheduled Materialized View** as soon as it uses shared-storage checkpointing — no special keyword is needed:

```sql
CREATE MATERIALIZED VIEW mv INTO target AS SELECT ...
SETTINGS checkpoint_settings='replication_type=shared;shared_disk=s3_disk';
```

You may also state it explicitly with the `SCHEDULED` keyword, which requires an explicit `INTO <target>`:

```sql
CREATE SCHEDULED MATERIALIZED VIEW mv INTO target AS SELECT ...
SETTINGS checkpoint_settings='replication_type=shared;shared_disk=s3_disk';
```

Both statements produce the same Scheduled Materialized View. When the checkpoint is already shared, the `SCHEDULED` keyword is **redundant** — it only makes the intent explicit.

Raft-based (replicated) Materialized Views are placed differently and are not governed by this scheduler.
:::

## Goal

The scheduler places views as **evenly as possible** across nodes, taking into account *what each view is* — its tag, its declared resource weights, and the shape of its query — rather than only *how many* views each node already runs. Two heavy aggregating views should not pile onto one node just because that node happens to have the lowest view count.

## Scheduling classes

Every scheduled view (or alert) is assigned exactly one **scheduling class** at the moment it is scheduled. The first rule that matches decides the class:

```
class(view) = Tagged{name}   if its comment contains a `tag=<name>` token
            = Weighted       else if cpu_weight > 0 or memory_weight > 0
            = Agg            else if the query has aggregates
            = Join           else if the query has joins
            = Plain          otherwise
```

Each class is spread across the cluster independently and as evenly as possible. The classes, in priority order:

| Class | What it groups | How it is balanced |
|-------|----------------|--------------------|
| **Tagged** | Views sharing a `tag=<name>` token in their `COMMENT` | By count, per tag |
| **Weighted** | Views declaring `cpu_weight` and/or `memory_weight` | By accumulated weight (see [Resource weights](#resource-weights)) |
| **Agg** | Untagged, unweighted views whose query aggregates | By count |
| **Join** | Untagged, unweighted views whose query joins (no aggregates) | By count |
| **Plain** | Everything else — filters, projections, routing | By count |

Above all of these sits one hard override:

- **Preferred node (a hard pin).** If a view declares `preferred_exec_node`, it is always placed on that node — unless the node is offline, decommissioning, or failing its liveness check, in which case it falls back to its class. The pin is re-applied every time the view is scheduled; a view that failed over does not automatically move back the instant its preferred node recovers (though ordinary rebalancing tends to pull it back over time).

### Tags

Tag a view through its comment so that related views are spread apart instead of piling onto one node — for example all views of one pipeline, or one tenant:

```sql
CREATE MATERIALIZED VIEW mv_orders
INTO target AS SELECT ...
COMMENT 'tag=orders'
SETTINGS checkpoint_settings='replication_type=shared;shared_disk=...';
```

The tag is a `tag=<word>` token extracted from the comment with the pattern `tag=([a-zA-Z0-9]+)`:

- `<word>` may contain only ASCII letters and digits.
- The `tag` keyword must start the comment or follow a non-alphanumeric character — so `mytag=x` does **not** match.
- The first match wins; a view carries at most one tag.

Alerts have no comment field, so tags are Materialized-View only; alerts (which forbid joins and aggregates) classify as `Plain`.

### Resource weights

Views that declare resource weights are balanced by *accumulated weight* rather than by count:

```sql
SETTINGS memory_weight = 10        -- bytes-scale weight of this view's state
SETTINGS cpu_weight = 2            -- CPU-scale weight (number of CPUs)
```

The scheduler does two things at once for the Weighted class:

- **Spread** — keep every node's total `cpu_weight` and total `memory_weight` as even as possible.
- **Mix** — co-locate complementary views, so a CPU-heavy view tends to land on a node that is already carrying memory-heavy ones, and vice versa.

This is achieved by scoring a candidate node using **only the dimensions the incoming view declares**, normalized by the cluster-wide totals so the two dimensions are comparable:

```
weighted_load(node) = (view.cpu_weight    > 0 ? Σ node.cpu_weight    / Σ cluster.cpu_weight    : 0)
                    + (view.memory_weight > 0 ? Σ node.memory_weight / Σ cluster.memory_weight : 0)
```

A CPU-heavy view therefore "sees" only each node's CPU load and gravitates toward CPU-idle nodes (mixing), while a view declaring both dimensions keeps both cluster totals even (spreading).

## Node selection

When a view needs a home, the scheduler:

1. **Filters** candidates to nodes that are online and allowed by the view's [node affinity](/cluster) (role: data vs. compute).
2. **Short-circuits on the pin** — if `preferred_exec_node` is set and that node is a valid candidate, it wins immediately.
3. Otherwise **sorts** the candidates and picks the minimum, comparing this tuple lexicographically:

   ```
   (class_load_on_node, total_streams, memory_utilization, cpu_utilization, node_id)
   ```

   | Key | Why |
   |-----|-----|
   | `class_load_on_node` | balance *this view's class* first (its tag count, its class count, or its weighted load) |
   | `total_streams` | overall even spread — guarantees per-class balancing never worsens the total |
   | `memory_utilization` | tie-break toward the node with more free memory — **memory before CPU because OOM is fatal while CPU saturation is only slowness** |
   | `cpu_utilization` | next tie-break (a 0–1 fraction, normalized across cores) |
   | `node_id` | final, deterministic tie-break so equal nodes resolve reproducibly |

Because `total_streams` is the second key, per-class balancing can never degrade overall balance: every class stays even to within ±1 view per node, and so does the total.

## Examples

All examples below are **Scheduled** Materialized Views — each carries `checkpoint_settings='replication_type=shared;...'`, which is what puts them under the scheduler. The placement traits (`tag` via `COMMENT`, `cpu_weight`, `memory_weight`, `preferred_exec_node`) go in the `SETTINGS` clause; `COMMENT` comes before `SETTINGS`.

### Tag: keep a pipeline's views spread apart

Give related views the same `tag=<word>` token in their comment. The scheduler treats them as one group and places them on different nodes instead of piling them up. Here three views of one ingestion pipeline share `tag=orders`:

```sql
CREATE MATERIALIZED VIEW orders_by_region
INTO orders_region_target
AS SELECT region, count() AS n FROM orders GROUP BY region
COMMENT 'tag=orders'
SETTINGS checkpoint_settings='replication_type=shared;shared_disk=s3_disk';

CREATE MATERIALIZED VIEW orders_by_status
INTO orders_status_target
AS SELECT status, count() AS n FROM orders GROUP BY status
COMMENT 'orders pipeline, tag=orders, owner=payments'
SETTINGS checkpoint_settings='replication_type=shared;shared_disk=s3_disk';

CREATE MATERIALIZED VIEW orders_revenue
INTO orders_revenue_target
AS SELECT tumble_start AS w, sum(amount) AS revenue
FROM tumble(orders, 1m) GROUP BY w
COMMENT 'tag=orders'
SETTINGS checkpoint_settings='replication_type=shared;shared_disk=s3_disk';
```

Notes:
- In a 3-node cluster, the three `orders` views land one per node.
- The tag is extracted with `tag=([a-zA-Z0-9]+)`, so it can sit anywhere in a longer comment (as in `orders_by_status` above). It must start the comment or follow a non-alphanumeric character — `myorders=tag=orders` would not match on `myorders`.

### Resource weights: mix and spread

Declare `cpu_weight` (number of CPUs) and/or `memory_weight` (bytes) for resource-hungry views. The scheduler balances them by accumulated weight and co-locates complementary views — a CPU-heavy view tends to land where memory-heavy ones already run, and vice versa.

A memory-heavy aggregation:

```sql
CREATE MATERIALIZED VIEW sessions_state
INTO sessions_target
AS SELECT user_id, count() AS events, max(_tp_time) AS last_seen
FROM clicks GROUP BY user_id
SETTINGS
  memory_weight = 10737418240,   -- ~10 GiB of aggregation state
  checkpoint_settings='replication_type=shared;shared_disk=s3_disk';
```

A CPU-heavy transformation:

```sql
CREATE MATERIALIZED VIEW enrich_events
INTO enriched_target
AS SELECT *, heavy_udf(payload) AS scored FROM events
SETTINGS
  cpu_weight = 4,                -- ~4 CPUs of steady work
  checkpoint_settings='replication_type=shared;shared_disk=s3_disk';
```

Because each view is scored only on the dimension it declares, `sessions_state` (memory) and `enrich_events` (CPU) can comfortably share a node while the scheduler keeps each dimension's cluster-wide total even. Set the same weight on views of similar cost so the totals balance predictably; mixed hardware is not accounted for (homogeneous nodes are assumed).

### Preferred node: pin to a specific node

Pin a view to an exact node with `preferred_exec_node` (the node's `node_id`). The scheduler always places it there while the node is online, bypassing class balancing:

```sql
CREATE MATERIALIZED VIEW gpu_inference
INTO inference_target
AS SELECT device_id, infer(features) AS label FROM sensor_readings
SETTINGS
  preferred_exec_node = 3,       -- always run on node 3 (e.g. the GPU box)
  checkpoint_settings='replication_type=shared;shared_disk=s3_disk';
```

Notes:
- If node 3 is offline / decommissioning / failing liveness, the view falls back to ordinary class-based placement until node 3 returns.
- `preferred_exec_node` is **incompatible with `memory_weight`** — declare one or the other, not both.
- A pinned view is never chosen as a rebalance move candidate, so the pin keeps holding.

### Putting it together

A small cluster might mix all of these. Given a 3-node cluster and these views:

| View | Trait | Class | Lands on |
|------|-------|-------|----------|
| `orders_by_region`, `orders_by_status`, `orders_revenue` | `tag=orders` | `Tagged{orders}` | one per node (spread) |
| `sessions_state` | `memory_weight` | `Weighted` | least memory-loaded node |
| `enrich_events` | `cpu_weight` | `Weighted` | least CPU-loaded node (often *with* a memory-heavy view) |
| `gpu_inference` | `preferred_exec_node=3` | (pinned) | node 3, always |
| an untagged `... GROUP BY ...` view | none | `Agg` | least agg-loaded node |
| an untagged filter/projection view | none | `Plain` | least plain-loaded node |

Verify the result against [`system.execute_stream_assignments`](#observability).

## Rebalancing

Placement keeps a *new* view balanced, but membership changes and drops can leave the cluster lopsided. Rebalancing moves **one view at a time** from a donor node toward an under-loaded target, and only when the move **strictly improves** balance — so it converges and never thrashes a stable cluster.

Rebalancing is class-aware: it finds the **most imbalanced class** between donor and target and moves a view of that class.

- Count-based classes (Tagged / Agg / Join / Plain) use the donor-vs-target **count gap**.
- The Weighted class is balanced by **weight**, picking the single move that most reduces the worst-dimension normalized gap. The two passes operate on disjoint view sets, so they never fight each other.
- Views currently running on their `preferred_exec_node` are never chosen to move, so pins keep holding.

### Triggers

| Trigger | When | Behavior |
|---------|------|----------|
| **Event-driven** | A node joins or leaves the cluster | Starts a chain that moves one view per step until no strictly-improving move remains. Failover (rescheduling views off a dead node) flows through the same path. |
| **Periodic nudge** | Every `periodic_rebalance_interval_ms` | The scheduler leader re-runs rebalancing toward each online node, correcting any residual imbalance an event-driven chain stopped short of. A no-op once balanced. |

Dropping views does not itself trigger a rebalance; the imbalance is corrected at the next membership change, periodic nudge, or manual trigger.

### Manual controls

Two `SYSTEM` commands let an operator drive rebalancing on demand — useful when the periodic nudge is disabled, or to place a specific view deliberately. Both are distributed-only and are routed automatically to the scheduler leader.

Trigger a full rebalance pass:

```sql
SYSTEM REBALANCE SCHED MATERIALIZED VIEWS;
```

Move one scheduled view to a specific node:

```sql
SYSTEM TRANSFER SCHED MATERIALIZED VIEW my_db.my_mv TO <node_id>;
```

`SYSTEM TRANSFER SCHED MATERIALIZED VIEW` applies only to **scheduled** Materialized Views. For Raft-based (replicated) Materialized Views, use [`SYSTEM TRANSFER LEADER`](/materialized-view-high-availability) instead.

## Configuration

The scheduler is configured under the `scheduler:` section of the server config (`config.yaml`):

```yaml
scheduler:
  # Placement policy for scheduled materialized views / alerts.
  #   class_aware (default): spread evenly per tag, cpu_weight / memory_weight, and query shape
  #   round_robin          : legacy count-based placement
  execute_stream_policy: class_aware

  # Interval (ms) of the periodic rebalance nudge that corrects residual imbalance left
  # after event-driven (failover / revive) rebalancing.
  # Set to 0 to disable the periodic nudge entirely (a kill switch against rebalance churn);
  # placement and event-driven failover rebalancing still work. Minimum effective value is 1000.
  periodic_rebalance_interval_ms: 5000
```

| Setting | Default | Meaning |
|---------|---------|---------|
| `execute_stream_policy` | `class_aware` | `class_aware` enables tag / weight / query-shape balancing. `round_robin` reproduces the legacy count-based behavior (every view treated as one group; selection degenerates to `total_streams, memory_utilization, node_id`). The `preferred_exec_node` pin and deterministic tie-break apply under both. Unknown values warn and fall back to `class_aware`. |
| `periodic_rebalance_interval_ms` | `5000` | Period of the periodic nudge. `0` disables it. Positive values are clamped to a 1000ms floor. |

## Observability

The `system.execute_stream_assignments` table shows where each scheduled view currently runs, along with the traits that drove its placement:

```sql
SELECT node_id, database, name, class, tag, cpu_weight, memory_weight, preferred_exec_node
FROM system.execute_stream_assignments
ORDER BY node_id;
```

| Column | Description |
|--------|-------------|
| `node_id`, `node_uuid` | the node currently running the view |
| `database`, `name`, `uuid` | the scheduled view (or alert) |
| `class` | its scheduling class (`Tagged`, `Weighted`, `Agg`, `Join`, `Plain`) |
| `tag` | the parsed tag, if any |
| `cpu_weight`, `memory_weight` | declared resource weights |
| `preferred_exec_node` | the pinned node, if any |
| `timestamp` | when the assignment was recorded |

To check balance, group by node and class:

```sql
SELECT node_id, class, count() AS views
FROM system.execute_stream_assignments
GROUP BY node_id, class
ORDER BY node_id, class;
```

A balanced cluster shows each class spread to within ±1 view across the eligible nodes.

## Notes and edge cases

- **Homogeneous nodes assumed.** Class loads are compared as raw counts and weight sums, with no per-node capacity normalization. Use the same hardware spec across nodes for predictable balancing.
- **Tag and weights both set.** The tag wins for grouping; the node's weighted load is used only as a tie-break within the tag group.
- **Aggregates and joins both present.** Precedence is `Agg > Join` — a view that both aggregates and joins classifies as `Agg`, since aggregation state usually dominates cost.
- **Class drift on `ALTER`.** A view's class is derived from its query metadata and comment. Altering it changes the class while its current placement persists; this self-corrects at the next reschedule (no eager migration).
- **Preferred node vs. weights.** `preferred_exec_node` is incompatible with `memory_weight`; you declare one or the other.
