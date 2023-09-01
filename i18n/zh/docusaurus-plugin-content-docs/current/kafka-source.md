# 从Apache Kafka加载流数据

当前Kafka是Timeplus最主要的实时数据来源(和下游)。 (最近引入了一个新功能来创建 [个外部流](working-with-streams#external_stream) 来分析Confluent/Kafka/Redpanda 中的数据而不移动数据)

## Apache Kafka Source

1. From the left side navigation menu, click **Data Ingestion**, then click the **Add Data** button in the top right corner.
2. In this pop-up, you’ll see the sources you can connect and other methods to add your data. Click **Apache Kafka**.
3. Enter the broker URL. You can also enable TLS or authentication, if needed.
4. Enter the name of the Kafka topic, and specify the ‘read as’ data format. We currently support JSON, AVRO and Text formats.
   1. If the data in the Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text. This way, the entire JSON document will be saved as a string, and you can apply JSON related functions to extract value, even if the schema changes.
   2. 如果您选择AVRO，则有一个“自动提取”选项。 By default, this is toggled off, meaning the entire message will be saved as a string. If you toggle it on, then the top level attribute in the AVRO message will be put into different columns. 这对您更方便查询，但不支持模式进化。 当选择AVRO时，您还需要指定schema注册表的地址、API密钥和密钥。
5. In the next “Preview” step, we will show you at least one event from your specified Apache Kafka source.
6. By default, your new source will create a new stream in Timeplus. Give this new stream a name and verify the columns information (column name and data type). You can also set a column as the event time column. If you don’t, we will use the ingestion time as the event time. Alternatively, you can select an existing stream from the dropdown.
7. After previewing your data, you can give the source a name and an optional description, and review the configuration. Once you click Finish, your streaming data will be available in the specified stream immediately.

## 自定义Kafka部署

Similar steps as above. 请确保 Timeplus 能够与您的 Kafka 服务器直接连接。 您可以使用像 [ngrok](https://ngrok.com) 这样的工具将你的本地 Kafka 代理安全地暴露在互联网上，这样 Timeplus Cloud 就可以连接到它。 Check out [this blog](https://www.timeplus.com/post/timeplus-cloud-with-ngrok) for more details.

:::info

如果您保持 IP 白名单，则需要将我们的静态 IP 列入白名单：

`52.83.159.13` 对于 cloud.timeplus.com.cn

:::

## Kafka源说明

请注意：

1. 目前，我们支持 Kafka 主题中的消息采用 JSON 和 AVRO 格式
2. 主题级别 JSON 属性将被转换为流列。 对于嵌套属性， 元素将被保存为 `String` 列，然后您可以用 [JSON functions](functions_for_json) 之一来查询它们。
3. JSON消息中的数值或布尔值类型将被转换为流中的对应类型。
4. 日期时间或时间戳将被保存为字符串列。 您可以通过 [to_time function](functions_for_type#to_time)将它们转换回 DateTime。
