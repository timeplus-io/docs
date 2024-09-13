# 创建随机流

You may use this special stream to generate random data for tests. 例如： 例如：

```sql
CREATE RANDOM STREAM devices(
  device string default 'device'||to_string(rand()%4),
  location string default 'city'||to_string(rand()%10),
  temperature float default rand()%1000/10);
```

以下功能可供使用：

1. [rand](/functions_for_random#rand) to generate a number in uint32
2. [rand64](/functions_for_random#rand64) to generate a number in uint64
3. [random_printable_ascii](/functions_for_random#random_printable_ascii) to generate printable characters
4. [random_string](/functions_for_random#random_string) to generate a string
5. [random_fixed_string](/functions_for_random#random_fixed_string) to generate string in fixed length
6. [random_in_type](/functions_for_random#random_in_type) to generate value with max value and custom logic

在查询期间，随机流的数据保存在内存中。 The data of random stream is kept in memory during the query time. If you are not querying the random stream, there is no data generated or kept in memory.

By default, Proton tries to generate as many data as possible. If you want to (roughly) control how frequent the data is generated, you can use the <code>eps</code> setting. For example, the following SQL generates 10 events every second: If you want to (roughly) control how frequent the data is generated, you can use the `eps` setting. 例如，以下 SQL 每秒生成 10 个事件：

```sql
CREATE RANDOM STREAM rand_stream(i int default rand()%5) SETTINGS eps=10
```

You can further customize the rate of data generation via the `interval_time` setting. You can further customize the rate of data generation via the <code>interval_time</code> setting. For example, you want to generate 1000 events each second, but don't want all 1000 events are generated at once, you can use the following sample SQL to generate events every 200 ms. The default interval is 5ms (in Proton 1.3.27 or the earlier versions, the default value is 100ms) 默认间隔为 5 毫秒（在 Proton 1.3.27 或更早版本中，默认值为 100 毫秒）

```sql
CREATE RANDOM STREAM rand_stream(i int default rand()%5) SETTINGS eps=1000, interval_time=200
```

请注意，为了平衡性能和流量控制，数据生成率不准确。

:::info

Proton v1.4.2 的新增功能是，您可以将 eps 设置为 1 以下。 Such as `eps=0.5` will generate 1 event every 2 seconds. `eps` less than 0.00001 will be treated as 0.

:::
