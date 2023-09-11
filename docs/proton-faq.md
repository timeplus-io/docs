# FAQ For Open Source Proton

WIP with Joel

## Category1

### How we work with Clickhouse

## Category2

### Comparing Proton with Timeplus Cloud

TODO

|                          | Open Source Proton                                           | Commercial Version                                           |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Deployment               | Single node Docker image                                     | Single node, cluster, k8s-based BYOC or fully-managed cloud service with SOC2 |
| Data Source              | Random Stream<br />External Stream to Apache Kafka, Confluent Cloud, Redpanda | Everything in Proton, and Apache Pulsar, Ably, CSV upload, streaming ingestion REST API |
| Data Destination  (Sink) | (Coming soon) External Stream to Apache Kafka, Confluent Cloud, Redpanda | Everything in Proton, and Apache Pulsar, Slack, Webhook, Timeplus stream |
| Support                  | Community Support                                            | Email/Slack/Zoom, within SLA                                 |

### Does Proton provide JDBC/ODBC driver?

Not yet. You can send the processed data to Kafka topics via External Stream, or use the proton-go-driver, or even benthos to send the data to other systems. Currently no JDBC or ODBC driver is supported and this is in our roadmap.

If you are on Timeplus Cloud, you can use the REST API or SDK to run queries or manage resources in Timeplus, via the API server (not part of Proton). 

Contact us if your use cases require JDBC/ODBC driver.
