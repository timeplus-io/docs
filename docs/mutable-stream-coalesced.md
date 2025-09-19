# Coalesced Mutable Stream

**Coalesced Mutable Stream** is designed for the use case where **different clients collectively update (upsert) partial columns** of a wide row. Users always see the **latest merged view** of a row across all columns when performing historical queries.

Coalescing relies on **column families**, where columns are grouped together. Each column family can be upserted independently using the primary key. Internally, every column family is stored as a separate key–value pair, making independent updates both fast and efficient.

 All columns must be grouped into families for correct upsert behavior (columns not in a family won't get updated).

## Enable Coalescing

To enable coalescing, set `coalesced=true` in the stream settings.

**Example**:

```sql
CREATE MUTABLE STREAM coalesced
(
    p string,
    m1 int,
    m2 int,
    m3 int,
    m4 int,
    FAMILY cf1(m1, m2),
    FAMILY cf2(m3, m4),
    FAMILY cf_ts(_tp_time)
)
PRIMARY KEY p
SETTINGS
    coalesced = true;
```

```sql
-- Upsert columns (m1, m2) and _tp_time (cf1 + cf_ts)
INSERT INTO coalesced(p, m1, m2, _tp_time) VALUES ('p', 1, 11, '2025-01-01 00:00:00');

-- Output: p, 1, 11, 0, 0, 2025-01-01 00:00:00.000
-- m3, m4 are not updated yet → default values
SELECT p, m1, m2, m3, m4, _tp_time FROM table(coalesced) WHERE p = 'p';
```

```sql
-- Upsert columns (m3, m4) and _tp_time (cf2 + cf_ts)
INSERT INTO coalesced(p, m3, m4, _tp_time) VALUES ('p', 2, 22, '2025-01-01 00:00:01');

-- Output: p, 1, 11, 2, 22, 2025-01-01 00:00:01.000
-- m3, m4 are updated → merged with previous upsert
SELECT p, m1, m2, m3, m4, _tp_time FROM table(coalesced) WHERE p = 'p';
```

```sql
-- Upsert columns (m3, m4) again
INSERT INTO coalesced(p, m3, m4, _tp_time) VALUES ('p', 4, 44, '2025-01-01 00:00:02');

-- Output: p, 1, 11, 4, 44, 2025-01-01 00:00:02.000
-- m3, m4 overwrite prior values → coalesced into row
SELECT p, m1, m2, m3, m4, _tp_time FROM table(coalesced) WHERE p = 'p';
```

```sql
-- Upsert columns (m1, m2) again
INSERT INTO coalesced(p, m1, m2, _tp_time) VALUES ('p', 3, 33, '2025-01-01 00:00:03');

-- Output: p, 3, 33, 4, 44, 2025-01-01 00:00:02.000
-- m1, m2 updated; m3, m4 remain unchanged
SELECT p, m1, m2, m3, m4, _tp_time FROM table(coalesced) WHERE p = 'p';
```

:::info
Upserts are applied at the column family level. If only a subset of columns in a family is provided, the upsert will be discarded silently.

Example:

-- This insert is discarded because m2 (part of cf1) is missing

INSERT INTO coalesced(p, m1, _tp_time) VALUES ('p', 5, '2025-01-01 00:00:04');
:::

## Streaming Queries

**Coalesced Mutable Stream** is primarily designed for historical queries, providing the latest view of a wide row when its columns are updated collectively.

Streaming queries on a coalesced mutable stream are generally not recommended, as they often will not produce the expected results.
