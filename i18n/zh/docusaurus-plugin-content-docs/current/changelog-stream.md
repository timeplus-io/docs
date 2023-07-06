# 变更日志流

当您使用 `更新日志_kv` 的模式创建一个流时，流中的数据不再是附加的。 当您直接查询流时，仅显示相同主键的最新版本。 数据可以更新或删除。 您可以在左侧或右侧的JOIN中使用更新日志流。 Timeplus 将自动选择最新版本。

以下是一些例子：

## 创建流

在此示例中，您在 `changelog_kv` 模式中创建了一个带有以下列的流 `dim_products`：

| 列名          | 数据类型                | 描述                                         |
| ----------- | ------------------- | ------------------------------------------ |
| _tp_time  | datetime64(3,'UTC') | 它是自动为所有在 Timeplus 中的流创建的，具有毫秒精度和UTC时区的事件时间 |
| _tp_delta | 整数                  | 特殊列，1表示新数据，-1表示已删除的数据                      |
| 产品名称        | 字符串                 | 产品的唯一 ID，作为主键                              |
| 价格          | 浮点数                 | 当前价格                                       |

## 查询单个流

如果您没有添加任何数据，查询 `SELECT * FROM dim_products` 将不返回任何结果并继续等待新的结果。

### 添加数据

保持查询运行并将更多的行添加到流中 (通过 REST API 或创建新的浏览器标签页并直接将行添加到流)。

| _tp_delta | 产品名称          | 价格  |
| ----------- | ------------- | --- |
| 1           | iPhone14      | 799 |
| 1           | iPhone14_Plus | 899 |

查询控制台将自动显示这两行。

### 删除数据

如果您不想再列出iPhone14_Plus。 您需要添加一行为 `_tp_delta=-1`：

| _tp_delta | 产品名称          | 价格  |
| ----------- | ------------- | --- |
| -1          | iPhone14_Plus | 899 |

然后取消查询并再次运行它，您只会得到1行，而不是3行。 原因是第二行和第三行具有相同的主要ID，但有相反的 _tp_delta，所以 TimePlus 会将它们合并。 这一过程被称为“压缩”。

| _tp_delta | 产品名称     | 价格  |
| ----------- | -------- | --- |
| 1           | iPhone14 | 799 |

### 更新数据

现在，如果您想要更改iPhone14的价格，您需要添加两行：

| _tp_delta | 产品名称     | 价格  |
| ----------- | -------- | --- |
| -1          | iPhone14 | 799 |
| 1           | iPhone14 | 800 |

取消查询 `SELECT * FROM dim_products` 并再次运行，您将只会在产品列表中获得1行：

| _tp_delta | 产品名称     | 价格  |
| ----------- | -------- | --- |
| 1           | iPhone14 | 800 |

您可以想象，您可以继续添加新的行。 如果 _tp_delta 是1并且主键是新的，那么您将在查询结果中获得一个新的行。 如果 _tp_delta 是-1并且主键已经存在，那么前一行将被删除。 您可以通过添加带有主键的新行来更新该值。

:::注意

事实上，您可以指定一个表达式作为主键。 例如，您可以使用 `first_name|' '||last_name` 来合并全名作为主键，而不是使用单列。

:::

### 显示聚合结果

如果您运行 `select count(1), sum(price) from dim_products` 这样的查询，此串流 SQL 将始终给您提供最新的结果：

| 计数(1) | 总和（价格） |                     |
| ----- | ------ | ------------------- |
| 1     | 800    | 当只有1行时：iPhone14     |
| 2     | 1699   | 当 iPhone14_Plus 被添加 |
| 1     | 800    | 当 iPhone14_Plus 被移除 |

## 在 JOIN 中使用更新日志流作为查询

在上述示例中，您总是获得具有相同主键的事件的最新版本。 当这样的流充当 JOIN 的“查询表”时，这非常有用。

想象您有 `订单` 的一个附加流：

| _tp_time | 订单编号 | 产品名称 | 数量 |
| ---------- | ---- | ---- | -- |
|            |      |      |    |

当前 `dim_product` 流是：

| _tp_delta | 产品名称          | 价格  |
| ----------- | ------------- | --- |
| 1           | iPhone14      | 799 |
| 1           | iPhone14_Plus | 899 |

