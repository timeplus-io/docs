# Quickstart with built-in sample data

Timeplus provides a built-in sample data source to generate streaming data for some typical use cases.

## Create the data source

1. Login to your Timeplus workspace, and let's start by creating a sample [source](glossary#source). In the left side navigation menu, click **Data Ingestion**, then click the **Add Data** button in the top right corner.

<img width="1460" alt="Creating a sample data source." src="https://github.com/timeplus-io/docs/assets/107260595/efea5e5a-a1ac-4166-9943-20a027f707da">

2. In this pop-up, click the **Sample Dataset** link.

<img width="1458" alt="sample-source-2" src="https://github.com/timeplus-io/docs/assets/107260595/2cde4ca7-91b4-4d1d-9e2f-95cbc29d2275">

3. Choose from one of 3 templates:
   1. **IoT**: Data for 3 devices
   2. **User logins**: Data for 2 users and 2 cities
   3. **DevOps**: Data for 3 hosts and 3 regions
      
<img width="1459" alt="sample-source-3" src="https://github.com/timeplus-io/docs/assets/107260595/a2a86bee-d5c0-4262-aff7-f32a4bb86829">

4. Preview your data and create a new [stream](glossary#stream) to load your data into. For the stream name, it can contain only letters, numbers, or underscores, and must start with a letter, for example `iot_data`. You can also give it an optional description.

<img width="1457" alt="sample-source-4" src="https://github.com/timeplus-io/docs/assets/107260595/11acbc4b-f000-4aa1-8966-b81e138763ea">

5. Finally, you can give this sample Source a name, such as `iot_data`. By default, we will populate the source name field with the same name as the stream you've just created. You can also review the source configuration, and click **Create the Source**. Your new sample data will sstart loading into the new stream immediately. 

<img width="1459" alt="sample-source-5" src="https://github.com/timeplus-io/docs/assets/107260595/2ef78f93-d2f8-44eb-be7d-86d3818328ed">
   
## Explore the Streaming Data

6. To check out the data in your newly created stream, you can either:
   1. Go to the Streams page, and click on the **Explore** icon, or

<img width="1460" alt="streams-list" src="https://github.com/timeplus-io/docs/assets/107260595/0d3f2b53-691b-4fd9-a9df-dba11fadb661">
  
   2. Go to the Query page, and click on the **name of the stream**, `iot_data` in the SQL helper below the SQL editor.

<img width="1460" alt="stream_name-in-list" src="https://github.com/timeplus-io/docs/assets/107260595/d174796d-2da1-4852-809a-a719145341b0">

7. We will generate a basic query for you: `SELECT * FROM iot_data`. You can also type your own query into the editor. Click the **Run Query** button (or press `Ctrl+Enter` on PC, `Cmd + Enter` on Mac) to run the query.

<img width="1460" alt="run-query" src="https://github.com/timeplus-io/docs/assets/107260595/03bd4a4e-0be8-4658-b9c8-4b0749f563aa">

8. The streaming results table will now appear below the editor, with new data continuously coming in (newest data at the bottom). To create charts, click on the **Visualization** tab. ([Learn more about Dashboards and Charts](viz)

<img width="1459" alt="streaming-table-sample" src="https://github.com/timeplus-io/docs/assets/107260595/ae627061-7dc5-4f5d-afa1-f6955895626e">

<img width="1460" alt="viz-sample-iot" src="https://github.com/timeplus-io/docs/assets/107260595/f8eb4d9d-08aa-4a7e-a86a-54f1b4ad3a1c">
