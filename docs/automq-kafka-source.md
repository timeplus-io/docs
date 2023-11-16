# Load streaming data from AutoMQ for Kafka

[AutoMQ for Kafka](https://docs.automq.com/docs/automq-s3kafka/YUzOwI7AgiNIgDk1GJAcu6Uanog) is a cloud-native version of Kafka redesigned for cloud environments. AutoMQ Kafka is [open source](https://github.com/AutoMQ/automq-for-kafka) and fully compatible with the Kafka protocol, fully leveraging cloud benefits. Compared to self-managed Apache Kafka, AutoMQ Kafka, with its cloud-native architecture, offers features like capacity auto-scaling, self-balancing of network traffic, moving partition in seconds. These features contribute to a significantly lower Total Cost of Ownership (TCO) for users.

This article will guide you on how to load data from AutoMQ Kafka into Timeplus using the Timeplus Console. Since AutoMQ Kafka is 100% compatible with the Apache Kafka protocol, you can also create an [external stream](external-stream) to analyze data in AutoMQ without moving it.

## Prepare AutoMQ Kafka and test data

To prepare your AutoMQ Kafka environment and test data, follow the AutoMQ [Quick Start](https://docs.automq.com/docs/automq-s3kafka/VKpxwOPvciZmjGkHk5hcTz43nde) guide to deploy your AutoMQ Kafka cluster. Ensure that Timeplus can directly connect to your AutoMQ Kafka server. You can use tools like [ngrok](https://ngrok.com/) to securely expose your local AutoMQ Kafka proxy on the internet, allowing Timeplus Cloud to connect to it. For more details, see the [blog](https://www.timeplus.com/post/timeplus-cloud-with-ngrok).

> Note
> if you maintain an IP whitelist, you'll need to include our static IP in it:
>
> 44.232.236.191 for us.timeplus.cloud


To quickly create a topic named `example_topic` in AutoMQ Kafka and write a test JSON data into it, follow these steps:

#### Create a topic

Use Kafka’s command-line tools to create a topic. Ensure you have access to the Kafka environment and the Kafka service is running. Here is the command to create a topic:

```shell
./kafka-topics.sh --create --topic example_topic --bootstrap-server 10.0.96.4:9092 --partitions 1 --replication-factor 1
```

> Note: Replace `topic` and `bootstrap-server` with your Kafka server address.

To check the result of the topic creation, use this command:

```shell
./kafka-topics.sh --describe example_topic --bootstrap-server 10.0.96.4:9092
```

#### Write test data

Use Kafka’s command-line tools or programming methods to write test data into example_topic. Here is an example using command-line tools:

```shell
echo '{"id": 1, "name": "test user", "timestamp": "2023-11-10T12:00:00", "status": "active"}' | sh kafka-console-producer.sh --broker-list 10.0.96.4:9092 --topic example_topic
```

> Note: Replace `topic` and `bootstrap-server` with your Kafka server address.

To view the recently written topic data, use the following command:

```shell
sh kafka-console-consumer.sh --bootstrap-server 10.0.96.4:9092 --topic example_topic --from-beginning
```

## Add the data source

1. In the left navigation menu, click **Data Ingestion**, then click the **Add Data** button in the upper right corner.
2. In this pop-up window, you will see the data sources you can connect to and other methods to add data. Since AutoMQ Kafka is fully compatible with Apache Kafka, you can directly click on Apache Kafka here.
3. Enter the broker URL. Since the default created AutoMQ Kafka does not enable TLS and authentication, turn off TLS and authentication here.
4. Enter the name of the AutoMQ Kafka topic and specify the 'read as' data format. We currently support JSON, AVRO, and text formats.
   1. If the data in the AutoMQ Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text. This way, the entire JSON document will be saved as a string, and you can apply functions related to JSON to extract values, even if the schema changes.
   2. If you choose AVRO, there is an “auto-extract” option. By default, this option is off, which means the entire message will be saved as a string. If you turn it on, the top-level attributes in the AVRO message will be put into different columns. This is more convenient for your queries but does not support schema evolution. When choosing AVRO, you also need to specify the address of the schema registry, API key, and secret.
5. In the next **Preview** step, we will show you at least one event from your specified AutoMQ Kafka data source.
6. By default, your new data source will automatically generate a new stream in Timeplus. You are invited to name this fresh stream and verify the column information, including the column names and data types. You also have the option to designate a column as the event time column. Should you choose not to do so, we will use the ingestion time as the event time. Alternatively, you may select an existing stream from the dropdown menu.
7. After previewing your data, you can assign a name and an optional description to the source, and review the configuration. Upon clicking **Finish**, the stream data will be immediately available in the specified stream.