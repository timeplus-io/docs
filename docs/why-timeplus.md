# Why Timeplus?

![overview](/img/overview.png)

Timeplus is a simple, powerful, cost-efficent stream processor.

## Simple{#simple}

Timeplus Proton is designed and implemented as a single binary, without any dependency, such as JVM or Kubernetes. This helps developers to easily download and setup the system, then manage and scale it easily. The Proton SQL is easy to learn and Timeplus UI is easy to use. Simplicity is in the key DNA of the product to enable more data teams to do stream processing in an easy and maintainable way.

## Powerful {#powerful}

Timeplus provides unique solutions to analyze both real-time data and historical data. As our company name implies, we are specialized to process real-time data. Each query in Timeplus can detect late events, and you can choose to drop or wait for them. Common streaming windows are supported such as tumble, hopping, session. You can join a stream with other streams, or enrich them with data from CSV, S3 or databases. 

Timeplus is more than a stream processor. It provides end to end analytic functionalities.  Timeplus supports additional data connections such as NATS and WebSocket.  Timeplus provides a web console where the user can interactively do data analysis in real-time.  Real time visualization and dashboards are provided.  The user can  send the analytic result to downstream data systems such as Apache Kafka, or trigger alerts so that the users can make real time actions based on the anomaly detected by the streaming analytic result.

See the [Showcases](showcases) page for a comprehensive list of our key use cases and capabilities.



## Cost Efficient {#cost_efficent}

Timeplus users don't need to setup and maintain multiple systems for Lambda-style data stack, since Proton unifies the stream processing and historical data analysis in a single system. This leads to significant cost saving.

As a stream processing, Timeplus is implemented in C++ language, leveraging vectorized data computing capability, and modern parallel processing technology Instruction/Multiple Data (SIMD). The infrastructure cost is much lower than traditional JVM-based stream processors, such as Apache Flink or ksqlDB.

Additional, since Timeplus Proton or the cloud service are strongly focused on simplicity and easy-to-use, engineers can spend less time getting started with Proton comparing to Apache Flink or ksqlDB. Also because Timeplus is easy to use, business owners don't need to hire many senior engineers to build the streaming applications.
