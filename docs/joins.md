# Multi-JOINs and ASOF JOINs

JOIN is a key feature in Timeplus to combine data from different sources and freshness into a new stream.

## Introduction
Please refer to https://en.wikipedia.org/wiki/Join_(SQL) for general introduction.

### Join Types

#### INNER JOIN (default) {#inner-join}
`INNER JOIN` is the most common JOIN to return data have matching values in both side of the JOIN.
This is also the default behaviour if you just use JOIN.
<img src='https://dataschool.com/assets/images/how-to-teach-people-sql/sqlJoins/sqlJoins_3.png'/>

(Credit: https://dataschool.com/how-to-teach-people-sql/sql-join-types-explained-visually/)

#### LEFT JOIN
`LEFT JOIN` returns all rows from the left stream with matching rows in the right table. Some columns can be NULL when there is no match.
<img src='https://dataschool.com/assets/images/how-to-teach-people-sql/sqlJoins/sqlJoins_4.png'/>

(Credit: https://dataschool.com/how-to-teach-people-sql/sql-join-types-explained-visually/)

#### FULL/OUTER JOIN
`OUTER JOIN` combines the columns and rows from all tables and includes NULL when there is no match.

<img src='https://dataschool.com/assets/images/how-to-teach-people-sql/sqlJoins/sqlJoins_2.png'/>
(Credit: https://dataschool.com/how-to-teach-people-sql/sql-join-types-explained-visually/)

#### Not Supported: RIGHT or CROSS
Other types of JOINS are not supported in the current version of Timeplus. If you have good use cases for them, please contact us at support@timeplus.com.
1. RIGHT
2. CROSS

### Join Strictnesses

#### ALL JOIN (default) {#all-join}
One row from the left side of the JOIN could result in several join results if the right side table keeps multiple values for the same key.

#### ASOF JOIN
`ASOF JOIN` has an additional unequal join expression. This can work well if two streams have the same id, but not with exactly the same timestamps.

It first tries to find a match on the regular join keys, and then finds the closest match on the unequal join expression since we can keep multiple versions of value for each key in the right hash table. In ASOF JOIN, at most there will be one joined row for a row from the left stream.

#### LATEST JOIN
Only the latest key/value pairs of the right table will be joined with the left table.

## Data to be Joined

All the streams and tables in Timeplus can be JOINed.

### Append Streams
This is the default storage type for streams. It is optimized for fast ingestion and low latency.

```sql
CREATE STREAM append(i int, k string) SETTINGS mode='append';
--or just
CREATE STREAM append(i int, k string);
```

#### External Streams
External Streams, such as Kafka, are treated as append streams during the JOIN operation.

### Mutable Streams

[Mutable Stream](/mutable-stream) is only available in Timeplus Enterprise, with primary key(s) and row-based storage for fast updates. In Timeplus Proton, the following 2 types of streams provide similar changelog semantics:

#### Versioned Streams
[Versioned Stream](/versioned-stream) with primary key(s) and multiple versions

#### Changelog Streams
[Changelog Stream](/changelog-stream) with primary key(s) and CDC semantic (data can be removed, or updated with old&new value). You can also use the [changelog()](/functions_for_streaming#changelog) function to convert an append-only stream to changelog stream.


### Static Tables
The following types of Timeplus resources won't be changed during the JOIN operation:

#### table(stream)
If you call the table() function for a stream, the historical data of the stream will be available in the JOIN, but won't be changed.

#### External Table
External tables, such as MySQL, are treated as static data during the JOIN.

### Dictionary
Dictionaries are locally-cached data, aiming to provide fast lookup for dimension tables. You can set a LIFETIME to control the cache expiration time. If the value of the dictionary is changed during the JOIN, new value will be used.

## JOIN Category

At the high level, the JOIN syntax is

```sql
SELECT <column list>
FROM <left-stream>
[join_type] [join_strictness] JOIN <right-stream>
ON <on-clause>
[WHERE .. GROUP BY .. HAVING ... ORDER BY ...]
```

By default, the strictness is `ALL` and the join kind is `INNER`.

Since Timeplus supports many types of streams, join types, and join strictness, these factors can lead to different JOIN behaviors, with hundreds of combinations. Not all of them are meaningful or performant.  Please read on for the supported combinations.

We can categorize them into the following categories:

- **Bidirectional JOIN**: Left and right streams are unbounded and new data on either side of the JOIN will be matched in real-time. Self-join is a special case.
- **Range Bidirectional JOIN**: Similar to Bidirectional JOIN, but with a time range constraint.
- **Dynamic Enrichment JOIN**: Enrich streaming data by connecting to a relative static dimension table.

### Bidirectional JOIN

Bidirectional join needs to buffer all data for the left stream and right stream and build hash tables for both of them. Whenever there are new or updated rows appearing on either side, the other side’s hash table is probed to see if a join can be matched.

#### Append JOIN Append{#append-join-append}

This may look like the most easy-to-understand scenario. You can try this type of join if you have 2 streams with incoming new data.

However, this is designed to be exploration purpose only, not recommended to for production use. Because both sides of the data streams are unbounded, it will consume more and more resources in the system. Internally there is a setting (`join_max_buffered_bytes`) to control the maximum source data it can buffer. Once the query reaches the limit, the streaming query will be aborted.

Example:

```sql
SELECT * FROM
left_append JOIN right_append
ON left_append.k = right_append.kk
```

#### Mutable JOIN Mutable{#mutable-join-mutable}

Both [Mutable Streams](/mutable-stream) and [Versioned Streams](/versioned-stream) can be joined together. This is production ready. We also provide [Changelog Streams](/changelog-stream) joining Changelog Stream as an experimental feature.

Examples:
```sql
SELECT k, count(*), min(i), max(i), avg(i), min(ii), max(ii), avg(ii)
FROM left_vk JOIN right_vk
ON left_vk.k = right_vk.kk
```

#### Self Join

You can also join a stream to itself. A typical use case is to check whether there is a certain pattern for the data in the same stream, for example, whether for the same credit card, within 2 minutes, there is a big purchase after a small purchase. This could be a pattern for fraud.

```sql
SELECT .. FROM stream1
INNER JOIN stream1 AS stream2
ON stream1.id=stream2.id AND date_diff_within(1m)
WHERE ..
```


### Range Bidirectional JOIN{#range-join}

#### Append JOIN Append (within time range) {#append-range-join}

The above the bidirectional JOIN may buffer too much data, range bidirectional join tries to mitigate this problem by bucketing the stream data in time ranges and try to join the data bidirectionally in appropriate range buckets. This allows for more efficient processing and reduces the amount of data that needs to be buffered.

It's common to use the [date_diff_within](/functions_for_streaming#date_diff_within) function in the join condition:

```sql
SELECT * FROM left_stream JOIN right_stream
ON left_stream.key = right_stream.key AND date_diff_within(2m)
```

`date_diff_within` function by default uses the `_tp_time` column on both side of the streams to compare the time difference. You can also explicitly specify the columns to use:

```sql
SELECT * FROM left_stream JOIN right_stream
ON left_stream.key = right_stream.key
AND date_diff_within(left_stream.col1, right_stream.col2, 2m)
```

Actually we don’t even require a timestamp for the range, any integral columns are supposed to work. For instance, `AND left_stream.sequence_number < rightstream.sequence_number + 10`.

### Dynamic Enrichment JOIN

There are typical cases that an unbounded data stream needs enrichment by connecting to a relatively static dimension table. Timeplus can do this in one single engine by storing streaming data and dimension tables in it, as well as accessing to external database or file systems.

#### Append JOIN Static

Examples:

```sql
SELECT device, vendor, cpu_usage, timestamp
FROM device_utils
INNER JOIN table(device_products_info) AS dim
ON device_utils.product_id = dim.id
```

In the above example, data from `device_utils` is a stream and data from `device_products_info` is historical data since it is wrapped with `table()` function. For every (new) row from `device_utils`, it is continuously joined with rows from dimension table `device_products_info` and enriches the streaming data with product vendor information.

#### Mutable JOIN Static
You can also put mutable streams, versioned stream or changelog stream on the left side of the join.

#### Static JOIN Static
You can put static tables or external tables on the both side of the join. This will be identical to the common OLAP databases.

#### Append JOIN Mutable
The right side can be a mutable stream, versioned stream or changelog stream.

```sql
CREATE STREAM append(i int, k string);
CREATE STREAM versioned_kv(j int, k string, kk string) PRIMARY KEY (k, kk) SETTINGS mode='versioned_kv';

SELECT * FROM append JOIN versioned_kv USING(k);

INSERT INTO versioned_kv(j, k, kk) VALUES (1, 'a', 'aa'), (2, 'a', 'bb');
INSERT INTO append(i, k) VALUES (11, 'a');
```

Timeplus won't buffer the left stream at all, and keep all versions for the join key for the right stream.

#### Direct JOIN
Direct join is used when the right side is from an external source (ClickHouse for example). It does not require loading all the content into memory; but just the required data to complete the join.

Please note that direct join is not a SQL keyword. You enable this by adding `SETTINGS join_algorithm = 'direct'` in the streaming SQL.

##### Direct JOIN with Dictionary
Direct JOIN looks up the dictionary with the exact join key value and gets the matched rows for join. If some of the keys are not found in dictionary layout (storage) or their TTL is expired, Dictionary will initiate requests to remote source and update the layout content.

Example of an append stream joining with a dictionary from a MySQL table:
```sql
CREATE STREAM orders(id string, product_id string, quantity uint32);

CREATE DICTIONARY mysql_dict(id string, name string)
  	PRIMARY KEY id
  	SOURCE(MYSQL(DB 'testdb' TABLE 'products' HOST 'mysql' PORT 3306 USER 'root' PASSWORD 'rootpassword' BG_RECONNECT true))
  	LAYOUT(HYBRID_HASH_CACHE(TTL 3600 PATH 'test_dict_cache' max_hot_key_count 1000));

SELECT * except (_tp_time) FROM orders JOIN mysql_dict AS products
ON orders.product_id = products.id
SETTINGS join_algorithm = 'direct';
```

Example of an append stream joining with a dictionary from a ClickHouse table, and using mutable stream as the cache:
```sql
CREATE STREAM orders(id string, product_id string, quantity uint32);

CREATE MUTABLE STREAM tp_mutable_cache(id string, name string) PRIMARY KEY id;
CREATE DICTIONARY tp_products_dict_mutable(id string, name string)
  	PRIMARY KEY id
  	SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' PASSWORD '' DB 'test_db' TABLE 'test_table'))
  	LAYOUT(MUTABLE_CACHE(DB 'default' STREAM 'tp_mutable_cache' UPDATE_FROM_SOURCE true));

SELECT * except (_tp_time) FROM orders JOIN tp_products_dict_mutable AS products ON orders.product_id = products.id
SETTINGS join_algorithm = 'direct';
```

##### Direct JOIN with Mutable Stream
You can also use direct join with a mutable stream (not versioned stream or changelog stream). The JOIN can be based on the primary key or secondary index.

Example:
```sql
CREATE MUTABLE STREAM test_right
(
	k1 uint32,
	k2 string,
	v1 uint32,
	v2 string,
	v3 string,
	index idx1 (v2),
	index idx2 (v1, v2) storing (v3)
)
PRIMARY KEY (k1, k2);

-- join by primary key
SELECT * FROM test_left LEFT JOIN test_right ON test_left.k1 = test_right.k1 AND test_left.k2 = test_right.k2
SETTINGS join_algorithm = 'direct';

-- join by primary key range
SELECT * FROM test_left LEFT JOIN test_right ON test_left.k1 = test_right.k1
SETTINGS join_algorithm = 'direct';

-- join by second index
SELECT * FROM test_left LEFT JOIN test_right ON test_left.v = test_right.v1
SETTINGS join_algorithm = 'direct';
```
#### Append ASOF JOIN Append

ASOF enrichment join keeps multiple versions(by default 3 versions) of values for the same join key in the hash table and the values are sorted by ASOF unequal join key. This can be customized by setting the `keep_versions`.

#### Append ASOF JOIN Mutable
Example:
```sql
CREATE STREAM append(i int, k string);
CREATE STREAM versioned_kv(j int, k string, kk string) PRIMARY KEY (k, kk) SETTINGS mode='versioned_kv';

SELECT * FROM append ASOF JOIN versioned_kv
ON append.k = versioned_kv.k AND append.i <= versioned_kv.j
SETTINGS keep_versions = 5;

INSERT INTO versioned_kv(j, k, kk) VALUES (100, 'a', 'bb'), (101, 'a', 'cc'), (102, 'a', 'dd'), (103, 'a', 'ee');
INSERT INTO append(i, k) VALUES (99, 'a');
```

#### Append LETEST JOIN Append

Similar to `ALL JOIN` above, but we only keep the latest version of value for each join key.

The right side of the `LATEST JOIN` can be an append stream or mutable stream(including versioned stream).

#### Append LETEST JOIN Mutable

```sql
CREATE STREAM append(i int, k string);
CREATE STREAM versioned_kv(j int, k string, kk string) PRIMARY KEY (k, kk) SETTINGS mode='versioned_kv';

SELECT * FROM append ASOF LATEST JOIN versioned_kv
ON append.k = versioned_kv.k

INSERT INTO versioned_kv(j, k, kk) VALUES (100, 'a', 'bb'), (101, 'a', 'cc'), (102, 'a', 'dd'), (103, 'a', 'ee');
INSERT INTO append(i, k) VALUES (99, 'a');
```

## Contact us for help or more features
JOIN in streaming processing / analytics could be more complex than traditional database join regarding their semantics. Feel free to reach out to us for help or more features. Join our community slack at https://timeplus.com/slack to discuss more.
