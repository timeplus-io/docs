# Load streaming data from AutoMQ

[AutoMQ](https://docs.automq.com/automq/what-is-automq/overview) is a cloud-native version of Kafka redesigned for cloud environments. AutoMQ is [open source](https://github.com/AutoMQ/automq) and fully compatible with the Kafka protocol, fully leveraging cloud benefits. Compared to self-managed Apache Kafka, AutoMQ, with its cloud-native architecture, offers features like capacity auto-scaling, self-balancing of network traffic, moving partition in seconds. These features contribute to a significantly lower Total Cost of Ownership (TCO) for users.

This article will guide you on how to load data from AutoMQ into Timeplus using the Timeplus Console. Since AutoMQ is 100% compatible with the Apache Kafka protocol, you can also create an [external stream](external-stream) to analyze data in AutoMQ without moving it.

To prepare your AutoMQ environment and test data, follow the AutoMQ [Quick Start](https://docs.automq.com/automq/getting-started) guide to deploy your AutoMQ Kafka cluster.

For self-hosting deployments, you can install AutoMQ and Timeplus Enterprise on Linux or Mac with the following commands:

```bash
curl https://download.automq.com/community_edition/standalone_deployment/install_run.sh | bash
curl https://install.timeplus.com | sh
```

For SaaS deployments, please ensure that Timeplus can directly connect to your AutoMQ server. You can use tools like [ngrok](https://ngrok.com/) to securely expose your local AutoMQ Kafka proxy on the internet, allowing Timeplus Cloud to connect to it. For more details, see the [blog](https://www.timeplus.com/post/timeplus-cloud-with-ngrok).

Access the web console of Timeplus Enterprise and go the "Data Ingestion" page. Click on the AutoMQ tile.

![AutoMQ in Data Ingestion Page](/img/automq_tile.png)

Set the broker(s) for AutoMQ. For example, for standalone deployment of AutoMQ on your local host, the hosts are `localhost:9094,localhost:9095`. Diable authentication and TLS if needed.
![AutoMQ in Data Ingestion Page](/img/automq_broker.png)

Click **Next**. Timeplus will connect to the server and list all topics. Choose one topic and set whether you want to read it as JSON or Text.
![AutoMQ in Data Ingestion Page](/img/automq_topic.png)

In the next step, confirm the schema of the Timeplus stream and specify a name. At the end of the wizard, an external stream will be created in Timeplus. You can query data or even write data to the AutoMQ topic with SQL.

See also:
* [Kafka External Stream](proton-kafka)
* [Tutorial: Streaming ETL from Kafka to ClickHouse](tutorial-sql-etl-kafka-to-ch)
