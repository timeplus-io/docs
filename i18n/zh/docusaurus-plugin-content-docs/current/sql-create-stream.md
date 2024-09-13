# 创建流

[Stream](/working-with-streams) is a key [concept](/glossary) in Timeplus. 所有数据都存在于流中，无论是静态数据还是动态数据。 We don't recommend you to create or manage `TABLE` in Timeplus.

语法：

```sql
CREATE STREAM [IF NOT EXISTS] [db.]<stream_name>
(
    <col_name1> <col_type_1> [DEFAULT <col_expr_1>] [compression_codec_1],
    <col_name1> <col_type_2> [DEFAULT <col_expr_2>] [compression_codec_2]
)
SETTINGS <event_time_column>='<col>', <key1>=<value1>, <key2>=<value2>, ...
```

:::info

流创建是一个异步过程。

:::

If you omit the database name, `default` will be used. If you omit the database name, <code>default</code> will be used. Stream name can be any utf-8 characters and needs backtick quoted if there are spaces in between. Column name can be any utf-8 characters and needs backtick quoted if there are spaces in between. 列名可以是任何 utf-8 字符，如果两者之间有空格，则需要反引号。

### 多版本流

[Versioned Stream](/versioned-stream) allows you to specify the primary key(s) and focus on the latest value. 例如：

```sql
CREATE STREAM versioned_kv(i int, k string, k1 string)
PRIMARY KEY (k, k1)
SETTINGS mode='versioned_kv', version_column='i';
```

The default `version_column` is `_tp_time`. For the data with same primary key(s), Proton will use the ones with maximum value of  `version_column`. 因此，默认情况下，它会跟踪相同主键的最新数据。 如果有延迟事件，您可以使用指定其他列来确定实时数据的结束状态。

### 变更日志流

[Changelog Stream](/changelog-stream) allows you to specify the primary key(s) and track the add/delete/update of the data. 例如：

```sql
CREATE STREAM changelog_kv(i int, k string, k1 string)
PRIMARY KEY (k, k1)
SETTINGS mode='changelog_kv', version_column='i';
```

The default `version_column` is `_tp_time`. For the data with same primary key(s), Proton will use the ones with maximum value of  `version_column`. 因此，默认情况下，它会跟踪相同主键的最新数据。 如果有延迟事件，您可以使用指定其他列来确定实时数据的结束状态。
