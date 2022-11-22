# 已知问题和限制

我们目前处于早期阶段。 请注意以下已知问题和限制。

## UI

* 您可以使用移动浏览器注册Timeplus云。 但只支持Microsoft Edge或Google Chrome 桌面浏览器才能使用 Timeplus 控制台。
* 同一工作区的用户将看到所有活动历史和定义，例如视图、 告警、 仪表盘。

## 后端

* 当您定义一个流或实际化视图时，您应该避免使用 `window_start` 和 `window end` 作为列名称。 这将与 `window start` and `window end` 的动态列名称 `tumble` `hop`, `session` 窗口 您可以创建别名，同时创建物化视图，例如 `select window_start as windowStart, window_end as windowEnd, count(*) as cnt from tumble(stream,10s) group by window_start, window_end`
* `create view` 不支持 `json` 类型列。 当从 `json` 列的流中创建视图时，不能选择 `json` 列为整个列。 需要在视图定义中选择JSON文档的叶节点。