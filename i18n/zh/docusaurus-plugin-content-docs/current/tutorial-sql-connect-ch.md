# Connect to ClickHouse

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
