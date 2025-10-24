# Direct Enrichment Join

**Direct Enrichment Join** is similar to a [Dynamic Enrichment Join](/dynamic-enrichment-join)
, but differs in **how the right-hand side data is accessed and managed**.

Instead of building and maintaining an in-memory hash table, **Direct Enrichment Join** performs lookups directly against a live data source — whether it’s a remote database, a local mutable stream, or a dictionary. This approach is ideal when the reference data is too large, frequently changing, or already efficiently indexed elsewhere.

There are several types of Direct Enrichment Joins for different use cases:

1. **Direct Join with Remote System** — joins directly with external databases (e.g., MySQL, PostgreSQL) or external Timeplus Mutable Streams.

2. **Direct Join with Local Mutable Stream** — joins a live, mutable stream in Timeplus without materializing it in memory.

3. **Direct Join with Local Dictionary and Cache** — joins using a [Timeplus dictionary](/dictionary) as a lightweight key-value lookup source with necessary caching.

Unlike other enrichment joins, the **right-hand side hash table** is not explicitly built or cached in memory. Timeplus instead performs on-demand lookups, relying on the external or local system’s indexing and access efficiency.

## Direct Join with Remote System 

You can join directly with a remote transactional system such as MySQL or PostgreSQL without local caching.
The right-hand side is defined as a dictionary that connects to the external database, and the join uses on-demand lookups via `join_algorithm='direct'`.

**Example**:
```sql
CREATE DICTIONARY mysql_products_dict_direct(
    `id` string,
    `name` string,
    `created_at` datetime64(3)
)
PRIMARY KEY id
SOURCE(MYSQL(
    DB 'test'
    TABLE 'products'
    HOST '127.0.0.1'
    PORT 3306
    USER 'root'
    PASSWORD 'my'
    BG_RECONNECT true
))
LAYOUT(complex_key_direct());

CREATE STREAM orders (
    `id` string,
    `product_id` string,
    `customer_id` string,
    `country` string,
    `city` string
);

SELECT *
FROM orders
JOIN mysql_products_dict_direct AS products
ON orders.product_id = products.id
SETTINGS join_algorithm = 'direct';
```

**Explanation**:

- The dictionary `mysql_products_dict_direct` connects directly to MySQL.
- Each new `orders` event probes MySQL on demand through the dictionary interface.
- No in-memory hash table is built — Timeplus fetches and joins records as needed.

## Direct Join with Local Mutable Stream

In this mode, the right-hand side is a Timeplus Mutable Stream (with a primary key or secondary indexes).
The join happens directly without explicitly building an in-memory hash table.

**Example**:

```sql

CREATE MUTABLE STREAM products (
    id string,
    name string
)
PRIMARY KEY id;

CREATE STREAM orders (
    id string,
    product_id string,
    quantity uint32
);

SELECT *
FROM orders
JOIN table(products)
ON orders.product_id = products.id
SETTINGS join_algorithm = 'direct';
```

**Explanation**:
- `products` is a Mutable Stream keyed by `id`.
- Each new `orders` event looks up the current record in `products` directly.
- Timeplus avoids building and maintaining a large hash table, improving memory efficiency.

## Direct Join with Local Dictionary and Cache 

You can provide a **cache layer** for Dictionary to speed up the direct join. There are several cache strategies, please refer to [Dictionary](/dictionary) for details. 

Here is one example by using Timeplus Mutable stream as the cache layer for remote MySQL table.

**Example**:
```sql
CREATE MUTABLE STREAM mysql_mutable_cache (
    id string,
    name string,
    created_at datetime64(3)
)
PRIMARY KEY id
SETTINGS
    ttl_seconds=3600;

CREATE DICTIONARY mysql_products_dict_mutable(
    id string,
    name string,
    created_at datetime64(3)
)
PRIMARY KEY id
SOURCE(MYSQL(
    DB 'test'
    TABLE 'products'
    HOST '127.0.0.1'
    PORT 3306
    USER 'root'
    PASSWORD 'my'
    BG_RECONNECT true
))
LAYOUT(mutable_cache(
    db 'default'
    stream 'mysql_mutable_cache'
    update_from_source false
));

-- Direct join using mutable cache
SELECT *
FROM orders
JOIN mysql_products_dict_mutable AS products
ON orders.product_id = products.id
SETTINGS join_algorithm = 'direct';
```

**Explanation**:
- Timeplus first checks the **local mutable cache** (mysql_mutable_cache).
- If all required keys are found locally, the join completes **without querying** the remote MySQL database.
- For any missing keys, Timeplus **fetches them from MySQL**, merges the results, and **updates the local Mutable Stream** with the newly fetched entries.
- Each key stored in the Mutable Stream has a **1-hour TTL** — once expired, it becomes eligible for garbage collection.
- This hybrid model provides an optimal balance between **speed** (through local caching) and **freshness** (via on-demand remote lookups).
