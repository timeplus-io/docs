# Introduction

Timeplus is a streaming-first data analytics platform. It provides powerful end-to-end capabilities to help teams process streaming and historical data quickly and intuitively, accessible for organizations of all sizes and industries. It enables data engineers and platform engineers to unlock streaming data value using SQL. The Timeplus console allows for easy connection to diverse data sources (such as Apache Kafka, Confluent Cloud, Redpanda, CSV file upload, and more), explore streaming patterns via SQL queries, send real-time insights and alerts to other systems or individuals, and create dashboards and visualizations.

![overview](/img/overview.png)

## High performance storage {#fast}

Timeplus has designed a column based data format called **Timeplus Data Format (TDF)**, which supports blazing fast serialization and deserialization. Since it is in column format, data can be vectorized for high performance analytic computation.  To fully leverage the capability of TDF, Timeplus also designed a stream storage called Timeplus **Native Log**. Combined with TDF, Timeplus Native Log provides high performance data ingestion, it can quickly prune data on disk and filter out data which is not required for streaming processing.  Timeplus Native log also supports timestamp based seek and optimized time series data analytics scenarios.

## Powerful analytic engine {#powerful}

Timeplus has a high performance streaming SQL engine, leveraging vectorized data computing capability, streaming data is processed in super high efficiency with the modern parallel processing technology Instruction/Multiple Data (SIMD). Timeplus provides unique solutions to analyze both real-time data and historical data. As our company name implies, we are specialized to process real-time data. Each query in Timeplus can detect late events, and you can choose to drop or wait for them. Common streaming windows are supported such as tumble, hopping, session. You can join a stream with other streams, or enrich them with data from CSV, S3 or databases. 

## End to end analytic platform {#intuitive}

Timeplus is not only a streaming SQL database, it provides end to end analytic functionalities.  Timeplus supports various data source connections such as Apache Kafka, Amazon S3 and Amazon Kinesis.  Timeplus provides a web client where the user can interactively do data analysis in real-time.  Real time visualization and dashboards are provided.  The user can also use API to interact with the data or send the analytic result to downstream data systems such as Apache Kafka, Databases , Data warehouse or Data lakes.  Alerts are provided so that the users can make real time actions based on the anomaly detected by the streaming analytic result.

Please check the [Showcases](showcases) page for a comprehensive list of our key use cases and capabilities.