现在运行流式SQL：

```sql
SELECT orders._tp_time, order_id,product_id,quantity, price*quantity AS amount
FROM orders JOIN dim_products USING(product_id)
```

然后添加两行：

| _tp_time               | 订单编号 | 产品名称          | 数量 |
| ------------------------ | ---- | ------------- | -- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone14      | 1  |
| 2023-04-20T10:01:00.000Z | 2    | iPhone14_Plus | 1  |

在查询控制台中，您将逐一看到这两行：

| _tp_time               | 订单编号 | 产品名称          | 数量 | 金额  |
| ------------------------ | ---- | ------------- | -- | --- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone14      | 1  | 799 |
| 2023-04-20T10:01:00.000Z | 2    | iPhone14_Plus | 1  | 899 |

然后，您可以通过在 `dim_products` 中添加两个新的行来更改 iPhone14 的价格至800

| _tp_delta | 产品名称     | 价格  |
| ----------- | -------- | --- |
| -1          | iPhone14 | 799 |
| 1           | iPhone14 | 800 |

也在 `订单` 中添加新的行

| _tp_time               | 订单编号 | 产品名称     | 数量 |
| ------------------------ | ---- | -------- | -- |
| 2023-04-20T11:00:00.000Z | 3    | iPhone14 | 1  |

您将在前一个流的 SQL 中获得第三行：

| _tp_time               | 订单编号 | 产品名称          | 数量 | 金额  |
| ------------------------ | ---- | ------------- | -- | --- |
| 2023-04-20T10:00:00.000Z | 1    | iPhone14      | 1  | 799 |
| 2023-04-20T10:01:00.000Z | 2    | iPhone14_Plus | 1  | 899 |
| 2023-04-20T11:00:00.000Z | 3    | iPhone14      | 1  | 800 |

可以看出，iPhone14 的最新价格被应用到新事件的 JOIN 中。

## 在 JOIN 中使用更新日志流作为左表

您也可以在 JOIN 左侧使用更新日志流。

让我们在更新日志流模式下创建一个新流 `订单2`

| _tp_time | _tp_delta | 订单编号 | 产品名称 | 数量 |
| ---------- | ----------- | ---- | ---- | -- |
|            |             |      |      |    |

您可以通过添加具有适当 _tp_delta 值的行来添加/更新/删除订单。 当您运行流式 SQL 时：

```sql
SELECT orders2._tp_time, order_id,product_id,quantity, price*quantity AS amount
FROM orders2 JOIN dim_products USING(product_id)
```

Timeplus 将使用最新版本的订单记录加入查询表。

更有用的是，如果您运行聚合，比如：

```sql
SELECT count(1) AS order_count, sum(price*quantity) AS revenue
FROM orders2 JOIN dim_products USING(product_id)
```

每当订单被添加、更新或删除时，您将获得正确的数字。

## 使用更新日志流设置 CDC

