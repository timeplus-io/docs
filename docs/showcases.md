# Showcases

At Timeplus, we drink our own champagne and apply our technologies in many different use cases. Many our customers also contribute creative ways to build real-time solutions with Timeplus. This document lists known use cases in different categories. Hopefully this can inspire you to gain more insights from real-time data with low cost and effort.

If you have an interesting use case you'd like to share, please join the [Timeplus Community Slack](https://timeplus.com/slack).

## Real-Time Analytics

### Optimized MySQL-to-ClickHouse CDC Pipeline {#cdc}

[Salla](https://salla.com/), Saudi Arabia's leading e-commerce platform provider, partnered with Timeplus to improve the efficiency of its CDC and ETL data pipeline, from MySQL to ClickHouse. By implementing Timeplus Enterprise, they significantly reduced the CPU and memory footprint of ClickHouse and expanded the scope of analytics to handle e-commerce data from thousands of MySQL tables.

Salla chose Timeplus Enterprise to modernize their data infrastructure, by adding Timeplus between the Kafka and ClickHouse.
![diagram](https://static.wixstatic.com/media/3796d3_e2dc78b7abe1410dbbfb50a15a076637~mv2.png/v1/fill/w_940,h_209,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/3796d3_e2dc78b7abe1410dbbfb50a15a076637~mv2.png)

[Read case study](https://www.timeplus.com/post/customer-story-salla)

### ksqlDB Alternative

[ksqlDB](https://www.confluent.io/product/ksqldb/), a stream processing engine by Confluent, is primarily designed for consuming data from Apache Kafka topics, performing stateless or stateful transformations, and writing results back to Kafka. For comprehensive analytical querying, data typically needs to be offloaded to specialized downstream systems. While ksqlDB offers some capabilities for querying derived state (e.g., materialized views), these ad-hoc queries are generally restricted to primary key lookups or simple range scans.

1️⃣ Limited Ad-Hoc Querying and Join Capabilities: ksqlDB's query capabilities fall short of those offered by traditional databases or data warehouses, primarily supporting key-based lookups and range scans. Its JOIN operations are also restricted, often limited to primary key relationships.

2️⃣ Performance Considerations: ksqlDB's performance can be affected by serialization/deserialization overhead between Apache Kafka and its underlying state store (RocksDB). Its tight coupling with Kafka, involving frequent data transmission and reception, can contribute to increased latency and operational costs.

3️⃣ State Management Complexity: Managing ksqlDB state stores can be challenging due to limitations in Time-To-Live (TTL) configurations and other storage settings. State persistence, often reliant on Kafka topics, can lead to increased storage and network bandwidth requirements for achieving high availability and resilience.

Timeplus is designed from the ground up in C++ based on database technology but extended for Stream Processing. his allows for a much simpler and more performant system for data ingestion, processing and analytics all in one single binary. Data products created within Timeplus can be pushed out to external systems via Streaming or consumed via Ad-hoc querying. As such it can easily integrate into the wider ecosystem of systems that integrate with Apache Kafka or Database/BI Tools.

[Learn more](https://demos.timeplus.com/#/id/ksql_alternative).

## Observability

### OpenTelemetry + SQL

[OpenTelemetry (OTel)](https://opentelemetry.io/) provides a standardized framework of APIs, SDKs, and tools for instrumenting, generating, collecting, and exporting telemetry data (metrics, logs, and traces). This data is crucial for analyzing software performance and behavior. OTel collectors, deployable on systems such as Linux, can export this data, often as JSON documents, to messaging systems like Apache Kafka. Timeplus can then consume this data for streaming ETL, data routing, alert generation, and real-time visualization.

![o11y](https://demos.timeplus.com/screenshots/opentelemetry/lineage.png)

[Learn more](https://demos.timeplus.com/#/id/opentelemetry).

## AI

### Real-Time AI Hallucination Detection

While AI agents get smarter and more independent, what happens when they make mistakes? It’s important that we have a way to watch them closely and catch errors as they happen.

We built an application where two AI agents play chess against each other (based on the autogen core samples). Each agent uses a language model to think about the game and make moves. It looks simple, but it's actually a great way to test and learn how AI agents behave.

![chess](https://static.wixstatic.com/media/3796d3_3e6447350fce43eba42602443fa0d418~mv2.png/v1/fill/w_740,h_361,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/3796d3_3e6447350fce43eba42602443fa0d418~mv2.png)

[Blog](https://www.timeplus.com/post/ai-chess-hallucination-detection)

### Real-Time AI and Machine Learning with SQL and Python UDF

SQL and Python are two of the most widely used tools in the data domain, both have their strengths and weaknesses, and understanding when to use each can help maximize efficiency and performance in data analysis, machine learning, and data transformation tasks.

![UDF](https://static.wixstatic.com/media/3796d3_7e2fb7d83d474e04a410d3ebd20b8cb6~mv2.png/v1/fill/w_740,h_471,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/3796d3_7e2fb7d83d474e04a410d3ebd20b8cb6~mv2.png)

[Blog](https://www.timeplus.com/post/python-udf)

## FinTech

### Real-time post-trade analytics {#posttrade}

Based on real-world customer scenarios for post-trade capital markets, we turn real-time market and transaction data into real-time insights.

> "Timeplus fills a major gap in today’s rapidly changing markets, where businesses must go real-time or become obsolete. It makes extracting insights from streaming data even easier, saving us from writing thousands of lines of code and hundreds of hours of development. The ability to monitor and analyze massive amounts of real-time investment data leads to greater risk control and cost analysis.” _-Ling Wang, Head of IT, Huatai Securities_

[Read case study](https://www.timeplus.com/post/unlocking-real-time-post-trade-analytics-with-streaming-sql) | [See live demo](https://demo.timeplus.cloud)

![Post-trade analytics dashboard](https://static.wixstatic.com/media/2d747e_819ee33799004a11ac9f31c0bf452bb6~mv2.png/v1/fill/w_1480,h_652,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_819ee33799004a11ac9f31c0bf452bb6~mv2.png)

### Real-time pricing

As one of our first case studies, check out how leading fintech player Alpha Stream deployed Timeplus to quickly upgrade its real-time analytics capabilities.

> "We are able to simply plug the sources into Timeplus and start writing queries over the streaming data to get the results. No need to compile and deploy a code. This makes prototyping to deploy applications really fast." _-Hamilton Araujo, Managing Director, Alpha Stream_

[Read case study](https://www.timeplus.com/post/real-time-pricing-made-easy)

![SQL diagram](https://static.wixstatic.com/media/b32125_b56eae05ae094ae8a83e2bc6ab62b96e~mv2.png/v1/fill/w_1480,h_512,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_b56eae05ae094ae8a83e2bc6ab62b96e~mv2.png)

## DevOps

### Real-time observability

At Timeplus, we collect various logs, metrics and usage data and send them to our own Timeplus workspace for continuously infrastructure monitoring and alerts.

[Read case study](https://www.timeplus.com/post/unlocking-cloud-observability-with-confluent-and-timeplus-cloud)

![k8s cluster diagram](https://static.wixstatic.com/media/2d747e_a66d09ceedcd4e66b3254490898153b5~mv2.png/v1/fill/w_1480,h_470,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_a66d09ceedcd4e66b3254490898153b5~mv2.png)

![Cloud cluster diagram](https://static.wixstatic.com/media/2d747e_d513fedaff0546629c5fa2c295d7b24f~mv2.png/v1/fill/w_1480,h_838,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_d513fedaff0546629c5fa2c295d7b24f~mv2.png)

![Timeplus observability dashboard](https://static.wixstatic.com/media/2d747e_5d536b2b6e7549139195ccbb267c49e0~mv2.png/v1/fill/w_1480,h_568,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_5d536b2b6e7549139195ccbb267c49e0~mv2.png)

![Timeplus observability dashboard 2](https://static.wixstatic.com/media/2d747e_ca3b5307ffcc4ab29cb8b57c1cc572d7~mv2.png/v1/fill/w_1480,h_574,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_ca3b5307ffcc4ab29cb8b57c1cc572d7~mv2.png)

### Metering for usage-based pricing

By leveraging streaming SQL, [Versioned Stream](/versioned-stream), [HTTP ingestion](/ingest-api), [WebHook sink](/send-data-out#webhook) and many other features, we collect real-time infrastructure usage per tenants, apply lookup and aggregation, and send data to our usage-based pricing vendor, ([Paigo](https://paigo.tech/)).

[Read case study](https://www.timeplus.com/post/usage-based-pricing-with-timeplus-and-paigo).

![Solution overview](https://static.wixstatic.com/media/b32125_5723162765cc4b50be5be68243c84e97~mv2.png/v1/fill/w_1480,h_798,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_5723162765cc4b50be5be68243c84e97~mv2.png)

### Real-time GitHub insights

We all love GitHub. But do you know what’s trending on Github right now? We built a real-time app with Timeplus API and GitHub API.

[Read case study](https://www.timeplus.com/post/github-real-time-app) | Demo: [Timeplus Cloud](https://demo.timeplus.cloud), [Streamlit](https://timeplus.streamlit.app/github_dashboard) | [Github repo](https://github.com/timeplus-io/streamlit_apps)

![Real-time insights for GitHub](https://static.wixstatic.com/media/b32125_10d7aa79909c48549e45f09df54ca93d~mv2.png/v1/fill/w_1480,h_642,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_10d7aa79909c48549e45f09df54ca93d~mv2.png)

## Security Compliance

### Container vulnerability monitoring {#container}

Build real-time monitoring systems for container vulnerabilities with Timeplus. Eric Guo, DevOps Director of Aurora Health Science & Technology Co., shares how his team set up a system to provide actionable insights to keep their system secure at all times.

> "We are delighted to have integrated Timeplus into our data infrastructure at Aurora, replacing our previous Flink clusters while utilizing just a fraction of the hardware resources, a reduction of nearly 80%. With Timeplus, we have significantly improved the analytical capabilities of AuroraPrime, reducing the turnaround time for user-facing reports and dashboards." _– Eric Guo, DevOps Director, Aurora_

[Read case study](https://www.timeplus.com/post/real-time-container-vulnerabilities-monitoring)

![Container vulnerability](https://static.wixstatic.com/media/b32125_6e0d3f93addb4af3a0f3f06fc2b1ca8c~mv2.png/v1/fill/w_1389,h_700,al_c,q_90,enc_auto/b32125_6e0d3f93addb4af3a0f3f06fc2b1ca8c~mv2.png)

### Monitor Superblocks user activities

At Timeplus, we built a few internal tools with [Superblocks](http://superblocks.com/). To track how our internal tools are being used, we configured Superblocks to send audit logs and user activities to Confluent Cloud, then load them into Timeplus. Next, we built dashboards and alerts in our own platform to understand the usage or capture any potential issues.

![Superblocks dashboard screenshot](https://static.wixstatic.com/media/b32125_f955e16bbdb84ca4866df92a37849243~mv2.png/v1/fill/w_1480,h_572,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_f955e16bbdb84ca4866df92a37849243~mv2.png)

[Read case study](https://www.timeplus.com/post/monitor-superblocks-user-activities)

### Protect sensitive information in Slack {#slack}

Many organizations rely on [Slack](https://slack.com/about) to connect people, tools, customers, and partners in a digital HQ. We built a showcase app to demonstrate how to process messages in real-time and trigger actions via the Timeplus platform, for example, removing messages that contain sensitive keywords.

[Read case study](https://www.timeplus.com/post/build-a-real-time-security-app-in-3-easy-steps)

![highlevel](https://static.wixstatic.com/media/b32125_8c9d89828b7e49af97282327f0385248~mv2.png/v1/fill/w_1393,h_450,al_c,q_90,enc_auto/b32125_8c9d89828b7e49af97282327f0385248~mv2.png)

## IoT

### Real-time fleet monitoring {#fleet}

Gain real-time visibility into fleet operations using only SQL. Based on real-world customer scenarios, here's how to monitor the entire truck fleet’s status in real-time to detect speeding and fatigued drivers, and to conduct geofencing related checks.

> "We are thrilled to partner with Timeplus and gain real-time visibility to our 2000+ trucks, with much lower latency, smarter alerts and shorter Time-To-Value, compared to our previous solutions." _- Minfeng Xie, Chief Technology Officer, Duckbill_

[Read case study](https://www.timeplus.com/post/case-study-real-time-fleet-monitoring-with-timeplus) | [See live demo](https://demo.timeplus.cloud/)

![highlevel](https://static.wixstatic.com/media/2d747e_3cb2207a6b154e70960e7a8f9dd0d43e~mv2.png/v1/fill/w_1366,h_821,al_c,q_90,enc_auto/2d747e_3cb2207a6b154e70960e7a8f9dd0d43e~mv2.png)

### Real-time sensor data from your phone {#phone}

[Sensor Logger](https://github.com/tszheichoi/awesome-sensor-logger#live-data-streaming) is a free, easy-to-use, cross-platform data logger that logs readings from common motion-related sensors on smartphones. It can push data to Timeplus via the [Ingest API](/ingest-api), allowing you to build real-time dashboards.

[Watch demo video](https://www.youtube.com/watch?v=iWA8FHjyatE)

![Jove's demo](https://user-images.githubusercontent.com/30114997/224557365-dfe593f5-e84f-4fcf-9900-9bcfd31c5e44.png)

## Video Streaming

### Analyze Livepeer Video Engagement Metrics

Video engagement metrics are important to video creators, which serve as valuable indicators of content quality, help users manage their time effectively, facilitate interaction with content creators and other viewers, and contribute to the overall user experience on video-sharing platforms.

In May 2023, Livepeer released their version of these [engagement metrics](https://docs.livepeer.org/guides/developing/viewer-engagement) offering detailed information on viewer behavior and playback quality on your platform. The API includes engagement metrics such as view counts and watch time, as well as performance metrics such as error rate, time to first frame, rebuffer ratio, and exit-before-starts across a variety of dimensions.

In [this blog](https://www.timeplus.com/post/how-to-analyze-livepeer-video-engagement-metrics-with-timeplus), we showed you how Timeplus can be used to create analytic solutions for Livepeer engagement metrics with a few commands.

![screenshot of video engagement analysis with Timeplus](https://static.wixstatic.com/media/2d747e_5c4f8e19e77e49f0aba59552cf6b6c3a~mv2.png/v1/fill/w_740,h_357,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2d747e_5c4f8e19e77e49f0aba59552cf6b6c3a~mv2.png)

## Customer 360

### Auth0 notifications for new signups {#signup}

Like many other companies, we chose [Auth0](https://auth0.com/) as the authentication and authorization platform for our cloud offering. With our powerful [Ingestion API](/ingest-api), we can easily route all Auth0 new user signup events to Timeplus with webhook, then build real-time slack notifications to one private channels for Product Manager to engage with new users at real-time.

### HubSpot custom dashboards/alerts {#hubspot}

We use [HubSpot](https://hubspot.com/) as our CRM system. We have built sink connectors for both [AirByte](https://github.com/airbytehq/airbyte/pull/21226) and [Meltano](https://github.com/timeplus-io/target-timeplus) Batch jobs are configured to use the HubSpot source connector to send data to Timeplus workspace. This kind of basic customer information can be used to build custom dashboards, alerts and lookups to enrich other data.

### Jitsu clickstream analysis

We use the open source [Jitsu](https://jitsu.com/) platform to collect event data from every source - web, email, chatbot, CRM - into our choice of data stack: Timeplus. The free version of Jitsu Cloud allows you to send events out via a webhook. With our powerful [Ingestion API](/ingest-api), those page view data arrive in Timeplus workspace in real-time and help us to understand the usage pattern, from past 0.6 second to past 6 months.

### Real-time Twitter marketing {#twitter}

Twitter(X) is all about what is happening and what people are talking about right now. We partner with [datapm](https://datapm.io/) and published a [blog](https://www.timeplus.com/post/real-time-twitter-marketing) to share how Timeplus and DataPM can help you develop a real-time Twitter marketing app within a few minutes, without a single line of code. This makes it super easy to create real-time social listening apps to understand how customers are talking about your company or products, and plan your next social marketing campaign with trending hot topics.

![Twitter screenshot](https://static.wixstatic.com/media/b32125_9cc9aa162b174834a4b7994f69eb33ca~mv2.png/v1/fill/w_1480,h_664,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_9cc9aa162b174834a4b7994f69eb33ca~mv2.png)

## Misc

### Wildfire monitoring and alerting

We partnered with [Crul](https://www.crul.com/) to analyze wildfire website data and send to Timeplus with customized monitoring and alerting.

[Read case study](https://www.timeplus.com/post/integrating-timeplus-crul)

![Wildfire screenshot](https://static.wixstatic.com/media/b32125_b655043ec56c4fac920e3697bfc1049b~mv2.png/v1/fill/w_1480,h_902,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_b655043ec56c4fac920e3697bfc1049b~mv2.png)

### A data-driven parent{#baby}

One passionate Timeplus user shared how to use Timeplus to analyze baby names from data provided by [Data.gov](https://www.kaggle.com/datasets/kaggle/us-baby-names).

> Now that my wife has some great name suggestions at her fingertips (in real-time, I gave her a dashboard and I'm sending a Kafka stream to her phone for extra annoyance), she'll be able to make an informed decision.

![Baby names](/img/babynames.png)
