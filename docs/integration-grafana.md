# Integration with Grafana

Grafana has long been one of the most popular tools for real-time monitoring and data visualization, helping organizations track metrics and analyze trends through a single, user-friendly interface. For self-hosted Timeplus Enterprise or Timeplus Proton, you can try [the Grafana plugin for Timeplus](https://grafana.com/grafana/plugins/timeplus-proton-datasource/). The source code is at https://github.com/timeplus-io/proton-grafana-source. This plugin was designed to leverage Grafana’s new [Grafana Live](https://grafana.com/docs/grafana/latest/setup-grafana/set-up-grafana-live/) capability, allowing users to keep their SQL query results up-to-date without the need to refresh their dashboards. Check out [here](https://github.com/timeplus-io/proton/tree/develop/examples/grafana) for sample setup.

<iframe width="560" height="315" src="https://www.youtube.com/embed/cBRl1k9qWZc?si=TzVpULg-B0b0T5GE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Key Use Cases for Timeplus Grafana Plugin {#usecases}
Our Timeplus Grafana Plugin provides a flexible, powerful way to enhance your dashboards with real-time insights. Here are a few ways our users are already benefiting:
* **Real-Time Operational Monitoring:** Track key metrics with high-frequency data, such as system load, application performance, or network traffic, to identify and resolve issues as they arise.
* **Customer Experience Insights:** Monitor live customer interactions, such as usage patterns, in-app behavior, or user activity across different regions, to improve responsiveness and overall service quality.
* **Advanced Analytics on Streaming Data:** Combine metrics from Grafana with Timeplus’s streaming SQL capabilities to perform complex analytics—filtering, aggregating, and transforming data in real time for deeper insights into business operations.

![Sample dashboard](/img/BitcoinDashboard.gif)

## How to Get Started with Timeplus Grafana Plugin {#getstarted}

Getting started with the latest version of the Timeplus Grafana Plugin is straightforward.

### Step 1: Set Up Grafana {#step1}

First, ensure that you have Grafana OSS or Grafana Enterprise installed.

	•	**For Mac users**, you can install Grafana by running:
`brew install grafana`

	•	**For Linux users**, you can use the following commands, adjusting the download URL to match the latest version if necessary:
`sudo yum install -y https://dl.grafana.com/enterprise/release/grafana-enterprise-11.3.0-1.x86_64.rpm`
For additional installation instructions, please refer to the [Grafana download page](https://grafana.com/grafana/download).

### Step 2: Install the Timeplus Plugin {#step2}

Next, download and install the Timeplus plugin in your Grafana deployment. For example, if you’re on Linux:

```shell
cd /var/lib/grafana
mkdir plugins
cd plugins
wget d.timeplus.com/grafana/timeplus-proton-datasource-2.0.0.zip
unzip timeplus-proton-datasource-2.0.0.zip
```

After installing the plugin, restart Grafana to enable it:
`sudo /bin/systemctl restart grafana-server.service`

### Step 3: Configure the Plugin in Grafana {#step3}

1.	**Login to Grafana’s web UI** and navigate to **Connections \-\> Data Sources**.
2.	**Locate the Timeplus Data Source** by scrolling or searching for “Timeplus.”
3.	**Configure the Connection Parameters**:
* For **Timeplus Enterprise**, create an admin account when you start Timeplus for the first time and use those credentials here.
* For **Timeplus Proton**, use the default username with no password.
4.	**Save and Test the Connection** by clicking the **Save & Test** button to confirm the plugin is connected successfully.

### Step 4: Create a Dashboard and Visualize Data {#step4}
1.	Follow the “Build a Dashboard” link to start a new dashboard, and **add a visualization**.
2.	Select the **Timeplus data source** you configured earlier.

Now, you can enter SQL queries to retrieve and visualize data from Timeplus directly in Grafana.

### Step 5: Example \- Monitoring Real-Time Bitcoin Price {#step5}

To showcase the power of real-time streaming with Grafana and Timeplus, let’s set up a feed for live Bitcoin pricing:

1.	**In Timeplus Enterprise**, open the **Data Collection Wizard** and choose **WebSocket** as the data source. If you haven’t tried Timeplus, please download the package at [https://www.timeplus.com/product](https://www.timeplus.com/product) .
2.	Use the following WebSocket settings:

	•	**WebSocket URL**: `wss://ws-feed.exchange.coinbase.com`

	•	**Open Message**: `{"type":"subscribe","channels":[{"name":"ticker","product_ids":["BTC-USD","ETC-USD","DAI-USD"]}]}`

	•	**Read as**: Text (not JSON)
3.	In the wizard, name the stream (e.g., coinbase), and follow the remaining default settings.
4.	Run the following SQL to retrieve raw data:
`SELECT * FROM coinbase`
You should see the live data in the raw string column. Now, let’s parse the JSON documents as multiple columns in a view.
5.	**Create a View** to parse the JSON data for easier analysis:
```sql
CREATE VIEW coinbase_parsed AS
SELECT _tp_time, raw:product_id AS product_id, cast(raw:price, 'float32') AS price, cast(raw:volume_24h, 'float64') AS volume_24h
FROM coinbase
```
6.	**Return to the Grafana UI** and run the following SQL query on the new view:
```sql
select _tp_time, price from coinbase_parsed where product_id='BTC-USD'
```

Grafana will now load the parsed data from Timeplus and display it as a line chart. To get a closer look at recent trends, adjust the time period from the default six hours to the last 1 minute.

With this setup, you can now use Grafana to monitor live prices and transaction data in the cryptocurrency market. Additionally, you can expand this dashboard by adding SQL-based alerts or logic to detect potential trading signals in real time.
