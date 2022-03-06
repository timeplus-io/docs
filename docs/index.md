# Timeplus documentation

Timeplus is a fast and powerful real-time analytics platform.

![overview](/img/overview.png)


## Powerful analytic engine 
Timeplus has a high performance streaming SQL engine, leveraging vectorized data computing capability, streaming data is processed in super high efficiency with the modern parallel processing technology Instruction/Multiple Data (SIMD).

## High performance storage
Timeplus has designed a column based data format called Timeplus File Format (TFF), which supports blazing fast serialization and de-serialization, and since it is a column format, data can be vectorized for high performance analytic computation.  To fully leverage the capability of TFF, Timeplus also designed a stream storage called Timeplus Native Log, combined with TFF, Timeplus Native Log provides high performance data ingestion, it can quickly prune data on disk and filter out data which is not required for streaming processing.  Timeplus Native log also supports timestamp based seek and optimized time series data analytics scenarios.

## End to end analytic platform
Timeplus is not only a streaming SQL database, it provides end to end analytic functionalities.  Timeplus supports various data source connections such as Apache Kafka, Amazon S3 and Amazon Kinesis.  Timeplus provides a web client where the user can interactively do data analysis in real-time.  Real time visualization and dashboards are provided.  The user can also use API to interact with the data or send the analytic result to downstream data systems such as Apache Kafka, Databases , Data warehouse or Data lakes.  Alerts are provided in case the user wants to make real time actions based on the anomaly detected by the streaming analytic result.



Please check the [Demo Scenario](usecases) for a comprehensive list of our key capabilities.

