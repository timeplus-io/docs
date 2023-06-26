# Load streaming data from Apache Kafka

As of today, Apache Kafka is the primary data source (and sink) for Timeplus. With our strong partnership with Confluent, you can load your real-time data from Confluent Cloud, Confluent Platform, or Apache Kafka into the Timeplus streaming engine. You can also create [external streams](working-with-streams#external_stream) to analyze data in Confluent/Kafka/Redpanda without moving data.

## Confluent Cloud

1. From the left side navigation menu, click **Sources**. Then click **Apache Kafka** and confirm you have the necessary permissions. 
2. Specify a name for this data source, and provide an optional readable description.
2. Choose Confluent Cloud for the deployment type of the Kafka.
2. Specify the broker(s) URL, such as `pkc-abc12.us-west-2.aws.confluent.cloud:9092`
4. Specify the name of the Kafka topic. 
4. When you select Confluent Cloud, the **SASL Plain** is automatically selected. Type in the API Key and Secret Key for your cluster.
4. For Data Format, we currently support JSON, AVRO and Text format. If the data in the Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text format, so that the entire JSON document will be saved as a string, and you can apply JSON related functions to extract value, even the schema is changed. 
4. If you choose AVRO, there is an option for 'Auto Extraction'. By default it's turned off, meaning the entire message will be saved as a string. If you turn it on, then the top level attribute in the AVRO message will be put into different columns. This would be more convenient for you to query, but won't support schema evolution.  When AVRO is selected, you also need to specify the address, API key, and secret key for the schema registry. 
5. By default, the source can create a new stream in Timeplus. Please specify the new stream name. Alternatively, you can disable the stream creation and choose an existing stream from the list.
7. Click **Next** to preview the streaming data from the specified Kafka source and choose a column as the event time. If you don't specify an event time column, we will use the ingestion time as the event time.
8. You can review your configuration again. Once you click **Finish**, your streaming data will be available in the new stream immediately. 

## Custom Kafka Deployment

Similar steps as loading data from Confluent Cloud. You may not need to specify the `SASL Plain` as the authentication method. Please make sure Timeplus can reach out to your Kafka broker(s). You can use tools like [ngrok](https://ngrok.com) to securely expose your local Kafka broker(s) to the internet, so that Timeplus Cloud can connect to it. Check [this blog](https://www.timeplus.com/post/timeplus-cloud-with-ngrok) for more details.

:::info

If you maintain an IP whitelist, you'll need to whitelist our static IP:

`44.232.236.191` for us.timeplus.cloud

:::

## Notes for Kafka source

Please note:

1. Currently we support JSON and AVRO formats for the messages in Kafka topics
2. The topic level JSON attributes will be converted to stream columns. For nested attributes, the element will be saved as a `String` column and later you can query them with one of the [JSON functions](functions#processing-json).
3. Values in number or boolean types in the JSON message will be converted to corresponding types in the stream.
4. Datetime or timestamp will be saved as a String column. You can convert them back to DateTime via [to_time function](functions#to_time).
