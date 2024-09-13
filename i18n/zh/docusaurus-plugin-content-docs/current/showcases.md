# 用例

在Timeplus，我们将自己的技术应用于许多不同的用例。 我们的许多客户还为使用Timeplus构建实时解决方案提供了创造性的方法。 本文档列出了不同类别的已知用例。 希望这能激发您以较低的成本和精力从实时数据中获得更多见解。

如果你想分享一个有趣的用例，请加入 [Timeplus 社区 Slack](https://timeplus.com/slack)。

## 金融科技

### 实时交易后分析 {#posttrade}

基于交易后资本市场的真实客户场景，我们将实时市场和交易数据转化为实时见解。

> “Timeplus填补了当今瞬息万变的市场中的一个重大空白，在这个市场中，企业必须实现实时发展，否则就会过时。 它使从流数据中提取见解变得更加容易，使我们无需编写数千行代码和数百小时的开发。 监控和分析大量实时投资数据的能力可以加强风险控制和成本分析。” _-王凌，华泰证券 IT 主管_

[阅读案例研究](https://www.timeplus.com/post/unlocking-real-time-post-trade-analytics-with-streaming-sql) | [观看现场演示](https://demo.timeplus.cloud)

![交易后分析仪表板](https://static.wixstatic.com/media/2d747e_819ee33799004a11ac9f31c0bf452bb6~mv2.png/v1/fill/w_1480,h_652,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_819ee33799004a11ac9f31c0bf452bb6~mv2.png)

### 实时定价

作为我们的首批案例研究之一，看看领先的金融科技公司Alpha Stream如何部署Timeplus来快速升级其实时分析功能。

> "We are able to simply plug the sources into Timeplus and start writing queries over the streaming data to get the results. No need to compile and deploy a code. This makes prototyping to deploy applications really fast." *-Hamilton Araujo, Managing Director, Alpha Stream* 无需编译和部署代码。 这使得部署应用程序的原型设计变得非常快。” _-Hamilton Araujo，Alpha Stream 董事总经理_

[阅读案例研究](https://www.timeplus.com/post/real-time-pricing-made-easy)

![SQL 图](https://static.wixstatic.com/media/b32125_b56eae05ae094ae8a83e2bc6ab62b96e~mv2.png/v1/fill/w_1480,h_512,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_b56eae05ae094ae8a83e2bc6ab62b96e~mv2.png)

## 开发运营

### 实时可观测性

在Timeplus，我们收集各种日志、指标和使用情况数据，并将它们发送到我们自己的Timeplus工作空间，以持续监控基础架构并发出警报。

[阅读案例研究](https://www.timeplus.com/post/unlocking-cloud-observability-with-confluent-and-timeplus-cloud)

![k8s 集群图](https://static.wixstatic.com/media/2d747e_a66d09ceedcd4e66b3254490898153b5~mv2.png/v1/fill/w_1480,h_470,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_a66d09ceedcd4e66b3254490898153b5~mv2.png)

![云集群图](https://static.wixstatic.com/media/2d747e_d513fedaff0546629c5fa2c295d7b24f~mv2.png/v1/fill/w_1480,h_838,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_d513fedaff0546629c5fa2c295d7b24f~mv2.png)

![Timeplus 可观测性控制面板](https://static.wixstatic.com/media/2d747e_5d536b2b6e7549139195ccbb267c49e0~mv2.png/v1/fill/w_1480,h_568,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_5d536b2b6e7549139195ccbb267c49e0~mv2.png)

![Timeplus 可观测性仪表盘 2](https://static.wixstatic.com/media/2d747e_ca3b5307ffcc4ab29cb8b57c1cc572d7~mv2.png/v1/fill/w_1480,h_574,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_ca3b5307ffcc4ab29cb8b57c1cc572d7~mv2.png)

### 计量基于使用量的定价

By leveraging streaming SQL, [Versioned Stream](/versioned-stream), [HTTP ingestion](/ingest-api), [HTTP sink](/destination#http) and many other features, we collect real-time infrastructure usage per tenants, apply lookup and aggregation, and send data to our usage-based pricing vendor, ([Paigo](https://paigo.tech/)).

[阅读案例研究](https://www.timeplus.com/post/usage-based-pricing-with-timeplus-and-paigo).

![解决方案概述](https://static.wixstatic.com/media/b32125_5723162765cc4b50be5be68243c84e97~mv2.png/v1/fill/w_1480,h_798,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_5723162765cc4b50be5be68243c84e97~mv2.png)

### 实时GitHub见解

我们都喜欢 GitHub。 但是你知道Github现在的趋势是什么吗？ We all love GitHub. But do you know what’s trending on Github right now? We built a real-time app with Timeplus API and GitHub API.

[阅读案例研究](https://www.timeplus.com/post/github-real-time-app) | 演示： [Timeplus Cloud](https://demo.timeplus.cloud), [Streamlit](https://timeplus.streamlit.app/github_dashboard) | [Github repo](https://github.com/timeplus-io/streamlit_apps)

![GitHub 的实时见解](https://static.wixstatic.com/media/b32125_10d7aa79909c48549e45f09df54ca93d~mv2.png/v1/fill/w_1480,h_642,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_10d7aa79909c48549e45f09df54ca93d~mv2.png)

## 安全合规

### 容器漏洞监控 {#container}

Build real-time monitoring systems for container vulnerabilities with Timeplus. Eric Guo, DevOps Director of Aurora Health Science & Technology Co., shares how his team set up a system to provide actionable insights to keep their system secure at all times. Aurora Health Science & Technology Co. 的开发运营总监 Eric Guo 分享了他的团队如何建立一个系统，以提供切实可行的见解，从而始终保持系统安全。

> "We are delighted to have integrated Timeplus into our data infrastructure at Aurora, replacing our previous Flink clusters while utilizing just a fraction of the hardware resources, a reduction of nearly 80%. With Timeplus, we have significantly improved the analytical capabilities of AuroraPrime, reducing the turnaround time for user-facing reports and dashboards." *– Eric Guo, DevOps Director, Aurora* 借助Timeplus，我们显著提高了AuroraPrime的分析能力，缩短了面向用户的报告和仪表板的周转时间。” _— Aurora 开发运营总监 Eric Guo_

[阅读案例研究](https://www.timeplus.com/post/real-time-container-vulnerabilities-monitoring)

![容器漏洞](https://static.wixstatic.com/media/b32125_6e0d3f93addb4af3a0f3f06fc2b1ca8c~mv2.png/v1/fill/w_1389,h_700,al_c,q_90,enc_auto/b32125_6e0d3f93addb4af3a0f3f06fc2b1ca8c~mv2.png)

### 监控超级区块的用户活动

在 Timeplus，我们使用 [Superblocks](http://superblocks.com/)构建了一些内部工具。 At Timeplus, we built a few internal tools with [Superblocks](http://superblocks.com/). To track how our internal tools are being used, we configured Superblocks to send audit logs and user activities to Confluent Cloud, then load them into Timeplus. Next, we built dashboards and alerts in our own platform to understand the usage or capture any potential issues. 接下来，我们在自己的平台上构建了仪表板和警报，以了解使用情况或捕获任何潜在问题。

![超级区块仪表板屏幕截图](https://static.wixstatic.com/media/b32125_f955e16bbdb84ca4866df92a37849243~mv2.png/v1/fill/w_1480,h_572,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_f955e16bbdb84ca4866df92a37849243~mv2.png)

[阅读案例研究](https://www.timeplus.com/post/monitor-superblocks-user-activities)

### 保护 Slack 中的敏感信息 {#slack}

许多组织依靠 [Slack](https://slack.com/about) 来联系数字总部中的人员、工具、客户和合作伙伴。 Many organizations rely on [Slack](https://slack.com/about) to connect people, tools, customers, and partners in a digital HQ. We built a showcase app to demonstrate how to process messages in real-time and trigger actions via the Timeplus platform, for example, removing messages that contain sensitive keywords.

[阅读案例研究](https://www.timeplus.com/post/build-a-real-time-security-app-in-3-easy-steps)

![高级](https://static.wixstatic.com/media/b32125_8c9d89828b7e49af97282327f0385248~mv2.png/v1/fill/w_1393,h_450,al_c,q_90,enc_auto/b32125_8c9d89828b7e49af97282327f0385248~mv2.png)

## 物联网

### 实时车队监控 {#fleet}

仅使用 SQL 即可实时了解车队运营情况。 Gain real-time visibility into fleet operations using only SQL. Based on real-world customer scenarios, here's how to monitor the entire truck fleet’s status in real-time to detect speeding and fatigued drivers, and to conduct geofencing related checks.

> "We are thrilled to partner with Timeplus and gain real-time visibility to our 2000+ trucks, with much lower latency, smarter alerts and shorter Time-To-Value, compared to our previous solutions." *- Minfeng Xie, Chief Technology Officer, Duckbill* _-谢敏峰，首席技术官，Duckbill_

[阅读案例研究](https://www.timeplus.com/post/case-study-real-time-fleet-monitoring-with-timeplus) | [观看现场演示](https://demo.timeplus.cloud/)

![高级](https://static.wixstatic.com/media/2d747e_3cb2207a6b154e70960e7a8f9dd0d43e~mv2.png/v1/fill/w_1366,h_821,al_c,q_90,enc_auto/2d747e_3cb2207a6b154e70960e7a8f9dd0d43e~mv2.png)

### 来自手机的实时传感器数据 {#phone}

[Sensor Logger](https://github.com/tszheichoi/awesome-sensor-logger#live-data-streaming) is a free, easy-to-use, cross-platform data logger that logs readings from common motion-related sensors on smartphones. It can push data to Timeplus via the [Ingest API](ingest-api), allowing you to build real-time dashboards. It can push data to Timeplus via the [Ingest API](/ingest-api), allowing you to build real-time dashboards.

[观看演示视频](https://www.youtube.com/watch?v=iWA8FHjyatE)

![Jove 的演示](https://user-images.githubusercontent.com/30114997/224557365-dfe593f5-e84f-4fcf-9900-9bcfd31c5e44.png)

## 视频流

### 分析 Livepeer 视频参与度指标

视频参与度指标对视频创作者很重要，这些指标是衡量内容质量的重要指标，可以帮助用户有效地管理时间，促进与内容创作者和其他观众的互动，并有助于改善视频共享平台上的整体用户体验。

2023 年 5 月，Livepeer 发布了这些 [参与度指标](https://docs.livepeer.org/guides/developing/viewer-engagement) 的版本，提供了有关您平台上的观众行为和播放质量的详细信息。 该API包括观看次数和观看时间等参与度指标，以及各种维度的性能指标，例如错误率、第一帧时间、再缓冲比率和开机前退出。

In [this blog](https://www.timeplus.com/post/how-to-analyze-livepeer-video-engagement-metrics-with-timeplus), we showed you how Timeplus can be used to create analytic solutions for Livepeer engagement metrics with a few commands.

![Timeplus 视频参与度分析的屏幕截图](https://static.wixstatic.com/media/2d747e_5c4f8e19e77e49f0aba59552cf6b6c3a~mv2.png/v1/fill/w_740,h_357,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2d747e_5c4f8e19e77e49f0aba59552cf6b6c3a~mv2.png)

## 客户 360

### 新注册的 Auth0 通知 {#signup}

像许多其他公司一样，我们选择 [Auth0](https://auth0.com/) 作为我们云产品的身份验证和授权平台。 With our powerful [Ingestion API](/ingest-api), we can easily route all Auth0 new user signup events to Timeplus with webhook, then build real-time slack notifications to one private channels for Product Manager to engage with new users at real-time.

### HubSpot 自定义仪表板/警报 {#hubspot}

我们使用 [HubSpot](https://hubspot.com/) 作为我们的 CRM 系统。 We use [HubSpot](https://hubspot.com/) as our CRM system. We have built sink connectors for both [AirByte](https://github.com/airbytehq/airbyte/pull/21226) and [Meltano](https://github.com/timeplus-io/target-timeplus) Batch jobs are configured to use the HubSpot source connector to send data to Timeplus workspace. This kind of basic customer information can be used to build custom dashboards, alerts and lookups to enrich other data. 这种基本的客户信息可用于构建自定义仪表板、警报和查询，以丰富其他数据。

### Jitsu 点击流分析

We use the open source [Jitsu](https://jitsu.com/) platform to collect event data from every source - web, email, chatbot, CRM - into our choice of data stack: Timeplus. The free version of Jitsu Cloud allows you to send events out via a webhook. With our powerful [Ingestion API](ingest-api), those page view data arrive in Timeplus workspace in real-time and help us to understand the usage pattern, from past 0.6 second to past 6 months. 免费版的 Jitsu Cloud 允许你通过网络挂钩发送事件。 With our powerful [Ingestion API](/ingest-api), those page view data arrive in Timeplus workspace in real-time and help us to understand the usage pattern, from past 0.6 second to past 6 months.

### 实时推特营销 {#twitter}

Twitter（X）全是关于正在发生的事情和人们现在在谈论什么。 我们与 [datapm](https://datapm.io/) 合作，发布了 [博客](https://www.timeplus.com/post/real-time-twitter-marketing) ，分享Timeplus和DataPM如何帮助你在几分钟内开发出一款无需任何代码的实时推特营销应用程序。 这使得创建实时社交监听应用程序以了解客户如何谈论您的公司或产品，并使用热门话题来计划下一个社交营销活动变得非常容易。

![推特屏幕截图](https://static.wixstatic.com/media/b32125_9cc9aa162b174834a4b7994f69eb33ca~mv2.png/v1/fill/w_1480,h_664,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_9cc9aa162b174834a4b7994f69eb33ca~mv2.png)

## 杂项

### 野火监测和警报

我们与 [Crul](https://www.crul.com/) 合作分析了野火网站数据，并向Timeplus发送了自定义监控和警报。

[阅读案例研究](https://www.timeplus.com/post/integrating-timeplus-crul)

![野火屏幕截图](https://static.wixstatic.com/media/b32125_b655043ec56c4fac920e3697bfc1049b~mv2.png/v1/fill/w_1480,h_902,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_b655043ec56c4fac920e3697bfc1049b~mv2.png)

### 数据驱动的家长{#baby}

一位充满激情的 Timeplus 用户分享了如何使用 Timeplus 从 [Data.gov](https://www.kaggle.com/datasets/kaggle/us-baby-names)提供的数据中分析宝宝的名字。

> 现在，我妻子有一些好名字的建议触手可及（实际上，我给了她一个仪表板，我正在向她的手机发送一个Kafka流，以备不时之需），她将能够做出明智的决定。

![宝宝的名字](/img/babynames.png)
