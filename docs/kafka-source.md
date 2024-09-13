# Load streaming data from Apache Kafka

As of today, Apache Kafka is the primary data source (and sink) for Timeplus. You can also create [external streams](/working-with-streams#external_stream) to analyze data in Confluent/Kafka/Redpanda without moving data.

## Apache Kafka Source

1. From the left side navigation menu, click **Data Ingestion**. Here, you’ll see ways to connect a source or external stream. Click **Apache Kafka** (external stream).
2. Enter the broker URL. You can also enable TLS or authentication, if needed.
3. Enter the name of the Kafka topic, and specify the ‘read as’ data format. We currently support JSON, AVRO and Text formats.
   1. If the data in the Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text. This way, the entire JSON document will be saved as a string, and you can apply JSON related functions to extract value, even if the schema changes.
   2. If you choose AVRO, there is an option for 'Auto Extraction'. By default, this is toggled off, meaning the entire message will be saved as a string. If you toggle it on, then the top level attribute in the AVRO message will be put into different columns. This would be more convenient for you to query, but won't support schema evolution. When AVRO is selected, you also need to specify the address, API key, and secret key for the schema registry.
4. In the next “Preview” step, we will show you at least one event from your specified Apache Kafka source.
5. By default, your new source will create a new stream in Timeplus. Give this new stream a name and verify the columns information (column name and data type). You can also set a column as the event time column. If you don’t, we will use the ingestion time as the event time. Alternatively, you can select an existing stream from the dropdown.
6. After previewing your data, you can give the source a name and an optional description, and review the configuration. Once you click Finish, your streaming data will be available in the specified stream immediately.

## Custom Kafka Deployment

Similar steps as above. Please make sure Timeplus can reach out to your Kafka broker(s). You can use tools like [ngrok](https://ngrok.com) to securely expose your local Kafka broker(s) to the internet, so that Timeplus Cloud can connect to it. Check out [this blog](https://www.timeplus.com/post/timeplus-cloud-with-ngrok) for more details.

:::info

If you maintain an IP whitelist, you'll need to whitelist our static IP:

`44.232.236.191` for us-west-2.timeplus.cloud

:::

## Notes for Kafka source

Please note:

1. Currently we support JSON and AVRO formats for the messages in Kafka topics
2. The topic level JSON attributes will be converted to stream columns. For nested attributes, the element will be saved as a `String` column and later you can query them with one of the [JSON functions](/functions_for_json).
3. Values in number or boolean types in the JSON message will be converted to corresponding types in the stream.
4. Datetime or timestamp will be saved as a String column. You can convert them back to DateTime via [to_time function](/functions_for_type#to_time).
