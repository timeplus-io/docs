# CREATE DICTIONARY
Starting from [Timeplus Enterprise 2.7](/enterprise-v2.7), you can create dictionaries to store key-value pairs in memory, with data from various sources, such as files, MySQL/ClickHouse databases, or streams in Timeplus.

When you create a dictionary in a cluster, the dictionary is automatically replicated to all the nodes in the cluster.

## Syntax
You can create a dictionary with the following SQL:

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name(
    key1 type1  [DEFAULT|EXPRESSION expr1],
    key2 type2  [DEFAULT|EXPRESSION expr2],
    attr1 type2 [DEFAULT|EXPRESSION expr3],
    attr2 type2 [DEFAULT|EXPRESSION expr4])
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

### PRIMARY KEY
The `PRIMARY KEY` clause specifies the key columns of the dictionary. You can specify multiple columns as the primary key.

### SOURCE

The source for a dictionary can be a:
* stream in the current Timeplus service
* stream in a remote Timeplus service
* file available by HTTP(S)
* another database, such as MySQL or PostgreSQL

#### Local Timeplus Stream {#source_local_stream}
You can create a dictionary from a stream in the current Timeplus service. [Mutable streams](/mutable-stream) are recommended for dictionary sources, as they can be updated in real-time.

Syntax:
```sql
SOURCE(TIMEPLUS(STREAM 'stream_name' USER 'user' PASSWORD 'password'))
```

Note:
* You need specify either `STREAM` or `QUERY`. A sample `QUERY` is: `SELECT key_column, second_column, third_column FROM table(stream1)`
* The `USER` and `PASSWORD` are optional. If you don't specify them, Timeplus will use the `default` user and empty password, which only works if you have set up the default user in the Timeplus configuration file. You can also use the `current_user()` function to get the current user.

