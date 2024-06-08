# GitHub 的实时见解

在本教程中，您将处理来自 GitHub 的实时数据。 我们已经设置了一个可公开访问的 Kafka 集群，供您使用来自 Kafka 主题的数据。 如果您使用的是Timeplus Cloud，则还可以构建实时仪表板和警报。

## 阅读 GitHub 活动流

我们都喜欢 GitHub。 但是你知道Github现在的趋势是什么吗？ 你知道在过去 10 分钟内哪些回购获得的推送量或 PR 评论最多的吗？ https://github.com/trending 有每日/每周排行榜，但没有实时提要。

你可以编写一个使用专用 [个人访问令牌] (https://github.com/settings/tokens) 调用 [GitHub Events API] (https://docs.github.com/en/rest/reference/activity) 的脚本。请注意，来自GitHub API的公共活动有5分钟的延迟（[源代码]（https://docs.github.com/en/rest/reference/activity#list-public-events））。

这里有一个 [Python 脚本示例] (https://github.com/timeplus-io/github_liveview/blob/develop/github_demo.py) 供你参考。 但是我们已经允许通过Kafka API访问实时数据。

在 Timeplus 中，你可以通过 [外部流]（外部流）从 Kafka 读取数据。 以下是创建这样的外部流以从 Aiven 上的 Kafka 集群读取内容的 SQL：

```sql
创建外部流 github_events
(
  演员字符串，
  created_at 字符串，
  id 字符串，
  有效负载字符串，
  回购字符串，
  类型字符串
)
设置类型 = 'kafka'， 
         brokers = 'kafka-public-read-timeplus。a.aivencloud.com: 28864'， 
         topic = 'github_events'， 
         data_format='jsoneachrow'，
         sasl_mechanics = 'SCRAM-SHA-256'， 
         用户名 = '只读'， 
         密码 = 'avns_muadrshcpeepa93AQY_'， 
         security_protocol = 'SASL_SSL'， 
         skip_ssl_cert_check== true
COMMENT '要阅读的外部流来自 Aiven for Apache Kafka 的 JSON 格式的 GitHub 活动
```

只需通过 Timeplus 网络用户界面中的 “Proton客户端” 或 **SQL 控制台** 运行这个 SQL 即可。 此 Kafka 用户配置为对主题/集群的只读访问权限。 我们可能会更改密码。 如果密码不起作用，请回来。

## 串流 SQL 示例

### 流尾巴

您可以通过以下方式浏览实时数据

```sql
从 github_events 中选择 *
```

这是一个流式的 SQL，会继续阅读 Kafka 主题中的新事件。 您需要手动取消查询才能终止查询。

### 流过滤器

在 WHERE 子句中添加一些条件以应用流媒体过滤器，例如

```sql
从 github_events 中选择 * 其中 type='watchEvent'
```

### 聚合

#### 全球聚合

```sql
从 github_events 中选择计数 (*)
```

这将显示自查询开始以来收到了多少新事件。 因此，你可能会看到像158这样的数字，然后在几秒钟后看到334这样的数字。

这就是所谓的 [全局聚合]（查询语法 #global）。

#### 滚动聚合

```sql
选择 window_start、repo、count (*) 
FROM tumble (github_events,30s) 
按 window_start、repo 分组
```

此查询每 30 秒按存储库统计一次事件。 滚动窗户是固定窗口，没有重叠。 `30s` 是 SQL 表达式 `INTERVAL 30 SECOND` 的快捷方式。 你也可以使用 2m 表示 2 分钟，使用 3h 表示 3 小时。

请注意，此查询最多需要等待 30 秒才能显示第一个结果。 因为默认情况下，在 Timeplus 中传输 SQL 将查找未来的事件，而不是现有的事件。 我们很快将讨论如何获得过去的数据。

#### 跳跃聚合

```sql
选择 window_start、repo、count (*) 
FROM hop (github_events,1s,30s) 
按 window_start、repo 分组
```

此查询每 30 秒按 repo 对事件进行一次计数，每秒更新一次结果。 Hop window 也称为滑动窗口。

## 时光倒流

默认情况下，在 Timeplus 中传输 SQL 将查找未来的事件，而不是现有事件。 对于外部流，你可以使用 'SETTINGS seek_to='。。'\`返回 Kafka 主题中过去的时间戳或偏移量。 例如，如果你想获得自 4 月 1 日以来的活动总数，你可以运行：

```sql
从 github_events 中选择计数 (*) 
设置 seek_to='2024-04-01'
```

如果你想在 6 小时前获取数据：

```sql
从 github_events 中选择计数 (*) 
设置 seek_to='-6h'
```

## 在 Timeplus 中保存 Kafka 数据

使用外部流在 Kafka 中查询数据不会占用 Timeplus 中的任何存储空间。 在某些情况下，你可能希望将数据保存在Timeplus中，这样你就可以应用更复杂的数据处理，或者避免在Kafka上加载过多的查询，或者想在Kafka上设置一个小的保留政策，但可以在Timeplus中保留更多的数据。

你可以创建一个物化视图来在 Timeplus 中保存数据，例如

```sql
创建物化视图 mv 作为
SELECT * 来自 github_events
```

物化视图是一个长时间运行的查询，用于将流 SQL 结果传送到其内部存储中。 您也可以使用物化视图将数据写入其他流、外部流或外部表。 这可以建立流媒体管道。

您可以像其他流一样在物化视图中查询数据，例如

```sql
从 mv 中选择 * 其中 type='watchEvent'
```

## 了解更多

你可以查看 [这个博客] (https://www.timeplus.com/post/github-real-time-app) 了解更多详情。
