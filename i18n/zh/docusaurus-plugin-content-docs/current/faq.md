# Timeplus Cloud FAQ

## 我可以在我们自己的cloud VPC中运行Timeplus吗？ {#deployment}

Certainly! [Timeplus Enterprise](timeplus-enterprise) can be installed in your local data center or cloud VPC, with similar features as Timeplus Cloud. Please [contact us](mailto:info@timeplus.com) to get more details or schedule a demo.

## How much data I can load into Timeplus Cloud? {#datasize}

对于免费帐户，默认情况下，每个工作空间的总存储空间为 20GB。 如果您需要加载或保留更多数据，请联系我们。 当您升级到付费套餐时，您可以选择存储空间大小。

## 我能邀请其他成员到我的工作区吗？ {#invite}

是的，工作空间所有者可以邀请团队成员访问工作空间。 进入“设置”和“成员”选项卡。 将向成员发送一封电子邮件，一旦他们登录，他们就可以访问工作区中的所有对象。 更多的团队协作特性和精细访问控制请查看产品路线图。

## Timeplus和Proton的关系是什么？ {#compare}

Proton 是 TimePlus 的核心引擎，于 2023 年 9 月开源。 Timeplus Cloud or Timeplus Enterprise provide external features and support. Please check the [Proton FAQ](proton-faq) for details.

## SLA是怎么样的，我可以运行生产负载吗？ {#sla}

2023年8月，TimePlus Cloud进入GA，随时准备投入生产工作量。 没有免费试用的 SLA。 对于专业等级，这一比例为99.5％。 对于企业级，这一比例为 99.9% 或以上。 详情请查看 https://timeplus.com/pricing/。 To monitor Timeplus Cloud health status, please visit or subscribe to https://timeplus.statuspage.io.

## Timeplus Cloud 的 IP 地址是多少，以便我可以允许 Timeplus 访问我的 Kafka/Redpanda/Pulsar 服务器 {#ip}

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`44.232.236.191` for us.timeplus.cloud
