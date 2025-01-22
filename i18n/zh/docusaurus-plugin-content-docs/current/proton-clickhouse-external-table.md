# ClickHouse 外部表

Since Timeplus Proton v1.4.2, it added the support to read or write ClickHouse tables. 这将解锁一系列新的用例，例如

- Use Timeplus to efficiently process real-time data in Kafka/Redpanda, apply flat transformation or stateful aggregation, then write the data to the local or remote ClickHouse for further analysis or visualization.
- 使用ClickHouse中的静态或缓慢变化的数据来丰富实时数据。 申请流加入。
- Use Timeplus to query historical or recent data in ClickHouse

This integration is done by introducing a new concept in Timeplus: "External Table". Similar to [External Stream](/external-stream), there is no data persisted in Timeplus. 但是，由于ClickHouse中的数据是表格，而不是数据流的形式，因此我们将其称为外部表。 In the roadmap, we will support more integration by introducing other types of External Table.

## 演示视频 {#demo}

该视频演示了如何读取来自Redpanda的实时数据、应用流处理以及如何将结果发送到ClickHouse。

<iframe width="560" height="315" src="https://www.youtube.com/embed/ga_DmCujEpw?si=ja2tmlcCbqa6HhwT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 创建外部表

### 语法

```sql
创建外部表名
设置 type='clickhouse'，
         address='。。',
         user='。。',
         密码='。。',
         database='。。'，
         secure=true|false，
         table='。。';
```

所需的设置是类型和地址。 对于其他设置，默认值为

- “用户” 的 “默认”
- “（空字符串）用于 “密码”
- “数据库” 的 “默认”
- 'false' 表示 “安全”
- 如果省略表名，它将使用外部表的名称

您无需指定列，因为表架构将从 ClickHouse 服务器获取。

成功创建外部表后，您可以运行以下 SQL 来列出列：

```sql
描述名字
```

:::info

The data types in the output will be Timeplus data types, such as `uint8`, instead of ClickHouse type `UInt8`. Timeplus maintains a mapping for those types. [了解更多。](#datatype)

:::

您可以定义外部表并使用它从 ClickHouse 表中读取数据或向其写入数据。

### 连接到本地 ClickHouse {#local}

无需密码即可连接到本地 ClickHouse 服务器的 SQL 示例：

```sql
创建外部表 ch_local
设置 type='clickhouse'、
         address='localhost: 9000'、
         table='events'
```

### 连接到 ClickHouse Cloud {#ch_cloud}

连接到 [ClickHouse Cloud](https://clickhouse.com/) 的示例 SQL：

```sql
创建外部表 ch_cloud
设置类型='clickhouse'、
         address='abc.clickhouse.cloud: 9440'、
         user='default'、
         password='..'，
         secure=true，
         table='events'；
```

### 使用 ClickHouse 连接到 Aiven {#aiven}

连接到 [Aiven for ClickHouse](https://docs.aiven.io/docs/products/clickhouse/getting-started) 的示例 SQL：

```sql
创建外部表 ch_aiven
设置 type='clickhouse'、
         address='abc.aivencloud.com: 28851'、
         user='avnadmin'、
         password='..'，
         secure=true，
         table='events'；
```

## 从 ClickHouse 读取数据 {#read}

Once the external table is created successfully, it means Timeplus can connect to the ClickHouse server and fetch the table schema.

你可以通过常规的 `select.. '来查询 来自 table_name`。

:::warning

Please note, in the current implementation, all rows will be fetched from ClickHouse to Timeplus, with the selected columns. Then Timeplus applies the SQL functions and `LIMIT n` locally. 不建议对大型的 ClickHouse 表格运行 `SELECT *`。

Also note, use the Timeplus function names when you query the external table, such as [to_int](/functions_for_type#to_int), instead of ClickHouse's naming convention, e.g. [toInt](https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions#toint8163264128256). In current implementation, the SQL functions are applied in Timeplus engine. 我们计划在未来的版本中支持向ClickHouse下推一些功能。

:::

局限性：

1. 外部表不支持 tumble/hop/session/table 功能（即将推出）
2. scalar or aggregation functions are performed by Timeplus, not the remote ClickHouse
3. `LIMIT n` is performed by Timeplus, not the remote ClickHouse

## 将数据写入 ClickHouse {#write}

你可以运行常规的 “INSERT INTO” 将数据添加到 ClickHouse 表中。 但是，使用物化视图将流式SQL结果发送到ClickHouse更为常见。

假设你创建了一个外部表 `ch_table`。 You can create a materialized view to read Kafka data(via an external stream) and transform/aggregate the data and send to the external table:

```sql
— 通过物化视图设置 ETL 管道
在 ch_table 中创建物化视图 mv 作为
    SELECT now64 () 作为 _tp_time，
           raw: requesteDurl 作为 url，
           raw: method 作为方法，
           向下（十六进制（md5（raw: IP 地址））作为 ip
    来自 kafka_events；
```

## 支持的数据类型 {#datatype}

All ClickHouse data types are supported in the external table, except `Point`. While reading or writing data, Timeplus applies a data type mapping, such as converting Timeplus' `uint8` to ClickHouse's `UInt8`. 如果您发现数据类型有任何问题，请告诉我们。
