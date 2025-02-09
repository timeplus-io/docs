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

#### From a stream in the current Timeplus {#source_local_stream}
You can create a dictionary from a stream in the current Timeplus service. [Mutable streams](/mutable-stream) are recommended for dictionary sources, as they can be updated in real-time.

Syntax:
```sql
SOURCE(TIMEPLUS(STREAM 'stream_name' USER 'user' PASSWORD 'password'))
```

Note:
* You need specify either `STREAM` or `QUERY`. A sample `QUERY` is: `SELECT key_column, second_column, third_column FROM table(stream1)`
* The `USER` and `PASSWORD` are optional. If you don't specify them, Timeplus will use the `default` user and empty password, which only works if you have set up the default user in the Timeplus configuration file. You can also use the `current_user()` function to get the current user.

Please check the example in the [Create an ip_trie dictionary from a Timeplus stream](#create_dictionary_ip_trie) section.

#### From a stream in a remote Timeplus {#source_remote_stream}
Similar to the local stream, you can create a dictionary from a stream in a remote Timeplus service.

Syntax:
```sql
SOURCE(TIMEPLUS(HOST 'remotehost' PORT tcp_port() STREAM 'stream_name' USER 'user' PASSWORD 'password'))
```

#### From a table in a remote ClickHouse {#source_clickhouse}
You can create a dictionary from a table in a remote ClickHouse service.

Syntax:
```sql
SOURCE(CLICKHOUSE(HOST 'remotehost' PORT 9000 SECURE 0|1 USER 'user' PASSWORD 'password' TABLE 'table_name' DB 'database_name' ))
```

Either one of the `TABLE` or `QUERY` fields must be declared.

#### From a table in a remote MySQL {#source_mysql}
You can create a dictionary from a table in a remote MySQL database.

Syntax:
```sql
SOURCE(MYSQL(HOST 'remotehost' PORT 3306 USER 'user' PASSWORD 'password' TABLE 'table_name' DB 'database_name' ))
```

Either one of the `TABLE` or `QUERY` fields must be declared.

Please check the example in the [Create a dictionary from a MySQL table](#create_dictionary_mysql) section.

#### From a file available by HTTP(S) {#source_http}
You can create a dictionary from a file available by HTTP(S).

Syntax:
```sql
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
```

Please check the example in the [Create a dictionary from a CSV file](#create_dictionary_csv) section.

### LAYOUT
The `LAYOUT` clause specifies how the dictionary data is stored in memory. The available layout options are:

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

#### HASHED_ARRAY
The `HASHED_ARRAY` layout stores the dictionary data in memory. Each attribute is stored in an array. The key attribute is stored in the form of a hashed table where value is an index in the attributes array. The dictionary can contain any number of elements with any identifiers.

```sql
-- default values
LAYOUT(HASHED_ARRAY())

-- custom values
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

#### DIRECT
The dictionary with `DIRECT` layout is not stored in memory and directly goes to the source during the processing of a request.

```sql
LAYOUT(DIRECT())
```

#### IP_TRIE
The `IP_TRIE` layout is for mapping network prefixes (IP addresses) to metadata such as ASN.

```sql
LAYOUT(IP_TRIE)
```

### LIFETIME
Timeplus can update the dictionary data automatically. You can specify the update interval with the `LIFETIME` clause. The `MIN` and `MAX` values are in seconds. The `MIN` value is the minimum interval between updates, and the `MAX` value is the maximum interval between updates.

For example:
```sql
LIFETIME(MIN 1 MAX 10)
```
specifies the dictionary to update after some random time between 1 and 10 seconds.

You can disable automatic updates by setting both `MIN` and `MAX` to 0, i.e.

```sql
LIFETIME(MIN 0 MAX 0)
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
LIFETIME(3600);
```

Then you can query the dictionary with the `dict_get` function:

```sql
SELECT dict_get('my_ip_trie_dictionary', 'cca2', to_ipv4('202.79.32.10')) AS result;
-- returns 'NP'

SELECT dict_get('my_ip_trie_dictionary', 'asn', ipv6_string_to_num('2001:db8::1')) AS result;
-- returns 65536

SELECT dict_get('my_ip_trie_dictionary', ('asn', 'cca2'), ipv6_string_to_num('2001:db8::1')) AS result;
-- returns (65536, 'ZZ')
```

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

## Limitations
* Creating a dictionary from PostgreSQL is not supported.

## See also
* [SHOW DICTIONARIES](/sql-show-dictionaries) - Show dictionaries
* [DROP DICTIONARY](/sql-drop-dictionary) - Drop dictionaries
