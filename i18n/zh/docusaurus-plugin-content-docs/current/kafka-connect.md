# 通过 Kafka Connect 将数据推送到 Timeplus

Kafka Connect是Kafka与数据库等外部系统连接的一个框架。 使用 *连接器* 来对接各种数据库、搜索引擎和文件系统。

Kafka 连接器是现成组件， 它可以帮助数据团队将外部系统的数据导入Kafka，并将Kafka的数据导入外部系统。

无论你在云端还是在本地运行 Kafka，Timeplus 的 Kafka Connect 插件都可以持续将来自 Kafka 主题的数据发送到 Timeplus 云或自管的 Timeplus 部署。

根据你运行 Kakfa 的方式（使用开源 Kafka、Confluent 平台、Confluent Cloud 或 Redpanda），你可以查看相应的文档来设置 Kafka Connect。

## 使用 Apache Kafka 进行设置

例如，如果你使用的是开源 Kafka，请查看 https://kafka.apache.org/documentation.html#connect。

作为参考，为 Timeplus 设置 Kafka、Kafka Connect 和 Kafka Connect 插件的分步说明是：

1. 确保你安装了 Java，比如 openjdk 17.0.5。
2. 从 https://kafka.apache.org/downloads 下载最新的 Kafka 二进制文件，比如 kafka_2.13-3.3.1.tgz。
3. 解压缩文件并打开终端窗口并将目录更改到此文件夹。
4. 通过 `bin/zookeeper-server-start.sh config/zookeeper.proper.proper` 启动ZooKeeper 服务
5. 打开另一个终端session 并通过 `bin/kafka-server-start.sh config/server.properties`启动 Kafka 代理服务。
6. 打开另一个终端session 然后创建一个主题 `bin/kafka-topics.sh--create--topic my_topic--bootstrap-server localhost: 9092`
7. 下载最新的 [kafka-connect-timeplus](https://github.com/timeplus-io/kafka-connect-timeplus/releases) JAR 文件然后把它放在一个新文件夹里，比如 `kakfa-connect-jars`。
8. 编辑 `config/connect-standalone.properties` 文件然后取消注释最后一行然后将其指向你的文件夹，例如 `plugin.path=/users/name/dev/kakfa-connect-jars`
9. 在你的 Timeplus 工作空间中创建 API 密钥然后像这样创建 `timeplus-sink.properties` ：

```properties
name: TimeplusSink
connector.class: com.timeplus.kafkaconnect.TimeplusSinkConnector
tasks.max: 1
topics: my_topic
timeplus.sink.address: https://us.timeplus.cloud
timeplus.sink.workspace: abc123
timeplus.sink.apikey: 60_char_API_Key
timeplus.sink.stream: data_from_kafka
timeplus.sink.createStream: true
timeplus.sink.dataFormat: raw
key.converter: org.apache.kafka.connect.storage.StringConverter
value.converter: org.apache.kafka.connect.storage.StringConverter
```

10. 通过 `bin/connect-standalone.sh config/connect-standalone.properties config/timeplus-sink.properties` 与 Timeplus Kafka Connect 插件一起启动Kafka Connect 服务。 它将把数据从`my_topic` 移动到远程Timeplus 中的 `data_from_kakfa` 流。 （你可以通过 `kcat -P -b localhost: 9092 -t my_topic` 输入一些行然后通过 Ctrl+D 生成数据）

## 使用 Confluent 平台进行设置

1. 确保你安装了 Java，只支持 1.8 或 1.11。

2. 根据官方文档安装 Confluent 平台。 从 https://github.com/timeplus-io/kafka-connect-timeplus/releases 下载压缩文件。 用 `confluent-hub install /path/to/timeplus-kafka-timeplus-connector-sink-version.zip`安装

3. 启动 Confluent Platform： `confluent local services start`

4. 通过 http://localhost:9021/ 访问控制中心，然后创建一个topic比如说 `my_topic`

5. 选择 **连接** 菜单项，然后单击 **添加连接器** 按钮。 选择 TimePlusSinkConnector 图块，然后将设置输入为：

   1. Topics: my_topic

   2. Name: any name is okay

   3. Tasks max: 1

   4. Key and Value converter class: org.apache.kafka.connect.storage.StringConverter

   5. Scroll down to the Timeplus section and set the Timeplus server address, workspace, API Key, etc.

   6. 单击 “下一步”，您可以预览 JSON 配置，如下所示：

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
          "timeplus.sink.address": "https://us.timeplus.cloud",
          "timeplus.sink.workspace": "abc123",
          "timeplus.sink.apikey": "60_char_API_Key",
          "timeplus.sink.createStream": "false",
          "timeplus.sink.stream": "data_from_kafka",
          "timeplus.sink.dataFormat": "raw"
        }
      }
      ```

6. 单击 **Launch** 按钮，几秒钟后，您应该会看到连接器正在运行。
7. 你可以在 Timeplus 中打开查询控制台然后运行像 `SELECT * FROM data_from_kafka`这样的流式查询。 然后在 Confluent 控制中心创建一条消息（选择 **Topics**，选择 my_topic，选择 **Messages** 选项卡，然后生成一条示例消息）。 几乎在同一时间，该消息将出现在Timeplus 控制台中。
