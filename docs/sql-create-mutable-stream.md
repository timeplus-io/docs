# CREATE MUTABLE STREAM

Regular streams in Timeplus are immutable, and stored in columnar format. Mutable streams are stored in row format (implemented via RocksDB), and can be updated or deleted. It is only available in Timeplus Enterprise. Please check [this page](/mutable-stream) for details.


```sql
CREATE MUTABLE STREAM [IF NOT EXISTS] stream_name (
    <col1> <col_type> [DEFAULT|ALIAS expr1],
    <col2> <col_type> [DEFAULT|ALIAS expr2],
    <col3> <col_type> [DEFAULT|ALIAS expr3],
    <col4> <col_type> [DEFAULT|ALIAS expr4],
    INDEX <index1> (column_list) [UNIQUE] [STORING (stored_column_list)],
    FAMILY <family1> (col3,col4)
    )
PRIMARY KEY (col1, col2)
SETTINGS
    logstore_retention_bytes=..,
    logstore_retention_ms=..,
    shards=..,
    replication_factor=..
```

Only the `PRIMARY KEY` is required. `INDEX`, `FAMILY`, or the `SETTINGS` are optional.

## PRIMARY KEY
Primary key is required for a mutable stream. It can be a single column or a composite key. The primary key is used for efficient data lookups, range scans and updates.

Supported column types for primary key:
* integers (int8/16/32/64, uint8/16/32/64)
* floating point (float32, float64)
* date and datetime types (date, date32, datetime, datetime64)
* string and fixed_string
* enum8, enum16
* decimal32, decimal64
* bool
* ipv4, ipv6
* interval

## INDEX
You can add secondary indexes to a mutable stream. The index can be unique or non-unique. The index can be used for efficient lookups and range scans, for those columns not as the primary keys.

Syntax:
```sql
INDEX index_name (column_list) [UNIQUE] [STORING (stored_column_list)]
```

* `index_name`: Name of the secondary index
* `column_list`: Comma-separated list of columns to index
* `UNIQUE`: Optional, specifies if the index enforces uniqueness
* `STORING`: Optional, additional columns to store with the index

For example:
```sql
-- Stream with a simple secondary index
CREATE MUTABLE STREAM users
(
    id int32,
    email string,
    name string,
    INDEX idx_email (email)
) PRIMARY KEY id;

-- Stream with unique index and stored columns
CREATE MUTABLE STREAM orders
(
    order_id int32,
    user_id int32,
    status string,
    created_at datetime,
    INDEX idx_user (user_id) UNIQUE STORING (status, created_at)
) PRIMARY KEY order_id;

-- Multiple indexes
CREATE MUTABLE STREAM products
(
    product_id int32,
    category string,
    name string,
    price decimal64(2),
    INDEX idx_category (category) STORING (name),
    INDEX idx_price (price) UNIQUE
) PRIMARY KEY product_id;
```

## FAMILY
Column families in mutable streams provide a way to organize columns into groups for optimized storage and retrieval. Each column family is stored separately, allowing for better performance and more efficient data management.

Syntax
```sql
FAMILY family_name (column_list)
```

* `family_name`: Name of the column family
* `column_list`: Comma-separated list of columns to include in this family

For example:
```sql
-- Stream with explicit column families
CREATE MUTABLE STREAM user_profiles
(
    user_id int32,
    email string,
    name string,
    address string,
    preferences string,
    FAMILY basic_info (email, name),
    FAMILY extended_info (address, preferences)
) PRIMARY KEY user_id;

-- Stream with automatic column family grouping
CREATE MUTABLE STREAM products
(
    product_id int32,
    name string,
    price decimal64(2),
    description string
) PRIMARY KEY product_id
SETTINGS auto_cf=1;
```

Recommended practices:
* Put frequently accessed columns together in the same family.
* Use automatic column family grouping for optimal performance, by setting `auto_cf=true`. In this mode, the system automatically organizes columns into appropriate groups based on their data types and access patterns. This provides optimal performance without requiring manual column family configuration.
* Primary key columns are automatically managed by the system and do not need to be explicitly assigned to a family.
* Use column families to improve query performance when only certain columns need to be queried.

## SETTINGS
### Storage Settings
#### kvstore_codec
Type: string

Default: 'snappy'

Compression mode: "none", "lz4", "zstd", "snappy"

#### enable_hash_index
Type: bool

Default: false

Use RocksDB HashIndex for better point lookup performance

#### enable_statistics
Type: bool

Default: false

Enable RocksDB statistics collection

#### auto_cf
Type: bool

Default: false

Automatically group column families

### RocksDB Performance Settings
#### kvstore_options
Type: string

Default: '' (empty)

RocksDB options (key=value pairs separated by semicolons). Check more details at https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide

#### flush_rows
Type: uint64

Default: 100,000

Number of rows to trigger a flush

#### flush_ms
Type: int64

Default: 30,000

Time in milliseconds to trigger a flush

### Logstore Settings

#### logstore_retention_bytes
Type: int64

Default: -1

Maximum size of the logstore in bytes. -1 means no limit.

#### logstore_retention_ms
Type: int64

Default: -1

Maximum time to keep the logstore in milliseconds. -1 means no limit.

#### logstore_flush_messages
Type: int64

Default: 1,000

Messages to trigger a fsync

#### logstore_flush_ms
Type: int64

Default: 120,000

Time in milliseconds to trigger a fsync

#### fetch_max_bytes
Type: uint64

Default: 8,388,608

Maximum bytes to fetch in a single read

#### fetch_max_wait_ms
Type: int64

Default: 500

Maximum time to wait for a fetch

## More Examples
```sql
-- basic mutable stream
CREATE MUTABLE STREAM users
(
    user_id uint64,
    username string,
    email string,
    created_at datetime
)
PRIMARY KEY (user_id)
SETTINGS kvstore_codec='zstd', shards=4;

-- with RocksDB options
CREATE MUTABLE STREAM user_events
(
    user_id uint64,
    event_type string,
    event_time datetime,
    payload string,
    INDEX idx_event_type event_type TYPE minmax GRANULARITY 1
)
PRIMARY KEY (user_id, event_time)
SETTINGS shards=8, enable_hash_index=true, kvstore_options='write_buffer_size=67108864;max_write_buffer_number=3';

-- with logstore retention
CREATE MUTABLE STREAM logs
(
    timestamp datetime,
    level string,
    message string,
    INDEX idx_level level TYPE set(0) GRANULARITY 1
)
PRIMARY KEY (timestamp)
SETTINGS
    shards=2,
    logstore_retention_ms=604800000,  -- 7 days
    logstore_retention_bytes=1099511627776;  -- 1TB
```
