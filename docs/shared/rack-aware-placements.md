You can use stream storage setting `placement_policies` to control stream shard replica placement affinity (i.e., rack-aware replica placement). They work together with the `locality:` setting in each node’s `config.yaml`, which defines the **physical location** of that node (site, AZ, rack, etc.).


`placement_policies` are **semicolon-separated key-value settings**.

## Supported Key & Values

- **`node`** — Node location affinity.
  - Supported: `colocated`, `balanced`, `exclusive`
  - Default: `balanced`

- **`shard`** — Shard location affinity.
  - Supported: `colocated`, `balanced`, `exclusive`
  - Default: `colocated`

- **`preferred_nodes`** — Manually assigned nodes.
  - Format: comma-separated node IDs (e.g., `1,2,3`)
  - Default: `""` (empty)

:::info
If the same key appears multiple times in the `placement_policies` setting, the **later key/value pair overrides the earlier one**.

For example: `placement_policies='preferred_nodes=1,2,3;node=exclusive;shard=balanced;preferred_node=2,3,4;node=colocated'`

After compaction, this is equivalent to: `shard=balanced;preferred_node=2,3,4;node=colocated`
:::

## Node Locality Affinity

- **`exclusive`** — No two shard replicas can be placed on nodes in the same site/location/AZ/rack (**hard requirement**).
- **`colocated`** — All shard replicas must be placed on nodes in the same site/location/AZ/rack (**hard requirement**).
- **`balanced`** — Spread replicas across different sites/locations/AZs/racks as much as possible (**soft requirement**).

## Shard Locality Affinity

- **`exclusive`** — A node can host only one shard replica (**hard requirement**).
- **`colocated`** — Replicas of the same index across different shards must colocate on the same node.
  - Example: For a stream with 3 shards and replication factor = 3:
    - `(shard-0, replica-0)`, `(shard-1, replica-0)`, `(shard-2, replica-0)` must coexist on one node.
    - `(shard-0, replica-1)`, `(shard-1, replica-1)`, `(shard-2, replica-1)` on another node. Similarly for replica-2
    - `(shard-0, replica-2)`, `(shard-1, replica-2)`, `(shard-2, replica-2)` on the other node.
- **`balanced`** — Spread shard replicas across nodes as much as possible (**soft requirement**).

## Placement Algorithm

The placement algorithm works in two steps:

1. **Honor node locality affinity** — Pick candidate nodes across locations/sites.
2. **Apply shard locality affinity** — Place shard replicas on those nodes.

## Example: 6 Nodes Across 3 Sites

- **Site 1**: `node-0x1`, `node-0x2`
- **Site 2**: `node-0x3`, `node-0x4`
- **Site 3**: `node-0x5`, `node-0x6`

### Example 1: Default Placement

```sql
CREATE STREAM test(i int) SETTINGS shard=2, replication_factor=3;
```

- Defaults:
  - node = `balanced`
  - shard = `colocated`
- Algorithm: Picks nodes from different sites in a zig-zag order `[0x1, 0x3, 0x5, 0x2, 0x4, 0x6]`.
- First 3 nodes selected: `0x1, 0x3, 0x5` (from site1, site2, site3 respectively).

Resulting placement:
```
node-0x1: (shard-0, replica-0), (shard-1, replica-0)
node-0x3: (shard-0, replica-1), (shard-1, replica-1)
node-0x5: (shard-0, replica-2), (shard-1, replica-2)
```

### Example 2: Shard Exclusive

For stream creation SQL:

```sql
CREATE STREAM test(i int)
SETTINGS
  shard=2,
  replication_factor=3,
  placement_policies='shard=exclusive';
```

`shard=exclusive` requires each shard replica must be placed on different node.

Resulting placement:

```
node-0x1: (shard-0, replica-0)
node-0x2: (shard-1, replica-0)
node-0x3: (shard-0, replica-1)
node-0x4: (shard-1, replica-1)
node-0x5: (shard-0, replica-2)
node-0x6: (shard-1, replica-2)
```

### Example 3: Failed Placement

For stream creation SQL:
```sql
CREATE STREAM test(i int)
SETTINGS
  replication_factor=5,
  placement_policies='node=exclusive';
```

`node=exclusive` requires no two replicas on the same site. Since its replication_factor is 5, which requires 5 disinct sits but the cluster setup only has 3 sites, so the placement fails.

