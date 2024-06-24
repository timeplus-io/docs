# Timeplus Enterprise v2 and Proton

This page summarizes changes for each major update in Timeplus Enterprise v2 and Timeplus Proton, including new features and important bug fixes.

## Jun 24, 2024

Timeplus Enterprise v2 is now available for cloud or self-hosted deployment. [See installation options](timeplus.com/product#selfhosted) for self-hosting.

### Timeplus Proton v1.5.11
  * When creating an external stream for Apache Kafka and running `select count() from table(stream)`, Timeplus Proton will retrieve the number of messages in the Kafka topic. If you set `data_format = "RawBLOB", one_message_per_row=false`, Proton will use the Kafka offset to get the message count. But if `one_message_per_row=true`, then Proton will read each message to split the rows. It won’t retrieve the result as fast as calculating the offset, but it will be more accurate.
  * When using an external stream to write data to Kafka, a new setting `kafka_max_message_size` is now available. When the external stream is created with `data_format='JSONEachRow',one_message_per_row=false`, each message in Kafka may contain multiple rows, with each row being a JSON document. This new setting `kafka_max_message_size` will control how much data will be put in a Kafka message and when to create a new Kafka message, ensuring each message won't exceed the `kafka_max_message_size` limit.
  * New function: [array_fold](functions_for_comp#array_fold), which is equivalent to the Array.reduce function in JavaScript, and is used to fold or reduce the elements in an array from left to right by applying a lambda-function to the array elements in a cumulative manner.
  * `array_max/min` functions now support datetime.

### Timeplus Enterprise v2.3.0
*Self-Hosted:*
  * Account setup flow for self-hosted deployment: create account and login screens.
  * License management: In Workspace Settings, see your existing licenses and entitlements. [Contact us](mailto:support@timeplus.com) to purchase a new license, then enter the license key and upload the license file in Workspace Settings.
  * Usage monitoring: Also in Workspace Settings, see your daily usage for ingested data and scanned external stream data.
  * Preview: Python User-Defined Functions (UDF). Create UDFs by leveraging Python libraries, such as pandas. [Contact us](mailto:support@timeplus.com) to try this feature.
