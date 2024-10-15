# Push data to Timeplus via Kafka Connect

Kafka Connect is a framework for connecting Kafka with external systems such as databases, key-value stores, search indexes, and file systems, using so-called *Connectors*.

Kafka Connectors are ready-to-use components, which can help data teams to import data from external systems into Kafka topics and export data from Kafka topics into external systems.

A Kafka Connect plugin for Timeplus is provided to continuously send data from Kafka topics to Timeplus Cloud or self-managed Timeplus deployment, no matter if you run Kafka in the cloud or on-prem.

Depending on how you run Kafka (with open-source Kafka, Confluent Platform, Confluent Cloud, or Redpanda), you can check the corresponding documentation to set up the Kafka Connect.

## Setup with Apache Kafka

For example, if you are using open-source Kafka, please check https://kafka.apache.org/documentation.html#connect.

As a reference, the step-by-step instructions to setup Kafka, Kafka Connect and the Kafka Connect plugin for Timeplus are:

1. Make sure you have Java installed, say openjdk 17.0.5.
2. Download the latest Kafka binary from https://kafka.apache.org/downloads, say kafka_2.13-3.3.1.tgz.
3. Unarchive the file and open a terminal window and change directory to this folder.
4. Start the ZooKeeper service via `bin/zookeeper-server-start.sh config/zookeeper.properties`
5. Open another terminal session and start the Kafka broker service via `bin/kafka-server-start.sh config/server.properties`.
6. Open another terminal session and create a topic `bin/kafka-topics.sh --create --topic my_topic --bootstrap-server localhost:9092`
7. Download the latest [kafka-connect-timeplus](https://github.com/timeplus-io/kafka-connect-timeplus/releases) JAR file and put it in a new folder, say `kakfa-connect-jars`.
8. Edit the `config/connect-standalone.properties` file and uncomment the last line and point it to your folder, e.g. `plugin.path=/Users/name/Dev/kakfa-connect-jars`
9. Create an API key in your Timeplus workspace and create a `timeplus-sink.properties` like this:

```properties
name: TimeplusSink
connector.class: com.timeplus.kafkaconnect.TimeplusSinkConnector
tasks.max: 1
topics: my_topic
timeplus.sink.address: https://us-west-2.timeplus.cloud
timeplus.sink.workspace: abc123
timeplus.sink.apikey: 60_char_API_Key
timeplus.sink.stream: data_from_kafka
timeplus.sink.createStream: true
timeplus.sink.dataFormat: raw
key.converter: org.apache.kafka.connect.storage.StringConverter
value.converter: org.apache.kafka.connect.storage.StringConverter
```

10. Start the Kafka Connect service with the Timeplus Kafka Connect plugin via `bin/connect-standalone.sh config/connect-standalone.properties config/timeplus-sink.properties` It will move data in `my_topic` to the `data_from_kakfa` stream in the remote Timeplus. (You can produce sample event via `kcat -P -b localhost:9092 -t my_topic` enter some lines and produce the data via Ctrl+D)

## Setup with Confluent Platform

1. Make sure you have Java installed, only 1.8 or 1.11 is supported.

2. Install Confluent Platform per official documentation. Download the zip file from https://github.com/timeplus-io/kafka-connect-timeplus/releases. Then install it with `confluent-hub install /path/to/timeplus-kafka-timeplus-connector-sink-version.zip`

3. Start the Confluent Platform via `confluent local services start`

4. Access the Control Center via http://localhost:9021/ and create a topic say `my_topic`

5. Choose **Connect** menu item and click the **Add connector** button. Choose the TimeplusSinkConnector tile, and input the settings as:

   1. Topics: my_topic

   2. Name: any name is okay

   3. Tasks max: 1

   4. Key and Value converter class: org.apache.kafka.connect.storage.StringConverter

   5. Scroll down to the Timeplus section and set the Timeplus server address, workspace, API Key, etc.

   6. Click Next, you can preview the JSON configuration as these:

      ```json
      {
        "name": "TimeplusSink1",
        "config": {
          "name": "TimeplusSink1",
          "connector.class": "com.timeplus.kafkaconnect.TimeplusSinkConnector",
          "tasks.max": "1",
          "key.converter": "org.apache.kafka.connect.storage.StringConverter",
          "value.converter": "org.apache.kafka.connect.storage.StringConverter",
          "topics": "my_topic",
          "timeplus.sink.address": "https://us-west-2.timeplus.cloud",
          "timeplus.sink.workspace": "abc123",
          "timeplus.sink.apikey": "60_char_API_Key",
          "timeplus.sink.createStream": "false",
          "timeplus.sink.stream": "data_from_kafka",
          "timeplus.sink.dataFormat": "raw"
        }
      }
      ```

6. Click **Launch** button, in a few seconds, you should see the connector is running.
7. You can open the Query Console in Timeplus and run a streaming query like `SELECT * FROM data_from_kafka`. Then create a message in Confluent Control Center (choose **Topics**, select the my_topic, choose **Messages** tab, and produce a sample message). Almost in the same time, the message will appear in the Timeplus Console.
