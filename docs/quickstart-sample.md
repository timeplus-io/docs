# Quickstart with built-in sample data

Timeplus provides a built-in data source to generate streaming data for some typical use cases.

## Create the data source

Login the Timeplus Cloud. Choose the workspace if you have access to more than 1 workspace. Go to the **SOURCES** page and click the **Try our sample dataset** button on the top-right corner. You will create the first [source](glossary#source).

![Try the sample dataset](/img/sampledata.png)

By default, the **iot_data** template will be used. You can choose a Source Name, e.g. `iot`. The **Source Description** is optional. Scroll down. Leave the **Create a stream with the name** enabled as default, and specify a [stream](glossary#stream) name, e.g. `iot`

![IOT sample dataset config](/img/sampledata_cfg.png)

Click **Next**. You will preview the sample data. Feel free to click **Next** button again. Optionally, you can click the image button near the TIME column and enable the **SET AS TIMESTAMP COLUMN** option. ([Why you need to set a timestamp column?](glossary#timestamp-column))

![IOT sample dataset config](/img/sampledata_ts.png)

Click **Next** button. You will review the source configuration. Click **Create the source button**

![IOT sample dataset confirm](/img/sampledata_confirm.png)

A message will be shown the source is created successfully.

![IOT sample dataset confirm](/img/sampledata_ok.png)

## Explore the streaming data {#step4}

Open the QUERY page. You will see the newly created stream under the query editor. Click on the name(e.g. `iot`)

![Click iot stream](/img/sampledata_click_iot.png)

The query will be generated automatically: `SELECT * FROM iot` Click the RUN QUERY button (or press Ctrl+Enter) to run the query.

![Run query](/img/sampledata_click_run_bn.png)

The streaming SQL willl keep showing latest results in the UI.

![Run query](/img/sampledata_click_query_live.png)

You can switch to the VISUALIZATION tab to view the streaming chart of the data.

![Run query](/img/sampledata_click_viz.png)