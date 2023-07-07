# 常见问题

## 我可以在我们自己的cloud VPC中运行Timeplus吗？ {#deployment}

在 Timeplus 的前几个版本中，我们的重点是基于 AWS 的完全托管的云服务。 支持其他云供应商或混合云当然是可行的。 关于私有化部署，请与我们联系。

## 我可以加载多少数据到Timeplus？ {#datasize}

For Free Trial accounts, the total storage for each workspace is 20GB by default. 如果您需要加载或保留更多数据，请联系我们。 You can choose the storage size when you upgrade to a paid plan.

## 我能邀请其他成员到我的工作区吗？ {#invite}

Yes, the workspace owner can invite team members to access the workspace. Go to the "Settings" and "Members" tab. An email will be sent to the members and once they login, they will have the access to all objects in the workspace. More team collaboration features and fine-grained access control are in the product roadmap.

## SLA是怎么样的，我可以运行生产负载吗？ {#sla}

We don't recommend the beta users to run production workload during the beta. 请关注我们，获得更多产品信息。

## What is the IP address for Timeplus Cloud so that I can allow Timeplus to access my Kafka/Redpanda/Pulsar servers {#ip}

If you maintain an IP whitelist, you'll need to whitelist our static IP:

`44.232.236.191` for us.timeplus.cloud
