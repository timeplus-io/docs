# 流 ETL：从 Kafka 到 Kafka

你可以使用 Timeplus 快速构建流 ETL 管道。 例如，Kafka 主题中的原始 Web 访问日志包含原始 IP 地址。 为了进一步保护用户隐私，你可以建立一个数据管道来读取来自Kafka的新数据，屏蔽IP地址并发送到不同的Kafka主题。

按照 [Timeplus Proton] (#timeplus-proton) 或 [Timeplus Cloud] (#timeplus-cloud) 的指南进行操作。

## Timeplus Proton

您可以按照 [前面的教程]（教程-sql-kafka）设置示例数据，并运行以下 SQL 来构建管道。

```sql
— 通过外部流阅读话题
创建外部流 frontend_events（原始字符串）
                SETTINGS type='kafka'，
                         brokers='redpanda: 9092'，
                         topic='owlshop-frontend-events'；

— 创建另一个外部流向另一个主题
创建外部流目标 (
    _tp_time datetime64 (3)，
    url 字符串，
    方法字符串，
    ip 字符串）
    设置类型='kafka'，
             brokers='redpanda: 9092'，
             topic='masked-fe-event'，
             data_format='jsoneachrow'，
             one_message_per_row=true；

— 通过物化视图设置 ETL 管道
在目标中创建物化视图 mv 作为
    SELECT now64 () 作为 _tp_time，
           raw: requestedURL 作为 url，
           raw: method 作为方法，
           向下（十六进制 (md5 (raw: IPAddress)) 作为 ip
    来自 frontend_events；
```

## Timeplus 云服务

[博客] (https://www.timeplus.com/post/redpanda-serverless) 已发布，其中详细介绍了从 Kafka/Redpanda 读取数据、应用转换并发送到 Kafka/Redpanda 的数据。

几个关键步骤：

1. 连接到 Redpanda：

![添加数据] (https://static.wixstatic.com/media/3796d3_dd096c19d5014082940e1e0a4bbc9c98~mv2.png/v1/fill/w_1392,h_843,al_c,q_90,enc_auto/3796d3_dd096c19d5014082940e1e0a4bbc9c98~mv2.png)

2. 指定 Redpanda 代理地址和身份验证方法。

![经纪商] (https://static.wixstatic.com/media/3796d3_4fb74e122b1f48dfb101316104eb0f27~mv2.png/v1/fill/w_1399,h_677,al_c,q_90,enc_auto/3796d3_4fb74e122b1f48dfb101316104eb0f27~mv2.png)

3. 选择主题并预览数据。

![预览] (https://static.wixstatic.com/media/3796d3_fee20aa87fc6446ca97d7947028bec03~mv2.png/v1/fill/w_1400,h_1012,al_c,q_90,enc_auto/3796d3_fee20aa87fc6446ca97d7947028bec03~mv2.png)

4. 设置外部流的名称，比如 `frontend_events`。

![套装名称] (https://static.wixstatic.com/media/3796d3_530daa439da24dcb893901de33dfebc0~mv2.png/v1/fill/w_1399,h_533,al_c,q_90,enc_auto/3796d3_530daa439da24dcb893901de33dfebc0~mv2.png)

5. 浏览流/话题中的实时数据。

![探索] (https://static.wixstatic.com/media/3796d3_5703bf748d5a4c00bd9eefff534b63c0~mv2.png/v1/fill/w_1400,h_751,al_c,q_90,enc_auto/3796d3_5703bf748d5a4c00bd9eefff534b63c0~mv2.png)

6. 编写流式 SQL 来转换数据。

```sql
选择响应:状态码作为代码，十六进制（md5 (IP 地址)）作为 hashed_ip，方法，requestedURL
来自 frontend_events WHERE response: StatusCode！='200'
```

![sql] (https://static.wixstatic.com/media/3796d3_f3ed5cf7ab544cd494984399cdd905fe~mv2.png/v1/fill/w_1400,h_696,al_c,q_90,enc_auto/3796d3_f3ed5cf7ab544cd494984399cdd905fe~mv2.png)

7. 将结果发送到另一个主题。 Timeplus 将创建一个新的外部流作为目标，并创建一个物化视图作为管道。

![数据下游] (https://static.wixstatic.com/media/3796d3_dbef875c0e5d43cc817a99aa9a8803dd~mv2.png/v1/fill/w_1399,h_1197,al_c,q_90,enc_auto/3796d3_dbef875c0e5d43cc817a99aa9a8803dd~mv2.png)

数据谱系对关系进行了可视化。

![血统] (https://static.wixstatic.com/media/3796d3_cdeb96c8d3d94e48aee684043a931427~mv2.png/v1/fill/w_1400,h_980,al_c,q_90,enc_auto/3796d3_cdeb96c8d3d94e48aee684043a931427~mv2.png)

8. 新数据可在 Kafka/Redpanda 主题中找到。

![结果] (https://static.wixstatic.com/media/3796d3_cf065642afe14c189021a492499a6a22~mv2.png/v1/fill/w_1399,h_1017,al_c,q_90,enc_auto/3796d3_cf065642afe14c189021a492499a6a22~mv2.png)
