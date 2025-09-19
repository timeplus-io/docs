# Versioned Mutable Stream

**Versioned Mutable Stream** handles **out-of-order upsert scenarios** where users want to always keep the **latest version** of a primary key.

## Enable Versioning

To enable key versioning, specify a `version_column` in the stream settings.

- The row with a **larger version** always overrides a row with a **smaller version**, regardless of insert order.
- When there is a **version tie** (same version), behavior can be tuned with `late_insert_overrides`:
  - `true` (default): honor the late insert (latest row wins).
  - `false`: honor the earliest insert (first row wins).

**Example**:

```sql
CREATE MUTABLE STREAM versioned
(
    p string,
    i int,
    v uint64
)
SETTINGS
    version_column='v',
    late_insert_overrides=false;
```

```sql
-- Version 10
INSERT INTO versioned(p, i, v) VALUES ('p', 1, 10);

-- Version 9 → discarded
INSERT INTO versioned(p, i, v) VALUES ('p', 2, 9);

-- Outputs: p, 1, 10
SELECT p, i, v FROM table(versioned) WHERE p = 'p';
```

```sql
-- Version 11 overrides version 10
INSERT INTO versioned(p, i, v) VALUES ('p', 3, 11);

-- Outputs: p, 3, 11
SELECT p, i, v FROM table(versioned) WHERE p = 'p';
```

```sql
-- Version tie (11). Since late_insert_overrides=false → discarded
INSERT INTO versioned(p, i, v) VALUES ('p', 4, 11);

-- Outputs: p, 3, 11
SELECT p, i, v FROM table(versioned) WHERE p = 'p';
```

```sql
-- Version tie (12). The second row is discarded
INSERT INTO versioned(p, i, v) VALUES ('p', 5, 12),('p', 6, 12);

-- Outputs: p, 5, 12
SELECT p, i, v FROM table(versioned) WHERE p = 'p';
```

## Streaming Queries

When running streaming queries (e.g., aggregations) against a versioned mutable stream, versioning rules are applied automatically.

**Example**:

For streaming aggregation,

```sql
SELECT p, max(i)
FROM versioned
GROUP BY p
EMIT ON UPDATE;
```

For the inserts above:
```sql
-- Version 10
INSERT INTO versioned(p, i, v) VALUES ('p', 1, 10);

-- Streaming aggregation output: `p, 1`
```

```sql
-- Version 9, will be discarded
INSERT INTO versioned(p, i, v) VALUES ('p', 2, 9);

-- Streaming aggregation doens't have updates
```

```sql
-- Version 11, overrides version 10
INSERT INTO versioned(p, i, v) VALUES ('p', 3, 11);

-- Streaming aggregation output: `p, 3`
```

```sql
-- Version 11, version tie. Since `late_insert_overrides=false`, this row will be discarded.
INSERT INTO versioned(p, i, v) VALUES ('p', 4, 11);

-- Streaming aggregation doesn't have updates
```

```sql
-- Version tie. The second row will be discarded because `late_insert_overrides=false`
INSERT INTO versioned(p, i, v) VALUES ('p', 5, 12),('p', 6, 12);

-- Streaming aggregation output: `p, 5`
```