Please check the example in the [Create an ip_trie dictionary from a Timeplus stream](#create_dictionary_ip_trie) section.

#### Remote Timeplus Stream {#source_remote_stream}
Similar to the local stream, you can create a dictionary from a stream in a remote Timeplus service.

Syntax:
```sql
SOURCE(TIMEPLUS(HOST 'remotehost' PORT tcp_port() STREAM 'stream_name' USER 'user' PASSWORD 'password'))
```

#### ClickHouse Table {#source_clickhouse}
You can create a dictionary from a table in a remote ClickHouse service.

Syntax:
```sql
SOURCE(CLICKHOUSE(HOST 'remotehost' PORT 9000 SECURE 0|1 USER 'user' PASSWORD 'password' TABLE 'table_name' DB 'database_name' ))
```

Either one of the `TABLE` or `QUERY` fields must be declared.

#### MySQL Table {#source_mysql}
You can create a dictionary from a table in a remote MySQL database.

Syntax:
```sql
SOURCE(MYSQL(HOST 'remotehost' PORT 3306 USER 'user' PASSWORD 'password' TABLE 'table_name' DB 'database_name' ))
```

Note:
* Either one of the `TABLE` or `QUERY` fields must be declared.
* You can optionally specify `BG_RECONNECT true` to enable background reconnection to MySQL.

Please check the example in the [Create a dictionary from a MySQL table](#create_dictionary_mysql) section. You can optionally setup a mutable stream as the cache for the MySQL table, please check the [Create a dictionary from a MySQL table with a mutable stream as the cache](#create_dictionary_mutable_cache) section.

#### Remote File {#source_http}
You can create a dictionary from a file available by HTTP(S).

Syntax:
```sql
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
```

Please check the example in the [Create a dictionary from a CSV file](#create_dictionary_csv) section.

#### Local File {#source_local_file}
You can create a dictionary from a local file.

Syntax:
```sql
SOURCE(FILE(path '/var/lib/timeplusd/user_files/dict.tsv' format 'CSV'))
```

Please note the file path needs to be located in the `user_files` directory to prevent unauthorized access to the file system. Make sure each node in the cluster has the same file in the same location.

#### Local Executable {#source_local_executable}
You can create a dictionary from a local executable.

Syntax:
```sql
SOURCE(EXECUTABLE(command '/var/lib/timeplusd/user_files/dict.sh' format 'TabSeparated'))
```

The executable should output data in the format of the specified format, in this case, TabSeparated. The executable should be located in the `user_files` directory.
```bash
#!/bin/bash
echo -e "1\tp111"
echo -e "2\tp222"
echo -e "3\tp333"
```

#### Executable Pool {#source_executable_pool}
Executable pool allows loading data from pool of processes. This source does not work with dictionary layouts that need to load all data from source. Executable pool works if the dictionary is stored using cache, complex_key_cache, ssd_cache, complex_key_ssd_cache, direct, or complex_key_direct layouts.

```sql
SOURCE(EXECUTABLE_POOL(command '/var/lib/timeplusd/user_files/dict.sh' format 'TabSeparated'))
```

### LAYOUT
The `LAYOUT` clause specifies how the dictionary data is stored in memory. The available layout options are listed below. Please note the layout options and their settings are case-insensitive.

#### FLAT
The `FLAT` layout stores the dictionary data in a flat array. This layout provides the best performance, with the drawback of higher memory usage.

The default `INITIAL_ARRAY_SIZE` is 1,024 and default `MAX_ARRAY_SIZE` is 500,000.

```sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```

#### HASHED
The `HASHED` layout stores the dictionary data in a hash table. This layout provides better memory usage than the `FLAT` layout, with slightly lower performance. The dictionary can contain any number of elements with any identifiers.

```sql
-- default values
LAYOUT(HASHED())

-- custom values
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

#### SPARSE_HASHED
The `SPARSE_HASHED` layout is similar to the `HASHED` layout, but it is optimized for sparse data. It uses less memory than the `HASHED` layout.

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

#### COMPLEX_KEY_HASHED
The `COMPLEX_KEY_HASHED` layout is similar to the `HASHED` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

#### COMPLEX_KEY_SPARSE_HASHED
The `COMPLEX_KEY_SPARSE_HASHED` layout is similar to the `SPARSE_HASHED` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

#### HASHED_ARRAY
The `HASHED_ARRAY` layout stores the dictionary data in memory. Each attribute is stored in an array. The key attribute is stored in the form of a hashed table where value is an index in the attributes array. The dictionary can contain any number of elements with any identifiers.

```sql
-- default values
LAYOUT(HASHED_ARRAY())

-- custom values
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

#### COMPLEX_KEY_HASHED_ARRAY
The `COMPLEX_KEY_HASHED_ARRAY` layout is similar to the `HASHED_ARRAY` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

#### RANGE_HASHED
The dictionary is stored in memory in the form of a hash table with an ordered array of ranges and their corresponding values.

```sql
LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

#### COMPLEX_KEY_RANGE_HASHED
The `COMPLEX_KEY_RANGE_HASHED` layout is similar to the `RANGE_HASHED` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_RANGE_HASHED())
RANGE(MIN StartDate MAX EndDate);
```

#### CACHE
The `CACHE` layout is stored in a cache that has a fixed number of cells. These cells contain frequently used elements.

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

#### COMPLEX_KEY_CACHE
The `COMPLEX_KEY_CACHE` layout is similar to the `CACHE` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_CACHE(SIZE_IN_CELLS 1000000000 ALLOW_READ_EXPIRED_KEYS 1 MAX_UPDATE_QUEUE_SIZE 100000 UPDATE_QUEUE_PUSH_TIMEOUT_MILLISECONDS 100 QUERY_WAIT_TIMEOUT_MILLISECONDS 60000 MAX_THREADS_FOR_UPDATES 4));
```

#### SSD_CACHE
The `SSD_CACHE` layout is similar to the `CACHE` layout, but it is optimized for SSD storage.

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/timeplusd/user_files/test_dict'))
```

#### COMPLEX_KEY_SSD_CACHE
The `COMPLEX_KEY_SSD_CACHE` layout is similar to the `SSD_CACHE` layout, but it is optimized for SSD storage.

```sql
LAYOUT(COMPLEX_KEY_SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 1073741824 READ_BUFFER_SIZE 131072 WRITE_BUFFER_SIZE 1048576 PATH '/var/lib/timeplusd/user_files/products_dict'));
```

#### MUTABLE_CACHE
The `MUTABLE_CACHE` layout is used to cache frequently accessed keys in a mutable stream. The dictionary will first look up the keys in the mutable stream, and if not found, it will fetch the data from the source.

Syntax:
```sql
LAYOUT(MUTABLE_CACHE(DB 'default' STREAM 'mysql_mutable_cache' UPDATE_FROM_SOURCE false|true));
```

The default value for `UPDATE_FROM_SOURCE` is `false`. If set to `true`, when there is a lookup miss, the dictionary will update the mutable stream with the data from the source. If set to `false`, the dictionary will only fetch the data from the source without updating the mutable stream.

#### COMPLEX_KEY_MUTABLE_CACHE
The `COMPLEX_KEY_MUTABLE_CACHE` layout is similar to the `MUTABLE_CACHE` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_MUTABLE_CACHE(DB 'default' STREAM 'mutable_stream' UPDATE_FROM_SOURCE false));
```

#### HYBRID_HASH_CACHE
The `HYBRID_HASH_CACHE` layout leverages Timeplus hybrid hash table to store the dictionary in both memory and disk. You need to specify both the `TTL` and `PATH` parameters.

```sql
LAYOUT(HYBRID_HASH_CACHE(TTL 3600 PATH 'path/to/folder'));
```

#### DIRECT
The dictionary with `DIRECT` layout is not stored in memory and directly goes to the source during the processing of a request.

```sql
LAYOUT(DIRECT())
```

#### COMPLEX_KEY_DIRECT
The `COMPLEX_KEY_DIRECT` layout is similar to the `DIRECT` layout, but it supports composite keys.

```sql
LAYOUT(COMPLEX_KEY_DIRECT());
```

#### IP_TRIE
The `IP_TRIE` layout is for mapping network prefixes (IP addresses) to metadata such as ASN.

```sql
LAYOUT(IP_TRIE)
```

Please check the example in the [Create an ip_trie dictionary from a Timeplus stream](#create_dictionary_ip_trie) section.



### LIFETIME
Timeplus can update the dictionary data automatically. You can specify the update interval with the `LIFETIME` clause. The `MIN` and `MAX` values are in seconds. The `MIN` value is the minimum interval between updates, and the `MAX` value is the maximum interval between updates.

For example:
```sql
LIFETIME(MIN 1 MAX 10)
```
specifies the dictionary to update after some random time between 1 and 10 seconds.

This can be simplified to:
```sql
LIFETIME(10)
```

You can disable automatic updates by setting both `MIN` and `MAX` to 0, i.e.

```sql
LIFETIME(MIN 0 MAX 0)
```
Or simply:
```sql
LIFETIME(0)
```

## Examples

### Create a dictionary from a CSV file {#create_dictionary_csv}
For example, the following SQL creates a dictionary named `taxi_zone_dictionary` with data from a CSV file in a public S3 bucket:

```sql
CREATE DICTIONARY taxi_zone_dictionary
(
  `LocationID` uint16 DEFAULT 0,
  `Borough` string,
  `Zone` string,
  `service_zone` string
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED_ARRAY());
```

You can list the content of the dictionary with the following SQL:

```sql
SELECT * FROM taxi_zone_dictionary;
```

Or check the number of rows in the dictionary with the following SQL:

```sql
SELECT COUNT() FROM taxi_zone_dictionary;
```

Although you can query the dictionary with the regular `SELECT .. FROM dict WHERE ..` syntax, it is recommended to use the [dict_get*](/functions_for_dict) functions for better performance.
```sql
-- not recommended
SELECT Borough FROM taxi_zone_dictionary WHERE LocationID=132;
-- 1 row in set. Elapsed: 0.002 sec.

-- recommended
SELECT dict_get('taxi_zone_dictionary', 'Borough', 132);
-- 1 row in set. Elapsed: 0.001 sec.
```

A common use case for dictionaries is to join them with other data streams. For example, you can join the `taxi_zone_dictionary` with a stream `taxi_trips` to get the borough of the pickup location:

```sql
SELECT *
FROM taxi_trips
JOIN taxi_zone_dictionary ON taxi_trips.pickup_nyct2010_gid = taxi_zone_dictionary.LocationID
WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
```

Under the hood, Timeplus will use the [dict_get](/functions_for_dict#dict_get) function to look up the value from the dictionary. Depending on the [LIFETIME](#lifetime) settings, the dictionary will be updated automatically during the JOIN query execution.

### Create an ip_trie dictionary from a Timeplus stream {#create_dictionary_ip_trie}

For example, you can create a mutable stream in Timeplus, and add some sample records to it:
```sql
CREATE MUTABLE STREAM my_ip_addresses (
	prefix string,
	asn uint32,
	cca2 string
)
PRIMARY KEY prefix;

INSERT INTO my_ip_addresses(prefix,asn,cca2) VALUES
  ('202.79.32.0/20', 17501, 'NP'),
  ('2620:0:870::/48', 3856, 'US'),
  ('2a02:6b8:1::/48', 13238, 'RU'),
  ('2001:db8::/32', 65536, 'ZZ');
```

Then you can create a dictionary, referencing the stream:

```sql
CREATE DICTIONARY my_ip_trie_dictionary (
    prefix string,
    asn uint32,
    cca2 string DEFAULT '??'
)
PRIMARY KEY prefix
SOURCE(TIMEPLUS(STREAM 'my_ip_addresses' USER 'admin' PASSWORD 'changeme'))
LAYOUT(IP_TRIE)
LIFETIME(10);
```

This will create an `IP_TRIE` dictionary, which is optimized for mapping network prefixes (IP addresses) to metadata such as ASN. The dictionary will be updated every 0 to 10 seconds.

Then you can query the dictionary with the `dict_get` function:

```sql
SELECT dict_get('my_ip_trie_dictionary', 'cca2', to_ipv4('202.79.32.10')) AS result;
-- returns 'NP'

SELECT dict_get('my_ip_trie_dictionary', 'asn', ipv6_string_to_num('2001:db8::1')) AS result;
-- returns 65536

SELECT dict_get('my_ip_trie_dictionary', ('asn', 'cca2'), ipv6_string_to_num('2001:db8::1')) AS result;
-- returns (65536, 'ZZ')
```

To demonstrate the update capability of the dictionary, you can insert a new record into the mutable stream:

```sql
INSERT INTO my_ip_addresses(prefix,asn,cca2) VALUES
  ('2001:db8::/32', 65536, 'BB');
```
Then run the query again:

```sql
SELECT dict_get('my_ip_trie_dictionary', 'cca2', ipv6_string_to_num('2001:db8::1')) AS result;
```
It will return `BB` instead of `ZZ`.

### Create a dictionary from a MySQL table {#create_dictionary_mysql}

For example, you can create a table in MySQL with the TPCH schema:
```sql
CREATE TABLE "region" (
  "r_regionkey" int DEFAULT NULL,
  "r_name" mediumtext,
  "r_comment" mediumtext
);
```

Then you can create a dictionary, referencing the table:

```sql
CREATE DICTIONARY mysql_region (
    r_regionkey uint64,
    r_name string,
    r_comment string
)
PRIMARY KEY r_regionkey
SOURCE(MYSQL(HOST 'mysql-timeplus.g.aivencloud.com' PORT 28851 USER 'avnadmin' PASSWORD '..' TABLE 'region' DB 'tpch'))
LIFETIME(0)
LAYOUT(FLAT());
```

Then you can query the dictionary with the `dict_get` function:

```sql
SELECT dict_get('mysql_region','r_name',2);
-- returns 'ASIA'
```

#### Create a dictionary from a MySQL table with a mutable stream as the cache {#create_dictionary_mutable_cache}
You can create a dictionary which looks up data from a mutable stream in Timeplus, and fetches the data from a MySQL table if some keys are not found in the stream. This is useful when there are a large number of keys in the MySQL table, and you want to cache the most frequently queried keys in the mutable stream. You can even setup a CDC pipeline to keep the mutable stream up-to-date, as a proactive way to make sure the frequently queried keys are always in the cache.

As an example, you can create a MySQL database with the TPCH schema. There are 150,000 rows in the `customer` table.

```sql
CREATE TABLE customer (
  "c_custkey" bigint DEFAULT NULL,
  "c_name" mediumtext,
  "c_address" mediumtext,
  "c_nationkey" int DEFAULT NULL,
  "c_phone" mediumtext,
  "c_acctbal" decimal(24,6) DEFAULT NULL,
  "c_mktsegment" mediumtext,
  "c_comment" mediumtext
);
```

You can create a mutable stream in Timeplus, and insert the first 10 records to it:
```sql
CREATE MUTABLE STREAM mysql_mutable_cache
(
    c_custkey uint64,
    c_name string,
    c_phone string
)
PRIMARY KEY c_custkey;

INSERT INTO mysql_mutable_cache(c_custkey, c_name, c_phone) VALUES
(1, 'Customer#000000001','25-989-741-2988'),
(2, 'Customer#000000002','23-768-687-3665'),
(3, 'Customer#000000003','11-719-748-3364'),
(4, 'Customer#000000004','14-128-190-5944'),
(5, 'Customer#000000005','13-750-942-6364'),
(6, 'Customer#000000006','30-114-968-4951'),
(7, 'Customer#000000007','21-555-247-5051'),
(8, 'Customer#000000008','17-663-144-5538'),
(9, 'Customer#000000009','13-849-247-6831'),
(10, 'Customer#000000010','33-373-373-6083');
```

Then you can create a dictionary, referencing the mutable stream and the MySQL table:
```sql
CREATE DICTIONARY mysql_dict_mutable(
    c_custkey uint64,
    c_name string,
    c_phone string
)
PRIMARY KEY c_custkey
SOURCE(MYSQL(DB 'tpch' TABLE 'customer' HOST 'host' PORT 3306 USER 'root' PASSWORD 'pwd' BG_RECONNECT true))
LAYOUT(MUTABLE_CACHE(DB 'default' STREAM 'mysql_mutable_cache' UPDATE_FROM_SOURCE false));
```

Then you can query the dictionary with the `dict_get` function:
```sql
SELECT dict_get('mysql_dict_mutable','c_phone',10);
-- returns '33-373-373-6083'

SELECT dict_get('mysql_dict_mutable','c_phone',11);
-- returns '33-464-151-3439', which is not available in the mutable stream, but in the MySQL table
```

You can update the mutable stream with the following SQL:
```sql
INSERT INTO mysql_mutable_cache(c_custkey, c_name, c_phone) VALUES
(10, 'Customer#000000010','12-123-123-1234');
```
Then run the query again:
```sql
SELECT dict_get('mysql_dict_mutable','c_phone',10);
-- returns '12-123-123-1234' from the mutable stream, without fetching from the MySQL table.
```

To keep the mutable stream cache up-to-date, you can setup a CDC pipeline with Redpanda Connect or Debezium. The INSERT or UDPATE in the MySQL table will be captured and sent to the mutable stream. You can even filter the CDC events to only capture the keys you are interested in.

You can also use the dictionary in a JOIN query with other streams:
```sql
SELECT * FROM orders JOIN mysql_dict_mutable AS customers
ON orders.customer_id = customers.c_custkey
SETTINGS join_algorithm = 'direct';
```

## Limitations
* Creating a dictionary from PostgreSQL is not supported.

## See also
* [SHOW DICTIONARIES](/sql-show-dictionaries) - Show dictionaries
* [DROP DICTIONARY](/sql-drop-dictionary) - Drop dictionaries
