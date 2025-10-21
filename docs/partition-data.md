# Partition Data

**Partition** is the process of dividing a data stream into multiple **substreams**, while preserving the **event order** within each substream as it appeared in the original stream.

Each substream created through partitioning maintains its own **clock** and **timestamp**, which are used internally by the streaming engine to calculate the **watermark**. Because each substream has an **independent clock**, its timestamp progression — and thus its stream processing — is **isolated** from other substreams.

Partitioning is essential for scenarios where different entities in a stream have **unaligned clocks or timestamps**. Without partitioning, performing time-based window operations (e.g., tumbling or hopping windows) across the entire stream could result in inaccurate aggregations or dropped events.

## Syntax

```sql
SELECT ...
FROM ... 
PARTITION BY col, ...
GROUP BY col1, col2, ...
EMIT ...;
```

## Example

Consider a stream containing sensor metrics from **10,000 vehicles**, all published into a single Kafka partition.
- Each vehicle’s onboard sensor generates timestamps based on its local clock, which may not be synchronized with others.
- You may also want to analyze driver behavior or performance metrics per vehicle individually.

By partitioning the stream using the `vehicle_id`, Timeplus can create 10,000 substreams — one for each vehicle — ensuring:
- Event order is preserved per vehicle
- Each substream advances its watermark independently
- Windowing and aggregation can be performed correctly without data skipping or skew

```sql
CREATE STREAM trucks
(
    lpn string,   -- license plate number
    lat float32,  -- latitude
    lon float32,  -- longitude
    spd float32,  -- speed
    mil float32,  -- mileage
    state string, 
    city string
);

SELECT
  window_start, 
  lpn, 
  count()
FROM tumble(trucks, 2s)
PARTITION BY lpn
GROUP BY window_start, lpn;
```

**Explanation**:
- This query partitions the `trucks` stream by the license plate number (`lpn`).
- Each unique lpn forms an **independent substream**.
- A **2-second tumbling window** is applied to each substream to count the number of events per truck.

**Sample Events**:

The following events come from two trucks (lic1 and lic2) whose timestamps are unaligned across regions.

```sql
-- Truck lic1 in San Francisco 
insert into trucks(lpn, lat, lon, spd, mil, state, city, _tp_time) values ('lic1', 37.7749, 37.7749, 23.5, 12462, 'CA', 'San Francisco', '2015-10-01 13:00:44'); 

-- Truck lic2 in Manhattan
insert into trucks(lpn, lat, lon, spd, mil, state, city, _tp_time) values ('lic2', 40.7128, 74.0060, 32.3, 32567, 'NY', 'Manhattan', '2015-10-01 20:10:22');

-- Truck lic1 in San Francisco
insert into trucks(lpn, lat, lon, spd, mil, state, city, _tp_time) values ('lic1', 37.7341, 37.7258, 13.5, 12472, 'CA', 'San Francisco', '2015-10-01 13:00:45'); 

-- Truck lic2 in Manhattan
insert into trucks(lpn, lat, lon, spd, mil, state, city, _tp_time) values ('lic2', 40.7325, 74.0213, 32.4, 32570, 'NY', 'Manhattan', '2015-10-01 20:10:23');

-- Truck lic1 in San Francisco
insert into trucks(lpn, lat, lon, spd, mil, state, city, _tp_time) values ('lic1', 37.7719, 37.7730, 33.5, 12473, 'CA', 'San Francisco', '2015-10-01 13:00:46'); 

-- Truck lic2 in Manhattan
insert into trucks(lpn, lat, lon, spd, mil, state, city, _tp_time) values ('lic2', 40.7335, 74.0223, 12.3, 32581, 'NY', 'Manhattan', '2015-10-01 20:10:24');
``` 

**Output**:
```
┌────────────window_start─┬─lpn──┬─count()─┐
│ 2015-10-01 13:00:44.000 │ lic1 │       2 │
└─────────────────────────┴──────┴─────────┘
┌────────────window_start─┬─lpn──┬─count()─┐
│ 2015-10-01 20:10:22.000 │ lic2 │       2 │
└─────────────────────────┴──────┴─────────┘
```

**Key Takeaway**
Even though the two trucks (`lic1` and `lic2`) have unaligned clocks, partitioning ensures that:
- Each truck’s events are processed **independently** in its own substream.
- Tumbling windows operate **correctly and in order** per substream.
- There is **no timestamp interference** between trucks, avoiding data skew or dropped events.

## Performance Considerations

The performance of partitioning is closely tied to the number of substreams created after partitioning.
Each substream maintains its own independent watermark and timestamp, which increases memory and scheduling overhead as the number of partitions grows.

In practice, if you have a very large number of substreams, consider:
- Applying light [data shuffling](/shuffle-data) to balance the workload.
- Using high-performance [sessionization](/global-aggregation#emit-after-session-close) techniques to optimize aggregation efficiency across partitions.
