# 发布说明

## 公开测试版 1

我们很高兴地启动Timeplus Cloud公开测试版。

我们将不时更新测试版，并在此页面列出关键的新功能或增强。



### 每两周更新 10/31-11/11

* 流引擎
  * 引入了一种新的 `LIMIT <n> BY <column>` 语法。 与 [emit_version()](functions#emit_version) 函数组合，您可以每次控制每次流式输出的行数。 例如
    ```sql
    SELECT cid,avg(speed_kmh) AS avgspeed, emit_version() 
    FROM tumble(car_live_data,5s) GROUP BY window_start,cid 
    LIMIT 3 BY emit_version()
    ```
  * （实验性）能够为物化视图设置保留策略，以限制每个物化视图的行数或总存储空间。 用户界面即将上线。

* 数据源、数据下游、API 和 SDK
  * 增强的 Ingest REST API 以支持 “换行符分隔的 JSON” (ndjson)。
  * 完善了 [REST API 文档](https://docs.timeplus.com/rest)，以显示不同版本的 API。
  * 新版本的 datapm CLI 带有更简单易用的Timeplus sink 只需要设置Timeplus工作空间 baseUr就可以将数据推送到 Timeplus，同时支持云端和本地 Timeplus。

* 界面改进
  * 我们添加了一个指导系统，让新用户可以快速开始使用 Timeplus。
  * 数据血缘页面做了美化。
  * (实验性) 当流的 SQL 正在运行时，列头显示最近的 10 行的值。 当SQL被暂停或取消时，列头显示所有缓存结果的信息图，并以显示一条横线作为平均值。
  * （实验性）中国市场的本地化用户界面。



### 每两周更新10/17-10/28

* 流引擎
  * 我们简化了 [session](functions#session) 时间窗口：如果您想要创建子流， 您不再需要设置 `keyBy` 列作为会话窗口的一个参数。 只需使用 `SELECT... FROM session(..) PARTITION BY keyBy` . 其它时间窗口函数([tumble](functions#tumble) and [hop](functions#hop)) 以同样方式支持 ` PARTITION BY`

  * [session](functions#session) 时间窗口的另一个增强：我们引入了一种直觉的方式来表示是否应该将启动或结束条件的事件包含在会话窗口中。 支持四种组合： `[startCondition, endCondition]`, `(startCondtion, endCondition)`, `[startCondition,endCondition)`,`(startCondition,endCondition)`

  * 我们添加了 `<agg> FILTER(WHERE...)` 的支持作为一个快捷方式，为具有某些条件的数据运行聚合，例如：
    ```sql
    select count() filter(where action='add') as cnt_action_add,
           count() filter(where action='cancel') as cnt_action_cancel 
    from table(bookings)
    ```

  * 大大降低内存消耗。

* 数据源、数据下游、API 和 SDK
  * 对于Kafka源，如果验证方法设置为“无”，将自动打开“禁用TLS”。
  * 优化 [go-client](https://github.com/timeplus-io/go-client) 开源项目以支持更底层的摄取API。
  * 实验性的 [JDBC 驱动程序](https://github.com/timeplus-io/java-demo/tree/main/src/main/java/com/timeplus/jdbc) 以开源。 您可以在某些客户端(如DataGrip)中使用此驱动程序来运行只读查询(支持流式和历史查询)

* 界面改进
  * 引入全新“查询侧面板”。 您可以扩展它来探索许多功能，例如查询片断、SQL函数、书签和历史记录。
  * 条形图是回来了。 您需要在查询中添加 `GROUP BY`。 选择“查看最新数据”，并选择“Group by”项。
  * 当您移动鼠标在实体上方时，会在“数据血缘图”页面显示更多信息。 例如，您可以看到流的数据架构以及视图背后的查询。
  * 大大提高用户对查询标签和书签的体验。 您可以轻松地为每个查询选项卡设置有意义的名称。 当查询编辑器不是空的，点击书签图标保存此 SQL 以供今后使用。 重命名或删除查询侧面板中的书签。
  * 列名和类型显示在“流目录”

### 每两周更新10/3-10/14

* 流引擎
  * 强化子流支持流级别 `by`, 例如: `SELECT cid,speed_kmh,lag(longitude) as last_long,lag(latitude) as last_lat FROM car_live_data partition by cid` 之前你必须为每个聚合函数添加 `partition by cid`。
* 界面改进
  * 单个值可视化增强，允许您开启闪光线来显示数据变化。
  * 在源和汇页中，每个项目的输送量现在列在清单中。
  * 当您点击？ 图标，我们将向您展示当前页面的相关帮助信息以及版本信息。
  * 对于新用户，我们还将作为一个可关闭的信息框，对页面的内容作简短的描述。
