# CREATE STREAM

:::info note for Timeplus Cloud users

In Timeplus Cloud or Private Cloud deployments, we recommend you to create streams with GUI or [Terraform Provider](terraform), with better usability and more capabilities.

:::

## CREATE STREAM

[Stream](working-with-streams) is a key [concept](concepts) in Timeplus. All data lives in streams, no matter static data or data in motion. We don't recommend you to create or manage `TABLE` in Proton.

### Append-only Stream

By default, the streams are append-only and immutable. You can create a stream, then use `INSERT INTO` to add data.

Syntax:

```sql
CREATE STREAM [IF NOT EXISTS] [db.]<stream_name>
(
    <col_name1> <col_type_1> [DEFAULT <col_expr_1>] [compression_codec_1],
    <col_name1> <col_type_2> [DEFAULT <col_expr_2>] [compression_codec_2]
)
SETTINGS <event_time_column>='<col>', <key1>=<value1>, <key2>=<value2>, ...
```

:::info

Stream creation is an async process.

:::

If you omit the database name, `default` will be used. Stream name can be any utf-8 characters and needs backtick quoted if there are spaces in between. Column name can be any utf-8 characters and needs backtick quoted if there are spaces in between.

#### Data types

Proton supports the following column types

1. int8/16/32/64/128/256
2. uint8/16/32/64/128/256
3. boolean
4. decimal(precision, scale) : valid range for precision is [1: 76], valid range for scale is [0: precision]
5. float32/64
6. date
7. dateTime
8. dateTime64(precision, [time_zone])
9. string
10. fixed_string(N)
11. array(T)
12. uuid

#### Event Time

In Timeplus, each stream with a `_tp_time` as [Event Time](eventtime). If you don't create the `_tp_time` column when you create the stream, the system will create such a column for you, with `now64()` as the default value. You can also choose a column as the event time, using

```sql
SETTINGS event_time_column='my_datetime_col'
```

 It can be any sql expression which results in datetime64 type.

#### Retention Policies

Proton supports retention policies to automatically remove out-of-date data from the streams.

##### For Historical Storage

Proton leverages Clickhouse TTL expression for the retention policy of historical data. When you create the stream, you can add ` TTL to_datetime(_tp_time) + INTERVAL 12 HOUR` to remove older events based a specific datetime column and retention period. 

##### For Streaming Storage

Today it's not exposed in SQL to control the retention policies for streaming storage. In Timeplus Cloud, you can set them via

* logstore_retention_bytes
* logstore_retention_ms

### Versioned Stream

[Versioned Stream](versioned-stream) allows you to specify the primary key(s) and focus on the latest value. For example:

```sql
CREATE STREAM versioned_kv(i int, k string, k1 string) 
PRIMARY KEY (k, k1) 
SETTINGS mode='versioned_kv', version_column='i';
```

The default `version_column` is `_tp_time`. For the data with same primary key(s), Proton will use the ones with maximum value of  `version_column`. So by default, it tracks the most recent data for same primary key(s). If there are late events, you can use specify other column to determine the end state for your live data. 

### Changelog Stream

[Changelog Stream](changelog-stream) allows you to specify the primary key(s) and track the add/delete/update of the data. For example:

```sql
CREATE STREAM changelog_kv(i int, k string, k1 string) 
PRIMARY KEY (k, k1) 
SETTINGS mode='changelog_kv', version_column='i';
```

The default `version_column` is `_tp_time`. For the data with same primary key(s), Proton will use the ones with maximum value of  `version_column`. So by default, it tracks the most recent data for same primary key(s). If there are late events, you can use specify other column to determine the end state for your live data. 

## CREATE RANDOM STREAM

You may use this special stream to generate random data for tests. For example:

```sql
CREATE RANDOM STREAM devices(
  device string default 'device'||to_string(rand()%4), 
  location string default random_from(['SF','Vancouver','Toronto']),
  temperature float default rand()%1000/10);
```

The following functions are available to use:

1. rand
2. rand32
3. rand64
4. random_printable_ascii
5. random_string
6. random_fixed_string
7. random_from

The data of random stream is kept in memory.

## CREATE EXTERNAL STREAM

Please check [Read/Write Kafka with External Stream](proton-kafka).