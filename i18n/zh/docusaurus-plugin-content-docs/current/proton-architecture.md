# 建筑

## 高级架构

下图描绘了 Proton 的高级架构。

![质子架构](/img/proton-high-level-arch.svg)

所有组件/功能都内置在一个二进制文件中。

## 数据存储

Users can create a stream by using `CREATE STREAM ...` [DDL SQL](proton-create-stream). Every stream has 2 parts at storage layer by default: 默认情况下，每个流在存储层有 2 个部分：

1. 实时直播数据部分，由 Timeplus NativeLog 提供支持
2. 历史数据部分，由ClickHouse历史数据存储支持。

从根本上讲，Proton 中的流是一个常规的数据库表，前面有一个复制的 Write-Ahead-Log (WAL)，但可以流式查询。

## 数据摄取

When users `INSERT INTO ...` data to Proton, the data always first lands in NativeLog which is immediately queryable. Since NativeLog is in essence a replicated Write-Ahead-Log (WAL) and is append-only, it can support high frequent, low latency and large concurrent data ingestion work loads. 由于 NativeLog 本质上是复制的 Write-Ahead-Log (WAL)，并且只能追加，因此它可以支持高频率、低延迟和大量并发数据摄取工作负载。

In background, there is a separate thread tailing the delta data from NativeLog and commits the data in bigger batch to the historical data store. Since Proton leverages ClickHouse for the historical part, its historical query processing is blazing fast as well. 由于Proton在历史部分利用了ClickHouse，因此其历史查询处理速度也非常快。

## 外部流

在很多情况下，数据已经在 Kafka/Redpanda 或其他流数据中心中，用户可以创建 [外部流](external-stream) 以指向流数据中心并直接进行流式查询处理，然后在 Proton 中实现它们或将查询结果发送到外部系统。



## 了解更多

感兴趣的用户可以参阅 [Timeplus 如何统一流媒体和历史数据处理](https://www.timeplus.com/post/unify-streaming-and-historical-data-processing) 博客，了解有关其学术基础和最新行业发展的更多详情。 你也可以在 [Kris Jenkins 的 Developer Voices 播客](https://www.youtube.com/watch?v=TBcWABm8Cro)中观看下面的视频。 Jove分享了我们的关键决策选择，Timeplus如何管理数据和状态，以及Timeplus如何使用单二进制文件实现高性能。

<iframe width="560" height="315" src="https://www.youtube.com/embed/QZ0le2WiJiY?si=eF45uwlXvFBpMR14" title="优酷视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
