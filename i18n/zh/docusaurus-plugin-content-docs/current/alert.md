# 告警

:::info

目前这个告警系统和用户界面是还在早期实验性阶段。 请分享您的反馈以帮助我们进行改进。

:::

Timeplus 提供开箱即用的图表和仪表板。 您也可以创建 [数据下游](/destination) 将降采样的数据发送到 Kafka 或其他消息总线，或者通过电子邮件/slack 通知其他人。 这可以是一个实现告警和自动化的解决办法。 您甚至可以向 Kafka 发送新消息，然后在下游系统中及时消费这样的消息。

由于定义和管理告警是一个常见需求，Timeplus 开始支持开箱即用的告警。

## 创建新的告警规则

访问 `/console/alerts` 页面打开新的告警管理器。

您可以选中该按钮来创建新告警。 参数：

* 名称：必填项，用于在工作区中的其他告警中识别告警的唯一名称。
* 严重性：严重、高、低。
* 描述：描述告警目的或逻辑的可选文本。
* 触发器 SQL：必需。 一个流式 SQL。 一旦查询得出任何新结果，Timeplus 就会触发告警。
* 清除 SQL：可选。 一个流式 SQL。 一旦查询得出任何新结果，Timeplus 会将此告警设置为已解决。
* 输出：目前我们支持 Slack 和 PagerDuty 来通知用户。
  * Slack：
    * Webhook URL：必填。 Please follow the [guide](/destination#slack) to create one from slack.com.
    * （触发器）消息正文：可选。 消息标题为 `ALERT_NAME 上的新告警已触发！ ` 默认情况下，消息为 `事件：JSON` 您可以自定义默认模板。 使用 `{{.column}}` 表达式引用每列的值。
    * （清除）消息正文：可选。 消息标题为 `ALERT_NAME 上的告警已解决！` 默认情况下，消息为 `事件：JSON` 您可以自定义默认模板。 使用 `{{.column}}` 表达式引用每列的值。
  * PagerDuty：
    * 路由密钥：必需。 32 个字符的集成密钥，用于在 PagerDuty 服务或规则集上集成。  有关详细信息，请查看 PagerDuty 文档。
    * 组件：可选，关于哪个组件出错的额外上下文。

示例：

* 您可以设置触发 SQL 为 `select avg(speed_kmh) as avg from tumble(car_live_data,5s) group by window_start having avg>51`
* 清除 SQL 为 `select avg(speed_kmh) as avg from tumble(car_live_data,5s) group by window_start having avg<=51`
* 触发消息的消息正文为 `平均车速为 {{.avg}}`

## 列出告警

**告警** 选项卡显示告警历史记录。 告警状态为“告警”或“正常”。 您可以手动解决处于 ALERT 状态的告警。



## 列出告警规则

**告警规则** 选项卡列出了所有已定义的告警规则。 无论告警状态如何，您都可以编辑或删除规则或解决一个告警。

