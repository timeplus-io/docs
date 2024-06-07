# Timeplus Enterprise FAQ

## Fully-managed Timeplus Enterprise {#cloud}

### How much data I can load into Timeplus Cloud? {#datasize}

对于免费帐户，默认情况下，每个工作空间的总存储空间为 20GB。 如果您需要加载或保留更多数据，请联系我们。 当您升级到付费套餐时，您可以选择存储空间大小。

### 我能邀请其他成员到我的工作区吗？ {#invite}

是的，工作空间所有者可以邀请团队成员访问工作空间。 进入“设置”和“成员”选项卡。 将向成员发送一封电子邮件，一旦他们登录，他们就可以访问工作区中的所有对象。 更多的团队协作特性和精细访问控制请查看产品路线图。

### SLA是怎么样的，我可以运行生产负载吗？ {#cloud_sla}

2023年8月，TimePlus Cloud进入GA，随时准备投入生产工作量。 没有免费试用的 SLA。 For the paid tier, it's 99.5% or above. 详情请查看 https://timeplus.com/pricing/。 To monitor Timeplus Cloud health status, please visit or subscribe to https://timeplus.statuspage.io.

### Timeplus Cloud 的 IP 地址是多少，以便我可以允许 Timeplus 访问我的 Kafka/Redpanda/Pulsar 服务器 {#ip}

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`44.232.236.191` for us.timeplus.cloud

## Self-hosted Timeplus Enterprise {#self_host}

### Can I run Timeplus Enterprise in our own cloud VPC or on-prem? {#deployment}

Certainly! [Timeplus Enterprise](timeplus-enterprise) can be installed in your local data center or cloud VPC, with similar features as Timeplus Cloud. You can download the 30-day free trial at timeplus.com or [contact us](mailto:info@timeplus.com) to get more details or schedule a demo.

## General

### What's relationship for Timeplus Enterprise and Timeplus Proton? {#compare}

Timeplus Proton is the core engine of Timeplus Enterprise and open-sourced on September 2023. Timeplus Enterprise provides external features and support. Please check the [Proton FAQ](proton-faq#compare) for details.
