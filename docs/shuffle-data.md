# Shuffle Data

**Shuffle** is the process of redistributing upstream (multi-shard) data into multiple downstream substreams based on one of the group-by key columns. Each substream can then be processed independently, without requiring coordination or state merging during finalization.

Internally, the streaming watermark is also maintained per substream. This is useful when event timestamps drift — after shuffling, timestamps can be realigned.

Shuffling provides two key benefits:

- Better parallelization: Each substream can be processed independently.
- Improved memory efficiency: Especially effective when group-by key cardinality is high and source keys are spread across different shards.

By default, Timeplus does not shuffle data. To enable it, you must use the **`SHUFFLE BY`** clause in SQL.

## Syntax

```sql
SELECT ...
FROM ...
SHUFFLE BY col1, ...
GROUP BY col1, col2, ...
EMIT ...
SETTINGS substreams=<num_sub_streams>;
```

> Note: The columns in the `SHUFFLE BY` clause must be a subset of the `GROUP BY` columns to ensure correct aggregation results.

**Example**:

```sql
CREATE STREAM device_utils(
    location string,
    device string,
    cpu float32
);

SELECT 
    location, 
    device, 
    min(cpu), 
    max(cpu), 
    avg(cpu) 
FROM device_utils 
SHUFFLE BY location 
GROUP BY location, device 
EMIT ON UPDATE WITH BATCH 1s;
```

In this example:

- The input stream `device_utils` has a single source shard.
- The `SHUFFLE BY` location clause splits the data into multiple coarse-grained substreams.
- All events for the same location are guaranteed to reside in exactly one substream.
- After shuffling, CPU utilization aggregations (min, max, avg) can be computed independently per substream.

This enables better parallelization, since the one-to-many fan-out creates multiple substreams that can be processed in separate threads.

The internal query plan for the above example looks like this:

![ShufflePipelineOne](/img/shuffle-pipeline-one-to-many.svg)

## Control the Fan-Out  

By default, the system automatically determines the number of substreams after a shuffle. This default value may not be optimal, especially on nodes with many CPUs.  

To customize this behavior, you can use the **`substreams`** setting to control the number of target substreams.  
- If not specified, the system typically chooses a value equal to the number of CPUs on the node.  

**Example: Many-to-Many Data Shuffle** 

```sql
CREATE STREAM device_utils(
    location string, 
    device string, 
    cpu float32
) SETTINGS shards=3;

SELECT 
    location, 
    device, 
    min(cpu), 
    max(cpu), 
    avg(cpu) 
FROM device_utils 
SHUFFLE BY location 
GROUP BY location, device 
EMIT ON UPDATE WITH BATCH 1s
SETTINGS substreams=8; 
```

The default system picked number of substreams after shuffle may be not ideal, especially when there are lots of CPUs in the node.  You can use setting **`substreams`**  to control the number of target substreams. If it is not explicitly specified, the system will pick a value which is usually the number of CPUs of the node. 

The internal query plan for the above query looks like this:

![ShufflePipelineMany](/img/shuffle-pipeline-many-to-many.svg)

:::info
The `substreams` value is always rounded **up to the nearest power of 2** for better shuffle performance. For example, if specifying `5` will be rounded to `8`. 
:::

## Data Already Shuffled in Storage  

In some cases, data is **already partitioned in storage** (for example, data correctly partitioned across Kafka partitions).  
Performing an additional shuffle in these scenarios introduces unnecessary overhead.  

To avoid this, you can enable **independent and parallel shard processing** with:  

```sql
SETTINGS allow_independent_shard_processing=true
```

**Example:**

```sql
CREATE STREAM device_utils(
    location string, 
    device string, 
    cpu float32
) 
SETTINGS shards=3, sharding_expr='weak_hash32((location, device))';

SELECT 
    location, 
    device, 
    min(cpu), 
    max(cpu), 
    avg(cpu) 
FROM device_utils 
GROUP BY location, device 
EMIT ON UPDATE WITH BATCH 1s
SETTINGS allow_independent_shard_processing=true;
```

In this example:

- The stream `device_utils` is created with **3 shards** and a custom sharding expression on `(location, device)`.
- Since the data is already partitioned correctly, additional shuffling  can be skipped for this aggregation.
- Aggregations (min, max, avg) can be computed directly and in parallel across shards.

The internal query plan for the above query looks like this:

![ShufflePipelineInStorage](/img/shuffle-pipeline-in-storage.svg)
