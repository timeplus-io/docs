# 使用 SQL 查询 Kafka

:::info

This tutorial is mainly for SQL users. For Timeplus Enterprise users, you can also use [the UI wizard](/confluent-cloud-source). 本指南中的SQL可以在Timeplus Proton和Timeplus Cloud/Enterprise中运行。

:::

创建了一个 docker-compose 文件，用于将Proton映像与 Redpanda（作为采用 Kafka API 的轻量级服务器）、Redpanda 控制台和 [猫头鹰商店](https://github.com/cloudhut/owl-shop) 捆绑在一起，作为示例实时数据。

1. 下载 [docker-compose.yml](https://github.com/timeplus-io/proton/blob/develop/examples/ecommerce/docker-compose.yml) 然后放入新文件夹。
2. 打开一个终端并在这个文件夹中运行 docker compose up。
3. 等待几分钟，提取所有必需的镜像并启动容器。 访问 http://localhost:8080 使用 Redpanda 控制台浏览话题和实时数据。
4. 使用 `proton-client` 运行 SQL 来查询这样的 Kafka 数据：`docker exec-it <folder>-proton-1 proton-1 proton-client` 你可以通过 `docker ps` 获取容器名称
5. 创建外部流以连接到 Kafka/Redpanda 服务器中的主题，然后运行 SQL 来筛选或聚合数据。

### 创建外部流

```sql
CREATE EXTERNAL STREAM frontend_events(raw string)
SETTINGS type='kafka',
         brokers='redpanda:9092',
         topic='owlshop-frontend-events'
```

:::info

从 Proton 1.3.24 开始，您还可以定义多列。

```sql
CREATE EXTERNAL STREAM frontend_events_json(
	version int,
	requestedUrl string,
	method string,
	correlationId string,
	ipAddress string,
	requestDuration int,
	response string,
	headers string
)
SETTINGS type='kafka',
         brokers='redpanda:9092',
         topic='owlshop-frontend-events',
         data_format='JSONEachRow';
```

然后直接选择列，无需进行 JSON 解析，例如 “从 frontend_events_json 中选择方法” 对于嵌套数据，你可以 “从 frontend_events_json 中选择标题:referrer”

:::

### 探索 Kafka 中的数据

然后你可以通过以下方式扫描传入的事件

```sql
select * from frontend_events
```

每秒大约有 10 行。 只有一列 “raw”，其示例数据如下所示：

```json
{
  "version": 0,
  "requestedUrl": "http://www.internationalinteractive.name/end-to-end",
  "method": "PUT",
  "correlationId": "0c7e970a-f65d-429a-9acf-6a136ce0a6ae",
  "ipAddress": "186.58.241.7",
  "requestDuration": 678,
  "response": { "size": 2232, "statusCode": 200 },
  "headers": {
    "accept": "*/*",
    "accept-encoding": "gzip",
    "cache-control": "max-age=0",
    "origin": "http://www.humanenvisioneer.com/engage/transparent/evolve/target",
    "referrer": "http://www.centralharness.org/bandwidth/paradigms/target/whiteboard",
    "user-agent": "Opera/10.41 (Macintosh; U; Intel Mac OS X 10_9_8; en-US) Presto/2.10.292 Version/13.00"
  }
}
```

按 Ctrl+C 取消查询。

### 获取流次数

```sql
select count() from frontend_events
```

This query will show latest count every 2 seconds, without rescanning older data. This is a good example of incremental computation in Proton. 这是 Proton 中增量计算的一个很好的例子。

### 按 JSON 属性筛选事件

```sql
select _tp_time, raw:ipAddress, raw:requestedUrl from frontend_events where raw:method='POST'
```

Once you start the query, any new event with method value as POST will be selected. <code>raw:key</code> is a shortcut to extract string value from the JSON document. It also supports nested structure, such as <code>raw:headers.accept</code> `raw: key` 是从 JSON 文档中提取字符串值的快捷方式。 它还支持嵌套结构，例如 `raw: headers.accept`

### 每秒聚合数据

```sql
select window_start, raw:method, count() from tumble(frontend_events,now(),1s)
group by window_start, raw:method
```

它每秒钟都会显示每个 HTTP 方法的事件数的聚合结果。

### 显示实时 ASCII 条形图

结合来自 ClickHouse 的有趣的 [bar](https://clickhouse.com/docs/en/sql-reference/functions/other-functions#bar) 函数，你可以使用以下流 SQL 来可视化每个点击流的前 5 个 HTTP 方法。

```sql
select raw:method, count() as cnt, bar(cnt, 0, 40,5) as bar from frontend_events
group by raw:method order by cnt desc limit 5 by emit_version()
```

```
┌─raw:method─┬─cnt─┬─bar───┐
│ DELETE     │  35 │ ████▍ │
│ POST       │  29 │ ███▋  │
│ GET        │  27 │ ███▍  │
│ HEAD       │  25 │ ███   │
│ PUT        │  22 │ ██▋   │
└────────────┴─────┴───────┘
```

备注：

- 这是全局聚合，每 2 秒发出一次结果（可配置）。
- [emit_version()](/functions_for_streaming#emit_version) function to show an auto-increasing number for each emit of streaming query result
- 使用 emit_version () 限制 5 行以获取具有相同的 emit_version () 的前 5 行。 这是 Proton 中的一种特殊语法。 一旦返回 5 个结果，常规的 “限制 5” 将取消整个 SQL。 但是在这个串流 SQL 中，我们希望每个发射间隔显示 5 行。

### 创建物化视图以保存 Proton 中的重要事件

使用外部流，您可以在 Kafka 中查询数据，而无需将数据保存在 Proton 中。 With External Stream, you can query data in Kafka without saving the data in Proton. You can create a materialized view to selectively save some events, so that even the data in Kafka is removed, they remain available in Timeplus.

例如，以下 SQL 将创建一个物化视图，使用来自 JSON 的解析属性（例如 URL、方法、反向链接）保存那些断开的链接。

```sql
create materialized view mv_broken_links as
select raw:requestedUrl as url,raw:method as method, raw:ipAddress as ip,
       raw:response.statusCode as statusCode, domain(raw:headers.referrer) as referrer
from frontend_events where raw:response.statusCode<>'200';
```

稍后你可以直接在物化视图上查询：

```sql
-- streaming query
select * from mv_broken_links;

-- historical query
select method, count() as cnt, bar(cnt,0,40,5) as bar from table(mv_broken_links)
group by method order by cnt desc;
```

```
┌─method─┬─cnt─┬─bar─┐
│ GET    │  25 │ ███ │
│ DELETE │  20 │ ██▌ │
│ HEAD   │  17 │ ██  │
│ POST   │  17 │ ██  │
│ PUT    │  17 │ ██  │
│ PATCH  │  17 │ ██  │
└────────┴─────┴─────┘
```
