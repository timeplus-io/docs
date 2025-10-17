# TTL

TTL for Mutable Streams works differently from [Append Stream](/append-stream-ttl) because data is row-encoded.

Mutable Streams evaluate the timestamp of each row in the historical store asynchronously during background data merge or compaction of the key space. Expired rows are automatically garbage-collected when their TTL elapses.

:::info
A Mutable Stream created without a TTL cannot be altered later to support TTL, and similarly, a stream with TTL cannot have TTL removed.
:::

## Retention Based on Wall Clock

In this mode, you specify the storage setting `ttl_seconds` with a non-zero value.

When a row is inserted, the system automatically assigns a **wall-clock timestamp** to it.
If a row has not been updated for longer than `ttl_seconds`, it becomes **eligible for garbage collection** during background compaction.

### Syntax

```sql
CREATE MUTABLE STREAM ...
SETTINGS
    ttl_seconds=<ttl_seconds>, ...
```

### Example

```sql
CREATE MUTABLE STREAM ttl_cached(
    id string,
    name string,
    price string,
    description string,
    event_time datetime
)
PRIMARY key id
SETTINGS
    ttl_seconds = 3600;
```

In this example, each row is assigned a **TTL of 1 hour** (3600 seconds).
If a row is not updated within that time window, it will be **automatically removed** during the next background compaction.

## Retention Based on Event Timestamp

In this mode, you must specify both the storage settings `ttl_seconds` (a non-zero value) and `ttl_column`.

The specified **TTL column** represents the event timestamp of each row. During background compaction, the system evaluates this column to determine whether the row has expired and should be garbage-collected.

### Syntax

```sql
CREATE MUTABLE STREAM ...
SETTINGS
    ttl_seconds=<ttl_seconds>,
    ttl_column=<ttl_column>, ...
```

### Example

```sql
CREATE MUTABLE STREAM event_ttl_cached(
    id string,
    name string,
    price string,
    description string,
    event_time datetime
)
PRIMARY key id
SETTINGS
    ttl_seconds = 3600,
    ttl_column = 'event_time';
```

In this example, the stream is configured with a **TTL of 1 hour**.
If `now() - event_time >= 3600`, the row is considered **expired** and will be **garbage-collected** during background compaction.

## Controlling TTL Frequency

TTL evaluation occurs during background **merge** or **compaction** operations.
You can control how frequently these compactions run by setting `periodic_compaction_seconds` in `kvstore_options`.

**Example:**

```
CREATE MUTABLE STREAM ...
SETTINGS
    ttl_seconds = <ttl_seconds>,
    ttl_column = <ttl_column>,
    kvstore_options = 'periodic_compaction_seconds=1800;';
```

In this example, the storage engine is configured to trigger periodic compaction every **30 minutes** (1800 seconds), which indirectly determines how often expired rows are cleaned up.

## Manually Triggering Compaction

Expired data is removed only during background compaction.
If you want to accelerate TTL cleanup, you can manually trigger compaction using the `OPTIMIZE` command.

```sql
OPTIMIZE STREAM <db.stream-name>;
```

This command initiates an immediate, unscheduled merge or compaction for the specified stream, helping reclaim space and remove expired rows sooner.
