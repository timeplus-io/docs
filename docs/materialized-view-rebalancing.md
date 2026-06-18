# Workload Rebalancing

In a cluster, a **replicated (Raft-based) Materialized View** keeps three replicas and runs only on
the **leader** of its Raft group (the followers just replicate the checkpoint for fast failover).
The **workload rebalancer** keeps that leadership spread evenly across nodes: it runs on the
metadata-quorum leader and transfers the Raft leadership of the busiest MVs from a hot node to an
under-loaded peer **within the MV's existing replica set**. This is the [Raft-Based
HA](/materialized-view-high-availability#raft-based-ha) model's load-balancing layer.

:::info Rebalancer vs. Scheduler — two different subsystems
Timeplus has **two** independent MV load-distribution subsystems, one per HA model. Pick the page
that matches your MV type:

| | **Workload Rebalancer** (this page) | **Scheduler** ([Scheduling](/materialized-view-scheduling)) |
|---|---|---|
| Materialized View type | **Replicated (Raft)** — the default | **Scheduled** — shared-checkpoint (`replication_type=shared`) |
| HA model | [Raft-Based HA](/materialized-view-high-availability#raft-based-ha) | [Scheduler-Based HA](/materialized-view-high-availability#scheduler-based-ha) |
| What it moves | **Raft leadership** within the MV's fixed 3-replica group | **Placement** — which single node runs the MV |
| How a "move" happens | `transferLeader` to an existing replica (no data copy) | reassign + restart from shared checkpoint on the new node |
| Runs on | metadata-quorum leader | scheduler-quorum leader |
| Config section | `rebalancer:` | `scheduler:` |
| Manual SQL | `SYSTEM REBALANCE MATERIALIZED VIEWS` | `SYSTEM REBALANCE SCHED MATERIALIZED VIEWS` |
| Introspection | `system.mv_rebalance_history` | `system.execute_stream_assignments` |

In short: **replicated MVs are *rebalanced* (leadership), scheduled MVs are *scheduled* (placement).**
They never act on the same view.
:::

## When it runs

The rebalancer lives on the metadata-quorum leader and evaluates the cluster every
`rebalancer.interval` seconds. Each cycle it:

1. Reads **accurate node-level CPU and memory** for every node from the cluster heartbeat
   (cgroup / OS metrics — the signal it trusts).
2. Categorizes nodes as **overloaded** (over a utilization threshold) or **candidates**.
3. If rebalancing is warranted, moves **one** MV's leadership from the busiest node to the best
   under-loaded peer in that MV's replica set, then lets the **next cycle's re-measurement** confirm
   the effect (a closed feedback loop — one move per cycle avoids overshoot).

Moves are also triggered **event-driven** on membership changes: when a node leaves, its MVs fail
over to surviving replicas; when a node (re)joins, the rebalancer pulls leadership back toward it.

## The `reliable` algorithm

`rebalancer.type` selects the algorithm; **`reliable`** is recommended. Its design principle:
**decide on signals you can trust.**

- **Node-level CPU/memory (cgroup/OS) is the ground truth** — used for the balance objective and the
  overload gate. Per-MV memory measurements drift over time and are never used to *predict* a node's
  post-move state.
- **Stable per-MV cost proxy**, in priority order: declared `memory_weight` → `checkpoint_bytes × 2`
  (the state size that actually moves with leadership) → audited memory (last resort). CPU keeps the
  measured per-MV rate.
- **One move per cycle**, only when it strictly improves balance, respecting each MV's replica set —
  fully deterministic, so it converges without thrashing.
- A node is **overloaded** when *either* its memory utilization reaches
  `node_overloaded_mem_util_threshold` **or** its CPU reaches `node_overloaded_cpu_util_threshold`.

The legacy `greedy` and `memory` algorithms remain available for compatibility.

### Workload-skew rebalancing

By default the rebalancer only acts when a node is genuinely **overloaded**. Set
`rebalancer.rebalance_only_nodes_are_overloaded: false` to *also* even out leadership when the
**leader counts** are skewed even though no node is overloaded — useful so a node that joined late
(or recovered) doesn't stay under-utilized. This is util-neutral: a move is made only if it reduces
the leader-count skew and does not push the target node toward overload.

## Configuration

Under the `rebalancer:` section of the server config (`config.yaml`):

```yaml
rebalancer:
  enabled: true                 # false disables the periodic loop; manual trigger still works
  type: reliable                # reliable (recommended) | greedy | memory (legacy)
  interval: 30                  # seconds between rebalance cycles; < 0 disables
  max_apply_rebalance: 1        # leadership moves applied per cycle
  node_overloaded_mem_util_threshold: 0.5   # 0.0-1.0; overloaded if mem util reaches this ...
  node_overloaded_cpu_util_threshold: 0.7   # ... OR cpu util reaches this
  # false also rebalances on pure leader-count skew (no node overloaded):
  rebalance_only_nodes_are_overloaded: true
```

| Setting | Meaning |
|---------|---------|
| `enabled` | When `false`, the periodic loop doesn't run, but `SYSTEM REBALANCE MATERIALIZED VIEWS` still works. The rebalancer exists on every metadata node regardless. |
| `type` | `reliable` (node-level metrics + stable proxy, recommended), or legacy `greedy` / `memory`. |
| `interval` | Seconds between cycles. `< 0` disables the loop. |
| `node_overloaded_mem_util_threshold` / `node_overloaded_cpu_util_threshold` | Per-resource overload gates (0.0–1.0). A node is overloaded if **either** is reached. |
| `rebalance_only_nodes_are_overloaded` | `true` (default): only rebalance under real overload. `false`: also spread leader counts when skewed. |

## Manual trigger

Rebalance on demand — handy when the periodic loop is disabled, or to act immediately:

```sql
SYSTEM REBALANCE MATERIALIZED VIEWS;
```

Distributed-only. It is routed through the main metadata log to the metadata-quorum leader, which
runs one rebalance pass. (For Scheduled MVs, the equivalent is
`SYSTEM REBALANCE SCHED MATERIALIZED VIEWS` — see [Scheduling](/materialized-view-scheduling).)

## Observability

**Where each MV runs** — a replicated MV runs on its checkpoint-shard **leader**, and only the leader
reports per-MV metrics with status `Executing` (followers are `Suspended`):

```sql
-- leader (executing) node per MV, counted per node
SELECT node_id, count() AS leaders FROM (
  SELECT uuid, arg_max(node_id, _tp_time) AS node_id
  FROM table(system.introspection_state_log)
  WHERE dimension = 'materialized_view' AND state_name = 'status'
        AND state_string_value = 'Executing' AND _tp_time > now() - 60
  GROUP BY uuid)
GROUP BY node_id ORDER BY node_id;
```

**Executed moves** — every leadership transfer is recorded:

```sql
SELECT from_node, to_node, status, count()
FROM table(system.mv_rebalance_history)
WHERE _tp_time > now() - 300
GROUP BY from_node, to_node, status;
```

A balanced cluster shows roughly equal leader counts per node and no recent moves (quiescent).

## Notes

- **Only the leader runs the pipeline.** A leadership transfer genuinely relocates the active CPU/
  memory cost — the old leader tears its pipeline down and the new leader rebuilds from the
  replicated checkpoint; followers carry no pipeline load.
- **Homogeneous nodes are assumed** — loads are compared without per-node capacity normalization.
- **`preferred_exec_node` is a Scheduled-MV concept**, not used here; replicated MVs are balanced
  purely by Raft leadership.
