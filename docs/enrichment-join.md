# Enrichment Join

**Enrichment Join** enriches a live data stream with reference data from a **static right-hand side dataset**. It is designed for use cases where the right-hand side data is **unchanging** or needs to represent a **point-in-time snapshot**.

In this join type, **events from the left stream** trigger the join — each incoming event probes the **static hash table** built from the right-hand side dataset.

## Syntax

```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] JOIN rhs_table 
ON lhs_stream.col1 = rhs_table.col1 AND ...;
```

The right-hand side (`rhs_table`) can be one of the following:

1. **A Timeplus stream** wrapped with `table()` function
    - The table() function snapshots the stream and builds a static hash table for joining.

2. **An external table** (e.g., PostgreSQL or MySQL)
    - Timeplus loads all necessary data from the external source and builds a static hash table in memory.

## Example

Assume you have two streams, `orders` and `products`. The `products` stream is a **mutable stream** keyed by a unique product ID. You like enrich every order with the corresponding product details.

```sql
CREATE STREAM orders 
(
    id string,
    product_id string,
    price float64,
    quantity uint32,
    timestamp datetime64(3)
);

CREATE MUTABLE STREAM products
(
    id string,
    name string,
    country string
)
PRIMARY KEY id;
```

**Enrichment Join Query**:
```sql
SELECT 
    *
FROM orders INNER JOIN table(products) AS products
ON orders.product_id = products.id; 
```

**Explanation**:
- When the query starts, Timeplus loads a **snapshot** of the `products` stream and builds a **static hash table**.
- For every new order in the `orders` stream, Timeplus **probes** this hash table using the `product_id`.
- If a match is found, the **joined result** is emitted downstream.

## Concurrent Enrichment Join 

Enrichment joins are generally very fast since the right-hand side hash table is static and Timeplus optimizes hash lookups heavily.

However, for **high-throughput streams**, you can improve performance further by enabling **parallel (concurrent) hash joins**.

**Syntax**:
```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] JOIN rhs_table
ON lhs_stream.col1 = rhs_table.col1 AND ...
SETTINGS 
    join_algorithm = 'parallel_hash',  -- Enable concurrent hash join
    max_threads = <threads>;           -- Control concurrency
```

**Example**:

```sql
SELECT 
    *
FROM orders INNER JOIN table(products) AS products
ON orders.product_id = products.id
SETTINGS
    join_algorithm = 'parallel_hash',
    max_threads = 4;
```

**Explanation**:
- `join_algorithm='parallel_hash'` enables **parallel hash join**. 
- `max_threads=4` controls the number of concurrent threads.
- Internally: 
    - Timeplus **shuffles** the left stream `orders` into four **non-overlapping substreams** by join key.
    - The right table (`products`) is **partitioned** into four **subtables**, each building a **separate hash table**.
    - Each substream joins its corresponding subtable **in parallel**, significantly improving join throughput.

## Optimize Memory Consumption

If the right-hand side dataset is very large (e.g., hundreds of millions of keys), building an in-memory hash table may consume significant memory.
To mitigate this, you can enable **hybrid hash tables** using the query setting `default_hash_join='hybrid'`.

**Example**:

```sql
SELECT 
    *
FROM orders INNER JOIN table(products) AS products
ON orders.product_id = products.id
SETTINGS
    default_hash_join = 'hybrid',   -- Enable hybrid hash table
    max_hot_keys = 100000;          -- Maximum number of hot keys in memory
```

**Explanation**:
- `default_hash_join='hybrid'` enables a **hybrid in-memory + disk-based hash table**.
- `max_hot_keys=100000` limits the number of keys stored in memory. When this limit is reached, older keys are **spilled to disk** using an **LRU** (Least Recently Used) policy.
- This approach balances **memory efficiency and performance** — if most lookups hit the in-memory hot keys, join performance remains excellent.
