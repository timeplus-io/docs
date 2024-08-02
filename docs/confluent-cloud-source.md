# Load streaming data from Confluent Cloud

We are pleased to partner with [Confluent Cloud](https://www.confluent.io/confluent-cloud/?utm_campaign=tm.pmm_cd.2023_partner_cwc_timeplus_generic&utm_source=timeplus&utm_medium=partnerref), allowing you to easily connect your streaming data via [external streams](working-with-streams#external_stream) without moving data.

## Confluent Cloud Source

1. From the left side navigation menu, click **Data Collection**. Here, you’ll see ways to connect a source or external stream. Click **Confluent Cloud** (external stream).
2. Enter the bootstrap UR for your Confluent Cloud cluster, and set the Kafka API key and secret. Click **Next**.
3. Enter the name of the Kafka topic, and specify the ‘read as’ data format. We currently support JSON, Avro, Protobuf, Text and other formats.
    1. If the data in the Kafka topic is in JSON format, but the schema may change over time, we recommend you choose Text. This way, the entire JSON document will be saved as a string, and you can apply JSON related functions to extract value, even if the schema changes.
    2. If you choose Avro, there is an option for 'Auto Extraction'. By default, this is toggled off, meaning the entire message will be saved as a string. If you toggle it on, then the top level attribute in the AVRO message will be put into different columns. This would be more convenient for you to query, but won't support schema evolution. When Avro is selected, you also need to specify the address, API key, and secret key for the schema registry.
    3. If you choose Protobuf, please paste the entire Protobuf definition in, and specify the root message name.
4. In the next “Preview” step, we will show you at least one event from your specified Confluent Cloud source.
5. By default, your new source will create a new stream in Timeplus. Give this new stream a name and verify the columns information (column name and data type). You can also set a column as the event time column. If you don’t, we will use the ingestion time as the event time. Alternatively, you can select an existing stream from the dropdown.
6. After previewing your data, you can give the source a name and an optional description, and review the configuration. Once you click Finish, your streaming data will be available in the specified stream immediately.
