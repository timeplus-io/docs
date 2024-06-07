# ClickHouse 外部表

自 Proton v1.4.2 起，它增加了对读取或写入 ClickHouse 表格的支持。 这将解锁一系列新的用例，例如

- 使用 Proton 高效处理 Kafka/Redpanda 中的实时数据，应用平面转换或状态聚合，然后将数据写入本地或远程 ClickHouse 以进行进一步分析或可视化。
- 使用ClickHouse中的静态或缓慢变化的数据来丰富实时数据。 申请直播加入。
- 使用 Proton 查询 ClickHouse 中的历史或近期数据

这种集成是通过在 Proton 中引入一个新概念来完成的：“外部表”。 与 [外部流]（外部流）类似，Proton 中没有保留任何数据。 但是，由于ClickHouse中的数据是表格，而不是数据流的形式，因此我们将其称为外部表。 在路线图中，我们将通过引入其他类型的外部表来支持更多集成。

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

输出中的数据类型将是 Proton 数据类型，例如 `uint8`，而不是 ClickHouse 类型的 `Uint8`。 Proton 维护着这些类型的映射。 [了解更多。](#datatype)

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

连接到 [ClickHouse Cloud] (https://clickhouse.com/) 的示例 SQL：

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

连接到 [Aiven for ClickHouse] (https://docs.aiven.io/docs/products/clickhouse/getting-started) 的示例 SQL：

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

成功创建外部表后，这意味着 Proton 可以连接到 ClickHouse 服务器并获取表架构。

你可以通过常规的 `select.. '来查询 来自 table_name`。

:::warning

请注意，在当前的实现中，所有行都将从ClickHouse提取到Proton，其中包含选定的列。 然后 Proton 在本地应用 SQL 函数和 LIMIT n。 不建议对大型的 ClickHouse 表格运行 `SELECT *`。

另请注意，在查询外部表时使用质子函数名称，例如 [to_int] (functions_for_type #to_int)，而不是 ClickHouse 的命名规范，例如 [toInt] (https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions#toint8163264128256)。 在当前的实现中，SQL 函数应用于 Proton 引擎中。 我们计划在未来的版本中支持向ClickHouse下推一些功能。

:::

局限性：

1. 外部表不支持 tumble/hop/session/table 功能（即将推出）
2. 标量或聚合函数由 Proton 执行，而不是远程 ClickHouse 执行
3. `LIMIT n` 由 Proton 执行，而不是远程的 ClickHouse

## 将数据写入 ClickHouse {#write}

你可以运行常规的 “INSERT INTO” 将数据添加到 ClickHouse 表中。 但是，使用物化视图将流式SQL结果发送到ClickHouse更为常见。

假设你创建了一个外部表 `ch_table`。 你可以创建一个物化视图来读取 Kafka 数据（通过外部流），转换/聚合数据并发送到外部表：

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

外部表支持所有 ClickHouse 数据类型。 在读取或写入数据时，Proton 会应用数据类型映射，例如将 Proton 的 `uint8` 转换为 ClickHouse 的 `Uint8`。 如果您发现数据类型有任何问题，请告诉我们。
