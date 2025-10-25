# Dynamic Enrichment Join

Similar to [Enrichement Join](/enrichment-join), **Dynamic Enrichment Join** enriches a live data stream with reference data from a changing right-hand side dataset. It is designed for scenarios where the right-hand side data evolves over time, and each event from the left stream should always join against the latest version of that data.

In this join type, events from the left-hand stream trigger the join. Each incoming event probes a dynamic hash table that is continuously updated from the right-hand side dataset (which typically changes at a slower rate).

Because of this behavior, only `LEFT` and `INNER` joins are supported.

There are several types of **Dynamic Enrichment Joins**.
1. `LATEST JOIN` - Joins **only the latest version** of the matching key on the right-hand side.  
2. `ASOF JOIN` - Joins the **closest match in time** on the right-hand side (useful for time-based lookups). 
3. `ALL JOIN` - Join **all versions** of the matching keys on the right-hand side.

## LATEST JOIN

**LATEST JOIN** enriches a live data stream using the **most recent version** of each key from a **dynamic right-hand side dataset**. It’s designed for use cases where the right-hand side data changes over time, but only the **latest state** of each key matters — such as **the most recent user profile, product info**, or **configuration snapshot**.

Timeplus keeps an in-memory hash table for the right-hand side, continuously updating it as new events arrive. Each event from the left stream probes this table to fetch the **latest available value** at that moment, ensuring always up-to-date joins with minimal overhead.

### Syntax

```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] LATEST JOIN rhs_stream 
ON lhs_stream.col1 = rhs_table.col1 AND ...;
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
- Subsequent `orders` events will then probe against the **latest version** of the `products` data, ensuring the join always reflects the most up-to-date information.

## ASOF JOIN 

**ASOF JOIN** enriches a live data stream with reference data based on **the closest** match in time on the right-hand side dataset. It is designed for time-aware enrichment use cases where the right-hand side dataset **(e.g., exchange rates, inventory prices, metrics**) evolves over time, and each incoming event from the left stream should use the **most recent valid version** from the right-hand side.

Unlike `LATEST JOIN` (which only keeps the latest version per key) or `ALL JOIN` (which retains all versions), `ASOF JOIN` maintains a time-sorted list for each key on the right-hand side and efficiently finds the record with the **largest timestamp less than or equal to** the left event’s timestamp.

### Syntax

```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] ASOF JOIN rhs_stream
ON lhs_stream.key = rhs_stream.key AND lhs_stream.<ts_col> >= rhs_stream.<ts_col>;
SETTINGS keep_versions = <versions>;
```

The right-hand side (`rhs_stream`) is typically a **Timeplus stream** (usually [Mutable Stream](/mutable-stream) or [Versioned Key Value Stream](/versioned-stream)) or **external streaming source** (e.g. Kafka).

Timeplus maintains a indexed hash table with a sorted version list for the right-hand side, continuously updated as new data arrives.

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
ON o.currency = o.currency AND o._tp_time >= r._tp_time;
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

**ALL JOIN** enriches a live data stream by joining it with **all historical versions** of matching keys from a **dynamic right-hand side dataset**. Unlike `LATEST JOIN`, which only uses the most recent value, `ALL JOIN` keeps every version of the right-hand side data in memory, allowing the left stream to match against **multiple key versions** over time.

This join type is useful for use cases such as **audit trails, change history analysis**, or **multi-version correlation**, where you need visibility into how reference data evolved — not just its current state.

### Syntax
```sql
SELECT 
    *
FROM 
    lhs_stream [LEFT | INNER] JOIN rhs_stream 
ON lhs_stream.col1 = rhs_table.col1 AND ...;
```

The right-hand side (`rhs_stream`) can be a native **Timeplus stream** (usually [Mutable Stream](/mutable-stream) or [Versioned Key Value Stream](/versioned-stream)) or an **external streaming source** (e.g., Kafka). As new events flow into the right-hand side stream, the join maintains a **dynamic hash table** that is continuously updated — keeping **all historical versions** of the join keys for lookup.

The following diagram illustrates this behavior:

![DynamicEnrichmentJoinAll](/img/dynamic-enrichment-join-all.svg)

:::note
`ALL JOIN` should only be used when the number of key versions on the right-hand side is limited. If too many versions accumulate, the in-memory hash table may grow uncontrollably and lead to excessive memory usage.
:::

### Example

**Use Case: Customer Tier History Tracking**

Suppose you want to analyze how customer orders relate to **historical membership tiers** — for example, when a customer’s discount level changed over time.

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

The `customer_tiers` stream records every change in a customer’s tier. Over time, the same customer ID may have multiple entries.

Now, to enrich every order with **all versions** of the customer tier data:

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
- Timeplus builds a dynamic hash table of `customer_tiers`, keeping **all versions** per `customer_id`.
- Each incoming order probes the hash table and **joins with every version** of the customer’s tier record.
- This means one order may produce **multiple join results** — one for each historical tier.
- It’s ideal for analyzing **how business metrics relate to reference data changes** (e.g., how sales patterns differ across historical tier transitions).

:::note
Since `ALL JOIN` retains all key versions in memory, it’s best suited for datasets where key versioning is limited — otherwise memory usage can grow significantly.
:::
