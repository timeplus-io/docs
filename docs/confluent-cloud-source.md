# Load streaming data from Confluent Cloud

We are pleased to partner with Confluent Cloud, allowing you to easily connect your streaming data. 

## Confluent Cloud Source

1. From the left side navigation menu, click **Data Ingestion**, then click the **Add Data** button in the top right corner.
2. In this pop-up, you’ll see the sources you can connect and other methods to add your data. Click **Apache Kafka**.
3. Enter the broker URL. You can also enable TLS or authentication, if needed. 
4. Enter the name of the Kafka topic, and specify the ‘read as’ data format. We currently support JSON, AVRO and Text formats.
    1. If the data in the Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text. This way, the entire JSON document will be saved as a string, and you can apply JSON related functions to extract value, even if the schema changes.
    2. If you choose AVRO, there is an option for 'Auto Extraction'. By default, this is toggled off, meaning the entire message will be saved as a string. If you toggle it on, then the top level attribute in the AVRO message will be put into different columns. This would be more convenient for you to query, but won't support schema evolution. When AVRO is selected, you also need to specify the address, API key, and secret key for the schema registry.
5. In the next “Preview” step, we will show you at least one event from your specified Apache Kafka source. 
6. By default, your new source will create a new stream in Timeplus. Give this new stream a name and verify the columns information (column name and data type). You can also set a column as the event time column. If you don’t, we will use the ingestion time as the event time. Alternatively, you can select an existing stream from the dropdown. 
7. After previewing your data, you can give the source a name and an optional description, and review the configuration. Once you click Finish, your streaming data will be available in the specified stream immediately. 
