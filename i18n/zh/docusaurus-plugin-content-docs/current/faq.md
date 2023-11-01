# 常见问题

## 我可以在我们自己的cloud VPC中运行Timeplus吗？ {#deployment}

在 Timeplus 的前几个版本中，我们的重点是基于 AWS 的完全托管的云服务。 支持其他云供应商或混合云当然是可行的。 关于私有化部署，请与我们联系。

## 我可以加载多少数据到Timeplus？ {#datasize}

对于免费帐户，默认情况下，每个工作空间的总存储空间为 20GB。 如果您需要加载或保留更多数据，请联系我们。 当您升级到付费套餐时，您可以选择存储空间大小。

## 我能邀请其他成员到我的工作区吗？ {#invite}

是的，工作空间所有者可以邀请团队成员访问工作空间。 进入“设置”和“成员”选项卡。 将向成员发送一封电子邮件，一旦他们登录，他们就可以访问工作区中的所有对象。 更多的团队协作特性和精细访问控制请查看产品路线图。

## Timeplus和Proton的关系是什么？ {#compare}

Proton is the core engine of Timeplus and open-sourced on September 2023. Please check the [Proton FAQ](proton-faq) for details.

## SLA是怎么样的，我可以运行生产负载吗？ {#sla}

Timeplus Cloud went GA on August 2023, ready for production workload. There is no SLA for free trial. For Professional tier, it's 99.5%. For Enterprise tier, it's 99.9% or above. Please check https://timeplus.com/pricing for more details and FAQ.

## Timeplus Cloud 的 IP 地址是多少，以便我可以允许 Timeplus 访问我的 Kafka/Redpanda/Pulsar 服务器 {#ip}

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`44.232.236.191` for us.timeplus.cloud
