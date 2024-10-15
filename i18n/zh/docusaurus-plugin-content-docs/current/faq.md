# Timeplus 企业版常见问题解答

## 完全托管的 Timeplus 企业版 {#cloud}

### 我可以向 Timeplus 云端加载多少数据？ {#datasize}

对于免费帐户，默认情况下，每个工作空间的总存储空间为 20GB。 如果您需要加载或保留更多数据，请联系我们。 当您升级到付费套餐时，您可以选择存储空间大小。

### 我能邀请其他成员到我的工作区吗？ {#invite}

是的，工作空间所有者可以邀请团队成员访问工作空间。 进入“设置”和“成员”选项卡。 将向成员发送一封电子邮件，一旦他们登录，他们就可以访问工作区中的所有对象。 更多的团队协作特性和精细访问控制请查看产品路线图。

### SLA是怎么样的，我可以运行生产负载吗？ {#cloud_sla}

2023年8月，TimePlus Cloud进入GA，随时准备投入生产工作量。 没有免费试用的 SLA。 对于付费等级，为 99.5% 或以上。 详情请查看 https://timeplus.com/pricing/。 要监控 Timeplus Cloud 的运行状况，请访问或订阅 https://timeplus.statuspage.io。

### Timeplus Cloud 的 IP 地址是多少，以便我可以允许 Timeplus 访问我的 Kafka/Redpanda/Pulsar 服务器 {#ip}

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`44.232.236.191` for us-west-2.timeplus.cloud

## 自托管 Timeplus 企业版 {#self_host}

### 我可以在我们自己的云 VPC 或本地运行 Timeplus Enterprise 吗？ {#deployment}

当然！ [Timeplus Enterprise](/timeplus-enterprise) can be installed in your local data center or cloud VPC, with similar features as Timeplus Cloud. 你可以在 timeplus.com 或 [联系我们](mailto:info@timeplus.com) 上下载 30 天免费试用版以获取更多详情或预约演示。

## 普通的

### Timeplus Enterprise 和 Timeplus Proton 之间有什么关系？ {#compare}

Timeplus Proton 是 Timeplus Enterprise 的核心引擎，于 2023 年 9 月开源。 Timeplus 企业版提供外部功能和支持。 Please check the [Proton FAQ](/proton-faq#compare) for details.
