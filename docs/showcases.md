# Showcases

At Timeplus, we drink our own champagne and apply our technologies in many different use cases. Many our customers also contribute creative ways to build real-time solutions with Timeplus. This document lists known use cases in different categories. Hopefully this can inspire you to gain more insights from real-time data with low cost and effort.

If you have more interesting use cases to share, please join our [Community Slack](https://timeplus.com/slack).



## FinTech

### Real-time post-trade analytics {#posttrade}

Based on real-world customer scenarios for post-trade capital markets, we published a [blog](https://www.timeplus.com/post/unlocking-real-time-post-trade-analytics-with-streaming-sql) to showcase how to turn real-time market and transaction data into real-time insight.

![screenshot](https://static.wixstatic.com/media/2d747e_819ee33799004a11ac9f31c0bf452bb6~mv2.png/v1/fill/w_1480,h_652,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/2d747e_819ee33799004a11ac9f31c0bf452bb6~mv2.png)

You can access the live demo at https://demo.timeplus.cloud



### Real-time pricing

As one of the first case studies, we published a [blog](https://www.timeplus.com/post/real-time-pricing-made-easy) to share how leading fintech player Alpha Stream deployed Timeplus to quickly upgrade its real-time analytics capabilities.

![sql](https://static.wixstatic.com/media/b32125_b56eae05ae094ae8a83e2bc6ab62b96e~mv2.png/v1/fill/w_1480,h_512,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_b56eae05ae094ae8a83e2bc6ab62b96e~mv2.png)

## DevOps

### Real-time GitHub insights

We all love GitHub. But do you know what’s trending on Github right now? We built a real-time app with Timeplus API and GitHub API.

* [Blog](https://www.timeplus.com/post/github-real-time-app)
* Demo ([Timeplus Cloud](https://demo.timeplus.cloud), [Streamlit](https://timeplus.streamlit.app/github_dashboard))
* [Github repo](https://github.com/timeplus-io/streamlit_apps)

![screenshot](https://static.wixstatic.com/media/b32125_10d7aa79909c48549e45f09df54ca93d~mv2.png/v1/fill/w_1480,h_642,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_10d7aa79909c48549e45f09df54ca93d~mv2.png)



### Real-time o11y and usage based pricing

At Timeplus, we collect various logs, metrics and usage data and send them to our own Timeplus workspace for continuously infrastructure monitoring, alerts and integration with our choice of usage-based pricing vendor ([Paigo](https://paigo.tech/)).

Stay tuned for new blogs with more details.



## Security Compliance



### SOC2 compliance dashboards&alerts {#soc2}

Timeplus has achieved SOC2 Type 1 compliance since April 2023 ([blog](https://www.timeplus.com/post/soc2-type1)). We chose [Drata](https://drata.com/) to help us automates the compliance journey. We setup a process to call [Drata Open API](https://drata.com/product/api), and send the compliance findings to Timeplus as JSON document. Then setup dashboards and slack sink to help us monitor the compliance TODO items and build customized dashboards.



### Container vulnerability monitoring {#container}

Based on real-world customer scenarios, we published a [blog](https://www.timeplus.com/post/real-time-container-vulnerabilities-monitoring) to showcase how to build real-time monitoring systems for container vulnerabilities.

![screenshot](https://static.wixstatic.com/media/b32125_6e0d3f93addb4af3a0f3f06fc2b1ca8c~mv2.png/v1/fill/w_1389,h_700,al_c,q_90,enc_auto/b32125_6e0d3f93addb4af3a0f3f06fc2b1ca8c~mv2.png)

### Monitor Superblocks user activities

At Timeplus, we built a few internal tools with [Superblocks](http://superblocks.com/). To track how such internal tools are being used, we configured Superblocks to send audit logs and user activities to Confluent Cloud, then load them into Timeplus, then we built dashboards and alerts in our own platform to understand the usage or capture any potential issues.

![screenshot](https://static.wixstatic.com/media/b32125_f955e16bbdb84ca4866df92a37849243~mv2.png/v1/fill/w_1480,h_572,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_f955e16bbdb84ca4866df92a37849243~mv2.png)

Check the [blog](https://www.timeplus.com/post/monitor-superblocks-user-activities) for more details.



### Protect sensitive information in Slack {#slack}

Since many organizations rely on [Slack](https://slack.com/about) to connect people, tools, customers and partners in a digital HQ, we built a showcase app and published a [blog](https://www.timeplus.com/post/build-a-real-time-security-app-in-3-easy-steps) to demonstrate how to process real-time data and trigger real-time actions via the Timeplus platform.

![highlevel](https://static.wixstatic.com/media/b32125_8c9d89828b7e49af97282327f0385248~mv2.png/v1/fill/w_1393,h_450,al_c,q_90,enc_auto/b32125_8c9d89828b7e49af97282327f0385248~mv2.png)

## IoT

### Real-time fleet monitoring {#fleet}

Gain real-time visibility into fleet operations using only SQL. Based on real-world customer scenarios, we published a [blog](https://www.timeplus.com/post/case-study-real-time-fleet-monitoring-with-timeplus) to showcase how to monitor the entire truck fleet’s status in real-time to detect speeding and fatigued drivers, and to conduct geofencing related checks. 

![highlevel](https://static.wixstatic.com/media/2d747e_3cb2207a6b154e70960e7a8f9dd0d43e~mv2.png/v1/fill/w_1366,h_821,al_c,q_90,enc_auto/2d747e_3cb2207a6b154e70960e7a8f9dd0d43e~mv2.png)

You can access the live demo at https://demo.timeplus.cloud



## Customer 360

### Auth0 notifications for new signups {#signup}

Like many other startups, we chose [Auth0](https://auth0.com/) as the authentication and authorization platform for our cloud offering. With our powerful [Ingestion API](ingest-api), we can easily route all Auth0 new user signup events to Timeplus with webhook, then build real-time slack notifications to one private channels for Product Manager to engage with new users at real-time.



### HubSpot custom dashboards/alerts {#hubspot}

Like many other startups, we chose [HubSpot](https://hubspot.com/) as the CRM system. We have built sink connectors for both [AirByte](https://github.com/airbytehq/airbyte/pull/21226) and [Meltano](https://github.com/timeplus-io/target-timeplus) Batch jobs are configured to use the HubSpot source connector to send data to Timeplus workspace. Such customer basic information can be used to build custom dashboards, alerts and lookups to enrich other data.

### Jitsu clickstream analysis

We like the open-source [Jitsu](https://jitsu.com/) platform to collect event data from every source - web, email, chatbot, CRM - into our choice of data stack: Timeplus. The free version of Jitsu Cloud allows you to send events out via a webhook. With our powerful [Ingestion API](ingest-api), those page view data arrive in Timeplus workspace in real-time and help us to understand the usage pattern, from past 0.6 second to past 6 months.

### Real-time Twitter marketing {#twitter}

Twitter(X) is all about what is happening and what people are talking about right now. We partner with [datapm](https://datapm.io/) and published a [blog](https://www.timeplus.com/post/real-time-twitter-marketing)  to share how Timeplus and DataPM can help you develop a real-time Twitter marketing app within a few minutes, without a single line of code. This makes it super easy to create real-time social listening apps to understand how customers are talking about your company or products, and plan your next social marketing campaign with trending hot topics.

![screenshot](https://static.wixstatic.com/media/b32125_9cc9aa162b174834a4b7994f69eb33ca~mv2.png/v1/fill/w_1480,h_664,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_9cc9aa162b174834a4b7994f69eb33ca~mv2.png)





## Misc

### Wildfire monitoring and alerting

We partner with [Crul](https://www.crul.com/) and published a [blog](https://www.timeplus.com/post/integrating-timeplus-crul) to analyze wildfire website data and send to Timeplus with customized monitoring and alerting.

![sceenshot](https://static.wixstatic.com/media/b32125_b655043ec56c4fac920e3697bfc1049b~mv2.png/v1/fill/w_1480,h_902,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/b32125_b655043ec56c4fac920e3697bfc1049b~mv2.png)

### Data-driven parent{#baby}

One passionate Timeplus user shared how to use Timeplus to analyze baby names from data provided by [Data.gov](https://www.kaggle.com/datasets/kaggle/us-baby-names). 

> Now that my wife has some great name suggestions at her fingertips (in realtime, I gave her a dashboard and I'm sending a kafka stream to her phone for extra annoyance), she'll be able to make an informed decisions.

![Try the sample dataset](/img/babynames.png)