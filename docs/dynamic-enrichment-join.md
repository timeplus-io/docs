# Dynamic Enrichment Join

Similar to [Enrichment Join](/enrichment-join), **Dynamic Enrichment Join** enriches a live data stream with reference data from a changing right-hand side dataset. It is designed for scenarios where the right-hand side data evolves over time. Each event from the left stream probes the current join state, and the join strictness determines which rows match.

In this join type, events from the left-hand stream trigger the join. Each incoming event probes a dynamic hash table that is continuously updated from the right-hand side dataset (which typically changes at a slower rate).

Use `LEFT` or `INNER` for enrichment. The separate [`FULL LATEST JOIN`](/streaming-joins#full-latest-join) maintains state on both sides.

There are several types of **Dynamic Enrichment Joins**.
1. `LATEST JOIN` - Joins **only the latest version** of the matching key on the right-hand side.  
2. `ASOF JOIN` - Joins the **closest match in time** on the right-hand side (useful for time-based lookups). 
3. `ALL JOIN` - Joins **all buffered rows** matching the key on the right-hand side.

## LATEST JOIN

**LATEST JOIN** enriches a live data stream using the **most recent version** of each key from a **dynamic right-hand side dataset**. It’s designed for use cases where the right-hand side data changes over time, but only the **latest state** of each key matters — such as **the most recent user profile, product info**, or **configuration snapshot**.

Timeplus keeps a hash table for the right-hand side, continuously updating it as new events arrive. Each event from the left stream probes this table to fetch the **latest available value** at that moment.

### Syntax

```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] LATEST JOIN rhs_stream 
ON lhs_stream.col1 = rhs_stream.col1 AND ...;
```

The right-hand side (`rhs_stream`) is typically a native **Timeplus stream** (usually [Mutable Stream](/mutable-stream) or [Versioned Key Value Stream](/versioned-stream)) or an **external streaming source** (e.g., Kafka). As new events flow into the right-hand side stream, the join maintains a **dynamic hash table** that is continuously updated — keeping **latest versions** of the join keys for lookup.

The following diagram illustrates this behavior:

![DynamicEnrichmentJoinLatest](/img/dynamic-enrichment-join-latest.svg)

### Example

Assume you have two streams, `orders` and `products`. The `products` stream is a **mutable stream** keyed by a unique product ID and slowly changed. You like enrich every order with the corresponding **latest** product details.

```sql
CREATE STREAM orders 
(
    id string,
    customer_id string,
    product_id string,
    price float64,
    currency string,
    amount uint32
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
FROM orders LATEST JOIN products
ON orders.product_id = products.id; 
```

**Explanation**:
- When the query starts, Timeplus loads a **snapshot** of the `products` mutable stream and builds a **dynamic hash table** on the right-hand side.
- Each new event from the `orders` stream **probes** this hash table using the `product_id` as the join key.
- If a match is found, the **joined result** is emitted downstream immediately.
- As new updates or inserts arrive in the `products` stream, the right-hand side hash table is **incrementally updated**.
- Subsequent `orders` events probe against the **latest version** of the `products` data that the join has processed. Earlier results are not revised.

## ASOF JOIN 

**ASOF JOIN** enriches a live data stream with reference data based on **the closest** match in time on the right-hand side dataset. It is designed for time-aware enrichment use cases where the right-hand side dataset **(e.g., exchange rates, inventory prices, metrics**) evolves over time, and each incoming event from the left stream should use the **most recent valid version** from the right-hand side.

Unlike `LATEST JOIN` (which only keeps the latest version per key), `ASOF JOIN` maintains a time-sorted list for each key on the right-hand side. With `left.ts >= right.ts`, it finds the record with the **largest buffered timestamp less than or equal to** the left event’s timestamp. Reversing the inequality changes the search direction.

### Syntax

```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] ASOF JOIN rhs_stream
ON lhs_stream.key = rhs_stream.key AND lhs_stream.<ts_col> >= rhs_stream.<ts_col>
SETTINGS keep_versions = <versions>;
```

The right-hand side (`rhs_stream`) is typically a **Timeplus stream** (usually [Mutable Stream](/mutable-stream) or [Versioned Key Value Stream](/versioned-stream)) or **external streaming source** (e.g. Kafka).

Timeplus maintains an indexed hash table with a sorted version list for the right-hand side, continuously updated as new data arrives. `keep_versions` limits the list to 3 versions per equality key by default.

The following diagram illustrates this behavior:

![DynamicEnrichmentJoinASOF](/img/dynamic-enrichment-join-asof.svg)

### Example

**Use Case: Currency Conversion**

Assume you have a live `orders` stream and a reference `fx_rates` stream that updates currency exchange rates over time. You want to convert each order into USD using the most recent exchange rate *as of the payment time*.

```sql
CREATE MUTABLE STREAM fx_rates
(
    currency string,
    rate_to_usd float64
)
PRIMARY KEY currency;
```

**Currency Conversion via ASOF JOIN**:
```sql
SELECT
    o.id,
    o.currency,
    o.price,
    r.rate_to_usd,
    o.price * r.rate_to_usd AS price_usd,
    o._tp_time AS order_time,
    r._tp_time AS rate_time
FROM 
    orders AS o
ASOF JOIN 
    fx_rates AS r
ON o.currency = r.currency AND o._tp_time >= r._tp_time
SETTINGS keep_versions = 10;
```

**Sample Events**:
```
-- Currency exchange rates (updated over time)
INSERT INTO fx_rates(currency, rate_to_usd, _tp_time) VALUES
('EUR', 1.05, '2025-01-01 00:00:00.000'),
('EUR', 1.08, '2025-01-01 00:10:00.000'),
('JPY', 0.0071, '2025-01-01 00:00:00.000');

-- Payments coming in
INSERT INTO orders(id, currency, price, amount, _tp_time) VALUES
('p1', 'EUR', 100.0, 1, '2025-01-01 00:05:00.000'),
('p2', 'EUR', 200.0, 1, '2025-01-01 00:12:00.000'),
('p3', 'JPY', 10000.0, 1, '2025-01-01 00:03:00.000');
```

**Output**:
```
┌─id─┬─currency─┬─price ─┬─rate_to_usd─┬─price_usd ─┬──────── order_time ─┬──────────rate_time─┐
│ p1 │ EUR      │  100.0 │        1.05 │      105.0 │ 2025-01-01 00:05:00 │ 2025-01-01 00:00:00 │
│ p2 │ EUR      │  200.0 │        1.08 │      216.0 │ 2025-01-01 00:12:00 │ 2025-01-01 00:10:00 │
│ p3 │ JPY      │ 10000.0│      0.0071 │       71.0 │ 2025-01-01 00:03:00 │ 2025-01-01 00:00:00 │
└────┴──────────┴────────┴──────────────┴────────────┴────────────────────┴────────────────────┘
```

**Explanation**
- When the query starts, Timeplus builds a **time-indexed hash table** for the right-hand side (`fx_rates`).
- Each incoming event from `orders` probes this structure to find the **latest** `fx_rate` **record with** `_tp_time` ≤ **the order timestamp**.
- The joined output reflects the **exchange rate “as of” that payment time**.
- As new rates arrive, the right-hand hash table is incrementally updated — ensuring all subsequent joins use the latest time-valid data. If the timestamp versions reach the limits of `10` for a join key, the older version timestamps will be discarded. 

**Notes**
- ASOF JOIN is ideal for slowly changing reference data such as:
    - Exchange rates
    - Stock prices
    - IoT calibration parameters
    - Configuration version histories
- To ensure performance, limit the retention on the right-hand side stream using `keep_versions` query setting.

## ALL JOIN

**ALL JOIN** enriches a live data stream by joining it with **all matching rows** from a **dynamic right-hand side dataset**. Unlike `LATEST JOIN`, which only uses the most recent value for the join key, `ALL JOIN` can match multiple rows. With a keyed right stream, the state keeps the current row per primary key, so a join key can match several distinct primary keys.

This join type is useful for use cases such as **audit trails, change history analysis**, or **multi-version correlation**, when you store each reference-data version under a distinct primary key.

### Syntax
```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] ALL JOIN rhs_stream
ON lhs_stream.col1 = rhs_stream.col1 AND ...;
```

For a left append stream, this enrichment pattern uses a change-aware right side such as a [Mutable Stream](/mutable-stream), [Versioned Key Value Stream](/versioned-stream), or [Changelog Key Value Stream](/changelog-stream). An `ALL JOIN` between two append-only streams is [bidirectional](/bidirectional-join#bidirectional-join-without-data-mutation).

The following diagram illustrates this behavior:

![DynamicEnrichmentJoinAll](/img/dynamic-enrichment-join-all.svg)

:::note
The buffered state grows with the number of retained right-side primary keys. A single left row can produce many output rows when its join key matches many of them.
:::

### Example

**Use Case: Customer Tier Tracking**

Suppose you want to analyze how customer orders relate to **membership tiers** that a customer has held over time.

You have two streams:

```sql
CREATE STREAM orders 
(
    id string,
    customer_id string,
    product_id string,
    price float64,
    currency string,
    amount uint32
);

CREATE MUTABLE STREAM customer_tiers (
    customer_id string,
    tier string,         -- e.g. "Silver", "Gold", "Platinum"
    effective_from datetime64(3)
)
PRIMARY KEY (customer_id, tier);
```

The `customer_tiers` stream stores one row per `(customer_id, tier)`. Over time, the same customer ID may have multiple entries. Writing the same pair again replaces its previous value.

Now, to enrich every order with **all retained tiers** for that customer:

```sql
SELECT
    o.id,
    o.customer_id,
    o.amount,
    c.tier,
    c.effective_from
FROM orders AS o
ALL JOIN customer_tiers AS c
ON o.customer_id = c.customer_id;
```

**Explanation**:
- Timeplus builds a dynamic hash table of `customer_tiers` with one row per primary key.
- Each incoming order joins with all rows matching its `customer_id`.
- This means one order may produce **multiple join results** — one for each distinct tier currently stored for that customer.
- To keep every tier transition, include a distinct value such as `effective_from` in the primary key.

:::note
Use [hybrid hash join](/query-settings#default_hash_join) to spill cold state to disk when retaining many keys.
:::