CDC（更改数据捕获），是现代数据存储的一个关键部分。 大多数现代数据库都支持 CDC 实时同步数据变化到其他系统。 一个受欢迎的开源解决方案是 [Debezium](https://debezium.io/)。

Timeplus 的变更日志流可以与 Debezium 或其他 CDC 解决方案配合使用。 如果您的应用程序可以使用适当的 _tp_delta 标志生成事件（1表示添加数据，-1表示删除数据），那么没有它们也可以正常运行。

例如，您在 PostgreSQL 14 中创建了两个表格：

### 设置 PostgreSQL 表

```sql
CREATE TABLE dim_products(
    product_id VARCHAR PRIMARY KEY,
    price FLOAT
);
CREATE TABLE orders(
  order_id serial PRIMARY KEY,
  product_id varchar,
  quantity int8 DEFAULT 1,
  timestamp timestamp DEFAULT NOW()
);
```

为了更新或删除来抓取 `之前` 的值，您还需要将 `REPLICA IDENTIFY` 设置成 `FULL` 查看 [Debezium 文档](https://debezium.io/documentation/reference/2.2/connectors/postgresql.html#postgresql-replica-identity) 了解更多详情。

```sql
ALTER TABLE dim_products REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
```

### 设置 Debezium

现在以您喜欢的方式开始使用Kafka Connect的Debezium 。 您还需要本地或远程的 Kafka/Redpanda 作为消息代理来接收 CDC 数据。

在此示例中，我们将使用 Redpanda Cloud 作为消息代理，并使用内置 Debezium 的 Kafka Connect 的本地 docker 镜像。 docker-compose 文件：

```yaml
version: "3.7"
services:
  connect:
    image: quay.io/debezium/connect:2.2.0.Final
    container_name: connect
    ports:
      - 8083:8083
    environment:
      - GROUP_ID=1
      - CONFIG_STORAGE_TOPIC=my_connect_configs
      - OFFSET_STORAGE_TOPIC=my_connect_offsets
      - STATUS_STORAGE_TOPIC=my_connect_statuses
      - BOOTSTRAP_SERVERS=${BOOTSTRAP_SERVERS}
      # CONNECT_ properties are for the Connect worker
      - CONNECT_BOOTSTRAP_SERVERS=${BOOTSTRAP_SERVERS}
      - CONNECT_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
      - CONNECT_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
      - CONNECT_SASL_MECHANISM=SCRAM-SHA-512
      - CONNECT_PRODUCER_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
      - CONNECT_PRODUCER_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
      - CONNECT_PRODUCER_SASL_MECHANISM=SCRAM-SHA-512
      - CONNECT_CONSUMER_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
      - CONNECT_CONSUMER_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
      - CONNECT_CONSUMER_SASL_MECHANISM=SCRAM-SHA-512
      - CONNECT_KEY_CONVERTER_SCHEMAS_ENABLE=false
      - CONNECT_VALUE_CONVERTER_SCHEMAS_ENABLE=false
```

 您可以将凭据放置在同一文件夹的 `.env` 文件中：

```
BOOTSTRAP_SERVERS=demourl.cloud.redpanda.com:9092
SASL_USERNAME=yourname
SASL_PASSWORD=yourpassword
SASL_JAAS_CONFIG=org.apache.kafka.common.security.scram.ScramLoginModule required username="${SASL_USERNAME}" password="${SASL_PASSWORD}";
SECURITY_PROTOCOL=SASL_SSL
```

或者，您可以在 docker 撰写文件中添加 Redpanda 控制台。 它为您添加/查看主题和管理连接器提供了很好的用户界面。

```yaml
  console:
    image: docker.redpanda.com/redpandadata/console:v2.2.3
    container_name: redpanda_console
    depends_on:
      - connect
    ports:
      - 8080:8080
    entrypoint: /bin/sh
    command: -c "echo \"$$CONSOLE_CONFIG_FILE\" > /tmp/config.yml; /app/console"
    environment:
      CONFIG_FILEPATH: /tmp/config.yml
      CONSOLE_CONFIG_FILE: |
        kafka:
          brokers: ${BOOTSTRAP_SERVERS}
          sasl:
            enabled: true
            username: ${SASL_USERNAME}
            password: ${SASL_PASSWORD}
            mechanism: SCRAM-SHA-512
          tls:
            enabled: true
        connect:
          enabled: true
          clusters:
            - name: local-connect-cluster
              url: http://connect:8083
```



### 添加 PostgreSQL 连接器

以 `docker-compose up` 开启 docker-comose。 它将加载 Debezium 和 Redpanda 控制台的图像。 您可以通过 http://localhost:8080 访问 Redpanda 控制台，Kafka Connect REST API 的端点是 http://localhost:8083

您可以通过 Web 用户界面添加 Debezium 连接器。 但以下命令行可以正常运行：

```bash
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
localhost:8083/connectors \
-d '{"name":"pg-connector","config":{"connector.class": "io.debezium.connector.postgresql.PostgresConnector","publication.autocreate.mode": "filtered",  "database.dbname": "defaultdb",  "database.user": "avnadmin",  "schema.include.list": "public",  "database.port": "28851",  "plugin.name": "pgoutput",  "database.sslmode": "require",  "topic.prefix": "doc",  "database.hostname": "xyz.aivencloud.com",  "database.password": "***",  "table.include.list": "public.dim_products,public.orders"}}'
```

这将添加一个名为 `pg-connector` 的新连接器，并连接到远程服务器上的 PostgreSQL 数据库（在这种情况下，Aiven Cloud）。 配置项目的一些注意事项：

* `publication.autocreate.mode` 是 `过滤后的`， `table.include.list` 是您想要应用 CDC 的一系列列表。 有时，您没有权限为所有表启用发布。 因此，建议使用 `过滤后的` 。
* `plugin.name` 是 `pgoutput`。 这与新版本的 PostgreSQL（10+）配合使用效果很好。 默认值为 `decoderbufs`，它需要单独安装。
* `topic.prefix` 已设置为 `doc`。 顾名思义，它将成为 Kafka 主题的前缀。 Since the schema is `public`, the topics to be used will be `doc.public.dim_products` and `doc.public.orders`

Make sure you create those 2 topics in Kafka/Redpanda. Then in a few seconds, new messages should be available in the topics.

You can try INSERT/UPDATE/DELETE data in PostgreSQL and check the generated JSON messages.

### Sample CDC Data

#### INSERT

SQL:

```sql
INSERT INTO dim_products ("product_id", "price") VALUES ('iPhone14', 799)
```

CDC Data:

```json
{
    "before": null,
    "after": {
        "product_id": "iPhone14",
        "price": 799
    },
    "source": {
    },
    "op": "c",
    "ts_ms": 1682217357439,
    "transaction": null
}
```

#### UPDATE

SQL:

```sql
UPDATE dim_products set price=800 WHERE product_id='iPhone14'
```

CDC Data:

```json
{
    "before": {
        "product_id": "iPhone14",
        "price": 799
    },
    "after": {
        "product_id": "iPhone14",
        "price": 800
    },
    "source": {
    },
    "op": "u",
    "ts_ms": 1682217416358,
    "transaction": null
}
```

#### DELETE

SQL:

```sql
DELETE FROM dim_products
```

CDC Data:

```json
{
    "before": {
        "product_id": "iPhone14",
        "price": 800
    },
    "after": null,
    "source": {
    },
    "op": "d",
    "ts_ms": 1682217291411,
    "transaction": null
}
```

#### For existing rows

Debezium also read all existing rows and generate messages like this

```json
{
    "before": null,
    "after": {
        "product_id": "iPhone14",
        "price": 799
    },
    "source": {
    },
    "op": "r",
    "ts_ms": 1682217357439,
    "transaction": null
}
```



### Load data to Timeplus

You can follow this [guide](kafka-source) to add 2 data sources to load data from Kafka or Redpanda.  例如：

* Data source name `s1` to load data from topic `doc.public.dim_products` and put in a new stream `rawcdc_dim_products`
* Data source name `s2` to load data from topic `doc.public.orders` and put in a new stream `rawcdc_orders`

Then run the following SQL in query page:

```sql
select 1::int8 as _tp_delta, after:product_id as product_id, after:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op in ('c','r')
union
select -1::int8 as _tp_delta, before:product_id as product_id, before:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op='d'
union
select -1::int8 as _tp_delta, before:product_id as product_id, before:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op='u'
union 
select 1::int8 as _tp_delta, after:product_id as product_id, after:price::float as price, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_dim_products where op='u'      
```

Click the **Send as Sink** button and choose Timeplus type, to send the results to an existing stream `dim_products` .

:::info

In the coming version of Timeplus, we will simplify the process so that you don't need to write custom SQL to extract the Debezium CDC messages.

:::

Similarly, here is the SQL to convert raw CDC messages for `orders` :

```sql
select 1::int8 as _tp_delta, after:order_id as order_id, after:product_id as product_id, after:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op in ('c','r')
union
select -1::int8 as _tp_delta, before:order_id as order_id, before:product_id as product_id, before:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op='d'
union
select -1::int8 as _tp_delta, before:order_id as order_id, before:product_id as product_id, before:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op='u'
union 
select 1::int8 as _tp_delta, after:order_id as order_id, after:product_id as product_id, after:quantity::int8 as quantity, cast(ts_ms::string,'datetime64(3, \'UTC\')') as _tp_time from rawcdc_orders where op='u' 
```



