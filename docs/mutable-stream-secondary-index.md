# Secondary Indexes

You can create secondary indexes on a Mutable Stream, similar to MySQL tables, to accelerate queries when the primary key index alone is insufficient.

Secondary indexes are especially useful in two scenarios:
1. When a Mutable Stream is used like a MySQL table, supporting fast historical queries alongside efficient data mutations.
2. When a Mutable Stream acts as a dynamic source in a **direct** streaming join, enriching fact events.

Please note that:
- Each additional secondary index introduces maintenance overhead for new data. So the more secodary indexes created, the more expensive to maintain these indexes.
- Since Mutable streams has dual-storage design, ingest speed is not slowed down. All data is first committed to the Write-Ahead Log (WAL) before index maintenance.

## Create Secondary Indexes

You can define secondary indexes when creating a Mutable Stream.

Example:

```sql
CREATE MUTABLE STREAM products
(
    id uint64,
    name string,
    vendor string,
    time datetime64(3),
    price float,
    INDEX sidx_nv (name, vendor), -- Secondary index on `name` and `vendor`
    INDEX sidx_t (time)           -- Secondary index on `time`
)
PRIMARY KEY id;
```

## Store Data in Secondary Index

You can store additional column data in a secondary index to speed up historical queries.

Example:

Consider the `products` mutable stream. If your application frequently queries the `price` column, for example:

```sql
SELECT id, name, price FROM table(products) WHERE name = 'cable';
```
This query requires:
- Primary key column: `id`
- Secondary key column: `name`
- Non-key column: `price`

If the `price` column is not stored in the secondary index `sidx_nv`, the query must perform two steps:
1. Use the secondary index `sidx_nv` to look up rows where `name = 'cable'`, returning the encoded primary keys.
2. Use these primary keys to query the primary index, then decode `id`, `name`, and `price`.

You can optimize the query by storing `price` column in the secondary index using the `STORING (...)` clause:

```sql
CREATE MUTABLE STREAM products
(
    id uint64,
    name string,
    vendor string,
    time datetime64(3),
    price float,
    INDEX sidx_nv (name, vendor) STORING (price), -- Store `price` in the secondary index
    INDEX sidx_t (time)
)
PRIMARY KEY id;
```

With this definition, `sidx_nv` contains the `price` column directly. The query can now be resolved entirely by the secondary index without an extra lookup in the primary index.

There are trade-offs:
- Storing additional data in a secondary index increases disk space usage (data duplication).
- It will slightly slow down index build speed

:::info
If a query can be fully answered by a secondary index, the index is called a **covering index**.
If the query still requires looking up the primary index, the index is called a **forwarding index**.
:::

## Unique Secondary Index

If the keys in a secondary index are guaranteed to be unique, you can define a **unique secondary index**.
This helps reduce storage overhead and improves ingest performance, since duplicate key checks and index maintenance become more efficient.

**Example**:

If the combination of `name` and `vendor` in the `products` stream is unique, you can create a unique secondary index like this:

```sql
CREATE MUTABLE STREAM products
(
    id uint64,
    name string,
    vendor string,
    time datetime64(3),
    price float,
    INDEX sidx_nv (name, vendor) UNIQUE, -- Define unique secondary index
    INDEX sidx_t (time)
)
PRIMARY KEY id;
```

## Add Secondary Indexes

After a Mutable Stream is created and data has been ingested, you can add new secondary indexes.
When you do this, the system scans all existing data in the background to build the index.
This process is **asynchronous**, so the index becomes usable only after the build completes.

```sql
ALTER STREAM <db.mutable-stream-name> ADD INDEX <index-name> (<columns>);
```

**Example**:

```sql
ALTER STREAM products ADD INDEX sidx_v (vendor);
```

:::info
Until the new secondary index is fully built, using it to accelerate a historical query may return partial results.
:::

## Drop Secondary Index

```sql
ALTER STREAM <db.mutable-stream-name> DROP INDEX <index-name>;
```

**Example**:

```sql
ALTER STREAM products DROP INDEX sidx_v;
```

## Use Secondary Indexes

When executing a query against a Mutable Stream, **Timeplus automatically selects the best index** to optimize performance.

- The **primary index** usually has the highest precedence.
- If multiple secondary indexes are eligible, Timeplus prioritizes them based on the **longest matched predicate length** in the `WHERE` clause.
  - The longer the match, the narrower the search space, hence potentially faster.

You can manually hint which secondary index to use with the query setting:

```sql
SETTINGS use_index='<secondary-idx-name>'
```

Timeplus will still validate whether the chosen index is applicable.
If not, it falls back to a full scan automatically.

To force a full scan (ignoring all indexes), use:

```sql
SETTINGS force_full_scan=true;
```

This can be useful for debugging, working around index bugs, or ensuring completeness when an index may be outdated.

### Use Secondary Index in Historical Queries

**Example**:
```sql
-- This query will use secondary index `sidx_t` to speed up filtering by time
SELECT id, name, vendor
FROM table(products)
WHERE time >= '2025-09-20 00:00:00';
```

### Use Index in Direct Join

A direct join means that for each streaming event on the left side, Timeplus performs a lookup on the right-side **Mutable Stream** using either the primary or a secondary index.
- The right-hand side stream can be dynamically updated, and new updates will be considered for future joins.
- No hash table is built on the right-hand side, making direct joins lightweight and cost-efficient.

**Example (using primary index)**:
```sql
SELECT
    *
FROM
    orders
LEFT JOIN table(products) AS products
ON orders.product_id = products.id
SETTINGS
    join_algorithm = 'direct';
```

## Clear & Rebuild Secondary Index

If a secondary index becomes out of sync (for example, due to a bug), you can clear and rebuild it.
The rebuild process runs **asynchronously** in the background.

```sql
-- Clear the secondary index and then rebuild it
ALTER STREAM <db.mutable-stream-name> MATERIALIZE INDEX <secondary-index-name> WITH CLEAR;
```

**Example**:
```sql
ALTER STREAM products MATERIALIZE INDEX sidx_t WITH CLEAR;
```
