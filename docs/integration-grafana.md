# Integration with Grafana

Grafana has long been one of the most popular tools for real-time monitoring and data visualization, helping organizations track metrics and analyze trends through a single, user-friendly interface. For self-hosted Timeplus Enterprise or Timeplus Proton, you can try [the Grafana plugin for Timeplus](https://grafana.com/grafana/plugins/timeplus-proton-datasource/) with the source code at [GitHub](https://github.com/timeplus-io/proton-grafana-source). This plugin was designed to leverage Grafana’s new [Grafana Live](https://grafana.com/docs/grafana/latest/setup-grafana/set-up-grafana-live/) capability, allowing users to keep their SQL query results up-to-date without the need to refresh their dashboards. Check out [here](https://github.com/timeplus-io/proton/tree/develop/examples/grafana) for sample setup.

<iframe width="560" height="315" src="https://www.youtube.com/embed/cBRl1k9qWZc?si=TzVpULg-B0b0T5GE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## User Feedback
> "Using Timeplus and Grafana together has been awesome to work with! Timeplus simplifies what was a delicate manual transform process into an automatic SQL-based process. Grafana+Timeplus turns repetitive full queries into streaming incremental updates which makes the Grafana dashboard experience much more immersive, without all the constant full dashboard updates."    - Jason Patterson, Director of Network Architecture, RocNet Supply

## Key Use Cases for Timeplus Grafana Plugin {#usecases}
Our Timeplus Grafana Plugin provides a flexible, powerful way to enhance your dashboards with real-time insights. Here are a few ways our users are already benefiting:
* **Real-Time Operational Monitoring:** Track key metrics with high-frequency data, such as system load, application performance, or network traffic, to identify and resolve issues as they arise.
* **Customer Experience Insights:** Monitor live customer interactions, such as usage patterns, in-app behavior, or user activity across different regions, to improve responsiveness and overall service quality.
* **Advanced Analytics on Streaming Data:** Combine metrics from Grafana with Timeplus streaming SQL capabilities to perform complex analytics—filtering, aggregating, and transforming data in real time for deeper insights into business operations.

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
wget d.timeplus.com/grafana/timeplus-proton-datasource-2.1.3.zip
unzip timeplus-proton-datasource-2.1.3.zip
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

1. **In Timeplus Enterprise**, open the **Data Collection Wizard** and choose **Coinbase Exchange** as the data source. If you haven’t tried Timeplus, please download the package at [https://www.timeplus.com/product](https://www.timeplus.com/product) .
2. Use the default settings to load `BTC-USD` data feed.
3. After the source is created. Click on the first button to run an ad-hoc query to review the data from the newly created data stream. `SELECT * FROM coinbase` You should see the live data with multiple columns.
4. **Return to the Grafana UI** and run the following SQL query on the new view:
```sql
select _tp_time, price from coinbase
```

Grafana will now load the live data from Timeplus and display it as a line chart. To get a closer look at recent trends, adjust the time period from the default 6 hours to the last 5 minutes.

With this setup, you can now use Grafana to monitor live prices and transaction data in the cryptocurrency market. Additionally, you can expand this dashboard by adding SQL-based alerts or logic to detect potential trading signals in real time.

## Change Log {#changelog}

### 2.1.3
Released on 05-12-2025

* Fix the render issue for nullable columns

### 2.1.2
Released on 02-04-2025

* Fix ref id for data frames

### 2.1.1
Released on 01-22-2025

* Propagate the error message from the backend to the frontend
* Set batch size to 1000 and batch interval to 100ms for the streaming query

### 2.1.0
Released on 01-12-2025

* Support query variables and annotations
* Updated Grafana Go SDK

### 2.0.0
Released on 11-05-2024

* Updated Grafana Go SDK and Proton Go driver
* Unlisted from Grafana marketplace
