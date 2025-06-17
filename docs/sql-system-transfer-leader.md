# SYSTEM TRANSFER LEADER
Transfer the leader of a materialized view to another node in the cluster.

```sql
SYSTEM TRANSFER LEADER [db.]materialized_view_name shard_id FROM source_node_id TO target_node_id;
```

For example:

```sql
SYSTEM TRANSFER LEADER mv1 0 FROM 3 TO 1;
```

:::info
This feature is only available in Timeplus Enterprise v2.5.x or above. This SQL need to be run on the lead node of the cluster.
:::
