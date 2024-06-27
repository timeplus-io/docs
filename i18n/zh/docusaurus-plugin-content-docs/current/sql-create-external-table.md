# 创建外部表

## 语法

```sql
CREATE EXTERNAL TABLE name
SETTINGS type='clickhouse',
         address='..',
         user='..',
         password='..',
         database='..',
         secure=true|false,
         table='..';
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
DESCRIBE name
```

:::info

输出中的数据类型将是 Proton 数据类型，例如 `uint8`，而不是 ClickHouse 类型的 `Uint8`。 Proton 维护着这些类型的映射。 [了解更多。](#datatype)

:::

您可以定义外部表并使用它从 ClickHouse 表中读取数据或向其写入数据。
