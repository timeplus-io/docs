# Indexes

Append Streams support both **primary** and **skipping** indexes to accelerate historical queries.

## Primary Index

The primary key of an Append Stream determines the physical order of rows in the historical columnar store. The **primary index** is automatically built on top of it. Primary index is parse in Append Stream. 

Choosing an effective primary key can greatly improve query performance, especially when `WHERE` predicates align with the primary index.

**Example**:

Take the **(counter_id, date)** sorting key as an example. In this case, the sorting and index can be illustrated as follows

```
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

If the data query specifies:

- **counter_id IN ('a', 'h')**, the server reads the data in the ranges of marks [0, 3) and [6, 8).
- **counter_id IN ('a', 'h') AND date = 3**, the server reads the data in the ranges of marks [1, 3) and [7, 8).
- **date = 3**, the server reads the data in the range of marks [1, 10].

The examples above show that it is always more effective to use an index than a full scan.

A sparse index allows extra data to be read. When reading a single range of the primary key, up to index_granularity * 2 extra rows in each data block can be read.

Sparse indexes allow you to work with a very large number of table rows, because in most cases, such indexes fit in the computer's RAM.

:::info
Once an Append Stream is created, its `sorting key` **cannot be changed**.
:::

## Skipping Indexes

You can create different skipping indexes on an Append Stream to accelerate queries when the primary key index alone is insufficient.

### Create Skipping Indexes

The index declaration is in the columns section of the `CREATE` query.

```sql
INDEX index_name <expr> TYPE type(...) [GRANULARITY granularity_value]
```

These indices aggregate some information about the specified expression on blocks, which consist of granularity_value granules (the size of the granule is specified using the `index_granularity` setting in the stream). Then these aggregates are used in the historical table queries for reducing the amount of data to read from the disk by skipping big blocks of data where the where query cannot be satisfied.

The `GRANULARITY` clause can be omitted, the default value of `granularity_value` is **1**.

```sql
CREATE STREAM test 
(
    u64 uint64,
    i32 int32,
    s string,
    ...
    INDEX idx1 u64 TYPE bloom_filter GRANULARITY 3,
    INDEX idx2 u64 * i32 TYPE minmax GRANULARITY 3,
    INDEX idx3 u64 * length(s) TYPE set(1000) GRANULARITY 4
) 
...
```

Indices from the example can be used by ClickHouse to reduce the amount of data to read from disk in the following queries:

```sql
SELECT count() FROM table(test) WHERE u64 == 10;
SELECT count() FROM table(test) WHERE u64 * i32 >= 1234;
SELECT count() FROM table(test) WHERE u64 * length(s) == 1234;
```

Data skipping indexes can also be created on composite columns:

```sql
-- on columns of type map:
INDEX map_key_index map_keys(map_column) TYPE bloom_filter
INDEX map_value_index map_values(map_column) TYPE bloom_filter

-- on columns of type tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- on columns of type nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```

### Skip Index Types

Append Streams support the following types of skip indexes.

- **minmax** index
- **set** index
- **bloom_filter** index
- **ngrambf_v1** index
- **tokenbf_v1** index


#### MinMax

For each index granule, the minimum and maximum values of an expression are stored. (If the expression is of type **tuple**, it stores the minimum and maximum for each tuple element.)

```sql
TYPE minmax
```

**Example:**

```sql
INDEX idx2 u64 TYPE minmax GRANULARITY 3
```

#### Set

For each index granule at most **max_rows** many unique values of the specified expression are stored. **max_rows = 0** means "store all unique values".

```sql
TYPE minmax(max_rows)
```

**Example:**
```sql
INDEX idx3 u64 TYPE set(1000) GRANULARITY 4
```

#### Bloom filter

For each index granule stores a bloom filter for the specified columns.

```sql
TYPE bloom_filter([false_positive_rate])
```

**Example:**
```sql
INDEX idx1 u64 TYPE bloom_filter GRANULARITY 3
```

The **`false_positive_rate`** parameter can take on a value between **0** and **1** (by default: **0.025**) and specifies the probability of generating a positive (which increases the amount of data to be read).

The following data types are supported:

- **`(u)int*`**
- **`float*`**
- **`enum`**
- **`date`**
- **`date_time`**
- **`string`**
- **`fixed_string`**
- **`array`**
- **`low_cardinality`**
- **`nullable`**
- **`uuid`**
- **`map`**


:::info
**`map`** data type: specifying index creation with keys or values
For the **`map`** data type, the client can specify if the index should be created for keys or for values using the **`map_keys`** or **`map_values`** functions.
:::


#### N-gram bloom filter

For each index granule stores a **bloom filter** for the **n-grams** of the specified columns.

```sql
TYPE ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

Paramters Explaination:
- **`n`**: ngram size
- **`size_of_bloom_filter_in_bytes`**: Bloom filter size in bytes. You can use a large value here, for example, 256 or 512, because it can be compressed well).
- **`number_of_hash_functions`**: The number of hash functions used in the bloom filter.
- **`random_seed`**: Seed for the bloom filter hash functions.

This index only works with the following data types:
- **`string`**
- **`fixed_string`**
- **`map`**

#### Token bloom filter

The token bloom filter is the same as ngrambf_v1, but stores tokens (sequences separated by non-alphanumeric characters) instead of ngrams.

```sql
TYPE tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```
